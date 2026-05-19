import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation } from 'react-router-dom'
import api from '../../lib/api'
import { Motorcycle, Client } from '../../types'
import MotorcycleForm, { MotorcycleFormData } from './MotorcycleForm'
import LoadingSpinner from '../../components/LoadingSpinner'

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
}

function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
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

export default function MotorcyclesPage() {
  const qc = useQueryClient()
  const location = useLocation()
  const prefillClientId = (location.state as { prefill_client_id?: string } | null)?.prefill_client_id

  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(!!prefillClientId)
  const [editingMoto, setEditingMoto] = useState<Motorcycle | null>(null)

  const { data: motorcycles = [], isLoading: loadingMotos } = useQuery({
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

  const clientMap = new Map(clients.map((c) => [c.id, c.full_name]))

  const createMutation = useMutation({
    mutationFn: async (data: MotorcycleFormData) => {
      const res = await api.post<Motorcycle>('/motorcycles', data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['motorcycles'] })
      setShowCreateModal(false)
    },
    onError: () => alert('Error al crear la motocicleta.'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MotorcycleFormData }) => {
      const res = await api.put<Motorcycle>(`/motorcycles/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['motorcycles'] })
      setEditingMoto(null)
    },
    onError: () => alert('Error al actualizar la motocicleta.'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/motorcycles/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['motorcycles'] }),
    onError: () => alert('Error al eliminar la motocicleta.'),
  })

  const filtered = motorcycles.filter((m) => {
    const q = search.toLowerCase()
    return (
      m.brand.toLowerCase().includes(q) ||
      m.model.toLowerCase().includes(q) ||
      (m.plate ?? '').toLowerCase().includes(q)
    )
  })

  const handleDelete = (moto: Motorcycle) => {
    if (confirm(`¿Eliminar la motocicleta ${moto.brand} ${moto.model}?`)) {
      deleteMutation.mutate(moto.id)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por marca, modelo o placa..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition whitespace-nowrap"
        >
          + Nueva Motocicleta
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loadingMotos ? (
          <LoadingSpinner size="md" className="py-12" />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            {search ? 'No se encontraron motocicletas.' : 'No hay motocicletas registradas.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Marca / Modelo</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Año</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Placa</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">KM</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((moto, idx) => (
                <tr key={moto.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-6 py-3 font-medium text-gray-900">
                    <Link to={`/motorcycles/${moto.id}`} className="hover:text-primary-600">
                      {moto.brand} {moto.model}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-gray-600">{moto.year}</td>
                  <td className="px-6 py-3 text-gray-600">{moto.plate ?? '—'}</td>
                  <td className="px-6 py-3 text-gray-600">
                    {clientMap.get(moto.client_id) ?? '—'}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {moto.km !== undefined ? moto.km.toLocaleString('es-MX') : '—'}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingMoto(moto)}
                        className="text-gray-500 hover:text-primary-600 text-xs font-medium px-2 py-1 rounded hover:bg-primary-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(moto)}
                        className="text-gray-500 hover:text-red-600 text-xs font-medium px-2 py-1 rounded hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {filtered.length} motocicleta{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
      </p>

      {showCreateModal && (
        <Modal title="Nueva Motocicleta" onClose={() => setShowCreateModal(false)}>
          <MotorcycleForm
            prefillClientId={prefillClientId}
            onSubmit={async (data) => createMutation.mutateAsync(data)}
            onCancel={() => setShowCreateModal(false)}
            isLoading={createMutation.isPending}
          />
        </Modal>
      )}

      {editingMoto && (
        <Modal title="Editar Motocicleta" onClose={() => setEditingMoto(null)}>
          <MotorcycleForm
            defaultValues={editingMoto}
            onSubmit={async (data) => updateMutation.mutateAsync({ id: editingMoto.id, data })}
            onCancel={() => setEditingMoto(null)}
            isLoading={updateMutation.isPending}
          />
        </Modal>
      )}
    </div>
  )
}
