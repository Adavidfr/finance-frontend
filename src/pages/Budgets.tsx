import { useEffect, useState, type FormEvent } from 'react'
import { Plus, AlertTriangle, Pencil, Trash2 } from 'lucide-react'
import Layout from '../components/Layout'
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../api/budgets'
import { getCategories } from '../api/transactions'
import type { Budget } from '../types/budget'
import type { Category } from '../types/transaction'

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [b, c] = await Promise.all([getBudgets(), getCategories()])
    setBudgets(b)
    setCategories(c.filter((cat) => cat.category_type === 'expense'))
    setLoading(false)
  }

  function handleCreated(newBudget: Budget) {
    setBudgets((prev) => [...prev, newBudget])
    setShowForm(false)
  }

  function handleUpdated(updated: Budget) {
    setBudgets((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
    setEditingBudget(null)
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este presupuesto?')) return
    await deleteBudget(id)
    setBudgets((prev) => prev.filter((b) => b.id !== id))
  }

  if (loading) {
    return (
      <Layout>
        <p className="text-slate-500">Cargando...</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Presupuestos</h2>
        <button
          onClick={() => {
            setEditingBudget(null)
            setShowForm((v) => !v)
          }}
          className="flex items-center gap-2 text-sm bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-700"
        >
          <Plus size={16} />
          Nuevo presupuesto
        </button>
      </div>

      {showForm && !editingBudget && (
        <BudgetForm categories={categories} onSaved={handleCreated} />
      )}

      {editingBudget && (
        <BudgetForm
          categories={categories}
          budget={editingBudget}
          onSaved={handleUpdated}
          onCancel={() => setEditingBudget(null)}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {budgets.map((budget) => {
          const category = categories.find((c) => c.id === budget.category)
          return (
            <BudgetCard
              key={budget.id}
              budget={budget}
              categoryName={category?.name}
              onEdit={() => {
                setShowForm(false)
                setEditingBudget(budget)
              }}
              onDelete={() => handleDelete(budget.id)}
            />
          )
        })}
      </div>

      {budgets.length === 0 && (
        <p className="text-slate-400 text-sm">Todavía no tienes presupuestos creados.</p>
      )}
    </Layout>
  )
}

function BudgetForm({
  categories,
  budget,
  onSaved,
  onCancel,
}: {
  categories: Category[]
  budget?: Budget
  onSaved: (b: Budget) => void
  onCancel?: () => void
}) {
  const isEditing = !!budget
  const [category, setCategory] = useState<number | ''>(
    budget?.category ?? categories[0]?.id ?? ''
  )
  const [limitAmount, setLimitAmount] = useState(budget?.limit_amount ?? '')
  const [period, setPeriod] = useState<'weekly' | 'monthly'>(budget?.period ?? 'monthly')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!category || !limitAmount) return

    try {
      if (isEditing) {
        const updated = await updateBudget(budget.id, {
          limit_amount: Number(limitAmount),
          period,
          alert_threshold: budget.alert_threshold,
        })
        onSaved(updated)
      } else {
        const newBudget = await createBudget({
          category,
          limit_amount: Number(limitAmount),
          period,
          alert_threshold: 0.8,
        })
        onSaved(newBudget)
      }
    } catch {
      setError('No se pudo guardar el presupuesto. ¿Ya existe uno para esta categoría y período?')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-slate-200 p-5 mb-2 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
          <select
            value={category}
            onChange={(e) => setCategory(Number(e.target.value))}
            disabled={isEditing}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-400"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Límite ($)</label>
          <input
            type="number"
            step="0.01"
            value={limitAmount}
            onChange={(e) => setLimitAmount(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Período</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'weekly' | 'monthly')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="monthly">Mensual</option>
            <option value="weekly">Semanal</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          className="text-sm bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
        >
          Guardar
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-slate-500 px-4 py-2 rounded-lg hover:bg-slate-100"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

function BudgetCard({
  budget,
  categoryName,
  onEdit,
  onDelete,
}: {
  budget: Budget
  categoryName?: string
  onEdit: () => void
  onDelete: () => void
}) {
  const { progress } = budget
  const barColor = progress.is_alert ? 'bg-red-500' : 'bg-emerald-500'

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-slate-800">{categoryName ?? 'Categoría'}</span>
        <div className="flex items-center gap-2">
          {progress.is_alert && (
            <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
              <AlertTriangle size={14} />
              Cerca del límite
            </span>
          )}
          <button onClick={onEdit} className="text-slate-400 hover:text-slate-700">
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} className="text-slate-400 hover:text-red-600">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
        <div
          className={`h-2.5 rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(progress.percentage, 100)}%` }}
        />
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-slate-500">
          ${progress.spent.toFixed(2)} de ${progress.limit.toFixed(2)}
        </span>
        <span className="text-slate-400">{progress.percentage.toFixed(0)}%</span>
      </div>
    </div>
  )
}