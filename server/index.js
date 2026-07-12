// Servidor: API de la encuesta + panel, y archivos estáticos del frontend.
import express from 'express'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import { timingSafeEqual } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PORT = process.env.PORT || 8080
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-cambiar'
const ADMIN_USER = process.env.ADMIN_USER || 'orientador'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'cambiar123'
const EXPECTED_STUDENTS = Number(process.env.EXPECTED_STUDENTS || 0)

app.use(express.json({ limit: '64kb' }))
app.use(cookieParser())
app.disable('x-powered-by')
app.use((_, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'same-origin')
  next()
})

/* ================= Scoring (fuente de verdad, espejo de src/lib/survey.ts) ================= */
const SCORES = {
  colegio: { muy_comodo: 0, comodo: 1, neutral: 2, incomodo: 3, muy_incomodo: 4 },
  estres: { nada: 0, poco: 1, moderado: 2, mucho: 3, demasiado: 4 },
  dificultades: { nunca: 0, pocas_veces: 1, casi_siempre: 3, siempre: 4 },
  interes: { nunca: 0, pocas_veces: 1, casi_siempre: 3, siempre: 4 },
  descanso: { nunca: 0, pocas_veces: 1, casi_siempre: 3, siempre: 4 },
  solo: { nunca: 0, pocas_veces: 1, casi_siempre: 3, siempre: 4 },
  ausencia: { nunca: 0, pocas_veces: 1, casi_siempre: 3, siempre: 4 },
  dolor: { nunca: 0, pocas_veces: 1, casi_siempre: 3, siempre: 4 },
}
const CRITICAL = ['descanso', 'ausencia', 'dolor']
const MAX_SCORE = 32
const CATEGORIES = ['ideacion', 'planificacion', 'crisis_vital', 'entorno_familiar', 'aislamiento', 'desesperanza']
const SUPPORTS = ['si_pronto', 'tal_vez', 'no_ahora']

function computeScore(answers) {
  let score = 0
  let critical = false
  for (const [qid, table] of Object.entries(SCORES)) {
    const v = table[answers[qid]]
    if (v === undefined) return null // respuesta faltante o inválida
    score += v
    if (CRITICAL.includes(qid) && v >= 3) critical = true
  }
  return { score, critical }
}
function riskOf(score, critical, categories) {
  if (critical || categories.includes('planificacion')) return 'alto'
  if (score >= 15) return 'alto'
  if (score >= 7) return 'moderado'
  return 'bajo'
}

/* ================= Auth (1 usuario, credenciales por variables de entorno) ================= */
function safeEqual(a, b) {
  const ba = Buffer.from(String(a))
  const bb = Buffer.from(String(b))
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}

const loginAttempts = new Map() // ip -> { n, t }
function rateLimited(ip) {
  const now = Date.now()
  const rec = loginAttempts.get(ip) || { n: 0, t: now }
  if (now - rec.t > 15 * 60_000) (rec.n = 0), (rec.t = now)
  rec.n++
  loginAttempts.set(ip, rec)
  return rec.n > 20
}

app.post('/api/auth/login', (req, res) => {
  if (rateLimited(req.ip)) return res.status(429).json({ error: 'Demasiados intentos. Espera 15 minutos.' })
  const { user, password } = req.body || {}
  if (!safeEqual(user, ADMIN_USER) || !safeEqual(password, ADMIN_PASSWORD)) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
  }
  const token = jwt.sign({ sub: ADMIN_USER, role: 'orientador' }, JWT_SECRET, { expiresIn: '12h' })
  res.cookie('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 12 * 3600_000,
  })
  res.json({ ok: true, user: ADMIN_USER })
})

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('session')
  res.json({ ok: true })
})

function requireAuth(req, res, next) {
  try {
    const payload = jwt.verify(req.cookies.session, JWT_SECRET)
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'No autorizado' })
  }
}

app.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: req.user.sub }))

