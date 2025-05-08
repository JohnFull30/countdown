// src/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { duration, gender } = location.state || {};

  // If someone hits /countdown without state (e.g. refresh),
  // send them back to setup
  if (!duration || !gender) {
    return <Navigate to="/" replace />;
  }

  return children;
}
