import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login as loginRequest } from '../api/adminApi'
import '../admin.css'

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Om användaren försökte nå en skyddad sida, skicka dem tillbaka dit efter login
  const redirectTo = location.state?.from?.pathname || '/admin/dashboard'

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    try {
      const response = await loginRequest({ username, password })
      login(response.data.token, response.data.username)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      // Skriv aldrig ut vilket fält som är fel – det är säkerhetspraxis
      if (error.response?.status === 401) {
        setErrorMessage('Felaktigt användarnamn eller lösenord.')
      } else {
        setErrorMessage('Något gick fel. Försök igen.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand__logo">🛒</div>
          <h1 className="login-brand__title">SmartSnack Kiosk</h1>
          <p className="login-brand__subtitle">Admin-portal – logga in för att fortsätta</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {errorMessage && (
            <div className="error-banner" role="alert">
              {errorMessage}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Användarnamn
            </label>
            <input
              id="username"
              className={`form-input${errorMessage ? ' is-error' : ''}`}
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setErrorMessage('')
              }}
              autoComplete="username"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Lösenord
            </label>
            <input
              id="password"
              className={`form-input${errorMessage ? ' is-error' : ''}`}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setErrorMessage('')
              }}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={isLoading || !username || !password}
          >
            {isLoading ? 'Loggar in…' : 'Logga in'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
