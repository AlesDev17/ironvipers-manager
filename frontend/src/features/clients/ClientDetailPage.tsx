import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import { Client, Motorcycle } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: client, isLoading: loadingClient } = useQuery({
    queryKey: ['clients', id],
    queryFn: async () => {
      const res = await api.get<Client>(`/clients/${id}`)
      return res.data
    },
    enabled: !!id,
  })

  const { data: motorcycles = [], isLoading: loadingMotos } = useQuery({
    queryKey: ['motorcycles', 'by-client', id],
    queryFn: async () => {
      const res = await api.get<Motorcycle[]>(`/motorcycles?client_id=${id}`)
      return res.data
    },
    enabled: !!id,
  })

  if (loadingClient) {
    return <LoadingSpinner size="lg" className="py-20" />
  }

  if (!client) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6">
        Cliente no encontrado.
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition"
      >
        ← Volver
      </button>

      {/* Client info card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{client.full_name}</h2>
            <p className="text-gray-500 text-sm mt-1">
              Cliente desde {new Date(client.created_at).toLocaleDateString('es-MX')}
            </p>
          </div>
          <Link
            to={`/clients`}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Ver todos los clientes
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Teléfono</p>
            <p className="text-gray-900 mt-0.5">{client.phone}</p>
          </div>
          {client.email && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Correo</p>
              <p className="text-gray-900 mt-0.5">{client.email}</p>
            </div>
          )}
          {client.address && (
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Dirección</p>
              <p className="text-gray-900 mt-0.5">{client.address}</p>
            </div>
          )}
          {client.notes && (
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Notas</p>
              <p className="text-gray-900 mt-0.5 whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Motorcycles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Motocicletas</h3>
          <Link
            to={`/motorcycles`}
            state={{ prefill_client_id: id }}
            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition"
          >
            + Nueva Motocicleta
          </Link>
        </div>

        {loadingMotos ? (
          <LoadingSpinner size="md" className="py-8" />
        ) : motorcycles.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            Este cliente no tiene motocicletas registradas.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Marca / Modelo</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Año</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Placa</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Color</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {motorcycles.map((moto) => (
                <tr key={moto.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {moto.brand} {moto.model}
                  </td>
                  <td className="px-6 py-3 text-gray-600">{moto.year}</td>
                  <td className="px-6 py-3 text-gray-600">{moto.plate ?? '—'}</td>
                  <td className="px-6 py-3 text-gray-600">{moto.color ?? '—'}</td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      to={`/motorcycles/${moto.id}`}
                      className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                    >
                      Ver detalle →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
