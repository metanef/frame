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
  prevScreen: 'home',
  calView: 'month',     // 'year' | 'month' | 'week'
  selectedDate: null,

  setScreen: (screen) => set((state) => ({ prevScreen: state.screen, screen })),
  setCalView: (calView) => set({ calView }),
  setSelectedDate: (date) => set({ selectedDate: date }),

  openDay: (date) => set((state) => ({ selectedDate: date, prevScreen: state.screen, screen: 'day' })),
  openCalendar: (view = 'month') => set((state) => ({ prevScreen: state.screen, screen: 'calendar', calView: view })),
  openStats: () => set((state) => ({ prevScreen: state.screen, screen: 'stats' })),
  goHome: () => set({ screen: 'home', prevScreen: 'home' }),
  goBack: () => set((state) => ({ screen: state.prevScreen, prevScreen: 'home' })),

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
