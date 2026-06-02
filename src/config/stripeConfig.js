const rawMode = process.env.REACT_APP_STRIPE_MODE || "test";
const mode = rawMode === "live" ? "live" : "test";
const publishableKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY || "";
const testPriceId = process.env.REACT_APP_TEST_PRICE_ID || "";
const livePriceId = process.env.REACT_APP_LIVE_PRICE_ID || "";

const STRIPE_CONFIG = {
  mode,
  isTest: mode === "test",
  isLive: mode === "live",
  publishableKey,
  activePriceId: mode === "live" ? livePriceId : testPriceId,
};

if (process.env.NODE_ENV !== "production") {
  if (!publishableKey) {
    console.warn("Stripe checkout config: missing publishable key.");
  }

  if (STRIPE_CONFIG.isTest && publishableKey.startsWith("pk_live_")) {
    console.warn("Stripe checkout config: test mode is using a live publishable key.");
  }

  if (STRIPE_CONFIG.isLive && publishableKey.startsWith("pk_test_")) {
    console.warn("Stripe checkout config: live mode is using a test publishable key.");
  }

  if (STRIPE_CONFIG.isTest && !testPriceId) {
    console.warn("Stripe checkout config: test mode is missing an active test price.");
  }

  if (STRIPE_CONFIG.isLive && !livePriceId) {
    console.warn("Stripe checkout config: live mode is missing an active live price.");
  }
}

export { STRIPE_CONFIG };
export default STRIPE_CONFIG;
