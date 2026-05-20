import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import { Motorcycle, Client, ServiceOrder } from '../../types'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'

function formatCurrency(value: string): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    parseFloat(value)
  )
}

export default function MotorcycleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: motorcycle, isLoading: loadingMoto } = useQuery({
    queryKey: ['motorcycles', id],
    queryFn: async () => {
      const res = await api.get<Motorcycle>(`/motorcycles/${id}`)
      return res.data
    },
    enabled: !!id,
  })

  const { data: client } = useQuery({
    queryKey: ['clients', motorcycle?.client_id],
    queryFn: async () => {
      const res = await api.get<Client>(`/clients/${motorcycle!.client_id}`)
      return res.data
    },
    enabled: !!motorcycle?.client_id,
  })

  const { data: serviceOrders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['service-orders', 'by-motorcycle', id],
    queryFn: async () => {
      const res = await api.get<ServiceOrder[]>(`/service-orders?motorcycle_id=${id}`)
      return res.data
    },
    enabled: !!id,
  })

  if (loadingMoto) {
    return <LoadingSpinner size="lg" className="py-20" />
  }

  if (!motorcycle) {
    return (
      <div className="alert-danger">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        Motocicleta no encontrada.
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-100 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Volver
      </button>

      {/* Moto card */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-surface-700 to-surface-800 border-b border-surface-600 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{motorcycle.brand} {motorcycle.model}</h2>
              <p className="text-gray-400 text-sm mt-0.5">Año {motorcycle.year}</p>
            </div>
          </div>
          <Link
            to="/service-orders"
            state={{ prefill_motorcycle_id: id }}
            className="btn-primary py-1.5 text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva Orden
          </Link>
        </div>

        <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-5">
          {client && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Cliente</p>
              <Link to={`/clients/${client.id}`} className="text-amber-400 hover:text-amber-300 text-sm transition-colors">
                {client.full_name}
              </Link>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Placa</p>
            <p className="text-gray-100 text-sm">{motorcycle.plate ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Color</p>
            <p className="text-gray-100 text-sm">{motorcycle.color ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Kilometraje</p>
            <p className="text-gray-100 text-sm">
              {motorcycle.km !== undefined ? motorcycle.km.toLocaleString('es-MX') + ' km' : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">VIN</p>
            <p className="text-gray-100 text-sm font-mono">{motorcycle.vin ?? '—'}</p>
          </div>
          {motorcycle.notes && (
            <div className="col-span-2 sm:col-span-3">
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Notas</p>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{motorcycle.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Service orders */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h3 className="text-base font-semibold text-white">Historial de Órdenes</h3>
        </div>

        {loadingOrders ? (
          <LoadingSpinner size="md" className="py-8" />
        ) : serviceOrders.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            No hay órdenes de servicio para esta motocicleta.
          </div>
        ) : (
          <table className="table-dark">
            <thead>
              <tr>
                <th>ID</th>
                <th>Estatus</th>
                <th>Entrada</th>
                <th>Total</th>
                <th>Saldo</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {serviceOrders.map((order) => (
                <tr key={order.id}>
                  <td className="font-mono text-gray-500 text-xs">#{order.id.slice(0, 8)}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td className="text-gray-400">{new Date(order.entry_date).toLocaleDateString('es-MX')}</td>
                  <td className="text-gray-100 font-medium">{formatCurrency(order.total_cost)}</td>
                  <td>
                    <span className={parseFloat(order.balance_due) > 0 ? 'text-red-400 font-medium' : 'text-green-400'}>
                      {formatCurrency(order.balance_due)}
                    </span>
                  </td>
                  <td className="text-right">
                    <Link to={`/service-orders/${order.id}`} className="text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors">Ver →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
