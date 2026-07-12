import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, MessageSquareText } from 'lucide-react'
import Shell, { RISK_STYLE, SUP_LABEL } from '../components/dashboard/Shell'
import { api, ApiError, type AlertRow } from '../lib/api'

const SEV_STYLE: Record<number, { box: string; chip: string; label: string }> = {
  3: { box: 'border-coral bg-coral/5', chip: 'bg-coral text-white', label: 'Crítico' },
  2: { box: 'border-orange/50 bg-orange/5', chip: 'bg-orange text-white', label: 'Alto' },
  1: { box: 'border-yellow bg-yellow/10', chip: 'bg-yellow text-ink', label: 'Moderado' },
}

export default function Alertas() {
  const nav = useNavigate()
  const [data, setData] = useState<{ alerts: AlertRow[]; criticos: number } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .alerts()
      .then(setData)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) nav('/login')
        else setError('No se pudieron cargar las alertas.')
      })
  }, [nav])

  return (
    <Shell
      title="Alertas de riesgo"
      subtitle="Respuestas que requieren atención prioritaria, ordenadas por urgencia."
    >
      {error && (
        <p className="mt-6 rounded-2xl bg-coral/10 p-4 text-center text-sm font-semibold text-coral">
          {error}
        </p>
      )}
      {!data && !error && (
        <p className="mt-16 text-center text-sm font-semibold text-muted">Cargando…</p>
      )}

      {data && (
        <>
          <div className="mt-5 flex flex-wrap gap-4">
            <Stat n={data.criticos} label="Casos críticos" tone="coral" />
            <Stat
              n={data.alerts.filter((a) => a.sev === 2).length}
              label="Riesgo alto"
              tone="orange"
            />
            <Stat n={data.alerts.length} label="Total en seguimiento" tone="primary" />
          </div>

          {data.alerts.length === 0 && (
            <p className="mt-16 text-center text-sm text-muted">
              🎉 No hay alertas activas. Ninguna respuesta requiere atención prioritaria.
            </p>
          )}

          <div className="mt-5 space-y-3">
            {data.alerts.map((a) => {
              const s = SEV_STYLE[a.sev]
              return (
                <div key={a.id} className={`rounded-2xl border-2 p-4 shadow-card ${s.box}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${s.chip}`}>
                      <AlertTriangle size={12} /> {s.label}
                    </span>
                    <span className="text-sm font-bold text-ink">
                      {a.grade}
                      {a.course}
                    </span>
                    <span className="text-xs text-muted">· {a.ageRange} años · jornada {a.shift}</span>
                    <span className="ml-auto text-xs text-muted">
                      {new Date(a.createdAt).toLocaleString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {a.reasons.map((r) => (
                      <span
                        key={r}
                        className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-ink shadow-card"
                      >
                        {r}
                      </span>
                    ))}
                  </div>

                  {a.openText && (
                    <p className="mt-2.5 flex items-start gap-1.5 rounded-xl bg-white/70 p-2.5 text-[13px] italic text-ink/80">
                      <MessageSquareText size={14} className="mt-0.5 shrink-0 text-muted" />“
                      {a.openText}”
                    </p>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${RISK_STYLE[a.riskLevel]}`}>
                      Puntaje {a.score} · {a.riskLevel}
                    </span>
                    <span className="text-xs font-semibold text-primary">
                      Apoyo: {SUP_LABEL[a.support]}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </Shell>
  )
}

function Stat({ n, label, tone }: { n: number; label: string; tone: string }) {
  const bg =
    tone === 'coral' ? 'bg-coral/10 text-coral' : tone === 'orange' ? 'bg-orange/10 text-orange' : 'bg-primary/10 text-primary'
  return (
    <div className={`flex min-w-40 flex-1 items-center gap-3 rounded-2xl p-4 ${bg}`}>
      <span className="font-display text-3xl font-bold">{n}</span>
      <span className="text-sm font-semibold">{label}</span>
    </div>
  )
}
