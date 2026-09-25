import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/graph': 'http://localhost:8000',
      '/map': 'http://localhost:8000',
      '/session': 'http://localhost:8000'
    }
  }
})
