import {
  createContext,
  useContext,
  useState,
  useCallback,
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
    navigate('/dashboard')
  }, [navigate])

  const logout = useCallback(() => {
    clearAuth()
    setToken(null)
    setUser(null)
    navigate('/login')
  }, [navigate])

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
