import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../../lib/api'
import { Tenant, TenantWithAdmin } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'

// ── Modal shell ──────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card max-w-lg">
        <div className="modal-header">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 p-1 rounded-lg hover:bg-surface-700">
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

// ── Create form ───────────────────────────────────────────────────────────────
const createSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  owner_email: z.string().email('Correo inválido'),
  admin_name: z.string().min(2, 'Mínimo 2 caracteres'),
  admin_password: z.string().min(8, 'Mínimo 8 caracteres'),
  subscription_expires_at: z.string().optional(),
})
type CreateFormData = z.infer<typeof createSchema>

function CreateTenantForm({ onSuccess, onCancel }: { onSuccess: (result: TenantWithAdmin) => void; onCancel: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
  })

  const mutation = useMutation({
    mutationFn: async (data: CreateFormData) => {
      const payload = {
        ...data,
        subscription_expires_at: data.subscription_expires_at || null,
      }
      const res = await api.post<TenantWithAdmin>('/superadmin/tenants', payload)
      return res.data
    },
    onSuccess,
  })

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="label-dark">Nombre del taller</label>
          <input {...register('name')} className="input-dark" placeholder="Ej. Taller El Trueno" />
          {errors.name && <p className="alert-error-field">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label-dark">Correo del propietario</label>
          <input {...register('owner_email')} type="email" className="input-dark" placeholder="propietario@taller.com" />
          {errors.owner_email && <p className="alert-error-field">{errors.owner_email.message}</p>}
        </div>
        <div className="border-t border-surface-600 pt-4">
          <p className="text-xs text-gray-500 mb-3">Cuenta de administrador inicial</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-dark">Nombre completo</label>
              <input {...register('admin_name')} className="input-dark" placeholder="Admin del taller" />
              {errors.admin_name && <p className="alert-error-field">{errors.admin_name.message}</p>}
            </div>
            <div>
              <label className="label-dark">Contraseña temporal</label>
              <input {...register('admin_password')} type="password" className="input-dark" placeholder="Min. 8 caracteres" />
              {errors.admin_password && <p className="alert-error-field">{errors.admin_password.message}</p>}
            </div>
          </div>
        </div>
        <div>
          <label className="label-dark">Suscripción válida hasta (opcional)</label>
          <input {...register('subscription_expires_at')} type="datetime-local" className="input-dark" />
        </div>
      </div>
      {mutation.isError && (
        <p className="text-red-400 text-sm">Error al crear el taller. Verifica los datos.</p>
      )}
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">Cancelar</button>
        <button type="submit" disabled={isSubmitting || mutation.isPending} className="btn-primary">
          {mutation.isPending ? 'Creando...' : 'Crear taller'}
        </button>
      </div>
    </form>
  )
}

// ── Edit form ─────────────────────────────────────────────────────────────────
const editSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  owner_email: z.string().email('Correo inválido'),
  is_active: z.boolean(),
  subscription_expires_at: z.string().optional(),
})
type EditFormData = z.infer<typeof editSchema>

function EditTenantForm({ tenant, onSuccess, onCancel }: { tenant: Tenant; onSuccess: () => void; onCancel: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: tenant.name,
      owner_email: tenant.owner_email,
      is_active: tenant.is_active,
      subscription_expires_at: tenant.subscription_expires_at
        ? new Date(tenant.subscription_expires_at).toISOString().slice(0, 16)
        : '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: EditFormData) => {
      const payload = {
        name: data.name,
        owner_email: data.owner_email,
        is_active: data.is_active,
        subscription_expires_at: data.subscription_expires_at || null,
      }
      await api.patch(`/superadmin/tenants/${tenant.id}`, payload)
    },
    onSuccess,
  })

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <div>
        <label className="label-dark">Nombre del taller</label>
        <input {...register('name')} className="input-dark" />
        {errors.name && <p className="alert-error-field">{errors.name.message}</p>}
      </div>
      <div>
        <label className="label-dark">Correo del propietario</label>
        <input {...register('owner_email')} type="email" className="input-dark" />
        {errors.owner_email && <p className="alert-error-field">{errors.owner_email.message}</p>}
      </div>
      <div>
        <label className="label-dark">Suscripción válida hasta</label>
        <input {...register('subscription_expires_at')} type="datetime-local" className="input-dark" />
      </div>
      <div className="flex items-center gap-3">
        <input {...register('is_active')} type="checkbox" id="is_active" className="w-4 h-4 accent-amber-500" />
        <label htmlFor="is_active" className="text-sm text-gray-300">Suscripción activa</label>
      </div>
      {mutation.isError && (
        <p className="text-red-400 text-sm">Error al guardar los cambios.</p>
      )}
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">Cancelar</button>
        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}

