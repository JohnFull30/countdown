// src/CountdownSetup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button } from '@mui/material';

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

// simple JS URL validator
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const CountdownSetup = () => {
  const [duration, setDuration]   = useState(10);
  const [gender,   setGender]     = useState('boy');
  const [customGif, setCustomGif] = useState('');
  const [urlError,  setUrlError]  = useState(false);
  const navigate = useNavigate();

  const handleDuration = e => {
    const val = Math.min(30, Math.max(1, Number(e.target.value)));
    setDuration(val);
  };

  const handleGifChange = e => {
    const val = e.target.value;
    setCustomGif(val);
    // only validate non-empty values
    if (val === '' || isValidUrl(val)) {
      setUrlError(false);
    } else {
      setUrlError(true);
    }
  };

  const handleSubmit = () => {
    if (urlError) return;
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

      {/* Duration picker */}
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'grey.500',
          borderRadius: 2,
          p: 1,
          mb: 2,
          width: 90,
          textAlign: 'center',
          bgcolor: 'transparent'
        }}
      >
        <Typography variant="caption" display="block" gutterBottom>
          Duration (sec)
        </Typography>
        <TextField
          value={duration}
          onChange={handleDuration}
          type="number"
          inputProps={{ min: 1, max: 30 }}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: { textAlign: 'center', fontSize: '1.25rem', py: 0 }
          }}
        />
      </Box>

      {/* Gender selector */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {['boy', 'girl'].map(renderGenderButton)}
      </Box>

      {/* URL input with validation */}
      <TextField
        label="Custom GIF URL (optional)"
        value={customGif}
        onChange={handleGifChange}
        type="url"
        variant="outlined"
        fullWidth
        error={urlError}
        helperText={urlError ? 'Please enter a valid URL' : ''}
        sx={{ maxWidth: 320, mb: 3 }}
      />

      {/* Submit */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        sx={{ maxWidth: 320 }}
        onClick={handleSubmit}
        disabled={urlError}
      >
        Start Countdown
      </Button>
    </Box>
  );
};

export default CountdownSetup;
