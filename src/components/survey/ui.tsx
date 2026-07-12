import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ShieldCheck, Star } from 'lucide-react'
import { ASSET, type Option } from '../../lib/survey'

const toneBg: Record<Option['tone'], string> = {
  green: 'bg-green',
  blue: 'bg-primary-2',
  yellow: 'bg-yellow',
  orange: 'bg-orange',
  coral: 'bg-coral',
}

// Ilustración PNG; si el archivo aún no fue suministrado, se oculta sin romper el layout.
export function Illustration({
  src,
  alt,
  className = '',
}: {
  src: string
  alt: string
  className?: string
}) {
  const [ok, setOk] = useState(true)
  if (!ok) return null
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setOk(false)}
      className={`object-contain ${className}`}
    />
  )
}

export function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100)
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 rounded-full bg-line">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="whitespace-nowrap text-xs font-bold text-muted">
        Paso {step} de {total}
      </span>
    </div>
  )
}

export function OptionRow({
  option,
  selected,
  onSelect,
}: {
  option: Option
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-2.5 text-left transition-all duration-200
        ${
          selected
            ? 'border-green bg-green/5 shadow-card'
            : 'border-line bg-surface hover:border-primary/40'
        }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full transition-transform duration-200
          ${option.icon ? '' : `text-white ${toneBg[option.tone]}`}
          ${selected ? 'animate-pop' : ''}`}
      >
        {option.icon ? (
          <Illustration src={ASSET(option.icon)} alt="" className="h-10 w-10" />
        ) : (
          <Star size={16} fill="currentColor" />
        )}
      </span>
      <span className="flex-1 text-[15px] font-semibold text-ink">{option.label}</span>
      {selected && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green text-white">
          <Check size={16} strokeWidth={3} />
        </span>
      )}
    </button>
  )
}

export function EmotionOption({
  option,
  emoji,
  selected,
  onSelect,
}: {
  option: Option
  emoji: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-center gap-4 rounded-2xl border-2 px-4 py-3 text-left transition
        ${
          selected
            ? 'border-green bg-green/10 shadow-card'
            : 'border-line bg-surface hover:border-primary/40'
        }`}
    >
      <Illustration src={emoji} alt={option.label} className="h-11 w-11" />
      <span className="flex-1 text-[17px] font-semibold text-ink">{option.label}</span>
      {selected && (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green text-white">
          <Check size={16} />
        </span>
      )}
    </button>
  )
}

export function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled,
  full,
}: {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  full?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-[15px] font-semibold text-white shadow-soft transition
        hover:brightness-105 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-50
        ${full ? 'w-full' : ''}`}
    >
      {children}
      <ArrowRight size={18} />
    </button>
  )
}

export function GhostButton({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-line bg-surface px-5 py-3 text-[15px] font-bold text-muted transition hover:border-primary/40"
    >
      <ArrowLeft size={18} />
      {children}
    </button>
  )
}

export function ConfidentialNote() {
  return (
    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-muted">
      <ShieldCheck size={14} className="text-primary" />
      Tu información está protegida
    </div>
  )
}