/* ================= Encuesta (público) ================= */
app.post('/api/responses', async (req, res) => {
  try {
    const { profile, answers, categories = [], openText = '', support } = req.body || {}
    if (!profile?.grade || !profile?.course || !profile?.shift || !profile?.ageRange)
      return res.status(400).json({ error: 'Datos del estudiante incompletos' })
    if (!SUPPORTS.includes(support)) return res.status(400).json({ error: 'Respuesta de apoyo inválida' })
    const cats = categories.filter((c) => CATEGORIES.includes(c))
    const computed = computeScore(answers || {})
    if (!computed) return res.status(400).json({ error: 'Faltan respuestas' })
    const riskLevel = riskOf(computed.score, computed.critical, cats)
    const saved = await prisma.response.create({
      data: {
        grade: String(profile.grade).slice(0, 10),
        course: String(profile.course).slice(0, 10),
        shift: String(profile.shift).slice(0, 10),
        ageRange: String(profile.ageRange).slice(0, 10),
        answers,
        categories: cats,
        openText: String(openText).slice(0, 2000),
        support,
        score: computed.score,
        riskLevel,
        criticalFlag: computed.critical,
      },
    })
    res.json({ ok: true, id: saved.id })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error al guardar' })
  }
})

/* ================= Estadísticas (protegido) ================= */
const DIM_MAP = [
  { dim: 'Emociones positivas', qs: ['interes', 'dolor'] },
  { dim: 'Autoestima', qs: ['ausencia'] },
  { dim: 'Relaciones sociales', qs: ['solo'] },
  { dim: 'Hábitos y sueño', qs: ['descanso'] },
  { dim: 'Estrés y ansiedad', qs: ['estres', 'dificultades'] },
  { dim: 'Sentido de pertenencia', qs: ['colegio'] },
]
const STOPWORDS = new Set(
  'de la el en y a que los las un una es no me mi se lo por con para del al muy más mas como cuando pero sus tus esta este estoy soy ser hay tengo tiene si o ya'.split(' '),
)
const CLOUD_COLORS = ['#FF6B7A', '#6754E8', '#FF9F43', '#45B36B', '#5B8DEF', '#FFD166', '#64748B']

const wellbeing = (score) => Math.round(100 - (score / MAX_SCORE) * 100)

