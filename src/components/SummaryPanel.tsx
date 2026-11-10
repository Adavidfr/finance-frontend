import { Hash, TrendingUp, Calculator } from "lucide-react";
import type { TransactionStats } from "../types/finance";

export default function SummaryPanel({ stats }: { stats: TransactionStats }) {
  const rows = [
    {
      label: "Transacciones",
      value: stats.total_transactions.toString(),
      icon: Hash,
    },
    {
      label: "La más grande",
      value: `$${stats.largest_transaction.toFixed(2)}`,
      icon: TrendingUp,
    },
    {
      label: "Promedio",
      value: `$${stats.average_transaction.toFixed(2)}`,
      icon: Calculator,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-medium text-slate-600 mb-4">Estadísticas</h3>
      <div className="space-y-4">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-slate-500">
              <row.icon size={15} />
              <span className="text-sm">{row.label}</span>
            </div>
            <span className="text-sm font-medium text-slate-800">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
