import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import { Motorcycle, User, Client } from '../../types'
import { toSentenceCase } from '../../lib/strings'

const serviceOrderSchema = z.object({
  motorcycle_id: z.string().min(1, 'Selecciona una motocicleta'),
  client_id: z.string().min(1, 'El cliente es requerido'),
  assigned_mechanic_id: z.string().optional(),
  problem_description: z.string().optional().transform((s) => s ? toSentenceCase(s) : s),
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
        <label className="label-dark">
          Motocicleta <span className="text-red-400">*</span>
        </label>
        <select {...register('motorcycle_id')} className="select-dark">
          <option value="">Selecciona una motocicleta</option>
          {motorcycles.map((m) => (
            <option key={m.id} value={m.id}>
              {m.brand} {m.model} {m.year} {m.plate ? `— ${m.plate}` : ''}
            </option>
          ))}
        </select>
        {errors.motorcycle_id && (
          <p className="alert-error-field">{errors.motorcycle_id.message}</p>
        )}
      </div>

      {/* Auto-filled client */}
      <div>
        <label className="label-dark">Cliente</label>
        <input
          type="text"
          readOnly
          value={clientForMoto?.full_name ?? '(se llenará automáticamente)'}
          className="w-full px-3 py-2.5 bg-surface-700/50 border border-surface-600 text-gray-400 rounded-lg text-sm cursor-not-allowed"
        />
        <input type="hidden" {...register('client_id')} />
        {errors.client_id && (
          <p className="alert-error-field">{errors.client_id.message}</p>
        )}
      </div>

      <div>
        <label className="label-dark">Mecánico asignado</label>
        <select {...register('assigned_mechanic_id')} className="select-dark">
          <option value="">Sin asignar</option>
          {mechanics.map((m) => (
            <option key={m.id} value={m.id}>{m.full_name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-dark">Fecha estimada de entrega</label>
        <input
          type="date"
          {...register('estimated_delivery_date')}
          className="input-dark"
        />
      </div>

      <div>
        <label className="label-dark">Descripción del problema</label>
        <textarea
          {...register('problem_description')}
          rows={4}
          className="textarea-dark"
          placeholder="Describe el problema que reporta el cliente..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-surface-600">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? (
            <>
              <div className="h-3.5 w-3.5 border-2 border-surface-900/30 border-t-surface-900 rounded-full animate-spin" />
              Creando...
            </>
          ) : (
            'Crear Orden'
          )}
        </button>
      </div>
    </form>
  )
}
