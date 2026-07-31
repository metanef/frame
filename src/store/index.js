import { create } from 'zustand'

const initialDark = typeof localStorage !== 'undefined'
  ? localStorage.getItem('theme') !== 'light'
  : true

if (typeof document !== 'undefined') {
  if (initialDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export const useAppStore = create((set) => ({
  // Navigation
  screen: 'home',       // 'home' | 'calendar' | 'day' | 'stats' | 'settings'
  calView: 'month',     // 'year' | 'month' | 'week'
  selectedDate: null,

  setScreen: (screen) => set({ screen }),
  setCalView: (calView) => set({ calView }),
  setSelectedDate: (date) => set({ selectedDate: date }),

  openDay: (date) => set({ selectedDate: date, screen: 'day' }),
  openCalendar: (view = 'month') => set({ screen: 'calendar', calView: view }),
  openStats: () => set({ screen: 'stats' }),
  goHome: () => set({ screen: 'home' }),

  // Theme
  dark: initialDark,
  toggleDark: () => set((s) => {
    const next = !s.dark
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    }
    document.documentElement.classList.toggle('dark', next)
    return { dark: next }
  }),
}))
