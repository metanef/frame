# 📖 Frame

> Une application de journalisation personnelle et de suivi d'habitudes minimaliste, esthétique et hautement interactive.

Frame combine le suivi rigoureux des habitudes quotidiennes (objectifs et interdits) avec un journal de bord introspectif (humeurs, notes, regrets et réussites). Le tout est propulsé par une base de données locale sécurisée et une interface animée en mode sombre *Premium*.

---

## ✨ Fonctionnalités clés

* **📖 Page d'accueil interactive** : Interface animée simulant l'ouverture d'un livre physique pour accéder à son journal intime.
* **📅 Vue Calendrier multi-échelle** :
  * **Année** : Heatmap de contribution de 365 jours de style GitHub pour visualiser la régularité d'un coup d'œil.
  * **Mois** : Calendrier mensuel coloré basé sur le score quotidien.
  * **Semaine** : Suivi détaillé de chaque habitude sur la semaine.
* **✍️ Page Journée ultra-complète** :
  * Checklist des habitudes actives (séparées en Objectifs positifs et Interdits négatifs).
  * Sélecteur d'humeurs interactif avec émojis.
  * Évaluation chiffrée de la journée (note sur 10).
  * Champs de réflexion libre : « Regrets » et « Accomplissements ».
* **📊 Statistiques & Gamification** :
  * **Système d'expérience (XP)** : Progression à travers 5 niveaux (de *Rookie* à *Légende*).
  * **KPIs & Tendances** : Visualisation des streaks (actuel et meilleur), du taux de réussite global et de la tendance des 7 derniers jours.
  * **Badges** : 12 badges uniques à débloquer en fonction des réussites et des habitudes tenues (ex: *First Flame*, *Perfect Week*, *Iron Will*).
* **⚙️ Gestionnaire d'habitudes** : Personnalisation totale des habitudes (activées/désactivées, types d'unité comme Oui/Non, Compteur, Durée, Pages, et valence positive/négative).

---

## 🛠️ Stack Technique

* **Framework** : React 19 (Single Page Application)
* **Build Tool** : Vite
* **Base de données** : Dexie.js (wrapper IndexedDB robuste pour du stockage local persistant)
* **Gestion d'état** : Zustand (léger et réactif)
* **Stylisation** : Tailwind CSS & Vanilla CSS (thème sombre unifié)
* **Animations** : Framer Motion (transitions fluides des écrans et du livre)
* **Linter** : Oxlint (analyse statique ultra-rapide)

---

## 📂 Structure du Projet

```text
src/
├── components/
│   ├── screens/      # Écrans de l'application (Home, Calendar, Day, Stats, Settings)
│   └── ui/           # Composants graphiques réutilisables (TopBar, Buttons, Dividers...)
├── db/
│   └── index.js      # Configuration de DexieDB, migrations et requêtes de statistiques
├── store/
│   └── index.js      # Store Zustand gérant la navigation et le thème
├── utils/
│   └── index.js      # Logique de gamification (niveaux, badges) et helpers temporels
├── App.jsx           # Routeur principal de la SPA
└── index.css         # Thème sombre Premium et variables CSS
```

---

## 🚀 Installation et Démarrage

### Prérequis
* Node.js (version 18+)
* npm

### Installation
1. Clonez le dépôt ou téléchargez les fichiers du projet.
2. Installez les dépendances :
   ```bash
   npm install
   ```

### Développement
Lancez le serveur de développement local :
```bash
npm run dev
```
L'application sera accessible par défaut sur `http://localhost:5173`.

### Production
Pour compiler et optimiser l'application pour la production :
```bash
npm run build
```

### Qualité du Code
Pour analyser le code avec le linter ultra-rapide Oxlint :
```bash
npm run lint
```
