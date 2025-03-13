import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '')
  console.log('PORT environment variable:', env.PORT);
  
  return {
    plugins: [react()],
    
    server: {
      host: '0.0.0.0', // Ensures Vite binds to all interfaces
      port: env.PORT ? parseInt(env.PORT) : 3000 // Using env.PORT instead of process.env.PORT
    },
    
    preview: {
      host: '0.0.0.0',  // Ensures Vite preview binds to all interfaces
      port: env.PORT ? parseInt(env.PORT) : 3000, // Using env.PORT instead of process.env.PORT
      allowedHosts: ['aethermind-production-413d.up.railway.app'], 
    },
  }
})