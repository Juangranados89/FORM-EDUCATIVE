import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import Shell from '../components/dashboard/Shell'
import { api, ApiError, type ResponseRow, type Stats } from '../lib/api'
import { CATEGORIES } from '../lib/survey'

const CRIT = [
  { id: 'descanso', label: 'Deseo de no despertar' },
  { id: 'ausencia', label: 'Sentirse una carga para los demás' },
  { id: 'dolor', label: 'Idea de autolesión' },
]
// Puntaje de la escala de frecuencia: casi_siempre=3, siempre=4 → señal alta
const HIGH = new Set(['casi_siempre', 'siempre'])

export default function Factores() {
  const nav = useNavigate()
  const [rows, setRows] = useState<ResponseRow[] | null>(null)
  const [factores, setFactores] = useState<Stats['factores']>([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.responses(), api.stats()])
      .then(([r, s]) => {
        setRows(r.rows)
        setFactores(s.empty ? [] : (s.factores ?? []))
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) nav('/login')
        else setError('No se pudieron cargar los datos.')
      })
  }, [nav])

  const derived = useMemo(() => {
    if (!rows || rows.length === 0) return null
    const total = rows.length
    const pct = (n: number) => Math.round((n / total) * 100)
    const cats = CATEGORIES.map((c) => ({
      label: c.label.split(':')[0],
      n: rows.filter((r) => r.categories.includes(c.value)).length,
    })).sort((a, b) => b.n - a.n)
    const crit = CRIT.map((c) => ({
      label: c.label,
      n: rows.filter((r) => HIGH.has(r.answers[c.id])).length,
    }))
    const criticos = rows.filter((r) => r.criticalFlag).length
    return { total, pct, cats, crit, criticos }
  }, [rows])

  return (
    <Shell
      title="Factores de riesgo"
      subtitle="Qué está afectando más al grupo y qué señales requieren atención."
    >
      {error && (
        <p className="mt-6 rounded-2xl bg-coral/10 p-4 text-center text-sm font-semibold text-coral">
          {error}
        </p>
      )}
      {!rows && !error && (
        <p className="mt-16 text-center text-sm font-semibold text-muted">Cargando…</p>
      )}
      {rows && rows.length === 0 && (
        <p className="mt-16 text-center text-sm text-muted">Aún no hay respuestas.</p>
      )}

      {derived && (
        <>
          {derived.criticos > 0 && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#ffecec] p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-coral text-white">
                <AlertTriangle size={20} />
              </span>
              <p className="text-sm font-semibold text-ink">
                <span className="font-bold text-coral">{derived.criticos}</span>{' '}
                {derived.criticos === 1 ? 'respuesta' : 'respuestas'} con señales
                sensibles (ítems de alerta). Revisa la sección de Alertas de riesgo.
              </p>
            </div>
          )}

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {/* Factores principales */}
            <div className="rounded-2xl bg-surface p-5 shadow-card">
              <h2 className="mb-4 font-display text-[15px] font-bold">Principales factores</h2>
              <div className="space-y-3.5">
                {(factores ?? []).map((f) => (
                  <Row key={f.factor} label={`${f.emoji} ${f.factor}`} pct={f.pct} color="#FF6B7A" />
                ))}
              </div>
            </div>

            {/* Ítems sensibles */}
            <div className="rounded-2xl bg-surface p-5 shadow-card">
              <h2 className="mb-1 font-display text-[15px] font-bold">Ítems sensibles</h2>
              <p className="mb-4 text-xs text-muted">
                Respuestas "Casi siempre" o "Siempre" en preguntas de alerta.
              </p>
              <div className="space-y-3.5">
                {derived.crit.map((c) => (
                  <Row
                    key={c.label}
                    label={c.label}
                    pct={derived.pct(c.n)}
                    n={c.n}
                    color="#a3389e"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Categorías señaladas */}
          <div className="mt-5 rounded-2xl bg-surface p-5 shadow-card">
            <h2 className="mb-1 font-display text-[15px] font-bold">
              Categorías señaladas por los estudiantes
            </h2>
            <p className="mb-4 text-xs text-muted">
              Lo que marcaron en la reflexión (selección múltiple).
            </p>
            <div className="grid gap-x-8 gap-y-3.5 md:grid-cols-2">
              {derived.cats.map((c) => (
                <Row key={c.label} label={c.label} pct={derived.pct(c.n)} n={c.n} color="#6754E8" />
              ))}
            </div>
          </div>
        </>
      )}
    </Shell>
  )
}

function Row({
  label,
  pct,
  n,
  color,
}: {
  label: string
  pct: number
  n?: number
  color: string
}) {
  return (
    <div className="flex items-center gap-2.5 text-xs">
      <span className="w-44 shrink-0 font-semibold text-ink">{label}</span>
      <div className="h-2 min-w-0 flex-1 rounded-full bg-line">
        <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-16 text-right font-bold text-ink">
        {pct}%{n !== undefined ? ` · ${n}` : ''}
      </span>
    </div>
  )
}
