import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyTrend } from "../types/finance";

const MESES_CORTOS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

// "2026-09" -> "sep". Si el rango cruza de año, el tooltip ya muestra el año completo.
function shortMonth(value: string) {
  const [, month] = value.split("-").map(Number);
  return MESES_CORTOS[month - 1] ?? value;
}

function longMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  return `${MESES_CORTOS[month - 1]} ${year}`;
}

export default function MonthlyTrendChart({ data }: { data: MonthlyTrend[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-medium text-slate-600 mb-4">
        Evolución mensual
      </h3>
      <ResponsiveContainer
        width="100%"
        height={280}
      >
        <AreaChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id="fillIncome"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#22C55E"
                stopOpacity={0.3}
              />
              <stop
                offset="100%"
                stopColor="#22C55E"
                stopOpacity={0.02}
              />
            </linearGradient>
            <linearGradient
              id="fillExpenses"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#EF4444"
                stopOpacity={0.25}
              />
              <stop
                offset="100%"
                stopColor="#EF4444"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tickFormatter={shortMonth}
            tick={{ fontSize: 12 }}
            stroke="#94a3b8"
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => `$${v}`}
            tick={{ fontSize: 12 }}
            stroke="#94a3b8"
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <Tooltip
            labelFormatter={(label) => longMonth(String(label))}
            formatter={(value: number) => `$${value.toFixed(2)}`}
          />
          <Legend />

          <Area
            type="monotone"
            dataKey="income"
            name="Ingresos"
            stroke="#22C55E"
            strokeWidth={2}
            fill="url(#fillIncome)"
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Gastos"
            stroke="#EF4444"
            strokeWidth={2}
            fill="url(#fillExpenses)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
