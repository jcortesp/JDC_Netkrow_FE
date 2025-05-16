// src/components/Footer.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: 999
      }}
    >
      <Typography
        variant="body1"
        component="div"
        sx={{
          fontWeight: 'bold',
          color: '#ffffff',
          WebkitTextStroke: '1px #000000',
          textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
        }}
      >
        Powered by
      </Typography>
      <Typography
        variant="body1"
        component="div"
        sx={{
          fontWeight: 'bold',
          color: '#ffffff',
          WebkitTextStroke: '1px #000000',
          textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
        }}
      >
        NetKrow - Connecting dots
      </Typography>
    </Box>
  );
}
