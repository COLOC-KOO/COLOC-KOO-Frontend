// AppContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { Lang, AuthState, User, Notification, Annonce } from '../types';
import { api, type ApiUser, type ApiNotification, type ApiAnnonce } from '../services/api';
import { setCatalogData } from '../data/annonces';

// ============================================
// TYPES
// ============================================

interface ChambreData {
  surface?: number | null;
  est_meuble?: boolean | null;
  prix_meubles?: number | null;
  description_meubles?: string | null;
  prix_loyer: number;
  prix_charges?: number | null;
  type_garantie?: string | null;
  montant_garantie?: number | null;
  date_disponibilite?: string | null;
}

interface CreateAnnoncePayload {
  reference?: string;
  titre: string;
  description?: string | null;
  type_bailleur?: string;
  mode_annonce?: string;
  type_annonce: 'existante' | 'creation';
  type_propriete?: string;
  total_colocataires?: number | null;
  surface_totale?: number | null;
  adresse_exacte?: string | null;
  quartier?: string | null;
  id_ville: number;
  latitude?: number | null;
  longitude?: number | null;
  internet?: string | null;
  parking_voitures?: number;
  parking_motos?: number;
  parking_couvert?: number;
  services_communs?: Record<string, unknown> | null;
  chambres?: ChambreData | null;
  services?: string[];
  regles?: string[];
  photos?: string[];
  contact?: string;
}

interface UpdateAnnoncePayload {
  titre?: string;
  description?: string | null;
  statut?: string;
  type_bailleur?: string;
  mode_annonce?: string;
  type_annonce?: string;
  type_propriete?: string;
  total_colocataires?: number | null;
  surface_totale?: number | null;
  adresse_exacte?: string | null;
  quartier?: string | null;
  id_ville?: number;
  latitude?: number | null;
  longitude?: number | null;
  internet?: string | null;
  parking_voitures?: number;
  parking_motos?: number;
  parking_couvert?: number;
  services_communs?: Record<string, unknown> | null;
  date_publication?: string | null;
  date_expiration?: string | null;
  booster?: boolean;
}

interface AppContextType {
  // Langue
  lang: Lang;
  setLang: (l: Lang) => void;
  
