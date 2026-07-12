import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Download,
  Eye,
  Info,
  Users,
} from 'lucide-react'
import {
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api, ApiError, type Stats } from '../lib/api'
import Shell from '../components/dashboard/Shell'

const DASSET = (n: string) => `${import.meta.env.BASE_URL}assets/dashboard/${n}`

/* ---------- Página Resumen ---------- */
export default function Dashboard() {
  const nav = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .stats()
      .then(setStats)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) nav('/login')
        else setError('No se pudieron cargar los datos. Verifica el servidor.')
      })
  }, [nav])

  return (
    <Shell
      title="Panel de Bienestar Escolar"
      subtitle="Resultados consolidados de la encuesta de bienestar emocional."
      actions={
        <a
          href="/api/export.xlsx"
          className="flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-white shadow-card transition hover:brightness-105"
        >
          <Download size={15} /> Exportar Excel
        </a>
      }
    >
      {error && (
        <p className="mt-6 rounded-2xl bg-coral/10 p-4 text-center text-sm font-semibold text-coral">
          {error}
        </p>
      )}
      {!stats && !error && (
        <p className="mt-16 text-center text-sm font-semibold text-muted">
          Cargando resultados…
        </p>
      )}
      {stats?.empty && (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <img src={DASSET('next_plant_full.png')} alt="" className="h-24 w-24 object-contain" />
          <p className="font-display text-lg font-bold">Aún no hay respuestas</p>
          <p className="max-w-sm text-sm text-muted">
            Cuando los estudiantes envíen la encuesta, verás aquí los resultados
            consolidados en tiempo real.
          </p>
        </div>
      )}
      {stats && !stats.empty && <Content stats={stats} />}
    </Shell>
  )
}

function Content({ stats }: { stats: Stats }) {
  const k = stats.kpis!
  return (
    <>
      <KpiRow k={k} />
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <DimensionsCard dims={stats.dimensiones!} general={k.bienestarGeneral} delta={k.bienestarDelta} />
        <RiskDonutCard riesgo={stats.riesgo!} total={k.totalRespuestas} />
        <TrendCard tendencia={stats.tendencia!} />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_1fr_1fr]">
        <CoursesCard cursos={stats.cursos!} />
        <FactorsCard factores={stats.factores!} />
        <WordCloudCard nube={stats.nube!} />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <AlertBanner n={k.riesgoAltoN} />
        <ApoyoCard apoyo={stats.apoyo!} />
        <NextStepsCard />
      </div>
    </>
  )
}

/* ---------- KPIs ---------- */
type Kpis = NonNullable<Stats['kpis']>

function Delta({ value, invert }: { value: number; invert?: boolean }) {
  if (value === 0)
    return <span className="text-xs font-semibold text-muted">sin cambio vs. mes anterior</span>
  const good = invert ? value < 0 : value > 0
  const Icon = value > 0 ? ArrowUp : ArrowDown
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-bold ${good ? 'text-green' : 'text-coral'}`}
    >
      <Icon size={12} /> {Math.abs(value)}% vs. mes anterior
    </span>
  )
}

function KpiRow({ k }: { k: Kpis }) {
  return (
    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <Link to="/dashboard/estudiantes" className="group rounded-2xl border border-white bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">Total de respuestas</p>
            <p className="font-display text-3xl font-bold">
              {k.totalRespuestas.toLocaleString('es-CO')}
            </p>
            <p className="text-xs text-muted">estudiantes</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users size={20} />
          </span>
        </div>
        {k.participacion !== null && (
          <>
            <p className="mt-2 text-xs font-semibold text-ink">
              Participación: <span className="text-primary">{k.participacion}%</span>
            </p>
            <div className="mt-1.5 h-2 rounded-full bg-line">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${k.participacion}%` }}
              />
            </div>
          </>
        )}
        <p className="mt-3 flex items-center gap-1 text-xs font-bold text-primary opacity-80 group-hover:opacity-100">Revisar participación <ArrowRight size={12} /></p>
      </Link>

      <KpiCard
        tone="green"
        title="Bienestar general"
        big={`${k.bienestarGeneral}%`}
        sub={k.bienestarGeneral >= 66 ? 'Nivel medio - alto' : k.bienestarGeneral >= 40 ? 'Nivel medio' : 'Nivel bajo'}
        delta={<Delta value={k.bienestarDelta} />}
        face={DASSET('kpi_happy.png')}
      />
      <Link to="/dashboard/estudiantes?risk=moderado" className="group rounded-2xl border border-orange/10 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-orange/30">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-orange">Riesgo moderado</p>
            <p className="font-display text-3xl font-bold">{k.riesgoModeradoPct}%</p>
            <p className="text-xs text-muted">{k.riesgoModeradoN} estudiantes</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow/30 text-orange">
            <AlertTriangle size={20} />
          </span>
        </div>
        <div className="mt-2 border-t border-line/70 pt-2">
          <Delta value={k.riesgoModeradoDelta} invert />
        </div>
        <p className="mt-2 flex items-center gap-1 text-xs font-bold text-orange">Ver estudiantes <ArrowRight size={12} /></p>
      </Link>
      <KpiCard
        tone="coral"
        title="Riesgo alto"
        big={`${k.riesgoAltoPct}%`}
        sub={`${k.riesgoAltoN} estudiantes`}
        delta={<Delta value={k.riesgoAltoDelta} invert />}
        face={DASSET('kpi_sad.png')}
      />
    </div>
  )
}

