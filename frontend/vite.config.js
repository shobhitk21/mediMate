// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(),
//   tailwindcss()],
//   server: { port: 5173 }
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    fs: {
      allow: ['..']  // ✅ allow imports from outside the frontend/ directory
    }
  },
  resolve: {
    alias: {
      // ✅ Optional alias to make admin imports cleaner
      '@admin': path.resolve(__dirname, '../admin/src')
    }
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /admin/]  // ✅ helps rollup resolve external code
    }
  }
})


