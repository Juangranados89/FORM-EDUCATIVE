import { NavLink, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  ClipboardEdit,
  GraduationCap,
  Heart,
  Home,
  LogOut,
  MessageSquareText,
  ScanSearch,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react'
import { api } from '../../lib/api'

const DASSET = (n: string) => `${import.meta.env.BASE_URL}assets/dashboard/${n}`

type NavDef = { to: string; label: string; icon: React.ReactNode; soon?: boolean }

const RESULTADOS: NavDef[] = [
  { to: '/dashboard', label: 'Resumen', icon: <Home size={17} /> },
  { to: '/dashboard/bienestar', label: 'Bienestar general', icon: <BarChart3 size={17} /> },
  { to: '/dashboard/emociones', label: 'Emociones y hábitos', icon: <Heart size={17} />, soon: true },
  { to: '/dashboard/factores', label: 'Factores de riesgo', icon: <ScanSearch size={17} />, soon: true },
  { to: '/dashboard/comparaciones', label: 'Comparaciones', icon: <SlidersHorizontal size={17} />, soon: true },
  { to: '/dashboard/respuestas', label: 'Respuestas abiertas', icon: <MessageSquareText size={17} /> },
]
const GESTION: NavDef[] = [
  { to: '/dashboard/cursos', label: 'Cursos / Grados', icon: <GraduationCap size={17} /> },
  { to: '/dashboard/estudiantes', label: 'Estudiantes', icon: <UserRound size={17} /> },
  { to: '/dashboard/alertas', label: 'Alertas de riesgo', icon: <AlertTriangle size={17} /> },
  { to: '/dashboard/planes', label: 'Planes de acción', icon: <ClipboardEdit size={17} />, soon: true },
]

export default function Shell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  const nav = useNavigate()
  return (
    <div className="flex min-h-screen bg-bg text-ink">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-surface px-4 pb-5 pt-5 lg:flex">
        <div className="flex items-center gap-2.5 px-1">
          <Logo />
          <div className="font-display text-lg font-bold leading-tight text-primary">
            Bienestar
            <br />
            Escolar
          </div>
        </div>

        <p className="mt-6 px-1 text-[11px] font-bold uppercase tracking-wide text-muted">
          Resultados
        </p>
        <nav className="mt-1 space-y-0.5">
          {RESULTADOS.map((n) => (
            <NavItem key={n.to} {...n} />
          ))}
        </nav>

        <p className="mt-5 px-1 text-[11px] font-bold uppercase tracking-wide text-muted">
          Gestión
        </p>
        <nav className="mt-1 space-y-0.5">
          {GESTION.map((n) => (
            <NavItem key={n.to} {...n} />
          ))}
        </nav>

        <div className="mt-auto rounded-2xl bg-[#fff7ec] p-4">
          <p className="font-display text-[15px] font-bold">¿Necesitas ayuda?</p>
          <p className="mt-1 text-xs text-muted">Recursos y guías para acompañar a los estudiantes.</p>
          <img src={DASSET('help_orientadora.png')} alt="" className="mx-auto mt-2 h-20 object-contain" />
        </div>
      </aside>

      {/* Contenido */}
      <main className="min-w-0 flex-1 px-6 pb-8 pt-4">
        <div className="flex items-center justify-end gap-3 py-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange/20 text-orange">
            <UserRound size={18} />
          </span>
          <div className="text-xs leading-tight">
            <p className="font-bold">Orientador(a)</p>
            <p className="text-muted">Bienestar Escolar</p>
          </div>
          <button
            onClick={() => api.logout().then(() => nav('/login'))}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-bold text-muted hover:text-coral"
          >
            <LogOut size={14} /> Salir
          </button>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
        </div>

        {children}
      </main>
    </div>
  )
}

function NavItem({ to, label, icon, soon }: NavDef) {
  if (soon)
    return (
      <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted/60">
        {icon}
        <span className="flex-1">{label}</span>
        <span className="rounded-full bg-line px-1.5 py-0.5 text-[9px] font-bold text-muted">
          PRONTO
        </span>
      </div>
    )
  return (
    <NavLink
      to={to}
      end={to === '/dashboard'}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${
          isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-bg hover:text-ink'
        }`
      }
    >
      {icon} {label}
    </NavLink>
  )
}

export function Logo() {
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

/* Página placeholder para módulos aún no construidos */
export function ComingSoon({ title }: { title: string }) {
  return (
    <Shell title={title} subtitle="Este módulo estará disponible próximamente.">
      <div className="mt-16 flex flex-col items-center gap-3 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ArrowRight size={26} />
        </span>
        <p className="font-display text-lg font-bold">En construcción</p>
        <p className="max-w-sm text-sm text-muted">
          Estamos preparando esta sección. Mientras tanto, revisa el Resumen, las
          Alertas de riesgo y el listado de Estudiantes.
        </p>
      </div>
    </Shell>
  )
}

/* Etiquetas compartidas para respuestas */
export const VAL_LABEL: Record<string, string> = {
  muy_comodo: 'Muy cómodo', comodo: 'Cómodo', neutral: 'Neutral', incomodo: 'Incómodo', muy_incomodo: 'Muy incómodo',
  nada: 'Nada', poco: 'Poco', moderado: 'Moderado', mucho: 'Mucho', demasiado: 'Demasiado',
  nunca: 'Nunca', pocas_veces: 'Pocas veces', casi_siempre: 'Casi siempre', siempre: 'Siempre',
}
export const SUP_LABEL: Record<string, string> = {
  si_pronto: 'Sí, lo necesito pronto',
  tal_vez: 'Tal vez más adelante',
  no_ahora: 'No por ahora',
}
export const RISK_STYLE: Record<string, string> = {
  alto: 'bg-coral/15 text-coral',
  moderado: 'bg-yellow/25 text-orange',
  bajo: 'bg-green/15 text-green',
}
