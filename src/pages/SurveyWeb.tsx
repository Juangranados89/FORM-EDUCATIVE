import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Heart,
  Home,
  Lightbulb,
  Lock,
  LogOut,
  Moon,
  ShieldCheck,
  Smile,
  Sun,
  UserRound,
} from 'lucide-react'
import {
  ASSET,
  CATEGORIES,
  QUESTIONS,
  SUPPORT_OPTIONS,
  type Answers,
  type Question,
  type StudentProfile,
} from '../lib/survey'
import { Illustration, OptionRow } from '../components/survey/ui'
import { api } from '../lib/api'

/* Pasos de la versión web: agrupan las preguntas del instrumento en 7 secciones. */
const STEPS = [
  { id: 'datos', label: 'Mis datos', icon: <UserRound size={16} /> },
  { id: 'escuela', label: 'Escuela y estrés', icon: <Home size={16} />, qs: ['colegio', 'estres'] },
  { id: 'emocional', label: 'Bienestar emocional', icon: <Heart size={16} />, qs: ['dificultades', 'interes'] },
  { id: 'habitos', label: 'Hábitos y descanso', icon: <Moon size={16} />, qs: ['descanso', 'solo'] },
  { id: 'emociones', label: 'Tus emociones', icon: <Smile size={16} />, qs: ['ausencia', 'dolor'] },
  { id: 'comentarios', label: 'Comentarios y apoyo', icon: <Lightbulb size={16} /> },
  { id: 'finalizar', label: 'Finalizar', icon: <CheckCircle2 size={16} /> },
] as const

const GRADES = ['5°', '6°', '7°', '8°', '9°', '10°', '11°']
const COURSES = ['A', 'B', 'C', 'D']
const AGES = ['10-11', '12-13', '14-15', '16-18']

const qById = (id: string): Question => QUESTIONS.find((q) => q.id === id)!

