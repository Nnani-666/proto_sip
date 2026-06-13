import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // base must match the repository name when deploying to GitHub Pages
  // This makes built asset URLs like /proto_sip/assets/... so the site serves correctly
  base: '/proto_sip/',
  plugins: [
    react(),
    tailwindcss(),
  ],
})
