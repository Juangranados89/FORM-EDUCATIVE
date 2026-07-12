import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bell,
  Calendar,
  ChevronDown,
  ClipboardEdit,
  Download,
  Eye,
  Filter,
  GraduationCap,
  Heart,
  Home,
  Info,
  LogOut,
  MessageSquareText,
  ScanSearch,
  SlidersHorizontal,
  UserRound,
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

const DASSET = (n: string) => `${import.meta.env.BASE_URL}assets/dashboard/${n}`

/* ---------- Página ---------- */
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
    <div className="flex min-h-screen bg-bg text-ink">
      <Sidebar />
      <main className="min-w-0 flex-1 px-6 pb-8 pt-4">
        <Header onLogout={() => api.logout().then(() => nav('/login'))} />
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
            <img src={DASSET('next_plant.png')} alt="" className="h-24" />
            <p className="font-display text-lg font-bold">Aún no hay respuestas</p>
            <p className="max-w-sm text-sm text-muted">
              Cuando los estudiantes envíen la encuesta, verás aquí los resultados
              consolidados en tiempo real.
            </p>
          </div>
        )}
        {stats && !stats.empty && <Content stats={stats} />}
      </main>
    </div>
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

/* ---------- Sidebar ---------- */
const NAV_RESULTS = [
  { icon: <Users size={17} />, label: 'Bienestar general' },
  { icon: <Heart size={17} />, label: 'Emociones y hábitos' },
  { icon: <ScanSearch size={17} />, label: 'Factores de riesgo' },
  { icon: <SlidersHorizontal size={17} />, label: 'Comparaciones' },
  { icon: <MessageSquareText size={17} />, label: 'Respuestas abiertas' },
]
const NAV_GESTION = [
  { icon: <GraduationCap size={17} />, label: 'Cursos / Grados' },
  { icon: <UserRound size={17} />, label: 'Estudiantes' },
  { icon: <AlertTriangle size={17} />, label: 'Alertas de riesgo' },
  { icon: <ClipboardEdit size={17} />, label: 'Planes de acción' },
]

function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-surface px-4 pb-5 pt-5 lg:flex">
      <div className="flex items-center gap-2.5 px-1">
        <Logo />
        <div className="font-display text-lg font-bold leading-tight text-primary">
          Bienestar
          <br />
          Escolar
        </div>
      </div>

      <button className="mt-6 flex items-center gap-2.5 rounded-xl bg-primary/10 px-3 py-2.5 text-sm font-bold text-primary">
        <Home size={17} /> Resumen
      </button>

      <p className="mt-5 px-1 text-[11px] font-bold uppercase tracking-wide text-muted">
        Resultados
      </p>
      <nav className="mt-1 space-y-0.5">
        {NAV_RESULTS.map((n) => (
          <NavItem key={n.label} {...n} />
        ))}
      </nav>

      <p className="mt-5 px-1 text-[11px] font-bold uppercase tracking-wide text-muted">
        Gestión
      </p>
      <nav className="mt-1 space-y-0.5">
        {NAV_GESTION.map((n) => (
          <NavItem key={n.label} {...n} />
        ))}
      </nav>

      <div className="mt-auto rounded-2xl bg-[#fff7ec] p-4">
        <p className="font-display text-[15px] font-bold">¿Necesitas ayuda?</p>
        <p className="mt-1 text-xs text-muted">
          Recursos y guías para acompañar a los estudiantes.
        </p>
        <button className="mt-3 flex items-center gap-1.5 rounded-xl border border-orange/50 bg-surface px-3 py-1.5 text-xs font-bold text-orange">
          Ver recursos <ArrowRight size={13} />
        </button>
        <img
          src={DASSET('help_orientadora.png')}
          alt=""
          className="mx-auto mt-2 h-24 object-contain"
        />
      </div>
    </aside>
  )
}

function NavItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold text-muted transition hover:bg-bg hover:text-ink">
      {icon} {label}
    </button>
  )
}

function Logo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
      <path
        d="M20 3C10.6 3 3 9.9 3 18.4c0 4.9 2.5 9.2 6.4 12l-1.6 6.1 6.6-3.3c1.8.5 3.7.7 5.6.7 9.4 0 17-6.9 17-15.4S29.4 3 20 3z"
        fill="#6754E8"
      />
      <path
        d="M20 27s-7-4.2-7-9.1c0-2.4 1.9-4.3 4.2-4.3 1.4 0 2.4.6 2.8 1.6.4-1 1.4-1.6 2.8-1.6 2.3 0 4.2 1.9 4.2 4.3 0 4.9-7 9.1-7 9.1z"
        fill="#fff"
      />
    </svg>
  )
}

