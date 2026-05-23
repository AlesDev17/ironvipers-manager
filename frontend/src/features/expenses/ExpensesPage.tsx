import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../../lib/api'
import { Expense, ExpenseCategory } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import { toSentenceCase } from '../../lib/strings'

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'RENTA',
  'LUZ',
  'AGUA',
  'HERRAMIENTA',
  'PIEZAS',
  'NOMINA',
  'OTRO',
]

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  RENTA: 'Renta',
  LUZ: 'Luz',
  AGUA: 'Agua',
  HERRAMIENTA: 'Herramienta',
  PIEZAS: 'Piezas',
  NOMINA: 'Nómina',
  OTRO: 'Otro',
}

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  RENTA: 'bg-blue-500/10 text-blue-300 border border-blue-500/20',
  LUZ: 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20',
  AGUA: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
  HERRAMIENTA: 'bg-orange-500/10 text-orange-300 border border-orange-500/20',
  PIEZAS: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20',
  NOMINA: 'bg-green-500/10 text-green-300 border border-green-500/20',
  OTRO: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
}

const expenseSchema = z.object({
  concept: z.string().min(1, 'El concepto es requerido').transform(toSentenceCase),
  amount: z.coerce.number().positive('El monto debe ser positivo'),
  category: z.enum(['RENTA', 'LUZ', 'AGUA', 'HERRAMIENTA', 'PIEZAS', 'NOMINA', 'OTRO']),
  expense_date: z.string().min(1, 'La fecha es requerida'),
  notes: z.string().optional().transform((s) => s ? toSentenceCase(s) : s),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num)
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

interface ExpenseFormProps {
  defaultValues?: Partial<Expense>
  onSubmit: (data: ExpenseFormData) => Promise<unknown>
  onCancel: () => void
  isLoading?: boolean
}

function ExpenseForm({ defaultValues, onSubmit, onCancel, isLoading }: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      concept: defaultValues?.concept ?? '',
      amount: defaultValues ? parseFloat(defaultValues.amount ?? '0') : 0,
      category: defaultValues?.category ?? 'OTRO',
      expense_date: defaultValues?.expense_date
        ? defaultValues.expense_date.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      notes: defaultValues?.notes ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label-dark">
          Concepto <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          {...register('concept')}
          className="input-dark"
          placeholder="Descripción del gasto"
        />
        {errors.concept && <p className="alert-error-field">{errors.concept.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-dark">
            Monto ($) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            {...register('amount')}
            className="input-dark"
          />
          {errors.amount && <p className="alert-error-field">{errors.amount.message}</p>}
        </div>
        <div>
          <label className="label-dark">
            Categoría <span className="text-red-400">*</span>
          </label>
          <select {...register('category')} className="select-dark">
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label-dark">
          Fecha <span className="text-red-400">*</span>
        </label>
        <input
          type="date"
          {...register('expense_date')}
          className="input-dark"
        />
        {errors.expense_date && <p className="alert-error-field">{errors.expense_date.message}</p>}
      </div>

      <div>
        <label className="label-dark">Notas</label>
        <textarea
          {...register('notes')}
          rows={2}
          className="textarea-dark"
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

export default function ExpensesPage() {
  const qc = useQueryClient()
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'ALL'>('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await api.get<Expense[]>('/expenses')
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      const res = await api.post<Expense>('/expenses', data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      setShowCreateModal(false)
    },
    onError: () => alert('Error al registrar el gasto.'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ExpenseFormData }) => {
      const res = await api.put<Expense>(`/expenses/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      setEditingExpense(null)
    },
    onError: () => alert('Error al actualizar el gasto.'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/expenses/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
    onError: () => alert('Error al eliminar el gasto.'),
  })

  const filtered =
    categoryFilter === 'ALL'
      ? expenses
      : expenses.filter((e) => e.category === categoryFilter)

  const totalFiltered = filtered.reduce((sum, e) => sum + parseFloat(e.amount), 0)

  // Breakdown by category for "ALL" view
  const categoryTotals = EXPENSE_CATEGORIES.map((cat) => ({
    cat,
    total: expenses.filter((e) => e.category === cat).reduce((s, e) => s + parseFloat(e.amount), 0),
    count: expenses.filter((e) => e.category === cat).length,
  })).filter((ct) => ct.count > 0)

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Summary strip */}
      {filtered.length > 0 && (
        <div className="card px-6 py-4 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Total de {filtered.length} gasto{filtered.length !== 1 ? 's' : ''}
            {categoryFilter !== 'ALL' ? ` en ${CATEGORY_LABELS[categoryFilter]}` : ''}
          </span>
          <span className="text-xl font-bold text-white tabular-nums">
            {formatCurrency(totalFiltered)}
          </span>
        </div>
      )}

      {/* Category breakdown chips (only when ALL) */}
      {categoryFilter === 'ALL' && categoryTotals.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categoryTotals.map(({ cat, total, count }) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border hover:opacity-80 ${CATEGORY_COLORS[cat]}`}
            >
              {CATEGORY_LABELS[cat]}
              <span className="opacity-70">({count})</span>
              <span className="font-bold">{formatCurrency(total)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategory | 'ALL')}
          className="select-dark sm:w-56"
        >
          <option value="ALL">Todas las categorías</option>
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
        <div className="flex-1" />
        {categoryFilter !== 'ALL' && (
          <button
            onClick={() => setCategoryFilter('ALL')}
            className="btn-ghost text-xs text-amber-400"
          >
            ← Ver todas
          </button>
        )}
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo Gasto
        </button>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {isLoading ? (
          <LoadingSpinner size="md" className="py-12" />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto mb-3 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            <p className="font-medium text-sm">No hay gastos registrados.</p>
          </div>
        ) : (
          filtered.map((expense) => (
            <div
              key={expense.id}
              onClick={() => setEditingExpense(expense)}
              className="card p-4 flex items-center gap-3 hover:bg-surface-700/60 active:bg-surface-700 transition-colors cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-gray-100 truncate">{expense.concept}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${CATEGORY_COLORS[expense.category]}`}>
                    {CATEGORY_LABELS[expense.category]}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-0.5">
                  <span>{new Date(expense.expense_date).toLocaleDateString('es-MX')}</span>
                  <span className="text-gray-600">·</span>
                  <span className="font-semibold text-gray-100 tabular-nums">{formatCurrency(expense.amount)}</span>
                </div>
                {expense.notes && (
                  <p className="text-xs text-gray-500 truncate">{expense.notes}</p>
                )}
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`¿Eliminar el gasto "${expense.concept}"?`))
                      deleteMutation.mutate(expense.id)
                  }}
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            <p className="font-medium text-sm">No hay gastos registrados.</p>
          </div>
        ) : (
          <table className="table-dark">
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Categoría</th>
                <th>Fecha</th>
                <th className="text-right">Monto</th>
                <th>Notas</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((expense) => (
                <tr key={expense.id}>
                  <td className="font-medium text-gray-100">{expense.concept}</td>
                  <td>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[expense.category]}`}>
                      {CATEGORY_LABELS[expense.category]}
                    </span>
                  </td>
                  <td className="text-gray-400">
                    {new Date(expense.expense_date).toLocaleDateString('es-MX')}
                  </td>
                  <td className="text-right font-semibold text-gray-100 tabular-nums">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="text-gray-500 text-xs max-w-xs truncate">{expense.notes ?? '—'}</td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingExpense(expense)}
                        className="btn-ghost"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar el gasto "${expense.concept}"?`))
                            deleteMutation.mutate(expense.id)
                        }}
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

      {showCreateModal && (
        <Modal title="Nuevo Gasto" onClose={() => setShowCreateModal(false)}>
          <ExpenseForm
            onSubmit={async (data) => createMutation.mutateAsync(data)}
            onCancel={() => setShowCreateModal(false)}
            isLoading={createMutation.isPending}
          />
        </Modal>
      )}

      {editingExpense && (
        <Modal title="Editar Gasto" onClose={() => setEditingExpense(null)}>
          <ExpenseForm
            defaultValues={editingExpense}
            onSubmit={async (data) => updateMutation.mutateAsync({ id: editingExpense.id, data })}
            onCancel={() => setEditingExpense(null)}
            isLoading={updateMutation.isPending}
          />
        </Modal>
      )}
    </div>
  )
}
