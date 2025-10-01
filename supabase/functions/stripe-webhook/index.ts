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

    console.log("🔔 Webhook received");
    console.log("Signature header:", sig);
    console.log("First 500 chars of body:", body.slice(0, 500));
    console.log("Using webhook secret:", Deno.env.get("STRIPE_WEBHOOK_SECRET"));

    const event = stripe.webhooks.constructEvent(
      body,
      sig!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );

    console.log("✅ Verified event:", event.type);

    // Just acknowledge for now
    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("❌ Webhook error:");
    console.error(err); // full error object
    console.error(err.stack || ""); // stack trace if available
    return new Response("Webhook Error", { status: 400 });
  }
});
