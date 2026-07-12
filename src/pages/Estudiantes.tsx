import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Download, Eye, X } from 'lucide-react'
import Shell, { RISK_STYLE, SUP_LABEL, VAL_LABEL } from '../components/dashboard/Shell'
import { api, ApiError, type ResponseRow } from '../lib/api'
import { CATEGORIES, QUESTIONS } from '../lib/survey'

const GRADES = ['5°', '6°', '7°', '8°', '9°', '10°', '11°']
const COURSES = ['A', 'B', 'C', 'D']
const catLabel = (v: string) => CATEGORIES.find((c) => c.value === v)?.label.split(':')[0] ?? v

export default function Estudiantes() {
  const nav = useNavigate()
  const [sp, setSp] = useSearchParams()
  const [rows, setRows] = useState<ResponseRow[] | null>(null)
  const [error, setError] = useState('')
  const [detail, setDetail] = useState<ResponseRow | null>(null)

  const filters = useMemo(
    () => ({
      grade: sp.get('grade') || '',
      course: sp.get('course') || '',
      shift: sp.get('shift') || '',
      risk: sp.get('risk') || '',
    }),
    [sp],
  )

  useEffect(() => {
    setRows(null)
    api
      .responses(filters)
      .then((r) => setRows(r.rows))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) nav('/login')
        else setError('No se pudo cargar el listado.')
      })
  }, [filters, nav])

  const setF = (k: string, v: string) => {
    const next = new URLSearchParams(sp)
    if (v) next.set(k, v)
    else next.delete(k)
    setSp(next)
  }
  const clear = () => setSp(new URLSearchParams())
  const exportUrl = `/api/export.xlsx${sp.toString() ? `?${sp}` : ''}`

  return (
    <Shell
      title="Estudiantes"
      subtitle="Todas las respuestas recibidas. Filtra, revisa el detalle y exporta."
      actions={
        <a
          href={exportUrl}
          className="flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-white shadow-card transition hover:brightness-105"
        >
          <Download size={15} /> Exportar Excel
        </a>
      }
    >
      {/* Filtros */}
      <div className="mt-5 flex flex-wrap items-center gap-2.5 rounded-2xl bg-surface p-3 shadow-card">
        <Select label="Grado" value={filters.grade} onChange={(v) => setF('grade', v)} options={GRADES} />
        <Select label="Curso" value={filters.course} onChange={(v) => setF('course', v)} options={COURSES} />
        <Select label="Jornada" value={filters.shift} onChange={(v) => setF('shift', v)} options={['mañana', 'tarde']} />
        <Select label="Riesgo" value={filters.risk} onChange={(v) => setF('risk', v)} options={['bajo', 'moderado', 'alto']} />
        {(filters.grade || filters.course || filters.shift || filters.risk) && (
          <button
            onClick={clear}
            className="flex items-center gap-1 rounded-xl border border-line px-3 py-2 text-xs font-bold text-muted hover:text-coral"
          >
            <X size={13} /> Limpiar
          </button>
        )}
        {rows && (
          <span className="ml-auto text-sm font-semibold text-muted">
            {rows.length} respuesta{rows.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {error && (
        <p className="mt-6 rounded-2xl bg-coral/10 p-4 text-center text-sm font-semibold text-coral">
          {error}
        </p>
      )}
      {!rows && !error && (
        <p className="mt-16 text-center text-sm font-semibold text-muted">Cargando…</p>
      )}

      {rows && rows.length === 0 && (
        <p className="mt-16 text-center text-sm text-muted">
          No hay respuestas con estos filtros.
        </p>
      )}

      {rows && rows.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-2xl bg-surface shadow-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                {['Fecha', 'Curso', 'Jornada', 'Edad', 'Puntaje', 'Riesgo', 'Apoyo', ''].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-line/60 last:border-0 hover:bg-bg">
                  <td className="px-4 py-2.5 text-xs">
                    {new Date(r.createdAt).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </td>
                  <td className="px-4 py-2.5 font-bold">
                    {r.grade}
                    {r.course}
                  </td>
                  <td className="px-4 py-2.5 capitalize">{r.shift}</td>
                  <td className="px-4 py-2.5">{r.ageRange}</td>
                  <td className="px-4 py-2.5 font-semibold">{r.score}</td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${RISK_STYLE[r.riskLevel]}`}>
                      {r.riskLevel}
                    </span>
                    {r.criticalFlag && (
                      <span className="ml-1 rounded-full bg-coral px-1.5 py-0.5 text-[9px] font-bold text-white">
                        !
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs">{SUP_LABEL[r.support]}</td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => setDetail(r)} className="text-primary" title="Ver detalle">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && <DetailModal r={detail} onClose={() => setDetail(null)} />}
    </Shell>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-line bg-bg px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-primary"
    >
      <option value="">{label}: todos</option>
      {options.map((o) => (
        <option key={o} value={o} className="capitalize">
          {o}
        </option>
      ))}
    </select>
  )
}

function DetailModal({ r, onClose }: { r: ResponseRow; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-6 shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">
              Respuesta · {r.grade}
              {r.course}
            </h2>
            <p className="text-xs text-muted">
              {new Date(r.createdAt).toLocaleString('es-CO')} · {r.ageRange} años · jornada{' '}
              {r.shift}
            </p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${RISK_STYLE[r.riskLevel]}`}>
            Riesgo {r.riskLevel} · puntaje {r.score}
          </span>
          {r.criticalFlag && (
            <span className="rounded-full bg-coral px-2.5 py-1 text-xs font-bold text-white">
              Alerta crítica
            </span>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {QUESTIONS.map((q) => (
            <div key={q.id} className="flex items-start justify-between gap-3 border-b border-line/60 pb-1.5 text-sm">
              <span className="text-muted">{q.title}</span>
              <span className="shrink-0 font-semibold">{VAL_LABEL[r.answers[q.id]] ?? '—'}</span>
            </div>
          ))}
        </div>

        {r.categories.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-bold text-muted">Categorías señaladas</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {r.categories.map((c) => (
                <span key={c} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {catLabel(c)}
                </span>
              ))}
            </div>
          </div>
        )}

        {r.openText && (
          <div className="mt-4">
            <p className="text-xs font-bold text-muted">Comentario</p>
            <p className="mt-1 rounded-xl bg-bg p-3 text-sm italic text-ink/80">“{r.openText}”</p>
          </div>
        )}

        <div className="mt-4 rounded-xl bg-primary/5 p-3 text-sm">
          <span className="font-bold">¿Hablar con orientación?</span> {SUP_LABEL[r.support]}
        </div>
      </div>
    </div>
  )
}
