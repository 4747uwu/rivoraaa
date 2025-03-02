import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: true, // Ensures Vite runs on the correct network
  },

   preview: {
    host: true,
    allowedHosts: ['aethermind-production-413d.up.railway.app'], // Allow Railway host
  },
})
