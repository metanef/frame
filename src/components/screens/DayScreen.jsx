import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../../store'
import { TopBar, ScoreRing, Divider, SectionTitle, PrimaryButton } from '../ui'
import { MONTHS, DAYS_LONG, dayOfYear } from '../../utils'
import { getDayEntries, saveEntry, saveSummary } from '../../db'

const MOODS = [
  { key: 'sad', emoji: '😢', label: 'Sad' },
  { key: 'meh', emoji: '😐', label: 'Neutral' },
  { key: 'ok', emoji: '😊', label: 'Good' },
  { key: 'great', emoji: '😄', label: 'Great' },
  { key: 'fire', emoji: '🔥', label: 'On fire' },
]

function HabitCard({ habit, entry, onChange }) {
  const status = entry?.status ?? null
  const value = entry?.value ?? 0
  const isNeg = habit.isNegative
  const type = habit.type

  const done = status === 'done'
  const fail = status === 'fail'

  function toggle() {
    if (isNeg) {
      if (status === null) onChange(habit.id, 'fail', value)
      else if (status === 'fail') onChange(habit.id, 'done', value)
      else onChange(habit.id, null, value)
    } else {
      if (status === null) onChange(habit.id, 'done', value)
      else if (status === 'done') onChange(habit.id, 'fail', value)
      else onChange(habit.id, null, value)
    }
  }

  function changeVal(delta) {
    const next = Math.max(0, value + delta)
    let newStatus = status
    if (isNeg) {
      if (type === 'counter') newStatus = next > 0 ? 'fail' : null
      if (type === 'duration') newStatus = next >= 3 ? 'fail' : next > 0 ? 'done' : null
    } else {
      if (type === 'counter') newStatus = next >= 6 ? 'done' : next > 0 ? 'fail' : null
      if (type === 'steps') newStatus = next >= 10000 ? 'done' : next > 0 ? 'fail' : null
      if (type === 'pages') newStatus = next >= 5 ? 'done' : next > 0 ? 'fail' : null
      if (type === 'duration') newStatus = next >= 2 ? 'done' : next > 0 ? 'fail' : null
    }
    onChange(habit.id, newStatus, next)
  }

  // Card style
  let cardBg = 'var(--surface-2)'
  let cardBorder = 'var(--border)'
  let leftBorder = isNeg ? '#E24B4A' : '#3B6D11'

  if (done) {
    cardBg = 'var(--card-done-bg)'
    cardBorder = 'var(--card-done-border)'
    leftBorder = '#3B6D11'
  }
  if (fail) {
    cardBg = 'var(--card-fail-bg)'
    cardBorder = 'var(--card-fail-border)'
    leftBorder = '#E24B4A'
  }

  // Toggle button
  let togBg = 'transparent', togBorder = 'var(--border-strong)', togIcon = '–', togColor = 'var(--text-muted)'
  if (done) { togBg = '#3B6D11'; togBorder = '#3B6D11'; togIcon = '✓'; togColor = '#ffffff' }
  if (fail) { togBg = '#E24B4A'; togBorder = '#E24B4A'; togIcon = '✗'; togColor = '#ffffff' }

  // Subtitle helper
  function valLabel() {
    if (status === 'done') {
      return isNeg ? 'Avoided' : 'Done'
    }
    if (status === 'fail') {
      if (isNeg) {
        if (type === 'counter') return `${value} times today`
        return 'Not avoided'
      }
      return 'Not done'
    }

    // Status is null
    if (type === 'boolean') {
      return isNeg ? 'Avoided or not?' : 'Done or not?'
    }
    if (type === 'counter' && !isNeg) return `${(value * 0.5).toFixed(1)} / 3 L`
    if (type === 'steps') return `${value.toLocaleString('en-US')} / 10,000 steps`
    if (type === 'pages') return `${value} / 5 pages`
    if (type === 'duration' && isNeg) return `${value}h spent`
    if (type === 'duration' && !isNeg) return `${value}h work`
    if (type === 'counter' && isNeg) return `${value} times today`
    return null
  }

  const hasCounter = type !== 'boolean'

  return (
    <motion.div
      layout
      onClick={hasCounter ? undefined : toggle}
      className="border transition-colors duration-200"
      style={{
        background: cardBg,
        borderRadius: 14,
        padding: '12px 14px',
        marginBottom: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: hasCounter ? 'default' : 'pointer',
        borderColor: cardBorder,
        borderLeft: `4px solid ${leftBorder}`,
      }}
    >
      {/* Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggle()
        }}
        style={{
          width: 28, height: 28, borderRadius: '50%',
          background: togBg, border: `1.5px solid ${togBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: 13, color: togColor, cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        className="hover:scale-105 active:scale-95"
      >
        {togIcon}
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-[var(--text-primary)] tracking-wide">{habit.name}</div>
        {valLabel() && (
          <div className={`text-[11px] mt-1 font-medium ${fail ? 'text-red-400' : done ? 'text-emerald-400' : 'text-[var(--text-muted)]'
            }`}>
            {valLabel()}
          </div>
        )}
      </div>

      {/* Counter */}
      {hasCounter && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => changeVal(type === 'steps' ? -1000 : -1)}
            className="w-7 h-7 rounded-full border border-[var(--border-strong)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] active:scale-90 flex items-center justify-center text-sm text-[var(--text-secondary)] font-medium transition-all"
          >
            −
          </button>
          <div className="text-center min-w-[28px] flex flex-col justify-center">
            <span className="text-[13px] font-bold text-[var(--text-primary)] leading-none">
              {type === 'steps' ? Math.round(value / 1000) : value}
            </span>
            <span className="text-[9px] text-[var(--text-muted)] mt-0.5 leading-none font-medium">
              {type === 'steps' ? '×1k' : type === 'counter' && !isNeg ? '×0.5L' : type === 'duration' ? (habit.name.includes('pages') ? 'pages' : 'hours') : type === 'pages' ? 'pages' : 'times'}
            </span>
          </div>
          <button
            onClick={() => changeVal(type === 'steps' ? 1000 : 1)}
            className="w-7 h-7 rounded-full border border-[var(--border-strong)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] active:scale-90 flex items-center justify-center text-sm text-[var(--text-secondary)] font-medium transition-all"
          >
            +
          </button>
        </div>
      )}
    </motion.div>
  )
}

