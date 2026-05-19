import { User } from '../types'

export function getStoredUser(): User | null {
  const raw = localStorage.getItem('user')
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem('access_token')
}

export function storeAuth(token: string, user: User) {
  localStorage.setItem('access_token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('user')
}

export function isAuthenticated(): boolean {
  return !!getStoredToken()
}
