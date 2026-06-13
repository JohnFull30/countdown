import React, { useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper, Stack, Divider, Link } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {
  STRIPE_RETURN_EVENT_KEYS,
  trackStripeReturnEventOnce,
} from "./stripeReturnAnalytics";
import TipDeveloperButton from "./components/TipDeveloperButton";

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
      sessionStorage.removeItem("startedCheckout");
      localStorage.removeItem("startedCheckout");
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
              Premium is unlocked.
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(24,34,27,0.78)" }}>
              Your premium reveal features are ready in this browser.
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(24,34,27,0.62)" }}>
              Your Stripe receipt should arrive by email shortly.
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(24,34,27,0.62)" }}>
              Paid but still not seeing premium?{" "}
              <Link
                component={RouterLink}
                to="/support"
                sx={{
                  color: "#18221b",
                  fontWeight: 700,
                  textDecorationColor: "rgba(24,34,27,0.32)",
                  "&:hover": { textDecorationColor: "#18221b" },
                }}
              >
                Contact support
              </Link>
              .
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
            Back to Countdown Setup
          </Button>

          <Divider flexItem sx={{ borderColor: "rgba(24,34,27,0.12)" }} />

          <Stack
            spacing={1.35}
            alignItems="center"
            sx={{
              width: "100%",
              p: { xs: 1.5, sm: 2 },
              borderRadius: 3,
              bgcolor: "rgba(255,255,255,0.45)",
              border: "1px solid rgba(24,34,27,0.08)",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#18221b" }}>
              Want to support future tools?
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(24,34,27,0.72)", lineHeight: 1.55 }}
            >
              Your premium purchase already supports the app. An additional tip
              is completely optional and helps fund future improvements.
            </Typography>
            <TipDeveloperButton
              source="payment_success"
              variant="outlined"
              sx={{
                borderRadius: 999,
                borderColor: "rgba(24,34,27,0.24)",
                color: "#18221b",
                "&:hover": {
                  borderColor: "#18221b",
                  bgcolor: "rgba(24,34,27,0.04)",
                },
              }}
            />
            <Typography variant="caption" sx={{ color: "rgba(24,34,27,0.58)" }}>
              No additional features are required or unlocked by tipping.
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
