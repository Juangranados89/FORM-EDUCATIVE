// Datos simulados del panel del orientador. Se reemplazan por el backend real.

export const KPIS = {
  totalRespuestas: 1248,
  participacion: 82,
  bienestarGeneral: 72,
  bienestarDelta: 8,
  riesgoModeradoPct: 18,
  riesgoModeradoN: 224,
  riesgoModeradoDelta: -3,
  riesgoAltoPct: 10,
  riesgoAltoN: 124,
  riesgoAltoDelta: 2,
}

export const DIMENSIONES = [
  { dim: 'Emociones positivas', valor: 74 },
  { dim: 'Autoestima', valor: 68 },
  { dim: 'Relaciones sociales', valor: 71 },
  { dim: 'Hábitos y sueño', valor: 63 },
  { dim: 'Estrés y ansiedad', valor: 58 },
  { dim: 'Sentido de pertenencia', valor: 77 },
]

export const RIESGO_DIST = [
  { name: 'Bajo', value: 900, pct: 72, color: '#45B36B' },
  { name: 'Moderado', value: 224, pct: 18, color: '#FFD166' },
  { name: 'Alto', value: 124, pct: 10, color: '#FF6B7A' },
]

export const TENDENCIA = [
  { mes: 'Feb 2026', valor: 66 },
  { mes: 'Mar 2026', valor: 61 },
  { mes: 'Abr 2026', valor: 64 },
  { mes: 'May 2026', valor: 69 },
  { mes: 'Jun 2026', valor: 65 },
  { mes: 'Jul 2026', valor: 72 },
]

export const CURSOS = [
  { curso: '6°A', participacion: 90, bienestar: 78, moderado: 15, alto: 7 },
  { curso: '6°B', participacion: 85, bienestar: 71, moderado: 18, alto: 11 },
  { curso: '7°A', participacion: 87, bienestar: 69, moderado: 19, alto: 12 },
  { curso: '7°B', participacion: 80, bienestar: 65, moderado: 22, alto: 13 },
  { curso: '8°A', participacion: 83, bienestar: 74, moderado: 16, alto: 10 },
]

export const FACTORES = [
  { factor: 'Estrés académico', pct: 42, emoji: '📚' },
  { factor: 'Problemas de sueño', pct: 38, emoji: '🌙' },
  { factor: 'Sentimientos de tristeza', pct: 33, emoji: '💧' },
  { factor: 'Baja autoestima', pct: 28, emoji: '🪞' },
  { factor: 'Falta de apoyo', pct: 25, emoji: '🤝' },
]

export const NUBE = [
  { palabra: 'estrés', peso: 5, color: '#FF6B7A' },
  { palabra: 'ansiedad', peso: 4, color: '#6754E8' },
  { palabra: 'exámenes', peso: 3, color: '#FF9F43' },
  { palabra: 'tareas', peso: 3, color: '#45B36B' },
  { palabra: 'familia', peso: 2, color: '#5B8DEF' },
  { palabra: 'amigos', peso: 2, color: '#45B36B' },
  { palabra: 'presión', peso: 2, color: '#6754E8' },
  { palabra: 'soledad', peso: 2, color: '#FFD166' },
  { palabra: 'tristeza', peso: 1, color: '#64748B' },
  { palabra: 'futuro', peso: 1, color: '#FF9F43' },
  { palabra: 'problemas en casa', peso: 1, color: '#FF6B7A' },
  { palabra: 'no tengo con quién hablar', peso: 1, color: '#64748B' },
]
