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
      <div className="alert-danger">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        Cliente no encontrado.
      </div>
    )
  }

  const initials = client.full_name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-100 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Volver
      </button>

      {/* Client info card */}
      <div className="card overflow-hidden">
        {/* Header with avatar */}
        <div className="px-6 py-5 bg-gradient-to-r from-surface-700 to-surface-800 border-b border-surface-600 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-surface-900 font-bold text-xl flex-shrink-0 ring-2 ring-amber-500/30">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white">{client.full_name}</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              Cliente desde {new Date(client.created_at).toLocaleDateString('es-MX')}
            </p>
          </div>
          <Link
            to="/clients"
            className="text-sm text-amber-400 hover:text-amber-300 transition-colors hidden sm:block"
          >
            Ver todos los clientes
          </Link>
        </div>

        {/* Info fields */}
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Teléfono</p>
            <p className="text-gray-100 font-medium">{client.phone}</p>
          </div>
          {client.email && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Correo</p>
              <p className="text-gray-100">{client.email}</p>
            </div>
          )}
          {client.address && (
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Dirección</p>
              <p className="text-gray-100">{client.address}</p>
            </div>
          )}
          {client.notes && (
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Notas</p>
              <p className="text-gray-300 whitespace-pre-wrap text-sm">{client.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Motorcycles */}
      <div className="card overflow-hidden">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Motocicletas</h3>
          <Link
            to="/motorcycles"
            state={{ prefill_client_id: id }}
            className="btn-primary py-1.5 text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva Motocicleta
          </Link>
        </div>

        {loadingMotos ? (
          <LoadingSpinner size="md" className="py-8" />
        ) : motorcycles.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 mx-auto mb-2 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            Este cliente no tiene motocicletas registradas.
          </div>
        ) : (
          <table className="table-dark">
            <thead>
              <tr>
                <th>Marca / Modelo</th>
                <th>Año</th>
                <th>Placa</th>
                <th>Color</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {motorcycles.map((moto) => (
                <tr key={moto.id}>
                  <td className="font-medium text-gray-100">
                    {moto.brand} {moto.model}
                  </td>
                  <td className="text-gray-400">{moto.year}</td>
                  <td className="text-gray-400">{moto.plate ?? '—'}</td>
                  <td className="text-gray-400">{moto.color ?? '—'}</td>
                  <td className="text-right">
                    <Link
                      to={`/motorcycles/${moto.id}`}
                      className="text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors"
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
