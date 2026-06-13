import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import { createSupportMailtoUrl } from "./config/contact";

const SUPPORT_SUBJECT = "Countdown Support Request";

const pageSx = {
  minHeight: "100vh",
  bgcolor: "darkseagreen",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  px: { xs: 2, sm: 3 },
  py: { xs: 5, sm: 7 },
};

const cardSx = {
  width: "100%",
  maxWidth: 620,
  p: { xs: 3, sm: 4.5 },
  borderRadius: 5,
  textAlign: "center",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.78))",
  boxShadow: "0 24px 70px rgba(30, 52, 36, 0.22)",
  border: "1px solid rgba(255,255,255,0.64)",
  backdropFilter: "blur(14px)",
};

export default function Support() {
  const supportMailto = createSupportMailtoUrl(SUPPORT_SUBJECT);

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
              color: "#2f6f46",
              bgcolor: "rgba(47, 111, 70, 0.1)",
            }}
          >
            <MailOutlineRoundedIcon sx={{ fontSize: 42 }} />
          </Box>

          <Stack spacing={1.35} alignItems="center" sx={{ mb: { xs: 0.5, sm: 1 } }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: "#18221b" }}>
              How can we help?
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "rgba(24,34,27,0.78)", lineHeight: 1.65, maxWidth: 500 }}
            >
              Contact Pierre Fuller Labs for help with Countdown setup,
              premium access, payments, or reveal playback.
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
              href={supportMailto}
              startIcon={<MailOutlineRoundedIcon />}
              aria-label="Email Pierre Fuller Labs support"
              sx={{
                py: 1.35,
                borderRadius: 999,
                bgcolor: "#18221b",
                textTransform: "none",
                fontWeight: 700,
                "&:hover": { bgcolor: "#243226" },
              }}
            >
              Email Support
            </Button>
            <Button
              fullWidth
              component={RouterLink}
              to="/"
              variant="outlined"
              size="large"
              startIcon={<ArrowBackRoundedIcon />}
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
