// deno-lint-ignore-file no-explicit-any
/**
 * Stripe Webhook → writes device-based entitlements to Supabase.
 * - Verifies Stripe signature
 * - Handles checkout.session.completed
 * - Upserts into public.entitlements by device_id
 *
 * Required ENV:
 *  - STRIPE_SECRET_KEY                (only if you also call Stripe APIs; not strictly needed for webhooks)
 *  - STRIPE_WEBHOOK_SECRET            (from Stripe Dashboard)
 *  - SUPABASE_URL
 *  - SUPABASE_SERVICE_ROLE_KEY        (service role for server-side writes with RLS on)
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Stripe SDK (apiVersion can be omitted for webhooks; leaving for consistency)
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
});

/**
 * Minimal CORS for safety (Stripe won’t preflight, but keeping consistent)
 */
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!signature || !webhookSecret) {
    console.error("Missing Stripe signature or STRIPE_WEBHOOK_SECRET");
    return new Response("Bad Request", { status: 400, headers: corsHeaders });
  }

  // Read raw body to verify signature
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error(
      "❌ Webhook signature verification failed:",
      err?.message || err
    );
    return new Response("Signature verification failed", {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Supabase (service role) client for server-side write
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return new Response("Server misconfigured", {
      status: 500,
      headers: corsHeaders,
    });
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    global: { headers: { "x-client-info": "stripe-webhook" } },
    auth: { persistSession: false },
  });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // We passed device_id from the client via create-checkout-session metadata
        const device_id = (session.metadata?.device_id ?? "").trim();
        const stripe_customer_id =
          typeof session.customer === "string"
            ? session.customer
            : (session.customer?.id ?? null);
        const session_id = session.id;

        if (!device_id) {
          console.warn(
            "checkout.session.completed without device_id in metadata; skipping write."
          );
          break;
        }

        // Upsert entitlement by device_id
        const { error } = await supabase.from("entitlements").upsert(
          {
            device_id,
            stripe_customer_id,
            stripe_checkout_session_id: session_id,
            active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "device_id" }
        );

        if (error) {
          console.error("Upsert entitlement error:", error);
          // Still 200 so Stripe won't retry forever; but do log for later inspection
        } else {
          console.log(`✅ Entitlement granted for device_id=${device_id}`);
        }
        break;
      }

      // Optional: handle refunds/voids to revoke entitlements
      case "charge.refunded":
      case "refund.created":
      case "payment_intent.canceled": {
        // If you want to deactivate on refund, you’ll need a way to map back to device_id
        // via session or payment_intent metadata. Skipping by default.
        console.log(`ℹ️ Received ${event.type}; no action configured.`);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    return new Response("Webhook Error", { status: 500, headers: corsHeaders });
  }
});
