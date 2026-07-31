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

const fadeVariants = {
  initial: { opacity: 0, x: 0, scale: 1 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit:    { opacity: 0, x: 0, scale: 1 },
}

const slideVariants = {
  initial: { x: '100%', opacity: 0, scale: 0.98 },
  animate: { x: 0,      opacity: 1, scale: 1 },
  exit:    { x: '-30%', opacity: 0, scale: 0.98 },
}

export default function App() {
  const { screen } = useAppStore()
  const Screen = SCREENS[screen] ?? HomeScreen

  const isFade = screen === 'home' || screen === 'calendar'

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={screen}
        variants={isFade ? fadeVariants : slideVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={
          isFade 
            ? { duration: 0.65, ease: 'easeInOut' }
            : { duration: 0.25, ease: [0.4, 0, 0.2, 1] }
        }
        style={{ minHeight: '100vh', width: '100%', overflowY: 'auto' }}
      >
        <Screen />
      </motion.div>
    </AnimatePresence>
  )
}
