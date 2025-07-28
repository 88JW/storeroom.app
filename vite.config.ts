import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg}']
    },
    manifest: {
      name: 'Storeroom App - Zarządzanie Spiżarnią',
      short_name: 'Storeroom',
      description: 'Inteligentna aplikacja do zarządzania spiżarnią z skanerem kodów kreskowych',
      theme_color: '#1993e5',
      background_color: '#ffffff',
      display: 'standalone',
      scope: '/',
      start_url: '/',
      orientation: 'portrait-primary',
      categories: ['productivity', 'lifestyle', 'food'],
      lang: 'pl',
      icons: [
        {
          src: '/icons/icon-96x96.png',
          sizes: '96x96',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icons/icon-144x144.png',
          sizes: '144x144',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/icons/icon-256x256.png',
          sizes: '256x256',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable any'
        }
      ],
      shortcuts: [
        {
          name: 'Skanuj produkt',
          short_name: 'Skanuj',
          description: 'Szybko dodaj produkt skanując kod kreskowy',
          url: '/dodaj?scanner=true',
          icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }]
        },
        {
          name: 'Lista produktów',
          short_name: 'Lista',
          description: 'Zobacz wszystkie produkty w spiżarni',
          url: '/lista',
          icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }]
        }
      ]
    }
  })],
})
