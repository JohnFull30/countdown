# Stripe Supabase Checkout Workflow

## Centralized Checkout Config

`codex/backend` is the base branch for checkout and backend work. The final checkout fixes should be developed on branches created from `codex/backend`, such as `fix-checkout-merge`, so UI work from that branch is preserved.

React uses `src/config/stripeConfig.js` for frontend mode awareness. The helper reads only public/frontend-safe values:

- `REACT_APP_STRIPE_MODE`
- `REACT_APP_STRIPE_PUBLIC_KEY`
- `REACT_APP_TEST_PRICE_ID`
- `REACT_APP_LIVE_PRICE_ID`

`REACT_APP_STRIPE_MODE` defaults to `test`. When the mode is `live`, React sends `REACT_APP_LIVE_PRICE_ID`; otherwise it sends `REACT_APP_TEST_PRICE_ID`. The helper warns in development when public keys or active prices look mismatched, but it does not crash the app.

Supabase secrets are the backend source of truth for the final Stripe Checkout price:

- `STRIPE_SECRET_KEY`
- `STRIPE_TEST_PRICE_ID_PREMIUM_399`
- `STRIPE_LIVE_PRICE_ID_PREMIUM_399`
- `STRIPE_PRICE_ID_PREMIUM_399`
- `FRONTEND_BASE_URL`

Test keys require test prices. Live keys require live prices. The Stripe error "a similar object exists in live mode, but a test mode key was used" means a live `price_...` was used with a test `sk_test_...` key, or the reverse. Use Stripe `price_...` IDs for Checkout line items, not `prod_...` product IDs.

The safest switch order is:

1. Decide mode.
2. Update React env.
3. Update Supabase secrets.
4. Redeploy Edge Function.
5. Restart or rebuild frontend.
6. Test checkout.

Frontend `.env.local` shape:

```env
# Supabase
REACT_APP_SUPABASE_URL=https://ewqczgmfbwnofxzjradg.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLIC_KEY

# Stripe mode
REACT_APP_STRIPE_MODE=test

# Stripe keys
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_YOUR_TEST_PUBLIC_KEY

# Stripe price IDs
REACT_APP_TEST_PRICE_ID=price_YOUR_TEST_PRICE_ID
REACT_APP_LIVE_PRICE_ID=price_YOUR_LIVE_PRICE_ID
```

Never put `sk_test_...`, `sk_live_...`, Supabase service role keys, or database passwords in frontend files.

Local test mode Supabase secrets:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY
supabase secrets set STRIPE_TEST_PRICE_ID_PREMIUM_399=price_YOUR_TEST_PRICE_ID
supabase secrets set STRIPE_PRICE_ID_PREMIUM_399=price_YOUR_TEST_PRICE_ID
supabase secrets set FRONTEND_BASE_URL=http://localhost:3000
```

Live mode Supabase secrets:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
supabase secrets set STRIPE_LIVE_PRICE_ID_PREMIUM_399=price_YOUR_LIVE_PRICE_ID
supabase secrets set STRIPE_PRICE_ID_PREMIUM_399=price_YOUR_LIVE_PRICE_ID
supabase secrets set FRONTEND_BASE_URL=https://YOUR_PRODUCTION_URL
```

Deploy the checkout Edge Function:

```bash
supabase functions deploy create-checkout-session --no-verify-jwt
```

Restart and test locally:

```bash
# control + c
npm start
```

```bash
npm run build
```
