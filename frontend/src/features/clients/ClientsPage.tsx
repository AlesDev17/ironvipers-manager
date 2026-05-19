import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export default function ClientsPage() {
  const qc = useQueryClient()
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
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition whitespace-nowrap"
        >
          + Nuevo Cliente
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner size="md" className="py-12" />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {search ? 'No se encontraron clientes con ese criterio.' : 'No hay clientes registrados aún.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Correo</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registrado</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((client, idx) => (
                <tr key={client.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-6 py-3 font-medium text-gray-900">
                    <Link to={`/clients/${client.id}`} className="hover:text-primary-600 transition-colors">
                      {client.full_name}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-gray-600">{client.phone}</td>
                  <td className="px-6 py-3 text-gray-500">{client.email ?? '—'}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(client.created_at).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingClient(client)}
                        className="text-gray-500 hover:text-primary-600 text-xs font-medium px-2 py-1 rounded hover:bg-primary-50 transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(client)}
                        className="text-gray-500 hover:text-red-600 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition"
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
