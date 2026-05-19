import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import { DashboardSummary } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'

function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num)
}

interface StatCardProps {
  label: string
  value: string | number
  icon: string
  color: string
  subtext?: string
}

function StatCard({ label, value, icon, color, subtext }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start gap-4">
      <div className={`flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res = await api.get<DashboardSummary>('/dashboard/summary')
      return res.data
    },
  })

  if (isLoading) {
    return <LoadingSpinner size="lg" className="py-20" />
  }

  if (isError || !data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 text-center">
        Error al cargar el resumen del dashboard. Verifica que el servidor esté corriendo.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Resumen General</h2>
        <p className="text-gray-500 text-sm mt-1">Vista general del taller</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          label="Órdenes Activas"
          value={data.active_orders}
          icon="🔧"
          color="bg-blue-50"
        />
        <StatCard
          label="Motos en Reparación"
          value={data.motorcycles_in_repair}
          icon="🏍️"
          color="bg-indigo-50"
        />
        <StatCard
          label="Esp. Autorización"
          value={data.waiting_authorization_count}
          icon="⏳"
          color="bg-orange-50"
        />
        <StatCard
          label="Órdenes Completadas"
          value={data.completed_orders}
          icon="✅"
          color="bg-green-50"
        />
        <StatCard
          label="Ingresos del Día"
          value={formatCurrency(data.todays_income)}
          icon="💵"
          color="bg-emerald-50"
        />
        <StatCard
          label="Ingresos del Mes"
          value={formatCurrency(data.monthly_income)}
          icon="📈"
          color="bg-primary-50"
        />
        <StatCard
          label="Pagos Pendientes"
          value={formatCurrency(data.pending_payments_total)}
          icon="💳"
          color="bg-yellow-50"
        />
        <StatCard
          label="Piezas Bajo Stock"
          value={data.low_stock_parts}
          icon="⚠️"
          color="bg-red-50"
          subtext={data.low_stock_parts > 0 ? 'Requiere atención' : 'Stock OK'}
        />
      </div>

      {data.low_stock_parts > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <span className="text-red-500 text-xl">⚠️</span>
          <div>
            <p className="text-red-800 font-medium text-sm">
              {data.low_stock_parts} pieza{data.low_stock_parts !== 1 ? 's' : ''} con stock bajo
            </p>
            <p className="text-red-600 text-xs mt-0.5">
              Visita la sección de Piezas para revisar el inventario.
            </p>
          </div>
        </div>
      )}

      {data.waiting_authorization_count > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
          <span className="text-orange-500 text-xl">⏳</span>
          <div>
            <p className="text-orange-800 font-medium text-sm">
              {data.waiting_authorization_count} orden{data.waiting_authorization_count !== 1 ? 'es' : ''} esperando autorización del cliente
            </p>
            <p className="text-orange-600 text-xs mt-0.5">
              Revisa las órdenes de servicio para dar seguimiento.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
