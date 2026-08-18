import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Development server and bundler configuration.
 *
 * The API is reached through a proxy so the browser sees one origin in
 * development: the session cookie stays first-party and the WebSocket upgrade
 * carries it without a cross-origin exception.
 */
const apiTarget = process.env.PUBLIC_API_URL ?? 'http://localhost:3001';
const webPort = Number(process.env.WEB_PORT ?? 5173);

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: webPort,
    strictPort: true,
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
      '/realtime': { target: apiTarget, ws: true, changeOrigin: true },
    },
  },
  preview: {
    port: webPort + 1,
    strictPort: true,
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
    devSourcemap: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022',
  },
});
