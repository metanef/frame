import { create } from 'zustand'

if (typeof document !== 'undefined') {
  document.documentElement.classList.add('dark')
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
  dark: true,
  toggleDark: () => set((s) => {
    const next = !s.dark
    document.documentElement.classList.toggle('dark', next)
    return { dark: next }
  }),
}))
