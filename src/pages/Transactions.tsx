import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Check,
  Plus,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from "lucide-react";
import Layout from "../components/Layout";
import AddTransactionModal from "../components/AddTransactionModal";
import EditTransactionModal from "../components/EditTransactionModal";
import { CategoryIcon } from "../utils/categoryIcons";
import {
  getTransactions,
  getTransactionById,
  getCategories,
  updateTransactionCategory,
  confirmTransaction,
  deleteTransaction,
} from "../api/transactions";
import { getAccounts } from "../api/accounts";
import type { Transaction, Category } from "../types/transaction";
import type { Account } from "../types/account";

const PAGE_SIZE = 25;
const MAX_POLL_ATTEMPTS = 8; // ~12 segundos a 1.5s por intento, luego se rinde

const DIAS = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];
const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

// Se parsea a mano ("YYYY-MM-DD"): new Date("2026-09-23") se interpreta como UTC
// y en Ecuador (UTC-5) mostraría el día anterior.
function formatDayLabel(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const weekday = DIAS[new Date(y, m - 1, d).getDay()];
  return `${weekday}, ${d} de ${MESES[m - 1]} de ${y}`;
}

function formatSigned(value: number) {
  return `${value >= 0 ? "+" : "-"}$${Math.abs(value).toFixed(2)}`;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Map de id -> número de intentos de polling ya hechos para esa transacción
  const [pendingIds, setPendingIds] = useState<Map<number, number>>(new Map());

  // Agrupa por día (más reciente primero) y calcula el subtotal neto de cada grupo
  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of transactions) {
      const list = map.get(tx.date);
      if (list) list.push(tx);
      else map.set(tx.date, [tx]);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
      .map(([date, items]) => ({
        date,
        items,
        net: items.reduce((sum, t) => sum + parseFloat(t.amount), 0),
      }));
  }, [transactions]);

  useEffect(() => {
    loadData(page);
  }, [page]);

  useEffect(() => {
    if (pendingIds.size === 0) return;

    const interval = setInterval(async () => {
      const ids = Array.from(pendingIds.keys());
      const results = await Promise.all(
        ids.map((id) => getTransactionById(id)),
      );

      setTransactions((prev) =>
        prev.map((tx) => results.find((r) => r.id === tx.id) ?? tx),
      );

      setPendingIds((prev) => {
        const next = new Map(prev);
        results.forEach((r) => {
          if (r.categorization_method !== "pending") {
            next.delete(r.id);
            return;
          }
          const attempts = (next.get(r.id) ?? 0) + 1;
          if (attempts >= MAX_POLL_ATTEMPTS) {
            next.delete(r.id);
          } else {
            next.set(r.id, attempts);
          }
        });
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [pendingIds]);

  async function loadData(pageNumber: number) {
    setLoading(true);
    try {
      const [txPage, cats, accs] = await Promise.all([
        getTransactions(pageNumber),
        categories.length ? Promise.resolve(categories) : getCategories(),
        accounts.length ? Promise.resolve(accounts) : getAccounts(),
      ]);
      setTransactions(txPage.results);
      setTotalCount(txPage.count);
      if (!categories.length) setCategories(cats);
      if (!accounts.length) setAccounts(accs);

      const stillPending = txPage.results.filter(
        (tx) => tx.categorization_method === "pending",
      );
      if (stillPending.length > 0) {
        setPendingIds((prev) => {
          const next = new Map(prev);
          stillPending.forEach((tx) => {
            if (!next.has(tx.id)) next.set(tx.id, 0);
          });
          return next;
        });
      }
    } catch {
      setError("No se pudieron cargar las transacciones.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCategoryChange(
    transactionId: number,
    categoryId: number,
  ) {
    const updated = await updateTransactionCategory(transactionId, categoryId);
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === transactionId ? updated : tx)),
    );
    setPendingIds((prev) => {
      if (!prev.has(transactionId)) return prev;
      const next = new Map(prev);
      next.delete(transactionId);
      return next;
    });
  }

  async function handleConfirm(transactionId: number) {
    const updated = await confirmTransaction(transactionId);
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === transactionId ? updated : tx)),
    );
  }

  function handleTransactionCreated(newTx: Transaction) {
    if (page === 1) {
      setTransactions((prev) => [newTx, ...prev].slice(0, PAGE_SIZE));
      setTotalCount((c) => c + 1);
    } else {
      setPage(1);
    }
    setPendingIds((prev) => new Map(prev).set(newTx.id, 0));
  }

  function handleTransactionUpdated(updated: Transaction) {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === updated.id ? updated : tx)),
    );
    setEditingTransaction(null);
    if (updated.categorization_method === "pending") {
      setPendingIds((prev) => new Map(prev).set(updated.id, 0));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar esta transacción?")) return;
    await deleteTransaction(id);
    setPendingIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
    if (transactions.length === 1 && page > 1) {
      setPage((p) => p - 1);
    } else {
      loadData(page);
    }
  }

  if (loading && transactions.length === 0) {
    return (
      <Layout>
        <p className="text-slate-500">Cargando...</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <p className="text-red-600">{error}</p>
      </Layout>
    );
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
          <thead className="border-b border-slate-200">
            <tr className="text-left text-slate-500">
              <th className="px-4 py-3 font-medium">Descripción</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Método</th>
              <th className="px-4 py-3 font-medium text-right">Monto</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {groups.map((group, index) => {
              // El primer día de una página > 1 puede venir de la anterior, y el último
              // de una página que no es la final puede continuar en la siguiente.
              const continuesFromPrev = index === 0 && page > 1;
              const continuesOnNext =
                index === groups.length - 1 && page < totalPages;
              const isPartial = continuesFromPrev || continuesOnNext;

              return (
                <Fragment key={group.date}>
                  <tr className="bg-slate-50">
                    <td
                      colSpan={3}
                      className="px-4 py-2 text-xs font-medium text-slate-500 first-letter:uppercase"
                    >
                      {formatDayLabel(group.date)}
                    </td>
                    <td
                      colSpan={2}
                      className="px-4 py-2 text-right text-xs font-medium text-slate-500"
                    >
                      {isPartial && (
                        <span
                          className="mr-2 text-slate-400"
                          title="Este día continúa en otra página: el subtotal solo cuenta las filas visibles."
                        >
                          parcial
                        </span>
                      )}
                      {formatSigned(group.net)}
                    </td>
                  </tr>

                  {group.items.map((tx) => (
                    <TransactionRow
                      key={tx.id}
                      transaction={tx}
                      categories={categories}
                      category={categories.find((c) => c.id === tx.category)}
                      isPending={pendingIds.has(tx.id)}
                      onCategoryChange={handleCategoryChange}
                      onConfirm={handleConfirm}
                      onEdit={() => setEditingTransaction(tx)}
                      onDelete={() => handleDelete(tx.id)}
                    />
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
          <span>
            {totalCount === 0
              ? "Sin transacciones"
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
  );
}

function TransactionRow({
  transaction,
  categories,
  category,
  isPending,
  onCategoryChange,
  onConfirm,
  onEdit,
  onDelete,
}: {
  transaction: Transaction;
  categories: Category[];
  category?: Category;
  isPending: boolean;
  onCategoryChange: (id: number, categoryId: number) => void;
  onConfirm: (id: number) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const amount = parseFloat(transaction.amount);
  const isExpense = amount < 0;
  const iconColor = category?.color || "#94a3b8";

  return (
    <tr className={`hover:bg-slate-50 ${isPending ? "bg-amber-50/40" : ""}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${iconColor}1A` }}
          >
            <CategoryIcon
              iconName={category?.icon ?? ""}
              size={15}
              color={iconColor}
            />
          </span>
          <span className="text-slate-800">{transaction.description}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        {isPending ? (
          <span className="flex items-center gap-1.5 text-xs text-amber-600">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Categorizando...
          </span>
        ) : (
          <select
            value={transaction.category ?? ""}
            onChange={(e) =>
              onCategoryChange(transaction.id, Number(e.target.value))
            }
            className="text-sm border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700"
          >
            <option
              value=""
              disabled
            >
              Sin categoría
            </option>
            {categories.map((cat) => (
              <option
                key={cat.id}
                value={cat.id}
              >
                {cat.name}
              </option>
            ))}
          </select>
        )}
      </td>
      <td className="px-4 py-3">
        <MethodBadge method={transaction.categorization_method} />
      </td>
      <td
        className={`px-4 py-3 text-right font-medium ${
          isExpense ? "text-red-600" : "text-emerald-600"
        }`}
      >
        ${Math.abs(amount).toFixed(2)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          {transaction.categorization_method === "llm" && (
            <button
              onClick={() => onConfirm(transaction.id)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600 border border-slate-200 rounded-md px-2 py-1"
            >
              <Check size={12} />
              Confirmar
            </button>
          )}
          <button
            onClick={onEdit}
            className="text-slate-400 hover:text-slate-700"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            className="text-slate-400 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function MethodBadge({
  method,
}: {
  method: Transaction["categorization_method"];
}) {
  const styles: Record<Transaction["categorization_method"], string> = {
    rule: "bg-slate-100 text-slate-600",
    llm: "bg-purple-100 text-purple-700",
    manual: "bg-blue-100 text-blue-700",
    pending: "bg-amber-100 text-amber-700",
  };

  const labels: Record<Transaction["categorization_method"], string> = {
    rule: "Regla",
    llm: "IA",
    manual: "Manual",
    pending: "Pendiente",
  };

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-medium ${styles[method]}`}
    >
      {labels[method]}
    </span>
  );
}
