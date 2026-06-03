import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Divider,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

const SUPPORT_EMAIL = "support@example.com";
const BRAND_GREEN = "#3e9a50";
const INK = "#141a20";
const MUTED = "#536052";

const PAGE_CONTENT = {
  privacy: {
    eyebrow: "Privacy Policy",
    title: "Privacy Policy",
    intro:
      "This page explains the basic information practices for the Gender Reveal Countdown app.",
    sections: [
      {
        title: "Information You Provide",
        body: [
          "The app may use countdown settings such as timer length, reveal selection, custom reveal media links, and premium unlock state to create and display your countdown.",
          "If you contact support, we may receive your email address and any details you choose to include in your message.",
        ],
      },
      {
        title: "Payments",
        body: [
          "Payments are processed through Stripe Checkout. We do not collect or store your full card number in this app.",
          "Stripe may process payment details, billing information, fraud prevention signals, and checkout activity according to Stripe's own policies.",
        ],
      },
      {
        title: "App Storage",
        body: [
          "The app may use browser storage to remember premium status, free reveal tries, checkout state, and setup preferences on your device.",
          "Clearing browser storage may remove local app preferences or premium status stored for that browser.",
        ],
      },
      {
        title: "Contact",
        body: [
          "For privacy questions, contact support at support@example.com.",
        ],
      },
    ],
  },
  terms: {
    eyebrow: "Terms of Use",
    title: "Terms of Use",
    intro:
      "By using Gender Reveal Countdown, you agree to use the app responsibly and only for lawful, personal event purposes.",
    sections: [
      {
        title: "Use of the App",
        body: [
          "You are responsible for the countdown settings, reveal result, and any media link you add to your reveal.",
          "Do not upload, link, or display content that you do not have permission to use or that violates another person's rights.",
        ],
      },
      {
        title: "Premium Features",
        body: [
          "Premium is a one-time unlock for available premium reveal features in this app experience.",
          "Failed payments do not unlock premium. Premium access is only enabled after a completed payment is confirmed by the checkout flow.",
        ],
      },
      {
        title: "Stripe Checkout",
        body: [
          "Payments are processed through Stripe Checkout. If checkout is canceled before completion, no completed payment should be recorded and premium should not unlock.",
          "If you believe a payment state is incorrect, contact support with the approximate time of checkout and the email used during payment.",
        ],
      },
      {
        title: "Availability",
        body: [
          "The app is provided as-is and may change as features, payment handling, or hosting services are updated.",
        ],
      },
    ],
  },
  support: {
    eyebrow: "Support",
    title: "Support / Contact",
    intro:
      "Need help with setup, premium access, checkout, or refunds? Send a note to support and include enough detail to find the issue.",
    sections: [
      {
        title: "Contact Email",
        body: [
          "Email support@example.com for help with the app, premium unlocks, payments, failed checkout attempts, or refund requests.",
        ],
      },
      {
        title: "What to Include",
        body: [
          "Include the device and browser you used, what page you were on, and what happened right before the issue.",
          "For payment questions, include the email used during Stripe Checkout and the approximate checkout time. Do not send full card numbers.",
        ],
      },
      {
        title: "Checkout Issues",
        body: [
          "Canceled checkout means no completed payment should be recorded.",
          "Failed payments do not unlock premium. If you were charged but premium did not unlock, contact support so the payment can be reviewed.",
        ],
      },
    ],
  },
  refunds: {
    eyebrow: "Payments & Refunds",
    title: "Refund / Payment Explanation",
    intro:
      "Premium checkout is handled through Stripe Checkout. This page explains what should happen when checkout succeeds, is canceled, or fails.",
    sections: [
      {
        title: "Stripe Checkout",
        body: [
          "Payments are processed through Stripe Checkout. Stripe securely handles the checkout and payment method details.",
          "After successful checkout, the app redirects back and unlocks premium features for the browser session/device state used by the app.",
        ],
      },
      {
        title: "Canceled Checkout",
        body: [
          "If checkout is canceled before payment is completed, no completed payment should be recorded.",
          "Canceled checkout should not unlock premium. You can return to the setup page and start checkout again when ready.",
        ],
      },
      {
        title: "Failed Payments",
        body: [
          "Failed payments do not unlock premium.",
          "If checkout reports a failure or the payment does not complete, try again with a valid payment method or contact support if you believe the result is wrong.",
        ],
      },
      {
        title: "Refund Requests",
        body: [
          "Refund requests should go through support at support@example.com.",
          "Approved refunds are returned to the original payment method through the payment processor. Timing can vary by bank or card issuer.",
        ],
      },
    ],
  },
};

