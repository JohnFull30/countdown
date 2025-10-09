// supabase/functions/_shared/stripe.ts
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";

const secret = Deno.env.get("STRIPE_SECRET_KEY");
if (!secret) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

export const stripe = new Stripe(secret, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: "2023-10-16",
});
