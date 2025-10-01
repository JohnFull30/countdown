// supabase/functions/_shared/stripe.ts
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";

export const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
});

export function getBaseUrl() {
  return Deno.env.get("APP_BASE_URL") ?? "http://localhost:3000";
}