// Modelo y configuración de la encuesta móvil de Bienestar Escolar.
// Instrumento de escucha y apoyo (tamizaje) del equipo de orientación escolar.
// Tono cálido y NO clínico para el estudiante. Las etiquetas de riesgo se calculan
// para el panel del orientador, nunca se muestran al alumno.
// Formulario SIN nombre ni apellido (respuestas confidenciales).

export type Shift = 'mañana' | 'tarde'
export type AgeRange = '10-11' | '12-13' | '14-15' | '16-18'

export type StudentProfile = {
  grade: string
  course: string
  shift: Shift | ''
  ageRange: AgeRange | ''
}

export type RiskLevel = 'bajo' | 'moderado' | 'alto'

export type Option = {
  value: string
  label: string
  score: number
  tone: 'green' | 'blue' | 'yellow' | 'orange' | 'coral'
  // Icono propio de la opción (PNG en /assets/mobile/). Si falta, se usa el fallback.
  icon?: string
}

export type Question = {
  id: string
  title: string
  illustration?: string
  options: Option[]
  // Ítem sensible: una respuesta alta activa alerta prioritaria en el panel.
  critical?: boolean
}

// Escala de 5 puntos. `icons` opcional: un PNG por opción (misma longitud que labels).
function scale5(labels: string[], icons?: string[]): Option[] {
  const tones = ['green', 'blue', 'yellow', 'orange', 'coral'] as const
  return labels.map((label, i) => ({
    value: slug(label),
    label,
    score: i,
    tone: tones[i],
    icon: icons?.[i],
  }))
}

// Escala de frecuencia de 4 puntos (Nunca, Pocas veces, Casi siempre, Siempre).
// Sin icono propio: usan la insignia de color (verde→rojo) que indica intensidad
// de forma consistente y neutral (apropiado para preguntas sensibles).
function scaleFreq(): Option[] {
  return [
    { value: 'nunca', label: 'Nunca', score: 0, tone: 'green' },
    { value: 'pocas_veces', label: 'Pocas veces', score: 1, tone: 'yellow' },
    { value: 'casi_siempre', label: 'Casi siempre', score: 3, tone: 'orange' },
    { value: 'siempre', label: 'Siempre', score: 4, tone: 'coral' },
  ]
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

export const QUESTIONS: Question[] = [
  {
    id: 'colegio',
    title: '¿Cómo te sientes en el colegio?',
    illustration: 'q_colegio.png',
    options: scale5(
      ['Muy cómodo', 'Cómodo', 'Neutral', 'Incómodo', 'Muy incómodo'],
      [
        'emotion_01_muy_bien.png',
        'emotion_02_bien.png',
        'emotion_03_regular.png',
        'emotion_04_mal.png',
        'emotion_05_muy_mal.png',
      ],
    ),
  },
  {
    id: 'estres',
    title: '¿Has sentido mucho estrés recientemente?',
    illustration: 'q_estres.png',
    options: scale5(
      ['Nada', 'Poco', 'Moderado', 'Mucho', 'Demasiado'],
      [
        'icons/ic_estres_nada.png',
        'icons/ic_estres_poco.png',
        'icons/ic_estres_moderado.png',
        'icons/ic_estres_mucho.png',
        'icons/ic_estres_demasiado.png',
      ],
    ),
  },
  {
    id: 'dificultades',
    title: '¿Has sentido que las dificultades en tu vida son imposibles de resolver?',
    illustration: 'q_dificultades.png',
    options: scaleFreq(),
  },
  {
    id: 'interes',
    title: '¿Has perdido el interés en actividades que antes disfrutabas mucho?',
    illustration: 'q_interes.png',
    options: scaleFreq(),
  },
  {
    id: 'descanso',
    title: '¿Has deseado quedarte dormido(a) y no volver a despertar?',
    illustration: 'q_descanso.png',
    options: scaleFreq(),
    critical: true,
  },
  {
    id: 'solo',
    title: '¿Te has sentido solo(a)?',
    illustration: 'q_solo.png',
    options: scaleFreq(),
  },
  {
    id: 'ausencia',
    title: '¿Has pensado que los demás estarían mejor si tú no estuvieras?',
    illustration: 'q_ausencia.png',
    options: scaleFreq(),
    critical: true,
  },
  {
    id: 'dolor',
    title:
      '¿Has sentido un dolor emocional tan fuerte que has pensado en hacerte daño físicamente para aliviarlo?',
    illustration: 'q_dolor.png',
    options: scaleFreq(),
    critical: true,
  },
]

// Ítems de categorización (Parte 2) — selección múltiple.
export const CATEGORIES = [
  { value: 'ideacion', label: 'Ideación: son solo pensamientos, pero no tengo un plan.' },
  {
    value: 'planificacion',
    label: 'Planificación: he pensado en formas, momentos o lugares para hacerme daño.',
  },
  {
    value: 'crisis_vital',
    label:
      'Crisis vital: mi situación se debe a un problema puntual (ruptura, pérdida de un familiar, notas, etc.).',
  },
  {
    value: 'entorno_familiar',
    label: 'Entorno familiar: siento que el problema principal está en mi casa.',
  },
  {
    value: 'aislamiento',
    label: 'Aislamiento: siento que no tengo a nadie con quien hablar o que nadie me entiende.',
  },
  {
    value: 'desesperanza',
    label: 'Desesperanza: siento que el futuro no va a mejorar sin importar lo que haga.',
  },
] as const

// Disposición a recibir apoyo (Parte 3).
export const SUPPORT_OPTIONS = [
  { value: 'si_pronto', label: 'Sí, lo necesito pronto.', tone: 'coral' as const, icon: 'icons/ic_apoyo_si.png' },
  { value: 'tal_vez', label: 'Tal vez más adelante.', tone: 'yellow' as const, icon: 'icons/ic_apoyo_talvez.png' },
  { value: 'no_ahora', label: 'No por ahora.', tone: 'green' as const, icon: 'icons/ic_apoyo_no.png' },
]

export type Answers = Record<string, string>

export type SurveyResponse = {
  profile: StudentProfile
  answers: Answers
  categories: string[]
  openText: string
  support: string
}

export function scoreOf(answers: Answers): number {
  return QUESTIONS.reduce((total, q) => {
    const opt = q.options.find((o) => o.value === answers[q.id])
    return total + (opt ? opt.score : 0)
  }, 0)
}

// ¿Algún ítem sensible con respuesta alta (Casi siempre / Siempre)?
export function hasCriticalFlag(answers: Answers): boolean {
  return QUESTIONS.some((q) => {
    if (!q.critical) return false
    const opt = q.options.find((o) => o.value === answers[q.id])
    return !!opt && opt.score >= 3
  })
}

// Nivel para el panel del orientador (provisional; validar con orientación/psicología).
export function riskLevel(answers: Answers, categories: string[] = []): RiskLevel {
  if (hasCriticalFlag(answers) || categories.includes('planificacion')) return 'alto'
  const score = scoreOf(answers)
  if (score >= 15) return 'alto'
  if (score >= 7) return 'moderado'
  return 'bajo'
}

// Pasos: datos + preguntas cerradas + reflexión + disposición de apoyo.
export const TOTAL_STEPS = QUESTIONS.length + 3

export const ASSET = (name: string) => `${import.meta.env.BASE_URL}assets/mobile/${name}`
