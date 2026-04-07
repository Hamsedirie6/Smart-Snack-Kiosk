import { createContext, useContext, useState } from 'react'

// AuthContext delar inloggningsstatus, token och username med hela appen.
// Alternativet – att skicka token som prop genom varje komponent –
// kallas "prop drilling" och är ett klassiskt problem i React.
// Med Context kan vilken komponent som helst hämta token direkt via useAuth().

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Läs token från localStorage vid uppstart så att inloggning överlever sidomladdning
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [username, setUsername] = useState(
    () => localStorage.getItem('username') || '',
  )

  function login(newToken, newUsername) {
    localStorage.setItem('token', newToken)
    localStorage.setItem('username', newUsername)
    setToken(newToken)
    setUsername(newUsername)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setToken(null)
    setUsername('')
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hjälphook: useAuth() istället för useContext(AuthContext) överallt.
// Ger ett tydligt felmeddelande om du glömt att wrappa med AuthProvider.
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth() måste användas inuti <AuthProvider>')
  }
  return context
}
