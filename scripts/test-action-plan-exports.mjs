import fs from 'node:fs/promises'
import path from 'node:path'
import { buildActionPlanDocx, buildActionPlanPptx } from '../server/actionPlanExports.js'

const out = process.argv[2] || path.join(process.cwd(), 'tmp-action-plan-exports')
await fs.mkdir(out, { recursive: true })

const plan = {
  titulo: 'Plan integral de acompañamiento y bienestar escolar',
  resumen:
    'Este plan prioriza la escucha activa, el acompañamiento oportuno y el fortalecimiento de redes de apoyo para responder a los principales factores identificados en la encuesta.',
  objetivos: [
    'Fortalecer las habilidades socioemocionales y las estrategias de afrontamiento de los estudiantes.',
    'Activar rutas de acompañamiento oportunas para los casos que requieren atención prioritaria.',
    'Vincular a docentes y familias en acciones preventivas de bienestar escolar.',
  ],
  actividades: [
    {
      nombre: 'Taller de herramientas para manejar el estrés',
      descripcion: 'Sesiones prácticas por curso con ejercicios de respiración, organización académica y búsqueda de apoyo.',
      responsable: 'Orientación escolar',
      plazo: 'Semanas 1 y 2',
      dirigido_a: 'Estudiantes',
    },
    {
      nombre: 'Círculos de escucha y acompañamiento',
      descripcion: 'Espacios confidenciales para identificar necesidades, acordar apoyos y hacer seguimiento.',
      responsable: 'Orientador y directores de grupo',
      plazo: 'Semanal',
      dirigido_a: 'Cursos priorizados',
    },
    {
      nombre: 'Escuela de familias',
      descripcion: 'Encuentro para reconocer señales de alerta, conversar sin estigma y conocer las rutas institucionales.',
      responsable: 'Coordinación y orientación',
      plazo: 'Primer mes',
      dirigido_a: 'Madres, padres y cuidadores',
    },
    {
      nombre: 'Seguimiento a compromisos',
      descripcion: 'Revisión quincenal de indicadores, casos acompañados y ajustes necesarios al plan.',
      responsable: 'Comité de bienestar',
      plazo: 'Quincenal',
      dirigido_a: 'Equipo institucional',
    },
  ],
  indicadores: [
    'Participación de estudiantes en talleres y espacios de escucha.',
    'Número de casos priorizados con ruta de acompañamiento activa.',
    'Cambio en la percepción de bienestar en la siguiente medición.',
  ],
  recursos: [
    'Tiempo del equipo de orientación y directores de grupo.',
    'Material pedagógico para talleres y escuela de familias.',
    'Directorio actualizado de rutas externas y líneas de ayuda.',
  ],
  nota_seguridad:
    'Validar este plan con el equipo de orientación o psicología. Ante riesgo inmediato, activar el protocolo institucional y las rutas profesionales de atención sin exponer al estudiante.',
}

const context = {
  total: 84,
  alcance: 'toda la institución',
  risk: { alto: 9, moderado: 28, bajo: 47 },
  factores: [
    { factor: 'Estrés académico', pct: 61 },
    { factor: 'Problemas de sueño', pct: 44 },
    { factor: 'Soledad o aislamiento', pct: 31 },
    { factor: 'Pérdida de interés', pct: 26 },
  ],
  criticos: 4,
  quierenApoyo: 17,
  temas: ['tareas', 'familia', 'soledad'],
}

await fs.writeFile(path.join(out, 'plan-muestra.docx'), await buildActionPlanDocx(plan, context))
await fs.writeFile(path.join(out, 'plan-muestra.pptx'), await buildActionPlanPptx(plan, context))
console.log(out)
