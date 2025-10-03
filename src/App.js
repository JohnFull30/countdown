import React from "react";
import { Routes, Route } from "react-router-dom";
import CountdownSetup from "./CountdownSetup";
import GenderCountdown from "./GenderCountdown";
import PremiumUnlock from "./PremiumUnlock";
import ProtectedRoute from "./ProtectedRoute";
import PaymentSuccess from "./PaymentSuccess";
import PaymentCanceled from "./PaymentCanceled";
import PaymentFailed from "./PaymentFailed";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CountdownSetup />} />
      <Route
        path="/countdown"
        element={
          <ProtectedRoute>
            <GenderCountdown />
          </ProtectedRoute>
        }
      />
      <Route path="/premium" element={<PremiumUnlock />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-canceled" element={<PaymentCanceled />} />
      <Route path="/payment-failed" element={<PaymentFailed />} />
    </Routes>
  );
}
