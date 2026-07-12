import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Shell from '../components/dashboard/Shell'
import { api, ApiError, type Stats } from '../lib/api'

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 rounded-full bg-line">
        <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-9 text-xs font-semibold">{pct}%</span>
    </div>
  )
}

export default function Cursos() {
  const nav = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .stats()
      .then(setStats)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) nav('/login')
        else setError('No se pudieron cargar los cursos.')
      })
  }, [nav])

  const cursos = stats?.cursos ?? []

  return (
    <Shell
      title="Cursos / Grados"
      subtitle="Bienestar y riesgo por curso. Haz clic en un curso para ver sus estudiantes."
    >
      {error && (
        <p className="mt-6 rounded-2xl bg-coral/10 p-4 text-center text-sm font-semibold text-coral">
          {error}
        </p>
      )}
      {!stats && !error && (
        <p className="mt-16 text-center text-sm font-semibold text-muted">Cargando…</p>
      )}
      {stats?.empty && (
        <p className="mt-16 text-center text-sm text-muted">Aún no hay respuestas por curso.</p>
      )}

      {cursos.length > 0 && (
        <div className="mt-5 overflow-x-auto rounded-2xl bg-surface shadow-card">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                {['Curso', 'Respuestas', 'Participación', 'Bienestar', 'Riesgo moderado', 'Riesgo alto', ''].map(
                  (h) => (
                    <th key={h} className="px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {cursos.map((c) => {
                const grade = c.curso.slice(0, -1)
                const course = c.curso.slice(-1)
                return (
                  <tr key={c.curso} className="border-b border-line/60 last:border-0 hover:bg-bg">
                    <td className="px-4 py-3 font-bold">{c.curso}</td>
                    <td className="px-4 py-3">{c.n}</td>
                    <td className="px-4 py-3">
                      <Bar pct={c.participacion} color="#6754E8" />
                    </td>
                    <td className="px-4 py-3">
                      <Bar pct={c.bienestar} color="#45B36B" />
                    </td>
                    <td className="px-4 py-3">
                      <Bar pct={c.moderado} color="#FFD166" />
                    </td>
                    <td className="px-4 py-3">
                      <Bar pct={c.alto} color="#FF6B7A" />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/dashboard/estudiantes?grade=${encodeURIComponent(grade)}&course=${course}`}
                        className="flex items-center gap-1 text-xs font-bold text-primary"
                      >
                        Ver <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  )
}