// ── Success banner ─────────────────────────────────────────────────────────────
function CreatedBanner({ result, onClose }: { result: TenantWithAdmin; onClose: () => void }) {
  return (
    <Modal title="Taller creado exitosamente" onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4 space-y-1">
          <p className="text-green-400 font-semibold text-sm">Guarda estas credenciales</p>
          <p className="text-gray-400 text-sm">Solo se muestran una vez.</p>
        </div>
        <div className="space-y-2">
          <div>
            <p className="label-dark">Taller</p>
            <p className="text-white text-sm">{result.tenant.name}</p>
          </div>
          <div>
            <p className="label-dark">Correo del admin</p>
            <p className="text-white text-sm font-mono">{result.admin_email}</p>
          </div>
          <div>
            <p className="label-dark">Contraseña temporal</p>
            <p className="text-amber-400 text-sm font-mono bg-surface-700 rounded px-3 py-2 select-all">{result.admin_temp_password}</p>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="btn-primary">Entendido</button>
        </div>
      </div>
    </Modal>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TenantsPage() {
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [createdResult, setCreatedResult] = useState<TenantWithAdmin | null>(null)

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['superadmin-tenants'],
    queryFn: async () => {
      const res = await api.get<Tenant[]>('/superadmin/tenants')
      return res.data
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async (tenant: Tenant) => {
      await api.patch(`/superadmin/tenants/${tenant.id}`, { is_active: !tenant.is_active })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['superadmin-tenants'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/superadmin/tenants/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['superadmin-tenants'] }),
  })

  const handleCreated = (result: TenantWithAdmin) => {
    qc.invalidateQueries({ queryKey: ['superadmin-tenants'] })
    setShowCreate(false)
    setCreatedResult(result)
  }

  const formatDate = (iso: string | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const isExpired = (iso: string | null) => iso ? new Date(iso) < new Date() : false

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Talleres</h1>
          <p className="text-gray-400 text-sm mt-0.5">{tenants.length} taller{tenants.length !== 1 ? 'es' : ''} registrado{tenants.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo taller
        </button>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {tenants.length === 0 && (
          <div className="card p-8 text-center text-gray-500">No hay talleres registrados.</div>
        )}
        {tenants.map((t) => (
          <div key={t.id} className="card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-white font-medium">{t.name}</p>
                <p className="text-gray-400 text-sm">{t.owner_email}</p>
              </div>
              <StatusChip tenant={t} />
            </div>
            <div className="text-xs text-gray-500">
              Vence: {isExpired(t.subscription_expires_at) ? (
                <span className="text-red-400">{formatDate(t.subscription_expires_at)} (expirado)</span>
              ) : formatDate(t.subscription_expires_at)}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditingTenant(t)} className="btn-ghost text-xs py-1.5 flex-1">Editar</button>
              <button
                onClick={() => toggleActiveMutation.mutate(t)}
                disabled={toggleActiveMutation.isPending}
                className={`text-xs py-1.5 flex-1 rounded-lg font-medium border transition-colors ${t.is_active ? 'border-orange-500/40 text-orange-400 hover:bg-orange-500/10' : 'border-green-500/40 text-green-400 hover:bg-green-500/10'}`}
              >
                {t.is_active ? 'Suspender' : 'Activar'}
              </button>
              <button
                onClick={() => { if (confirm(`¿Eliminar "${t.name}"? Esta acción no se puede deshacer.`)) deleteMutation.mutate(t.id) }}
                className="text-xs py-1.5 px-3 rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block card overflow-hidden">
        {tenants.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No hay talleres registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-600">
                  <th className="text-left text-gray-400 font-medium px-6 py-3">Taller</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3">Propietario</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3">Estado</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3">Suscripción hasta</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3">Registrado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-700/30 transition-colors">
                    <td className="px-6 py-3 text-white font-medium">{t.name}</td>
                    <td className="px-4 py-3 text-gray-300">{t.owner_email}</td>
                    <td className="px-4 py-3"><StatusChip tenant={t} /></td>
                    <td className="px-4 py-3">
                      {isExpired(t.subscription_expires_at) ? (
                        <span className="text-red-400">{formatDate(t.subscription_expires_at)}</span>
                      ) : (
                        <span className="text-gray-300">{formatDate(t.subscription_expires_at)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(t.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => setEditingTenant(t)} className="btn-ghost text-xs py-1.5">Editar</button>
                        <button
                          onClick={() => toggleActiveMutation.mutate(t)}
                          disabled={toggleActiveMutation.isPending}
                          className={`text-xs py-1.5 px-3 rounded-lg font-medium border transition-colors ${t.is_active ? 'border-orange-500/40 text-orange-400 hover:bg-orange-500/10' : 'border-green-500/40 text-green-400 hover:bg-green-500/10'}`}
                        >
                          {t.is_active ? 'Suspender' : 'Activar'}
                        </button>
                        <button
                          onClick={() => { if (confirm(`¿Eliminar "${t.name}"? Esta acción no se puede deshacer.`)) deleteMutation.mutate(t.id) }}
                          className="text-gray-500 hover:text-red-400 p-1.5 rounded hover:bg-red-500/10 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <Modal title="Nuevo taller" onClose={() => setShowCreate(false)}>
          <CreateTenantForm onSuccess={handleCreated} onCancel={() => setShowCreate(false)} />
        </Modal>
      )}
      {editingTenant && (
        <Modal title="Editar taller" onClose={() => setEditingTenant(null)}>
          <EditTenantForm
            tenant={editingTenant}
            onSuccess={() => {
              qc.invalidateQueries({ queryKey: ['superadmin-tenants'] })
              setEditingTenant(null)
            }}
            onCancel={() => setEditingTenant(null)}
          />
        </Modal>
      )}
      {createdResult && (
        <CreatedBanner result={createdResult} onClose={() => setCreatedResult(null)} />
      )}
    </div>
  )
}

function StatusChip({ tenant }: { tenant: Tenant }) {
  if (!tenant.is_active) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/20">Suspendido</span>
  }
  if (tenant.subscription_expires_at && new Date(tenant.subscription_expires_at) < new Date()) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/15 text-orange-400 border border-orange-500/20">Expirado</span>
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/20">Activo</span>
}
