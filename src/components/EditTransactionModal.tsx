import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { updateTransaction } from '../api/transactions'
import type { Transaction } from '../types/transaction'

export default function EditTransactionModal({
  transaction,
  onClose,
  onUpdated,
}: {
  transaction: Transaction
  onClose: () => void
  onUpdated: (tx: Transaction) => void
}) {
  const originalAmount = parseFloat(transaction.amount)
  const [type, setType] = useState<'expense' | 'income'>(
    originalAmount < 0 ? 'expense' : 'income'
  )
  const [amount, setAmount] = useState(Math.abs(originalAmount).toString())
  const [date, setDate] = useState(transaction.date)
  const [description, setDescription] = useState(transaction.description)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!amount || !description) return

    setSaving(true)
    setError('')

    const signedAmount = type === 'expense' ? -Math.abs(Number(amount)) : Math.abs(Number(amount))

    try {
      const updated = await updateTransaction(transaction.id, {
        amount: signedAmount,
        date,
        description,
      })
      onUpdated(updated)
      onClose()
    } catch {
      setError('No se pudo guardar la transacción.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Editar transacción</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border ${
                type === 'expense'
                  ? 'bg-red-50 border-red-300 text-red-700'
                  : 'border-slate-200 text-slate-500'
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border ${
                type === 'income'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'border-slate-200 text-slate-500'
              }`}
            >
              Ingreso
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monto ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-slate-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}