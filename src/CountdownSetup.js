// src/CountdownSetup.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import Flicking from "@egjs/react-flicking";
import "@egjs/react-flicking/dist/flicking.css";
import { supabase } from "./supabaseClient";

const GENDER_STYLES = {
  boy: {
    main: "primary.main",
    dark: "primary.dark",
    text: "#fff",
    hoverBg: "rgba(25,118,210,0.1)",
  },
  girl: {
    main: "#ff627e",
    dark: "#e55672",
    text: "#fff",
    hoverBg: "rgba(255,98,126,0.1)",
  },
};

const generateDurations = () => Array.from({ length: 30 }, (_, i) => i + 1);
const devMode = true;

function makeShortId(len = 6) {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let out = "";
  for (let i = 0; i < len; i++)
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export const CountdownSetup = () => {
  const [duration, setDuration] = useState(1);
  const [gender, setGender] = useState("boy");
  const [customGif, setCustomGif] = useState("");
  const [freeTries, setFreeTries] = useState(() => {
    const saved = parseInt(localStorage.getItem("freeTries") || "3", 10);
    return saved > 0 ? saved : 0;
  });
  const [fireworksEnabled, setFireworksEnabled] = useState(() => {
    const saved = localStorage.getItem("fireworksEnabled");
    return saved === null ? true : saved === "true";
  });
  const [secretMode, setSecretMode] = useState(() => {
    const saved = localStorage.getItem("secretMode");
    return saved === "true";
  });

  const [devOpen, setDevOpen] = useState(false);
  const flickRef = useRef(null);
  const navigate = useNavigate();

  const isPremiumUser = localStorage.getItem("forcePremium") === "true";

  // Dev: Reset back to Basic (remove simulated premium, restore defaults, clear Stripe flags)
  const resetToBasic = () => {
    try {
      // Premium state off
      localStorage.removeItem("forcePremium");
      // Free tries back to default (3)
      localStorage.setItem("freeTries", "3");
      // Selection defaults
      setDuration(1);
      setGender("boy");
      // Stripe flow flags
      sessionStorage.removeItem("startedCheckout");
      localStorage.removeItem("startedCheckout");
    } finally {
      // Hard reload to guarantee a pristine state
      window.location.reload();
    }
  };

  useEffect(() => {
    const flicking = flickRef.current;
    if (flicking) {
      flicking.moveTo(duration + 8, 600).then(() => {
        setTimeout(() => {
          flicking.moveTo(duration - 1, 600);
        }, 700);
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("fireworksEnabled", fireworksEnabled.toString());
  }, [fireworksEnabled]);

  useEffect(() => {
    localStorage.setItem("secretMode", secretMode.toString());
  }, [secretMode]);

  const handleSubmit = async () => {
    const usingCustomGif = !!customGif && !isPremiumUser;
    const usingFireworks = fireworksEnabled && !isPremiumUser;
    const usingPremium = usingCustomGif || usingFireworks;

    if (usingPremium) {
      if (freeTries > 0) {
        const newTries = freeTries - 1;
        setFreeTries(newTries);
        localStorage.setItem("freeTries", newTries.toString());
      } else {
        return navigate("/premium");
      }
    }

    const { error } = await supabase.from("countdowns").insert([
      {
        duration,
        gender,
        custom_gif_url: isPremiumUser ? customGif : "",
      },
    ]);
    if (error) console.error("Insert error:", error);

    if (!secretMode) {
      const query = new URLSearchParams({
        duration: duration.toString(),
        gender,
        customGifUrl: isPremiumUser ? customGif : "",
        fireworks: fireworksEnabled ? "true" : "false",
      }).toString();
      return navigate(`/countdown?${query}`);
    }

    try {
      const revealId = makeShortId(6);
      const { error: revealErr } = await supabase.from("reveals").upsert([
        {
          id: revealId,
          gender,
          duration_seconds: duration,
          fireworks: fireworksEnabled,
          custom_gif_url: isPremiumUser ? customGif : "",
        },
      ]);
      if (revealErr) throw revealErr;
      const query = new URLSearchParams({
        duration: duration.toString(),
        revealId,
        customGifUrl: isPremiumUser ? customGif : "",
        fireworks: fireworksEnabled ? "true" : "false",
      }).toString();
      navigate(`/countdown?${query}`);
    } catch (e) {
      console.error("Reveal save exception:", e);
      const query = new URLSearchParams({
        duration: duration.toString(),
        gender,
        customGifUrl: isPremiumUser ? customGif : "",
        fireworks: fireworksEnabled ? "true" : "false",
      }).toString();
      navigate(`/countdown?${query}`);
    }
  };

  const renderGenderButton = (key) => {
    const isSelected = gender === key;
    const { main, dark, text, hoverBg } = GENDER_STYLES[key];

    if (secretMode) {
      return (
        <Button
          key={key}
          variant="outlined"
          onClick={() => setGender(key)}
          size="medium"
          sx={{
            width: 100,
            borderColor: "grey.600",
            borderWidth: "2px",
            borderStyle: "solid",
            color: "black",
            "&:hover": { bgcolor: "rgba(0,0,0,0.06)" },
          }}
        >
          {key.toUpperCase()}
        </Button>
      );
    }

    return (
      <Button
        key={key}
        variant={isSelected ? "contained" : "outlined"}
        onClick={() => setGender(key)}
        size="medium"
        sx={{
          width: 100,
          ...(isSelected
            ? {
                bgcolor: main,
                color: text,
                "&:hover": { bgcolor: dark },
              }
            : {
                borderColor: main,
                borderWidth: "2px",
                borderStyle: "solid",
                color: main,
                "&:hover": { bgcolor: hoverBg },
              }),
        }}
      >
        {key.toUpperCase()}
      </Button>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "darkseagreen",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        🎉 Set Your Countdown
      </Typography>

      <Typography
        variant="caption"
        sx={{ fontSize: "0.8rem", color: "black", mb: 0.5 }}
      >
        Duration
      </Typography>

      <Box
        sx={{
          width: 100,
          height: 48,
          border: "1px solid",
          borderColor: "grey.500",
          borderRadius: 2,
          mb: 3,
          overflow: "hidden",
        }}
      >
        <Flicking
          ref={flickRef}
          horizontal={false}
          align="center"
          defaultIndex={duration - 1}
          bounce={20}
          deceleration={0.0075}
          onChanged={(e) => setDuration(parseInt(e.panel.element.innerText))}
          style={{ height: "100%", width: "100%" }}
        >
          {generateDurations().map((sec) => (
            <div
              key={sec}
              style={{
                height: 48,
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#000",
                userSelect: "none",
              }}
            >
              {sec}
            </div>
          ))}
        </Flicking>
      </Box>

      {/* Gender Buttons */}
      <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
        {["boy", "girl"].map(renderGenderButton)}
      </Box>

      {/* Switches same row under gender buttons */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 4,
          mb: 3,
        }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={fireworksEnabled}
              onChange={() => setFireworksEnabled(!fireworksEnabled)}
              color="primary"
            />
          }
          label="Fireworks"
          sx={{ color: "black" }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={secretMode}
              onChange={() => setSecretMode(!secretMode)}
              color="primary"
            />
          }
          label="Secret Mode"
          sx={{ color: "black" }}
        />
      </Box>

      {/* Custom GIF */}
      <Box sx={{ position: "relative", maxWidth: 320, mb: 3, width: "100%" }}>
        <TextField
          label="Custom GIF URL (premium)"
          value={customGif}
          onChange={(e) => setCustomGif(e.target.value)}
          variant="outlined"
          fullWidth
          sx={{
            borderRadius: 2,
            "& fieldset": { borderRadius: 2 },
            filter: isPremiumUser
              ? "none"
              : "blur(0.8px) contrast(80%) brightness(1.1)",
            transition: "filter 0.3s ease",
          }}
        />
        {!isPremiumUser && (
          <Button
            variant="outlined"
            size="small"
            sx={{
              position: "absolute",
              top: "50%",
              right: 8,
              transform: "translateY(-50%)",
            }}
            onClick={() => navigate("/premium")}
          >
            Unlock
          </Button>
        )}
      </Box>

      <Typography variant="body2" sx={{ mb: 1, color: "black" }}>
        {freeTries > 0
          ? `${freeTries} free tries left`
          : "Please unlock premium to continue"}
      </Typography>

      <Button
        variant="contained"
        size="large"
        fullWidth
        sx={{ maxWidth: 320 }}
        onClick={handleSubmit}
      >
        Start Countdown
      </Button>

      {/* Dev Panel unchanged */}
      {devMode && (
        <>
          <IconButton
            sx={{
              position: "fixed",
              bottom: 16,
              right: 16,
              bgcolor: "white",
              border: "1px solid gray",
              "&:hover": { bgcolor: "lightgray" },
            }}
            onClick={() => setDevOpen(!devOpen)}
          >
            <SettingsIcon />
          </IconButton>
          {devOpen && (
            <Box
              sx={{
                position: "fixed",
                bottom: 70,
                right: 16,
                p: 2,
                bgcolor: "white",
                border: "1px solid gray",
                borderRadius: 2,
                boxShadow: 3,
                width: 240,
              }}
            >
              <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
                🛠 Dev Panel
              </Typography>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                sx={{ mb: 1 }}
                onClick={resetToBasic}
              >
                Reset to Basic
              </Button>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                sx={{ mb: 1 }}
                onClick={() => {
                  setFreeTries(5);
                  localStorage.setItem("freeTries", "5");
                }}
              >
                Reset Free Tries
              </Button>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                sx={{ mb: 1 }}
                onClick={() => {
                  localStorage.setItem("forcePremium", "true");
                  window.location.reload();
                }}
              >
                Force Premium Mode
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default CountdownSetup;
