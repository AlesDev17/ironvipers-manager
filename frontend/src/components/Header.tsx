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

  const initials = user?.full_name
    ?.split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() ?? 'U'

  return (
    <header className="bg-surface-800 border-b border-surface-600 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-100 leading-tight">{user?.full_name}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-surface-900 font-bold text-xs ring-2 ring-amber-500/30 flex-shrink-0">
          {initials}
        </div>
      </div>
    </header>
  )
}
