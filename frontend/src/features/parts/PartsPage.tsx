import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../../lib/api'
import { Part } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'

const partSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  sku: z.string().optional(),
  brand: z.string().optional(),
  description: z.string().optional(),
  stock_quantity: z.coerce.number().int().min(0),
  unit_cost: z.coerce.number().min(0),
  sale_price: z.coerce.number().min(0),
  minimum_stock: z.coerce.number().int().min(0),
})

type PartFormData = z.infer<typeof partSchema>

function formatCurrency(value: string): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    parseFloat(value)
  )
}

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
}

function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ×
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

interface PartFormProps {
  defaultValues?: Partial<Part>
  onSubmit: (data: PartFormData) => Promise<unknown>
  onCancel: () => void
  isLoading?: boolean
}

function PartForm({ defaultValues, onSubmit, onCancel, isLoading }: PartFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PartFormData>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      sku: defaultValues?.sku ?? '',
      brand: defaultValues?.brand ?? '',
      description: defaultValues?.description ?? '',
      stock_quantity: defaultValues?.stock_quantity ?? 0,
      unit_cost: defaultValues ? parseFloat(defaultValues.unit_cost ?? '0') : 0,
      sale_price: defaultValues ? parseFloat(defaultValues.sale_price ?? '0') : 0,
      minimum_stock: defaultValues?.minimum_stock ?? 0,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('name')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
          <input
            type="text"
            {...register('sku')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
          <input
            type="text"
            {...register('brand')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          {...register('description')}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Costo unitario ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('unit_cost')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio venta ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('sale_price')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock actual</label>
          <input
            type="number"
            min="0"
            {...register('stock_quantity')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
          <input
            type="number"
            min="0"
            {...register('minimum_stock')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>
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
          {isLoading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

export default function PartsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPart, setEditingPart] = useState<Part | null>(null)
  const [lowStockOnly, setLowStockOnly] = useState(false)

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ['parts'],
    queryFn: async () => {
      const res = await api.get<Part[]>('/parts')
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: PartFormData) => {
      const res = await api.post<Part>('/parts', data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parts'] })
      setShowCreateModal(false)
    },
    onError: () => alert('Error al crear la pieza.'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PartFormData }) => {
      const res = await api.put<Part>(`/parts/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parts'] })
      setEditingPart(null)
    },
    onError: () => alert('Error al actualizar la pieza.'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/parts/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['parts'] }),
    onError: () => alert('Error al eliminar la pieza.'),
  })

  const filtered = parts.filter((p) => {
    const q = search.toLowerCase()
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      (p.sku ?? '').toLowerCase().includes(q) ||
      (p.brand ?? '').toLowerCase().includes(q)
    const matchesLowStock = !lowStockOnly || p.stock_quantity <= p.minimum_stock
    return matchesSearch && matchesLowStock
  })

  const lowStockCount = parts.filter((p) => p.stock_quantity <= p.minimum_stock).length

  return (
    <div className="space-y-5">
      {lowStockCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <span className="text-red-500">⚠️</span>
          <p className="text-sm text-red-700">
            {lowStockCount} pieza{lowStockCount !== 1 ? 's' : ''} con stock bajo o agotado.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, SKU o marca..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="accent-primary-600"
          />
          Solo bajo stock
        </label>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition whitespace-nowrap"
        >
          + Nueva Pieza
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner size="md" className="py-12" />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No se encontraron piezas.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">SKU</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Marca</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">P. Venta</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((part, idx) => {
                const isLow = part.stock_quantity <= part.minimum_stock
                return (
                  <tr key={part.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {part.name}
                      {part.description && (
                        <p className="text-xs text-gray-400 font-normal mt-0.5 truncate max-w-xs">
                          {part.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-500 font-mono text-xs">{part.sku ?? '—'}</td>
                    <td className="px-6 py-3 text-gray-600">{part.brand ?? '—'}</td>
                    <td className="px-6 py-3 text-right">
                      <span
                        className={`font-semibold ${
                          isLow ? 'text-red-600' : 'text-gray-900'
                        }`}
                      >
                        {part.stock_quantity}
                      </span>
                      <span className="text-gray-400 text-xs ml-1">/ mín {part.minimum_stock}</span>
                    </td>
                    <td className="px-6 py-3 text-right text-gray-900 font-medium">
                      {formatCurrency(part.sale_price)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingPart(part)}
                          className="text-gray-500 hover:text-primary-600 text-xs font-medium px-2 py-1 rounded hover:bg-primary-50"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar "${part.name}"?`)) deleteMutation.mutate(part.id)
                          }}
                          className="text-gray-500 hover:text-red-600 text-xs font-medium px-2 py-1 rounded hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {filtered.length} pieza{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
      </p>

      {showCreateModal && (
        <Modal title="Nueva Pieza" onClose={() => setShowCreateModal(false)}>
          <PartForm
            onSubmit={async (data) => createMutation.mutateAsync(data)}
            onCancel={() => setShowCreateModal(false)}
            isLoading={createMutation.isPending}
          />
        </Modal>
      )}

      {editingPart && (
        <Modal title="Editar Pieza" onClose={() => setEditingPart(null)}>
          <PartForm
            defaultValues={editingPart}
            onSubmit={async (data) => updateMutation.mutateAsync({ id: editingPart.id, data })}
            onCancel={() => setEditingPart(null)}
            isLoading={updateMutation.isPending}
          />
        </Modal>
      )}
    </div>
  )
}
