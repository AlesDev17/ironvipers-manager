import { OrderStatus } from '../types'

interface StatusBadgeProps {
  status: OrderStatus
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  RECIBIDA: {
    label: 'Recibida',
    className: 'bg-blue-100 text-blue-800',
  },
  EN_DIAGNOSTICO: {
    label: 'En Diagnóstico',
    className: 'bg-yellow-100 text-yellow-800',
  },
  ESPERANDO_AUTORIZACION: {
    label: 'Esp. Autorización',
    className: 'bg-orange-100 text-orange-800',
  },
  AUTORIZADA: {
    label: 'Autorizada',
    className: 'bg-purple-100 text-purple-800',
  },
  EN_REPARACION: {
    label: 'En Reparación',
    className: 'bg-indigo-100 text-indigo-800',
  },
  ESPERANDO_PIEZAS: {
    label: 'Esp. Piezas',
    className: 'bg-red-100 text-red-800',
  },
  LISTA_PARA_ENTREGA: {
    label: 'Lista p/ Entrega',
    className: 'bg-teal-100 text-teal-800',
  },
  ENTREGADA: {
    label: 'Entregada',
    className: 'bg-green-100 text-green-800',
  },
  CANCELADA: {
    label: 'Cancelada',
    className: 'bg-gray-100 text-gray-600',
  },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
