import React, { useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import CountdownSetup from "./CountdownSetup";
import GenderCountdown from "./GenderCountdown";
import PremiumUnlock from "./PremiumUnlock";
import ProtectedRoute from "./ProtectedRoute";
import PaymentSuccess from "./PaymentSuccess";
import PaymentCanceled from "./PaymentCanceled";
import PaymentFailed from "./PaymentFailed";

/**
 * Global guard to catch Stripe "back" arrow returns.
 * If checkout was started and we're not on success, treat as cancel.
 */
function StripeReturnGuard() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("location change", location.pathname);
    const hasStarted =
      sessionStorage.getItem("startedCheckout") === "1" ||
      localStorage.getItem("startedCheckout") === "1";

    const path = location.pathname;
    const isSuccess = path === "/payment-success";
    const isCanceled = path === "/payment-canceled";
    const isFailed = path === "/payment-failed";

    if (hasStarted) {
      if (isSuccess) {
        sessionStorage.removeItem("startedCheckout");
        localStorage.removeItem("startedCheckout");
      } else if (!isCanceled && !isFailed) {
        sessionStorage.removeItem("startedCheckout");
        localStorage.removeItem("startedCheckout");
        navigate("/payment-canceled", { replace: true });
      }
    }

    // BFCache restore (Safari/iOS)
    const onPageShow = (e) => {
      console.log("pageshow", e);
      if (e.persisted) {
        const started =
          sessionStorage.getItem("startedCheckout") === "1" ||
          localStorage.getItem("startedCheckout") === "1";
        if (
          started &&
          path !== "/payment-success" &&
          path !== "/payment-canceled" &&
          path !== "/payment-failed"
        ) {
          sessionStorage.removeItem("startedCheckout");
          localStorage.removeItem("startedCheckout");
          navigate("/payment-canceled", { replace: true });
        }
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [location.pathname, navigate]);

  return null;
}

export default function App() {
  return (
    <>
      <StripeReturnGuard />
      <Routes>
        <Route path="/" element={<CountdownSetup />} />
        <Route path="/premium" element={<PremiumUnlock />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-canceled" element={<PaymentCanceled />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />
        <Route
          path="/countdown"
          element={
            <ProtectedRoute>
              <GenderCountdown />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
