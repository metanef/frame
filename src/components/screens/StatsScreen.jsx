import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '../../store'
import { TopBar, Divider, SectionTitle } from '../ui'
import { BADGES, getLevel, addDays } from '../../utils'
import { db, fmt } from '../../db'

const PERIOD_TABS = ['Week','Month','Year','All']

export default function StatsScreen() {
  const { goBack } = useAppStore()
  const [period, setPeriod] = useState('Année')
  const [stats,  setStats]  = useState(null)
  const [selectedBadge, setSelectedBadge] = useState(null)

  const [error, setError] = useState(null)

  const loadStats = useCallback(async () => {
    try {
      setError(null)
      const today = new Date(); today.setHours(0,0,0,0)
      const days = period === 'Week' ? 7 : period === 'Month' ? 30 : period === 'Year' ? 365 : 730

      const allHabits = await db.habits.toArray()
      const habits = allHabits.filter(h => h.isActive === true || h.isActive === 1 || h.isActive === '1')
      if (!habits.length) { setStats({ empty: true }); return }

      const startDate = addDays(today, -(days - 1))
      const allEntries = await db.dailyEntries.where('date').aboveOrEqual(fmt(startDate)).toArray()

      // Group by date
      const byDate = {}
      allEntries.forEach(e => {
        if (!byDate[e.date]) byDate[e.date] = []
        byDate[e.date].push(e)
      })

      let successDays = 0, totalDays = 0, streak = 0, bestStreak = 0, curStreak = 0

      for (let i = days - 1; i >= 0; i--) {
        const d = addDays(today, -i)
        if (d > today) continue
        const key = fmt(d)
        const entries = byDate[key] || []
        if (!entries.length) { curStreak = 0; continue }
        const done = entries.filter(e => e.status === 'done').length
        const score = Math.round((done / habits.length) * 100)
        totalDays++
        if (score >= 80) { successDays++; curStreak++; bestStreak = Math.max(bestStreak, curStreak) }
        else curStreak = 0
      }
      streak = curStreak

      // Per habit rate
      const habitRates = habits.map(h => {
        const relevant = allEntries.filter(e => e.habitId === h.id)
        const done = relevant.filter(e => e.status === 'done').length
        return { name: h.name, rate: relevant.length ? Math.round((done / relevant.length) * 100) : 0, isNeg: h.isNegative }
      }).sort((a, b) => b.rate - a.rate)

      // Weekly trend (last 7 days always)
      const weekTrend = []
      const dayNames = ['M','T','W','T','F','S','S']
      for (let i = 6; i >= 0; i--) {
        const d = addDays(today, -i)
        const key = fmt(d)
        const entries = byDate[key] || []
        const done = entries.filter(e => e.status === 'done').length
        const score = entries.length ? Math.round((done / habits.length) * 100) : 0
        const dow = (d.getDay() + 6) % 7
        weekTrend.push({ day: dayNames[dow], score, hasData: entries.length > 0 })
      }

      // Gamification stats for badges
      const s = { totalDays, successDays, bestStreak, level: getLevel(successDays, bestStreak).level,
        journalDays: 0, waterDays: 0, noOtDays: 0, noFFDays: 0, readDays: 0, perfectWeek: false, last30Rate: 0 }
      // Simplified badge checks from entries
      const journalHabit = habits.find(h => h.name.toLowerCase().includes('journal'))
      const waterHabit   = habits.find(h => h.name.toLowerCase().includes('water') || h.name.toLowerCase().includes('eau'))
      const otHabit      = habits.find(h => h.name.toLowerCase().includes('over'))
      const ffHabit      = habits.find(h => h.name.toLowerCase().includes('fast'))
      const readHabit    = habits.find(h => h.name.toLowerCase().includes('read') || h.name.toLowerCase().includes('ect'))
      if (journalHabit) s.journalDays = allEntries.filter(e => e.habitId === journalHabit.id && e.status === 'done').length
      if (waterHabit)   s.waterDays   = allEntries.filter(e => e.habitId === waterHabit.id   && e.status === 'done').length
      if (otHabit)      s.noOtDays    = allEntries.filter(e => e.habitId === otHabit.id       && e.status === 'done').length
      if (ffHabit)      s.noFFDays    = allEntries.filter(e => e.habitId === ffHabit.id       && e.status === 'done').length
      if (readHabit)    s.readDays    = allEntries.filter(e => e.habitId === readHabit.id     && e.status === 'done').length
      s.last30Rate = totalDays ? Math.round((successDays / totalDays) * 100) : 0

      const levelInfo = getLevel(successDays, bestStreak)

      setStats({ successDays, totalDays, streak, bestStreak, habitRates, weekTrend, levelInfo, badgeStats: s })
    } catch (err) {
      console.error('Error loading stats:', err)
      setError(err?.message || String(err))
    }
  }, [period])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[var(--surface-0)] min-h-screen text-center">
        <TopBar onBack={goBack} title="Error" />
        <div className="text-red-500 font-bold mb-2 mt-20">An error occurred while loading statistics</div>
        <pre className="text-xs text-[var(--text-muted)] bg-[var(--surface-2)] p-4 rounded-lg overflow-auto max-w-full text-left border border-[var(--border)]">
          {error}
        </pre>
      </div>
    )
  }

  if (!stats) return <div className="flex items-center justify-center h-64 text-[var(--text-muted)] text-sm">Loading...</div>

  const { successDays, totalDays, streak, bestStreak, habitRates, weekTrend, levelInfo, badgeStats } = stats

  return (
    <div className="flex flex-col pb-10">
      <TopBar onBack={goBack} title="Statistics" />

      {/* Period tabs */}
      <div className="flex gap-1 mx-4 mt-3 bg-[var(--surface-1)] rounded-[10px] p-[3px]">
        {PERIOD_TABS.map(t => (
          <button key={t} onClick={() => setPeriod(t)}
            className={`flex-1 py-[7px] text-xs font-medium rounded-lg transition-all ${period === t ? 'bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border)]' : 'text-[var(--text-muted)]'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Level card */}
      {levelInfo && (
        <div className="mx-4 mt-3 rounded-xl p-4 relative overflow-hidden" style={{ background: '#1a1a2e' }}>
          <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 18px,rgba(255,255,255,.03) 18px,rgba(255,255,255,.03) 19px)' }} />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-13 h-13 w-14 h-14 rounded-xl flex items-center justify-center text-3xl" style={{ background: 'rgba(255,255,255,.1)' }}>
              {levelInfo.emoji}
            </div>
            <div className="flex-1">
              <div className="text-base font-medium" style={{ color: '#e8e4d9' }}>{levelInfo.name}</div>
              <div className="text-[11px] mt-0.5" style={{ color: 'rgba(232,228,217,.5)' }}>Level {levelInfo.level} — {totalDays} active days</div>
              {levelInfo.next && (
                <>
                  <div className="text-[11px] mt-1.5" style={{ color: 'rgba(232,228,217,.6)' }}>
                    {levelInfo.xp} / {levelInfo.maxXp} XP for {levelInfo.next}
                  </div>
                  <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.1)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.round((levelInfo.xp / levelInfo.maxXp) * 100))}%`, background: '#97C459' }} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2 px-4 mt-3">
        {[
          { val: successDays, label: 'Successful days (≥80%)', icon: '📅', accent: '#EAF3DE', iconColor: '#3B6D11' },
          { val: totalDays ? `${Math.round((successDays/totalDays)*100)}%` : '—', label: 'Success rate', icon: '📈', accent: '#EAF3DE', iconColor: '#3B6D11' },
          { val: streak, label: 'Current streak 🔥', icon: '🔥', accent: '#FFF3E0', iconColor: '#E67E22' },
          { val: bestStreak, label: 'Best streak', icon: '🏆', accent: '#EEE8FF', iconColor: '#7C3AED' },
        ].map((k, i) => (
          <div key={i} className="bg-[var(--surface-1)] border border-[var(--border)] rounded-[10px] p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: k.accent }}>{k.icon}</div>
            </div>
            <div className="text-xl font-medium text-[var(--text-primary)]">{k.val}</div>
            <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Weekly trend */}
      <SectionTitle>Trend — last 7 days</SectionTitle>
      <div className="px-4">
        <div className="flex items-end gap-1.5 h-20">
          {weekTrend?.map((d, i) => {
            const color = d.score >= 80 ? '#3B6D11' : d.score >= 40 ? '#97C459' : d.hasData ? '#F09595' : 'var(--surface-2)'
            const h = d.hasData ? Math.max(6, Math.round(d.score * 0.6)) : 6
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[8px] text-[var(--text-muted)]">{d.score > 0 ? d.score+'%' : ''}</div>
                <div style={{ width: '100%', height: h, borderRadius: '3px 3px 0 0', background: color, minHeight: 4 }} />
                <div className="text-[9px] text-[var(--text-muted)]">{d.day}</div>
              </div>
            )
          })}
        </div>
      </div>

      <Divider className="mt-3" />

      {/* Habit bar chart */}
      <SectionTitle>Success rate by habit</SectionTitle>
      <div className="px-4 flex flex-col gap-1.5">
        {habitRates?.map((h, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="text-[11px] text-[var(--text-secondary)] w-28 flex-shrink-0 truncate">{h.name}</div>
            <div className="flex-1 h-[18px] bg-[var(--surface-1)] rounded overflow-hidden">
              <div
                style={{
                  width: `${h.rate}%`, height: '100%', borderRadius: 4,
                  background: h.rate >= 80 ? '#3B6D11' : h.rate >= 50 ? '#97C459' : '#F09595',
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6,
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 500, color: '#fff' }}>{h.rate}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Divider className="mt-4" />

      {/* Badges */}
      <SectionTitle>Badges</SectionTitle>
      <div className="grid grid-cols-4 gap-2 px-4">
        {BADGES.map(b => {
          const unlocked = badgeStats ? b.check(badgeStats) : false
          return (
            <button key={b.id} onClick={() => setSelectedBadge(selectedBadge?.id === b.id ? null : b)}
              className="flex flex-col items-center gap-1">
              <div style={{
                width: 54, height: 54, borderRadius: '50%',
                border: `1.5px ${unlocked ? 'solid' : 'dashed'} ${unlocked ? 'var(--border-strong)' : 'var(--border)'}`,
                background: 'var(--surface-1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
                opacity: unlocked ? 1 : 0.35,
                filter: unlocked ? 'none' : 'grayscale(1)',
                transition: 'transform .15s',
              }}>
                {b.emoji}
              </div>
              <div style={{ fontSize: 9, color: unlocked ? 'var(--text-secondary)' : 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>
                {b.name}
              </div>
            </button>
          )
        })}
      </div>

      {selectedBadge && (
        <div className="mx-4 mt-3 p-3 bg-[var(--surface-1)] border border-[var(--border)] rounded-lg flex items-center gap-3">
          <span className="text-2xl">{selectedBadge.emoji}</span>
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">{selectedBadge.name}</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">{selectedBadge.desc}</div>
            <div className="text-[10px] text-[var(--text-muted)] mt-1">
              {badgeStats && selectedBadge.check(badgeStats) ? '✓ Unlocked' : 'Locked'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
