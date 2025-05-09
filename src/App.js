import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CountdownSetup from './CountdownSetup';
import GenderCountdown from './GenderCountdown';
import ProtectedRoute from './ProtectedRoute';

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
    </Routes>
  );
}
