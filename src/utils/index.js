export const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']
export const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec']
export const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
export const DAYS_LONG = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

export function fmt(date) {
  const d = date instanceof Date ? date : new Date(date)
  return d.toISOString().slice(0, 10)
}

export function dayOfYear(date) {
  const d = date instanceof Date ? date : new Date(date)
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d - start) / 86400000)
}

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function scoreColor(score, alpha = false) {
  if (score === null || score === undefined) return alpha ? 'rgba(255,255,255,0.03)' : 'var(--surface-1)'
  if (score >= 80) return '#27500A'
  if (score >= 60) return '#3B6D11'
  if (score >= 40) return '#97C459'
  if (score >= 0)  return '#F09595'
  return alpha ? 'rgba(255,255,255,0.03)' : 'var(--surface-1)'
}

export function scoreLabel(score) {
  if (score === null || score === undefined) return '—'
  if (score >= 80) return 'Success 🎯'
  if (score >= 40) return 'Partial'
  return 'Difficult'
}

export const BADGES = [
  { id: 'first_flame',   emoji: '🔥', name: 'First Flame',    desc: 'First day completed',                check: (s) => s.totalDays >= 1 },
  { id: 'first_page',    emoji: '📖', name: 'First Page',     desc: 'First journal entry written',        check: (s) => s.journalDays >= 1 },
  { id: 'warrior_7',    emoji: '⚔️', name: '7-Day Warrior',  desc: '7 consecutive successful days',      check: (s) => s.bestStreak >= 7 },
  { id: 'hydrated',      emoji: '💧', name: 'Hydrated',       desc: '30 days with 3L water completed',    check: (s) => s.waterDays >= 30 },
  { id: 'clear_mind',    emoji: '🧘', name: 'Clear Mind',     desc: '14 days without overthinking',       check: (s) => s.noOtDays >= 14 },
  { id: 'streak_21',     emoji: '🌟', name: '21-Day Streak',  desc: '21 consecutive successful days',     check: (s) => s.bestStreak >= 21 },
  { id: 'perfect_week',  emoji: '🏆', name: 'Perfect Week',   desc: '7 consecutive days at 100%',         check: (s) => s.perfectWeek },
  { id: 'bookworm',      emoji: '📚', name: 'Bookworm',       desc: '50 reading sessions',                check: (s) => s.readDays >= 50 },
  { id: 'clean_month',   emoji: '🚫', name: 'Clean Month',    desc: '30 days without fast food',          check: (s) => s.noFFDays >= 30 },
  { id: 'iron_will',     emoji: '💪', name: 'Iron Will',      desc: '66 days with +80% success rate',     check: (s) => s.successDays >= 66 },
  { id: 'sharpshooter',  emoji: '🎯', name: 'Sharpshooter',  desc: '90% success rate over 30 days',      check: (s) => s.last30Rate >= 90 },
  { id: 'maitre',        emoji: '👑', name: 'Master',         desc: 'Reach Master level',                 check: (s) => s.level >= 4 },
]

export function getLevel(successDays, bestStreak) {
  if (successDays >= 365) return { level: 5, name: 'Legend', emoji: '🌙', next: null, xp: successDays, maxXp: 365 }
  if (successDays >= 66 && bestStreak >= 21) return { level: 4, name: 'Master', emoji: '👑', next: 'Legend', xp: successDays - 66, maxXp: 365 - 66 }
  if (successDays >= 21 && bestStreak >= 7) return { level: 3, name: 'Warrior', emoji: '⚔️', next: 'Master', xp: successDays - 21, maxXp: 66 - 21 }
  if (bestStreak >= 7) return { level: 2, name: 'Disciple', emoji: '📖', next: 'Warrior', xp: bestStreak, maxXp: 21 }
  return { level: 1, name: 'Rookie', emoji: '🌱', next: 'Disciple', xp: bestStreak, maxXp: 7 }
}