function LegalPage({ page }) {
  const content = PAGE_CONTENT[page];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 18% 12%, rgba(255,255,255,0.54), transparent 24%), linear-gradient(135deg, #94bf8a 0%, #c9dfbd 48%, #fff5df 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 1.5, sm: 3 },
        py: { xs: 3, sm: 6 },
        boxSizing: "border-box",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 760,
          borderRadius: { xs: 4, sm: 5 },
          bgcolor: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(22px)",
          border: "1px solid rgba(255,255,255,0.76)",
          boxShadow: "0 28px 76px rgba(42, 65, 36, 0.24)",
          p: { xs: 2.5, sm: 4, md: 5 },
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Button
              component={RouterLink}
              to="/"
              startIcon={<ArrowBackIosNewIcon fontSize="small" />}
              sx={{
                mb: 2,
                borderRadius: "999px",
                color: INK,
                bgcolor: "rgba(255,255,255,0.72)",
                border: "1px solid rgba(20, 26, 32, 0.08)",
                textTransform: "none",
                fontWeight: 800,
                "&:hover": { bgcolor: "#fff" },
              }}
            >
              Back to setup
            </Button>
            <Typography
              variant="overline"
              sx={{
                display: "block",
                color: BRAND_GREEN,
                fontWeight: 950,
                letterSpacing: 0.7,
                lineHeight: 1.4,
              }}
            >
              {content.eyebrow}
            </Typography>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                color: INK,
                fontWeight: 950,
                letterSpacing: 0,
                fontSize: { xs: "2rem", sm: "2.75rem" },
                lineHeight: 1.05,
                mt: 0.75,
              }}
            >
              {content.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#2e3942",
                fontSize: { xs: "1rem", sm: "1.08rem" },
                lineHeight: 1.65,
                mt: 1.5,
              }}
            >
              {content.intro}
            </Typography>
          </Box>

          <Divider sx={{ borderColor: "rgba(20, 26, 32, 0.1)" }} />

          <Stack spacing={2.6}>
            {content.sections.map((section) => (
              <Box key={section.title}>
                <Typography
                  variant="h6"
                  sx={{ color: INK, fontWeight: 950, mb: 0.75 }}
                >
                  {section.title}
                </Typography>
                <Stack spacing={1}>
                  {section.body.map((paragraph) => (
                    <Typography
                      key={paragraph}
                      variant="body2"
                      sx={{
                        color: MUTED,
                        fontSize: "0.98rem",
                        lineHeight: 1.65,
                      }}
                    >
                      {paragraph.includes(SUPPORT_EMAIL) ? (
                        <>
                          {paragraph.split(SUPPORT_EMAIL)[0]}
                          <Link
                            href={`mailto:${SUPPORT_EMAIL}`}
                            sx={{ color: BRAND_GREEN, fontWeight: 850 }}
                          >
                            {SUPPORT_EMAIL}
                          </Link>
                          {paragraph.split(SUPPORT_EMAIL)[1]}
                        </>
                      ) : (
                        paragraph
                      )}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>

          <Divider sx={{ borderColor: "rgba(20, 26, 32, 0.1)" }} />

          <Stack
            direction="row"
            spacing={{ xs: 1.25, sm: 2 }}
            useFlexGap
            flexWrap="wrap"
            justifyContent="center"
            sx={{
              "& a": {
                color: "#2e3942",
                fontWeight: 850,
                textDecorationColor: "rgba(62, 154, 80, 0.35)",
                textUnderlineOffset: "3px",
              },
            }}
          >
            <Link component={RouterLink} to="/privacy">
              Privacy
            </Link>
            <Link component={RouterLink} to="/terms">
              Terms
            </Link>
            <Link component={RouterLink} to="/support">
              Support
            </Link>
            <Link component={RouterLink} to="/refunds">
              Refunds
            </Link>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

export function PrivacyPolicyPage() {
  return <LegalPage page="privacy" />;
}

export function TermsOfUsePage() {
  return <LegalPage page="terms" />;
}

export function SupportPage() {
  return <LegalPage page="support" />;
}

export function RefundsPage() {
  return <LegalPage page="refunds" />;
}
