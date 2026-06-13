export const SUPPORT_EMAIL = "support@pierrefullerlabs.com";

export const SUPPORT_EMAIL_URL = `mailto:${SUPPORT_EMAIL}`;

export function createSupportMailtoUrl(subject) {
  if (!subject) return SUPPORT_EMAIL_URL;

  return `${SUPPORT_EMAIL_URL}?subject=${encodeURIComponent(subject)}`;
}
