import { ChevronLeft, ChevronRight } from "lucide-react";

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

export interface Period {
  year: number;
  month: number; // 1-12
}

export default function MonthSelector({
  period,
  onChange,
}: {
  period: Period;
  onChange: (p: Period) => void;
}) {
  const now = new Date();
  const isCurrentMonth =
    period.year === now.getFullYear() && period.month === now.getMonth() + 1;

  function shift(delta: number) {
    // Date normaliza solo los desbordes: mes 0 -> diciembre del año anterior, mes 13 -> enero del siguiente
    const d = new Date(period.year, period.month - 1 + delta, 1);
    onChange({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }

  return (
    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
      <button
        onClick={() => shift(-1)}
        className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
        aria-label="Mes anterior"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="px-2 text-sm font-medium text-slate-700 min-w-36 text-center">
        {MESES[period.month - 1]} de {period.year}
      </span>
      <button
        onClick={() => shift(1)}
        disabled={isCurrentMonth}
        className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label="Mes siguiente"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
