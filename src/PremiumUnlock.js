import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

export default function PremiumUnlock() {
  const navigate = useNavigate();

  // If user lands here after leaving Stripe, redirect to /canceled
  useEffect(() => {
    if (document.referrer && document.referrer.includes("stripe.com")) {
      navigate("/canceled", { replace: true });
    }
  }, [navigate]);

  const handleUnlock = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // ✅ THIS was the bug: Authorization must be inside headers
            Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({}),
        }
      );
      const res = response;
      if (!res.ok) {
        // surface the server error to help debugging (401 meant missing/invalid auth header)
        const text = await res.text();
        console.error("Checkout create failed:", text);
        alert("Failed to start checkout");
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
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
      }}
    >
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
          Want to use your own GIF or video background for the countdown? Unlock
          premium to make your gender reveal unforgettable.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          Premium Includes:
        </Typography>
        <List dense sx={{ textAlign: "left", mx: "auto", maxWidth: 360 }}>
          <ListItem>
            <ListItemText primary="✔ Upload your own reveal GIF" />
          </ListItem>
          <ListItem>
            <ListItemText primary="✔ Unlock custom background themes" />
          </ListItem>
          <ListItem>
            <ListItemText primary="✔ Add a personal message or baby's name (coming soon!)" />
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
          You’ll be redirected back once unlocked.
        </Typography>
      </Box>
    </Box>
  );
}
