import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Target, TrendingUp, TrendingDown, Pencil, Trash2 } from 'lucide-react'
import Layout from '../components/Layout'
import { getGoals, createGoal, updateGoal, deleteGoal } from '../api/goals'
import type { SavingsGoal } from '../types/goal'

export default function Goals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)

  useEffect(() => {
    getGoals().then((g) => {
      setGoals(g)
      setLoading(false)
    })
  }, [])

  function handleCreated(newGoal: SavingsGoal) {
    setGoals((prev) => [...prev, newGoal])
    setShowForm(false)
  }

  function handleUpdated(updated: SavingsGoal) {
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
    setEditingGoal(null)
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar esta meta?')) return
    await deleteGoal(id)
    setGoals((prev) => prev.filter((g) => g.id !== id))
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
        <h2 className="text-xl font-semibold text-slate-800">Metas de ahorro</h2>
        <button
          onClick={() => {
            setEditingGoal(null)
            setShowForm((v) => !v)
          }}
          className="flex items-center gap-2 text-sm bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-700"
        >
          <Plus size={16} />
          Nueva meta
        </button>
      </div>

      {showForm && !editingGoal && <GoalForm onSaved={handleCreated} />}

      {editingGoal && (
        <GoalForm
          goal={editingGoal}
          onSaved={handleUpdated}
          onCancel={() => setEditingGoal(null)}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onEdit={() => {
              setShowForm(false)
              setEditingGoal(goal)
            }}
            onDelete={() => handleDelete(goal.id)}
          />
        ))}
      </div>

      {goals.length === 0 && (
        <p className="text-slate-400 text-sm">Todavía no tienes metas de ahorro creadas.</p>
      )}
    </Layout>
  )
}

function GoalForm({
  goal,
  onSaved,
  onCancel,
}: {
  goal?: SavingsGoal
  onSaved: (g: SavingsGoal) => void
  onCancel?: () => void
}) {
  const isEditing = !!goal
  const [name, setName] = useState(goal?.name ?? '')
  const [targetAmount, setTargetAmount] = useState(goal?.target_amount ?? '')
  const [currentAmount, setCurrentAmount] = useState(goal?.current_amount ?? '0')
  const [targetDate, setTargetDate] = useState(goal?.target_date ?? '')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name || !targetAmount) return

    const payload = {
      name,
      target_amount: Number(targetAmount),
      current_amount: Number(currentAmount) || 0,
      target_date: targetDate || undefined,
    }

    try {
      if (isEditing) {
        const updated = await updateGoal(goal.id, payload)
        onSaved(updated)
      } else {
        const newGoal = await createGoal(payload)
        onSaved(newGoal)
      }
    } catch {
      setError('No se pudo guardar la meta.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-slate-200 p-5 mb-2 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Fondo de emergencia"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Meta ($)</label>
          <input
            type="number"
            step="0.01"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Ya ahorrado ($)
          </label>
          <input
            type="number"
            step="0.01"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Fecha objetivo (opcional)
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
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

function GoalCard({
  goal,
  onEdit,
  onDelete,
}: {
  goal: SavingsGoal
  onEdit: () => void
  onDelete: () => void
}) {
  const { projection } = goal
  const target = parseFloat(goal.target_amount)
  const current = parseFloat(goal.current_amount)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-slate-400" />
          <span className="font-medium text-slate-800">{goal.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {projection.on_track !== null && (
            <span
              className={`flex items-center gap-1 text-xs font-medium ${
                projection.on_track ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {projection.on_track ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {projection.on_track ? 'En camino' : 'Retrasada'}
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
          className="h-2.5 rounded-full bg-slate-800 transition-all"
          style={{ width: `${Math.min(projection.percentage, 100)}%` }}
        />
      </div>

      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-500">
          ${current.toFixed(2)} de ${target.toFixed(2)}
        </span>
        <span className="text-slate-400">{projection.percentage.toFixed(0)}%</span>
      </div>

      {goal.target_date && (
        <p className="text-xs text-slate-400">Meta para: {goal.target_date}</p>
      )}
      {projection.projected_date && (
        <p className="text-xs text-slate-400">
          Proyección al ritmo actual: {projection.projected_date}
        </p>
      )}
    </div>
  )
}