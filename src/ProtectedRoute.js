// src/ProtectedRoute.js
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const duration = searchParams.get("duration");
  const gender = searchParams.get("gender");

  if (!duration || !gender) {
    return <Navigate to="/" replace />;
  }

  return children;
}
