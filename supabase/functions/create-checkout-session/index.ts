// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { stripe } from "../_shared/stripe.ts";

/**
 * POST /functions/v1/create-checkout-session
 * Body (JSON):
 * {
 *   "priceId"?: string,   // optional override (else uses STRIPE_PRICE_ID)
 *   "userId"?: string,    // optional; forwarded to Stripe metadata.user_id
 *   "quantity"?: number   // optional; defaults to 1
 * }
 *
 * Returns: { url: string }  // Stripe-hosted checkout URL
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    // Parse request safely; default to empty object
    const {
      priceId,
      userId,
      quantity = 1,
    } = await req.json().catch(() => ({}) as any);

    // Choose price: body override or env fallback
    const price = priceId ?? Deno.env.get("STRIPE_PRICE_ID");
    if (!price) {
      return new Response(
        "Missing `STRIPE_PRICE_ID` and no `priceId` provided.",
        { status: 400, headers: corsHeaders }
      );
    }

    // Build return URLs (HashRouter-safe for GitHub Pages)
    const origin =
      req.headers.get("origin") ??
      Deno.env.get("PUBLIC_SITE_URL") ??
      new URL(req.url).origin;

    const success_url = `${origin}/#/payment-success`;
    const cancel_url = `${origin}/#/payment-canceled`;

    // Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price, quantity }],
      success_url,
      cancel_url,
      // Include user metadata only if provided
      metadata: userId ? { user_id: String(userId) } : undefined,
      // allow_promotion_codes: true,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    console.error("create-checkout-session error:", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
