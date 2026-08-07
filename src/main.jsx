import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { db } from './db/index.js'
import { registerSW } from 'virtual:pwa-register'

// Register service worker for offline support
registerSW({ immediate: true })

// Trigger DB init / seed
db.open().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
