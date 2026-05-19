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
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6">
        Motocicleta no encontrada.
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition"
      >
        ← Volver
      </button>

      {/* Moto card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {motorcycle.brand} {motorcycle.model}
            </h2>
            <p className="text-gray-500 text-sm mt-1">Año {motorcycle.year}</p>
          </div>
          <Link
            to={`/service-orders`}
            state={{ prefill_motorcycle_id: id }}
            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition"
          >
            + Nueva Orden
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {client && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Cliente</p>
              <Link to={`/clients/${client.id}`} className="text-primary-600 hover:underline text-sm">
                {client.full_name}
              </Link>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Placa</p>
            <p className="text-gray-900 text-sm">{motorcycle.plate ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Color</p>
            <p className="text-gray-900 text-sm">{motorcycle.color ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Kilometraje</p>
            <p className="text-gray-900 text-sm">
              {motorcycle.km !== undefined ? motorcycle.km.toLocaleString('es-MX') + ' km' : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">VIN</p>
            <p className="text-gray-900 text-sm font-mono">{motorcycle.vin ?? '—'}</p>
          </div>
          {motorcycle.notes && (
            <div className="col-span-2 sm:col-span-3">
              <p className="text-xs text-gray-500 uppercase font-medium">Notas</p>
              <p className="text-gray-900 text-sm whitespace-pre-wrap">{motorcycle.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Service orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Historial de Órdenes</h3>
        </div>

        {loadingOrders ? (
          <LoadingSpinner size="md" className="py-8" />
        ) : serviceOrders.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            No hay órdenes de servicio para esta motocicleta.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estatus</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Entrada</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Saldo</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {serviceOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-mono text-gray-600 text-xs">
                    #{order.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {new Date(order.entry_date).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-6 py-3 text-gray-900 font-medium">
                    {formatCurrency(order.total_cost)}
                  </td>
                  <td className="px-6 py-3">
                    <span className={parseFloat(order.balance_due) > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                      {formatCurrency(order.balance_due)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      to={`/service-orders/${order.id}`}
                      className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                    >
                      Ver →
                    </Link>
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
