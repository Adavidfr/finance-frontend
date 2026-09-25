import { useEffect, useState } from 'react'
import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react'
import Layout from '../components/Layout'
import { getInsights, generateInsights } from '../api/insights'
import type { Insight } from '../types/insight'

export default function Insights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getInsights()
      .then(setInsights)
      .catch(() => setError('No se pudieron cargar los insights.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleGenerate() {
    setGenerating(true)
    setError('')
    try {
      const newInsights = await generateInsights()
      if (newInsights.length === 0) {
        setError('No hay cambios significativos este mes todavía para generar un insight nuevo.')
      } else {
        setInsights((prev) => [...newInsights, ...prev])
      }
    } catch {
      setError('No se pudieron generar insights nuevos.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <p className="text-slate-500">Cargando...</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Insights</h2>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 text-sm bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-700 disabled:opacity-50"
        >
          <Sparkles size={16} />
          {generating ? 'Generando...' : 'Generar insights'}
        </button>
      </div>

      {error && <p className="text-sm text-amber-600 mb-4">{error}</p>}

      <div className="space-y-3">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      {insights.length === 0 && !error && (
        <p className="text-slate-400 text-sm">
          Todavía no hay insights generados. Haz clic en "Generar insights" para analizar tus
          gastos del mes.
        </p>
      )}
    </Layout>
  )
}

function InsightCard({ insight }: { insight: Insight }) {
  const pctChange = insight.supporting_data.pct_change as number | undefined
  const isIncrease = typeof pctChange === 'number' && pctChange > 0

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
      <div
        className={`mt-0.5 rounded-full p-1.5 ${
          isIncrease ? 'bg-red-50' : 'bg-emerald-50'
        }`}
      >
        {isIncrease ? (
          <TrendingUp size={14} className="text-red-500" />
        ) : (
          <TrendingDown size={14} className="text-emerald-500" />
        )}
      </div>
      <div>
        <p className="text-sm text-slate-700">{insight.generated_text}</p>
        <p className="text-xs text-slate-400 mt-1">
          {new Date(insight.created_at).toLocaleDateString('es-EC', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>
    </div>
  )
}