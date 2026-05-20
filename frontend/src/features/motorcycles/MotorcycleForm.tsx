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
        <label className="label-dark">Cliente <span className="text-red-400">*</span></label>
        <select {...register('client_id')} className="select-dark">
          <option value="">Selecciona un cliente</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.full_name} — {c.phone}</option>
          ))}
        </select>
        {errors.client_id && <p className="alert-error-field">{errors.client_id.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-dark">Marca <span className="text-red-400">*</span></label>
          <input type="text" {...register('brand')} className="input-dark" placeholder="Honda, Yamaha..." />
          {errors.brand && <p className="alert-error-field">{errors.brand.message}</p>}
        </div>
        <div>
          <label className="label-dark">Modelo <span className="text-red-400">*</span></label>
          <input type="text" {...register('model')} className="input-dark" placeholder="CBR600, R1..." />
          {errors.model && <p className="alert-error-field">{errors.model.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-dark">Año <span className="text-red-400">*</span></label>
          <input type="number" {...register('year')} className="input-dark" />
          {errors.year && <p className="alert-error-field">{errors.year.message}</p>}
        </div>
        <div>
          <label className="label-dark">Kilometraje</label>
          <input type="number" {...register('km')} className="input-dark" placeholder="0" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-dark">Placa</label>
          <input type="text" {...register('plate')} className="input-dark" placeholder="ABC-123" />
        </div>
        <div>
          <label className="label-dark">Color</label>
          <input type="text" {...register('color')} className="input-dark" placeholder="Rojo, Negro..." />
        </div>
      </div>

      <div>
        <label className="label-dark">VIN / Número de serie</label>
        <input type="text" {...register('vin')} className="input-dark" />
      </div>

      <div>
        <label className="label-dark">Notas</label>
        <textarea {...register('notes')} rows={2} className="textarea-dark" />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-surface-600">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? (
            <>
              <div className="h-3.5 w-3.5 border-2 border-surface-900/30 border-t-surface-900 rounded-full animate-spin" />
              Guardando...
            </>
          ) : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
