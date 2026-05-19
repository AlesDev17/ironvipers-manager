import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import { Client, Motorcycle } from '../../types'

const motorcycleSchema = z.object({
  client_id: z.string().min(1, 'Selecciona un cliente'),
  brand: z.string().min(1, 'La marca es requerida'),
  model: z.string().min(1, 'El modelo es requerido'),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  plate: z.string().optional(),
  vin: z.string().optional(),
  color: z.string().optional(),
  km: z.coerce.number().int().min(0).optional(),
  notes: z.string().optional(),
})

export type MotorcycleFormData = z.infer<typeof motorcycleSchema>

interface MotorcycleFormProps {
  defaultValues?: Partial<Motorcycle>
  prefillClientId?: string
  onSubmit: (data: MotorcycleFormData) => Promise<unknown>
  onCancel: () => void
  isLoading?: boolean
}

export default function MotorcycleForm({
  defaultValues,
  prefillClientId,
  onSubmit,
  onCancel,
  isLoading,
}: MotorcycleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MotorcycleFormData>({
    resolver: zodResolver(motorcycleSchema),
    defaultValues: {
      client_id: defaultValues?.client_id ?? prefillClientId ?? '',
      brand: defaultValues?.brand ?? '',
      model: defaultValues?.model ?? '',
      year: defaultValues?.year ?? new Date().getFullYear(),
      plate: defaultValues?.plate ?? '',
      vin: defaultValues?.vin ?? '',
      color: defaultValues?.color ?? '',
      km: defaultValues?.km ?? 0,
      notes: defaultValues?.notes ?? '',
    },
  })

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await api.get<Client[]>('/clients')
      return res.data
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cliente <span className="text-red-500">*</span>
        </label>
        <select
          {...register('client_id')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Selecciona un cliente</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name} — {c.phone}
            </option>
          ))}
        </select>
        {errors.client_id && (
          <p className="mt-1 text-sm text-red-600">{errors.client_id.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Marca <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('brand')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Honda, Yamaha..."
          />
          {errors.brand && (
            <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modelo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('model')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="CBR600, R1..."
          />
          {errors.model && (
            <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Año <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register('year')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.year && (
            <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kilometraje</label>
          <input
            type="number"
            {...register('km')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
          <input
            type="text"
            {...register('plate')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="ABC-123"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <input
            type="text"
            {...register('color')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Rojo, Negro..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">VIN / Número de serie</label>
        <input
          type="text"
          {...register('vin')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea
          {...register('notes')}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 rounded-lg transition"
        >
          {isLoading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
