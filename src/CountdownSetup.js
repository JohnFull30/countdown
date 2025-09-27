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
import { supabase } from "./supabaseClient"; // ⬅️ import Supabase client

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

// 🔧 Toggle this flag to hide dev tools in production
const devMode = true;

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

  const [devOpen, setDevOpen] = useState(false); // ✅ floating panel toggle
  const flickRef = useRef(null);
  const navigate = useNavigate();
  const scrollDownTo = duration + 8;
  const scrollBackTo = duration - 1;

  const isPremiumUser = localStorage.getItem("forcePremium") === "true"; // simulate premium

  useEffect(() => {
    const flicking = flickRef.current;
    if (flicking) {
      flicking.moveTo(scrollDownTo, 600).then(() => {
        setTimeout(() => {
          flicking.moveTo(scrollBackTo, 600);
        }, 700);
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("fireworksEnabled", fireworksEnabled.toString());
  }, [fireworksEnabled]);

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

    // ✅ Save to Supabase
    const { data, error } = await supabase.from("countdowns").insert([
      {
        duration,
        gender,
        custom_gif_url: isPremiumUser ? customGif : "",
      },
    ]);

    if (error) {
      console.error("Insert error:", error);
    } else {
      console.log("Countdown saved:", data);
    }

    const query = new URLSearchParams({
      duration: duration.toString(),
      gender,
      customGifUrl: isPremiumUser ? customGif : "",
      fireworks: fireworksEnabled ? "true" : "false",
    }).toString();

    navigate(`/countdown?${query}`);
  };

  const renderGenderButton = (key) => {
    const isSelected = gender === key;
    const { main, dark, text, hoverBg } = GENDER_STYLES[key];

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
        position: "relative",
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
          bgcolor: "transparent",
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
          onChanged={(e) => {
            const val = parseInt(e.panel.element.innerText);
            setDuration(val);
          }}
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
                fontFamily: "Helvetica, sans-serif",
                color: "#000",
                userSelect: "none",
              }}
            >
              {sec}
            </div>
          ))}
        </Flicking>
      </Box>

      {/* Fireworks switch */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          {["boy", "girl"].map(renderGenderButton)}
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={fireworksEnabled}
              onChange={() => setFireworksEnabled(!fireworksEnabled)}
              color="primary"
            />
          }
          label="Fireworks"
          sx={{
            color: "black",
            ml: { xs: 0, sm: 2 },
            mt: { xs: 1, sm: 0 },
          }}
        />
      </Box>

      <Box sx={{ position: "relative", maxWidth: 320, mb: 3, width: "100%" }}>
        <TextField
          label="Custom GIF URL (premium)"
          value={customGif}
          onChange={(e) => setCustomGif(e.target.value)}
          variant="outlined"
          fullWidth
          sx={{
            borderRadius: 2,
            "& fieldset": {
              borderRadius: 2,
            },
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
              zIndex: 2,
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

      {/* ⚙️ Floating Dev Panel */}
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
                width: 220,
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
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => {
                  navigate(
                    `/countdown?${new URLSearchParams({
                      duration: "0",
                      gender,
                      customGifUrl: "",
                      fireworks: fireworksEnabled ? "true" : "false",
                    }).toString()}`
                  );
                }}
              >
                Skip to Reveal
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default CountdownSetup;
