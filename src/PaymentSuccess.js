import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper, Stack, Chip, Divider } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {
  STRIPE_RETURN_EVENT_KEYS,
  trackStripeReturnEventOnce,
} from "./stripeReturnAnalytics";

const pageSx = {
  minHeight: "100vh",
  bgcolor: "darkseagreen",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  px: { xs: 2, sm: 3 },
  py: { xs: 4, sm: 6 },
};

const cardSx = {
  width: "100%",
  maxWidth: 520,
  p: { xs: 3, sm: 4 },
  borderRadius: 5,
  textAlign: "center",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.78))",
  boxShadow: "0 24px 70px rgba(30, 52, 36, 0.22)",
  border: "1px solid rgba(255,255,255,0.64)",
  backdropFilter: "blur(14px)",
};

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
    <Box sx={pageSx}>
      <Paper elevation={0} sx={cardSx}>
        <Stack spacing={3} alignItems="center">
          <Box
            sx={{
              width: 76,
              height: 76,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              color: "#2f6f46",
              bgcolor: "rgba(47, 111, 70, 0.1)",
            }}
          >
            <CheckCircleOutlineIcon sx={{ fontSize: 46 }} />
          </Box>

          <Stack spacing={1.25} alignItems="center">
            <Typography variant="h3" sx={{ fontWeight: 700, color: "#18221b" }}>
              You&apos;re all set.
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(24,34,27,0.78)" }}>
              Premium is unlocked for this browser, so you can start building a
              more personalized reveal countdown.
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(24,34,27,0.62)" }}>
              Your Stripe receipt should arrive by email shortly.
            </Typography>
          </Stack>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => navigate("/")}
            sx={{
              py: 1.35,
              borderRadius: 999,
              bgcolor: "#18221b",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { bgcolor: "#243226" },
            }}
          >
            Create your countdown
          </Button>

          <Divider sx={{ width: "100%", borderColor: "rgba(24,34,27,0.1)" }} />

          <Box sx={{ width: "100%", textAlign: "left" }}>
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#18221b" }}>
                  Support the dev
                </Typography>
                <Chip size="small" label="Coming soon" variant="outlined" />
              </Stack>
              <Typography variant="body2" sx={{ color: "rgba(24,34,27,0.68)" }}>
                Enjoying the app? A small tip helps support future reveal themes,
                polish, and new features.
              </Typography>
              <Button
                variant="outlined"
                disabled
                sx={{
                  alignSelf: { xs: "stretch", sm: "flex-start" },
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Tip the dev - coming soon
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
