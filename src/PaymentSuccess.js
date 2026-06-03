import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import {
  STRIPE_RETURN_EVENT_KEYS,
  trackStripeReturnEventOnce,
} from "./stripeReturnAnalytics";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    trackStripeReturnEventOnce(
      "payment_success",
      {
        source: "stripe_return",
      },
      STRIPE_RETURN_EVENT_KEYS.paymentSuccess
    );

    try {
      localStorage.setItem("forcePremium", "true");
      localStorage.removeItem("startedCheckout");
      sessionStorage.removeItem("startedCheckout");
    } catch (error) {
      console.warn("Unable to persist premium unlock:", error);
    }
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#e8f5e9",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 2,
      }}
    >
      <Typography variant="h3" gutterBottom color="success.main">
        ✅ Payment Successful!
      </Typography>

      <Typography variant="body1" gutterBottom>
        Your premium features are now unlocked for this browser.
      </Typography>

      <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate("/")}>
        Go to Countdown Setup
      </Button>
    </Box>
  );
}
