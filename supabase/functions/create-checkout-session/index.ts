// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { stripe } from "../_shared/stripe.ts";

/**
 * POST /functions/v1/create-checkout-session
 * Body (JSON):
 * {
 *   "priceId"?: string,            // optional override (else uses STRIPE_PRICE_ID)
 *   "userId"?: string,             // optional; forwarded to Stripe metadata.user_id
 *   "quantity"?: number,           // optional; defaults to 1
 *   "successUrl"?: string,         // optional; overrides default success
 *   "cancelUrl"?: string           // optional; overrides default cancel/back button
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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      priceId,
      userId,
      quantity = 1,
      successUrl,
      cancelUrl,
    } = await req.json().catch(() => ({}) as any);

    // Fallbacks if not provided by client
    const FRONTEND_BASE =
      Deno.env.get("FRONTEND_BASE_URL") ?? "http://localhost:3000"; // dev default

    const defaultSuccess = `${FRONTEND_BASE}/payment-success`;
    const defaultCancel = `${FRONTEND_BASE}/payment-canceled`;

    console.log("we getting the cancelUrl we want????", cancelUrl, defaultCancel);
    const resolvedPrice = priceId ?? Deno.env.get("STRIPE_PRICE_ID");
    if (!resolvedPrice) {
      throw new Error("Missing STRIPE_PRICE_ID; set secret or pass priceId");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: resolvedPrice,
          quantity,
        },
      ],
      success_url: successUrl ?? defaultSuccess,
      cancel_url: cancelUrl ?? defaultCancel, // ← Stripe “Back” uses this
      allow_promotion_codes: false,
      metadata: userId ? { user_id: userId } : undefined,
      ui_mode: "hosted",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });
  } catch (err) {
    console.error("create-checkout-session error:", err);
    const message = err instanceof Error ? err.message : "Unable to create session";
    return new Response(JSON.stringify({ error: message }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 400,
    });
  }
});
