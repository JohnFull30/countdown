export function normalizeRevealMediaUrl(rawUrl) {
  const value = rawUrl.trim();
  if (!value) return "";

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split("/").filter(Boolean);

    if (!host.includes("giphy.com")) {
      return url.href;
    }

    if (parts[0] === "media" && parts[1]) {
      return url.href;
    }

    if ((parts[0] === "gifs" || parts[0] === "stickers") && parts[1]) {
      const id = parts[1].split("-").pop();
      if (id) return `https://media.giphy.com/media/${id}/giphy.gif`;
    }

    if (parts[0] === "embed" && parts[1]) {
      return `https://media.giphy.com/media/${parts[1]}/giphy.gif`;
    }

    return url.href;
  } catch {
    return value;
  }
}

export function getRevealMediaType(url) {
  const cleanUrl = url.split("?")[0].toLowerCase();
  if (/\.(mp4|webm|mov)$/.test(cleanUrl)) return "video";
  if (/\.(gif|png|jpe?g|webp)$/.test(cleanUrl)) return "image";
  return "image";
}
