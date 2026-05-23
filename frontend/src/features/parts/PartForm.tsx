import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Part } from '../../types'
import { toTitleCase, toSentenceCase } from '../../lib/strings'

const partSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').transform(toTitleCase),
  sku: z.string().optional().transform((s) => s ? s.trim().toUpperCase() : s),
  sale_price: z.coerce.number().min(0, 'El precio de venta es requerido'),
  unit_cost: z.coerce.number().min(0).optional(),
  stock_quantity: z.coerce.number().int().min(0),
  minimum_stock: z.coerce.number().int().min(0).optional(),
  description: z.string().optional().transform((s) => s ? toSentenceCase(s) : s),
})

export type PartFormData = z.infer<typeof partSchema>

interface PartFormProps {
  defaultValues?: Partial<Part>
  onSubmit: (data: PartFormData) => Promise<unknown>
  onCancel: () => void
  isLoading?: boolean
}

export default function PartForm({ defaultValues, onSubmit, onCancel, isLoading }: PartFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PartFormData>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      sku: defaultValues?.sku ?? '',
      sale_price: defaultValues?.sale_price ? parseFloat(defaultValues.sale_price) : 0,
      unit_cost: defaultValues?.unit_cost ? parseFloat(defaultValues.unit_cost) : 0,
      stock_quantity: defaultValues?.stock_quantity ?? 0,
      minimum_stock: defaultValues?.minimum_stock ?? 0,
      description: defaultValues?.description ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label-dark">
          Nombre <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          {...register('name')}
          className="input-dark"
          placeholder="Filtro de aceite, Pastilla de freno..."
        />
        {errors.name && <p className="alert-error-field">{errors.name.message}</p>}
      </div>

      <div>
        <label className="label-dark">Número de parte (SKU)</label>
        <input
          type="text"
          {...register('sku')}
          className="input-dark"
          placeholder="OEM-12345"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-dark">
            Precio de venta ($) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('sale_price')}
            className="input-dark"
          />
          {errors.sale_price && <p className="alert-error-field">{errors.sale_price.message}</p>}
        </div>
        <div>
          <label className="label-dark">Costo Unitario (Compra) ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('unit_cost')}
            className="input-dark"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-dark">Stock actual</label>
          <input
            type="number"
            min="0"
            {...register('stock_quantity')}
            className="input-dark"
          />
        </div>
        <div>
          <label className="label-dark">Stock mínimo</label>
          <input
            type="number"
            min="0"
            {...register('minimum_stock')}
            className="input-dark"
          />
        </div>
      </div>

      <div>
        <label className="label-dark">Descripción</label>
        <textarea
          {...register('description')}
          rows={2}
          className="textarea-dark"
          placeholder="Descripción adicional..."
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
