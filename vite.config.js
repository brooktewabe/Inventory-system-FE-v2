import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base:'/',
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target :process.env.BASE_URL, //'https://apiv2.cnhtc4.com',
        // target :'http://frontend', for docker compose
        changeOrigin: true,
        secure:false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
