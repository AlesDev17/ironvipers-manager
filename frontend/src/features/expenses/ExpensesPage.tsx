import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../../lib/api'
import { Expense, ExpenseCategory } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'

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

const expenseSchema = z.object({
  concept: z.string().min(1, 'El concepto es requerido'),
  amount: z.coerce.number().positive('El monto debe ser positivo'),
  category: z.enum(['RENTA', 'LUZ', 'AGUA', 'HERRAMIENTA', 'PIEZAS', 'NOMINA', 'OTRO']),
  expense_date: z.string().min(1, 'La fecha es requerida'),
  notes: z.string().optional(),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Concepto <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('concept')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          placeholder="Descripción del gasto"
        />
        {errors.concept && <p className="mt-1 text-sm text-red-600">{errors.concept.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monto ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            {...register('amount')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
          {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            {...register('category')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          {...register('expense_date')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
        {errors.expense_date && (
          <p className="mt-1 text-sm text-red-600">{errors.expense_date.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea
          {...register('notes')}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
        />
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

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategory | 'ALL')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        >
          <option value="ALL">Todas las categorías</option>
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
        <div className="flex-1" />
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition whitespace-nowrap"
        >
          + Nuevo Gasto
        </button>
      </div>

      {/* Summary */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-6 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Total ({filtered.length} gasto{filtered.length !== 1 ? 's' : ''})
          </span>
          <span className="text-lg font-bold text-gray-900">
            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
              totalFiltered
            )}
          </span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner size="md" className="py-12" />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">No hay gastos registrados.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Concepto</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Categoría</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Monto</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Notas</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((expense, idx) => (
                <tr key={expense.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-6 py-3 font-medium text-gray-900">{expense.concept}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {CATEGORY_LABELS[expense.category]}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {new Date(expense.expense_date).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-6 py-3 text-right font-semibold text-gray-900">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs max-w-xs truncate">
                    {expense.notes ?? '—'}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingExpense(expense)}
                        className="text-gray-500 hover:text-primary-600 text-xs font-medium px-2 py-1 rounded hover:bg-primary-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar el gasto "${expense.concept}"?`))
                            deleteMutation.mutate(expense.id)
                        }}
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
            onSubmit={async (data) =>
              updateMutation.mutateAsync({ id: editingExpense.id, data })
            }
            onCancel={() => setEditingExpense(null)}
            isLoading={updateMutation.isPending}
          />
        </Modal>
      )}
    </div>
  )
}
