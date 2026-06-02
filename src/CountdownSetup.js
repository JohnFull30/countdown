// src/CountdownSetup.js
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Switch,
  FormControlLabel,
  Paper,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import Flicking from "@egjs/react-flicking";
import "@egjs/react-flicking/dist/flicking.css";
import { supabase } from "./supabaseClient";
import { normalizeRevealMediaUrl } from "./mediaUrl";
import PortfolioLogoLink from "./components/PortfolioLogoLink";

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

const BRAND_GREEN = "#6f9f72";
const BRAND_GREEN_DARK = "#5f8c62";
const BRAND_GREEN_SOFT = "rgba(111, 159, 114, 0.18)";
const PORTFOLIO_URL = "https://johnfull30.github.io/MyPortfolio/";

const PORTFOLIO_LOGO_LINK_WRAP_SX = {
  position: "absolute",
  top: { xs: 18, sm: 24 },
  left: "50%",
  transform: "translateX(-50%)",
  "--logo-tile-bg": "rgba(255, 255, 255, 0.28)",
  "--logo-tile-bg-hover": "rgba(255, 255, 255, 0.36)",
  "--logo-tile-highlight": "rgba(255, 255, 255, 0.5)",
  "--logo-tile-shadow": "rgba(15, 23, 42, 0.12)",
  "& .portfolio-logo-link .theme-logo": {
    width: 52,
    height: 44,
    transform: "translateY(1px)",
  },
};

const HOW_IT_WORKS = [
  {
    number: "1",
    title: "1. Choose the reveal",
    body: "Pick boy or girl and set your countdown length.",
  },
  {
    number: "2",
    title: "2. Start the moment",
    body: "Display the countdown on your phone, tablet, or screen.",
  },
  {
    number: "3",
    title: "3. Reveal with style",
    body: "Add fireworks or a custom reveal video with premium.",
  },
];

