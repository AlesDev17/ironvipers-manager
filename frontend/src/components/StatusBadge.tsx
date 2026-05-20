import { OrderStatus } from '../types'

interface StatusBadgeProps {
  status: OrderStatus
}

const statusConfig: Record<OrderStatus, { label: string; dotClass: string; textClass: string; bgClass: string }> = {
  RECIBIDA: {
    label: 'Recibida',
    dotClass: 'bg-blue-400',
    textClass: 'text-blue-300',
    bgClass: 'bg-blue-500/10 border border-blue-500/20',
  },
  EN_DIAGNOSTICO: {
    label: 'En Diagnóstico',
    dotClass: 'bg-yellow-400',
    textClass: 'text-yellow-300',
    bgClass: 'bg-yellow-500/10 border border-yellow-500/20',
  },
  ESPERANDO_AUTORIZACION: {
    label: 'Esp. Autorización',
    dotClass: 'bg-orange-400',
    textClass: 'text-orange-300',
    bgClass: 'bg-orange-500/10 border border-orange-500/20',
  },
  AUTORIZADA: {
    label: 'Autorizada',
    dotClass: 'bg-purple-400',
    textClass: 'text-purple-300',
    bgClass: 'bg-purple-500/10 border border-purple-500/20',
  },
  EN_REPARACION: {
    label: 'En Reparación',
    dotClass: 'bg-amber-400',
    textClass: 'text-amber-300',
    bgClass: 'bg-amber-500/10 border border-amber-500/20',
  },
  ESPERANDO_PIEZAS: {
    label: 'Esp. Piezas',
    dotClass: 'bg-red-400',
    textClass: 'text-red-300',
    bgClass: 'bg-red-500/10 border border-red-500/20',
  },
  LISTA_PARA_ENTREGA: {
    label: 'Lista p/ Entrega',
    dotClass: 'bg-teal-400',
    textClass: 'text-teal-300',
    bgClass: 'bg-teal-500/10 border border-teal-500/20',
  },
  ENTREGADA: {
    label: 'Entregada',
    dotClass: 'bg-green-400',
    textClass: 'text-green-300',
    bgClass: 'bg-green-500/10 border border-green-500/20',
  },
  CANCELADA: {
    label: 'Cancelada',
    dotClass: 'bg-gray-500',
    textClass: 'text-gray-400',
    bgClass: 'bg-gray-500/10 border border-gray-500/20',
  },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgClass} ${config.textClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass} flex-shrink-0`} />
      {config.label}
    </span>
  )
}
