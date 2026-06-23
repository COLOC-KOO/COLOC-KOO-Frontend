import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import FicheColocPage from './pages/FicheColocPage';
import FichePropioPage from './pages/FichePropioPage';
import DepotPage from './pages/DepotPage';
import CandidaturesPage from './pages/CandidaturesPage';
import ContactPage from './pages/ContactPage';
import PartenairesPage from './pages/PartenairesPage';
import ComptePage from './pages/ComptePage';
import BackofficePage from './pages/backoffice/BackofficePage';

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* Backoffice — no main layout */}
          <Route path="/backoffice" element={<BackofficePage />} />
          
          {/* Main site with layout */}
          <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
          <Route path="/recherche" element={<MainLayout><ResultsPage /></MainLayout>} />
          <Route path="/annonce/:id" element={<MainLayout><FicheColocPage /></MainLayout>} />
          <Route path="/annonce-proprio/:id" element={<MainLayout><FichePropioPage /></MainLayout>} />
          <Route path="/deposer" element={<MainLayout><DepotPage /></MainLayout>} />
          <Route path="/candidatures" element={<MainLayout><CandidaturesPage /></MainLayout>} />
          <Route path="/contact" element={<MainLayout><ContactPage /></MainLayout>} />
          <Route path="/partenaires" element={<MainLayout><PartenairesPage /></MainLayout>} />
          <Route path="/compte" element={<MainLayout><ComptePage /></MainLayout>} />
          
          {/* Fallback */}
          <Route path="*" element={
            <MainLayout>
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                  <p className="font-bebas text-6xl text-sc-cy mb-2">404</p>
                  <h2 className="font-bebas text-2xl text-sc-dark mb-2">Page introuvable</h2>
                  <p className="text-sm text-sc-gr2 mb-4">La page que vous cherchez n'existe pas.</p>
                  <a href="/" className="px-5 py-2.5 bg-sc-cy text-white rounded-xl text-sm font-bold no-underline hover:bg-sc-cy-d transition-colors">
                    Retour à l'accueil
                  </a>
                </div>
              </div>
            </MainLayout>
          } />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
