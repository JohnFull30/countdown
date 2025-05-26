// src/CountdownSetup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, TextField } from '@mui/material';
import Flicking from "@egjs/react-flicking";
import "@egjs/react-flicking/dist/flicking.css";

const GENDER_STYLES = {
  boy: {
    main: 'primary.main',
    dark: 'primary.dark',
    text: '#fff',
    hoverBg: 'rgba(25,118,210,0.1)'
  },
  girl: {
    main: '#ff627e',
    dark: '#e55672',
    text: '#fff',
    hoverBg: 'rgba(255,98,126,0.1)'
  }
};

const generateDurations = () => Array.from({ length: 30 }, (_, i) => i + 1);

export const CountdownSetup = () => {
  const [duration, setDuration] = useState(10);
  const [gender, setGender] = useState('boy');
  const [customGif, setCustomGif] = useState('');
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate('/countdown', {
      state: { duration, gender, customGifUrl: customGif }
    });
  };

  const renderGenderButton = key => {
    const isSelected = gender === key;
    const { main, dark, text, hoverBg } = GENDER_STYLES[key];

    return (
      <Button
        key={key}
        variant={isSelected ? 'contained' : 'outlined'}
        onClick={() => setGender(key)}
        size="medium"
        sx={{
          width: 100,
          ...(isSelected
            ? {
              bgcolor: main,
              color: text,
              '&:hover': { bgcolor: dark }
            }
            : {
              borderColor: main,
              borderWidth: '2px',
              borderStyle: 'solid',
              color: main,
              '&:hover': { bgcolor: hoverBg }
            })
        }}
      >
        {key.toUpperCase()}
      </Button>
    );
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: 'darkseagreen',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Typography variant="h4" gutterBottom>
        🎉 Set Your Countdown
      </Typography>

      <Typography variant="caption" sx={{ fontSize: '0.8rem', color: 'black', mb: 0.5 }}>
        Duration
      </Typography>

      <Box sx={{
        width: 100,
        height: 48,
        border: '1px solid',
        borderColor: 'grey.500',
        borderRadius: 2,
        mb: 3,
        bgcolor: 'transparent',
        overflow: 'hidden'
      }}>
        <Flicking
          horizontal={false}
          align="center"
          defaultIndex={duration - 1}
          bounce={20}
          deceleration={0.0075}
          onChanged={(e) => {
            const val = parseInt(e.panel.element.innerText);
            setDuration(val);
          }}
          style={{ height: '100%', width: '100%' }}
        >
          {generateDurations().map((sec) => (
            <div
              key={sec}
              style={{
                height: 48,
                width: '100%',
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "1.25rem",
                fontWeight: 600,
                fontFamily: "Helvetica, sans-serif",
                color: "#000",
                userSelect: "none",
              }}
            >
              {sec}
            </div>
          ))}
        </Flicking>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {['boy', 'girl'].map(renderGenderButton)}
      </Box>

      <TextField
        label="Custom GIF URL (optional)"
        value={customGif}
        onChange={e => setCustomGif(e.target.value)}
        variant="outlined"
        fullWidth
        sx={{ maxWidth: 320, mb: 3 }}
      />

      <Button
        variant="contained"
        size="large"
        fullWidth
        sx={{ maxWidth: 320 }}
        onClick={handleSubmit}
      >
        Start Countdown
      </Button>
    </Box>
  );
};

export default CountdownSetup;