app.get('/api/stats', requireAuth, async (_req, res) => {
  try {
    const rows = await prisma.response.findMany({ orderBy: { createdAt: 'asc' } })
    const total = rows.length
    if (total === 0) return res.json({ empty: true, total: 0 })

    // KPIs
    const avgWellbeing = Math.round(rows.reduce((s, r) => s + wellbeing(r.score), 0) / total)
    const nAlto = rows.filter((r) => r.riskLevel === 'alto').length
    const nMod = rows.filter((r) => r.riskLevel === 'moderado').length
    const nBajo = total - nAlto - nMod

    // Delta mensual (mes actual vs anterior)
    const byMonth = new Map()
    for (const r of rows) {
      const k = r.createdAt.toISOString().slice(0, 7)
      const m = byMonth.get(k) || { sum: 0, n: 0, alto: 0, mod: 0 }
      m.sum += wellbeing(r.score)
      m.n++
      if (r.riskLevel === 'alto') m.alto++
      if (r.riskLevel === 'moderado') m.mod++
      byMonth.set(k, m)
    }
    const months = [...byMonth.keys()].sort()
    const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const tendencia = months.map((k) => {
      const m = byMonth.get(k)
      const [y, mm] = k.split('-')
      return { mes: `${MESES[Number(mm) - 1]} ${y}`, valor: Math.round(m.sum / m.n) }
    })
    const delta = (sel) => {
      if (months.length < 2) return 0
      const cur = byMonth.get(months.at(-1))
      const prev = byMonth.get(months.at(-2))
      return Math.round(sel(cur) - sel(prev))
    }

    // Dimensiones
    const dimensiones = DIM_MAP.map(({ dim, qs }) => {
      let sum = 0
      let n = 0
      for (const r of rows)
        for (const q of qs) {
          const v = SCORES[q][r.answers?.[q]]
          if (v !== undefined) (sum += 100 - (v / 4) * 100), n++
        }
      return { dim, valor: n ? Math.round(sum / n) : 0 }
    })

    // Cursos
    const byCourse = new Map()
    for (const r of rows) {
      const k = `${r.grade}${r.course}`
      const c = byCourse.get(k) || { n: 0, wb: 0, alto: 0, mod: 0 }
      c.n++
      c.wb += wellbeing(r.score)
      if (r.riskLevel === 'alto') c.alto++
      if (r.riskLevel === 'moderado') c.mod++
      byCourse.set(k, c)
    }
    const maxN = Math.max(...[...byCourse.values()].map((c) => c.n))
    const cursos = [...byCourse.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([curso, c]) => ({
        curso,
        n: c.n,
        participacion: Math.round((c.n / maxN) * 100),
        bienestar: Math.round(c.wb / c.n),
        moderado: Math.round((c.mod / c.n) * 100),
        alto: Math.round((c.alto / c.n) * 100),
      }))

    // Factores (frecuencia alta por pregunta + categorías marcadas)
    const pct = (n) => Math.round((n / total) * 100)
    const factores = [
      { factor: 'Estrés académico', emoji: '📚', pct: pct(rows.filter((r) => SCORES.estres[r.answers?.estres] >= 3).length) },
      { factor: 'Pérdida de interés', emoji: '🎮', pct: pct(rows.filter((r) => SCORES.interes[r.answers?.interes] >= 3).length) },
      { factor: 'Soledad / aislamiento', emoji: '💬', pct: pct(rows.filter((r) => SCORES.solo[r.answers?.solo] >= 3 || r.categories.includes('aislamiento')).length) },
      { factor: 'Entorno familiar', emoji: '🏠', pct: pct(rows.filter((r) => r.categories.includes('entorno_familiar')).length) },
      { factor: 'Desesperanza', emoji: '🌧️', pct: pct(rows.filter((r) => r.categories.includes('desesperanza')).length) },
    ].sort((a, b) => b.pct - a.pct)

    // Nube de palabras de respuestas abiertas
    const freq = new Map()
    for (const r of rows) {
      const words = r.openText.toLowerCase().replace(/[^a-záéíóúñü\s]/g, ' ').split(/\s+/)
      for (const w of words) if (w.length > 3 && !STOPWORDS.has(w)) freq.set(w, (freq.get(w) || 0) + 1)
    }
    const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)
    const maxF = top[0]?.[1] || 1
    const nube = top.map(([palabra, f], i) => ({
      palabra,
      peso: Math.min(5, Math.round((f / maxF) * 5)),
      color: CLOUD_COLORS[i % CLOUD_COLORS.length],
    }))

    // Apoyo solicitado
    const apoyo = {
      si_pronto: rows.filter((r) => r.support === 'si_pronto').length,
      tal_vez: rows.filter((r) => r.support === 'tal_vez').length,
      no_ahora: rows.filter((r) => r.support === 'no_ahora').length,
    }

    res.json({
      empty: false,
      kpis: {
        totalRespuestas: total,
        participacion: EXPECTED_STUDENTS > 0 ? Math.min(100, Math.round((total / EXPECTED_STUDENTS) * 100)) : null,
        bienestarGeneral: avgWellbeing,
        bienestarDelta: delta((m) => m.sum / m.n),
        riesgoModeradoPct: pct(nMod),
        riesgoModeradoN: nMod,
        riesgoModeradoDelta: delta((m) => (m.mod / m.n) * 100),
        riesgoAltoPct: pct(nAlto),
        riesgoAltoN: nAlto,
        riesgoAltoDelta: delta((m) => (m.alto / m.n) * 100),
      },
      riesgo: [
        { name: 'Bajo', value: nBajo, pct: pct(nBajo), color: '#45B36B' },
        { name: 'Moderado', value: nMod, pct: pct(nMod), color: '#FFD166' },
        { name: 'Alto', value: nAlto, pct: pct(nAlto), color: '#FF6B7A' },
      ],
      dimensiones,
      tendencia,
      cursos,
      factores,
      nube,
      apoyo,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error al calcular estadísticas' })
  }
})

/* ================= Exportar CSV (protegido, abre en Excel) ================= */
app.get('/api/export.csv', requireAuth, async (_req, res) => {
  try {
    const rows = await prisma.response.findMany({ orderBy: { createdAt: 'asc' } })
    const QIDS = Object.keys(SCORES)
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const header = [
      'fecha', 'grado', 'curso', 'jornada', 'edad',
      ...QIDS, 'categorias', 'comentario', 'apoyo', 'puntaje', 'nivel_riesgo', 'alerta_critica',
    ]
    const lines = rows.map((r) =>
      [
        r.createdAt.toISOString(), r.grade, r.course, r.shift, r.ageRange,
        ...QIDS.map((q) => r.answers?.[q] ?? ''),
        r.categories.join(' | '), r.openText, r.support, r.score, r.riskLevel,
        r.criticalFlag ? 'SI' : 'NO',
      ].map(esc).join(';'),
    )
    const csv = '﻿' + header.map(esc).join(';') + '\n' + lines.join('\n')
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="bienestar-escolar.csv"')
    res.send(csv)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error al exportar' })
  }
})

/* ================= Frontend estático ================= */
const dist = path.join(__dirname, '..', 'dist')
app.use(express.static(dist))
app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')))

app.listen(PORT, () => console.log(`Servidor listo en puerto ${PORT}`))
