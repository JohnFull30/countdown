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
  const startingRef = useRef(false);
  const [secretSession, setSecretSession] = useState(null);
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

  useEffect(() => {
    setCountdownStarted(false);
    setRevealPhase(false);
    setConfettiFired(false);
    setSecretSession(null);
    setSecretError("");
    setResolvedGender(revealId ? null : genderParam || "boy");
    setResolvedGif(revealId ? "" : normalizeRevealMediaUrl(customGifUrlParam));
    setResolvedFireworks(revealId ? null : fireworksParam);
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

    let cancelled = false;
    let busy = false;
    const deadline = Date.now() + (secretSession?.duration_seconds || duration) * 1000;
    const showReveal = (resultGender) => {
      clearInterval(countdownRef.current);
      displayEl.style.display = "none";
      body.style.backgroundColor = "#000";
      setRevealPhase(true);
      body.style.color = resultGender === "girl" ? "#ff627e" : "cornflowerblue";
      body.style.textShadow = "8px 1px black";
      genderEl.textContent = resultGender === "girl" ? "IT'S A GIRL!" : "IT'S A BOY!";
    };
    const tick = async () => {
      if (busy || cancelled) return;
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      displayEl.textContent = remaining;
      if (remaining > 0) return;
      if (!revealId) { showReveal(genderParam || "boy"); return; }
      busy = true;
      try {
        const { data, error } = await supabase.rpc("finish_reveal", {
          p_ticket: secretSession.ticket,
        });
        if (error) throw error;
        if (cancelled) return;
        if (!data) {
          // Server clock is authoritative even if the browser clock is altered.
          if (Date.now() - deadline > 60000) throw new Error("Reveal session expired. Reload to try again.");
          return;
        }
        setResolvedGender(data.gender);
        setResolvedGif(normalizeRevealMediaUrl(data.custom_gif_url || ""));
        setResolvedFireworks(data.fireworks);
        showReveal(data.gender);
      } catch {
        if (!cancelled) {
          clearInterval(countdownRef.current);
          setSecretError("Could not retrieve the reveal. Reload to try again.");
        }
      } finally { busy = false; }
    };
    tick();
    countdownRef.current = setInterval(tick, 1000);

    return () => {
      cancelled = true;
      clearInterval(countdownRef.current);
      body.style.backgroundColor = "";
      body.style.color = "";
      body.style.textShadow = "";
    };
  }, [countdownStarted, duration, genderParam, revealId, secretSession]);

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

  const startDisabled = secretLoading;

  const handleCountdownStart = async () => {
    if (startingRef.current) return;
    startingRef.current = true;
    setSecretLoading(true);
    setSecretError("");
    try {
      if (revealId) {
        const { data, error } = await supabase.rpc("start_reveal", { p_reveal_id: revealId });
        if (error || !data?.ticket) throw error || new Error("Reveal unavailable");
        setSecretSession(data);
      }
      // Do not send share capabilities or secret settings to analytics.
      void trackEvent("countdown_started", { secret_mode: Boolean(revealId) });
      setCountdownStarted(true);
    } catch {
      setSecretError("Could not start this reveal. Check the link and try again.");
    } finally {
      startingRef.current = false;
      setSecretLoading(false);
    }
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
      {secretError && <p role="alert">{secretError}</p>}
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
