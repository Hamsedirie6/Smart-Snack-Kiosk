import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// PrivateRoute skyddar alla admin-sidor.
// Om användaren inte är inloggad skickas de till /login.
// Vi sparar också den ursprungliga URL:en (location.state.from)
// så att vi kan skicka tillbaka dit efter lyckad inloggning.
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default PrivateRoute
