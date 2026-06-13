import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Link, Stack, Typography } from "@mui/material";
import {
  SUPPORT_EMAIL,
  createSupportMailtoUrl,
} from "./config/contact";

export default function SupportFooter({
  compact = false,
  topSpacing,
  bottomSpacing,
}) {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "transparent",
        px: { xs: 2, sm: 3 },
        pt: topSpacing ?? (compact ? { xs: 0.35, sm: 0.45 } : { xs: 0.65, sm: 0.75 }),
        pb: bottomSpacing ?? (compact ? 0 : { xs: 1.25, sm: 1.5 }),
      }}
    >
      <Stack
        direction="row"
        spacing={{ xs: 1, sm: 1.25 }}
        alignItems="center"
        justifyContent="center"
        sx={{
          width: "fit-content",
          maxWidth: "100%",
          mx: "auto",
          px: { xs: 1.35, sm: 1.75 },
          py: { xs: 0.8, sm: 0.75 },
          borderRadius: 999,
          bgcolor: "rgba(255, 255, 255, 0.36)",
          border: "1px solid rgba(255, 255, 255, 0.46)",
          boxShadow: "none",
          backdropFilter: "blur(12px)",
          color: "rgba(24,34,27,0.66)",
          textAlign: "center",
          fontSize: { xs: "0.8rem", sm: "0.86rem" },
          flexWrap: "wrap",
          rowGap: 0.45,
        }}
      >
        <Typography variant="body2" sx={{ color: "inherit" }}>
          Need help?
        </Typography>
        <Link
          component={RouterLink}
          to="/support"
          aria-label="Open Countdown support page"
          sx={{
            color: "#18221b",
            fontWeight: 700,
            textDecorationColor: "rgba(24,34,27,0.32)",
            "&:hover": { textDecorationColor: "#18221b" },
          }}
        >
          Support
        </Link>
        <Link
          href={createSupportMailtoUrl("Countdown Support Request")}
          aria-label={`Email support at ${SUPPORT_EMAIL}`}
          sx={{
            color: "#18221b",
            fontWeight: 700,
            textDecorationColor: "rgba(24,34,27,0.32)",
            "&:hover": { textDecorationColor: "#18221b" },
          }}
        >
          {SUPPORT_EMAIL}
        </Link>
        <Typography
          aria-hidden="true"
          variant="body2"
          sx={{ color: "rgba(24,34,27,0.32)", display: { xs: "none", sm: "block" } }}
        >
          /
        </Typography>
        <Typography variant="body2" sx={{ color: "inherit" }}>
          A Pierre Fuller Labs product.
        </Typography>
      </Stack>
    </Box>
  );
}