function KpiCard({
  tone,
  title,
  big,
  sub,
  delta,
  face,
}: {
  tone: 'green' | 'coral'
  title: string
  big: string
  sub: string
  delta: React.ReactNode
  face: string
}) {
  return (
    <Link
      to={tone === 'green' ? '/dashboard/bienestar' : '/dashboard/alertas'}
      className={`group rounded-2xl border bg-white p-5 shadow-card transition hover:-translate-y-0.5 ${tone === 'green' ? 'border-green/10 hover:border-green/30' : 'border-coral/10 hover:border-coral/30'}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={`text-sm font-bold ${tone === 'green' ? 'text-green' : 'text-coral'}`}
          >
            {title}
          </p>
          <p className="font-display text-3xl font-bold">{big}</p>
          <p className="text-xs text-muted">{sub}</p>
        </div>
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone === 'green' ? 'bg-green/10' : 'bg-coral/10'}`}>
          <img src={face} alt="" className="h-9 w-9 object-contain" />
        </span>
      </div>
      <div className="mt-2 border-t border-line/70 pt-2">{delta}</div>
      <p className={`mt-2 flex items-center gap-1 text-xs font-bold ${tone === 'green' ? 'text-green' : 'text-coral'}`}>
        {tone === 'green' ? 'Ver dimensiones' : 'Atender alertas'} <ArrowRight size={12} />
      </p>
    </Link>
  )
}

/* ---------- Card base ---------- */
function Card({
  title,
  info,
  children,
  footer,
}: {
  title: React.ReactNode
  info?: boolean
  children: React.ReactNode
  footer?: { label: string; to: string }
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-white bg-white p-5 shadow-card">
      <h2 className="flex items-center gap-1.5 font-display text-[15px] font-bold">
        {title} {info && <Info size={14} className="text-muted" />}
      </h2>
      <div className="mt-2 flex-1">{children}</div>
      {footer && (
        <Link to={footer.to} className="mt-3 flex items-center justify-center gap-1.5 border-t border-line/70 pt-3 text-sm font-bold text-primary transition hover:gap-2.5">
          {footer.label} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  )
}

/* ---------- Radar dimensiones ---------- */
function DimensionsCard({
  dims,
  general,
  delta,
}: {
  dims: { dim: string; valor: number }[]
  general: number
  delta: number
}) {
  return (
    <Card title="Bienestar general por dimensión" info footer={{ label: 'Ver detalle por dimensión', to: '/dashboard/bienestar' }}>
      <div className="flex items-center gap-2">
        <div className="h-64 min-w-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={dims} outerRadius="72%">
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis
                dataKey="dim"
                tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }}
              />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} tickCount={5} />
              <Radar
                dataKey="valor"
                stroke="#6754E8"
                fill="#6754E8"
                fillOpacity={0.25}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="shrink-0 rounded-xl border border-line p-3 text-xs">
          <p className="flex items-center gap-1.5 font-bold text-ink">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Promedio general
          </p>
          <p className="mt-1 font-display text-2xl font-bold">{general}%</p>
          {delta !== 0 && (
            <p className="mt-1 text-muted">Mes anterior: {general - delta}%</p>
          )}
        </div>
      </div>
    </Card>
  )
}

