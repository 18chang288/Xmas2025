import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Xmas2025/', // ensures assets work on GitHub Pages
  build: {
    outDir: 'docs', // output to 'docs' folder for GitHub Pages
  },
})
