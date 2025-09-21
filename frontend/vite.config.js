import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  tailwindcss()],
  optimizeDeps: {
    include: ["axios"],
  },
  build: {
    rollupOptions: {
      external: ['axios', 'react-toastify']
    }
  },
  server: { port: 5173 }
})

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     include: ["axios"],
//   },
//   build: {
//     rollupOptions: {
//       external: [],
//     },
//   },
// });

