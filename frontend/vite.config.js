import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Vite automatically loads environment variables from:
// - .env
// - .env.local
// - .env.[mode]
// - .env.[mode].local
// Variables prefixed with VITE_ are exposed to the client
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
})
