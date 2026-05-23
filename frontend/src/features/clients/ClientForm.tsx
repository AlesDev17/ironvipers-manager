import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Client } from '../../types'
import { toTitleCase, toSentenceCase } from '../../lib/strings'

const clientSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').transform(toTitleCase),
  phone: z.string().min(7, 'El teléfono es requerido').transform((s) => s.trim()),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
  address: z.string().optional().transform((s) => s ? toSentenceCase(s) : s),
  notes: z.string().optional().transform((s) => s ? toSentenceCase(s) : s),
})

export type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormProps {
  defaultValues?: Partial<Client>
  onSubmit: (data: ClientFormData) => Promise<unknown>
  onCancel: () => void
  isLoading?: boolean
}

export default function ClientForm({ defaultValues, onSubmit, onCancel, isLoading }: ClientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      full_name: defaultValues?.full_name ?? '',
      phone: defaultValues?.phone ?? '',
      email: defaultValues?.email ?? '',
      address: defaultValues?.address ?? '',
      notes: defaultValues?.notes ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label-dark">
          Nombre completo <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          {...register('full_name')}
          className="input-dark"
          placeholder="Juan Pérez"
        />
        {errors.full_name && (
          <p className="alert-error-field">{errors.full_name.message}</p>
        )}
      </div>

      <div>
        <label className="label-dark">
          Teléfono <span className="text-red-400">*</span>
        </label>
        <input
          type="tel"
          {...register('phone')}
          className="input-dark"
          placeholder="555-123-4567"
        />
        {errors.phone && (
          <p className="alert-error-field">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label className="label-dark">Correo electrónico</label>
        <input
          type="email"
          {...register('email')}
          className="input-dark"
          placeholder="correo@ejemplo.com"
        />
        {errors.email && (
          <p className="alert-error-field">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="label-dark">Dirección</label>
        <input
          type="text"
          {...register('address')}
          className="input-dark"
          placeholder="Calle, Colonia, Ciudad"
        />
      </div>

      <div>
        <label className="label-dark">Notas</label>
        <textarea
          {...register('notes')}
          rows={3}
          className="textarea-dark"
          placeholder="Observaciones adicionales..."
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
              Guardando...
            </>
          ) : (
            'Guardar'
          )}
        </button>
      </div>
    </form>
  )
}
