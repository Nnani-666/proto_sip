import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Note: Replace 'safe_route' below with your actual GitHub repository name
export default defineConfig({
  base: '/safe_tour_sip_final/',
  plugins: [
    react(),
    tailwindcss(),
  ],
})
