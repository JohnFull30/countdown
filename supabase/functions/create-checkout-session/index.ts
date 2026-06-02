// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { stripe } from "../_shared/stripe.ts";

/**
 * POST /functions/v1/create-checkout-session
 * Body (JSON):
 * {
 *   "mode"?: "test" | "live",      // optional; defaults to test
 *   "priceId"?: string,            // optional dev fallback
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
      mode,
      priceId,
      userId,
      quantity = 1,
      successUrl,
      cancelUrl,
    } = await req.json().catch(() => ({}) as any);

    const FRONTEND_BASE =
      Deno.env.get("FRONTEND_BASE_URL") ?? "http://localhost:3000";

    const defaultSuccess = `${FRONTEND_BASE}/payment-success`;
    const defaultCancel = `${FRONTEND_BASE}/payment-canceled`;

    const selectedMode = mode === "live" ? "live" : "test";
    const modeSpecificPrice =
      selectedMode === "live"
        ? Deno.env.get("STRIPE_LIVE_PRICE_ID_PREMIUM_399")
        : Deno.env.get("STRIPE_TEST_PRICE_ID_PREMIUM_399");
    const genericPrice = Deno.env.get("STRIPE_PRICE_ID_PREMIUM_399");
    const resolvedPrice = modeSpecificPrice ?? genericPrice ?? priceId;
    const priceSource = modeSpecificPrice
      ? "mode-specific-secret"
      : genericPrice
        ? "generic-secret"
        : priceId
          ? "request-body-fallback"
          : "missing";

    console.log("create-checkout-session selected mode:", selectedMode);
    console.log("create-checkout-session price source:", priceSource);
    console.log("create-checkout-session received successUrl:", Boolean(successUrl));
    console.log("create-checkout-session received cancelUrl:", Boolean(cancelUrl));

    if (!resolvedPrice) {
      return new Response(
        JSON.stringify({
          error:
            "Missing Stripe price ID. Set STRIPE_TEST_PRICE_ID_PREMIUM_399, STRIPE_LIVE_PRICE_ID_PREMIUM_399, STRIPE_PRICE_ID_PREMIUM_399, or pass priceId for development.",
        }),
        {
          headers: { "Content-Type": "application/json", ...corsHeaders },
          status: 400,
        }
      );
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
