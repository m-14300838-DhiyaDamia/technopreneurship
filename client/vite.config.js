import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the Vite dev server proxies API and websocket traffic to the
// Node backend so the browser only talks to one origin.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 5173,
    proxy: {
      '/api': { target: process.env.VITE_DEV_API || 'http://localhost:4000', changeOrigin: true },
      '/socket.io': { target: process.env.VITE_DEV_API || 'http://localhost:4000', ws: true, changeOrigin: true },
    },
  },
  build: { outDir: 'dist', sourcemap: false, chunkSizeWarningLimit: 900 },
});
