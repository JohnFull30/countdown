import React from "react";
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
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { supabase } from "./supabaseClient"; // assumes you have this
import { getOrCreateDeviceId } from "./lib/deviceId";

export default function PremiumUnlock() {
  const navigate = useNavigate();

  const handleUnlock = async () => {
    try {
      const deviceId = getOrCreateDeviceId();

      // If you use Supabase Auth, fetch user id; otherwise null
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id ?? null;

      const resp = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ deviceId, userId }),
        }
      );

      if (!resp.ok) {
        const text = await resp.text();
        console.error("Checkout create failed:", text);
        alert("Failed to start checkout.");
        return;
      }
      const data = await resp.json();
      if (data?.url) {
        window.location.assign(data.url);
      } else {
        alert("Unexpected response from server.");
      }
    } catch (e) {
      console.error(e);
      alert("Problem starting checkout.");
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 640, mx: "auto" }}>
      <Button
        startIcon={<ArrowBackIosNewIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Typography variant="h4" fontWeight={700} gutterBottom>
        Unlock Premium
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        One-time purchase. No subscriptions. Works immediately on this device.
        Sign in later to sync across devices.
      </Typography>

      <Divider sx={{ my: 2 }} />

      <List dense>
        <ListItem>
          <ListItemText primary="Custom videos & fireworks" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Secret mode and advanced options" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Priority improvements ahead" />
        </ListItem>
      </List>

      <Button
        variant="contained"
        size="large"
        onClick={handleUnlock}
        sx={{ mt: 2, borderRadius: 3 }}
      >
        Unlock for $3.99
      </Button>
    </Box>
  );
}
