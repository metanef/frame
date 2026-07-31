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

  const isBookFlow = screen === 'home' || screen === 'calendar'

  return (
    <AnimatePresence mode="popLayout">
      {isBookFlow ? (
        <motion.div
          key="book-flow"
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{ minHeight: '100vh', width: '100%', position: 'relative', overflowX: 'hidden' }}
        >
          {/* Calendar is rendered in the background */}
          <CalendarScreen />

          {/* Home screen cover is rendered as a clean absolute overlay on top */}
          <AnimatePresence>
            {screen === 'home' && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 50,
                  backgroundColor: 'var(--surface-0)',
                }}
              >
                <HomeScreen />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          key={screen}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          style={{ minHeight: '100vh', width: '100%', overflowY: 'auto' }}
        >
          {(() => {
            const Component = SCREENS[screen] ?? HomeScreen
            return <Component />
          })()}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
