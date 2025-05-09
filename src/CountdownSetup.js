// src/CountdownSetup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material';

export const CountdownSetup = () => {
  const [duration, setDuration] = useState(10);
  const [gender, setGender] = useState('boy');
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate('/countdown', { state: { duration, gender } });
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          🎉 Set Your Countdown
        </Typography>

        {/* Compact, center-aligned duration input */}
        <TextField
          label="Duration (sec)"
          type="number"
          value={duration}
          onChange={e =>
            setDuration(
              Math.min(30, Math.max(1, parseInt(e.target.value, 10) || 1))
            )
          }
          sx={{ width: 110, mb: 4 }}
          inputProps={{
            min: 1,
            max: 30,
            style: { textAlign: 'center' },
          }}
        />

        {/* Plain Button gender picker */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Button
            onClick={() => setGender('boy')}
            sx={{
              width: 100,
              ...(gender === 'boy'
                ? {
                    bgcolor: 'primary.main',
                    color: 'common.white',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }
                : {
                    border: '2px solid',
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'primary.light' },
                  }),
            }}
          >
            Boy
          </Button>

          <Button
            onClick={() => setGender('girl')}
            sx={{
              width: 100,
              ...(gender === 'girl'
                ? {
                    bgcolor: '#ff80ab',
                    color: 'common.white',
                    '&:hover': { bgcolor: '#ff4081' },
                  }
                : {
                    border: '2px solid',
                    borderColor: '#ff4081',
                    color: '#ff4081',
                    '&:hover': { bgcolor: '#ffe1f0' },
                  }),
            }}
          >
            Girl
          </Button>
        </Box>

        <Button variant="contained" size="large" fullWidth onClick={handleSubmit}>
          Start Countdown
        </Button>
      </Box>
    </Container>
  );
};

export default CountdownSetup;
