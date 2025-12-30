import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // CRITICAL FIX: Base must be set to './' for GitHub Pages to work
  // This forces assets to load relatively (e.g., "./assets/index.js")
  base: './',
})
