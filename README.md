# 📖 Frame

> A minimalist, aesthetic, and highly interactive personal logging and habit tracking application.

Frame combines rigorous tracking of daily habits (both positive goals and negative habits to avoid) with an introspective daily log (mood, rating, regrets, and achievements). It is powered by a secure local database and a premium dark mode animated interface.

---

## ✨ Key Features

* **📖 Interactive Home Page**: An animated, physical-looking book interface to open your personal journal.
* **📅 Multi-Scale Calendar View**:
  * **Year**: A 365-day GitHub-style contribution heatmap to visualize consistency at a glance.
  * **Month**: A colorful monthly calendar colored based on the daily completion score.
  * **Week**: Detailed daily habit statuses tracking throughout the week.
* **✍️ Comprehensive Day Page**:
  * Checklists for active habits (divided into positive Objectives and negative Bad Habits to avoid).
  * Interactive mood selector with expressive emojis.
  * Numbered day rating (score out of 10).
  * Structured reflection areas: "Regrets" (what didn't work) and "Achievements" (what you are proud of).
* **📊 Stats & Gamification**:
  * **Experience (XP) System**: Progress through 5 tiers (from *Rookie* to *Legend*).
  * **KPIs & Trends**: Real-time tracking of current/best streaks, overall success rate, and last 7 days trend.
  * **Badges**: 12 unique unlockable badges based on your achievements and consistency (e.g., *First Flame*, *Perfect Week*, *Iron Will*).
* **⚙️ Habit Manager**: Complete habit customization (enable/disable, positive/negative valence, and multiple tracking units like Yes/No, Counter, Duration, and Pages).

---

## 🛠️ Tech Stack

* **Framework**: React 19 (Single Page Application)
* **Build Tool**: Vite
* **Database**: Dexie.js (robust IndexedDB wrapper for local-first persistent storage)
* **State Management**: Zustand (lightweight and reactive)
* **Styling**: Tailwind CSS & Vanilla CSS (premium dark theme)
* **Animations**: Framer Motion (smooth transition effects for pages and book-opening)
* **Linter**: Oxlint (blazing fast static analysis)

---

## 📂 Project Structure

```text
src/
├── components/
│   ├── screens/      # Application screens (Home, Calendar, Day, Stats, Settings)
│   └── ui/           # Reusable graphical components (TopBar, Buttons, Dividers...)
├── db/
│   └── index.js      # DexieDB configuration, migrations, and stats queries
├── store/
│   └── index.js      # Zustand store for navigation and theme
├── utils/
│   └── index.js      # Gamification logic (levels, badges) and date helpers
├── App.jsx           # Main SPA router
└── index.css         # Dark theme CSS variables and global styling
```

---

## 🚀 Installation & Setup

### Prerequisites
* Node.js (version 18+)
* npm

### Installation
1. Clone the repository or download the source files.
2. Install dependencies:
   ```bash
   npm install
   ```

### Development
Start the local development server:
```bash
npm run dev
```
By default, the application will be accessible at `http://localhost:5173`.

### Production Build
Compile and bundle the application for production:
```bash
npm run build
```

### Code Quality (Linting)
Run static analysis using Oxlint:
```bash
npm run lint
```
