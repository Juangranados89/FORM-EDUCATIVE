import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Shell from '../components/dashboard/Shell'
import { api, ApiError, type Stats } from '../lib/api'

// Color por nivel de la dimensión (más alto = mejor bienestar).
const dimColor = (v: number) => (v >= 70 ? '#45B36B' : v >= 50 ? '#FFD166' : '#FF6B7A')

export default function Bienestar() {
  const nav = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .stats()
      .then(setStats)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) nav('/login')
        else setError('No se pudieron cargar los datos.')
      })
  }, [nav])

  return (
    <Shell
      title="Bienestar general"
      subtitle="Detalle del bienestar por dimensión y su evolución en el tiempo."
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
        <p className="mt-16 text-center text-sm text-muted">Aún no hay respuestas.</p>
      )}

      {stats && !stats.empty && (
        <>
          <div className="mt-5 flex flex-wrap gap-4">
            <div className="flex min-w-52 flex-1 items-center gap-4 rounded-2xl bg-surface p-5 shadow-card">
              <div>
                <p className="text-sm font-semibold text-muted">Bienestar general</p>
                <p className="font-display text-4xl font-bold" style={{ color: dimColor(stats.kpis!.bienestarGeneral) }}>
                  {stats.kpis!.bienestarGeneral}%
                </p>
                <p className="text-xs text-muted">
                  {stats.kpis!.bienestarDelta === 0
                    ? 'sin cambio vs. mes anterior'
                    : `${stats.kpis!.bienestarDelta > 0 ? '↑' : '↓'} ${Math.abs(stats.kpis!.bienestarDelta)}% vs. mes anterior`}
                </p>
              </div>
            </div>
            <div className="flex min-w-52 flex-1 items-center gap-4 rounded-2xl bg-surface p-5 shadow-card">
              <div>
                <p className="text-sm font-semibold text-muted">Respuestas analizadas</p>
                <p className="font-display text-4xl font-bold text-primary">
                  {stats.kpis!.totalRespuestas.toLocaleString('es-CO')}
                </p>
                <p className="text-xs text-muted">estudiantes</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            {/* Radar */}
            <div className="rounded-2xl bg-surface p-5 shadow-card">
              <h2 className="font-display text-[15px] font-bold">Bienestar por dimensión</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={stats.dimensiones} outerRadius="72%">
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="dim" tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} tickCount={5} />
                    <Radar dataKey="valor" stroke="#6754E8" fill="#6754E8" fillOpacity={0.25} strokeWidth={2} />
                    <Tooltip formatter={(v) => `${v}%`} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Barras por dimensión */}
            <div className="rounded-2xl bg-surface p-5 shadow-card">
              <h2 className="font-display text-[15px] font-bold">Puntaje por dimensión</h2>
              <div className="mt-4 space-y-3.5">
                {[...(stats.dimensiones ?? [])]
                  .sort((a, b) => a.valor - b.valor)
                  .map((d) => (
                    <div key={d.dim} className="text-sm">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-semibold">{d.dim}</span>
                        <span className="font-bold" style={{ color: dimColor(d.valor) }}>
                          {d.valor}%
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-line">
                        <div
                          className="h-2.5 rounded-full"
                          style={{ width: `${d.valor}%`, background: dimColor(d.valor) }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
              <p className="mt-4 rounded-xl bg-primary/5 p-3 text-xs text-muted">
                Las dimensiones en rojo (&lt;50%) son las que más requieren atención y
                planes de acompañamiento.
              </p>
            </div>
          </div>

          {/* Tendencia */}
          <div className="mt-5 rounded-2xl bg-surface p-5 shadow-card">
            <h2 className="font-display text-[15px] font-bold">Tendencia de bienestar general</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.tendencia} margin={{ top: 18, right: 18, left: -18, bottom: 0 }}>
                  <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickFormatter={(v) => `${v}%`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Line type="monotone" dataKey="valor" stroke="#6754E8" strokeWidth={2.5} dot={{ r: 4, fill: '#6754E8' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </Shell>
  )
}
