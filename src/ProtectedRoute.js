// src/ProtectedRoute.js
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Allow access if:
 * - duration is present, AND
 * - (gender is present) OR (revealId is present)
 *
 * Styling/UI unaffected — this only relaxes the guard for Secret Mode links.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const sp = new URLSearchParams(location.search);
  const duration = sp.get("duration");
  const gender = sp.get("gender");
  const revealId = sp.get("revealId");

  if (!duration || (!gender && !revealId)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
