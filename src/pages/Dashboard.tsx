import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import Layout from "../components/Layout";
import SpendingPieChart from "../components/SpendingPieChart";
import MonthlyTrendChart from "../components/MonthlyTrendChart";
import SummaryPanel from "../components/SummaryPanel";
import MonthSelector, { type Period } from "../components/MonthSelector";
import { getDashboardSummary } from "../api/finance";
import type { DashboardSummary } from "../types/finance";

function currentPeriod(): Period {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>(currentPeriod);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Si el usuario cambia de mes rápido, ignora las respuestas de pedidos viejos
    let cancelled = false;
    setRefreshing(true);

    getDashboardSummary(period.year, period.month)
      .then((data) => {
        if (cancelled) return;
        setSummary(data);
        setError("");
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo cargar el dashboard.");
      })
      .finally(() => {
        if (cancelled) return;
        setInitialLoading(false);
        setRefreshing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [period]);

  if (initialLoading) {
    return (
      <Layout>
        <p className="text-slate-500">Cargando...</p>
      </Layout>
    );
  }

  if (!summary) {
    return (
      <Layout>
        <p className="text-red-600">{error || "Sin datos disponibles."}</p>
      </Layout>
    );
  }

  const { current_month } = summary;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Resumen</h2>
        <MonthSelector
          period={period}
          onChange={setPeriod}
        />
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div
        className={`grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 transition-opacity ${
          refreshing ? "opacity-60" : ""
        }`}
      >
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <SummaryCard
              label="Ingresos"
              amount={current_month.income}
              icon={
                <TrendingUp
                  size={20}
                  className="text-emerald-600"
                />
              }
            />
            <SummaryCard
              label="Gastos"
              amount={current_month.expenses}
              icon={
                <TrendingDown
                  size={20}
                  className="text-red-600"
                />
              }
            />
            <SummaryCard
              label="Balance"
              amount={current_month.balance}
              icon={
                <Wallet
                  size={20}
                  className="text-slate-600"
                />
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <SpendingPieChart data={summary.spending_by_category} />
            <MonthlyTrendChart data={summary.monthly_trend} />
          </div>
        </div>

        <SummaryPanel stats={summary.stats} />
      </div>
    </Layout>
  );
}

function SummaryCard({
  label,
  amount,
  icon,
}: {
  label: string;
  amount: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-500">{label}</span>
        {icon}
      </div>
      <span className="text-2xl font-semibold text-slate-800">
        {amount < 0 ? "-" : ""}${Math.abs(amount).toFixed(2)}
      </span>
    </div>
  );
}
