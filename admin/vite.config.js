// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss(),],
//   server: { port: 5174 }
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    fs: {
      allow: ['..'] // allow accessing parent folders if needed
    }
  },
  resolve: {
    alias: {
      '@admin': path.resolve(__dirname, '../admin/src')
    }
  },
  optimizeDeps: {
    include: ['axios']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /admin/]
    },
    rollupOptions: {
      external: [] // add packages here if Netlify build complains about them
    },
    outDir: 'dist', // default build output folder for Netlify
    sourcemap: false
  }
})

