#!/bin/bash

# Usage: ./switch-stripe-mode.sh test|live

MODE=$1

if [ -z "$MODE" ]; then
  echo "❌ No mode specified. Use: ./switch-stripe-mode.sh test|live"
  exit 1
fi

if [ "$MODE" != "test" ] && [ "$MODE" != "live" ]; then
  echo "❌ Invalid mode: $MODE. Use either 'test' or 'live'."
  exit 1
fi

echo "🔄 Switching Stripe mode to: $MODE ..."

# Test mode values
const stripe = new Stripe(process.env.STRIPE_TEST_SECRET);TEST_PRICE_ID="price_1SD4r01IGu9HyH6dPH3EjmBK"
TEST_WEBHOOK_SECRET="whsec_O16SM3eTQui7tAX4tGH6SPQpiNLoMUea"

# Live mode values
const stripe = new Stripe(process.env.LIVE);LIVE_PRICE_ID="price_1SCT371IGu9HyH6dsvOgAC2P"
LIVE_WEBHOOK_SECRET="whsec_4QNtLKwDEnogbr45uov9GJiDG0Ebke0Y"

# Set the appropriate secrets based on the selected mode
if [ "$MODE" = "test" ]; then
  supabase secrets set \
    STRIPE_MODE=test \
    STRIPE_SECRET_KEY=$TEST_SECRET_KEY \
    STRIPE_PRICE_ID=$TEST_PRICE_ID \
    STRIPE_WEBHOOK_SECRET=$TEST_WEBHOOK_SECRET
elif [ "$MODE" = "live" ]; then
  supabase secrets set \
    STRIPE_MODE=live \
    STRIPE_SECRET_KEY=$LIVE_SECRET_KEY \
    STRIPE_PRICE_ID=$LIVE_PRICE_ID \
    STRIPE_WEBHOOK_SECRET=$LIVE_WEBHOOK_SECRET
fi

# Optional: redeploy both functions so they reload secrets immediately
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook

echo "✅ Stripe mode switched to $MODE and functions redeployed."