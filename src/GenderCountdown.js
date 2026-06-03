// src/GenderCountdown.js
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import "./countdown.css";
import { supabase } from "./supabaseClient";
import { trackEvent } from "./analytics";
import { getRevealMediaType, normalizeRevealMediaUrl } from "./mediaUrl";

export default function GenderCountdown() {
  const [countdownStarted, setCountdownStarted] = useState(false);
  const [revealPhase, setRevealPhase] = useState(false);
  const [confettiFired, setConfettiFired] = useState(false);

  // NEW: secret resolve state
  const [resolvedGender, setResolvedGender] = useState(null);
  const [resolvedGif, setResolvedGif] = useState("");
  const [resolvedFireworks, setResolvedFireworks] = useState(null);
  const [secretLoading, setSecretLoading] = useState(false);
  const [secretError, setSecretError] = useState("");
  const [mediaError, setMediaError] = useState(false);

  const countdownRef = useRef(null);
  const videoRef = useRef(null);
  const confettiCanvasRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const duration = parseInt(searchParams.get("duration") || "10", 10);
  const genderParam = searchParams.get("gender") || null;
  const customGifUrlParam = searchParams.get("customGifUrl") || "";
  const fireworksParam = searchParams.get("fireworks") === "true"; // ← respect toggle
  const revealId = searchParams.get("revealId") || "";

  // Resolve gender/options:
  // - Non-secret: use query params as before
  // - Secret: fetch from Supabase by revealId (keeps UI neutral until resolved)
  useEffect(() => {
    let cancelled = false;

    async function loadSecret() {
      setSecretLoading(true);
      setSecretError("");
      try {
        const { data, error } = await supabase
          .from("reveals")
          .select("gender, duration_seconds, fireworks, custom_gif_url")
          .eq("id", revealId)
          .single();

        if (error) throw error;
        if (!data?.gender) throw new Error("No secret found.");

        if (!cancelled) {
          setResolvedGender(data.gender);
          // Prefer server values where present; keep duration from URL for consistency
          setResolvedGif(normalizeRevealMediaUrl(data.custom_gif_url || ""));
          setResolvedFireworks(
            typeof data.fireworks === "boolean"
              ? data.fireworks
              : fireworksParam
          );
        }
      } catch (e) {
        if (!cancelled) setSecretError(e.message || "Failed to load secret.");
      } finally {
        if (!cancelled) setSecretLoading(false);
      }
    }

    if (revealId) {
      loadSecret();
    } else {
      // non-secret path (original behavior)
      setResolvedGender(genderParam || "boy");
      setResolvedGif(normalizeRevealMediaUrl(customGifUrlParam || ""));
      setResolvedFireworks(fireworksParam);
    }

    return () => {
      cancelled = true;
    };
  }, [revealId, genderParam, customGifUrlParam, fireworksParam]);

  const base = process.env.PUBLIC_URL || "";
  const gender = resolvedGender || "boy";
  const customGifUrl = resolvedGif || "";
  const fireworks =
    typeof resolvedFireworks === "boolean" ? resolvedFireworks : fireworksParam;

  const videoSrc =
    mediaError || !customGifUrl
      ? `${base}/${gender === "girl" ? "girl-reveal.mp4" : "boy-reveal.mp4"}`
      : customGifUrl;
  const mediaType =
    !mediaError && customGifUrl ? getRevealMediaType(customGifUrl) : "video";

  const defaultVideoSrc =
    `${base}/${gender === "girl" ? "girl-reveal.mp4" : "boy-reveal.mp4"}`;

  useEffect(() => {
    if (!countdownStarted) return;
    setMediaError(false);

    const body = document.body;
    const displayEl = document.getElementById("counter");
    const genderEl = document.getElementById("gender");

    body.style.backgroundColor = "darkseagreen";
    body.style.color = "";
    body.style.textShadow = "";

    let timer = duration;
    countdownRef.current = setInterval(() => {
      if (timer >= 0) {
        displayEl.textContent = timer;
        timer -= 1;
      } else {
        clearInterval(countdownRef.current);
        displayEl.style.display = "none";
        body.style.backgroundColor = "#000";
        setRevealPhase(true);
        body.style.color = gender === "girl" ? "#ff627e" : "cornflowerblue";
        body.style.textShadow = "8px 1px black";
        genderEl.textContent =
          gender === "girl" ? "IT'S A GIRL!" : "IT'S A BOY!";
      }
    }, 1000);

    return () => {
      clearInterval(countdownRef.current);
      body.style.backgroundColor = "";
      body.style.color = "";
      body.style.textShadow = "";
    };
  }, [countdownStarted, duration, gender, customGifUrl]);

  useEffect(() => {
    if (!revealPhase) return;

    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Video autoplay failed:", error);
        });
      }
    }

    if (fireworks && !confettiFired) {
      setConfettiFired(true);
      fireConfetti();
    }
  }, [revealPhase, fireworks, confettiFired, mediaType, videoSrc]);

  const fireConfetti = () => {
    const fire = confettiCanvasRef.current
      ? confetti.create(confettiCanvasRef.current, {
          resize: true,
          useWorker: false,
        })
      : confetti;
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 999 };

    fire({
      ...defaults,
      particleCount: 120,
      origin: { x: 0.5, y: 0.45 },
    });
    fire({
      ...defaults,
      particleCount: 80,
      angle: 60,
      spread: 80,
      origin: { x: 0, y: 0.65 },
    });
    fire({
      ...defaults,
      particleCount: 80,
      angle: 120,
      spread: 80,
      origin: { x: 1, y: 0.65 },
    });

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      fire({
        ...defaults,
        particleCount: 60,
        origin: {
          x: Math.random(),
          y: Math.random() * 0.55,
        },
      });
    }, 250);
  };

  const startDisabled =
    !!revealId && (secretLoading || !!secretError || !resolvedGender);

  const handleCountdownStart = async () => {
    await trackEvent("countdown_started", {
      duration,
      gender,
      has_custom_gif: Boolean(customGifUrl),
      fireworks_enabled: fireworks,
      secret_mode: Boolean(revealId),
      reveal_id: revealId || undefined,
      media_type: mediaType,
    });
    setCountdownStarted(true);
  };

  return (
    <div
      className="countdown-container"
      style={{
        backgroundColor: "transparent",
        position: "relative",
        zIndex: 0,
      }}
    >
      {revealPhase && (
        <>
          {mediaType === "video" ? (
            <video
              ref={videoRef}
              src={videoSrc}
              muted
              loop
              playsInline
              preload="auto"
              onError={() => setMediaError(true)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                objectFit: "cover",
                zIndex: -1,
                pointerEvents: "none",
                opacity: revealPhase ? 1 : 0,
                transition: "opacity 0.8s ease",
              }}
            />
          ) : (
            <img
              src={videoSrc || defaultVideoSrc}
              alt=""
              onError={() => setMediaError(true)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                objectFit: "cover",
                zIndex: -1,
                pointerEvents: "none",
                opacity: revealPhase ? 1 : 0,
                transition: "opacity 0.8s ease",
              }}
            />
          )}
          {fireworks && (
            <canvas
              ref={confettiCanvasRef}
              style={{
                position: "fixed",
                inset: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 5,
                pointerEvents: "none",
              }}
            />
          )}
        </>
      )}

      <button
        className="back-btn"
        onClick={() => navigate("/", { replace: true })}
      >
        Change Timer &amp; Gender
      </button>

      {!countdownStarted ? (
        <button
          className="start-btn"
          style={{ marginTop: "2rem", fontSize: "1.5rem" }}
          onClick={handleCountdownStart}
          disabled={startDisabled}
          title={
            startDisabled
              ? secretError
                ? `Couldn't load secret: ${secretError}`
                : "Preparing your secret reveal…"
              : ""
          }
        >
          Start Countdown
        </button>
      ) : (
        <>
          <div id="counter" style={{ fontSize: "4rem" }} />
          <div id="gender" style={{ fontSize: "6rem" }} />
        </>
      )}
    </div>
  );
}
