import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './countdown.css';

export default function GenderCountdown() {
  const [countdownStarted, setCountdownStarted] = useState(false);
  const [revealPhase, setRevealPhase] = useState(false);
  const countdownRef = useRef(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const duration = parseInt(searchParams.get('duration') || '10', 10);
  const gender = searchParams.get('gender') || 'boy';
  const customGifUrl = searchParams.get('customGifUrl') || '';
  const videoSrc = customGifUrl || `/${gender === 'girl' ? 'girl-reveal.mp4' : 'boy-reveal.mp4'}`;

  useEffect(() => {
    if (!countdownStarted) return;

    const body = document.body;
    const displayEl = document.getElementById('counter');
    const genderEl = document.getElementById('gender');

    body.style.backgroundColor = 'transparent';
    body.style.color = '';
    body.style.textShadow = '';

    let timer = duration;
    countdownRef.current = setInterval(() => {
      if (timer >= 0) {
        displayEl.textContent = timer;
        timer -= 1;
      } else {
        clearInterval(countdownRef.current);
        displayEl.style.display = 'none';
        setRevealPhase(true);
        body.style.color = gender === 'girl' ? '#ff627e' : 'cornflowerblue';
        body.style.textShadow = '8px 1px black';
        genderEl.textContent = gender === 'girl' ? "IT'S A GIRL!" : "IT'S A BOY!";
      }
    }, 1000);

    return () => {
      clearInterval(countdownRef.current);
      body.style.backgroundColor = '';
      body.style.color = '';
      body.style.textShadow = '';
    };
  }, [countdownStarted, duration, gender]);

  useEffect(() => {
    if (revealPhase && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Video autoplay failed:', error);
        });
      }
    }
  }, [revealPhase]);

  return (
    <div
      className="countdown-container"
      style={{ backgroundColor: 'transparent', position: 'relative', zIndex: 0 }}
    >
      {revealPhase && (
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          loop
          playsInline
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            zIndex: -1,
            pointerEvents: 'none',
          }}
        />
      )}

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
          onClick={() => {
            setCountdownStarted(true);
          }}
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
