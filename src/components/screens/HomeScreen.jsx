import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../store'
import { dayOfYear } from '../../utils'
import { db } from '../../db'

export default function HomeScreen() {
  const { openCalendar, openStats } = useAppStore()
  const [opened, setOpened] = useState(false)
  const [streak, setStreak] = useState(0)

  const today = new Date()
  const dayNum = dayOfYear(today)

  useEffect(() => {
    async function loadStreak() {
      try {
        const allHabits = await db.habits.toArray()
        const habits = allHabits.filter(h => h.isActive === true || h.isActive === 1 || h.isActive === '1')
        if (!habits.length) { setStreak(0); return }

        let s = 0
        for (let i = 1; i <= 365; i++) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const dateStr = d.toISOString().slice(0, 10)
          const entries = await db.dailyEntries.where('date').equals(dateStr).toArray()
          const done = entries.filter(e => e.status === 'done').length
          const score = Math.round((done / habits.length) * 100)
          if (score >= 80) s++
          else break
        }
        setStreak(s)
      } catch (err) {
        console.error('Error loading streak:', err)
        setStreak(0)
      }
    }
    loadStreak()
  }, [])

  function handleBookTap() {
    if (!opened) {
      setOpened(true)
      setTimeout(() => openCalendar('month'), 700)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative pb-24 overflow-hidden bg-[var(--surface-0)]">
      {/* Background ruled lines */}
      <motion.div
        animate={{ opacity: opened ? 0 : 0.4 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, var(--border) 39px, var(--border) 40px)',
        }}
      />

      {/* Header */}
      <motion.div
        animate={{ opacity: opened ? 0 : 1 }}
        transition={{ duration: 0.35 }}
        className="absolute top-10 left-0 right-0 text-center"
      >
        <div className="text-xs font-semibold text-[var(--text-muted)] tracking-[0.2em] uppercase">Frame</div>
        <div className="text-[11px] text-[var(--text-muted)] mt-1">
          {today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </motion.div>

      {/* Streak pill */}
      <motion.div
        animate={{ opacity: opened ? 0 : 1 }}
        transition={{ duration: 0.35 }}
        className="absolute top-9 right-4 flex items-center gap-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-full px-3 py-1.5"
      >
        <span className="text-sm">🔥</span>
        <span className="text-sm font-medium text-[var(--text-primary)]">{streak}</span>
        <span className="text-[10px] text-[var(--text-muted)]">streak</span>
      </motion.div>

      {/* 3D Book Wrapper */}
      <div className="relative" style={{ perspective: 1200, width: 200, height: 260 }}>
        {/* Stationary Page (revealed when cover opens) */}
        <motion.div
          animate={opened ? { scale: 3.8, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{
            duration: 0.85,
            delay: 0.05,
            ease: [0.4, 0, 0.2, 1]
          }}
          style={{
            position: 'absolute', inset: 0,
            background: 'var(--paper-bg)',
            borderRadius: '3px 10px 10px 3px',
            boxShadow: 'inset 4px 0 10px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.15)',
            borderLeft: '1px solid rgba(0,0,0,0.08)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            transformOrigin: 'center center',
          }}
        >
          {/* Subtle lined pattern on pages */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 15px, var(--paper-lines) 15px, var(--paper-lines) 16px)',
            opacity: 0.8,
            borderRadius: '3px 10px 10px 3px',
          }} />
          {/* Grid preview inside */}
          <div className="flex flex-col items-center gap-1.5 opacity-30 scale-75">
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="w-3.5 h-3.5 rounded" style={{ background: 'var(--paper-preview-ink)', opacity: i % 3 === 0 ? 0.8 : 0.2 }} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Flipping Front Cover */}
        <motion.div
          onClick={handleBookTap}
          animate={{
            rotateY: opened ? -175 : -15,
            rotateX: opened ? 0 : 3,
            opacity: opened ? 0 : 1
          }}
          transition={{
            rotateY: { duration: 0.9, ease: [0.34, 1.56, 0.64, 1] },
            rotateX: { duration: 0.9, ease: [0.34, 1.56, 0.64, 1] },
            opacity: { duration: 0.25, delay: 0.2, ease: 'linear' }
          }}
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: 'left center',
            width: '100%',
            height: '100%',
            cursor: 'pointer',
            position: 'relative',
            pointerEvents: opened ? 'none' : 'auto',
          }}
        >
          {/* Float animation wrapper (only when closed) */}
          <motion.div
            animate={opened ? { y: 0 } : { y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d' }}
          >
            {/* Cover Front */}
            <div style={{
              position: 'absolute', inset: 0,
              background: '#1a1a2e',
              borderRadius: '3px 10px 10px 3px',
              backfaceVisibility: 'hidden',
              borderLeft: '8px solid #111128',
              boxShadow: '-2px 4px 16px rgba(0,0,0,0.25), inset -2px 0 6px rgba(0,0,0,0.2)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {/* texture */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(255,255,255,0.015) 18px, rgba(255,255,255,0.015) 19px)',
              }} />
              <div style={{ fontSize: 28, fontWeight: 500, color: '#e8e4d9', letterSpacing: '0.12em', textTransform: 'uppercase', zIndex: 1 }}>Frame</div>
              <div style={{ width: 60, height: 1, background: 'rgba(232,228,217,0.35)', margin: '10px 0', zIndex: 1 }} />
              <div style={{ fontSize: 11, color: 'rgba(232,228,217,0.5)', letterSpacing: '0.15em', zIndex: 1 }}>{today.getFullYear()}</div>
              <div style={{ position: 'absolute', bottom: 18, right: 18, width: 20, height: 20, borderRight: '1.5px solid rgba(232,228,217,0.3)', borderBottom: '1.5px solid rgba(232,228,217,0.3)' }} />
            </div>

            {/* Cover Back */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'var(--paper-bg)',
              borderRadius: '3px 10px 10px 3px',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              boxShadow: 'inset 4px 0 10px rgba(0,0,0,0.15)',
            }} />
          </motion.div>
        </motion.div>

        {/* Day badge */}
        <AnimatePresence>
          {opened && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -top-3 -right-3 bg-[var(--ink)] text-[var(--parchment)] text-[10px] font-medium px-2 py-1 rounded-full"
              style={{ zIndex: 20 }}
            >
              DAY {dayNum}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tap hint */}
      <AnimatePresence>
        {!opened && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2 mt-10"
          >
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]"
            />
            <span className="text-[11px] text-[var(--text-muted)] tracking-[0.2em] uppercase font-semibold">TAP TO OPEN</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats button */}
      <motion.button
        onClick={openStats}
        animate={{ opacity: opened ? 0 : 1 }}
        transition={{ duration: 0.35 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
      >
        <div className="w-14 h-14 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center active:scale-95 transition-transform">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-secondary)]">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        </div>
        <span className="text-[11px] text-[var(--text-muted)] tracking-widest uppercase">Statistics</span>
      </motion.button>
    </div>
  )
}
