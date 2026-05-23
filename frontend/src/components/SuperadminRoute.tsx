import { Navigate, Outlet } from 'react-router-dom'
import { getStoredUser } from '../lib/auth'

export default function SuperadminRoute() {
  const user = getStoredUser()
  if (user?.role !== 'SUPERADMIN') {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}
