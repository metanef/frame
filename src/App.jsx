import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from './store'
import HomeScreen     from './components/screens/HomeScreen'
import CalendarScreen from './components/screens/CalendarScreen'
import DayScreen      from './components/screens/DayScreen'
import StatsScreen    from './components/screens/StatsScreen'
import SettingsScreen from './components/screens/SettingsScreen'

const SCREENS = {
  home:     HomeScreen,
  calendar: CalendarScreen,
  day:      DayScreen,
  stats:    StatsScreen,
  settings: SettingsScreen,
}

const slideVariants = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0,      opacity: 1 },
  exit:    { x: '-30%', opacity: 0 },
}

export default function App() {
  const { screen } = useAppStore()
  const Screen = SCREENS[screen] ?? HomeScreen

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        variants={slideVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        style={{ minHeight: '100vh', overflowY: 'auto' }}
      >
        <Screen />
      </motion.div>
    </AnimatePresence>
  )
}
