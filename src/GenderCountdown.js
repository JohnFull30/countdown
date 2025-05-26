// src/GenderCountdown.js
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './countdown.css';

export default function GenderCountdown() {
  const [countdownStarted, setCountdownStarted] = useState(false);
  const countdownRef = useRef(null);
  const navigate = useNavigate();
  const { state } = useLocation();
  const { duration = 10, gender = 'boy' } = state || {};

  useEffect(() => {
    if (!countdownStarted) return;

    const body = document.body;
    const displayEl = document.getElementById('counter');
    const genderEl = document.getElementById('gender');

    body.style.backgroundColor = 'darkseagreen';
    body.style.color = '';
    body.style.textShadow = '';

    const videoSrc = gender === 'girl' ? '/reveal-girl.mp4' : '/reveal-boy.mp4';

    const video = document.createElement('video');
    video.src = videoSrc;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;

    Object.assign(video.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: -1,
      objectFit: 'cover',
      display: 'none',
    });

    document.body.appendChild(video);

    let timer = duration;
    countdownRef.current = setInterval(() => {
      if (timer >= 0) {
        displayEl.textContent = timer;
        timer -= 1;
      } else {
        clearInterval(countdownRef.current);
        displayEl.style.display = 'none';
        video.style.display = 'block';

        body.style.color = gender === 'girl' ? '#ff627e' : 'cornflowerblue';
        body.style.textShadow = '8px 1px black';
        genderEl.textContent = gender === 'girl' ? "IT'S A GIRL!" : "IT'S A BOY!";
      }
    }, 1000);

    return () => {
      clearInterval(countdownRef.current);
      video.remove();
      body.style.backgroundColor = '';
      body.style.color = '';
      body.style.textShadow = '';
    };
  }, [countdownStarted, duration, gender]);

  return (
    <div className="countdown-container">
      <button
        className="back-btn"
        onClick={() => navigate('/', { replace: true })}
      >
        Change Timer &amp; Gender
      </button>

      {!countdownStarted ? (
        <button
          className="start-btn"
          style={{ marginTop: '2rem', fontSize: '1.5rem' }}
          onClick={() => setCountdownStarted(true)}
        >
          Start Countdown
        </button>
      ) : (
        <>
          <div id="counter" style={{ fontSize: '4rem' }} />
          <div id="gender" style={{ fontSize: '6rem' }} />
        </>
      )}
    </div>
  );
}
