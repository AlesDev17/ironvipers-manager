import { useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/clients': 'Clientes',
  '/motorcycles': 'Motocicletas',
  '/service-orders': 'Órdenes de Servicio',
  '/parts': 'Piezas',
  '/expenses': 'Gastos',
  '/superadmin': 'Talleres',
}

interface HeaderProps {
  onMenuToggle: () => void
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { pathname } = useLocation()
  const { user } = useAuth()

  const base = '/' + pathname.split('/')[1]
  const title = pageTitles[base] ?? user?.tenant_name ?? 'Iron Vipers'

  const initials = user?.full_name
    ?.split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() ?? 'U'

  return (
    <header className="bg-surface-800 border-b border-surface-600 px-4 md:px-6 py-3.5 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-surface-700 transition-colors"
          aria-label="Abrir menú"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
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
