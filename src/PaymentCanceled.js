import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper, Stack } from "@mui/material";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
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
              color: "#6b5b2b",
              bgcolor: "rgba(107, 91, 43, 0.1)",
            }}
          >
            <CancelOutlinedIcon sx={{ fontSize: 44 }} />
          </Box>

          <Stack spacing={1.25} alignItems="center">
            <Typography variant="h3" sx={{ fontWeight: 700, color: "#18221b" }}>
              Checkout canceled.
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(24,34,27,0.78)" }}>
              No charge was made.
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(24,34,27,0.62)" }}>
              You can keep using the basic countdown, or try premium again when
              you&apos;re ready.
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ width: "100%" }}
          >
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => navigate("/premium")}
              sx={{
                py: 1.35,
                borderRadius: 999,
                bgcolor: "#18221b",
                textTransform: "none",
                fontWeight: 700,
                "&:hover": { bgcolor: "#243226" },
              }}
            >
              Try checkout again
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => navigate("/")}
              sx={{
                py: 1.35,
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 700,
                color: "#18221b",
                borderColor: "rgba(24,34,27,0.26)",
                "&:hover": {
                  borderColor: "rgba(24,34,27,0.44)",
                  bgcolor: "rgba(24,34,27,0.04)",
                },
              }}
            >
              Back to setup
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
