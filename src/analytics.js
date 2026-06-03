import { supabase } from "./supabaseClient";

const ANALYTICS_SESSION_KEY = "countdownAnalyticsSessionId";

function getSessionId() {
  try {
    let sessionId = localStorage.getItem(ANALYTICS_SESSION_KEY);
    if (!sessionId) {
      sessionId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(ANALYTICS_SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch (error) {
    console.warn("Analytics session unavailable:", error);
    return null;
  }
}

export async function trackEvent(eventName, metadata = {}) {
  try {
    const route =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "";

    const { error } = await supabase.from("analytics_events").insert([
      {
        event_name: eventName,
        session_id: getSessionId(),
        route,
        metadata,
      },
    ]);

    if (error) {
      console.warn("Analytics event failed:", eventName, error);
    }
  } catch (error) {
    console.warn("Analytics tracking error:", eventName, error);
  }
}
