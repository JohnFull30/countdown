// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@16.7.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.3";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")
    return new Response("Method Not Allowed", { status: 405, headers: cors });

  const rawBody = await req.text(); // IMPORTANT: raw body for signature verification
  const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
  const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2024-10-28.acacia",
  });

  let event: Stripe.Event;

  try {
    const sig = req.headers.get("stripe-signature")!;
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      sig,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(
      "Webhook signature verification failed:",
      err?.message ?? err
    );
    return new Response("Invalid signature", { status: 400, headers: cors });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const metadata = session.metadata ?? {};
      const product = (metadata.product ?? "premium_399").toString();
      const device_id = (metadata.device_id ?? "").toString() || null;
      const user_id = (metadata.user_id ?? "").toString() || null;

      const stripe_checkout_id = session.id;
      const stripe_payment_intent =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null);

      const supabase = createClient(supabaseUrl, serviceKey);

      // Upsert entitlement; unique on stripe_checkout_id to be idempotent
      const { error } = await supabase.from("entitlements").upsert(
        {
          product,
          status: "active",
          source: "stripe",
          stripe_checkout_id,
          stripe_payment_intent,
          device_id,
          user_id,
        },
        { onConflict: "stripe_checkout_id" }
      );
      if (error) {
        console.error("Upsert entitlement error:", error);
        // Don’t return non-2xx or Stripe will retry endlessly; log and 200 OK.
      }
    }

    // Optional: also handle disputes to revoke entitlements if needed
    // if (event.type === "charge.dispute.closed") { ... }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Webhook handler error:", err?.message ?? err);
    return new Response("ok", { headers: cors }); // acknowledge to avoid infinite retries
  }
});
