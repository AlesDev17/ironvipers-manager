import { NavLink } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'

interface NavItem {
  to: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/clients', label: 'Clientes', icon: '👥' },
  { to: '/motorcycles', label: 'Motocicletas', icon: '🏍️' },
  { to: '/service-orders', label: 'Órdenes de Servicio', icon: '🔧' },
  { to: '/parts', label: 'Piezas', icon: '⚙️' },
  { to: '/expenses', label: 'Gastos', icon: '💰' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="w-64 bg-gray-900 flex flex-col h-full fixed left-0 top-0 bottom-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-700">
        <span className="text-2xl">🏍️</span>
        <div>
          <div className="text-white font-bold text-lg leading-tight">Iron Vipers</div>
          <div className="text-gray-400 text-xs">Taller de Motos</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-gray-700 px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
            {user?.full_name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-gray-400 text-xs">{user?.role === 'ADMIN' ? 'Administrador' : 'Mecánico'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg text-sm transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
