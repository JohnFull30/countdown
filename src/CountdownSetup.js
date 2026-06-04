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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CelebrationIcon from "@mui/icons-material/Celebration";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MovieCreationOutlinedIcon from "@mui/icons-material/MovieCreationOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import RemoveIcon from "@mui/icons-material/Remove";
import SettingsIcon from "@mui/icons-material/Settings";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import { supabase } from "./supabaseClient";
import { trackEvent } from "./analytics";
import { resetStripeReturnEventFlags } from "./stripeReturnAnalytics";
import { normalizeRevealMediaUrl } from "./mediaUrl";
import PortfolioLogoLink from "./components/PortfolioLogoLink";
import STRIPE_CONFIG from "./config/stripeConfig";

const GENDER_STYLES = {
  boy: {
    main: "#2f80ed",
    dark: "#1f66c2",
    soft: "rgba(47, 128, 237, 0.1)",
    text: "#fff",
  },
  girl: {
    main: "#f43f7d",
    dark: "#d92f68",
    soft: "rgba(244, 63, 125, 0.1)",
    text: "#fff",
  },
};

const BRAND_GREEN = "#3e9a50";
const BRAND_GREEN_DARK = "#2f7d3e";
const BRAND_GREEN_SOFT = "rgba(62, 154, 80, 0.13)";
const CREAM = "#fffaf2";
const INK = "#141a20";
const MUTED = "#536052";
const PORTFOLIO_URL = "https://johnfull30.github.io/MyPortfolio/";

const PORTFOLIO_LOGO_LINK_WRAP_SX = {
  position: "absolute",
  top: { xs: 14, sm: 18 },
  left: "50%",
  transform: "translateX(-50%)",
  "--logo-tile-bg": "rgba(255, 255, 255, 0.32)",
  "--logo-tile-bg-hover": "rgba(255, 255, 255, 0.46)",
  "--logo-tile-highlight": "rgba(255, 255, 255, 0.58)",
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
    title: "Choose the reveal",
    body: "Pick boy or girl and set your countdown length.",
    Icon: TimerOutlinedIcon,
  },
  {
    number: "2",
    title: "Start the moment",
    body: "Display the countdown on your phone, tablet, or screen.",
    Icon: PhoneIphoneIcon,
  },
  {
    number: "3",
    title: "Reveal with style",
    body: "Add fireworks or a custom reveal video with premium.",
    Icon: CelebrationIcon,
  },
];

