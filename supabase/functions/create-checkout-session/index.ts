// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@16.7.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: cors });
  }

  try {
    const {
      deviceId,
      userId, // optional
      priceId, // optional override
      product = "premium_399", // default product tag
    } = await req.json();

    if (!deviceId && !userId) {
      return new Response("Missing deviceId or userId", {
        status: 400,
        headers: cors,
      });
    }

    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
    const STRIPE_PRICE_ID =
      priceId ?? Deno.env.get("STRIPE_PRICE_ID_PREMIUM_399")!;
    const PUBLIC_SITE_URL =
      Deno.env.get("PUBLIC_SITE_URL") ?? new URL(req.url).origin;

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2024-10-28.acacia", // use Stripe’s latest at build time
    });

    const successUrl = `${PUBLIC_SITE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${PUBLIC_SITE_URL}/payment-canceled`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        product,
        device_id: deviceId ?? "",
        user_id: userId ?? "",
      },
      // Collect email to help support lookup if needed
      customer_creation: "always",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("create-checkout-session error:", err?.message ?? err);
    return new Response(`Error: ${err?.message ?? "unknown"}`, {
      status: 500,
      headers: cors,
    });
  }
});