  // Authentification
  auth: AuthState;
  user: User | null;
  token: string | null;
  login: (role?: AuthState) => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  registerWithCredentials: (payload: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  
  // Mode
  liteMode: boolean;
  toggleLite: () => void;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => Promise<void>;
  
  // Modals
  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;
  authModalTab: 'login' | 'register';
  setAuthModalTab: (t: 'login' | 'register') => void;
  
  // Annonces - Gestion
  createAnnonce: (data: CreateAnnoncePayload) => Promise<ApiAnnonce>;
  updateAnnonce: (id: string, data: UpdateAnnoncePayload) => Promise<ApiAnnonce>;
  deleteAnnonce: (id: string) => Promise<void>;
  getAnnonce: (id: string) => Promise<ApiAnnonce>;
  refreshCatalog: () => Promise<void>;
  
  // Annonces - États
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  catalogVersion: number;
}

// ============================================
// CONSTANTS
// ============================================

const TOKEN_KEY = 'colockoo_token';
const USER_KEY = 'colockoo_user';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80';

const DEMO_USERS: Record<AuthState, User | null> = {
  guest: null,
  coloc: { id: 'u1', name: 'Rakoto A.', initials: 'RA', email: 'rakoto.a@email.mg', role: 'coloc' },
  proprio: { id: 'u2', name: 'Rabe M.', initials: 'RM', email: 'rabe.m@email.mg', role: 'proprio' },
  agent: { id: 'u3', name: 'Hery R.', initials: 'HR', email: 'hery.r@colockoo.mg', role: 'agent' },
  admin: { id: 'u4', name: 'Super Admin', initials: 'SA', email: 'admin@colockoo.mg', role: 'admin' },
  moderator: { id: 'u5', name: 'Moderateur', initials: 'MO', email: 'moderateur@colockoo.mg', role: 'moderator' },
};

const DEMO_NOTIFS: Notification[] = [
  { id: 'n1', type: 'message', titre: 'Nouveau message', texte: 'Hery R. t\'a envoyé un message', temps: 'il y a 5 min', lue: false, lien: '/messagerie' },
  { id: 'n2', type: 'candidature', titre: 'Equipe complete', texte: 'L\'équipe "Les Tana 4" est complete - réponse attendue', temps: 'il y a 1 h', lue: false, lien: '/candidatures' },
  { id: 'n3', type: 'systeme', titre: 'Candidature acceptée', texte: 'Ta candidature pour Ankadifotsy a été acceptée', temps: 'hier', lue: false, lien: '/candidatures' },
  { id: 'n4', type: 'message', titre: 'Nouveau message', texte: 'Naïna M. t\'a envoyé un message', temps: 'il y a 2 j', lue: true, lien: '/messagerie' },
];

// ============================================
// HELPERS
// ============================================

function normalizeUser(user: ApiUser, fallbackRole: AuthState = 'coloc'): User {
  return {
    id: String(user.id),
    name: user.name || `${user.prenom} ${user.nom}`.trim(),
    initials: user.initials || `${(user.prenom || '').charAt(0)}${(user.nom || '').charAt(0)}`.toUpperCase(),
    email: user.email,
    role: (user.role as AuthState) || fallbackRole,
    avatar: user.avatar || undefined,
  };
}

function normalizeNotification(n: ApiNotification): Notification {
  return {
    id: String(n.id_notification),
    type: n.type_notification,
    titre: n.titre,
    texte: n.texte,
    temps: n.date_creation,
    lue: Boolean(n.est_lue),
    lien: n.lien || undefined,
  };
}

function toTitle(value?: string | null): string {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function mapAnnonceToCard(item: ApiAnnonce): Annonce {
  const city = item.ville || 'Antananarivo';
  const price = item.chambre?.prix_loyer || item.prix || 0;
  return {
    id: item.id,
    type: item.type_annonce === 'creation' ? 'proprio' : 'coloc',
    logement: toTitle(item.type_propriete || 'appartement') as Annonce['logement'],
    titre: item.titre,
    quartier: item.quartier || '',
    ville: city,
    surface: item.surface_totale || 0,
    chambreSurface: item.chambre?.surface || undefined,
    colocataires: item.total_colocataires || 0,
    prix: price,
    prixLabel: `${price.toLocaleString('fr-FR')} Ar/mois`,
    disponible: item.chambre?.date_disponibilite ? new Date(item.chambre.date_disponibilite).toLocaleDateString('fr-FR') : 'Dès maintenant',
    images: item.photos.length > 0 ? item.photos : [DEFAULT_IMAGE],
    tags: [
      ...item.services.slice(0, 2).map(service => ({ label: service, variant: 'cy' as const })),
      ...item.regles.slice(0, 1).map(rule => ({ label: rule, variant: 'gr' as const })),
    ],
    services: item.services,
    regles: item.regles,
    description: item.description || undefined,
    proprio: item.auteur,
    badge: item.booster ? 'Boosté' : undefined,
    badgeColor: item.booster ? '#46BDD6' : undefined,
    featured: item.booster,
    verified: item.statut === 'active',
  };
}

function buildCityList(items: Annonce[]) {
  const counts = new Map<string, number>();
  items.forEach(item => {
    const key = item.ville || 'Antananarivo';
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([nom, count]) => ({
      nom,
      count,
      code: nom.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    }));
}

// ============================================
// CONTEXT
// ============================================

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // ============================================
  // ÉTATS
  // ============================================
  
  const [lang, setLang] = useState<Lang>('FR');
  const [auth, setAuth] = useState<AuthState>('guest');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [liteMode, setLiteMode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFS);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [catalogVersion, setCatalogVersion] = useState(0);
  
  // États pour les opérations sur les annonces
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const unreadCount = notifications.filter(n => !n.lue).length;

  // Ref pour éviter les appels multiples
  const hasLoaded = useRef(false);
  const initialLoadDone = useRef(false);

  const applySession = useCallback((nextUser: User | null, nextToken: string | null) => {
    setUser(nextUser);
    setToken(nextToken);
    setAuth((nextUser?.role as AuthState) || 'guest');

    if (nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  const loadCatalog = useCallback(async () => {
    // Éviter les appels multiples si déjà en cours
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    
    try {
      const remote = await api.annonces.list({ statut: 'active' });
      const mapped = remote.map(mapAnnonceToCard);
      setCatalogData({ annonces: mapped, villes: buildCityList(mapped) });
      setCatalogVersion(v => v + 1);
    } catch (error) {
      console.error('Erreur chargement catalogue:', error);
      setCatalogData({});
      setCatalogVersion(v => v + 1);
    } finally {
      // Réinitialiser après 5 secondes pour permettre un rechargement manuel
      setTimeout(() => {
        hasLoaded.current = false;
      }, 5000);
    }
  }, []);

  const loadSession = useCallback(async () => {
    if (!token) return;
    
    try {
      const remoteUser = await api.auth.me(token);
      const nextUser = normalizeUser(remoteUser, remoteUser.role as AuthState);
      applySession(nextUser, token);
      
      try {
        const remoteNotifs = await api.notifications.listMine(token);
        if (remoteNotifs.length > 0) {
          setNotifications(remoteNotifs.map(normalizeNotification));
        }
      } catch {
        // Garder les notifications de démo en cas d'erreur
      }
    } catch (error) {
      console.error('Erreur chargement session:', error);
      applySession(null, null);
      setNotifications(DEMO_NOTIFS);
    }
  }, [applySession, token]);

  // Chargement initial - UNE SEULE FOIS
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const init = async () => {
      // Charger l'utilisateur depuis le localStorage
      const savedUser = localStorage.getItem(USER_KEY);
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as User;
          setUser(parsed);
          setAuth(parsed.role);
        } catch {
          localStorage.removeItem(USER_KEY);
        }
      }

      // Charger les données
      await loadCatalog();
      await loadSession();
    };

    init();
  }, [loadCatalog, loadSession]); // ← Dépendances stables

  // Recharger quand le token change (login/logout)
  useEffect(() => {
    if (initialLoadDone.current && token) {
      loadSession();
      loadCatalog();
    }
  }, [token, loadSession, loadCatalog]); // ← Dépendances stables

  const login = useCallback((role: AuthState = 'coloc') => {
    setAuth(role);
    setUser(DEMO_USERS[role]);
    setToken(null);
    setNotifications(DEMO_NOTIFS);
    setShowAuthModal(false);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(USER_KEY, JSON.stringify(DEMO_USERS[role]));
  }, []);

  const loginWithCredentials = useCallback(async (email: string, password: string) => {
    try {
      const result = await api.auth.login({ email, mot_de_passe: password });
      const nextUser = normalizeUser(result.user, result.user.role as AuthState);
      applySession(nextUser, result.token);
      
      try {
        const remoteNotifs = await api.notifications.listMine(result.token);
        if (remoteNotifs.length > 0) {
          setNotifications(remoteNotifs.map(normalizeNotification));
        }
      } catch {
        setNotifications([]);
      }
      
      setShowAuthModal(false);
      // Recharger le catalogue après connexion
      await loadCatalog();
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  }, [applySession, loadCatalog]);

  const registerWithCredentials = useCallback(async (payload: Record<string, unknown>) => {
    try {
      const result = await api.auth.register(payload);
      const nextUser = normalizeUser(result.user, result.user.role as AuthState);
      applySession(nextUser, result.token);
      setNotifications([]);
      setShowAuthModal(false);
      // Recharger le catalogue après inscription
      await loadCatalog();
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  }, [applySession, loadCatalog]);

  const logout = useCallback(() => {
    setAuth('guest');
    setUser(null);
    setToken(null);
    setNotifications(DEMO_NOTIFS);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  // ============================================
  // FONCTIONS DU CATALOGUE
  // ============================================

  const loadCatalog = useCallback(async () => {
    try {
      const remote = await api.annonces.list({ statut: 'active' });
      const mapped = remote.map(mapAnnonceToCard);
      setCatalogData({ annonces: mapped, villes: buildCityList(mapped) });
      setCatalogVersion(v => v + 1);
    } catch {
      setCatalogData({});
      setCatalogVersion(v => v + 1);
    }
  }, []);

  // ============================================
  // FONCTIONS DES ANNONCES
  // ============================================

  const createAnnonce = useCallback(async (data: CreateAnnoncePayload): Promise<ApiAnnonce> => {
    if (!token) {
      throw new Error('Vous devez être connecté pour créer une annonce');
    }
    
    setIsCreating(true);
    try {
      const result = await api.annonces.create(data, token);
      await loadCatalog();
      return result;
    } finally {
      setIsCreating(false);
    }
  }, [token, loadCatalog]);

  const updateAnnonce = useCallback(async (id: string, data: UpdateAnnoncePayload): Promise<ApiAnnonce> => {
    if (!token) {
      throw new Error('Vous devez être connecté pour modifier une annonce');
    }
    
    setIsUpdating(true);
    try {
      const result = await api.annonces.update(id, data, token);
      await loadCatalog();
      return result;
    } finally {
      setIsUpdating(false);
    }
  }, [token, loadCatalog]);

  const deleteAnnonce = useCallback(async (id: string): Promise<void> => {
    if (!token) {
      throw new Error('Vous devez être connecté pour supprimer une annonce');
    }
    
    setIsDeleting(true);
    try {
      await api.annonces.delete(id, token);
      await loadCatalog();
    } finally {
      setIsDeleting(false);
    }
  }, [token, loadCatalog]);

  const getAnnonce = useCallback(async (id: string): Promise<ApiAnnonce> => {
    return await api.annonces.getById(id, token || undefined);
  }, [token]);

  const refreshCatalog = useCallback(async (): Promise<void> => {
    await loadCatalog();
  }, [loadCatalog]);

  // ============================================
  // AUTRES FONCTIONS
  // ============================================

  const toggleLite = useCallback(() => setLiteMode(v => !v), []);

  const markAllRead = useCallback(async () => {
    if (token) {
      try {
        await api.notifications.markAllRead(token);
      } catch (error) {
        console.error('Erreur marquage notifications:', error);
      }
    }
    setNotifications(n => n.map(notif => ({ ...notif, lue: true })));
  }, [token]);

  const value: AppContextType = {
    lang, setLang,
    auth, user, token,
  // ============================================
  // INITIALISATION
  // ============================================

  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser && !user) {
      try {
        const parsed = JSON.parse(savedUser) as User;
        setUser(parsed);
        setAuth(parsed.role);
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
    void loadCatalog();
    void loadSession();
  }, [loadCatalog, loadSession, user]);

  // ============================================
  // PROVIDER
  // ============================================

  const value: AppContextType = {
    // Langue
    lang,
    setLang,
    
    // Authentification
    auth,
    user,
    token,
    login,
    loginWithCredentials,
    registerWithCredentials,
    logout,
    liteMode, toggleLite,
    notifications, unreadCount, markAllRead,
    showAuthModal, setShowAuthModal,
    authModalTab, setAuthModalTab,
    
    // Mode
    liteMode,
    toggleLite,
    
    // Notifications
    notifications,
    unreadCount,
    markAllRead,
    
    // Modals
    showAuthModal,
    setShowAuthModal,
    authModalTab,
    setAuthModalTab,
    
    // Annonces - Gestion
    createAnnonce,
    updateAnnonce,
    deleteAnnonce,
    getAnnonce,
    refreshCatalog,
    
    // Annonces - États
    isCreating,
    isUpdating,
    isDeleting,
    catalogVersion,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}