import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import { Motorcycle, User, Client } from '../../types'

const serviceOrderSchema = z.object({
  motorcycle_id: z.string().min(1, 'Selecciona una motocicleta'),
  client_id: z.string().min(1, 'El cliente es requerido'),
  assigned_mechanic_id: z.string().optional(),
  problem_description: z.string().optional(),
  estimated_delivery_date: z.string().optional(),
})

export type ServiceOrderFormData = z.infer<typeof serviceOrderSchema>

interface ServiceOrderFormProps {
  prefillMotorcycleId?: string
  onSubmit: (data: ServiceOrderFormData) => Promise<unknown>
  onCancel: () => void
  isLoading?: boolean
}

export default function ServiceOrderForm({
  prefillMotorcycleId,
  onSubmit,
  onCancel,
  isLoading,
}: ServiceOrderFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServiceOrderFormData>({
    resolver: zodResolver(serviceOrderSchema),
    defaultValues: {
      motorcycle_id: prefillMotorcycleId ?? '',
      client_id: '',
      assigned_mechanic_id: '',
      problem_description: '',
      estimated_delivery_date: '',
    },
  })

  const motorcycleId = watch('motorcycle_id')

  const { data: motorcycles = [] } = useQuery({
    queryKey: ['motorcycles'],
    queryFn: async () => {
      const res = await api.get<Motorcycle[]>('/motorcycles')
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

  const { data: mechanics = [] } = useQuery({
    queryKey: ['users', 'mechanics'],
    queryFn: async () => {
      const res = await api.get<User[]>('/users?role=MECHANIC')
      return res.data
    },
  })

  // Auto-fill client when motorcycle is selected
  useEffect(() => {
    const moto = motorcycles.find((m) => m.id === motorcycleId)
    if (moto) {
      setValue('client_id', moto.client_id)
    }
  }, [motorcycleId, motorcycles, setValue])

  const selectedMoto = motorcycles.find((m) => m.id === motorcycleId)
  const clientForMoto = clients.find((c) => c.id === selectedMoto?.client_id)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Motocicleta <span className="text-red-500">*</span>
        </label>
        <select
          {...register('motorcycle_id')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Selecciona una motocicleta</option>
          {motorcycles.map((m) => (
            <option key={m.id} value={m.id}>
              {m.brand} {m.model} {m.year} {m.plate ? `— ${m.plate}` : ''}
            </option>
          ))}
        </select>
        {errors.motorcycle_id && (
          <p className="mt-1 text-sm text-red-600">{errors.motorcycle_id.message}</p>
        )}
      </div>

      {/* Auto-filled client */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
        <input
          type="text"
          readOnly
          value={clientForMoto?.full_name ?? '(se llenará automáticamente)'}
          className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-600 text-sm cursor-not-allowed"
        />
        <input type="hidden" {...register('client_id')} />
        {errors.client_id && (
          <p className="mt-1 text-sm text-red-600">{errors.client_id.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mecánico asignado</label>
        <select
          {...register('assigned_mechanic_id')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Sin asignar</option>
          {mechanics.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha estimada de entrega
        </label>
        <input
          type="date"
          {...register('estimated_delivery_date')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción del problema
        </label>
        <textarea
          {...register('problem_description')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          placeholder="Describe el problema que reporta el cliente..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 rounded-lg"
        >
          {isLoading ? 'Creando...' : 'Crear Orden'}
        </button>
      </div>
    </form>
  )
}
