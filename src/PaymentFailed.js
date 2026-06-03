import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { trackEvent } from "./analytics";

export default function PaymentFailed() {
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent("payment_failed", {
      source: "stripe_return",
    });
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#ffebee",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 2,
      }}
    >
      <Typography variant="h3" gutterBottom color="error.main">
        ❌ Payment Failed
      </Typography>

      <Typography variant="body1" gutterBottom>
        Something went wrong. Please try again or contact support.
      </Typography>

      <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate("/")}>
        Back to Countdown Setup
      </Button>
    </Box>
  );
}
