import { useState } from "react";
import { PieChart as PieIcon, BarChart3 } from "lucide-react";
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
} from "recharts";
import type { CategorySpending } from "../types/finance";
import { CategoryIcon } from "../utils/categoryIcons";

type ChartType = "pie" | "bar";

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

export default function SpendingPieChart({
  data,
}: {
  data: CategorySpending[];
}) {
  const [chartType, setChartType] = useState<ChartType>("pie");
  const [activeId, setActiveId] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-center h-72">
        <p className="text-slate-400 text-sm">
          No hay gastos categorizados en este período.
        </p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const active = data.find((item) => item.category_id === activeId) ?? null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-600">
          Gasto por categoría
        </h3>

        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setChartType("pie")}
            className={`p-1.5 rounded-md transition-colors ${
              chartType === "pie"
                ? "bg-white shadow-sm text-slate-800"
                : "text-slate-400"
            }`}
            aria-label="Ver como anillo"
          >
            <PieIcon size={16} />
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={`p-1.5 rounded-md transition-colors ${
              chartType === "bar"
                ? "bg-white shadow-sm text-slate-800"
                : "text-slate-400"
            }`}
            aria-label="Ver como barras"
          >
            <BarChart3 size={16} />
          </button>
        </div>
      </div>

      {chartType === "pie" ? (
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Anillo con el total (o la categoría resaltada) al centro */}
          <div className="relative w-56 h-56 shrink-0">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="category_name"
                  innerRadius={72}
                  outerRadius={104}
                  paddingAngle={2}
                  stroke="none"
                  onMouseEnter={(_: unknown, index: number) =>
                    setActiveId(data[index].category_id)
                  }
                  onMouseLeave={() => setActiveId(null)}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.category_id}
                      fill={entry.color}
                      fillOpacity={
                        activeId === null || activeId === entry.category_id
                          ? 1
                          : 0.25
                      }
                      style={{ transition: "fill-opacity 150ms" }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-500 max-w-28 truncate">
                {active ? active.category_name : "Total"}
              </span>
              <span className="text-xl font-semibold text-slate-800">
                {money(active ? active.amount : total)}
              </span>
            </div>
          </div>

          {/* Leyenda lateral: ícono, nombre, monto y porcentaje */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            {data.map((entry) => {
              const percent = total > 0 ? (entry.amount / total) * 100 : 0;
              return (
                <div
                  key={entry.category_id}
                  onMouseEnter={() => setActiveId(entry.category_id)}
                  onMouseLeave={() => setActiveId(null)}
                  className={`flex items-start gap-2 rounded-lg px-2 py-2 transition-colors ${
                    activeId === entry.category_id ? "bg-slate-50" : ""
                  }`}
                >
                  <CategoryIcon
                    iconName={entry.icon}
                    size={16}
                    color={entry.color}
                    className="mt-0.5 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-slate-700 truncate">
                      {entry.category_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {money(entry.amount)} ({percent.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <ResponsiveContainer
          width="100%"
          height={280}
        >
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
            />
            <XAxis
              type="number"
              tick={{ fontSize: 12 }}
              stroke="#94a3b8"
            />
            <YAxis
              type="category"
              dataKey="category_name"
              tick={{ fontSize: 12 }}
              stroke="#94a3b8"
              width={100}
            />
            <Tooltip formatter={(value: number) => money(value)} />
            <Bar
              dataKey="amount"
              radius={[0, 4, 4, 0]}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.category_id}
                  fill={entry.color}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
