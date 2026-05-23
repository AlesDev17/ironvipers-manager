import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card max-w-2xl">
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

export default function MotorcyclesPage() {
  const qc = useQueryClient()
  const location = useLocation()
  const navigate = useNavigate()
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
    <div className="space-y-5 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por marca, modelo o placa..."
            className="search-input pl-9"
          />
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva Motocicleta
        </button>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {loadingMotos ? (
          <LoadingSpinner size="md" className="py-12" />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto mb-3 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            <p className="font-medium text-sm">{search ? 'No se encontraron motocicletas.' : 'No hay motocicletas registradas.'}</p>
          </div>
        ) : (
          filtered.map((moto) => (
            <div
              key={moto.id}
              onClick={() => navigate(`/motorcycles/${moto.id}`)}
              className="card p-4 flex items-center gap-3 hover:bg-surface-700/60 active:bg-surface-700 transition-colors cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-100 truncate">{moto.brand} {moto.model} {moto.year}</p>
                <p className="text-xs text-gray-400 mt-0.5">{clientMap.get(moto.client_id) ?? '—'}{moto.plate ? ` · ${moto.plate}` : ''}</p>
                <p className="text-xs text-gray-500 mt-0.5">{moto.km !== undefined ? `${moto.km.toLocaleString('es-MX')} km` : 'Sin km'}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingMoto(moto) }}
                  className="btn-ghost"
                >
                  Editar
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(moto) }}
                  className="btn-danger-ghost"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block card overflow-hidden">
        {loadingMotos ? (
          <LoadingSpinner size="md" className="py-12" />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto mb-3 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            <p className="font-medium text-sm">{search ? 'No se encontraron motocicletas.' : 'No hay motocicletas registradas.'}</p>
          </div>
        ) : (
          <table className="table-dark">
            <thead>
              <tr>
                <th>Marca / Modelo</th>
                <th>Año</th>
                <th>Placa</th>
                <th>Cliente</th>
                <th>KM</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((moto) => (
                <tr
                  key={moto.id}
                  onClick={() => navigate(`/motorcycles/${moto.id}`)}
                  className="cursor-pointer hover:bg-surface-700/50 transition-colors"
                >
                  <td>
                    <Link to={`/motorcycles/${moto.id}`} className="font-medium text-gray-100 hover:text-amber-400 transition-colors" onClick={(e) => e.stopPropagation()}>
                      {moto.brand} {moto.model}
                    </Link>
                  </td>
                  <td className="text-gray-400">{moto.year}</td>
                  <td className="text-gray-400">{moto.plate ?? '—'}</td>
                  <td className="text-gray-400">{clientMap.get(moto.client_id) ?? '—'}</td>
                  <td className="text-gray-400">{moto.km !== undefined ? moto.km.toLocaleString('es-MX') : '—'}</td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingMoto(moto) }}
                        className="btn-ghost"
                      >
                        Editar
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(moto) }}
                        className="btn-danger-ghost"
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

      <p className="text-xs text-gray-500">
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