const PREMIUM_FEATURES = [
  {
    label: "Upload your own reveal video or GIF",
    Icon: MovieCreationOutlinedIcon,
    bg: "rgba(244, 63, 125, 0.13)",
    color: "#e3316e",
  },
  {
    label: "Add fireworks & celebration effects",
    Icon: AutoAwesomeIcon,
    bg: "rgba(47, 128, 237, 0.13)",
    color: "#246de0",
  },
  {
    label: "Unlock future reveal themes",
    Icon: PaletteOutlinedIcon,
    bg: "rgba(130, 83, 225, 0.13)",
    color: "#7a4bd8",
  },
  {
    label: "Add personal messages (coming soon)",
    Icon: FavoriteBorderIcon,
    bg: "rgba(217, 126, 28, 0.14)",
    color: "#ce7414",
  },
  {
    label: "One-time unlock. No subscriptions.",
    Icon: ShieldOutlinedIcon,
    bg: "rgba(62, 154, 80, 0.14)",
    color: BRAND_GREEN,
  },
];

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
  const [giphyDialogOpen, setGiphyDialogOpen] = useState(false);
  const [premiumNotice, setPremiumNotice] = useState("");
  const premiumRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isPremiumUser = localStorage.getItem("forcePremium") === "true";
  const freeTryMessage =
    freeTries === 1
      ? "You have 1 free premium reveal left before unlocking is required."
      : `You have ${freeTries} free premium reveals left before unlocking is required.`;
  const premiumButtonLabel = isPremiumUser
    ? "Premium Unlocked"
    : "Unlock Premium - $3.99";

  const focusPremiumCard = (message) => {
    setPremiumNotice(message);
    premiumRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const resetToBasic = () => {
    try {
      localStorage.removeItem("forcePremium");
      localStorage.setItem("freeTries", "3");
      setDuration(1);
      setGender("boy");
      sessionStorage.removeItem("startedCheckout");
      localStorage.removeItem("startedCheckout");
    } finally {
      window.location.reload();
    }
  };

  useEffect(() => {
    localStorage.setItem("fireworksEnabled", fireworksEnabled.toString());
  }, [fireworksEnabled]);

  useEffect(() => {
    localStorage.setItem("secretMode", secretMode.toString());
  }, [secretMode]);

  useEffect(() => {
    if (location.pathname === "/premium") {
      trackEvent("paywall_viewed", {
        source: "premium_route",
      });
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

    await trackEvent("checkout_started", {
      source: "setup_premium_button",
      price: "3.99",
      currency: "usd",
      duration,
      gender,
      fireworks_enabled: fireworksEnabled,
      has_custom_gif: Boolean(customGif),
      free_tries_remaining: freeTries,
      secret_mode: secretMode,
    });

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
            apikey: process.env.REACT_APP_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            successUrl,
            cancelUrl,
            mode: STRIPE_CONFIG.mode,
            priceId: STRIPE_CONFIG.activePriceId,
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
        resetStripeReturnEventFlags();
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
        await trackEvent("paywall_viewed", {
          source: "start_countdown_gate",
          reason: "free_tries_exhausted",
          duration,
          gender,
          fireworks_enabled: fireworksEnabled,
          has_custom_gif: Boolean(customGif),
          free_tries_remaining: freeTries,
          secret_mode: secretMode,
        });
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

  const adjustDuration = (amount) => {
    setDuration((current) => Math.min(30, Math.max(1, current + amount)));
  };

  const handleCustomRevealUnlock = async () => {
    await trackEvent("premium_clicked", {
      source: "custom_reveal_unlock_button",
      duration,
      gender,
      fireworks_enabled: fireworksEnabled,
      has_custom_gif: Boolean(customGif),
      is_premium_user: isPremiumUser,
      free_tries_remaining: freeTries,
      secret_mode: secretMode,
    });
    focusPremiumCard("Unlock premium to use your own reveal video or GIF.");
  };

  const renderGenderButton = (key) => {
    const isSelected = gender === key;
    const { main, dark, soft, text } = GENDER_STYLES[key];
    const label = key.toUpperCase();
    const emoji = key === "boy" ? "👣" : "🎀";

    if (secretMode) {
      return (
        <Button
          key={key}
          variant="outlined"
          onClick={() => setGender(key)}
          size="large"
          sx={{
            flex: 1,
            minHeight: 54,
            borderRadius: 2.5,
            borderColor: "rgba(20, 26, 32, 0.24)",
            borderWidth: 1,
            color: INK,
            bgcolor: "#fff",
            fontWeight: 900,
            textTransform: "none",
            "&:hover": { borderColor: INK, bgcolor: "rgba(20,26,32,0.04)" },
          }}
        >
          {emoji} {label}
        </Button>
      );
    }

    return (
      <Button
        key={key}
        variant={isSelected ? "contained" : "outlined"}
        onClick={() => setGender(key)}
        size="large"
        sx={{
          flex: 1,
          minHeight: 54,
          borderRadius: 2.5,
          borderWidth: 1.5,
          borderColor: main,
          color: isSelected ? text : main,
          bgcolor: isSelected ? main : soft,
          fontWeight: 900,
          textTransform: "none",
          fontSize: "1rem",
          boxShadow: isSelected ? `0 12px 22px ${soft}` : "none",
          "&:hover": {
            borderColor: dark,
            bgcolor: isSelected ? dark : soft,
          },
        }}
      >
        {emoji} {label}
      </Button>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 18% 12%, rgba(255,255,255,0.54), transparent 24%), linear-gradient(135deg, #94bf8a 0%, #c9dfbd 48%, #fff5df 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        px: { xs: 1.5, sm: 3, md: 4 },
        pt: { xs: 10.5, sm: 12 },
        pb: { xs: 3, sm: 5 },
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

      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 1180,
          mx: "auto",
          borderRadius: { xs: 4, md: 5 },
          overflow: "hidden",
          bgcolor: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(22px)",
          border: "1px solid rgba(255,255,255,0.76)",
          boxShadow: "0 28px 76px rgba(42, 65, 36, 0.24)",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1.25fr 0.9fr" },
            gap: { xs: 3, lg: 4.5 },
            p: { xs: 2.25, sm: 4, md: 5 },
          }}
        >
          <Stack spacing={{ xs: 3, md: 3.5 }}>
            <Box sx={{ textAlign: { xs: "center", lg: "left" } }}>
              <Chip
                label="No setup stress. Just tap, count down, and reveal."
                sx={{
                  mb: 2.25,
                  maxWidth: "100%",
                  height: "auto",
                  py: 0.55,
                  px: 0.5,
                  bgcolor: BRAND_GREEN_SOFT,
                  color: "#104d20",
                  border: "1px solid rgba(62,154,80,0.13)",
                  fontWeight: 900,
                  "& .MuiChip-label": {
                    whiteSpace: "normal",
                    lineHeight: 1.35,
                    px: 1.25,
                  },
                }}
              />
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  color: INK,
                  fontWeight: 950,
                  letterSpacing: 0,
                  fontSize: { xs: "2.15rem", sm: "3rem", md: "3.35rem" },
                  lineHeight: 1.02,
                  mb: 1.5,
                }}
              >
                Create Your Gender Reveal Countdown
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#2e3942",
                  fontSize: { xs: "1rem", sm: "1.12rem" },
                  lineHeight: 1.6,
                  maxWidth: 690,
                  mx: { xs: "auto", lg: 0 },
                }}
              >
                Pick the timer, choose the reveal, and let the big moment play
                out beautifully.
              </Typography>
            </Box>

            <Box
              aria-label="How it works"
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: { xs: 1.75, md: 2 },
              }}
            >
              {HOW_IT_WORKS.map(({ number, title, body, Icon }) => (
                <Box
                  key={title}
                  sx={{
                    position: "relative",
                    textAlign: { xs: "left", md: "center" },
                    display: "grid",
                    gridTemplateColumns: { xs: "auto 1fr", md: "1fr" },
                    gap: { xs: 1.5, md: 1 },
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: { xs: 76, sm: 86, md: 94 },
                      height: { xs: 76, sm: 86, md: 94 },
                      mx: { xs: 0, md: "auto" },
                      borderRadius: "50%",
                      bgcolor: BRAND_GREEN_SOFT,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 2,
                        left: 0,
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        bgcolor: BRAND_GREEN,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.9rem",
                        fontWeight: 950,
                        boxShadow: "0 9px 18px rgba(47, 111, 70, 0.24)",
                      }}
                    >
                      {number}
                    </Box>
                    <Icon sx={{ fontSize: { xs: 38, md: 42 }, color: "#102f17" }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ color: INK, fontWeight: 900, mb: 0.35 }}
                    >
                      {title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: MUTED,
                        lineHeight: 1.45,
                        maxWidth: { xs: "none", md: 190 },
                        mx: { xs: 0, md: "auto" },
                      }}
                    >
                      {body}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Divider sx={{ borderColor: "rgba(20, 26, 32, 0.1)" }} />

            <Box component="section" aria-labelledby="setup-controls-title">
              <Typography
                id="setup-controls-title"
                variant="h5"
                sx={{
                  color: INK,
                  fontWeight: 950,
                  letterSpacing: 0,
                  mb: 0.75,
                }}
              >
                Set up your reveal
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: MUTED, lineHeight: 1.55, mb: 2.75 }}
              >
                Choose the countdown length, reveal result, and effects before
                you start.
              </Typography>

              <Stack spacing={2.25}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "0.92fr 1.2fr" },
                    gap: { xs: 2, sm: 3 },
                    alignItems: "end",
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: INK, fontWeight: 900, mb: 1 }}
                    >
                      Duration in seconds
                    </Typography>
                    <Box
                      sx={{
                        height: 56,
                        borderRadius: 2,
                        overflow: "hidden",
                        bgcolor: "#fff",
                        border: "1px solid rgba(20, 26, 32, 0.1)",
                        boxShadow: "0 7px 18px rgba(20, 26, 32, 0.07)",
                        display: "grid",
                        gridTemplateColumns: "56px 1fr 56px",
                        alignItems: "stretch",
                        maxWidth: { xs: "100%", sm: 230 },
                      }}
                    >
                      <IconButton
                        aria-label="Decrease duration"
                        onClick={() => adjustDuration(-1)}
                        disabled={duration <= 1}
                        sx={{ borderRadius: 0, borderRight: "1px solid rgba(20,26,32,0.08)" }}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: INK,
                          fontSize: "1.55rem",
                          fontWeight: 950,
                        }}
                      >
                        {duration}
                      </Box>
                      <IconButton
                        aria-label="Increase duration"
                        onClick={() => adjustDuration(1)}
                        disabled={duration >= 30}
                        sx={{ borderRadius: 0, borderLeft: "1px solid rgba(20,26,32,0.08)" }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: INK, fontWeight: 900, mb: 1 }}
                    >
                      Reveal result
                    </Typography>
                    <Stack direction="row" spacing={1.5}>
                      {["boy", "girl"].map(renderGenderButton)}
                    </Stack>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1.1fr" },
                    gap: 1.5,
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      px: 1.4,
                      py: 0.8,
                      borderRadius: 2,
                      bgcolor: "#fff",
                      border: "1px solid rgba(20, 26, 32, 0.09)",
                      boxShadow: "0 7px 18px rgba(20, 26, 32, 0.05)",
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={fireworksEnabled}
                          onChange={() => setFireworksEnabled(!fireworksEnabled)}
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: BRAND_GREEN,
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                              bgcolor: BRAND_GREEN,
                            },
                          }}
                        />
                      }
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <AutoAwesomeIcon sx={{ color: "#6b4ee6", fontSize: 22 }} />
                          <Typography sx={{ color: INK, fontWeight: 850 }}>
                            Fireworks
                          </Typography>
                        </Stack>
                      }
                      sx={{ m: 0, width: "100%", justifyContent: "flex-start" }}
                    />
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      px: 1.4,
                      py: 0.8,
                      borderRadius: 2,
                      bgcolor: "#fff",
                      border: "1px solid rgba(20, 26, 32, 0.09)",
                      boxShadow: "0 7px 18px rgba(20, 26, 32, 0.05)",
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={secretMode}
                            onChange={() => setSecretMode(!secretMode)}
                            sx={{
                              "& .MuiSwitch-switchBase.Mui-checked": {
                                color: BRAND_GREEN,
                              },
                              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                bgcolor: BRAND_GREEN,
                              },
                            }}
                          />
                        }
                        label={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LockOutlinedIcon sx={{ color: "#4f5964", fontSize: 20 }} />
                            <Typography sx={{ color: INK, fontWeight: 850 }}>
                              Secret Mode
                            </Typography>
                          </Stack>
                        }
                        sx={{ m: 0 }}
                      />
                      <Tooltip title="Keeps the reveal result hidden in the countdown URL when available.">
                        <HelpOutlineIcon sx={{ color: "#687382", fontSize: 21 }} />
                      </Tooltip>
                    </Stack>
                  </Paper>
                </Box>

                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 1.35, sm: 1.6 },
                    borderRadius: 2.5,
                    bgcolor: isPremiumUser ? "#fff" : "rgba(255,255,255,0.72)",
                    border: "1px solid rgba(62, 154, 80, 0.18)",
                    boxShadow: "0 8px 20px rgba(20, 26, 32, 0.06)",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "stretch", sm: "center" }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.4}
                      alignItems="center"
                      sx={{ flex: 1, minWidth: 0 }}
                    >
                      <CloudUploadOutlinedIcon
                        sx={{ color: INK, fontSize: 34, flexShrink: 0 }}
                      />
                      <TextField
                        label="Paste GIF or video link"
                        value={customGif}
                        onChange={(e) => setCustomGif(e.target.value)}
                        disabled={!isPremiumUser}
                        helperText={
                          isPremiumUser
                            ? "Use a GIPHY link, direct .gif, or .mp4 reveal background."
                            : "Premium lets you upload your own video or GIF."
                        }
                        variant="standard"
                        fullWidth
                        InputProps={{
                          disableUnderline: !isPremiumUser,
                        }}
                        sx={{
                          "& .MuiInputLabel-root": {
                            color: INK,
                            fontWeight: 900,
                          },
                          "& .MuiInputBase-input.Mui-disabled": {
                            WebkitTextFillColor: "#7a838c",
                          },
                          "& .MuiFormHelperText-root": {
                            color: MUTED,
                            mx: 0,
                          },
                        }}
                      />
                    </Stack>
                    <Button
                      variant="outlined"
                      size="medium"
                      disabled={!isPremiumUser}
                      onClick={() => setGiphyDialogOpen(true)}
                      sx={{
                        alignSelf: { xs: "stretch", sm: "center" },
                        minWidth: { xs: "auto", sm: 170 },
                        borderRadius: 2,
                        borderColor: "rgba(20, 26, 32, 0.16)",
                        bgcolor: "#fff",
                        color: INK,
                        fontWeight: 900,
                        textTransform: "none",
                        whiteSpace: "nowrap",
                        "&:hover": {
                          borderColor: BRAND_GREEN,
                          bgcolor: BRAND_GREEN_SOFT,
                        },
                        "&.Mui-disabled": {
                          bgcolor: "rgba(255,255,255,0.62)",
                          color: "#8a939b",
                          borderColor: "rgba(20, 26, 32, 0.1)",
                        },
                      }}
                    >
                      Choose from GIPHY
                    </Button>
                    {!isPremiumUser && (
                      <Button
                        variant="outlined"
                        size="medium"
                        startIcon={<LockOutlinedIcon />}
                        sx={{
                          alignSelf: { xs: "stretch", sm: "center" },
                          minWidth: 122,
                          borderRadius: 2,
                          borderColor: "rgba(62, 154, 80, 0.32)",
                          bgcolor: "#fff",
                          color: "#247135",
                          fontWeight: 900,
                          textTransform: "uppercase",
                          "&:hover": {
                            borderColor: BRAND_GREEN,
                            bgcolor: BRAND_GREEN_SOFT,
                          },
                        }}
                        onClick={handleCustomRevealUnlock}
                      >
                        Unlock
                      </Button>
                    )}
                  </Stack>
                </Paper>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    py: 1.75,
                    borderRadius: 2.4,
                    bgcolor: BRAND_GREEN,
                    fontWeight: 950,
                    textTransform: "none",
                    fontSize: { xs: "1.08rem", sm: "1.2rem" },
                    boxShadow: "0 15px 26px rgba(47, 111, 70, 0.28)",
                    "&:hover": { bgcolor: BRAND_GREEN_DARK },
                  }}
                  onClick={handleSubmit}
                >
                  Start Countdown
                </Button>
              </Stack>
            </Box>
          </Stack>

          <Paper
            ref={premiumRef}
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3.4 },
              borderRadius: 4,
              bgcolor:
                "linear-gradient(160deg, rgba(255,250,242,0.98) 0%, rgba(255,246,236,0.96) 100%)",
              border: "1px solid rgba(211, 151, 89, 0.28)",
              boxShadow: "0 20px 46px rgba(120, 72, 32, 0.12)",
              display: "flex",
              flexDirection: "column",
              alignSelf: "stretch",
            }}
          >
            <Stack spacing={2.6} sx={{ height: "100%" }}>
              <Stack alignItems="center" textAlign="center" spacing={1.45}>
                <Box
                  sx={{
                    width: 58,
                    height: 58,
                    borderRadius: "50%",
                    bgcolor: "rgba(255, 217, 146, 0.38)",
                    border: "1px solid rgba(179, 100, 43, 0.18)",
                    color: "#9a501a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 12px 30px rgba(154, 80, 26, 0.14)",
                  }}
                >
                  <WorkspacePremiumOutlinedIcon sx={{ fontSize: 34 }} />
                </Box>
                <Chip
                  label="👑 Premium Reveal"
                  sx={{
                    bgcolor: "rgba(244, 63, 125, 0.12)",
                    color: "#e31f5d",
                    fontWeight: 950,
                    letterSpacing: 0.2,
                  }}
                />
                <Typography
                  variant="h4"
                  sx={{
                    color: INK,
                    fontWeight: 950,
                    lineHeight: 1.08,
                    letterSpacing: 0,
                    fontSize: { xs: "1.9rem", sm: "2.2rem" },
                  }}
                >
                  Make the big reveal unforgettable.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#45515d",
                    lineHeight: 1.6,
                    maxWidth: 390,
                  }}
                >
                  Turn a simple timer into a special family moment with custom
                  videos, fireworks, and more.
                </Typography>
              </Stack>

              <Stack spacing={1.35}>
                {PREMIUM_FEATURES.map(({ label, Icon, bg, color }) => (
                  <Stack
                    key={label}
                    direction="row"
                    spacing={1.45}
                    alignItems="center"
                    sx={{
                      pb: 1.35,
                      borderBottom: "1px solid rgba(120, 72, 32, 0.11)",
                      "&:last-of-type": {
                        borderBottom: "none",
                        pb: 0,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        bgcolor: bg,
                        color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography sx={{ color: INK, fontSize: "1rem", lineHeight: 1.35 }}>
                      {label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <Box sx={{ flex: 1 }} />

              <Stack spacing={1.8}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.8,
                    borderRadius: 2,
                    bgcolor: "rgba(255, 236, 239, 0.88)",
                    border: "1px solid rgba(244, 63, 125, 0.22)",
                  }}
                >
                  <Stack direction="row" spacing={1.3} alignItems="center">
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        color: "#e31f5d",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      🎁
                    </Box>
                    <Typography sx={{ color: INK, lineHeight: 1.35 }}>
                      {freeTryMessage}
                    </Typography>
                  </Stack>
                </Paper>

                {premiumNotice && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#8a4b1f",
                      fontWeight: 850,
                      bgcolor: "rgba(179, 100, 43, 0.1)",
                      borderRadius: 2,
                      px: 1.4,
                      py: 1.1,
                    }}
                  >
                    {premiumNotice}
                  </Typography>
                )}

                <Button
                  variant={isPremiumUser ? "outlined" : "contained"}
                  fullWidth
                  disabled={isPremiumUser}
                  startIcon={<LockOutlinedIcon />}
                  onClick={handleUnlock}
                  sx={{
                    py: 1.55,
                    borderRadius: 2.2,
                    borderColor: isPremiumUser
                      ? "rgba(138, 75, 31, 0.28)"
                      : "transparent",
                    color: isPremiumUser ? "#8a4b1f" : "#fff",
                    bgcolor: isPremiumUser
                      ? "rgba(255,255,255,0.55)"
                      : "linear-gradient(135deg, #c45b12 0%, #9c3f0b 100%)",
                    background: isPremiumUser
                      ? "rgba(255,255,255,0.55)"
                      : "linear-gradient(135deg, #c45b12 0%, #9c3f0b 100%)",
                    fontWeight: 950,
                    textTransform: "none",
                    fontSize: "1.08rem",
                    boxShadow: isPremiumUser
                      ? "none"
                      : "0 15px 28px rgba(156, 63, 11, 0.28)",
                    "&:hover": {
                      borderColor: isPremiumUser ? "#8a4b1f" : "transparent",
                      background: isPremiumUser
                        ? "#fff"
                        : "linear-gradient(135deg, #af4c0e 0%, #813407 100%)",
                    },
                  }}
                >
                  {premiumButtonLabel}
                </Button>

                <Stack direction="row" spacing={0.75} justifyContent="center" alignItems="center">
                  <ShieldOutlinedIcon sx={{ fontSize: 18, color: "#5a6570" }} />
                  <Typography variant="body2" sx={{ color: "#4f5964" }}>
                    Secure checkout with Stripe
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      </Paper>

      <Dialog
        open={giphyDialogOpen}
        onClose={() => setGiphyDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 0.5,
          },
        }}
      >
        <DialogTitle sx={{ color: INK, fontWeight: 950, pb: 0.75 }}>
          GIPHY search is coming soon
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#45515d", lineHeight: 1.6 }}>
            For now, paste a GIPHY link, direct .gif, or .mp4 URL into the
            custom media field to use it as your reveal background.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            variant="contained"
            onClick={() => setGiphyDialogOpen(false)}
            sx={{
              borderRadius: 2,
              bgcolor: BRAND_GREEN,
              fontWeight: 900,
              textTransform: "none",
              "&:hover": { bgcolor: BRAND_GREEN_DARK },
            }}
          >
            Got it
          </Button>
        </DialogActions>
      </Dialog>

      {devMode && (
        <>
          <IconButton
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              position: "fixed",
              bottom: 16,
              right: 16,
              zIndex: 20,
              bgcolor: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(20,26,32,0.14)",
              boxShadow: "0 8px 20px rgba(20,26,32,0.12)",
              "&:hover": { bgcolor: "#fff" },
            }}
            onClick={() => setDevOpen(!devOpen)}
            aria-label="Open developer settings"
          >
            <SettingsIcon />
          </IconButton>
          {devOpen && (
            <Box
              sx={{
                display: { xs: "none", sm: "block" },
                position: "fixed",
                bottom: 70,
                right: 16,
                zIndex: 20,
                p: 2,
                bgcolor: "white",
                border: "1px solid rgba(20,26,32,0.16)",
                borderRadius: 2,
                boxShadow: "0 16px 36px rgba(20,26,32,0.18)",
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
