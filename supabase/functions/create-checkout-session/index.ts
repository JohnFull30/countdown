// supabase/functions/stripe-webhook/index.ts
// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { stripe } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const sig = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  let event: any;
  try {
    const body = await req.text();
    if (!sig || !webhookSecret) {
      return new Response("Missing webhook secret/signature", {
        status: 400,
        headers: corsHeaders,
      });
    }
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, {
      status: 400,
      headers: corsHeaders,
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any; // Stripe.Checkout.Session
    const userId = session.metadata?.user_id as string | undefined;

    if (userId) {
      const url = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      const res = await fetch(`${url}/rest/v1/purchases`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          user_id: userId,
          status: "paid",
          stripe_session_id: session.id,
          amount_total: session.amount_total ?? null,
          currency: session.currency ?? "usd",
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to insert purchase:", res.status, text);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});
