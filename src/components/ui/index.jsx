// ─── Shared UI primitives ────────────────────────────────────────────────────

export function TopBar({ onBack, title, onRight, rightIcon = 'dots' }) {
  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-0">
      <button
        onClick={onBack}
        className="w-9 h-9 rounded-full border flex items-center justify-center bg-[var(--surface-2)] border-[var(--border)] active:scale-95 transition-transform focus:outline-none"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-secondary)]">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <span className="text-sm font-medium text-[var(--text-primary)] tracking-wide">{title}</span>
      {onRight ? (
        <button
          onClick={onRight}
          className="w-9 h-9 rounded-full border flex items-center justify-center bg-[var(--surface-2)] border-[var(--border)] active:scale-95 transition-transform focus:outline-none"
        >
          {rightIcon === 'dots' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--text-secondary)]">
              <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-secondary)]">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          )}
        </button>
      ) : (
        <div className="w-9 h-9" />
      )}
    </div>
  )
}

export function ZoomTabs({ active, onChange, tabs }) {
  return (
    <div className="flex gap-1 mx-4 mt-3 bg-[var(--surface-1)] rounded-[10px] p-[3px]">
      {tabs.map(t => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`flex-1 py-[7px] text-xs font-medium rounded-lg border transition-colors focus:outline-none ${
            active === t.value
              ? 'bg-[var(--surface-2)] text-[var(--text-primary)] border-[var(--border)]'
              : 'text-[var(--text-muted)] border-transparent'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function Divider({ className = '' }) {
  return <div className={`h-px bg-[var(--border)] mx-4 ${className}`} />
}

export function SectionTitle({ children, className = '' }) {
  return (
    <div className={`text-[10px] font-medium text-[var(--text-muted)] tracking-widest uppercase px-4 pt-4 pb-2 ${className}`}>
      {children}
    </div>
  )
}

export function PrimaryButton({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-3 text-sm font-medium rounded-[10px] bg-[var(--ink)] text-[var(--parchment)] tracking-wide active:opacity-70 transition-opacity ${className}`}
    >
      {children}
    </button>
  )
}

export function ScoreRing({ score, size = 52 }) {
  const r = 22
  const circ = 2 * Math.PI * r
  const pct = score ?? 0
  const offset = circ - (circ * pct) / 100
  const color = pct >= 80 ? '#27500A' : pct >= 40 ? '#97C459' : pct > 0 ? '#F09595' : 'var(--border)'

  return (
    <svg width={size} height={size} viewBox="0 0 52 52">
      <circle cx="26" cy="26" r={r} fill="none" stroke="var(--surface-1)" strokeWidth="4" />
      <circle
        cx="26" cy="26" r={r} fill="none"
        stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
        style={{ transition: 'stroke-dashoffset .5s ease, stroke .3s' }}
      />
      <text x="26" y="30" textAnchor="middle" fontSize="11" fontWeight="500" fill="var(--text-primary)">
        {score !== null && score !== undefined ? `${Math.round(score)}%` : '—'}
      </text>
    </svg>
  )
}
