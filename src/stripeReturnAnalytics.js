import { trackEvent } from "./analytics";

export const STRIPE_RETURN_EVENT_KEYS = {
  paymentCanceled: "countdown.stripeReturn.paymentCanceledTracked",
  paymentSuccess: "countdown.stripeReturn.paymentSuccessTracked",
};

export function resetStripeReturnEventFlags() {
  try {
    Object.values(STRIPE_RETURN_EVENT_KEYS).forEach((key) => {
      sessionStorage.removeItem(key);
    });
  } catch (error) {
    console.warn("Unable to reset Stripe return analytics flags:", error);
  }
}

export async function trackStripeReturnEventOnce(eventName, metadata, storageKey) {
  try {
    if (sessionStorage.getItem(storageKey) === "1") {
      return;
    }
    sessionStorage.setItem(storageKey, "1");
  } catch (error) {
    console.warn("Stripe return analytics flag unavailable:", error);
  }

  await trackEvent(eventName, metadata);
}
