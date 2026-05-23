import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
  createElement,
} from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { storeAuth, clearAuth, getStoredUser, getStoredToken } from '../../lib/auth'
import { User, AuthResponse } from '../../types'

interface AuthContextValue {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(getStoredUser)
  const [token, setToken] = useState<string | null>(getStoredToken)
  const navigate = useNavigate()

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password })

    const { access_token, user: authUser } = response.data
    storeAuth(access_token, authUser)
    setToken(access_token)
    setUser(authUser)
    navigate(authUser.role === 'SUPERADMIN' ? '/superadmin/tenants' : '/dashboard')
  }, [navigate])

  const logout = useCallback(() => {
    clearAuth()
    setToken(null)
    setUser(null)
    navigate('/login')
  }, [navigate])

  // Poll /auth/me every 30s to detect deleted/deactivated accounts.
  // The 401 interceptor in api.ts handles the redirect to /login automatically.
  useEffect(() => {
    if (!token) return
    const id = setInterval(() => {
      api.get('/auth/me').catch(() => {})
    }, 30_000)
    return () => clearInterval(id)
  }, [token])

  const value: AuthContextValue = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
  }

  return createElement(AuthContext.Provider, { value }, children)
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
