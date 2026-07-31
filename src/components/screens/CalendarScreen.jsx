import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '../../store'
import { TopBar, ZoomTabs } from '../ui'
import { MONTHS, MONTHS_SHORT, DAYS, addDays, getMonday, scoreColor, fmt, dayOfYear } from '../../utils'
import { getScoresForRange, getDayEntries } from '../../db'

const CAL_TABS = [
  { value: 'year',  label: 'Year' },
  { value: 'month', label: 'Month'  },
  { value: 'week',  label: 'Week'},
]

const today = new Date()
today.setHours(0,0,0,0)

export default function CalendarScreen() {
  const { calView, setCalView, goHome, openDay, setScreen } = useAppStore()

  const [scores, setScores]   = useState({})
  const [refDate, setRefDate] = useState(new Date(today))
  const [selected, setSelected] = useState(null)
  const [selectedData, setSelectedData] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('In progress')

  // Compute visible range from view and refDate
  const range = useCallback(() => {
    if (calView === 'year') {
      const y = refDate.getFullYear()
      return { start: new Date(y, 0, 1), end: new Date(y, 11, 31) }
    }
    if (calView === 'month') {
      const y = refDate.getFullYear()
      const m = refDate.getMonth()
      return { start: new Date(y, m, 1), end: new Date(y, m + 1, 0) }
    }
    // week
    const mon = getMonday(refDate)
    return { start: mon, end: addDays(mon, 6) }
  }, [calView, refDate])

  useEffect(() => {
    const { start, end } = range()
    getScoresForRange(start, end).then(setScores)
  }, [range])

  // Load habits and summaries for selected day
  useEffect(() => {
    if (!selected) {
      setSelectedData(null)
      return
    }
    getDayEntries(selected).then(({ habits, entryMap, summary }) => {
      setSelectedData({ habits, entryMap, summary })
      const isToday = fmt(selected) === fmt(today)
      setSelectedStatus(isToday ? 'In progress' : 'Completed')
    })
  }, [selected])

  function cellColor(date) {
    const isToday = date.getTime() === today.getTime()
    const isFuture = date > today
    if (isToday) return '#1e293b' // Navy blue background for today
    if (isFuture) return 'var(--surface-1)'
    return scoreColor(scores[fmt(date)])
  }

  function cellText(date) {
    const isToday = date.getTime() === today.getTime()
    const isFuture = date > today
    if (isToday) return '#ffffff'
    if (isFuture) return 'var(--text-muted)'
    const s = scores[fmt(date)]
    if (s === null || s === undefined) return 'var(--text-muted)'
    if (s >= 80) return '#ffffff' // Dark green background
    if (s >= 60) return '#ffffff' // Medium-dark green background
    if (s >= 40) return '#1d350d' // Light green background (dark text for contrast)
    return '#501515' // Pink background (dark red text for contrast)
  }

  // ── Unified Selected Details Card ──────────────────────────────────────────
  function SelectedDetailsCard() {
    if (!selected) return null
    const isToday = fmt(selected) === fmt(today)
    const label = `${selected.getDate()} ${MONTHS[selected.getMonth()]} ${selected.getFullYear()}`
    const score = scores[fmt(selected)]
    const dayNum = dayOfYear(selected)

    return (
      <div className="mt-4 p-4 bg-[var(--surface-2)] rounded-xl border border-[var(--border)] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-[var(--text-muted)] tracking-wider uppercase font-semibold">
              Day {dayNum} — {isToday ? "Today" : "Summary"}
            </span>
            <span className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
              {label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-primary)] bg-[var(--surface-1)] px-2.5 py-1 rounded-lg">
              {score != null ? `${Math.round(score)}%` : '—'}
            </span>
            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
              selectedStatus === 'In progress' ? 'bg-blue-900/30 text-blue-300' : 'bg-emerald-900/30 text-emerald-300'
            }`}>
              {selectedStatus}
            </span>
          </div>
        </div>

        {/* Text descriptions */}
        {isToday && (
          <p className="text-xs text-[var(--text-muted)] mb-3 italic">
            Day in progress — check back tonight to complete!
          </p>
        )}

        {/* Habits Checklist Preview */}
        {selectedData && selectedData.habits.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {selectedData.habits.map(h => {
              const entry = selectedData.entryMap[h.id]
              const status = entry?.status
              let icon = '•'
              let colorClass = 'text-[var(--text-muted)] bg-[var(--surface-1)] border border-[var(--border)]'
              if (status === 'done') {
                icon = '✓'
                colorClass = 'text-emerald-400 bg-emerald-950/20 border border-emerald-900/40'
              } else if (status === 'fail') {
                icon = '✗'
                colorClass = 'text-red-400 bg-red-950/20 border border-red-900/40'
              }
              return (
                <div key={h.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${colorClass}`}>
                  <span className="font-bold">{icon}</span>
                  <span>{h.name}</span>
                </div>
              )
            })}
          </div>
        ) : selectedData ? (
          <div className="text-[11px] text-[var(--text-muted)] italic mb-4">No active habits for this day.</div>
        ) : (
          <div className="h-6 mb-4 animate-pulse bg-[var(--surface-1)] rounded" />
        )}

        <button
          onClick={() => openDay(selected)}
          className="w-full py-2.5 text-sm font-semibold rounded-xl bg-[var(--ink)] text-[var(--parchment)] hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Open day ↗
        </button>
      </div>
    )
  }

  // ── Year view ──────────────────────────────────────────────────────────────
  function YearView() {
    const year = refDate.getFullYear()
    const jan1 = new Date(year, 0, 1)
    const jan1dow = jan1.getDay() === 0 ? 7 : jan1.getDay()
    const totalCols = 53

    const cells = []
    for (let col = 0; col < totalCols; col++) {
      for (let row = 0; row < 7; row++) {
        const dayOffset = col * 7 + row - (jan1dow - 1)
        const date = new Date(year, 0, 1 + dayOffset)
        const inYear = date.getFullYear() === year
        cells.push({ col, row, date, inYear })
      }
    }

    // Month label positions
    const monthPositions = []
    for (let m = 0; m < 12; m++) {
      const d = new Date(year, m, 1)
      const doy = Math.round((d - jan1) / 86400000)
      const col = Math.floor((doy + jan1dow - 1) / 7)
      monthPositions.push({ m, col })
    }

    // KPIs calculations
    let successfulDays = 0
    let loggedDays = 0
    let bestStreak = 0
    let currentStreak = 0

    const yearEnd = new Date(year, 11, 31)
    const limitDate = yearEnd < today ? yearEnd : today
    const diffTime = limitDate - jan1
    const daysCount = diffTime >= 0 ? Math.round(diffTime / 86400000) + 1 : 0

    let tempStreak = 0
    for (let i = 0; i < daysCount; i++) {
      const d = new Date(jan1)
      d.setDate(d.getDate() + i)
      const key = fmt(d)
      const s = scores[key]

      if (s !== undefined && s !== null) {
        loggedDays++
        if (s >= 80) {
          successfulDays++
          tempStreak++
          if (tempStreak > bestStreak) {
            bestStreak = tempStreak
          }
        } else {
          tempStreak = 0
        }
      } else {
        tempStreak = 0
      }
    }
    currentStreak = tempStreak

    if (currentStreak === 0 && limitDate.getTime() === today.getTime() && daysCount > 1) {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      if (scores[fmt(yesterday)] >= 80) {
        let temp = 0
        for (let i = 0; i < daysCount - 1; i++) {
          const d = new Date(jan1)
          d.setDate(d.getDate() + i)
          if (scores[fmt(d)] >= 80) {
            temp++
          } else {
            temp = 0
          }
        }
        currentStreak = temp
      }
    }

    const successRate = loggedDays > 0 ? Math.round((successfulDays / loggedDays) * 100) : 0

    return (
      <div className="px-4 mt-3">
        {/* Nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setRefDate(prev => new Date(prev.getFullYear() - 1, prev.getMonth(), 1))} className="w-8 h-8 rounded-full border border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-secondary)]">‹</button>
          <span className="text-sm font-semibold text-[var(--text-primary)]">{year}</span>
          <button onClick={() => setRefDate(prev => new Date(prev.getFullYear() + 1, prev.getMonth(), 1))} className="w-8 h-8 rounded-full border border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-secondary)]">›</button>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2 text-center flex flex-col justify-center items-center h-[72px]">
            <span className="text-lg font-bold text-[var(--text-primary)]">{successfulDays}</span>
            <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5 leading-tight font-medium">Success Days</span>
          </div>
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2 text-center flex flex-col justify-center items-center h-[72px]">
            <span className="text-lg font-bold text-[var(--text-primary)]">{currentStreak}</span>
            <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5 leading-tight font-medium">Current Streak</span>
          </div>
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2 text-center flex flex-col justify-center items-center h-[72px]">
            <span className="text-lg font-bold text-[var(--text-primary)]">{bestStreak}</span>
            <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5 leading-tight font-medium">Best Streak</span>
          </div>
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2 text-center flex flex-col justify-center items-center h-[72px]">
            <span className="text-lg font-bold text-[var(--text-primary)]">{successRate}%</span>
            <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5 leading-tight font-medium">Success Rate</span>
          </div>
        </div>

        {/* Month labels */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${totalCols}, 1fr)`, gap: 2, marginBottom: 4 }}>
          {monthPositions.map(p => (
            <span key={p.m} style={{
              gridColumnStart: p.col + 1,
              gridColumnEnd: 'span 4',
              fontSize: 9,
              color: 'var(--text-muted)',
              textAlign: 'left',
              whiteSpace: 'nowrap'
            }}>
              {MONTHS_SHORT[p.m]}
            </span>
          ))}
        </div>
        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${totalCols}, 1fr)`, gap: 2 }}>
          {cells.map(({ date, inYear }, i) => (
            <div
              key={i}
              onClick={() => inYear && date <= today && setSelected(date)}
              style={{
                aspectRatio: '1',
                borderRadius: 2,
                background: inYear ? cellColor(date) : 'transparent',
                cursor: inYear && date <= today ? 'pointer' : 'default',
                outline: selected && inYear && fmt(date) === fmt(selected) ? '1.5px solid #3b82f6' : 'none',
                outlineOffset: 1,
                boxShadow: inYear && date.getTime() === today.getTime() ? '0 0 0 1px #3b82f6 inset' : undefined
              }}
            />
          ))}
        </div>
        {/* Legend */}
        <div className="flex gap-x-3 gap-y-1.5 mt-4 flex-wrap justify-start text-[10px]">
          {[
            ['var(--surface-1)', 'Empty'],
            ['#97C459', 'Partial'],
            ['#3B6D11', 'Good'],
            ['#27500A', 'Success ≥80%'],
            ['#F09595', 'Failed'],
            ['#1e293b', "Today"]
          ].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1">
              <div style={{
                width: 9,
                height: 9,
                borderRadius: 2,
                background: c,
                border: c === 'var(--surface-1)' ? '0.5px solid var(--border)' : undefined,
                boxShadow: c === '#1e293b' ? '0 0 0 1px #3b82f6 inset' : undefined
              }} />
              <span className="text-[var(--text-muted)]">{l}</span>
            </div>
          ))}
        </div>
        <SelectedDetailsCard />
      </div>
    )
  }

  // ── Month view ─────────────────────────────────────────────────────────────
  function MonthView() {
    const year = refDate.getFullYear(), month = refDate.getMonth()
    const first = new Date(year, month, 1)
    const dow = first.getDay() === 0 ? 6 : first.getDay() - 1
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const label = `${MONTHS[month]} ${year}`

    return (
      <div className="px-4 mt-3">
        {/* Nav */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setRefDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="w-8 h-8 rounded-full border border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-secondary)]">‹</button>
          <span className="text-sm font-semibold text-[var(--text-primary)]">{label}</span>
          <button onClick={() => setRefDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="w-8 h-8 rounded-full border border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-secondary)]">›</button>
        </div>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {DAYS.map(d => <div key={d} className="text-center text-[10px] font-medium text-[var(--text-muted)] py-1">{d}</div>)}
        </div>
        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {Array(dow).fill(null).map((_, i) => <div key={`e${i}`} />)}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1
            const date = new Date(year, month, day)
            const isFuture = date > today
            const isToday = date.getTime() === today.getTime()
            return (
              <div
                key={day}
                onClick={() => !isFuture && setSelected(date)}
                style={{
                  aspectRatio: '1', borderRadius: 8,
                  background: cellColor(date),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: isFuture ? 'default' : 'pointer',
                  outline: selected && fmt(date) === fmt(selected) ? '2px solid #3b82f6' : isToday ? '1.5px solid #3b82f6' : 'none',
                  outlineOffset: 1,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 500, color: cellText(date) }}>{day}</span>
              </div>
            )
          })}
        </div>
        {/* Legend */}
        <div className="flex gap-x-3 gap-y-1.5 mt-4 flex-wrap justify-start text-[10px]">
          {[
            ['var(--surface-1)', 'Empty'],
            ['#97C459', 'Partial'],
            ['#27500A', 'Success ≥80%'],
            ['#F09595', 'Failed'],
            ['#1e293b', "Today"]
          ].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1">
              <div style={{
                width: 9,
                height: 9,
                borderRadius: 2,
                background: c,
                border: c === 'var(--surface-1)' ? '0.5px solid var(--border)' : undefined,
                boxShadow: c === '#1e293b' ? '0 0 0 1px #3b82f6 inset' : undefined
              }} />
              <span className="text-[var(--text-muted)]">{l}</span>
            </div>
          ))}
        </div>
        <SelectedDetailsCard />
      </div>
    )
  }

  // ── Week view ──────────────────────────────────────────────────────────────
  function WeekView() {
    const monday = getMonday(refDate)
    const sunday = addDays(monday, 6)
    const mStr = `${monday.getDate()} ${MONTHS_SHORT[monday.getMonth()]}`
    const sStr = `${sunday.getDate()} ${MONTHS_SHORT[sunday.getMonth()]} ${sunday.getFullYear()}`

    return (
      <div className="px-4 mt-3">
        {/* Nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setRefDate(prev => addDays(prev, -7))} className="w-8 h-8 rounded-full border border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-secondary)]">‹</button>
          <span className="text-xs font-semibold text-[var(--text-primary)]">{mStr} – {sStr}</span>
          <button onClick={() => setRefDate(prev => addDays(prev, 7))} className="w-8 h-8 rounded-full border border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-secondary)]">›</button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((day, i) => {
            const date = addDays(monday, i)
            const isFuture = date > today
            const isToday = fmt(date) === fmt(today)
            const score = scores[fmt(date)]
            return (
              <div key={i} className="flex flex-col items-center gap-1.5" onClick={() => !isFuture && setSelected(date)}>
                <span className="text-[10px] font-medium text-[var(--text-muted)]">{day}</span>
                <div style={{
                  width: '100%', aspectRatio: '1', borderRadius: 8,
                  background: cellColor(date),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: isFuture ? 'default' : 'pointer',
                  outline: selected && fmt(date) === fmt(selected) ? '2px solid #3b82f6' : isToday ? '1.5px solid #3b82f6' : 'none',
                  outlineOffset: 1,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: cellText(date) }}>{date.getDate()}</span>
                </div>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 500 }}>
                  {isFuture ? '' : score != null ? `${Math.round(score)}%` : '—'}
                </span>
              </div>
            )
          })}
        </div>
        <SelectedDetailsCard />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen pb-6 bg-[var(--background)]">
      <TopBar onBack={goHome} title="Frame" onRight={() => setScreen('settings')} rightIcon="settings" />
      <ZoomTabs active={calView} onChange={(v) => { setCalView(v); setSelected(null) }} tabs={CAL_TABS} />

      {calView === 'year'  && <YearView />}
      {calView === 'month' && <MonthView />}
      {calView === 'week'  && <WeekView />}
    </div>
  )
}
