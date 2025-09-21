import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // super important for static hosting like Vercel
  optimizeDeps: {
    include: ["axios"],
  },
  build: {
    outDir: 'dist',
  },
  server: { port: 5173 }
})
