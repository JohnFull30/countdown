import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import {
  STRIPE_RETURN_EVENT_KEYS,
  trackStripeReturnEventOnce,
} from "./stripeReturnAnalytics";

export default function PaymentCanceled() {
  const navigate = useNavigate();

  useEffect(() => {
    trackStripeReturnEventOnce(
      "payment_canceled",
      {
        source: "stripe_return_or_back_navigation",
      },
      STRIPE_RETURN_EVENT_KEYS.paymentCanceled
    );
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fffae0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 2,
      }}
    >
      <Typography variant="h3" gutterBottom color="warning.main">
        ⚠️ Payment Canceled
      </Typography>

      <Typography variant="body1" gutterBottom>
        Checkout was canceled before completion. No completed payment should be
        recorded, and premium has not been unlocked.
      </Typography>

      <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate("/")}>
        Back to Countdown Setup
      </Button>
    </Box>
  );
}
