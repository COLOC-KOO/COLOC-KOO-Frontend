import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Annonces from './pages/Annonces'
import AnnonceDetail from './pages/AnnonceDetail'
import Deposer from './pages/Deposer'
import Partenaires from './pages/Partenaires'
import Contact from './pages/Contact'
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

export default function App() {
  return (
    <Routes>
      {/* Site public */}
      <Route path="/" element={<Home />} />
      <Route path="/annonces" element={<Annonces />} />
      <Route path="/annonces/:id" element={<AnnonceDetail />} />
      <Route path="/deposer" element={<Deposer />} />
      <Route path="/partenaires" element={<Partenaires />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/compte" element={<Compte />} />
      <Route path="/candidatures" element={<Candidatures />} />

      {/* Back-office admin */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/annonces" element={<AdminAnnonces />} />
      <Route path="/admin/candidatures" element={<AdminCandidatures />} />
      <Route path="/admin/utilisateurs" element={<AdminUtilisateurs />} />
      <Route path="/admin/partenaires" element={<AdminPartenaires />} />
      <Route path="/admin/paiements" element={<AdminPaiements />} />
      <Route path="/admin/messages" element={<AdminMessages />} />
      <Route path="/admin/parametres" element={<AdminParametres />} />
      <Route path="/admin/signalements-conversations" element={<AdminSignalements />} />
      <Route path="/admin/journal-actions" element={<AdminJournalActions />} />
      <Route path="/admin/versements" element={<AdminVersements />} />
      <Route path="/admin/equipe-objectifs" element={<AdminEquipeObjectifs />} />
        <Route path="/admin/configuration" element={<AdminConfiguration />} />
         <Route path="/admin/performances" element={<AdminPerformance/>} />
          <Route path="/admin/statistiques-colocation" element={<AdminStatistiquesColocation/>} />
               <Route path="/admin/technique" element={<AdminTechnique/>} />
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
