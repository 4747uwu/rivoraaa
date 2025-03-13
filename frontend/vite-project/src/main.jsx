

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/authContext.jsx'
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProjectProvider } from './context/ProjectContext.jsx'
import { ThemeProvider } from './context/themeContext.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectionProvider } from './context/connectionContext.jsx'
import { TeamProvider } from './context/teamContext.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <QueryClientProvider client={queryClient}>

    <ThemeProvider>

    <AuthProvider>
      <ProjectProvider>
        <ConnectionProvider>
          <TeamProvider>
          <App />
          </TeamProvider>
        </ConnectionProvider>
      </ProjectProvider>
    </AuthProvider>
    </ThemeProvider> 
    </QueryClientProvider> 
  </StrictMode>,
)
