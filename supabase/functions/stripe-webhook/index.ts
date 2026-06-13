// supabase/functions/stripe-webhook/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
});

serve(async (req) => {
  try {
    const sig = req.headers.get("stripe-signature");
    const body = await req.text();

    console.log("Stripe webhook received");

    const event = stripe.webhooks.constructEvent(
      body,
      sig!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );

    console.log("Verified Stripe webhook event:", event.type);

    // Just acknowledge for now
    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("Stripe webhook verification failed:", err?.message || err);
    return new Response("Webhook Error", { status: 400 });
  }
});
