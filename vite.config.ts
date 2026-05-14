import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Proxy /auth/* to the backend so httpOnly cookies are same-origin in dev
      "/auth": {
        target:       process.env.VITE_BACKEND_URL ?? "http://localhost:5010",
        changeOrigin: true,
      },
    },
  },
});
