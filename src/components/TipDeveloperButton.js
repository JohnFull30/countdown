import React, { useState } from "react";
import { Alert, Box, Button, Snackbar } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { trackEvent } from "../analytics";

const TIP_URL = process.env.REACT_APP_STRIPE_TIP_URL;

export default function TipDeveloperButton({
  source,
  variant = "text",
  size = "medium",
  fullWidth = false,
  sx,
}) {
  const [errorOpen, setErrorOpen] = useState(false);
  const [heartFilled, setHeartFilled] = useState(false);
  const [heartActive, setHeartActive] = useState(false);

  const HeartIcon = heartFilled || heartActive ? FavoriteIcon : FavoriteBorderIcon;

  const handleClick = async () => {
    setHeartFilled(true);

    if (!TIP_URL) {
      setErrorOpen(true);
      return;
    }

    await trackEvent("tip_button_clicked", {
      source,
    });

    window.open(TIP_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        onMouseEnter={() => setHeartActive(true)}
        onMouseLeave={() => setHeartActive(false)}
        onFocus={() => setHeartActive(true)}
        onBlur={() => setHeartActive(false)}
        onPointerDown={() => setHeartFilled(true)}
        startIcon={
          <Box
            component="span"
            className="tip-heart"
            sx={{
              display: "inline-flex",
              width: 20,
              height: 20,
              alignItems: "center",
              justifyContent: "center",
              color: "#e85d75",
            }}
          >
            <HeartIcon sx={{ fontSize: 20 }} />
          </Box>
        }
        onClick={handleClick}
        aria-label="Tip the Developer with Stripe"
        sx={{
          textTransform: "none",
          fontWeight: 800,
          "@keyframes tipHeartBeat": {
            "0%": { transform: "scale(1)" },
            "35%": { transform: "scale(1.16)" },
            "70%": { transform: "scale(0.98)" },
            "100%": { transform: "scale(1)" },
          },
          "& .MuiButton-startIcon": {
            color: "#e85d75",
            mr: 0.85,
          },
          "& .tip-heart": {
            transition: "transform 180ms ease",
            animation: "tipHeartBeat 620ms ease-out 450ms 1",
          },
          "&:hover .tip-heart, &:focus-visible .tip-heart, &:active .tip-heart": {
            transform: "scale(1.12)",
          },
          "&:hover": {
            bgcolor: "transparent",
            boxShadow: "none",
          },
          "&:active": {
            bgcolor: "transparent",
            boxShadow: "none",
          },
          "@media (prefers-reduced-motion: reduce)": {
            "& .tip-heart": {
              animation: "none",
              transition: "none",
            },
            "&:hover .tip-heart, &:focus-visible .tip-heart, &:active .tip-heart": {
              transform: "none",
            },
          },
          ...sx,
        }}
      >
        Tip the Developer
      </Button>

      <Snackbar
        open={errorOpen}
        autoHideDuration={5000}
        onClose={() => setErrorOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setErrorOpen(false)}
          sx={{ width: "100%" }}
        >
          Tip link is not configured yet.
        </Alert>
      </Snackbar>
    </>
  );
}