/* ---------- Dona de riesgo ---------- */
function RiskDonutCard({
  riesgo,
  total,
}: {
  riesgo: { name: string; value: number; pct: number; color: string }[]
  total: number
}) {
  return (
    <Card
      title={<>Nivel de riesgo <span className="font-normal text-muted">(distribución)</span></>}
      info
      footer={{ label: 'Ver estudiantes en riesgo', to: '/dashboard/estudiantes?risk=alto' }}
    >
      <div className="flex items-center gap-4">
        <div className="relative h-60 min-w-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riesgo}
                dataKey="value"
                innerRadius="62%"
                outerRadius="90%"
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
              >
                {riesgo.map((r) => (
                  <Cell key={r.name} fill={r.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v} estudiantes`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-display text-2xl font-bold">
              {total.toLocaleString('es-CO')}
            </p>
            <p className="text-xs text-muted">estudiantes</p>
          </div>
        </div>
        <div className="shrink-0 space-y-3 text-xs">
          {riesgo.map((r) => (
            <div key={r.name} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: r.color }} />
              <div>
                <p className="font-bold">{r.name}</p>
                <p className="text-muted">
                  {r.pct}% ({r.value})
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

/* ---------- Tendencia ---------- */
function TrendCard({ tendencia }: { tendencia: { mes: string; valor: number }[] }) {
  return (
    <Card title="Tendencia de bienestar general" info footer={{ label: 'Ver historial completo', to: '/dashboard/bienestar' }}>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={tendencia} margin={{ top: 18, right: 18, left: -18, bottom: 0 }}>
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 10, fill: '#64748B' }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fontSize: 10, fill: '#64748B' }}
              tickFormatter={(v) => `${v}%`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip formatter={(v) => `${v}%`} />
            <Line
              type="monotone"
              dataKey="valor"
              stroke="#6754E8"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: '#6754E8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

/* ---------- Tabla por curso ---------- */
function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-14 rounded-full bg-line">
        <div
          className="h-1.5 rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-semibold">{pct}%</span>
    </div>
  )
}

function CoursesCard({ cursos }: { cursos: NonNullable<Stats['cursos']> }) {
  return (
    <Card title="Resultados por curso" footer={{ label: 'Ver todos los cursos', to: '/dashboard/cursos' }}>
      <div className="overflow-x-auto pb-1">
      <table className="w-full min-w-[620px] text-left text-xs">
        <thead>
          <tr className="border-b border-line text-muted">
            {['Curso', 'Respuestas', 'Bienestar general', 'Riesgo moderado', 'Riesgo alto', 'Acciones'].map(
              (h) => (
                <th key={h} className="py-2 pr-2 font-semibold">
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {cursos.map((c) => (
            <tr key={c.curso} className="border-b border-line/60 last:border-0">
              <td className="py-2.5 pr-2 font-bold">{c.curso}</td>
              <td className="py-2.5 pr-2 font-semibold">{c.n}</td>
              <td className="py-2.5 pr-2">
                <MiniBar pct={c.bienestar} color="#45B36B" />
              </td>
              <td className="py-2.5 pr-2">
                <MiniBar pct={c.moderado} color="#FFD166" />
              </td>
              <td className="py-2.5 pr-2">
                <MiniBar pct={c.alto} color="#FF6B7A" />
              </td>
              <td className="py-2.5">
                <Link to={`/dashboard/estudiantes?grade=${encodeURIComponent(c.grade)}&course=${encodeURIComponent(c.course)}`} className="text-primary" title={`Ver curso ${c.curso}`}>
                  <Eye size={15} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </Card>
  )
}

/* ---------- Factores ---------- */
function FactorsCard({ factores }: { factores: NonNullable<Stats['factores']> }) {
  return (
    <Card title="Principales factores de riesgo" info footer={{ label: 'Ver análisis completo', to: '/dashboard/factores' }}>
      <div className="space-y-3.5 pt-1">
        {factores.map((f) => (
          <div key={f.factor} className="flex items-center gap-2.5 text-xs">
            <span className="w-5 text-center">{f.emoji}</span>
            <span className="w-36 shrink-0 font-semibold">{f.factor}</span>
            <div className="h-2 min-w-0 flex-1 rounded-full bg-line">
              <div
                className="h-2 rounded-full bg-coral"
                style={{ width: `${f.pct}%` }}
              />
            </div>
            <span className="w-8 text-right font-bold">{f.pct}%</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

/* ---------- Nube de palabras ---------- */
const NUBE_SIZE = ['text-xs', 'text-sm', 'text-base', 'text-xl', 'text-2xl', 'text-3xl']
function WordCloudCard({ nube }: { nube: NonNullable<Stats['nube']> }) {
  return (
    <Card
      title={<>Respuestas abiertas <span className="font-normal text-muted">(temas frecuentes)</span></>}
      footer={{ label: 'Ver todas las respuestas', to: '/dashboard/respuestas' }}
    >
      {nube.length === 0 ? (
        <p className="flex h-full min-h-44 items-center justify-center text-xs text-muted">
          Aún no hay respuestas abiertas.
        </p>
      ) : (
        <div className="flex h-full min-h-44 flex-wrap items-center justify-center gap-x-4 gap-y-2 px-2 py-3">
          {nube.map((w) => (
            <span
              key={w.palabra}
              className={`font-display font-bold ${NUBE_SIZE[w.peso]}`}
              style={{ color: w.color }}
            >
              {w.palabra}
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}

/* ---------- Banner de alerta / Qué sigue ---------- */
function AlertBanner({ n }: { n: number }) {
  if (n === 0)
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-green/15 bg-white p-5 shadow-card">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green text-white">
          <AlertTriangle size={22} />
        </span>
        <div>
          <p className="font-display text-[15px] font-bold text-green">
            Sin estudiantes en riesgo alto
          </p>
          <p className="text-xs text-muted">Continúa monitoreando periódicamente.</p>
        </div>
      </div>
    )
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-coral/15 bg-white p-5 shadow-card">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-coral text-white">
        <AlertTriangle size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-[15px] font-bold text-coral">
          {n} estudiante{n === 1 ? '' : 's'} en riesgo alto
        </p>
        <p className="text-xs text-muted">
          Requieren atención prioritaria. Revisa la lista y planifica acciones de
          acompañamiento.
        </p>
      </div>
      <Link
        to="/dashboard/alertas"
        className="flex shrink-0 items-center gap-1.5 rounded-xl border border-coral/40 bg-surface px-3.5 py-2 text-xs font-bold text-coral"
      >
        Ver alertas <ArrowRight size={13} />
      </Link>
    </div>
  )
}

function ApoyoCard({ apoyo }: { apoyo: NonNullable<Stats['apoyo']> }) {
  const items = [
    { label: 'Sí, lo necesito pronto', n: apoyo.si_pronto, color: '#FF6B7A' },
    { label: 'Tal vez más adelante', n: apoyo.tal_vez, color: '#FFD166' },
    { label: 'No por ahora', n: apoyo.no_ahora, color: '#45B36B' },
  ]
  const total = items.reduce((s, i) => s + i.n, 0) || 1
  return (
    <Link to="/dashboard/estudiantes" className="block rounded-2xl border border-white bg-white p-5 shadow-card transition hover:border-primary/20">
      <p className="font-display text-[15px] font-bold text-ink">
        Apoyo solicitado
        <span className="ml-1.5 font-sans text-xs font-normal text-muted">
          (¿hablarías con orientación?)
        </span>
      </p>
      <div className="mt-3 space-y-2.5">
        {items.map((i) => (
          <div key={i.label} className="flex items-center gap-2.5 text-xs">
            <span className="w-40 shrink-0 font-semibold">{i.label}</span>
            <div className="h-2 min-w-0 flex-1 rounded-full bg-line">
              <div
                className="h-2 rounded-full"
                style={{ width: `${Math.round((i.n / total) * 100)}%`, background: i.color }}
              />
            </div>
            <span className="w-6 text-right font-bold">{i.n}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1 border-t border-line/70 pt-3 text-xs font-bold text-primary">Revisar solicitudes de apoyo <ArrowRight size={12} /></p>
    </Link>
  )
}

function NextStepsCard() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-green/15 bg-white p-5 shadow-card sm:flex-row sm:items-center">
      <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-green/5 p-2">
        <img src={DASSET('next_plant_full.png')} alt="Próximos pasos" className="h-full w-full object-contain" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-[15px] font-bold text-ink">¿Qué sigue?</p>
        <p className="text-xs text-muted">
          Te recomendamos revisar los resultados por curso y planificar actividades para
          fortalecer el bienestar emocional.
        </p>
      </div>
      <Link to="/dashboard/planes" className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-green px-3.5 py-2 text-xs font-bold text-white">
        Plan de acción <ArrowRight size={13} />
      </Link>
    </div>
  )
}
