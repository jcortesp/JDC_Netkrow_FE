// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'jwt-decode': path.resolve(__dirname, 'node_modules/jwt-decode/build/jwt-decode.esm.js'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',  // Cambiado a 127.0.0.1 en vez de localhost
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
