import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Lock, LogIn, ShieldCheck, UserRound } from 'lucide-react'
import { api } from '../lib/api'

export default function Login() {
  const nav = useNavigate()
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.login(user, password)
      nav('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm rounded-3xl bg-surface p-8 shadow-soft">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Heart size={26} className="text-primary" fill="currentColor" />
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold text-ink">
            Bienestar Escolar
          </h1>
          <p className="text-sm text-muted">Panel del orientador(a)</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-ink">
              <UserRound size={15} className="text-primary" /> Usuario
            </span>
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              autoComplete="username"
              className="input"
              placeholder="usuario"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-ink">
              <Lock size={15} className="text-primary" /> Contraseña
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="input"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <p className="rounded-xl bg-coral/10 px-3 py-2 text-center text-xs font-semibold text-coral">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !user || !password}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 font-display text-[15px] font-bold text-white shadow-soft transition hover:brightness-105 disabled:opacity-50"
          >
            <LogIn size={17} /> {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] font-semibold text-muted">
          <ShieldCheck size={13} className="text-primary" />
          Acceso restringido al equipo de orientación.
        </p>
      </div>
    </div>
  )
}
