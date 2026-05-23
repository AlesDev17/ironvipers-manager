import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { Client } from '../../types'
import ClientForm, { ClientFormData } from './ClientForm'
import LoadingSpinner from '../../components/LoadingSpinner'

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

export default function ClientsPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await api.get<Client[]>('/clients')
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const res = await api.post<Client>('/clients', data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      setShowCreateModal(false)
    },
    onError: () => {
      alert('Error al crear el cliente. Verifica los datos.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ClientFormData }) => {
      const res = await api.put<Client>(`/clients/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      setEditingClient(null)
    },
    onError: () => {
      alert('Error al actualizar el cliente.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/clients/${id}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
    },
    onError: () => {
      alert('Error al eliminar el cliente.')
    },
  })

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    return c.full_name.toLowerCase().includes(q) || c.phone.includes(q)
  })

  const handleDelete = (client: Client) => {
    if (confirm(`¿Eliminar al cliente "${client.full_name}"? Esta acción no se puede deshacer.`)) {
      deleteMutation.mutate(client.id)
    }
  }

  return (
    <div className="space-y-5 animate-fadeIn">
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
            placeholder="Buscar por nombre o teléfono..."
            className="search-input pl-9"
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo Cliente
        </button>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {isLoading ? (
          <LoadingSpinner size="md" className="py-12" />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto mb-3 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <p className="font-medium text-sm">
              {search ? 'No se encontraron clientes con ese criterio.' : 'No hay clientes registrados aún.'}
            </p>
          </div>
        ) : (
          filtered.map((client) => (
            <div
              key={client.id}
              onClick={() => navigate(`/clients/${client.id}`)}
              className="card p-4 flex items-center gap-3 hover:bg-surface-700/60 active:bg-surface-700 transition-colors cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-100 truncate">{client.full_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {client.phone}{client.email ? ` · ${client.email}` : ''}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(client.created_at).toLocaleDateString('es-MX')}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingClient(client) }}
                  className="btn-ghost"
                >
                  Editar
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(client) }}
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
        {isLoading ? (
          <LoadingSpinner size="md" className="py-12" />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto mb-3 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <p className="font-medium text-sm">
              {search ? 'No se encontraron clientes con ese criterio.' : 'No hay clientes registrados aún.'}
            </p>
          </div>
        ) : (
          <table className="table-dark">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Registrado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => navigate(`/clients/${client.id}`)}
                  className="cursor-pointer hover:bg-surface-700/50 transition-colors"
                >
                  <td>
                    <Link
                      to={`/clients/${client.id}`}
                      className="font-medium text-gray-100 hover:text-amber-400 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {client.full_name}
                    </Link>
                  </td>
                  <td className="text-gray-400">{client.phone}</td>
                  <td className="text-gray-500">{client.email ?? '—'}</td>
                  <td className="text-gray-500">
                    {new Date(client.created_at).toLocaleDateString('es-MX')}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingClient(client) }}
                        className="btn-ghost"
                      >
                        Editar
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(client) }}
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
        {filtered.length} cliente{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Create Modal */}
      {showCreateModal && (
        <Modal title="Nuevo Cliente" onClose={() => setShowCreateModal(false)}>
          <ClientForm
            onSubmit={async (data) => createMutation.mutateAsync(data)}
            onCancel={() => setShowCreateModal(false)}
            isLoading={createMutation.isPending}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editingClient && (
        <Modal title="Editar Cliente" onClose={() => setEditingClient(null)}>
          <ClientForm
            defaultValues={editingClient}
            onSubmit={async (data) => updateMutation.mutateAsync({ id: editingClient.id, data })}
            onCancel={() => setEditingClient(null)}
            isLoading={updateMutation.isPending}
          />
        </Modal>
      )}
    </div>
  )
}
