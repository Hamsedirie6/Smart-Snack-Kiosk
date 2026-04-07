import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

// AuthProvider måste wrappa hela appen så att useAuth()
// är tillgänglig i alla komponenter – inklusive PrivateRoute och AdminLayout.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
