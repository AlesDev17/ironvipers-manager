import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import { Part } from '../../types'
import PartForm, { PartFormData } from './PartForm'
import LoadingSpinner from '../../components/LoadingSpinner'

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
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card max-w-lg">
        <div className="modal-header">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-surface-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export default function PartsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPart, setEditingPart] = useState<Part | null>(null)

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
    return (
      p.name.toLowerCase().includes(q) ||
      (p.sku ?? '').toLowerCase().includes(q)
    )
  })

  const lowStockParts = filtered.filter(
    (p) => p.minimum_stock != null && p.stock_quantity <= p.minimum_stock
  )

  const handleDelete = (part: Part) => {
    if (confirm(`¿Eliminar la pieza "${part.name}"?`)) {
      deleteMutation.mutate(part.id)
    }
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Low stock banner */}
      {lowStockParts.length > 0 && (
        <div className="alert-danger">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p className="font-medium text-sm">
              {lowStockParts.length} pieza{lowStockParts.length !== 1 ? 's' : ''} con stock bajo:{' '}
              {lowStockParts.map((p) => p.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o SKU de parte..."
            className="search-input pl-9"
          />
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva Pieza
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <LoadingSpinner size="md" className="py-12" />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto mb-3 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
            </svg>
            <p className="font-medium text-sm">{search ? 'No se encontraron piezas.' : 'No hay piezas registradas.'}</p>
          </div>
        ) : (
          <table className="table-dark">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>SKU</th>
                <th className="text-right">Precio Venta</th>
                <th className="text-right">Costo Compra</th>
                <th className="text-right">Stock</th>
                <th className="text-right">Mínimo</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((part) => {
                const isLow =
                  part.minimum_stock != null && part.stock_quantity <= part.minimum_stock
                return (
                  <tr key={part.id}>
                    <td className="font-medium text-gray-100">{part.name}</td>
                    <td className="text-gray-500 font-mono text-xs">{part.sku ?? '—'}</td>
                    <td className="text-gray-100 text-right tabular-nums">{formatCurrency(part.sale_price)}</td>
                    <td className="text-gray-400 text-right tabular-nums">
                      {part.unit_cost ? formatCurrency(part.unit_cost) : '—'}
                    </td>
                    <td className="text-right tabular-nums">
                      <span
                        className={`font-semibold ${
                          isLow ? 'text-red-400' : 'text-gray-100'
                        }`}
                      >
                        {part.stock_quantity}
                        {isLow && (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 inline ml-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                          </svg>
                        )}
                      </span>
                    </td>
                    <td className="text-gray-500 text-right tabular-nums">
                      {part.minimum_stock ?? '—'}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditingPart(part)} className="btn-ghost">Editar</button>
                        <button onClick={() => handleDelete(part)} className="btn-danger-ghost">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-500">
        {filtered.length} pieza{filtered.length !== 1 ? 's' : ''} — {lowStockParts.length} con stock bajo
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
