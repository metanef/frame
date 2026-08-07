import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../../store'
import { TopBar, Divider, SectionTitle } from '../ui'
import { db } from '../../db'

const TYPES = [
  { value: 'boolean',  label: 'Yes / No' },
  { value: 'counter',  label: 'Counter' },
  { value: 'duration', label: 'Duration (hours)' },
  { value: 'pages',    label: 'Pages' },
  { value: 'steps',    label: 'Steps' },
]

export default function SettingsScreen() {
  const { goBack, toggleDark, dark } = useAppStore()
  const [habits, setHabits] = useState([])
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'boolean', isNegative: false, category: 'objectifs' })
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstallApp() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  useEffect(() => { db.habits.orderBy('order').toArray().then(setHabits) }, [])

  async function addHabit() {
    if (!form.name.trim()) return
    await db.habits.add({ ...form, isActive: true, order: habits.length + 1, createdAt: new Date() })
    const updated = await db.habits.orderBy('order').toArray()
    setHabits(updated)
    setForm({ name: '', type: 'boolean', isNegative: false, category: 'objectifs' })
    setAdding(false)
  }

  async function toggleActive(id, current) {
    await db.habits.update(id, { isActive: !current })
    const updated = await db.habits.orderBy('order').toArray()
    setHabits(updated)
  }

  async function deleteHabit(id) {
    await db.habits.delete(id)
    const updated = await db.habits.orderBy('order').toArray()
    setHabits(updated)
  }

  async function exportData() {
    const [habits, entries, summaries] = await Promise.all([
      db.habits.toArray(),
      db.dailyEntries.toArray(),
      db.daySummary.toArray(),
    ])
    const blob = new Blob([JSON.stringify({ habits, entries, summaries, exportedAt: new Date() }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `frame-export-${new Date().toISOString().slice(0,10)}.json`
    a.click(); URL.revokeObjectURL(url)
  }

  const fileInputRef = useRef(null)

  async function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data || typeof data !== 'object') {
        throw new Error("Invalid file format.")
      }

      const { habits, entries, summaries } = data

      if (!Array.isArray(habits)) {
        throw new Error("Invalid file content: missing habits list.")
      }

      if (!confirm("⚠️ WARNING: This will completely replace all your current habits, logs, and statistics with the imported data. This action cannot be undone.\n\nDo you want to proceed?")) {
        e.target.value = ''
        return
      }

      await db.transaction('rw', [db.habits, db.dailyEntries, db.daySummary], async () => {
        await Promise.all([
          db.habits.clear(),
          db.dailyEntries.clear(),
          db.daySummary.clear()
        ])

        if (habits.length) {
          await db.habits.bulkAdd(habits)
        }
        if (entries && entries.length) {
          await db.dailyEntries.bulkAdd(entries)
        }
        if (summaries && summaries.length) {
          await db.daySummary.bulkAdd(summaries)
        }
      })

      alert("Data successfully imported!")
      window.location.reload()
    } catch (err) {
      console.error('Error importing data:', err)
      alert("Failed to import data: " + err.message)
    } finally {
      e.target.value = ''
    }
  }

  async function generateTestData() {
    if (!confirm("Do you want to generate test data for the last 6 months? This will replace your existing entries for this period.")) return
    
    const allHabits = await db.habits.toArray()
    const activeHabits = allHabits.filter(h => h.isActive === true || h.isActive === 1 || h.isActive === '1')
    if (!activeHabits.length) {
      alert("Please create some active habits first.")
      return
    }
    
    const today = new Date()
    const entriesToAdd = []
    const summariesToAdd = []
    const moods = ['😊', '😴', '🧠', '⚡', '😔', '🧘']
    const notes = [
      "Good, productive day!",
      "A bit tired today.",
      "Intense workout session.",
      "Focused on my dev project.",
      "Quiet evening, reading.",
      "Hard to focus this morning.",
      "Great rest day."
    ]

    for (let i = 180; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      
      if (Math.random() > 0.15) {
        let total = activeHabits.length
        let doneCount = 0
        
        activeHabits.forEach(h => {
          const success = Math.random() > (h.isNegative ? 0.25 : 0.35)
          const status = success ? 'done' : 'fail'
          if (status === 'done') doneCount++
          
          let val = null
          if (h.type === 'counter') val = Math.floor(Math.random() * 4) + 1
          if (h.type === 'steps') val = Math.floor(Math.random() * 8000) + 4000
          if (h.type === 'pages') val = Math.floor(Math.random() * 15) + 3
          if (h.type === 'duration') val = Math.round((Math.random() * 4 + 1) * 10) / 10
          
          entriesToAdd.push({
            date: dateStr,
            habitId: h.id,
            status,
            value: val,
            note: ''
          })
        })
        
        const score = Math.round((doneCount / total) * 100)
        summariesToAdd.push({
          date: dateStr,
          rating: Math.floor(Math.random() * 4) + 2,
          mood: moods[Math.floor(Math.random() * moods.length)],
          notes: notes[Math.floor(Math.random() * notes.length)],
          score
        })
      }
    }
    
    const datesToDelete = summariesToAdd.map(s => s.date)
    await db.dailyEntries.where('date').anyOf(datesToDelete).delete()
    await db.daySummary.where('date').anyOf(datesToDelete).delete()
    
    await db.dailyEntries.bulkAdd(entriesToAdd)
    await db.daySummary.bulkAdd(summariesToAdd)
    
    alert("Test data successfully generated!")
    window.location.reload()
  }

  const negHabits = habits.filter(h => h.isNegative)
  const posHabits = habits.filter(h => !h.isNegative)

  function HabitRow({ h }) {
    return (
      <div className="flex items-center gap-3 py-2.5 border-b border-[var(--border)] last:border-0">
        <div className="flex-1">
          <div className="text-sm text-[var(--text-primary)]">{h.name}</div>
          <div className="text-[10px] text-[var(--text-muted)]">{TYPES.find(t => t.value === h.type)?.label}</div>
        </div>
        <button
          onClick={() => toggleActive(h.id, h.isActive)}
          className="text-xs px-2.5 py-1 rounded-full border transition-all"
          style={{
            background: h.isActive ? '#EAF3DE' : 'var(--surface-1)',
            borderColor: h.isActive ? '#97C459' : 'var(--border)',
            color: h.isActive ? '#3B6D11' : 'var(--text-muted)',
          }}
        >
          {h.isActive ? 'Active' : 'Inactive'}
        </button>
        <button onClick={() => deleteHabit(h.id)} className="text-[var(--text-muted)] hover:text-red-500 text-lg leading-none">×</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-10">
      <TopBar onBack={goBack} title="Settings" />

      <SectionTitle>Bad Habits</SectionTitle>
      <div className="px-4 bg-[var(--surface-1)] rounded-lg mx-4">
        {negHabits.map(h => <HabitRow key={h.id} h={h} />)}
        {negHabits.length === 0 && <div className="py-3 text-sm text-[var(--text-muted)]">No bad habits defined</div>}
      </div>

      <SectionTitle>Objectives</SectionTitle>
      <div className="px-4 bg-[var(--surface-1)] rounded-lg mx-4">
        {posHabits.map(h => <HabitRow key={h.id} h={h} />)}
        {posHabits.length === 0 && <div className="py-3 text-sm text-[var(--text-muted)]">No objectives defined</div>}
      </div>

      {/* Add habit */}
      <div className="px-4 mt-4">
        {!adding ? (
          <button
            onClick={() => setAdding(true)}
            className="w-full py-2.5 text-sm border border-dashed border-[var(--border)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            + Add a habit
          </button>
        ) : (
          <div className="p-4 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl flex flex-col gap-3">
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Habit name"
              className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-[var(--surface-2)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)]"
            />
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-[var(--surface-2)] text-[var(--text-primary)]"
            >
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={!form.isNegative} onChange={() => setForm(f => ({ ...f, isNegative: false, category: 'objectifs' }))} />
                <span className="text-sm text-[var(--text-secondary)]">Objective</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={form.isNegative} onChange={() => setForm(f => ({ ...f, isNegative: true, category: 'interdits' }))} />
                <span className="text-sm text-[var(--text-secondary)]">Avoid</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAdding(false)} className="flex-1 py-2 text-sm border border-[var(--border)] rounded-lg text-[var(--text-muted)]">Cancel</button>
              <button onClick={addHabit} className="flex-1 py-2 text-sm bg-[var(--ink)] text-[var(--parchment)] rounded-lg">Add</button>
            </div>
          </div>
        )}
      </div>

      <Divider className="mt-6" />

      <SectionTitle>Preferences</SectionTitle>
      <div className="px-4 flex flex-col gap-2">
        <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
          <span className="text-sm text-[var(--text-primary)]">Dark mode</span>
          <button
            onClick={toggleDark}
            className="w-11 h-6 rounded-full relative transition-colors"
            style={{ background: dark ? '#863bff' : 'var(--border-strong)' }}
          >
            <div
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
              style={{ left: dark ? 'calc(100% - 22px)' : 2 }}
            />
          </button>
        </div>
        <button onClick={exportData} className="flex items-center justify-between py-3 w-full text-left border-b border-[var(--border)]">
          <span className="text-sm text-[var(--text-primary)]">Export my data</span>
          <span className="text-xs text-[var(--text-muted)]">JSON ↓</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          accept=".json"
          style={{ display: 'none' }}
        />
        <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-between py-3 w-full text-left border-b border-[var(--border)]">
          <span className="text-sm text-[var(--text-primary)]">Import my data</span>
          <span className="text-xs text-[var(--text-muted)]">JSON ↑</span>
        </button>
        {deferredPrompt && (
          <button onClick={handleInstallApp} className="flex items-center justify-between py-3 w-full text-left border-b border-[var(--border)]">
            <span className="text-sm text-[var(--text-primary)]">Install application (PWA)</span>
            <span className="text-xs text-[#863bff] font-medium">Install 📲</span>
          </button>
        )}
        <button onClick={generateTestData} className="flex items-center justify-between py-3 w-full text-left">
          <span className="text-sm text-[var(--text-primary)]">Generate test data</span>
          <span className="text-xs text-[var(--text-muted)]">Demo mode ⚙</span>
        </button>
      </div>
    </div>
  )
}
