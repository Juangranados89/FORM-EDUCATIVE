import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Check,
  Heart,
  Lock,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import {
  ASSET,
  CATEGORIES,
  QUESTIONS,
  SUPPORT_OPTIONS,
  TOTAL_STEPS,
  type Answers,
  type StudentProfile,
} from '../lib/survey'
import {
  ConfidentialNote,
  GhostButton,
  Illustration,
  OptionRow,
  PrimaryButton,
  ProgressBar,
} from '../components/survey/ui'
import { api } from '../lib/api'

type Screen =
  | 'welcome'
  | 'datos'
  | 'question'
  | 'reflexion'
  | 'apoyo'
  | 'gracias'
  | 'ayuda'

const GRADES = ['5°', '6°', '7°', '8°', '9°', '10°', '11°']
const COURSES = ['A', 'B', 'C', 'D']
const AGES = ['10-11', '12-13', '14-15', '16-18']

export default function SurveyMobile() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [qIndex, setQIndex] = useState(0)
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

  // Número de paso mostrado en la barra de progreso (1..TOTAL_STEPS).
  const stepNumber = useMemo(() => {
    if (screen === 'datos') return 1
    if (screen === 'question') return qIndex + 2
    if (screen === 'reflexion') return QUESTIONS.length + 2
    if (screen === 'apoyo') return TOTAL_STEPS
    return 0
  }, [screen, qIndex])

  const question = QUESTIONS[qIndex]
  const datosOk = profile.grade && profile.course && profile.shift && profile.ageRange

  function toggleCategory(value: string) {
    setCategories((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    )
  }

  async function submit() {
    setSending(true)
    setSendError('')
    try {
      await api.submitSurvey({ profile, answers, categories, openText, support })
      setScreen('gracias')
    } catch {
      setSendError('No pudimos enviar tus respuestas. Revisa tu conexión e inténtalo de nuevo.')
    } finally {
      setSending(false)
    }
  }

  function next() {
    if (screen === 'datos') return setScreen('question')
    if (screen === 'question') {
      if (qIndex < QUESTIONS.length - 1) setQIndex(qIndex + 1)
      else setScreen('reflexion')
      return
    }
    if (screen === 'reflexion') return setScreen('apoyo')
    if (screen === 'apoyo') void submit()
  }

  function back() {
    if (screen === 'datos') return setScreen('welcome')
    if (screen === 'question') {
      if (qIndex > 0) setQIndex(qIndex - 1)
      else setScreen('datos')
      return
    }
    if (screen === 'reflexion') return setScreen('question')
    if (screen === 'apoyo') return setScreen('reflexion')
    if (screen === 'ayuda') return setScreen('gracias')
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#eef4fc] sm:p-4">
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-bg sm:h-[760px] sm:max-w-[420px] sm:rounded-[36px] sm:border-8 sm:border-white sm:shadow-soft">
        <div className="no-scrollbar flex-1 overflow-y-auto">
          {screen === 'welcome' && <Welcome onStart={() => setScreen('datos')} />}

          {screen !== 'welcome' && screen !== 'gracias' && screen !== 'ayuda' && (
            <div className="flex min-h-full flex-col px-5 pb-5 pt-6">
              <div className="mb-6 flex items-center gap-3">
                {stepNumber > 1 || screen === 'question' ? (
                  <button onClick={back} className="text-muted" aria-label="Atrás">
                    <ArrowLeft size={22} />
                  </button>
                ) : (
                  <span className="w-[22px]" />
                )}
                <div className="flex-1">
                  <ProgressBar step={stepNumber} total={TOTAL_STEPS} />
                </div>
              </div>

              {screen === 'datos' && (
                <DatosForm profile={profile} onChange={setProfile} />
              )}

              {screen === 'question' && (
                <div className="flex flex-1 flex-col">
                  <h1 className="mb-4 font-display text-2xl font-semibold leading-tight text-ink">
                    {question.title}
                  </h1>
                  {question.illustration && (
                    <div className="mb-4 flex justify-center">
                      <Illustration
                        src={ASSET(question.illustration)}
                        alt=""
                        className="h-28"
                      />
                    </div>
                  )}
                  <div className="space-y-2.5">
                    {question.options.map((o) => (
                      <OptionRow
                        key={o.value}
                        option={o}
                        selected={answers[question.id] === o.value}
                        onSelect={() =>
                          setAnswers({ ...answers, [question.id]: o.value })
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {screen === 'reflexion' && (
                <div className="flex flex-1 flex-col">
                  <h1 className="font-display text-2xl font-semibold leading-tight text-ink">
                    Este espacio es para ti{' '}
                    <span className="text-muted">(opcional)</span>
                  </h1>
                  <p className="mb-3 mt-2 text-sm text-muted">
                    Si en algún momento has sentido que no puedes más, cuéntanos
                    brevemente qué situación estás pasando o qué crees que te hace
                    sentir así. Nadie te juzgará.
                  </p>
                  <div className="mb-3 flex justify-center">
                    <Illustration src={ASSET('q_reflexion.png')} alt="" className="h-24" />
                  </div>
                  <div className="relative">
                    <textarea
                      value={openText}
                      onChange={(e) => setOpenText(e.target.value)}
                      placeholder="Escribe aquí lo que quieras contarnos..."
                      className="h-32 w-full resize-none rounded-2xl border-2 border-line bg-surface p-4 text-[15px] text-ink outline-none focus:border-primary"
                    />
                    <Heart
                      size={20}
                      className="absolute bottom-4 right-4 text-coral"
                      fill="currentColor"
                    />
                  </div>

                  <p className="mb-2 mt-5 text-sm font-semibold text-ink">
                    Si quieres, marca lo que más se relacione con cómo te sientes:
                  </p>
                  <div className="space-y-2">
                    {CATEGORIES.map((c) => (
                      <CheckRow
                        key={c.value}
                        label={c.label}
                        checked={categories.includes(c.value)}
                        onToggle={() => toggleCategory(c.value)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {screen === 'apoyo' && (
                <div className="flex flex-1 flex-col">
                  <h1 className="font-display text-2xl font-semibold leading-tight text-ink">
                    ¿Te gustaría hablar con alguien del equipo de orientación de forma
                    privada?
                  </h1>
                  <p className="mb-3 mt-2 text-sm text-muted">
                    Tú decides. Estamos aquí para acompañarte cuando lo necesites.
                  </p>
                  <div className="mb-4 flex justify-center">
                    <Illustration src={ASSET('q_apoyo.png')} alt="" className="h-28" />
                  </div>
                  <div className="space-y-2.5">
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

              <div className="mt-6 flex items-center justify-between gap-3">
                {screen === 'datos' ? (
                  <span />
                ) : (
                  <GhostButton onClick={back}>Atrás</GhostButton>
                )}
                <PrimaryButton
                  onClick={next}
                  full={screen === 'datos'}
                  disabled={
                    sending ||
                    (screen === 'datos' && !datosOk) ||
                    (screen === 'question' && !answers[question.id]) ||
                    (screen === 'apoyo' && !support)
                  }
                >
                  {screen === 'apoyo' ? (sending ? 'Enviando…' : 'Enviar encuesta') : 'Siguiente'}
                </PrimaryButton>
              </div>
              {sendError && (
                <p className="mt-3 rounded-xl bg-coral/10 px-3 py-2 text-center text-xs font-semibold text-coral">
                  {sendError}
                </p>
              )}
              {screen === 'datos' && (
                <div className="mt-4">
                  <ConfidentialNote />
                </div>
              )}
            </div>
          )}

          {screen === 'gracias' && <Gracias onHelp={() => setScreen('ayuda')} />}
          {screen === 'ayuda' && <Ayuda onBack={() => setScreen('gracias')} />}
        </div>
      </div>
    </div>
  )
}

/* ---------- Bienvenida / Home animado ----------
   Escena por capas sobre el cielo (home/*.png), cada elemento con su animación.
   Los personajes parpadean superponiendo su frame de ojos cerrados.             */
const H = (n: string) => ASSET(`home/${n}`)

const CARDS = [
  { icon: <ShieldCheck size={18} />, tone: 'primary' as const, text: 'Tus respuestas son confidenciales.' },
  { icon: <Lock size={18} />, tone: 'green' as const, text: 'Nos ayudan a identificar situaciones y brindar apoyo.' },
  { icon: <Heart size={18} fill="currentColor" />, tone: 'coral' as const, text: 'No estás solo, estamos para ayudarte.' },
]

function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#bfe3f5]">
      {/* Fondo fijo, sin estirar */}
      <img
        src={H('scene_bg.png')}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover object-top"
      />

      {/* Título "¡Hola!" (imagen extraída, tipografía original) */}
      <img
        src={H('title_hola.png')}
        alt="¡Hola! Queremos saber cómo te sientes"
        draggable={false}
        className="absolute left-1/2 top-[6%] w-[52%] -translate-x-1/2"
      />

      {/* Sol grande: giro izq/der + brillo */}
      <div className="absolute" style={{ left: '2%', top: '2%', width: '24%' }}>
        <div
          className="anim-glow absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255,209,102,.9) 0%, rgba(255,209,102,0) 65%)',
          }}
        />
        <img
          src={H('sun.png')}
          alt=""
          draggable={false}
          className="anim-sun-swing relative w-full"
          style={{ transformOrigin: 'center' }}
        />
      </div>

      {/* Avión de papel volando */}
      <img
        src={H('plane.png')}
        alt=""
        draggable={false}
        className="anim-fly absolute"
        style={{ right: '5%', top: '9%', width: '15%' }}
      />

      {/* Personajes al frente: SOLO parpadeo (sin flotar) */}
      <Character base="character_girl.png" left={7} top={42} width={41} />
      <Character base="character_boy.png" left={48} top={40} width={43} delay="2.2s" />

      {/* Tarjetas de confianza superpuestas (compactas) */}
      <div className="absolute inset-x-4" style={{ top: '63%' }}>
        <div className="divide-y divide-black/5 rounded-2xl bg-white/90 px-1 shadow-soft backdrop-blur-sm">
          {CARDS.map((c) => (
            <div key={c.text} className="flex items-center gap-2.5 px-3 py-1.5">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${assuranceTone[c.tone]}`}>
                {c.icon}
              </span>
              <p className="text-[13px] font-semibold leading-snug text-ink">{c.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Botón friendly (más pequeño, separado de la card) */}
      <button
        onClick={onStart}
        className="anim-bounce-friendly absolute inset-x-8 bottom-6 flex items-center justify-center gap-2 rounded-full bg-primary py-3 font-display text-base font-bold text-white shadow-soft transition hover:brightness-105 active:scale-95"
        style={{ boxShadow: '0 6px 0 0 #4b3bc4, 0 12px 20px rgba(75,59,196,.35)' }}
      >
        <Sparkles size={18} className="anim-rocket" />
        ¡Comenzar encuesta!
      </button>
    </div>
  )
}

function Character({
  base,
  left,
  top,
  width,
  delay,
}: {
  base: string
  left: number
  top: number
  width: number
  delay?: string
}) {
  return (
    <img
      src={H(base)}
      alt=""
      draggable={false}
      className="anim-idle absolute block"
      style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, animationDelay: delay }}
    />
  )
}

const assuranceTone = {
  primary: 'bg-primary/10 text-primary',
  green: 'bg-green/15 text-green',
  coral: 'bg-coral/15 text-coral',
} as const

/* ---------- Datos del estudiante ---------- */
function DatosForm({
  profile,
  onChange,
}: {
  profile: StudentProfile
  onChange: (p: StudentProfile) => void
}) {
  const set = (patch: Partial<StudentProfile>) => onChange({ ...profile, ...patch })
  return (
    <div className="flex-1">
      <h1 className="font-display text-2xl font-semibold leading-tight text-ink">
        Cuéntanos un poco sobre ti
      </h1>
      <p className="mb-5 mt-2 text-sm text-muted">
        No te pedimos tu nombre. Esta información es confidencial y se usa solo para
        entender mejor cómo apoyarte.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Grado">
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
          </Field>
          <Field label="Curso">
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
          </Field>
        </div>

        <Field label="Jornada">
          <div className="flex gap-3">
            {(['mañana', 'tarde'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => set({ shift: s })}
                className={`flex-1 rounded-2xl border-2 px-4 py-2.5 text-sm font-bold capitalize transition ${
                  profile.shift === s
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-line bg-surface text-muted'
                }`}
              >
                {s === 'mañana' ? '☀️ Mañana' : '🌙 Tarde'}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Edad">
          <select
            value={profile.ageRange}
            onChange={(e) => set({ ageRange: e.target.value as StudentProfile['ageRange'] })}
            className="input"
          >
            <option value="">Selecciona tu rango</option>
            {AGES.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  )
}

function Field({
  label,
  icon,
  children,
}: {
  label: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-ink">
        {icon && <span className="text-primary">{icon}</span>}
        {label}
      </span>
      {children}
    </label>
  )
}

/* ---------- Casilla de categorización (selección múltiple) ---------- */
function CheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className={`flex w-full items-start gap-3 rounded-2xl border-2 px-4 py-3 text-left transition ${
        checked
          ? 'border-primary bg-primary/5'
          : 'border-line bg-surface hover:border-primary/40'
      }`}
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
          checked ? 'border-primary bg-primary text-white' : 'border-line bg-surface'
        }`}
      >
        {checked && <Check size={16} />}
      </span>
      <span className="text-[14px] font-medium leading-snug text-ink">{label}</span>
    </button>
  )
}

/* ---------- Gracias ---------- */
function Gracias({ onHelp }: { onHelp: () => void }) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="bg-gradient-to-b from-[#ede9fe] to-[#eef4fc] px-6 pb-8 pt-12 text-center">
        <div className="mb-2 flex justify-center">
          <Illustration src={ASSET('thanks_group.png')} alt="" className="h-44" />
        </div>
        <h1 className="font-display text-4xl font-bold text-ink">¡Gracias!</h1>
        <p className="mx-auto mt-3 max-w-[300px] text-sm text-muted">
          Tus respuestas ayudarán a mejorar el bienestar de todos los estudiantes.
        </p>
      </div>
      <div className="flex-1 space-y-4 px-6 pb-8 pt-4">
        <div className="rounded-2xl bg-surface p-5 shadow-card">
          <div className="mb-3 flex items-center gap-2 text-ink">
            <Heart size={20} className="text-coral" fill="currentColor" />
            <span className="font-semibold">Si necesitas apoyo, no estás solo(a)</span>
          </div>
          <p className="mb-4 text-sm text-muted">
            Puedes hablar con alguien de confianza o comunicarte a estas líneas de
            ayuda:
          </p>
          <div className="space-y-2.5">
            <HelpLine
              icon={<UserRound size={16} />}
              title="Habla con tu orientador(a) o psicólogo(a) del colegio"
            />
            <HelpLine
              icon={<Phone size={16} />}
              title="Línea de prevención del suicidio (24/7)"
              value="123 456 789"
            />
            <HelpLine
              icon={<MessageCircle size={16} />}
              title="Línea de atención emocional Nacional (24/7)"
              value="106"
            />
          </div>
        </div>
        <button
          onClick={onHelp}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary/30 bg-primary/5 py-3 text-sm font-bold text-primary"
        >
          <Sparkles size={16} /> Ver más opciones de apoyo
        </button>
      </div>
      <ConfidentialFooter />
    </div>
  )
}

function HelpLine({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode
  title: string
  value?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-bg px-3 py-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold leading-tight text-ink">{title}</p>
        {value && <p className="text-sm font-bold text-primary">{value}</p>}
      </div>
    </div>
  )
}

/* ---------- Ayuda / Tu bienestar importa ---------- */
function Ayuda({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-[#dcfce7] to-[#eef4fc]">
      <div className="px-6 pt-6">
        <button onClick={onBack} className="text-muted" aria-label="Atrás">
          <ArrowLeft size={22} />
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <Illustration src={ASSET('q_bienestar.png')} alt="" className="mb-4 h-44" />
        <h1 className="font-display text-3xl font-bold text-ink">Tu bienestar importa</h1>
        <p className="mt-3 max-w-[280px] text-sm text-muted">
          Cuidarte, hablar y pedir ayuda es de valientes.
        </p>
        <div className="mt-6 rounded-2xl bg-surface/80 px-5 py-4 text-sm font-bold text-ink shadow-card">
          “Pequeñas acciones hoy, grandes cambios mañana.” 😊
        </div>
      </div>
      <ConfidentialFooter />
    </div>
  )
}

function ConfidentialFooter() {
  return (
    <div className="flex items-center justify-center gap-2 border-t border-line bg-surface px-4 py-3 text-center text-[11px] font-semibold text-muted">
      <Lock size={12} className="text-primary" />
      Esta encuesta es confidencial. Tu información está protegida y será utilizada
      únicamente para promover tu bienestar.
    </div>
  )
}