export default function DayScreen() {
  const { selectedDate, openCalendar, calView } = useAppStore()
  const date = useMemo(() => selectedDate ?? new Date(), [selectedDate])

  const [habits, setHabits] = useState([])
  const [entryMap, setEntryMap] = useState({})
  const [summary, setSummary] = useState({ rating: 0, mood: null, regret: '', achievement: '' })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getDayEntries(date).then(({ habits, entryMap, summary }) => {
      setHabits(habits)
      setEntryMap(entryMap)
      if (summary) setSummary({
        rating: summary.rating ?? 0,
        mood: summary.mood ?? null,
        regret: summary.regret ?? '',
        achievement: summary.achievement ?? '',
      })
    })
  }, [date])

  async function handleChange(habitId, status, value) {
    setEntryMap(prev => ({ ...prev, [habitId]: { ...prev[habitId], habitId, status, value } }))
    await saveEntry(date, habitId, status, value)
  }

  async function handleSave() {
    await saveSummary(date, summary)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      openCalendar(calView || 'month')
    }, 800)
  }

  const negHabits = habits.filter(h => h.isNegative)
  const posHabits = habits.filter(h => !h.isNegative)
  const doneCount = habits.filter(h => entryMap[h.id]?.status === 'done').length
  const score = habits.length ? Math.round((doneCount / habits.length) * 100) : 0

  const dayNum = dayOfYear(date)
  const dow = (date.getDay() + 6) % 7
  const dateStr = `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`

  return (
    <div className="flex flex-col pb-8 bg-[var(--surface-0)] min-h-screen">
      <TopBar onBack={() => openCalendar(calView || 'month')} title={dateStr} />

      {/* Day header */}
      <div className="flex items-start justify-between px-4 pt-2">
        <div>
          <div className="text-3xl font-bold text-[var(--text-primary)] leading-none">Day {dayNum}</div>
          <div className="text-xs text-[var(--text-muted)] mt-1.5 font-medium">{DAYS_LONG[dow]} — Week {Math.ceil(dayNum / 7)}</div>
        </div>
        <ScoreRing score={score} size={54} />
      </div>

      {/* Progress bar */}
      <div className="px-4 mt-4">
        <div className="flex justify-between mb-1.5">
          <span className="text-[11px] text-[var(--text-secondary)] font-medium">{doneCount} / {habits.length} habits</span>
          <span className="text-[11px] text-[var(--text-secondary)] font-medium">{score}%</span>
        </div>
        <div className="h-1 bg-[var(--surface-2)] rounded-full overflow-hidden border border-[var(--border)]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${score}%`, background: score >= 80 ? '#3B6D11' : score >= 40 ? '#97C459' : '#E24B4A' }}
          />
        </div>
      </div>

      {/* Interdits */}
      {negHabits.length > 0 && (
        <div className="mt-2">
          <SectionTitle>
            <span style={{ color: '#E24B4A', marginRight: 6 }}>●</span>BAD HABITS
          </SectionTitle>
          <div className="px-4">
            {negHabits.map(h => (
              <HabitCard key={h.id} habit={h} entry={entryMap[h.id]} onChange={handleChange} />
            ))}
          </div>
        </div>
      )}

      {/* Objectifs */}
      {posHabits.length > 0 && (
        <div className="mt-2">
          <SectionTitle>
            <span style={{ color: '#3B6D11', marginRight: 6 }}>●</span>OBJECTIVES
          </SectionTitle>
          <div className="px-4">
            {posHabits.map(h => (
              <HabitCard key={h.id} habit={h} entry={entryMap[h.id]} onChange={handleChange} />
            ))}
          </div>
        </div>
      )}

      <Divider className="mt-5" />

      {/* Bilan */}
      <div className="mt-2">
        <SectionTitle>DAILY SUMMARY</SectionTitle>
        <div className="px-4 flex flex-col gap-3">
          <textarea
            value={summary.regret}
            onChange={e => setSummary(s => ({ ...s, regret: e.target.value }))}
            placeholder="Regret — what didn't work out?"
            rows={3}
            className="w-full border border-[var(--border)] rounded-xl bg-[var(--surface-2)] px-3 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:border-[var(--border-strong)] transition-all"
          />
          <textarea
            value={summary.achievement}
            onChange={e => setSummary(s => ({ ...s, achievement: e.target.value }))}
            placeholder="Achievement — what are you proud of?"
            rows={3}
            className="w-full border border-[var(--border)] rounded-xl bg-[var(--surface-2)] px-3 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:border-[var(--border-strong)] transition-all"
          />

          {/* Rating */}
          <div className="mt-1">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-[var(--text-secondary)] font-medium">Day Rating</span>
              <span className="text-xs font-bold text-[var(--text-primary)]">{summary.rating || '—'} / 10</span>
            </div>
            <div className="flex gap-1">
              {Array(10).fill(null).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSummary(s => ({ ...s, rating: i + 1 }))}
                  style={{
                    flex: 1, padding: '6px 0', borderRadius: 6,
                    background: i < summary.rating ? '#1e3a8a' : 'var(--surface-2)',
                    border: '0.5px solid var(--border)',
                    cursor: 'pointer',
                    fontSize: 10,
                    color: i < summary.rating ? '#ffffff' : 'var(--text-muted)',
                    fontWeight: 'bold',
                    transition: 'all 0.15s',
                  }}
                  className="hover:scale-105 active:scale-95"
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div className="mt-1">
            <div className="text-xs text-[var(--text-secondary)] mb-2 font-medium">Mood</div>
            <div className="flex gap-2">
              {MOODS.map(m => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setSummary(s => ({ ...s, mood: m.key }))}
                  className={`flex-1 py-3.5 rounded-xl border text-center transition-all duration-200 active:scale-95 ${summary.mood === m.key
                    ? 'bg-[var(--surface-2)] border-[#d97706] shadow-sm shadow-[#d97706]/10'
                    : 'bg-[var(--surface-2)] border-[var(--border)]'
                    }`}
                >
                  <div className="text-2xl">{m.emoji}</div>
                  <div className={`text-[9px] mt-1 font-bold uppercase tracking-wider ${summary.mood === m.key ? 'text-[#d97706]' : 'text-[var(--text-muted)]'
                    }`}>{m.label}</div>
                </button>
              ))}
            </div>
          </div>

          <PrimaryButton onClick={handleSave} className="mt-3 py-3.5 font-bold border border-[var(--border-strong)] rounded-xl active:scale-[0.98] transition-all">
            {saved ? '✓ Saved' : 'Save Day'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
