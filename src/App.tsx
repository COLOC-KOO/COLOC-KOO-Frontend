import React, { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Home from './pages/Home'
import Annonces from './pages/Annonces'
import AnnonceDetail from './pages/AnnonceDetail'
import Deposer from './pages/Deposer'
import DepotAnnonce from './pages/DepotAnnonce'
import DepotAnnonceDeux from './pages/DepotAnnonceDeux.tsx'
import Partenaires from './pages/Partenaires'
import PartenairesTous from './pages/PartenairesTous'
import Contact from './pages/Contact'
import CGU from './pages/CGU'
import Services from './pages/Services'
import ProfilsRechercheLogement from './pages/ProfilsRechercheLogement'
import Auth from './pages/Auth'
import Compte from './pages/Compte'
import Candidatures from './pages/Candidatures'
import NotFound from './pages/NotFound'

import AdminDashboard from './pages/admin/Dashboard'
import AdminAnnonces from './pages/admin/AdminAnnonces'
import AdminCandidatures from './pages/admin/AdminCandidatures'
import AdminUtilisateurs from './pages/admin/AdminUtilisateurs'
import AdminPartenaires from './pages/admin/AdminPartenaires'
import AdminPaiements from './pages/admin/AdminPaiements'
import AdminMessages from './pages/admin/AdminMessages'
import AdminParametres from './pages/admin/AdminParametres'
import AdminSignalements from './pages/admin/AdminSignalement'
import AdminJournalActions from './pages/admin/AdminJournalActions'
import AdminVersements from './pages/admin/AdminVersement'
import AdminEquipeObjectifs from './pages/admin/AdminequipeObjectif'
import AdminConfiguration from './pages/admin/AdminConfiguration'
import AdminPerformance from './pages/admin/AdminPerformance'
import AdminStatistiquesColocation from './pages/admin/AdminStatistiqueColoc'
import AdminTechnique from './pages/admin/AdminTechnique'
import AdminSuiviMissions from './pages/admin/AdminsuiviMission'
import AdminServicesColockoo from './pages/admin/AdminServicecoloc'
import AdminBooster from './pages/admin/AdminBooster'
import AdminContratsEDL from './pages/admin/AdminContrat'
import { useAuth } from './lib/auth'
import { ConfigProvider } from './lib/config'
import AdvertisingPopup from './components/site/AdvertisingPopup'
import Maintenance from './pages/Maintenance'
import { api } from './lib/api'

// Remet la page en haut à chaque changement de route (React Router ne le fait pas nativement).
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin, user } = useAuth()
  if (loading) return <div className="min-h-screen grid place-items-center">Chargement...</div>
  // Connecté mais sans droit staff : on renvoie vers son espace (renvoyer vers
  // /auth?redirect=/admin créait une boucle de redirection = page blanche).
  if (user && !isAdmin) return <Navigate to="/compte" replace />
  if (!isAdmin) return <Navigate to="/auth?mode=signin&redirect=/admin" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <ConfigProvider>
      <ScrollToTop />
      <SiteAccess />
    </ConfigProvider>
  )
}

function SiteAccess() {
  const { pathname } = useLocation()
  const { isAdmin, loading: authLoading } = useAuth()
  const [maintenanceMode, setMaintenanceMode] = useState<boolean | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true
    api.siteStatus()
      .then(({ maintenanceMode: enabled }) => {
        if (active) {
          setMaintenanceMode(enabled)
          setStatusError(null)
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setStatusError(error instanceof Error ? error.message : 'Impossible de vérifier le statut du site.')
        }
      })
    return () => {
      active = false
    }
  }, [retry])

  let screenKey: string
  let screen: React.ReactNode

  if (pathname === '/auth') {
    screenKey = 'auth'
    screen = <Auth maintenanceMode={maintenanceMode !== false} />
  } else if (pathname.startsWith('/admin') || isAdmin) {
    screenKey = 'platform'
    screen = <AppRoutes />
  } else if (authLoading || maintenanceMode === null) {
    screenKey = statusError ? 'status-error' : 'loading'
    screen = statusError ? (
        <main className="grid min-h-screen place-items-center px-6 text-center">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Statut du site indisponible</h1>
            <p className="mt-2 text-sm text-slate-600">{statusError}</p>
            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
              className="mt-5 rounded-lg bg-brand-cyan px-4 py-2 font-semibold text-white"
            >
              Réessayer
            </button>
          </div>
        </main>
      ) : <div className="min-h-screen grid place-items-center">Chargement...</div>
  } else if (maintenanceMode) {
    screenKey = 'maintenance'
    screen = <Maintenance />
  } else {
    screenKey = 'platform'
    screen = <AppRoutes />
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screenKey}
        className="min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        {screen}
      </motion.div>
    </AnimatePresence>
  )
}

