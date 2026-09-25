import { createContext, useContext, useState, type ReactNode } from 'react'
import { login as loginRequest, saveTokens, clearTokens, isAuthenticated } from '../api/auth'
import type { LoginCredentials } from '../types/auth'

interface AuthContextType {
  isLoggedIn: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated())

  async function login(credentials: LoginCredentials) {
    const tokens = await loginRequest(credentials)
    saveTokens(tokens)
    setIsLoggedIn(true)
  }

  function logout() {
    clearTokens()
    setIsLoggedIn(false)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}