import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarClock,
  Check,
  ClipboardEdit,
  Download,
  FileText,
  ListChecks,
  Save,
  Sparkles,
  Presentation,
  Target,
  UserRound,
  Wand2,
} from 'lucide-react'
import Shell from '../components/dashboard/Shell'
import {
  api,
  ApiError,
  type ActionPlanContent,
  type PlanContext,
  type SavedPlan,
  type Stats,
} from '../lib/api'

export default function Planes() {
  const nav = useNavigate()
  const [cursos, setCursos] = useState<string[]>([])
  const [scope, setScope] = useState('general')
  const [target, setTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState<ActionPlanContent | null>(null)
  const [ctx, setCtx] = useState<PlanContext | null>(null)
  const [saved, setSaved] = useState<SavedPlan[]>([])
  const [savedOk, setSavedOk] = useState(false)
  const [exporting, setExporting] = useState<'docx' | 'pptx' | ''>('')

  useEffect(() => {
    api
      .stats()
      .then((s: Stats) => setCursos(s.empty ? [] : (s.cursos ?? []).map((c) => c.curso)))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) nav('/login')
      })
    refreshSaved()
  }, [nav])

  const refreshSaved = () =>
    api.actionPlans().then((r) => setSaved(r.plans)).catch(() => {})

  async function generate() {
    setLoading(true)
    setError('')
    setPlan(null)
    setSavedOk(false)
    try {
      const r = await api.suggestPlan(scope, scope === 'curso' ? target : '')
      setPlan(r.plan)
      setCtx(r.context)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo generar el plan.')
    } finally {
      setLoading(false)
    }
  }

  async function save() {
    if (!plan) return
    await api.savePlan({ scope, target: scope === 'curso' ? target : '', title: plan.titulo, content: plan })
    setSavedOk(true)
    refreshSaved()
  }

  async function downloadPlan(
    format: 'docx' | 'pptx',
    content: ActionPlanContent = plan!,
    context: PlanContext | null = ctx,
  ) {
    if (!content) return
    setExporting(format)
    setError('')
    try {
      const { blob, filename } = await api.exportPlan(format, { plan: content, context })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo descargar el plan.')
    } finally {
      setExporting('')
    }
  }

  return (
    <Shell
      title="Planes de acción"
      subtitle="Genera un plan de acompañamiento con IA a partir de los resultados y guárdalo."
    >
      {/* Generador */}
      <div className="mt-5 rounded-2xl bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-muted">Alcance</span>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="rounded-xl border border-line bg-bg px-3 py-2 font-semibold text-ink outline-none focus:border-primary"
            >
              <option value="general">Toda la institución</option>
              <option value="curso">Un curso</option>
            </select>
          </label>
          {scope === 'curso' && (
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-muted">Curso</span>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="rounded-xl border border-line bg-bg px-3 py-2 font-semibold text-ink outline-none focus:border-primary"
              >
                <option value="">Selecciona…</option>
                {cursos.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          )}
          <button
            onClick={generate}
            disabled={loading || (scope === 'curso' && !target)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-card transition hover:brightness-105 disabled:opacity-50"
          >
            <Wand2 size={16} /> {loading ? 'Generando con IA…' : 'Generar plan con IA'}
          </button>
          <span className="flex items-center gap-1 text-xs font-semibold text-muted">
            <Sparkles size={13} className="text-primary" /> Gemini
          </span>
        </div>

        {loading && (
          <p className="mt-4 animate-pulse text-sm font-semibold text-muted">
            La IA está analizando los resultados y redactando el plan…
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-xl bg-coral/10 px-3 py-2 text-sm font-semibold text-coral">
            {error}
          </p>
        )}
      </div>

      {/* Plan generado */}
      {plan && (
        <div className="mt-5 rounded-2xl bg-surface p-6 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">{plan.titulo}</h2>
              {ctx && (
                <p className="mt-1 text-xs text-muted">
                  Basado en {ctx.total} respuestas · {ctx.alcance} · {ctx.risk.alto} en
                  riesgo alto{ctx.criticos ? ` · ${ctx.criticos} críticos` : ''}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => downloadPlan('docx')}
                disabled={!!exporting}
                className="flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2 text-sm font-bold text-primary transition hover:bg-primary/10 disabled:opacity-50"
              >
                {exporting === 'docx' ? <Download size={16} className="animate-bounce" /> : <FileText size={16} />}
                Word (.docx)
              </button>
              <button
                onClick={() => downloadPlan('pptx')}
                disabled={!!exporting}
                className="flex items-center gap-2 rounded-xl border border-orange/30 bg-orange/10 px-3 py-2 text-sm font-bold text-orange transition hover:bg-orange/15 disabled:opacity-50"
              >
                {exporting === 'pptx' ? <Download size={16} className="animate-bounce" /> : <Presentation size={16} />}
                Diapositivas (.pptx)
              </button>
              <button
                onClick={save}
                disabled={savedOk}
                className="flex items-center gap-2 rounded-xl bg-green px-4 py-2 text-sm font-bold text-white shadow-card transition hover:brightness-105 disabled:opacity-60"
              >
                {savedOk ? <Check size={16} /> : <Save size={16} />}
                {savedOk ? 'Guardado' : 'Guardar plan'}
              </button>
            </div>
          </div>

          <p className="mt-3 text-sm text-ink/85">{plan.resumen}</p>

          <Section icon={<Target size={16} />} title="Objetivos">
            <ul className="space-y-1.5">
              {plan.objetivos.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check size={15} className="mt-0.5 shrink-0 text-green" /> {o}
                </li>
              ))}
            </ul>
          </Section>

          <Section icon={<ListChecks size={16} />} title="Actividades">
            <div className="grid gap-3 md:grid-cols-2">
              {plan.actividades.map((a, i) => (
                <div key={i} className="rounded-xl border border-line p-3">
                  <p className="font-bold text-ink">{a.nombre}</p>
                  <p className="mt-1 text-sm text-muted">{a.descripcion}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <UserRound size={12} /> {a.responsable}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarClock size={12} /> {a.plazo}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target size={12} /> {a.dirigido_a}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Section icon={<ListChecks size={16} />} title="Indicadores de seguimiento">
              <ul className="space-y-1.5">
                {plan.indicadores.map((x, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check size={15} className="mt-0.5 shrink-0 text-primary" /> {x}
                  </li>
                ))}
              </ul>
            </Section>
            <Section icon={<ClipboardEdit size={16} />} title="Recursos">
              <ul className="space-y-1.5">
                {plan.recursos.map((x, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check size={15} className="mt-0.5 shrink-0 text-orange" /> {x}
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          <p className="mt-5 rounded-xl bg-yellow/15 p-3 text-xs text-ink/80">
            ⚠️ {plan.nota_seguridad}
          </p>
        </div>
      )}

      {/* Planes guardados */}
      {saved.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 font-display text-lg font-bold text-ink">Planes guardados</h2>
          <div className="space-y-2">
            {saved.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-card">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ClipboardEdit size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ink">{p.content.titulo}</p>
                  <p className="text-xs text-muted">
                    {p.scope === 'curso' ? `Curso ${p.target}` : 'Institución'} ·{' '}
                    {new Date(p.createdAt).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}{' '}
                    · {p.content.actividades.length} actividades
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => downloadPlan('docx', p.content, null)}
                    disabled={!!exporting}
                    title="Descargar Word"
                    className="rounded-lg p-2 text-primary transition hover:bg-primary/10 disabled:opacity-40"
                  >
                    <FileText size={16} />
                  </button>
                  <button
                    onClick={() => downloadPlan('pptx', p.content, null)}
                    disabled={!!exporting}
                    title="Descargar PowerPoint"
                    className="rounded-lg p-2 text-orange transition hover:bg-orange/10 disabled:opacity-40"
                  >
                    <Presentation size={16} />
                  </button>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold capitalize text-primary">
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Shell>
  )
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mt-5">
      <h3 className="mb-2 flex items-center gap-1.5 font-display text-[15px] font-bold text-ink">
        <span className="text-primary">{icon}</span> {title}
      </h3>
      {children}
    </div>
  )
}
