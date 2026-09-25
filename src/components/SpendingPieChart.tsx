import { useState } from 'react'
import { PieChart as PieIcon, BarChart3 } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { CategorySpending } from '../types/finance'
import { CategoryIcon } from '../utils/categoryIcons'

type ChartType = 'pie' | 'bar'

export default function SpendingPieChart({ data }: { data: CategorySpending[] }) {
  const [chartType, setChartType] = useState<ChartType>('pie')

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-center h-72">
        <p className="text-slate-400 text-sm">Todavía no hay gastos categorizados este mes.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-600">Gasto por categoría</h3>

        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setChartType('pie')}
            className={`p-1.5 rounded-md transition-colors ${
              chartType === 'pie' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'
            }`}
            aria-label="Ver como pastel"
          >
            <PieIcon size={16} />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded-md transition-colors ${
              chartType === 'bar' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'
            }`}
            aria-label="Ver como barras"
          >
            <BarChart3 size={16} />
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        {chartType === 'pie' ? (
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category_name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ category_name, percent }) =>
                `${category_name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
            >
              {data.map((entry) => (
                <Cell key={entry.category_id} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
          </PieChart>
        ) : (
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis
              type="category"
              dataKey="category_name"
              tick={{ fontSize: 12 }}
              stroke="#94a3b8"
              width={100}
            />
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
              {data.map((entry) => (
                <Cell key={entry.category_id} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>

      {chartType === 'pie' && (
        <div className="flex flex-wrap gap-3 mt-3 justify-center">
          {data.map((entry) => (
            <div key={entry.category_id} className="flex items-center gap-1.5 text-xs">
              <CategoryIcon iconName={entry.icon} size={14} color={entry.color} />
              <span className="text-slate-600">{entry.category_name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}