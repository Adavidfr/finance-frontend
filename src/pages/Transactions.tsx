import { useEffect, useState } from 'react'
import { Check, Plus, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import Layout from '../components/Layout'
import AddTransactionModal from '../components/AddTransactionModal'
import EditTransactionModal from '../components/EditTransactionModal'
import {
  getTransactions,
  getCategories,
  updateTransactionCategory,
  confirmTransaction,
  deleteTransaction,
} from '../api/transactions'
import { getAccounts } from '../api/accounts'
import type { Transaction, Category } from '../types/transaction'
import type { Account } from '../types/account'

const PAGE_SIZE = 25

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  useEffect(() => {
    loadData(page)
  }, [page])

  async function loadData(pageNumber: number) {
    setLoading(true)
    try {
      const [txPage, cats, accs] = await Promise.all([
        getTransactions(pageNumber),
        categories.length ? Promise.resolve(categories) : getCategories(),
        accounts.length ? Promise.resolve(accounts) : getAccounts(),
      ])
      setTransactions(txPage.results)
      setTotalCount(txPage.count)
      if (!categories.length) setCategories(cats)
      if (!accounts.length) setAccounts(accs)
    } catch {
      setError('No se pudieron cargar las transacciones.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCategoryChange(transactionId: number, categoryId: number) {
    const updated = await updateTransactionCategory(transactionId, categoryId)
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === transactionId ? updated : tx))
    )
  }

  async function handleConfirm(transactionId: number) {
    const updated = await confirmTransaction(transactionId)
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === transactionId ? updated : tx))
    )
  }

  function handleTransactionCreated() {
    if (page === 1) {
      loadData(1)
    } else {
      setPage(1)
    }
  }

  function handleTransactionUpdated(updated: Transaction) {
    setTransactions((prev) => prev.map((tx) => (tx.id === updated.id ? updated : tx)))
    setEditingTransaction(null)
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar esta transacción?')) return
    await deleteTransaction(id)
    // Si era la última de la página (y no es la página 1), retrocede una página
    if (transactions.length === 1 && page > 1) {
      setPage((p) => p - 1)
    } else {
      loadData(page)
    }
  }

  if (loading && transactions.length === 0) {
    return (
      <Layout>
        <p className="text-slate-500">Cargando...</p>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <p className="text-red-600">{error}</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Transacciones</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-sm bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-700"
        >
          <Plus size={16} />
          Agregar transacción
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-slate-500">
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Descripción</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Método</th>
              <th className="px-4 py-3 font-medium text-right">Monto</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                categories={categories}
                onCategoryChange={handleCategoryChange}
                onConfirm={handleConfirm}
                onEdit={() => setEditingTransaction(tx)}
                onDelete={() => handleDelete(tx.id)}
              />
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
          <span>
            {totalCount === 0
              ? 'Sin transacciones'
              : `Página ${page} de ${totalPages} · ${totalCount} transacciones`}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-md border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-md border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <AddTransactionModal
          accounts={accounts}
          onClose={() => setShowModal(false)}
          onCreated={handleTransactionCreated}
        />
      )}

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onUpdated={handleTransactionUpdated}
        />
      )}
    </Layout>
  )
}

function TransactionRow({
  transaction,
  categories,
  onCategoryChange,
  onConfirm,
  onEdit,
  onDelete,
}: {
  transaction: Transaction
  categories: Category[]
  onCategoryChange: (id: number, categoryId: number) => void
  onConfirm: (id: number) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const amount = parseFloat(transaction.amount)
  const isExpense = amount < 0

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3 text-slate-500">{transaction.date}</td>
      <td className="px-4 py-3 text-slate-800">{transaction.description}</td>
      <td className="px-4 py-3">
        <select
          value={transaction.category ?? ''}
          onChange={(e) => onCategoryChange(transaction.id, Number(e.target.value))}
          className="text-sm border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700"
        >
          <option value="" disabled>
            Sin categoría
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <MethodBadge method={transaction.categorization_method} />
      </td>
      <td
        className={`px-4 py-3 text-right font-medium ${
          isExpense ? 'text-red-600' : 'text-emerald-600'
        }`}
      >
        ${Math.abs(amount).toFixed(2)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          {transaction.categorization_method === 'llm' && (
            <button
              onClick={() => onConfirm(transaction.id)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600 border border-slate-200 rounded-md px-2 py-1"
            >
              <Check size={12} />
              Confirmar
            </button>
          )}
          <button onClick={onEdit} className="text-slate-400 hover:text-slate-700">
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} className="text-slate-400 hover:text-red-600">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

function MethodBadge({ method }: { method: Transaction['categorization_method'] }) {
  const styles: Record<Transaction['categorization_method'], string> = {
    rule: 'bg-slate-100 text-slate-600',
    llm: 'bg-purple-100 text-purple-700',
    manual: 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
  }

  const labels: Record<Transaction['categorization_method'], string> = {
    rule: 'Regla',
    llm: 'IA',
    manual: 'Manual',
    pending: 'Pendiente',
  }

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[method]}`}>
      {labels[method]}
    </span>
  )
}