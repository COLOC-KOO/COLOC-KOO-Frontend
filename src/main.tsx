// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './lib/auth'
import { DialogProvider } from './components/ui/Dialog'
import { RealtimeProvider } from './lib/realtime'
import './index.css'

// ✅ IMPORT de la configuration i18n (traductions)
import './i18n'
// Capte l'invitation d'installation (PWA) dès le chargement de l'application
import './lib/pwaInstall'

ReactDOM.createRoot(document.getElementById('root')!).render(
 // <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RealtimeProvider>
          {/* Dialogues maison (alerte / confirmation / saisie / notification) */}
          <DialogProvider>
            <App />
          </DialogProvider>
        </RealtimeProvider>
      </AuthProvider>
    </BrowserRouter>
  //</React.StrictMode>
)