// src/GenderCountdown.js
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './countdown.css';

export default function GenderCountdown() {
  const countdownRef = useRef(null);
  const navigate = useNavigate();
  const { state } = useLocation();
  const { duration = 10, gender = 'boy', customGifUrl = '' } = state || {};

  useEffect(() => {
    const body = document.body;
    // 1) Reset styling
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

    countdownRef.current = setInterval(() => {
      if (timer >= 0) {
        displayEl.textContent = timer;
        timer -= 1;
      } else {
        clearInterval(countdownRef.current);
        displayEl.style.display = 'none';

        // 2) Choose custom URL or default
        const defaultGifUrl = gender === 'girl'
          ? 'https://media4.giphy.com/media/K9MPm9A3CaSkw/200w.gif?rid=200w.gif&ct=g'
          : 'https://media4.giphy.com/media/liFaAWEOa1uKc/200w.gif?rid=200w.gif&ct=g';
        const gifUrl = customGifUrl || defaultGifUrl;

        // 3) Tile it
        body.style.backgroundImage   = `url('${gifUrl}')`;
        body.style.backgroundRepeat  = 'repeat';
        body.style.backgroundPosition = 'center';
        body.style.backgroundSize     = 'auto';

        // 4) Show the reveal text
        body.style.color       = gender === 'girl' ? '#ff627e'     : 'cornflowerblue';
        body.style.textShadow  = '8px 1px black';
        genderEl.textContent   = gender === 'girl' ? "IT'S A GIRL!" : "IT'S A BOY!";
      }
    }, 1000);

    return () => {
      clearInterval(countdownRef.current);
      // cleanup
      body.style.backgroundColor    = '';
      body.style.backgroundImage    = '';
      body.style.backgroundRepeat   = '';
      body.style.backgroundPosition = '';
      body.style.backgroundSize     = '';
      body.style.color              = '';
      body.style.textShadow         = '';
    };
  }, [duration, gender, customGifUrl]);

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
