import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { ServiceOrder, OrderStatus, Client, Motorcycle } from '../../types'
import StatusBadge from '../../components/StatusBadge'
import ServiceOrderForm, { ServiceOrderFormData } from './ServiceOrderForm'
import LoadingSpinner from '../../components/LoadingSpinner'

const ALL_STATUSES: OrderStatus[] = [
  'RECIBIDA',
  'EN_DIAGNOSTICO',
  'ESPERANDO_AUTORIZACION',
  'AUTORIZADA',
  'EN_REPARACION',
  'ESPERANDO_PIEZAS',
  'LISTA_PARA_ENTREGA',
  'ENTREGADA',
  'CANCELADA',
]

function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num)
}

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
}

function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card max-w-2xl">
        <div className="modal-header">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-surface-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

const statusLabels: Record<string, string> = {
  ALL: 'Todos',
  RECIBIDA: 'Recibida',
  EN_DIAGNOSTICO: 'En Diagnóstico',
  ESPERANDO_AUTORIZACION: 'Esp. Autorización',
  AUTORIZADA: 'Autorizada',
  EN_REPARACION: 'En Reparación',
  ESPERANDO_PIEZAS: 'Esp. Piezas',
  LISTA_PARA_ENTREGA: 'Lista p/ Entrega',
  ENTREGADA: 'Entregada',
  CANCELADA: 'Cancelada',
}

export default function ServiceOrdersPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const prefillMotorcycleId = (location.state as { prefill_motorcycle_id?: string } | null)
    ?.prefill_motorcycle_id
  const prefillStatusFilter = (location.state as { statusFilter?: OrderStatus } | null)
    ?.statusFilter

  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>(prefillStatusFilter ?? 'ALL')
  const [showCreateModal, setShowCreateModal] = useState(!!prefillMotorcycleId)

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['service-orders'],
    queryFn: async () => {
      const res = await api.get<ServiceOrder[]>('/service-orders')
      return res.data
    },
  })

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await api.get<Client[]>('/clients')
      return res.data
    },
  })

  const { data: motorcycles = [] } = useQuery({
    queryKey: ['motorcycles'],
    queryFn: async () => {
      const res = await api.get<Motorcycle[]>('/motorcycles')
      return res.data
    },
  })

  const clientMap = new Map(clients.map((c) => [c.id, c.full_name]))
  const motoMap = new Map(motorcycles.map((m) => [m.id, `${m.brand} ${m.model}`]))

  const createMutation = useMutation({
    mutationFn: async (data: ServiceOrderFormData) => {
      const payload = {
        ...data,
        assigned_mechanic_id: data.assigned_mechanic_id || null,
        estimated_delivery_date: data.estimated_delivery_date
          ? new Date(data.estimated_delivery_date).toISOString()
          : null,
      }
      const res = await api.post<ServiceOrder>('/service-orders', payload)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['service-orders'] })
      setShowCreateModal(false)
    },
    onError: () => alert('Error al crear la orden de servicio.'),
  })

  const filtered = orders.filter((o) => statusFilter === 'ALL' || o.status === statusFilter)

  const totalCost = filtered.reduce((sum, o) => sum + parseFloat(o.total_cost), 0)
  const totalPaid = filtered.reduce((sum, o) => sum + parseFloat(o.paid_amount), 0)
  const totalDebt = filtered.reduce((sum, o) => sum + parseFloat(o.balance_due), 0)

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Filters + action */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              statusFilter === 'ALL'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-gray-400 border border-surface-600 hover:bg-surface-700 hover:text-gray-200'
            }`}
          >
            Todos ({orders.length})
          </button>
          {ALL_STATUSES.map((s) => {
            const count = orders.filter((o) => o.status === s).length
            if (count === 0) return null
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  statusFilter === s
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-gray-400 border border-surface-600 hover:bg-surface-700 hover:text-gray-200'
                }`}
              >
                {statusLabels[s]} ({count})
              </button>
            )
          })}
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva Orden
        </button>
      </div>

      {/* Financial summary */}
      {!isLoading && filtered.length > 0 && (
        <div className="card px-4 sm:px-6 py-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Total facturado</p>
            <p className="text-lg font-bold text-white tabular-nums">{formatCurrency(totalCost)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Cobrado</p>
            <p className="text-lg font-bold text-green-400 tabular-nums">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="col-span-2 sm:col-span-1 border-t border-surface-600 sm:border-t-0 sm:border-l sm:border-surface-600 pt-3 sm:pt-0 sm:pl-4">
            <p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Por cobrar</p>
            <p className={`text-lg font-bold tabular-nums ${totalDebt > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {formatCurrency(totalDebt)}
            </p>
          </div>
        </div>
      )}

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {isLoading ? (
          <LoadingSpinner size="md" className="py-12" />
        ) : filtered.length === 0 ? (
          <div className="card text-center py-16 text-gray-500">
            <p className="font-medium text-sm">No hay órdenes con ese filtro.</p>
          </div>
        ) : (
          filtered.map((order) => (
            <Link
              key={order.id}
              to={`/service-orders/${order.id}`}
              className="card p-4 flex items-center gap-3 hover:bg-surface-700/60 active:bg-surface-700 transition-colors"
            >
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-gray-500">#{order.id.slice(0, 8)}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-sm font-medium text-gray-100 truncate">
                  {clientMap.get(order.client_id) ?? '—'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {motoMap.get(order.motorcycle_id) ?? '—'} · {new Date(order.entry_date).toLocaleDateString('es-MX')}
                </p>
                <div className="flex items-center gap-3 text-xs pt-0.5">
                  <span className="text-gray-400">Total: <span className="text-gray-100 font-medium">{formatCurrency(order.total_cost)}</span></span>
                  <span className={parseFloat(order.balance_due) > 0 ? 'text-red-400 font-medium' : 'text-green-400'}>
                    Saldo: {formatCurrency(order.balance_due)}
                  </span>
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-600 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block card overflow-hidden">
        {isLoading ? (
          <LoadingSpinner size="md" className="py-12" />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto mb-3 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
            </svg>
            <p className="font-medium text-sm">No hay órdenes de servicio con ese filtro.</p>
          </div>
        ) : (
          <table className="table-dark">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Moto</th>
                <th>Estatus</th>
                <th>Entrada</th>
                <th>Total</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/service-orders/${order.id}`)}
                  className="cursor-pointer hover:bg-surface-700/50 transition-colors"
                >
                  <td className="font-mono text-gray-500 text-xs">#{order.id.slice(0, 8)}</td>
                  <td className="text-gray-300">{clientMap.get(order.client_id) ?? '—'}</td>
                  <td className="text-gray-300">{motoMap.get(order.motorcycle_id) ?? '—'}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td className="text-gray-400">{new Date(order.entry_date).toLocaleDateString('es-MX')}</td>
                  <td className="font-medium text-gray-100">{formatCurrency(order.total_cost)}</td>
                  <td>
                    <span className={parseFloat(order.balance_due) > 0 ? 'text-red-400 font-medium' : 'text-green-400'}>
                      {formatCurrency(order.balance_due)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-500">
        {filtered.length} orden{filtered.length !== 1 ? 'es' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
      </p>

      {showCreateModal && (
        <Modal title="Nueva Orden de Servicio" onClose={() => setShowCreateModal(false)}>
          <ServiceOrderForm
            prefillMotorcycleId={prefillMotorcycleId}
            onSubmit={async (data) => createMutation.mutateAsync(data)}
            onCancel={() => setShowCreateModal(false)}
            isLoading={createMutation.isPending}
          />
        </Modal>
      )}
    </div>
  )
}
