// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],

//   server: {
//     host: true, // Ensures Vite runs on the correct network
//   },

//    preview: {
//     host: true,
//     allowedHosts: ['aethermind-production-413d.up.railway.app'], // Allow Railway host
//   },
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0', // Ensures Vite binds to all interfaces
    port: process.env.PORT || 5173 // 👈 Important for Railway
  },

  preview: {
    host: '0.0.0.0',  // Ensures Vite preview binds to all interfaces
    port: process.env.PORT || 5173, // 👈 Important for Railway
    allowedHosts: ['aethermind-production-413d.up.railway.app'], 
  },
})