export default function SurveyWeb() {
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<StudentProfile>({
    grade: '',
    course: '',
    shift: '',
    ageRange: '',
  })
  const [answers, setAnswers] = useState<Answers>({})
  const [categories, setCategories] = useState<string[]>([])
  const [openText, setOpenText] = useState('')
  const [support, setSupport] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [done, setDone] = useState(false)

  const current = STEPS[step]
  const datosOk = profile.grade && profile.course && profile.shift && profile.ageRange

  const stepOk = useMemo(() => {
    if (current.id === 'datos') return !!datosOk
    if ('qs' in current && current.qs) return current.qs.every((q) => answers[q])
    if (current.id === 'comentarios') return !!support
    return true
  }, [current, datosOk, answers, support])

  function toggleCategory(v: string) {
    setCategories((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))
  }

  async function submit() {
    setSending(true)
    setSendError('')
    try {
      await api.submitSurvey({ profile, answers, categories, openText, support })
      setDone(true)
    } catch {
      setSendError('No pudimos enviar tus respuestas. Inténtalo de nuevo.')
    } finally {
      setSending(false)
    }
  }

  if (done) return <ThanksWeb />

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <div className="flex flex-1">
        {/* ============ Sidebar izquierda ============ */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface px-4 pb-5 pt-6 lg:flex">
          <div className="flex items-center gap-2.5 px-1">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Heart size={20} className="text-primary" fill="currentColor" />
            </span>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-primary">
                Bienestar Escolar
              </p>
              <p className="text-xs text-muted">Tu opinión importa 💛</p>
            </div>
          </div>

          <p className="mt-6 px-1 text-[11px] font-bold uppercase tracking-wide text-muted">
            Encuesta
          </p>
          <nav className="mt-1 space-y-0.5">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold ${
                  i === step
                    ? 'bg-primary/10 text-primary'
                    : i < step
                      ? 'text-green'
                      : 'text-muted'
                }`}
              >
                <span className="flex h-6 w-6 items-center justify-center">
                  {i < step ? <Check size={16} /> : s.icon}
                </span>
                {i + 1}. {s.label}
              </div>
            ))}
          </nav>

          <div className="mt-6 rounded-2xl bg-primary/5 p-4">
            <p className="flex items-center gap-1.5 font-display text-sm font-bold text-primary">
              <ShieldCheck size={15} /> Encuesta confidencial
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Tu información está protegida y será utilizada únicamente para mejorar el
              bienestar de los estudiantes.
            </p>
          </div>

          <div className="mt-auto rounded-2xl bg-[#eefaf1] p-4">
            <p className="font-display text-sm font-bold text-green">¿Necesitas ayuda?</p>
            <p className="text-xs text-muted">Estamos para escucharte.</p>
          </div>
        </aside>

        {/* ============ Contenido central ============ */}
        <main className="min-w-0 flex-1 px-6 py-6 xl:px-10">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-muted">
              <ShieldCheck size={16} className="text-primary" />
              Encuesta de Bienestar y Convivencia Escolar
            </p>
            <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
              <Lock size={12} /> Encuesta 100% confidencial
            </span>
          </div>

          <p className="font-display text-sm font-bold text-primary">
            Paso {step + 1} de {STEPS.length}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold">
            {current.id === 'datos' && 'Cuéntanos un poco sobre ti'}
            {'qs' in current && current.qs && current.label}
            {current.id === 'comentarios' && 'Este espacio es para ti'}
            {current.id === 'finalizar' && 'Revisa y envía tu encuesta'}
          </h1>
          {current.id === 'datos' && (
            <p className="mt-1 text-sm text-muted">
              No te pedimos tu nombre. Esta información es confidencial y se usa solo
              para entender mejor cómo apoyarte.
            </p>
          )}

          <div className="mt-5 rounded-2xl bg-surface p-6 shadow-card">
            {current.id === 'datos' && (
              <DatosWeb profile={profile} onChange={setProfile} />
            )}

            {'qs' in current &&
              current.qs?.map((qid) => {
                const q = qById(qid)
                return (
                  <div key={qid} className="mb-6 last:mb-0">
                    <div className="mb-3 flex items-center gap-3">
                      {q.illustration && (
                        <Illustration
                          src={ASSET(q.illustration)}
                          alt=""
                          className="h-14 w-14 shrink-0"
                        />
                      )}
                      <h2 className="font-display text-lg font-semibold leading-snug">
                        {q.title}
                      </h2>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {q.options.map((o) => (
                        <OptionRow
                          key={o.value}
                          option={o}
                          selected={answers[qid] === o.value}
                          onSelect={() => setAnswers({ ...answers, [qid]: o.value })}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}

            {current.id === 'comentarios' && (
              <div>
                <p className="mb-2 text-sm text-muted">
                  Si en algún momento has sentido que no puedes más, cuéntanos
                  brevemente qué situación estás pasando. Nadie te juzgará.{' '}
                  <span className="font-semibold">(opcional)</span>
                </p>
                <textarea
                  value={openText}
                  onChange={(e) => setOpenText(e.target.value)}
                  placeholder="Escribe aquí lo que quieras contarnos..."
                  className="h-28 w-full resize-none rounded-2xl border-2 border-line bg-bg p-4 text-[15px] outline-none focus:border-primary"
                />
                <p className="mb-2 mt-5 text-sm font-semibold">
                  Si quieres, marca lo que más se relacione con cómo te sientes:
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => toggleCategory(c.value)}
                      className={`flex items-start gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left text-[13px] font-medium leading-snug transition ${
                        categories.includes(c.value)
                          ? 'border-primary bg-primary/5'
                          : 'border-line bg-surface hover:border-primary/40'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                          categories.includes(c.value)
                            ? 'border-primary bg-primary text-white'
                            : 'border-line'
                        }`}
                      >
                        {categories.includes(c.value) && <Check size={13} />}
                      </span>
                      {c.label}
                    </button>
                  ))}
                </div>
                <p className="mb-2 mt-6 text-sm font-semibold">
                  ¿Te gustaría hablar con alguien del equipo de orientación de forma
                  privada?
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {SUPPORT_OPTIONS.map((o) => (
                    <OptionRow
                      key={o.value}
                      option={{ value: o.value, label: o.label, score: 0, tone: o.tone, icon: o.icon }}
                      selected={support === o.value}
                      onSelect={() => setSupport(o.value)}
                    />
                  ))}
                </div>
              </div>
            )}

            {current.id === 'finalizar' && (
              <div className="text-sm">
                <p className="text-muted">
                  Respondiste{' '}
                  <span className="font-bold text-ink">
                    {Object.keys(answers).length} de {QUESTIONS.length}
                  </span>{' '}
                  preguntas
                  {openText ? ', dejaste un comentario' : ''} y tu respuesta sobre
                  hablar con orientación es{' '}
                  <span className="font-bold text-ink">
                    “{SUPPORT_OPTIONS.find((s) => s.value === support)?.label || '—'}”
                  </span>
                  .
                </p>
                <p className="mt-3 rounded-xl bg-primary/5 p-3 text-xs text-muted">
                  Al enviar, tus respuestas llegarán de forma confidencial al equipo de
                  orientación escolar para brindarte apoyo si lo necesitas.
                </p>
                {sendError && (
                  <p className="mt-3 rounded-xl bg-coral/10 px-3 py-2 text-center text-xs font-semibold text-coral">
                    {sendError}
                  </p>
                )}
              </div>
            )}

            {/* Botones */}
            <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
              {step === 0 ? (
                <span />
              ) : (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 rounded-xl border-2 border-line bg-surface px-4 py-2.5 text-sm font-bold text-muted transition hover:border-primary/40"
                >
                  <ArrowLeft size={16} /> Atrás
                </button>
              )}
              {current.id === 'finalizar' ? (
                <button
                  onClick={submit}
                  disabled={sending}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-display text-sm font-bold text-white shadow-soft transition hover:brightness-105 disabled:opacity-50"
                >
                  {sending ? 'Enviando…' : 'Enviar encuesta'} <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!stepOk}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-display text-sm font-bold text-white shadow-soft transition hover:brightness-105 disabled:opacity-50"
                >
                  Siguiente <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Progreso inferior */}
          <div className="mt-5 rounded-2xl bg-surface p-4 shadow-card">
            <p className="mb-3 text-xs font-bold text-muted">Tu progreso</p>
            <div className="flex items-center">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        i < step
                          ? 'bg-green text-white'
                          : i === step
                            ? 'bg-primary text-white'
                            : 'bg-line text-muted'
                      }`}
                    >
                      {i < step ? <Check size={14} /> : i + 1}
                    </span>
                    <span className="mt-1 hidden max-w-20 text-center text-[10px] font-semibold leading-tight text-muted md:block">
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`mx-1 h-0.5 flex-1 self-start md:mt-3.5 ${i < step ? 'bg-green' : 'bg-line'}`}
                      style={{ marginTop: 14 }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* ============ Columna derecha ============ */}
        <aside className="hidden w-80 shrink-0 flex-col gap-4 px-5 py-6 xl:flex">
          <div className="flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl bg-primary/5 p-3">
            <img
              src={ASSET('home/scene_bg.png')}
              alt="Ilustración de bienestar escolar"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="rounded-2xl bg-[#eefaf1] p-4">
            <p className="flex items-center gap-1.5 font-display text-sm font-bold text-green">
              <ShieldCheck size={15} /> Tu bienestar es importante
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Esta encuesta nos ayuda a identificar cómo se sienten los estudiantes
              para crear un colegio más saludable y feliz para todos.
            </p>
          </div>
          <div className="rounded-2xl bg-primary/5 p-4">
            <p className="flex items-center gap-1.5 font-display text-sm font-bold text-primary">
              <Sun size={15} /> Recuerda
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-muted">
              {[
                'No hay respuestas buenas ni malas.',
                'Sé honesto(a), tu respuesta es valiosa.',
                'Puedes pedir ayuda siempre que lo necesites.',
              ].map((t) => (
                <li key={t} className="flex items-start gap-1.5">
                  <Check size={13} className="mt-0.5 shrink-0 text-primary" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-[#fff7ec] p-4">
            <p className="flex items-center gap-1.5 font-display text-sm font-bold text-orange">
              <Heart size={15} fill="currentColor" /> ¿Necesitas hablar con alguien?
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Si te sientes triste, abrumado o necesitas apoyo, no estás solo. Aquí
              estamos para ayudarte.
            </p>
            <Illustration src={ASSET('q_apoyo.png')} alt="" className="mx-auto mt-2 h-24" />
          </div>
        </aside>
      </div>

      {/* Barra inferior de privacidad */}
      <footer className="flex items-center justify-between gap-3 border-t border-line bg-[#eef3fd] px-6 py-3">
        <p className="flex items-center gap-2 text-xs font-semibold text-ink/80">
          <Lock size={14} className="text-primary" />
          <span>
            <span className="font-bold">Tu privacidad es nuestra prioridad.</span> No
            compartimos tu información personal. Esta encuesta es confidencial.
          </span>
        </p>
        <p className="hidden items-center gap-1.5 text-xs font-bold text-primary sm:flex">
          <UserRound size={14} /> Juntos construimos un mejor colegio
        </p>
      </footer>
    </div>
  )
}

/* ---------- Datos ---------- */
function DatosWeb({
  profile,
  onChange,
}: {
  profile: StudentProfile
  onChange: (p: StudentProfile) => void
}) {
  const set = (patch: Partial<StudentProfile>) => onChange({ ...profile, ...patch })
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold">Grado / Curso *</span>
        <div className="flex gap-2">
          <select
            value={profile.grade}
            onChange={(e) => set({ grade: e.target.value })}
            className="input"
          >
            <option value="">Grado</option>
            {GRADES.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
          <select
            value={profile.course}
            onChange={(e) => set({ course: e.target.value })}
            className="input"
          >
            <option value="">Curso</option>
            {COURSES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold">Jornada *</span>
        <div className="flex gap-2">
          {(['mañana', 'tarde'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set({ shift: s })}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 px-4 py-2.5 text-sm font-bold capitalize transition ${
                profile.shift === s
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-line bg-surface text-muted'
              }`}
            >
              {s === 'mañana' ? <Sun size={15} /> : <Moon size={15} />}
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold">Edad *</span>
        <select
          value={profile.ageRange}
          onChange={(e) => set({ ageRange: e.target.value as StudentProfile['ageRange'] })}
          className="input"
        >
          <option value="">Selecciona tu rango de edad</option>
          {AGES.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <p className="rounded-xl bg-primary/5 px-3 py-2.5 text-xs text-muted">
          ℹ️ No te pediremos información innecesaria. Las preguntas no tienen
          respuestas correctas o incorrectas.
        </p>
      </div>
    </div>
  )
}

/* ---------- Gracias ---------- */
function ThanksWeb() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg p-6 text-center">
      <Illustration src={ASSET('q_bienestar.png')} alt="" className="h-40" />
      <h1 className="mt-4 font-display text-4xl font-bold text-ink">¡Gracias!</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        Tus respuestas ayudarán a mejorar el bienestar de todos los estudiantes. Si
        necesitas apoyo, recuerda que no estás solo(a): puedes hablar con tu
        orientador(a) o llamar a la línea de atención emocional nacional{' '}
        <span className="font-bold text-primary">106</span> (24/7).
      </p>
      <a
        href="/"
        className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-display text-sm font-bold text-white shadow-soft"
      >
        <LogOut size={15} /> Salir de la encuesta
      </a>
    </div>
  )
}
