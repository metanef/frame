import Dexie from 'dexie'

export const db = new Dexie('FrameDB')

db.version(1).stores({
  habits:       '++id, name, category, type, isNegative, order, isActive, createdAt',
  dailyEntries: '++id, date, habitId, status, value, note, [date+habitId]',
  daySummary:   '++id, date, rating, mood, regret, achievement',
  userSettings: 'key',
})

// ─── Seed default habits ───────────────────────────────────────────────────
db.on('ready', async () => {
  // Convert any legacy integer 1/0 values to boolean true/false
  try {
    await db.habits.toCollection().modify(h => {
      if (h.isActive === 1 || h.isActive === '1') {
        h.isActive = true
      } else if (h.isActive === 0 || h.isActive === '0') {
        h.isActive = false
      }
    })
  } catch (err) {
    console.error('Error migrating isActive fields:', err)
  }

  const count = await db.habits.count()
  if (count > 0) return

  const defaults = [
    // Interdits (négatifs)
    { name: 'No porn',         category: 'interdits', type: 'counter',  isNegative: true,  order: 1, isActive: true, createdAt: new Date() },
    { name: 'No sugar',        category: 'interdits', type: 'boolean',  isNegative: true,  order: 2, isActive: true, createdAt: new Date() },
    { name: 'No fast food',    category: 'interdits', type: 'boolean',  isNegative: true,  order: 3, isActive: true, createdAt: new Date() },
    { name: 'No overthinking', category: 'interdits', type: 'boolean',  isNegative: true,  order: 4, isActive: true, createdAt: new Date() },
    // Objectifs (positifs)
    { name: 'Journal (1 page)',category: 'objectifs', type: 'boolean',  isNegative: false, order: 5, isActive: true, createdAt: new Date() },
    { name: '3L eau',          category: 'objectifs', type: 'counter',  isNegative: false, order: 6, isActive: true, createdAt: new Date() },
    { name: '10k pas',         category: 'objectifs', type: 'steps',    isNegative: false, order: 7, isActive: true, createdAt: new Date() },
    { name: 'Lecture (5p)',    category: 'objectifs', type: 'pages',    isNegative: false, order: 8, isActive: true, createdAt: new Date() },
    { name: 'Écran < 3h',      category: 'objectifs', type: 'duration', isNegative: true,  order: 9, isActive: true, createdAt: new Date() },
    { name: 'Skill > 2h',      category: 'objectifs', type: 'duration', isNegative: false, order: 10, isActive: true, createdAt: new Date() },
  ]
  await db.habits.bulkAdd(defaults)
})

// ─── Helpers ───────────────────────────────────────────────────────────────
export const fmt = (date) => {
  const d = date instanceof Date ? date : new Date(date)
  return d.toISOString().slice(0, 10)
}

export async function getDayEntries(date) {
  const dateStr = fmt(date)
  const [allHabits, entries, summary] = await Promise.all([
    db.habits.toArray(),
    db.dailyEntries.where('date').equals(dateStr).toArray(),
    db.daySummary.where('date').equals(dateStr).first(),
  ])
  const habits = allHabits
    .filter(h => h.isActive === true || h.isActive === 1 || h.isActive === '1')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const entryMap = {}
  entries.forEach(e => { entryMap[e.habitId] = e })
  return { habits, entryMap, summary }
}

export async function saveEntry(date, habitId, status, value = null, note = '') {
  const dateStr = fmt(date)
  const existing = await db.dailyEntries
    .where('[date+habitId]').equals([dateStr, habitId]).first()
  if (existing) {
    await db.dailyEntries.update(existing.id, { status, value, note })
  } else {
    await db.dailyEntries.add({ date: dateStr, habitId, status, value, note })
  }
}

export async function saveSummary(date, data) {
  const dateStr = fmt(date)
  const existing = await db.daySummary.where('date').equals(dateStr).first()
  if (existing) {
    await db.daySummary.update(existing.id, data)
  } else {
    await db.daySummary.add({ date: dateStr, ...data })
  }
}

export async function getDayScore(date) {
  const { habits, entryMap } = await getDayEntries(date)
  if (!habits.length) return null
  const done = habits.filter(h => entryMap[h.id]?.status === 'done').length
  return Math.round((done / habits.length) * 100)
}

export async function getScoresForRange(startDate, endDate) {
  const dates = []
  const cur = new Date(startDate)
  while (cur <= endDate) {
    dates.push(fmt(cur))
    cur.setDate(cur.getDate() + 1)
  }
  const scores = {}
  await Promise.all(dates.map(async (d) => {
    scores[d] = await getDayScore(new Date(d))
  }))
  return scores
}

export async function getStreaks() {
  const today = new Date()
  let current = 0, best = 0, streak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const score = await getDayScore(d)
    if (score !== null && score >= 80) {
      streak++
      if (i === 0 || streak > 1) current = streak
      best = Math.max(best, streak)
    } else {
      if (i === 0) current = 0
      streak = 0
    }
  }
  return { current, best }
}
