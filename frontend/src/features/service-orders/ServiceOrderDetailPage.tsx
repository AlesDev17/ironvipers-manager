import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../../lib/api'
import {
  ServiceOrder,
  OrderStatus,
  Client,
  Motorcycle,
  User,
  Payment,
  PaymentMethod,
  Part,
  ServiceOrderPart,
  Photo,
} from '../../types'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'

function formatCurrency(value: string): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    parseFloat(value)
  )
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Status transition map
const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  RECIBIDA: ['EN_DIAGNOSTICO', 'CANCELADA'],
  EN_DIAGNOSTICO: ['ESPERANDO_AUTORIZACION', 'CANCELADA'],
  ESPERANDO_AUTORIZACION: ['AUTORIZADA', 'CANCELADA'],
  AUTORIZADA: ['EN_REPARACION'],
  EN_REPARACION: ['ESPERANDO_PIEZAS', 'LISTA_PARA_ENTREGA'],
  ESPERANDO_PIEZAS: ['EN_REPARACION'],
  LISTA_PARA_ENTREGA: ['ENTREGADA'],
}

const STATUS_LABELS: Record<OrderStatus, string> = {
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

const PAYMENT_METHODS: PaymentMethod[] = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'MIXTO']

// Payment form schema
const paymentSchema = z.object({
  amount: z.coerce.number().positive('El monto debe ser positivo'),
  payment_method: z.enum(['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'MIXTO']),
  payment_date: z.string().min(1, 'La fecha es requerida'),
  notes: z.string().optional(),
})
type PaymentFormData = z.infer<typeof paymentSchema>

// Order text fields schema
const orderTextSchema = z.object({
  diagnosis: z.string().optional(),
  work_performed: z.string().optional(),
  labor_cost: z.coerce.number().min(0),
})
type OrderTextFormData = z.infer<typeof orderTextSchema>

// Part usage schema
const partUsageSchema = z.object({
  part_id: z.string().min(1, 'Selecciona una pieza'),
  quantity: z.coerce.number().int().positive('La cantidad debe ser positiva'),
})
type PartUsageFormData = z.infer<typeof partUsageSchema>

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

export default function ServiceOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showPartForm, setShowPartForm] = useState(false)

  const { data: order, isLoading: loadingOrder } = useQuery({
    queryKey: ['service-orders', id],
    queryFn: async () => {
      const res = await api.get<ServiceOrder>(`/service-orders/${id}`)
      return res.data
    },
    enabled: !!id,
  })

  const { data: client } = useQuery({
    queryKey: ['clients', order?.client_id],
    queryFn: async () => {
      const res = await api.get<Client>(`/clients/${order!.client_id}`)
      return res.data
    },
    enabled: !!order?.client_id,
  })

  const { data: motorcycle } = useQuery({
    queryKey: ['motorcycles', order?.motorcycle_id],
    queryFn: async () => {
      const res = await api.get<Motorcycle>(`/motorcycles/${order!.motorcycle_id}`)
      return res.data
    },
    enabled: !!order?.motorcycle_id,
  })

  const { data: mechanic } = useQuery({
    queryKey: ['users', order?.assigned_mechanic_id],
    queryFn: async () => {
      const res = await api.get<User>(`/users/${order!.assigned_mechanic_id}`)
      return res.data
    },
    enabled: !!order?.assigned_mechanic_id,
  })

  const { data: payments = [] } = useQuery({
    queryKey: ['payments', 'by-order', id],
    queryFn: async () => {
      const res = await api.get<Payment[]>(`/service-orders/${id}/payments`)
      return res.data
    },
    enabled: !!id,
  })

  const { data: orderParts = [] } = useQuery({
    queryKey: ['order-parts', id],
    queryFn: async () => {
      const res = await api.get<ServiceOrderPart[]>(`/service-orders/${id}/parts`)
      return res.data
    },
    enabled: !!id,
  })

  const { data: photos = [] } = useQuery({
    queryKey: ['photos', id],
    queryFn: async () => {
      const res = await api.get<Photo[]>(`/service-orders/${id}/photos`)
      return res.data
    },
    enabled: !!id,
  })

  const { data: allParts = [] } = useQuery({
    queryKey: ['parts'],
    queryFn: async () => {
      const res = await api.get<Part[]>('/parts')
      return res.data
    },
  })

  // Status change mutation
  const statusMutation = useMutation({
    mutationFn: async (newStatus: OrderStatus) => {
      const res = await api.patch<ServiceOrder>(`/service-orders/${id}/status`, {
        status: newStatus,
      })
      return res.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-orders', id] }),
    onError: () => alert('Error al cambiar el estatus.'),
  })

  // Update text fields mutation
  const updateTextMutation = useMutation({
    mutationFn: async (data: OrderTextFormData) => {
      const res = await api.put<ServiceOrder>(`/service-orders/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['service-orders', id] })
      alert('Orden actualizada correctamente.')
    },
    onError: () => alert('Error al actualizar la orden.'),
  })

  // Payment mutation
  const addPaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      const res = await api.post<Payment>(`/service-orders/${id}/payments`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments', 'by-order', id] })
      qc.invalidateQueries({ queryKey: ['service-orders', id] })
      setShowPaymentForm(false)
    },
    onError: () => alert('Error al registrar el pago.'),
  })

  // Part usage mutation
  const addPartMutation = useMutation({
    mutationFn: async (data: PartUsageFormData) => {
      const res = await api.post<ServiceOrderPart>(`/service-orders/${id}/parts`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order-parts', id] })
      qc.invalidateQueries({ queryKey: ['service-orders', id] })
      setShowPartForm(false)
    },
    onError: () => alert('Error al agregar la pieza.'),
  })

  // Order text form
  const textForm = useForm<OrderTextFormData>({
    resolver: zodResolver(orderTextSchema),
    values: {
      diagnosis: order?.diagnosis ?? '',
      work_performed: order?.work_performed ?? '',
      labor_cost: order ? parseFloat(order.labor_cost) : 0,
    },
  })

  // Payment form
  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      payment_method: 'EFECTIVO',
      payment_date: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  })

  // Part form
  const partForm = useForm<PartUsageFormData>({
    resolver: zodResolver(partUsageSchema),
    defaultValues: {
      part_id: '',
      quantity: 1,
    },
  })

  if (loadingOrder) {
    return <LoadingSpinner size="lg" className="py-20" />
  }

  if (!order) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6">
        Orden de servicio no encontrada.
      </div>
    )
  }

  const nextStatuses = NEXT_STATUSES[order.status] ?? []

  return (
    <div className="space-y-6 max-w-5xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Volver
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900 font-mono">
                Orden #{order.id.slice(0, 8).toUpperCase()}
              </h2>
              <StatusBadge status={order.status} />
            </div>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Cliente</p>
                {client ? (
                  <Link to={`/clients/${client.id}`} className="text-primary-600 hover:underline">
                    {client.full_name}
                  </Link>
                ) : (
                  <p className="text-gray-700">—</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Motocicleta</p>
                {motorcycle ? (
                  <Link to={`/motorcycles/${motorcycle.id}`} className="text-primary-600 hover:underline">
                    {motorcycle.brand} {motorcycle.model} {motorcycle.year}
                  </Link>
                ) : (
                  <p className="text-gray-700">—</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Mecánico</p>
                <p className="text-gray-700">{mechanic?.full_name ?? 'Sin asignar'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Entrada</p>
                <p className="text-gray-700">{formatDate(order.entry_date)}</p>
              </div>
              {order.estimated_delivery_date && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Entrega estimada</p>
                  <p className="text-gray-700">{formatDate(order.estimated_delivery_date)}</p>
                </div>
              )}
              {order.closed_at && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Cerrada</p>
                  <p className="text-gray-700">{formatDate(order.closed_at)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status transitions */}
          {nextStatuses.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-500 font-medium uppercase">Cambiar a</p>
              {nextStatuses.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    if (confirm(`¿Cambiar estatus a "${STATUS_LABELS[s]}"?`)) {
                      statusMutation.mutate(s)
                    }
                  }}
                  disabled={statusMutation.isPending}
                  className="px-3 py-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-700 text-white rounded-lg disabled:opacity-50 transition"
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Problem description */}
      {order.problem_description && (
        <SectionCard title="Problema Reportado">
          <p className="text-gray-700 whitespace-pre-wrap">{order.problem_description}</p>
        </SectionCard>
      )}

      {/* Editable fields: diagnosis, work_performed, labor_cost */}
      <SectionCard title="Diagnóstico y Trabajos Realizados">
        <form onSubmit={textForm.handleSubmit((d) => updateTextMutation.mutateAsync(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico</label>
            <textarea
              {...textForm.register('diagnosis')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
              placeholder="Describe el diagnóstico..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trabajos realizados
            </label>
            <textarea
              {...textForm.register('work_performed')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
              placeholder="Describe los trabajos realizados..."
            />
          </div>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo de mano de obra ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...textForm.register('labor_cost')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={updateTextMutation.isPending}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg disabled:opacity-60"
            >
              {updateTextMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Parts used */}
      <SectionCard title="Piezas Utilizadas">
        <div className="space-y-4">
          {orderParts.length === 0 ? (
            <p className="text-sm text-gray-500">No hay piezas registradas para esta orden.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Pieza</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Cantidad</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">P. Unitario</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orderParts.map((op) => (
                  <tr key={op.id}>
                    <td className="px-4 py-2 text-gray-800">{op.part?.name ?? op.part_id}</td>
                    <td className="px-4 py-2 text-gray-600 text-right">{op.quantity}</td>
                    <td className="px-4 py-2 text-gray-600 text-right">
                      {formatCurrency(op.unit_price)}
                    </td>
                    <td className="px-4 py-2 text-gray-900 font-medium text-right">
                      {formatCurrency(op.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!showPartForm ? (
            <button
              onClick={() => setShowPartForm(true)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              + Agregar pieza
            </button>
          ) : (
            <form
              onSubmit={partForm.handleSubmit((d) => addPartMutation.mutateAsync(d))}
              className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Pieza</label>
                  <select
                    {...partForm.register('part_id')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Selecciona...</option>
                    {allParts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (stock: {p.stock_quantity})
                      </option>
                    ))}
                  </select>
                  {partForm.formState.errors.part_id && (
                    <p className="text-xs text-red-600 mt-0.5">
                      {partForm.formState.errors.part_id.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    {...partForm.register('quantity')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={addPartMutation.isPending}
                  className="px-3 py-1.5 text-xs font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-60"
                >
                  Agregar
                </button>
                <button
                  type="button"
                  onClick={() => setShowPartForm(false)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 bg-white rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </SectionCard>

      {/* Payments */}
      <SectionCard title="Pagos">
        <div className="space-y-4">
          {payments.length === 0 ? (
            <p className="text-sm text-gray-500">No hay pagos registrados.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Fecha</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Método</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Monto</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2 text-gray-600">
                      {new Date(p.payment_date).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-4 py-2 text-gray-600">{p.payment_method}</td>
                    <td className="px-4 py-2 text-gray-900 font-medium text-right">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-4 py-2 text-gray-500 text-xs">{p.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!showPaymentForm ? (
            <button
              onClick={() => setShowPaymentForm(true)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              + Registrar pago
            </button>
          ) : (
            <form
              onSubmit={paymentForm.handleSubmit((d) => addPaymentMutation.mutateAsync(d))}
              className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Monto ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    {...paymentForm.register('amount')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {paymentForm.formState.errors.amount && (
                    <p className="text-xs text-red-600 mt-0.5">
                      {paymentForm.formState.errors.amount.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Método</label>
                  <select
                    {...paymentForm.register('payment_method')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    {...paymentForm.register('payment_date')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Notas</label>
                  <input
                    type="text"
                    {...paymentForm.register('notes')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={addPaymentMutation.isPending}
                  className="px-3 py-1.5 text-xs font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-60"
                >
                  Registrar
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 bg-white rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </SectionCard>

      {/* Photos */}
      {photos.length > 0 && (
        <SectionCard title="Fotos">
          <div className="space-y-2">
            {photos.map((photo) => (
              <div key={photo.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded uppercase">
                  {photo.photo_type}
                </span>
                <a
                  href={photo.photo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:underline truncate flex-1"
                >
                  {photo.description ?? photo.photo_url}
                </a>
                <span className="text-xs text-gray-400">
                  {new Date(photo.created_at).toLocaleDateString('es-MX')}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Cost summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Resumen de Costos</h3>
        <div className="space-y-2 max-w-xs ml-auto">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Mano de obra</span>
            <span className="font-medium">{formatCurrency(order.labor_cost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Piezas</span>
            <span className="font-medium">{formatCurrency(order.parts_cost)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2 mt-2">
            <span>Total</span>
            <span>{formatCurrency(order.total_cost)}</span>
          </div>
          <div className="flex justify-between text-sm text-green-700">
            <span>Pagado</span>
            <span className="font-medium">{formatCurrency(order.paid_amount)}</span>
          </div>
          <div
            className={`flex justify-between text-sm font-bold ${
              parseFloat(order.balance_due) > 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            <span>Saldo pendiente</span>
            <span>{formatCurrency(order.balance_due)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
