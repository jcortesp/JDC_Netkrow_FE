import { Box, Typography } from '@mui/material';

export default function Footer() {
  const textStyle = {
    fontWeight: 'bold',
    color: '#ffffff',
    WebkitTextStroke: '1px #000000',
    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 8, sm: 16 },
        right: { xs: 8, sm: 16 },
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: 999,
      }}
    >
      {/* En móvil solo muestra "Netkrow", en escritorio muestra el texto completo */}
      <Typography
        component="div"
        sx={{
          ...textStyle,
          display: { xs: 'none', sm: 'block' },
          fontSize: '0.875rem',
        }}
      >
        Powered by
      </Typography>
      <Typography
        component="div"
        sx={{
          ...textStyle,
          display: { xs: 'none', sm: 'block' },
          fontSize: '0.875rem',
        }}
      >
        NetKrow - Connecting dots
      </Typography>
      <Typography
        component="div"
        sx={{
          ...textStyle,
          display: { xs: 'block', sm: 'none' },
          fontSize: '0.7rem',
        }}
      >
        Netkrow
      </Typography>
    </Box>
  );
}
