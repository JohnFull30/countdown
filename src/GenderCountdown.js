// src/GenderCountdown.js
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './countdown.css';

export default function GenderCountdown() {
  const countdownRef = useRef(null);
  const navigate = useNavigate();
  const { state } = useLocation();
  const { duration = 10, gender = 'boy' } = state || {};

  useEffect(() => {
    const body = document.body;
    // 1) Reset to solid green and clear any previous GIF
    body.style.backgroundColor  = 'darkseagreen';
    body.style.backgroundImage  = '';
    body.style.backgroundRepeat = '';
    body.style.backgroundPosition = '';
    body.style.backgroundSize    = '';
    body.style.color            = '';
    body.style.textShadow       = '';

    let timer = duration;
    const displayEl = document.getElementById('counter');
    const genderEl  = document.getElementById('gender');

    // ensure your counter & text are visible at start
    displayEl.style.display = '';
    genderEl.textContent   = '';

    countdownRef.current = setInterval(() => {
      displayEl.textContent = timer;
      if (timer-- <= 0) {
        clearInterval(countdownRef.current);
        displayEl.style.display = 'none';

        // 2) Pick the correct GIF URL
        const gifUrl = gender === 'girl'
          ? 'https://media4.giphy.com/media/K9MPm9A3CaSkw/200w.gif?cid=82a1493bjmbf74sqgxnb4emr4hse65xczf57gkrrmgqtzfm7&rid=200w.gif&ct=g'
          : 'https://media4.giphy.com/media/liFaAWEOa1uKc/200w.gif?cid=82a1493bnm84hi1bbod5eoxmgpk5jc1dcfrs8e0ueraxj26f&rid=200w.gif&ct=g';

        // 3) Tile it—repeat across the screen, default size (200×200)
        body.style.backgroundImage   = `url('${gifUrl}')`;
        body.style.backgroundRepeat  = 'repeat';
        body.style.backgroundPosition = 'center';
        body.style.backgroundSize     = 'auto';

        // 4) Reveal the final text
        body.style.color       = gender === 'girl' ? '#ff627e'     : 'cornflowerblue';
        body.style.textShadow  = '8px 1px black';
        genderEl.textContent   = gender === 'girl' ? "IT'S A GIRL!" : "IT'S A BOY!";
      }
    }, 1000);

    return () => {
      clearInterval(countdownRef.current);
      // Clean up all body styles on unmount/refresh
      body.style.backgroundColor  = '';
      body.style.backgroundImage  = '';
      body.style.backgroundRepeat = '';
      body.style.backgroundPosition = '';
      body.style.backgroundSize    = '';
      body.style.color            = '';
      body.style.textShadow       = '';
    };
  }, [duration, gender]);

  return (
    <div className="countdown-container">
      <button
        className="back-btn"
        onClick={() => navigate('/', { replace: true })}
      >
        Change Timer &amp; Gender
      </button>
      <div id="counter" style={{ fontSize: '4rem' }} />
      <div id="gender"  style={{ fontSize: '6rem' }} />
    </div>
  );
}
