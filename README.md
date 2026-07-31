<div align="center">

  <img src="public/logo.svg" width="110" height="110" alt="Frame Logo" />

  # Frame 📖

  **A minimalist, aesthetic, and highly interactive personal logging and habit tracking application.**

  [![v0.5](https://img.shields.io/badge/VERSION-0.5_STABLE-8b5cf6?style=for-the-badge)](https://github.com/metanef/frame)

  <br />

  [![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](#)
  [![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](#)
  [![Dexie](https://img.shields.io/badge/Dexie.js-IndexedDB-3178C6?style=flat-square)](#)
  [![Zustand](https://img.shields.io/badge/Zustand-4.5-764ABC?style=flat-square)](#)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](#)

</div>

---

## ✨ Features

- **📖 Interactive Home Page**: An animated, physical-looking 3D book interface to open your personal journal.
- **📅 Multi-Scale Calendar View**:
  - **Year View**: A responsive grid of 12 mini-months of colored cubes to visualize consistency at a glance, with quick Month View navigation.
  - **Month View**: A colorful monthly calendar colored based on the daily completion score.
  - **Week View**: Detailed daily habit statuses tracking throughout the week.
- **✍️ Comprehensive Day Page**:
  - Checklists for active habits (divided into positive Objectives and negative Bad Habits to avoid).
  - Interactive mood selector with expressive emojis.
  - Numbered day rating (score out of 10).
  - Structured reflection areas: "Regrets" (what didn't work) and "Achievements" (what you are proud of).
- **📊 Stats & Gamification**:
  - **Experience (XP) System**: Progress through 5 tiers (from *Rookie* to *Legend*).
  - **KPIs & Trends**: Real-time tracking of current/best streaks, overall success rate, and last 7 days trend.
  - **Badges**: 12 unique unlockable badges based on your achievements and consistency (e.g., *First Flame*, *Perfect Week*, *Iron Will*).
- **⚙️ Habit Manager**: Complete habit customization (enable/disable, positive/negative valence, and multiple tracking units like Yes/No, Counter, Duration, and Pages).

---

## 🛠️ Tech Stack

| Technology | Usage |
| :--- | :--- |
| **React 19** | Composable UI framework (Single Page Application) |
| **Vite** | Ultra-fast build tool and dev server |
| **Dexie.js** | Robust IndexedDB wrapper for local-first persistent storage |
| **Zustand** | Lightweight global state management |
| **Tailwind CSS** | Modern premium dark theme styling & custom layout |
| **Framer Motion** | Smooth animations (e.g., page transitions, 3D book opening) |
| **Oxlint** | Blazing fast static analysis and code quality linting |

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Production Build
npm run build

# 4. Code Quality (Linting)
npm run lint
```

Open `http://localhost:5173` in your browser.

---

## 🗺️ Roadmap & TODO

### ✅ Done
- [x] **English Translation (i18n)**: Fully translated UI screens (Home, Calendar, Day, Stats, Settings) and seeded database habits to English.
- [x] **Year View Overhaul**: Replaced the 53-week contribution graph with a responsive, clickable 12 mini-months layout optimized for mobile screens.
- [x] **Neutral Color for Empty Days**: Days with no logged entries are rendered as neutral gray in calendar grids rather than counted as failures (red).
- [x] **Streak Calculation**: Streamlined streak and success rate computations to respect unlogged days correctly.
- [x] **Gamification System**: Local-first badges triggers and experience progression logic.
- [x] **Realistic Book Opening Animation**: Overhauled the 3D book cover transition with nested motion containers to zoom full-screen first and then rotate open seamlessly like a real journal page.

### 🔄 Planned
- [ ] **PWA Offline Support**: Add service workers (`vite-plugin-pwa`) for offline-first capabilities.
- [ ] **Local Backups**: Implement import/export system for database backups.
- [ ] **Desktop Widget**: Widgets/Shortcuts for quicker log access.
- [ ] **Notifications**: Reminders to log habits.
- [ ] **Data Import**: Import my data in json formats : it should automatically create the habits in the database.
- [ ] **Add stats on the day card**, same as in the dashboard stats card