function AppRoutes() {
  return (
    <>
      <AdvertisingPopup />
      <Routes>
        {/* Site public */}
      <Route path="/" element={<Home />} />
      <Route path="/annonces" element={<Annonces />} />
      <Route path="/annonces/:id" element={<AnnonceDetail />} />
      <Route path="/deposer" element={<Deposer />} />
      {/* <Route path="/depot_annonce" element={<DepotAnnonce />} /> */}
      <Route path="/depot_annonce" element={<DepotAnnonceDeux />} />

<Route path="/annonces/:id/renouveler" element={<DepotAnnonceDeux />} />
<Route path="/partenaires" element={<Partenaires />} />
      <Route path="/partenaires" element={<Partenaires />} />
      <Route path="/partenaires-tous" element={<PartenairesTous />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/cgu" element={<CGU />} />
      <Route path="/services" element={<Services />} />
      <Route path="/profils-recherche-logement" element={<ProfilsRechercheLogement />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/compte" element={<Compte />} />
      <Route path="/candidatures" element={<Candidatures />} />
      <Route path="/candidatures/:annonceId" element={<Candidatures />} />

      {/* Back-office admin */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/annonces" element={<AdminRoute><AdminAnnonces /></AdminRoute>} />
      <Route path="/admin/candidatures" element={<AdminRoute><AdminCandidatures /></AdminRoute>} />
      <Route path="/admin/utilisateurs" element={<AdminRoute><AdminUtilisateurs /></AdminRoute>} />
      <Route path="/admin/partenaires" element={<AdminRoute><AdminPartenaires /></AdminRoute>} />
      <Route path="/admin/paiements" element={<AdminRoute><AdminPaiements /></AdminRoute>} />
      <Route path="/admin/messages" element={<AdminRoute><AdminMessages /></AdminRoute>} />
      <Route path="/admin/parametres" element={<AdminRoute><AdminParametres /></AdminRoute>} />
      <Route path="/admin/signalements-conversations" element={<AdminRoute><AdminSignalements /></AdminRoute>} />
      <Route path="/admin/journal-actions" element={<AdminRoute><AdminJournalActions /></AdminRoute>} />
      <Route path="/admin/versements" element={<AdminRoute><AdminVersements /></AdminRoute>} />
      <Route path="/admin/equipe-objectifs" element={<AdminRoute><AdminEquipeObjectifs /></AdminRoute>} />
      <Route path="/admin/configuration" element={<AdminRoute><AdminConfiguration /></AdminRoute>} />
      <Route path="/admin/performances" element={<AdminRoute><AdminPerformance /></AdminRoute>} />
      <Route path="/admin/statistiques-colocation" element={<AdminRoute><AdminStatistiquesColocation /></AdminRoute>} />
      <Route path="/admin/technique" element={<AdminRoute><AdminTechnique /></AdminRoute>} />
      <Route path="/admin/suivi-missions" element={<AdminRoute><AdminSuiviMissions /></AdminRoute>} />
      <Route path="/admin/services-colockoo" element={<AdminRoute><AdminServicesColockoo /></AdminRoute>} />
      <Route path="/admin/boost-annonce" element={<AdminRoute><AdminBooster /></AdminRoute>} />
      <Route path="/admin/contrats-edl" element={<AdminRoute><AdminContratsEDL /></AdminRoute>} />
      {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
    </>
)
}
