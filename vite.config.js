import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base:'/',
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target :'https://api.akbsproduction.com',
        // target :'http://frontend', for docker compose
        changeOrigin: true,
        secure:false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