/* ---------- Header ---------- */
function Header({ onLogout }: { onLogout: () => void }) {
  const hoy = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
  return (
    <div>
      <div className="flex items-center justify-end gap-4 py-2">
        <div className="relative">
          <Bell size={20} className="text-muted" />
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange/20 text-orange">
            <UserRound size={18} />
          </span>
          <div className="text-xs leading-tight">
            <p className="font-bold">Orientador(a)</p>
            <p className="text-muted">Bienestar Escolar</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          title="Cerrar sesión"
          className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-bold text-muted hover:text-coral"
        >
          <LogOut size={14} /> Salir
        </button>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">¡Hola, Orientador(a)!</p>
          <h1 className="flex items-center gap-2 font-display text-3xl font-bold">
            Panel de Bienestar Escolar <Info size={16} className="text-muted" />
          </h1>
          <p className="mt-1 text-sm text-muted">
            Aquí puedes ver los resultados consolidados de la encuesta de bienestar
            emocional.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <HeaderBtn icon={<Calendar size={15} />} label={`Hasta ${hoy}`} chevron />
          <HeaderBtn icon={<Filter size={15} />} label="Filtros" />
          <a
            href="/api/export.xlsx"
            className="flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-white shadow-card transition hover:brightness-105"
          >
            <Download size={15} /> Exportar Excel
          </a>
        </div>
      </div>
    </div>
  )
}

function HeaderBtn({
  icon,
  label,
  chevron,
}: {
  icon: React.ReactNode
  label: string
  chevron?: boolean
}) {
  return (
    <button className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-ink shadow-card">
      {icon} {label} {chevron && <ChevronDown size={14} className="text-muted" />}
    </button>
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
      <div className="rounded-2xl bg-surface p-5 shadow-card">
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
      </div>

      <KpiCard
        tone="green"
        title="Bienestar general"
        big={`${k.bienestarGeneral}%`}
        sub={k.bienestarGeneral >= 66 ? 'Nivel medio - alto' : k.bienestarGeneral >= 40 ? 'Nivel medio' : 'Nivel bajo'}
        delta={<Delta value={k.bienestarDelta} />}
        face={DASSET('kpi_happy.png')}
      />
      <div className="rounded-2xl bg-[#fffaf0] p-5 shadow-card">
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
        <div className="mt-2">
          <Delta value={k.riesgoModeradoDelta} invert />
        </div>
      </div>
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
    <div
      className={`rounded-2xl p-5 shadow-card ${tone === 'green' ? 'bg-[#f2fbf5]' : 'bg-[#fff3f4]'}`}
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
        <img src={face} alt="" className="h-11 w-11" />
      </div>
      <div className="mt-2">{delta}</div>
    </div>
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
  footer?: string
}) {
  return (
    <div className="flex flex-col rounded-2xl bg-surface p-5 shadow-card">
      <h2 className="flex items-center gap-1.5 font-display text-[15px] font-bold">
        {title} {info && <Info size={14} className="text-muted" />}
      </h2>
      <div className="mt-2 flex-1">{children}</div>
      {footer && (
        <button className="mt-3 flex items-center justify-center gap-1.5 text-sm font-bold text-primary">
          {footer} <ArrowRight size={14} />
        </button>
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
    <Card title="Bienestar general por dimensión" info footer="Ver detalle por dimensión">
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
      footer="Ver estudiantes en riesgo"
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
    <Card title="Tendencia de bienestar general" info footer="Ver historial completo">
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
    <Card title="Resultados por curso" footer="Ver todos los cursos">
      <table className="w-full text-left text-xs">
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
                <button className="text-primary">
                  <Eye size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

/* ---------- Factores ---------- */
function FactorsCard({ factores }: { factores: NonNullable<Stats['factores']> }) {
  return (
    <Card title="Principales factores de riesgo" info footer="Ver análisis completo">
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
      footer="Ver todas las respuestas"
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
      <div className="flex items-center gap-4 rounded-2xl bg-[#eefaf1] p-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green text-white">
          <Heart size={22} fill="currentColor" />
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
    <div className="flex items-center gap-4 rounded-2xl bg-[#ffecec] p-5">
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
      <button className="flex shrink-0 items-center gap-1.5 rounded-xl border border-coral/40 bg-surface px-3.5 py-2 text-xs font-bold text-coral">
        Ver estudiantes <ArrowRight size={13} />
      </button>
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
    <div className="rounded-2xl bg-surface p-5 shadow-card">
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
    </div>
  )
}

function NextStepsCard() {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-[#eefaf1] p-5">
      <img src={DASSET('next_plant.png')} alt="" className="h-16 w-16 object-contain" />
      <div className="min-w-0 flex-1">
        <p className="font-display text-[15px] font-bold text-ink">¿Qué sigue?</p>
        <p className="text-xs text-muted">
          Te recomendamos revisar los resultados por curso y planificar actividades para
          fortalecer el bienestar emocional.
        </p>
      </div>
      <button className="flex shrink-0 items-center gap-1.5 rounded-xl bg-green px-3.5 py-2 text-xs font-bold text-white">
        Plan de acción <ArrowRight size={13} />
      </button>
    </div>
  )
}
