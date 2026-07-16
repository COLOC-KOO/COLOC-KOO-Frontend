import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Annonces from './pages/Annonces'
import AnnonceDetail from './pages/AnnonceDetail'
import Deposer from './pages/Deposer'
import Partenaires from './pages/Partenaires'
import Contact from './pages/Contact'
import Services from './pages/Services'
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
import AdminContratsEDL from './pages/admin/AdminContrat'
import { useAuth } from './lib/auth'
import { ConfigProvider } from './lib/config'

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin } = useAuth()
  if (loading) return <div className="min-h-screen grid place-items-center">Chargement...</div>
  if (!isAdmin) return <Navigate to="/auth?mode=signin&redirect=/admin" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <ConfigProvider>
      <Routes>
        {/* Site public */}
      <Route path="/" element={<Home />} />
      <Route path="/annonces" element={<Annonces />} />
      <Route path="/annonces/:id" element={<AnnonceDetail />} />
      <Route path="/deposer" element={<Deposer />} />
      <Route path="/partenaires" element={<Partenaires />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/services" element={<Services />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/compte" element={<Compte />} />
      <Route path="/candidatures" element={<Candidatures />} />

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
      <Route path="/admin/contrats-edl" element={<AdminRoute><AdminContratsEDL /></AdminRoute>} />
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </ConfigProvider>
)
}
