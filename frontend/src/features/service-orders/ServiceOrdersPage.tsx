import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation } from 'react-router-dom'
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

function formatCurrency(value: string): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    parseFloat(value)
  )
}

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
}

function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ×
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export default function ServiceOrdersPage() {
  const qc = useQueryClient()
  const location = useLocation()
  const prefillMotorcycleId = (location.state as { prefill_motorcycle_id?: string } | null)
    ?.prefill_motorcycle_id

  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL')
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
      const res = await api.post<ServiceOrder>('/service-orders', data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['service-orders'] })
      setShowCreateModal(false)
    },
    onError: () => alert('Error al crear la orden de servicio.'),
  })

  const filtered = orders.filter((o) => statusFilter === 'ALL' || o.status === statusFilter)

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

  return (
    <div className="space-y-5">
      {/* Filters + action */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'ALL')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option value="ALL">Todos los estatus</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition whitespace-nowrap"
        >
          + Nueva Orden
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner size="md" className="py-12" />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No hay órdenes de servicio con ese filtro.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Moto</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estatus</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Entrada</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Saldo</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((order, idx) => (
                <tr key={order.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-6 py-3 font-mono text-gray-500 text-xs">
                    #{order.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-3 text-gray-700">
                    {clientMap.get(order.client_id) ?? '—'}
                  </td>
                  <td className="px-6 py-3 text-gray-700">
                    {motoMap.get(order.motorcycle_id) ?? '—'}
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {new Date(order.entry_date).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {formatCurrency(order.total_cost)}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={
                        parseFloat(order.balance_due) > 0
                          ? 'text-red-600 font-medium'
                          : 'text-green-600'
                      }
                    >
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

      <p className="text-xs text-gray-400">
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
