// src/GenderCountdown.js
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './countdown.css';

export default function GenderCountdown() {
  const [started, setStarted] = useState(false);
  const countdownRef = useRef(null);
  const navigate = useNavigate();
  const { state } = useLocation();
  // Pull duration, gender, and optional customGifUrl from navigation state
  const { duration = 10, gender = 'boy', customGifUrl } = state || {};

  // Determine final GIF URL: customGifUrl overrides default based on gender
  const defaultGif = gender === 'girl'
    ? 'https://media4.giphy.com/media/K9MPm9A3CaSkw/200w.gif?cid=…&rid=200w.gif&ct=g'
    : 'https://media4.giphy.com/media/liFaAWEOa1uKc/200w.gif?cid=…&rid=200w.gif&ct=g';
  const finalGifUrl = customGifUrl || defaultGif;

  useEffect(() => {
    if (!started) return;

    const body = document.body;
    // Reset any previous body styling
    ['backgroundColor','backgroundImage','backgroundRepeat','backgroundPosition','backgroundSize','color','textShadow']
      .forEach(prop => body.style[prop] = '');

    let timer = duration;
    const counterEl = document.getElementById('counter');
    const genderEl  = document.getElementById('gender');

    // Show counter and clear text
    counterEl.style.display = 'block';
    genderEl.textContent   = '';

    countdownRef.current = setInterval(() => {
      counterEl.textContent = timer;
      if (timer-- <= 0) {
        clearInterval(countdownRef.current);
        counterEl.style.display = 'none';

        // Apply GIF background
        body.style.backgroundImage    = `url('${finalGifUrl}')`;
        body.style.backgroundRepeat   = 'repeat';
        body.style.backgroundPosition = 'center';
        body.style.backgroundSize     = 'auto';

        // Reveal final text
        body.style.color      = gender === 'girl' ? '#ff627e' : 'cornflowerblue';
        body.style.textShadow = '8px 1px black';
        genderEl.textContent  = gender === 'girl' ? "IT'S A GIRL!" : "IT'S A BOY!";
      }
    }, 1000);

    return () => {
      clearInterval(countdownRef.current);
      // Cleanup body styles on unmount
      ['backgroundColor','backgroundImage','backgroundRepeat','backgroundPosition','backgroundSize','color','textShadow']
        .forEach(prop => body.style[prop] = '');
    };
  }, [started, duration, gender, finalGifUrl]);

  return (
    <div className="countdown-container">
      <button className="back-btn" onClick={() => navigate('/', { replace: true })}>
        Change Timer &amp; Gender
      </button>

      {!started ? (
        <button className="start-btn" onClick={() => setStarted(true)}>
          Start Countdown
        </button>
      ) : (
        <>
          <div id="counter" style={{ fontSize: '4rem' }} />
          <div id="gender"  style={{ fontSize: '6rem' }} />
        </>
      )}
    </div>
  );
}
