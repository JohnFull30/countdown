// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { stripe } from "../_shared/stripe.ts";

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
    const auth = req.headers.get("authorization");
    if (!auth) {
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const {
      device_id,
      priceId,
      quantity = 1,
    } = await req.json().catch(() => ({}));
    const price = priceId || Deno.env.get("STRIPE_PRICE_ID");
    if (!price) {
      return new Response("Missing STRIPE_PRICE_ID", {
        status: 500,
        headers: corsHeaders,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price, quantity }],
      success_url: `${Deno.env.get("PUBLIC_SITE_URL")}/payment-success`,
      cancel_url: `${Deno.env.get("PUBLIC_SITE_URL")}/payment-canceled`,
      metadata: {
        device_id: device_id || "unknown",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    console.error("create-checkout-session error:", e);
    return new Response("Internal error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
