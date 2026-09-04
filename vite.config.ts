import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Icons come from the manifest and from includeAssets; keeping them out
      // of globPatterns stops each one being precached twice.
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        // Everything the app needs is bundled: no runtime network calls at all.
        globPatterns: ['**/*.{js,css,html,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'PESO — Plano de Execução e Séries de treinO',
        short_name: 'PESO',
        description: 'Registro de treino. Sem cadastro, sem rede, tudo no seu aparelho.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0B0B0B',
        theme_color: '#0B0B0B',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
