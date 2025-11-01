import React, { useEffect, useState } from "react";
import {
  Box,
  Switch,
  FormControlLabel,
  Typography,
  Button,
} from "@mui/material";
import { supabase } from "./supabaseClient";
import { getOrCreateDeviceId } from "./lib/deviceId";

export default function CountdownSetup() {
  const [premium, setPremium] = useState(false);
  const [devReset, setDevReset] = useState(
    localStorage.getItem("devResetToBasic") === "true"
  );

  // Dev toggle: Reset to Basic (doesn't touch DB; just overrides UI)
  const toggleDevReset = () => {
    const next = !devReset;
    setDevReset(next);
    localStorage.setItem("devResetToBasic", String(next));
  };

  useEffect(() => {
    let aborted = false;

    async function checkEntitlement() {
      try {
        const deviceId = getOrCreateDeviceId();
        // include auth header so function can resolve user (optional sign-in)
        const session = await supabase.auth.getSession();
        const authHeader = session?.data?.session?.access_token
          ? { Authorization: `Bearer ${session.data.session.access_token}` }
          : {};

        const resp = await fetch(
          `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/entitlement-status`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...authHeader,
            },
            body: JSON.stringify({ deviceId, product: "premium_399" }),
          }
        );

        const data = await resp.json();
        if (!aborted) setPremium(!!data.active);
      } catch (e) {
        console.error("entitlement check failed:", e);
        if (!aborted) setPremium(false);
      }
    }

    checkEntitlement();
    return () => {
      aborted = true;
    };
  }, []);

  const effectivePremium = premium && !devReset;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Countdown Setup
        </Typography>

        {/* Dev Controls */}
        <FormControlLabel
          control={<Switch checked={devReset} onChange={toggleDevReset} />}
          label="Reset to Basic (Dev)"
        />
      </Box>

      {effectivePremium ? (
        <Typography color="success.main">
          Premium features active on this device{" "}
          {/** and/or account if signed in */}.
        </Typography>
      ) : (
        <Typography color="text.secondary">
          Basic mode. Unlock Premium to access all features.
        </Typography>
      )}

      {/* ...rest of your setup UI... */}

      {!effectivePremium && (
        <Button
          variant="contained"
          sx={{ mt: 2, borderRadius: 3 }}
          href="/premium"
        >
          Unlock Premium
        </Button>
      )}
    </Box>
  );
}