const PREMIUM_FEATURES = [
  "Custom reveal video or GIF link",
  "Fireworks for a bigger reveal moment",
  "Future themes and personal messages",
  "One-time unlock for this countdown experience",
];

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
  const [premiumNotice, setPremiumNotice] = useState("");
  const flickRef = useRef(null);
  const premiumRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isPremiumUser = localStorage.getItem("forcePremium") === "true";
  const freeTryMessage =
    freeTries > 0
      ? `You have ${freeTries} free premium reveal ${
          freeTries === 1 ? "try" : "tries"
        } left.`
      : "Premium is required to use custom reveal effects.";
  const premiumButtonLabel = isPremiumUser
    ? "Premium unlocked"
    : "Unlock Premium - $3.99";

  const focusPremiumCard = (message) => {
    setPremiumNotice(message);
    premiumRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

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

  useEffect(() => {
    if (location.pathname === "/premium") {
      setPremiumNotice("Premium is now handled here on the setup screen.");
      window.setTimeout(() => {
        premiumRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 250);
    }
  }, [location.pathname]);

  const handleUnlock = async () => {
    if (isPremiumUser) return;

    try {
      const origin = window.location.origin;
      const successUrl = `${origin}/payment-success`;
      const cancelUrl = `${origin}/payment-canceled`;

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
            cancelUrl,
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
      console.error("Checkout error:", err);
      alert("Failed to start checkout");
    }
  };

  const handleSubmit = async () => {
    const normalizedCustomGif = normalizeRevealMediaUrl(customGif);
    const usingCustomGif = !!customGif && !isPremiumUser;
    const usingFireworks = fireworksEnabled && !isPremiumUser;
    const usingPremium = usingCustomGif || usingFireworks;

    if (usingPremium) {
      if (freeTries > 0) {
        const newTries = freeTries - 1;
        setFreeTries(newTries);
        localStorage.setItem("freeTries", newTries.toString());
      } else {
        focusPremiumCard(
          "Premium is required to start with fireworks or a custom reveal link."
        );
        return;
      }
    }

    const { error } = await supabase.from("countdowns").insert([
      {
        duration,
        gender,
        custom_gif_url: isPremiumUser ? normalizedCustomGif : "",
      },
    ]);
    if (error) console.error("Insert error:", error);

    if (!secretMode) {
      const query = new URLSearchParams({
        duration: duration.toString(),
        gender,
        customGifUrl: isPremiumUser ? normalizedCustomGif : "",
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
          custom_gif_url: isPremiumUser ? normalizedCustomGif : "",
        },
      ]);
      if (revealErr) throw revealErr;
      const query = new URLSearchParams({
        duration: duration.toString(),
        revealId,
        customGifUrl: isPremiumUser ? normalizedCustomGif : "",
        fireworks: fireworksEnabled ? "true" : "false",
      }).toString();
      navigate(`/countdown?${query}`);
    } catch (e) {
      console.error("Reveal save exception:", e);
      const query = new URLSearchParams({
        duration: duration.toString(),
        gender,
        customGifUrl: isPremiumUser ? normalizedCustomGif : "",
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
            fontWeight: 800,
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
          fontWeight: 800,
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
                bgcolor: "#fff",
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
        background:
          "linear-gradient(145deg, #91bd91 0%, #b8d3aa 48%, #f7f1e8 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        px: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 12, sm: 14 },
        pb: { xs: 5, sm: 7, md: 9 },
        boxSizing: "border-box",
      }}
    >
      <Box sx={PORTFOLIO_LOGO_LINK_WRAP_SX}>
        <PortfolioLogoLink
          href={PORTFOLIO_URL}
          ariaLabel="Visit John Fuller's portfolio"
          target="_blank"
          rel="noopener noreferrer"
          title="Visit portfolio"
          logoMode="dark"
        />
      </Box>

      <Box sx={{ width: "100%", maxWidth: 960, mx: "auto" }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: 4, sm: 5 },
            overflow: "visible",
            bgcolor: "rgba(255,255,255,0.94)",
            boxShadow: "0 28px 70px rgba(40, 58, 38, 0.24)",
            border: "1px solid rgba(255,255,255,0.62)",
          }}
        >
          <Stack spacing={{ xs: 3, sm: 4 }} sx={{ p: { xs: 2.5, sm: 4.5 } }}>
            <Box>
              <Chip
                label="No setup stress. Just tap, count down, and reveal."
                sx={{
                  mb: 2,
                  bgcolor: BRAND_GREEN,
                  color: "#fff",
                  fontWeight: 800,
                  maxWidth: "100%",
                  height: "auto",
                  py: 0.75,
                  boxShadow: "0 10px 22px rgba(47, 111, 70, 0.22)",
                  "& .MuiChip-label": {
                    whiteSpace: "normal",
                    lineHeight: 1.35,
                  },
                }}
              />
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  color: "#162116",
                  fontWeight: 800,
                  letterSpacing: 0,
                  fontSize: { xs: "2rem", sm: "3rem" },
                  lineHeight: 1.06,
                  mb: 1.5,
                }}
              >
                Create Your Gender Reveal Countdown
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#3d493c",
                  fontSize: { xs: "1rem", sm: "1.15rem" },
                  lineHeight: 1.65,
                  maxWidth: 620,
                }}
              >
                Pick the timer, choose the reveal, and let the big moment play
                out beautifully.
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              aria-label="How it works"
            >
              {HOW_IT_WORKS.map((step) => (
                <Paper
                  key={step.title}
                  elevation={0}
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: 3,
                    bgcolor:
                      "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(250,247,240,0.96))",
                    border: `1px solid ${BRAND_GREEN_SOFT}`,
                    boxShadow: "0 10px 24px rgba(40, 58, 38, 0.08)",
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: BRAND_GREEN,
                        color: "#fff",
                        fontWeight: 900,
                        fontSize: "0.85rem",
                        boxShadow: "0 8px 16px rgba(47, 111, 70, 0.2)",
                      }}
                    >
                      {step.number}
                    </Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#162116", fontWeight: 800 }}
                    >
                      {step.title.replace(`${step.number}. `, "")}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{ color: "#536052", lineHeight: 1.55 }}
                  >
                    {step.body}
                  </Typography>
                </Paper>
              ))}
            </Stack>

            <Divider sx={{ borderColor: "rgba(34, 73, 44, 0.12)" }} />

            <Stack
              component="section"
              aria-labelledby="setup-controls-title"
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems="stretch"
            >
              <Paper
                elevation={0}
                sx={{
                  flex: "1 1 58%",
                  p: { xs: 2, sm: 3 },
                  borderRadius: 4,
                  bgcolor: "#fbfaf7",
                  border: "1px solid rgba(34, 73, 44, 0.12)",
                  boxShadow: "0 14px 34px rgba(40, 58, 38, 0.09)",
                }}
              >
                <Typography
                  id="setup-controls-title"
                  variant="h5"
                  sx={{ color: "#162116", fontWeight: 800, mb: 0.75 }}
                >
                  Set up your reveal
                </Typography>
                <Typography variant="body2" sx={{ color: "#536052", mb: 3 }}>
                  Choose the countdown length, reveal result, and effects before
                  you start.
                </Typography>

                <Stack spacing={2.5}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2.5}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    justifyContent="space-between"
                  >
                    <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "#263226", fontWeight: 800, mb: 1 }}
                      >
                        Duration in seconds
                      </Typography>

                      <Box
                        sx={{
                          width: 88,
                          height: 48,
                          mx: { xs: "auto", sm: 0 },
                          border: "1px solid",
                          borderColor: "rgba(38, 50, 38, 0.22)",
                          borderRadius: 2,
                          overflow: "hidden",
                          bgcolor: "#fff",
                          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.65)",
                        }}
                      >
                        <Flicking
                          ref={flickRef}
                          horizontal={false}
                          align="center"
                          defaultIndex={duration - 1}
                          bounce={20}
                          deceleration={0.0075}
                          onChanged={(e) =>
                            setDuration(parseInt(e.panel.element.innerText))
                          }
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
                                fontWeight: 700,
                                color: "#162116",
                                userSelect: "none",
                              }}
                            >
                              {sec}
                            </div>
                          ))}
                        </Flicking>
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "#263226", fontWeight: 800, mb: 1 }}
                      >
                        Reveal result
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: { xs: "center", sm: "flex-start" }, gap: 1.5 }}>
                        {["boy", "girl"].map(renderGenderButton)}
                      </Box>
                    </Box>
                  </Stack>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "flex-start", sm: "center" },
                      gap: { xs: 0.5, sm: 3 },
                      p: 1.5,
                      bgcolor: "#fff",
                      border: "1px solid rgba(34, 73, 44, 0.1)",
                      borderRadius: 3,
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
                      sx={{ color: "#263226", m: 0 }}
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
                      sx={{ color: "#263226", m: 0 }}
                    />
                  </Box>

                  <Box sx={{ position: "relative", width: "100%" }}>
                    <TextField
                      label="Custom reveal video or GIF link"
                      value={customGif}
                      onChange={(e) => setCustomGif(e.target.value)}
                      helperText={
                        isPremiumUser
                          ? "Paste a GIF, video, or supported media link for your reveal."
                          : "Premium lets you reveal with your own video or GIF."
                      }
                      variant="outlined"
                      fullWidth
                      sx={{
                        borderRadius: 2,
                        "& fieldset": { borderRadius: 2 },
                        "& .MuiFormHelperText-root": {
                          color: "#536052",
                          mx: 0,
                        },
                        filter: isPremiumUser
                          ? "none"
                          : "blur(0.5px) contrast(92%) brightness(1.04)",
                        transition: "filter 0.3s ease",
                      }}
                    />
                    {!isPremiumUser && (
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 14,
                          right: 8,
                          bgcolor: "rgba(255,255,255,0.92)",
                          borderColor: "rgba(34, 73, 44, 0.24)",
                          color: BRAND_GREEN,
                          fontWeight: 800,
                          "&:hover": {
                            borderColor: BRAND_GREEN,
                            bgcolor: "#fff",
                          },
                        }}
                        onClick={() =>
                          focusPremiumCard(
                            "Unlock premium to use your own reveal video or GIF."
                          )
                        }
                      >
                        Unlock
                      </Button>
                    )}
                  </Box>

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{
                      py: 1.45,
                      borderRadius: 3,
                      bgcolor: BRAND_GREEN,
                      fontWeight: 800,
                      textTransform: "none",
                      fontSize: "1rem",
                      boxShadow: "0 12px 24px rgba(47, 111, 70, 0.28)",
                      "&:hover": { bgcolor: BRAND_GREEN_DARK },
                    }}
                    onClick={handleSubmit}
                  >
                    Start Countdown
                  </Button>
                </Stack>
              </Paper>

              <Paper
                ref={premiumRef}
                elevation={0}
                sx={{
                  flex: "1 1 42%",
                  p: { xs: 2, sm: 3 },
                  borderRadius: 4,
                  bgcolor: "#fff7ef",
                  border: "1px solid rgba(179, 100, 43, 0.2)",
                  boxShadow: "0 14px 34px rgba(120, 72, 32, 0.1)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 3,
                }}
              >
                <Box>
                  <Chip
                    label={isPremiumUser ? "Premium active" : "Premium"}
                    sx={{
                      mb: 2,
                      bgcolor: "rgba(179, 100, 43, 0.12)",
                      color: "#8a4b1f",
                      fontWeight: 800,
                    }}
                  />
                  <Typography
                    variant="h5"
                    sx={{ color: "#2a2118", fontWeight: 800, mb: 1 }}
                  >
                    Premium reveal options
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#625448", lineHeight: 1.7, mb: 2 }}
                  >
                    Make the reveal feel less like a timer and more like an
                    event. Premium keeps the countdown simple while adding the
                    pieces that make the final moment feel personal.
                  </Typography>
                  <Stack spacing={1.1} sx={{ mb: 2 }}>
                    {PREMIUM_FEATURES.map((feature) => (
                      <Stack
                        key={feature}
                        direction="row"
                        spacing={1}
                        alignItems="flex-start"
                      >
                        <Box
                          sx={{
                            width: 18,
                            height: 18,
                            mt: "2px",
                            borderRadius: "50%",
                            bgcolor: "rgba(179, 100, 43, 0.14)",
                            color: "#8a4b1f",
                            fontSize: "0.75rem",
                            fontWeight: 900,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          ✓
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{ color: "#4d4035", lineHeight: 1.45 }}
                        >
                          {feature}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{ color: "#3b2f24", fontWeight: 800, mb: 1 }}
                  >
                    {freeTryMessage}
                  </Typography>
                  {premiumNotice && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#8a4b1f",
                        fontWeight: 800,
                        bgcolor: "rgba(179, 100, 43, 0.1)",
                        borderRadius: 2,
                        px: 1.25,
                        py: 1,
                      }}
                    >
                      {premiumNotice}
                    </Typography>
                  )}
                </Box>
                <Button
                  variant={isPremiumUser ? "outlined" : "contained"}
                  fullWidth
                  disabled={isPremiumUser}
                  onClick={handleUnlock}
                  sx={{
                    borderColor: isPremiumUser
                      ? "rgba(138, 75, 31, 0.28)"
                      : "transparent",
                    color: isPremiumUser ? "#8a4b1f" : "#fff",
                    bgcolor: isPremiumUser
                      ? "rgba(255,255,255,0.55)"
                      : "#8a4b1f",
                    fontWeight: 800,
                    textTransform: "none",
                    borderRadius: 3,
                    py: 1.2,
                    "&:hover": {
                      borderColor: isPremiumUser ? "#8a4b1f" : "transparent",
                      bgcolor: isPremiumUser ? "#fff" : "#733d18",
                    },
                  }}
                >
                  {premiumButtonLabel}
                </Button>
              </Paper>
            </Stack>
          </Stack>
        </Paper>
      </Box>

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
            aria-label="Open developer settings"
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
                Dev Panel
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
