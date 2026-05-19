import { useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/clients': 'Clientes',
  '/motorcycles': 'Motocicletas',
  '/service-orders': 'Órdenes de Servicio',
  '/parts': 'Piezas',
  '/expenses': 'Gastos',
}

export default function Header() {
  const { pathname } = useLocation()
  const { user } = useAuth()

  const base = '/' + pathname.split('/')[1]
  const title = pageTitles[base] ?? 'Iron Vipers'

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-800">{user?.full_name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <div className="h-9 w-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
          {user?.full_name?.charAt(0).toUpperCase() ?? 'U'}
        </div>
      </div>
    </header>
  )
}
