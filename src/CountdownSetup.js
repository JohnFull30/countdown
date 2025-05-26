// src/CountdownSetup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Slider
} from '@mui/material';

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

export const CountdownSetup = () => {
  const [duration, setDuration]   = useState(10);
  const [gender, setGender]       = useState('boy');
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
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'darkseagreen',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Typography variant="h4" gutterBottom>
        🎉 Set Your Countdown
      </Typography>

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'grey.500',
          borderRadius: 2,
          p: 2,
          mb: 2,
          width: 260,
          textAlign: 'center',
          bgcolor: 'transparent'
        }}
      >
        <Typography variant="caption" display="block" gutterBottom>
          Duration: <strong>{duration}</strong> sec
        </Typography>
        <Slider
          value={duration}
          onChange={(e, val) => setDuration(val)}
          aria-label="Countdown Duration"
          valueLabelDisplay="off"
          step={1}
          marks
          min={1}
          max={30}
        />
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
