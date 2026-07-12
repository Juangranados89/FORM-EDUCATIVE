// Cliente de la API del servidor.
import type { SurveyResponse } from './survey'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...init,
  })
  const body = await r.json().catch(() => ({}))
  if (!r.ok) throw new ApiError(r.status, body?.error || 'Error de conexión')
  return body as T
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const api = {
  submitSurvey: (data: SurveyResponse) =>
    req<{ ok: true; id: string }>('/api/responses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (user: string, password: string) =>
    req<{ ok: true; user: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ user, password }),
    }),
  logout: () => req<{ ok: true }>('/api/auth/logout', { method: 'POST' }),
  me: () => req<{ user: string }>('/api/auth/me'),
  stats: () => req<Stats>('/api/stats'),
}

export type Stats = {
  empty: boolean
  total?: number
  kpis?: {
    totalRespuestas: number
    participacion: number | null
    bienestarGeneral: number
    bienestarDelta: number
    riesgoModeradoPct: number
    riesgoModeradoN: number
    riesgoModeradoDelta: number
    riesgoAltoPct: number
    riesgoAltoN: number
    riesgoAltoDelta: number
  }
  riesgo?: { name: string; value: number; pct: number; color: string }[]
  dimensiones?: { dim: string; valor: number }[]
  tendencia?: { mes: string; valor: number }[]
  cursos?: {
    curso: string
    n: number
    participacion: number
    bienestar: number
    moderado: number
    alto: number
  }[]
  factores?: { factor: string; emoji: string; pct: number }[]
  nube?: { palabra: string; peso: number; color: string }[]
  apoyo?: { si_pronto: number; tal_vez: number; no_ahora: number }
}
