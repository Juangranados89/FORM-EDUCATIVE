import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Shell from '../components/dashboard/Shell'
import { api, ApiError, type ResponseRow } from '../lib/api'
import { ASSET, QUESTIONS, type Option } from '../lib/survey'
import { Illustration } from '../components/survey/ui'

const toneBar: Record<Option['tone'], string> = {
  green: '#45B36B',
  blue: '#5B8DEF',
  yellow: '#FFD166',
  orange: '#FF9F43',
  coral: '#FF6B7A',
}

export default function Emociones() {
  const nav = useNavigate()
  const [rows, setRows] = useState<ResponseRow[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .responses()
      .then((r) => setRows(r.rows))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) nav('/login')
        else setError('No se pudieron cargar los datos.')
      })
  }, [nav])

  const dist = useMemo(() => {
    if (!rows) return null
    return QUESTIONS.map((q) => {
      const counts = q.options.map((o) => ({
        ...o,
        n: rows.filter((r) => r.answers[q.id] === o.value).length,
      }))
      const answered = counts.reduce((s, c) => s + c.n, 0) || 1
      return { q, counts, answered }
    })
  }, [rows])

  return (
    <Shell
      title="Emociones y hábitos"
      subtitle="Cómo respondió el grupo a cada pregunta de la encuesta."
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

      {dist && rows && rows.length > 0 && (
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {dist.map(({ q, counts, answered }) => (
            <div key={q.id} className="rounded-2xl bg-surface p-5 shadow-card">
              <div className="mb-3 flex items-center gap-3">
                {q.illustration && (
                  <Illustration src={ASSET(q.illustration)} alt="" className="h-10 w-10" />
                )}
                <h2 className="font-display text-[15px] font-semibold leading-snug text-ink">
                  {q.title}
                </h2>
              </div>
              <div className="space-y-2">
                {counts.map((c) => {
                  const pct = Math.round((c.n / answered) * 100)
                  return (
                    <div key={c.value} className="flex items-center gap-2.5 text-xs">
                      {c.icon ? (
                        <Illustration src={ASSET(c.icon)} alt="" className="h-6 w-6 shrink-0" />
                      ) : (
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ background: toneBar[c.tone] }}
                        />
                      )}
                      <span className="w-28 shrink-0 font-semibold text-ink">{c.label}</span>
                      <div className="h-2.5 min-w-0 flex-1 rounded-full bg-line">
                        <div
                          className="h-2.5 rounded-full"
                          style={{ width: `${pct}%`, background: toneBar[c.tone] }}
                        />
                      </div>
                      <span className="w-14 text-right font-bold text-ink">
                        {pct}% · {c.n}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  )
}
