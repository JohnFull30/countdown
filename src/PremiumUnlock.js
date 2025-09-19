// src/PremiumUnlock.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, Divider } from "@mui/material";

export default function PremiumUnlock() {
  const navigate = useNavigate();

  const handleMockUnlock = () => {
    localStorage.setItem("premiumUser", "true");
    navigate("/");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "darkseagreen",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        px: 3,
        textAlign: "center",
      }}
    >
      <Typography variant="h3" gutterBottom>
        🎁 Make It Yours
      </Typography>

      <Typography variant="body1" sx={{ maxWidth: 500, mb: 2 }}>
        Want to use your own GIF or video background for the countdown? Unlock
        premium to make your gender reveal even more unforgettable.
      </Typography>

      <Divider
        sx={{ width: "100%", maxWidth: 360, borderColor: "#fff", my: 2 }}
      />

      <Typography variant="h6" sx={{ mb: 1 }}>
        💎 Premium Includes:
      </Typography>
      <Box sx={{ fontSize: "1rem", mb: 3 }}>
        <div>✔ Upload your own reveal GIF</div>
        <div>✔ Unlock custom background themes</div>
        <div>✔ Add a personal message or baby's name (coming soon!)</div>
        <div>✔ Support independent creators</div>
      </Box>

      <Button
        variant="contained"
        size="large"
        sx={{ px: 4, py: 1.5, fontSize: "1.1rem", mb: 2 }}
        onClick={handleMockUnlock}
      >
        Unlock Now – $3.99
      </Button>

      <Typography variant="caption" sx={{ color: "#ddd" }}>
        You’ll be redirected back to setup once unlocked.
      </Typography>
    </Box>
  );
}
