import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquareText, Search } from 'lucide-react'
import Shell, { RISK_STYLE } from '../components/dashboard/Shell'
import { api, ApiError, type ResponseRow, type Stats } from '../lib/api'

const NUBE_SIZE = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl']

export default function Respuestas() {
  const nav = useNavigate()
  const [rows, setRows] = useState<ResponseRow[] | null>(null)
  const [nube, setNube] = useState<Stats['nube']>([])
  const [error, setError] = useState('')
  const [q, setQ] = useState('')

  useEffect(() => {
    Promise.all([api.responses(), api.stats()])
      .then(([r, s]) => {
        setRows(r.rows)
        setNube(s.empty ? [] : (s.nube ?? []))
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) nav('/login')
        else setError('No se pudieron cargar las respuestas.')
      })
  }, [nav])

  const comments = useMemo(() => {
    const withText = (rows ?? []).filter((r) => r.openText.trim())
    if (!q.trim()) return withText
    const needle = q.toLowerCase()
    return withText.filter((r) => r.openText.toLowerCase().includes(needle))
  }, [rows, q])

  return (
    <Shell
      title="Respuestas abiertas"
      subtitle="Comentarios de los estudiantes y temas más frecuentes."
    >
      {error && (
        <p className="mt-6 rounded-2xl bg-coral/10 p-4 text-center text-sm font-semibold text-coral">
          {error}
        </p>
      )}
      {!rows && !error && (
        <p className="mt-16 text-center text-sm font-semibold text-muted">Cargando…</p>
      )}

      {rows && (
        <>
          {/* Nube de temas */}
          {nube && nube.length > 0 && (
            <div className="mt-5 rounded-2xl bg-surface p-6 shadow-card">
              <h2 className="mb-3 font-display text-[15px] font-bold">Temas frecuentes</h2>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {nube.map((w) => (
                  <button
                    key={w.palabra}
                    onClick={() => setQ(w.palabra)}
                    className={`font-display font-bold transition hover:opacity-70 ${NUBE_SIZE[w.peso]}`}
                    style={{ color: w.color }}
                  >
                    {w.palabra}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Buscador */}
          <div className="mt-5 flex items-center gap-2 rounded-2xl bg-surface px-4 py-2.5 shadow-card">
            <Search size={17} className="text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar en los comentarios…"
              className="flex-1 bg-transparent text-sm outline-none"
            />
            <span className="text-xs font-semibold text-muted">
              {comments.length} comentario{comments.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Lista de comentarios */}
          <div className="mt-4 space-y-3">
            {comments.length === 0 && (
              <p className="mt-10 text-center text-sm text-muted">
                {q ? 'Sin comentarios que coincidan con la búsqueda.' : 'Aún no hay comentarios.'}
              </p>
            )}
            {comments.map((r) => (
              <div key={r.id} className="rounded-2xl bg-surface p-4 shadow-card">
                <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-ink">
                    {r.grade}
                    {r.course}
                  </span>
                  <span className="text-muted">· {r.ageRange} años · jornada {r.shift}</span>
                  <span className={`rounded-full px-2 py-0.5 font-bold capitalize ${RISK_STYLE[r.riskLevel]}`}>
                    {r.riskLevel}
                  </span>
                  <span className="ml-auto text-muted">
                    {new Date(r.createdAt).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="flex items-start gap-2 text-[15px] italic text-ink/85">
                  <MessageSquareText size={16} className="mt-1 shrink-0 text-muted" />“{r.openText}”
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </Shell>
  )
}
