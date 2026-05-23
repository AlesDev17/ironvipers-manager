import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
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
  icon: React.ReactNode
  accentColor: string
  subtext?: string
  to?: string
  toState?: object
}

function StatCard({ label, value, icon, accentColor, subtext, to, toState }: StatCardProps) {
  const inner = (
    <>
      <div className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center ${accentColor} transition-transform duration-200 group-hover:scale-105`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5 tabular-nums">{value}</p>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
      </div>
      {to && (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-600 flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      )}
    </>
  )

  if (to) {
    return (
      <Link
        to={to}
        state={toState}
        className="card p-5 flex items-start gap-4 hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
      >
        {inner}
      </Link>
    )
  }

  return (
    <div className="card p-5 flex items-start gap-4 hover:-translate-y-0.5 transition-all duration-200 group">
      {inner}
    </div>
  )
}

const iconWrench = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-300">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
  </svg>
)

const iconMoto = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-300">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
  </svg>
)

const iconClock = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-orange-300">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const iconCheck = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-300">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const iconCash = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-emerald-300">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
  </svg>
)

const iconTrend = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-300">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
)

const iconCard = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-300">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
  </svg>
)

const iconWarning = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-300">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
)

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
      <div className="alert-danger">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        Error al cargar el resumen del dashboard. Verifica que el servidor esté corriendo.
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Resumen General</h2>
        <p className="text-gray-400 text-sm mt-1">Vista general del taller</p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          label="Órdenes Activas"
          value={data.active_orders}
          icon={iconWrench}
          accentColor="bg-blue-500/10"
          to="/service-orders"
        />
        <StatCard
          label="Motos en Reparación"
          value={data.motorcycles_in_repair}
          icon={iconMoto}
          accentColor="bg-indigo-500/10"
          to="/service-orders"
          toState={{ statusFilter: 'EN_REPARACION' }}
        />
        <StatCard
          label="Esp. Autorización"
          value={data.waiting_authorization_count}
          icon={iconClock}
          accentColor="bg-orange-500/10"
          to="/service-orders"
          toState={{ statusFilter: 'ESPERANDO_AUTORIZACION' }}
        />
        <StatCard
          label="Órdenes Completadas"
          value={data.completed_orders}
          icon={iconCheck}
          accentColor="bg-green-500/10"
          to="/service-orders"
          toState={{ statusFilter: 'ENTREGADA' }}
        />
        <StatCard
          label="Ingresos del Día"
          value={formatCurrency(data.todays_income)}
          icon={iconCash}
          accentColor="bg-emerald-500/10"
          to="/service-orders"
        />
        <StatCard
          label="Ingresos del Mes"
          value={formatCurrency(data.monthly_income)}
          icon={iconTrend}
          accentColor="bg-amber-500/10"
          to="/service-orders"
        />
        <StatCard
          label="Pagos Pendientes"
          value={formatCurrency(data.pending_payments_total)}
          icon={iconCard}
          accentColor="bg-yellow-500/10"
          to="/service-orders"
        />
        <StatCard
          label="Piezas Bajo Stock"
          value={data.low_stock_parts}
          icon={iconWarning}
          accentColor="bg-red-500/10"
          subtext={data.low_stock_parts > 0 ? 'Requiere atención' : 'Stock OK'}
          to="/parts"
        />
      </div>

      {/* Alert banners */}
      {data.low_stock_parts > 0 && (
        <div className="alert-danger animate-fadeIn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p className="font-medium text-sm">
              {data.low_stock_parts} pieza{data.low_stock_parts !== 1 ? 's' : ''} con stock bajo
            </p>
            <p className="text-red-400/70 text-xs mt-0.5">
              Visita la sección de Piezas para revisar el inventario.
            </p>
          </div>
        </div>
      )}

      {data.waiting_authorization_count > 0 && (
        <div className="alert-warning animate-fadeIn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium text-sm">
              {data.waiting_authorization_count} orden{data.waiting_authorization_count !== 1 ? 'es' : ''} esperando autorización del cliente
            </p>
            <p className="text-amber-400/70 text-xs mt-0.5">
              Revisa las órdenes de servicio para dar seguimiento.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
