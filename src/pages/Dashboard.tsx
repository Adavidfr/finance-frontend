import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import Layout from '../components/Layout'
import SpendingPieChart from '../components/SpendingPieChart'
import MonthlyTrendChart from '../components/MonthlyTrendChart'
import { getDashboardSummary } from '../api/finance'
import type { DashboardSummary } from '../types/finance'

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch(() => setError('No se pudo cargar el dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Layout>
        <p className="text-slate-500">Cargando...</p>
      </Layout>
    )
  }

  if (error || !summary) {
    return (
      <Layout>
        <p className="text-red-600">{error || 'Sin datos disponibles.'}</p>
      </Layout>
    )
  }

  const { current_month } = summary

  return (
    <Layout>
      <h2 className="text-xl font-semibold text-slate-800 mb-6">Resumen del mes</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <SummaryCard
          label="Ingresos"
          amount={current_month.income}
          icon={<TrendingUp size={20} className="text-emerald-600" />}
        />
        <SummaryCard
          label="Gastos"
          amount={current_month.expenses}
          icon={<TrendingDown size={20} className="text-red-600" />}
        />
        <SummaryCard
          label="Balance"
          amount={current_month.balance}
          icon={<Wallet size={20} className="text-slate-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingPieChart data={summary.spending_by_category} />
        <MonthlyTrendChart data={summary.monthly_trend} />
      </div>
    </Layout>
  )
}

function SummaryCard({
  label,
  amount,
  icon,
}: {
  label: string
  amount: number
  icon: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-500">{label}</span>
        {icon}
      </div>
      <span className="text-2xl font-semibold text-slate-800">
        ${amount.toFixed(2)}
      </span>
    </div>
  )
}