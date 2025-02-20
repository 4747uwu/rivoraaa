import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/authContext.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Project from '../../../backend/models/Project.js'
import { ProjectProvider } from './context/ProjectContext.jsx'
import { ThemeProvider } from './context/themeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <ThemeProvider>

    <AuthProvider>
      <ProjectProvider>
          <App />
      </ProjectProvider>
    </AuthProvider>
    </ThemeProvider>  
  </StrictMode>,
)
