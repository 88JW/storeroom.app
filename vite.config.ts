import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // Całkowicie usuwamy VitePWA w development
  define: {
    // Dodaj obsługę process.env dla kompatybilności z React Apps
    'process.env': {}
  }
})
