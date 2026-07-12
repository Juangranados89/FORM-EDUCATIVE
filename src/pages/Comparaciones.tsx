import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Shell from '../components/dashboard/Shell'
import { api, ApiError, type ResponseRow } from '../lib/api'

const MAX_SCORE = 32
const wellbeing = (score: number) => Math.round(100 - (score / MAX_SCORE) * 100)

type Group = { nombre: string; n: number; bienestar: number; alto: number; moderado: number }

function groupBy(rows: ResponseRow[], key: (r: ResponseRow) => string): Group[] {
  const map = new Map<string, ResponseRow[]>()
  for (const r of rows) {
    const k = key(r)
    if (!k) continue
    ;(map.get(k) ?? map.set(k, []).get(k)!).push(r)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([nombre, rs]) => ({
      nombre,
      n: rs.length,
      bienestar: Math.round(rs.reduce((s, r) => s + wellbeing(r.score), 0) / rs.length),
      alto: Math.round((rs.filter((r) => r.riskLevel === 'alto').length / rs.length) * 100),
      moderado: Math.round((rs.filter((r) => r.riskLevel === 'moderado').length / rs.length) * 100),
    }))
}

export default function Comparaciones() {
  const nav = useNavigate()
  const [rows, setRows] = useState<ResponseRow[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .responses()
      .then((r) => setRows(r.rows))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) nav('/login')
        else setError('No se pudieron cargar los datos.')
      })
  }, [nav])

  const groups = useMemo(() => {
    if (!rows || rows.length === 0) return null
    return {
      cursos: groupBy(rows, (r) => `${r.grade}${r.course}`),
      grados: groupBy(rows, (r) => r.grade),
      jornada: groupBy(rows, (r) => (r.shift === 'mañana' ? 'Mañana' : 'Tarde')),
      edad: groupBy(rows, (r) => r.ageRange),
    }
  }, [rows])

  return (
    <Shell
      title="Comparaciones"
      subtitle="Bienestar y riesgo comparados entre cursos, grados, jornada y edad."
    >
      {error && (
        <p className="mt-6 rounded-2xl bg-coral/10 p-4 text-center text-sm font-semibold text-coral">
          {error}
        </p>
      )}
      {!rows && !error && (
        <p className="mt-16 text-center text-sm font-semibold text-muted">Cargando…</p>
      )}
      {rows && rows.length === 0 && (
        <p className="mt-16 text-center text-sm text-muted">Aún no hay respuestas.</p>
      )}

      {groups && (
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <BienestarChart title="Bienestar por curso" data={groups.cursos} />
          <RiesgoChart title="Riesgo alto por curso" data={groups.cursos} />
          <BienestarChart title="Bienestar por grado" data={groups.grados} />
          <CompareTable title="Por jornada" data={groups.jornada} />
          <CompareTable title="Por rango de edad" data={groups.edad} />
        </div>
      )}
    </Shell>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-card">
      <h2 className="mb-3 font-display text-[15px] font-bold">{title}</h2>
      {children}
    </div>
  )
}

function bienestarColor(v: number) {
  return v >= 70 ? '#45B36B' : v >= 50 ? '#FFD166' : '#FF6B7A'
}

function BienestarChart({ title, data }: { title: string; data: Group[] }) {
  return (
    <Card title={title}>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Bar dataKey="bienestar" radius={[6, 6, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.nombre} fill={bienestarColor(d.bienestar)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

function RiesgoChart({ title, data }: { title: string; data: Group[] }) {
  return (
    <Card title={title}>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [`${v}%`, n === 'alto' ? 'Riesgo alto' : 'Riesgo moderado'] as [string, string]} />
            <Legend formatter={(v) => (v === 'alto' ? 'Alto' : 'Moderado')} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="moderado" stackId="r" fill="#FFD166" radius={[0, 0, 0, 0]} />
            <Bar dataKey="alto" stackId="r" fill="#FF6B7A" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

function CompareTable({ title, data }: { title: string; data: Group[] }) {
  return (
    <Card title={title}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs text-muted">
            <th className="py-2 font-semibold">Grupo</th>
            <th className="py-2 font-semibold">Respuestas</th>
            <th className="py-2 font-semibold">Bienestar</th>
            <th className="py-2 font-semibold">Riesgo alto</th>
          </tr>
        </thead>
        <tbody>
          {data.map((g) => (
            <tr key={g.nombre} className="border-b border-line/60 last:border-0">
              <td className="py-2.5 font-bold">{g.nombre}</td>
              <td className="py-2.5">{g.n}</td>
              <td className="py-2.5">
                <span className="font-bold" style={{ color: bienestarColor(g.bienestar) }}>
                  {g.bienestar}%
                </span>
              </td>
              <td className="py-2.5">
                <span className="font-bold text-coral">{g.alto}%</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
