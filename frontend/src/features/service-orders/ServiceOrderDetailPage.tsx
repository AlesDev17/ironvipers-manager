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

const ALL_STATUSES_ORDERED: OrderStatus[] = [
  'RECIBIDA',
  'EN_DIAGNOSTICO',
  'ESPERANDO_AUTORIZACION',
  'AUTORIZADA',
  'EN_REPARACION',
  'ESPERANDO_PIEZAS',
  'LISTA_PARA_ENTREGA',
  'ENTREGADA',
]

const PAYMENT_METHODS: PaymentMethod[] = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'MIXTO']

const paymentSchema = z.object({
  amount: z.coerce.number().positive('El monto debe ser positivo'),
  payment_method: z.enum(['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'MIXTO']),
  payment_date: z.string().min(1, 'La fecha es requerida'),
  notes: z.string().optional(),
})
type PaymentFormData = z.infer<typeof paymentSchema>

const orderTextSchema = z.object({
  diagnosis: z.string().optional(),
  work_performed: z.string().optional(),
  labor_cost: z.coerce.number().min(0),
})
type OrderTextFormData = z.infer<typeof orderTextSchema>

const partUsageSchema = z.object({
  part_id: z.string().min(1, 'Selecciona una pieza'),
  quantity: z.coerce.number().int().positive('La cantidad debe ser positiva'),
})
type PartUsageFormData = z.infer<typeof partUsageSchema>

function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="card overflow-hidden">
      <div className="card-header flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

// Status Stepper
function StatusStepper({ current }: { current: OrderStatus }) {
  const steps = ALL_STATUSES_ORDERED
  const currentIdx = steps.indexOf(current)
  const isCancelled = current === 'CANCELADA'

  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-2">
      {steps.map((step, idx) => {
        const isDone = !isCancelled && idx < currentIdx
        const isActive = !isCancelled && idx === currentIdx

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  isDone
                    ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                    : isActive
                    ? 'bg-amber-500 border-2 border-amber-400 text-surface-900 shadow-lg shadow-amber-500/30'
                    : 'bg-surface-700 border-2 border-surface-600 text-gray-500'
                }`}
              >
                {isDone ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`text-xs mt-1 whitespace-nowrap font-medium ${
                  isDone ? 'text-green-400' : isActive ? 'text-amber-400' : 'text-gray-600'
                }`}
              >
                {STATUS_LABELS[step]}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`h-0.5 w-8 sm:w-12 flex-shrink-0 mx-1 mb-5 rounded-full transition-all ${
                  isDone ? 'bg-green-500/50' : 'bg-surface-600'
                }`}
              />
            )}
          </div>
        )
      })}
      {isCancelled && (
        <div className="ml-4 px-2.5 py-1 bg-gray-500/10 border border-gray-500/20 rounded-full text-xs font-medium text-gray-400">
          Cancelada
        </div>
      )}
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

  const statusMutation = useMutation({
    mutationFn: async (newStatus: OrderStatus) => {
      const res = await api.patch<ServiceOrder>(`/service-orders/${id}/status`, { status: newStatus })
      return res.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-orders', id] }),
    onError: () => alert('Error al cambiar el estatus.'),
  })

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

  const textForm = useForm<OrderTextFormData>({
    resolver: zodResolver(orderTextSchema),
    values: {
      diagnosis: order?.diagnosis ?? '',
      work_performed: order?.work_performed ?? '',
      labor_cost: order ? parseFloat(order.labor_cost) : 0,
    },
  })

  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      payment_method: 'EFECTIVO',
      payment_date: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  })

  const partForm = useForm<PartUsageFormData>({
    resolver: zodResolver(partUsageSchema),
    defaultValues: { part_id: '', quantity: 1 },
  })

  if (loadingOrder) {
    return <LoadingSpinner size="lg" className="py-20" />
  }

  if (!order) {
    return (
      <div className="alert-danger">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        Orden de servicio no encontrada.
      </div>
    )
  }

  const nextStatuses = NEXT_STATUSES[order.status] ?? []
  const balanceDue = parseFloat(order.balance_due)

  return (
    <div className="space-y-6 max-w-5xl animate-fadeIn">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-100 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Volver
      </button>

      {/* Header card */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-surface-700 to-surface-800 border-b border-surface-600">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-white font-mono">
                  Orden #{order.id.slice(0, 8).toUpperCase()}
                </h2>
                <StatusBadge status={order.status} />
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Cliente</p>
                  {client ? (
                    <Link to={`/clients/${client.id}`} className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
                      {client.full_name}
                    </Link>
                  ) : (
                    <p className="text-gray-400">—</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Motocicleta</p>
                  {motorcycle ? (
                    <Link to={`/motorcycles/${motorcycle.id}`} className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
                      {motorcycle.brand} {motorcycle.model} {motorcycle.year}
                    </Link>
                  ) : (
                    <p className="text-gray-400">—</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Mecánico</p>
                  <p className="text-gray-100">{mechanic?.full_name ?? 'Sin asignar'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Entrada</p>
                  <p className="text-gray-100">{formatDate(order.entry_date)}</p>
                </div>
                {order.estimated_delivery_date && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Entrega estimada</p>
                    <p className="text-gray-100">{formatDate(order.estimated_delivery_date)}</p>
                  </div>
                )}
                {order.closed_at && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Cerrada</p>
                    <p className="text-gray-100">{formatDate(order.closed_at)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status transitions */}
            {nextStatuses.length > 0 && (
              <div className="flex flex-col gap-2 flex-shrink-0">
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
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg disabled:opacity-50 transition-all ${
                      s === 'CANCELADA'
                        ? 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'
                        : 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status stepper */}
        <div className="px-6 py-4 overflow-x-auto">
          <StatusStepper current={order.status} />
        </div>
      </div>

      {/* Problem description */}
      {order.problem_description && (
        <SectionCard title="Problema Reportado">
          <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{order.problem_description}</p>
        </SectionCard>
      )}

      {/* Diagnosis + work + labor cost */}
      <SectionCard title="Diagnóstico y Trabajos Realizados">
        <form onSubmit={textForm.handleSubmit((d) => updateTextMutation.mutateAsync(d))} className="space-y-4">
          <div>
            <label className="label-dark">Diagnóstico</label>
            <textarea
              {...textForm.register('diagnosis')}
              rows={3}
              className="textarea-dark"
              placeholder="Describe el diagnóstico..."
            />
          </div>
          <div>
            <label className="label-dark">Trabajos realizados</label>
            <textarea
              {...textForm.register('work_performed')}
              rows={3}
              className="textarea-dark"
              placeholder="Describe los trabajos realizados..."
            />
          </div>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="label-dark">Costo de mano de obra ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...textForm.register('labor_cost')}
                className="input-dark"
              />
            </div>
            <button
              type="submit"
              disabled={updateTextMutation.isPending}
              className="btn-primary flex-shrink-0"
            >
              {updateTextMutation.isPending ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-surface-900/30 border-t-surface-900 rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
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
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Pieza</th>
                  <th className="text-right">Cantidad</th>
                  <th className="text-right">P. Unitario</th>
                  <th className="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {orderParts.map((op) => (
                  <tr key={op.id}>
                    <td className="text-gray-100">{op.part?.name ?? op.part_id}</td>
                    <td className="text-gray-400 text-right">{op.quantity}</td>
                    <td className="text-gray-400 text-right">{formatCurrency(op.unit_price)}</td>
                    <td className="text-gray-100 font-medium text-right">{formatCurrency(op.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!showPartForm ? (
            <button
              onClick={() => setShowPartForm(true)}
              className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Agregar pieza
            </button>
          ) : (
            <form
              onSubmit={partForm.handleSubmit((d) => addPartMutation.mutateAsync(d))}
              className="border border-surface-600 rounded-xl p-4 space-y-3 bg-surface-700/40"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-dark text-xs">Pieza</label>
                  <select {...partForm.register('part_id')} className="select-dark">
                    <option value="">Selecciona...</option>
                    {allParts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (stock: {p.stock_quantity})
                      </option>
                    ))}
                  </select>
                  {partForm.formState.errors.part_id && (
                    <p className="alert-error-field">{partForm.formState.errors.part_id.message}</p>
                  )}
                </div>
                <div>
                  <label className="label-dark text-xs">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    {...partForm.register('quantity')}
                    className="input-dark"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={addPartMutation.isPending} className="btn-primary py-1.5 text-xs">
                  Agregar
                </button>
                <button type="button" onClick={() => setShowPartForm(false)} className="btn-secondary py-1.5 text-xs">
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
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Método</th>
                  <th className="text-right">Monto</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="text-gray-400">{new Date(p.payment_date).toLocaleDateString('es-MX')}</td>
                    <td>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-700 text-gray-300 border border-surface-600">
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="text-gray-100 font-medium text-right">{formatCurrency(p.amount)}</td>
                    <td className="text-gray-500 text-xs">{p.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!showPaymentForm ? (
            <button
              onClick={() => setShowPaymentForm(true)}
              className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Registrar pago
            </button>
          ) : (
            <form
              onSubmit={paymentForm.handleSubmit((d) => addPaymentMutation.mutateAsync(d))}
              className="border border-surface-600 rounded-xl p-4 space-y-3 bg-surface-700/40"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-dark text-xs">Monto ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    {...paymentForm.register('amount')}
                    className="input-dark"
                  />
                  {paymentForm.formState.errors.amount && (
                    <p className="alert-error-field">{paymentForm.formState.errors.amount.message}</p>
                  )}
                </div>
                <div>
                  <label className="label-dark text-xs">Método</label>
                  <select {...paymentForm.register('payment_method')} className="select-dark">
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-dark text-xs">Fecha</label>
                  <input type="date" {...paymentForm.register('payment_date')} className="input-dark" />
                </div>
                <div>
                  <label className="label-dark text-xs">Notas</label>
                  <input type="text" {...paymentForm.register('notes')} className="input-dark" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={addPaymentMutation.isPending} className="btn-primary py-1.5 text-xs">
                  Registrar
                </button>
                <button type="button" onClick={() => setShowPaymentForm(false)} className="btn-secondary py-1.5 text-xs">
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
              <div key={photo.id} className="flex items-center gap-3 py-2 border-b border-surface-700 last:border-0">
                <span className="text-xs text-gray-500 bg-surface-700 border border-surface-600 px-2 py-0.5 rounded uppercase font-mono">
                  {photo.photo_type}
                </span>
                <a
                  href={photo.photo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-amber-400 hover:text-amber-300 transition-colors truncate flex-1"
                >
                  {photo.description ?? photo.photo_url}
                </a>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {new Date(photo.created_at).toLocaleDateString('es-MX')}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Cost summary */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-white mb-5">Resumen de Costos</h3>
        <div className="space-y-2.5 max-w-xs ml-auto">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Mano de obra</span>
            <span className="text-gray-100 font-medium tabular-nums">{formatCurrency(order.labor_cost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Piezas</span>
            <span className="text-gray-100 font-medium tabular-nums">{formatCurrency(order.parts_cost)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t border-surface-600 pt-2.5 mt-2.5">
            <span className="text-gray-100">Total</span>
            <span className="text-white tabular-nums">{formatCurrency(order.total_cost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-green-400">Pagado</span>
            <span className="text-green-400 font-medium tabular-nums">{formatCurrency(order.paid_amount)}</span>
          </div>
          <div className={`flex justify-between text-sm font-bold pt-2 border-t ${balanceDue > 0 ? 'border-red-500/20' : 'border-green-500/20'}`}>
            <span className={balanceDue > 0 ? 'text-red-400' : 'text-green-400'}>Saldo pendiente</span>
            <span className={`tabular-nums ${balanceDue > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {formatCurrency(order.balance_due)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
