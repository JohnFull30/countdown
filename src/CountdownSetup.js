// src/CountdownSetup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './countdown.css';

export const CountdownSetup = () => {
  const [duration, setDuration] = useState(10);
  const [gender, setGender] = useState('boy');
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate('/countdown', { state: { duration, gender } });
  };

  return (
    <div className="countdown-container">
      <div className="duration-input">
        <label>Seconds (1-30): </label>
        <input
          type="number"
          min="1"
          max="30"
          value={duration}
          onChange={(e) => setDuration(Math.min(30, Math.max(1, parseInt(e.target.value, 10))))}
        />
      </div>

      <div className="gender-selection">
        <button className="gender-btn" onClick={() => setGender('boy')} style={{background: gender==='boy' ? 'cornflowerblue' : 'grey'}}>Boy</button>
        <button className="gender-btn" onClick={() => setGender('girl')} style={{background: gender==='girl' ? '#ff627e' : 'grey'}}>Girl</button>
      </div>

      <button className="start-btn" onClick={handleSubmit}>Start Countdown</button>
    </div>
  );
};

export default CountdownSetup;
