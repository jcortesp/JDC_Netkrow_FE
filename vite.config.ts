import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.ts', '.tsx', '.mts', '.mjs', '.js', '.jsx', '.json'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // MUI – split material from icons to allow tree-shaking
          'vendor-mui': ['@mui/material', '@emotion/react', '@emotion/styled'],
          'vendor-mui-icons': ['@mui/icons-material'],
          // Charts & calendar
          'vendor-charts': ['recharts'],
          'vendor-calendar': [
            '@fullcalendar/react',
            '@fullcalendar/daygrid',
            '@fullcalendar/interaction',
          ],
          // Graph rendering
          'vendor-flow': ['react-flow-renderer', 'dagre'],
          // Form utilities
          'vendor-forms': ['formik', 'yup'],
        },
      },
    },
  },
});
