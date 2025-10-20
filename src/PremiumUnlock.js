import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

export default function PremiumUnlock() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleUnlock = async () => {
    try {
      const origin = window.location.origin;

      // Where Stripe should go after payment success and when user presses "Back"
      // Change these to whatever route you want.
      const successUrl = `${origin}/payment-success`;
      const cancelUrl =
        // Example: return to the page you started from (here, /premium)
        `${origin}/payment-canceled`;

      const response = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            successUrl,
            cancelUrl, // ← drives the Stripe "Back" link
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("Checkout create failed:", text);
        alert("Failed to start checkout");
        return;
      }

      const data = await response.json();
      if (data?.url) {
        try {
          sessionStorage.setItem("startedCheckout", "1");
          localStorage.setItem("startedCheckout", "1");
        } catch {}
        window.location.assign(data.url);
      } else {
        alert("Failed to start checkout");
      }
    } catch (err) {
      console.error("❌ Checkout error:", err);
      alert("Failed to start checkout");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "darkseagreen",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Floating, glassy back button (top-left) */}
      <Button
        aria-label="Back to setup"
        onClick={() => navigate("/")}
        startIcon={<ArrowBackIosNewIcon fontSize="small" />}
        sx={{
          position: "fixed",
          top: { xs: 8, sm: 16 },
          left: { xs: 8, sm: 16 },
          zIndex: 10,
          borderRadius: "999px",
          px: { xs: 1.25, sm: 2 },
          py: 1,
          minWidth: "auto",
          textTransform: "none",
          fontWeight: 600,
          boxShadow: 2,
          color: "text.primary",
          border: "1px solid rgba(0,0,0,0.08)",
          backgroundColor: "rgba(255,255,255,0.6)",
          backdropFilter: "saturate(180%) blur(12px)",
          "&:hover": {
            boxShadow: 3,
            backgroundColor: "rgba(255,255,255,0.8)",
          },
          "& .MuiButton-startIcon": {
            mr: { xs: 0, sm: 1 },
          },
        }}
      >
        <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
          Back
        </Box>
      </Button>

      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 3,
          boxShadow: 3,
          maxWidth: 420,
          width: "100%",
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          🎁 Make It Yours
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Unlock fireworks, custom themes, and advanced reveal options in the
          Countdown app.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          Premium Includes:
        </Typography>
        <List dense sx={{ textAlign: "left", mx: "auto", maxWidth: 360 }}>
          <ListItem>
            <ListItemText primary="✔ Upload your own reveal GIF/video" />
          </ListItem>
          <ListItem>
            <ListItemText primary="✔ Unlock custom background themes" />
          </ListItem>
          <ListItem>
            <ListItemText primary="✔ Add a personal message or baby's name (soon)" />
          </ListItem>
          <ListItem>
            <ListItemText primary="✔ Support independent creators" />
          </ListItem>
        </List>

        <Button
          variant="contained"
          fullWidth
          size="large"
          sx={{ mt: 3, borderRadius: 2, fontWeight: "bold" }}
          onClick={handleUnlock}
        >
          UNLOCK NOW — $3.99
        </Button>

        <Typography variant="caption" display="block" sx={{ mt: 2 }}>
          You’ll be redirected back after checkout. Use Stripe’s back/cancel to
          return.
        </Typography>
      </Box>
    </Box>
  );
}
