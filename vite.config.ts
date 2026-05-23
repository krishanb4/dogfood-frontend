import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      dedupe: ['react', 'react-dom', 'three'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'three'],
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        // Proxy /auth/* to the backend so httpOnly cookies are same-origin in dev
        "/auth": {
          target:       env.VITE_BACKEND_URL ?? "http://localhost:5010",
          changeOrigin: true,
        },
      },
    },
  };
});
