import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Lang, AuthState, User, Notification, Annonce } from '../types';
import { api, type ApiUser, type ApiNotification, type ApiAnnonce } from '../services/api';
import { setCatalogData } from '../data/annonces';

interface AppContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  auth: AuthState;
  user: User | null;
  token: string | null;
  login: (role?: AuthState) => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  registerWithCredentials: (payload: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  liteMode: boolean;
  toggleLite: () => void;
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;
  authModalTab: 'login' | 'register';
  setAuthModalTab: (t: 'login' | 'register') => void;
}

const AppContext = createContext<AppContextType | null>(null);

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
  { id: 'n1', type: 'message', titre: 'Nouveau message', texte: 'Hery R. t\'a envoye un message', temps: 'il y a 5 min', lue: false, lien: '/messagerie' },
  { id: 'n2', type: 'candidature', titre: 'Equipe complete', texte: 'L\'equipe "Les Tana 4" est complete - reponse attendue', temps: 'il y a 1 h', lue: false, lien: '/candidatures' },
  { id: 'n3', type: 'systeme', titre: 'Candidature acceptee', texte: 'Ta candidature pour Ankadifotsy a ete acceptee', temps: 'hier', lue: false, lien: '/candidatures' },
  { id: 'n4', type: 'message', titre: 'Nouveau message', texte: 'Na\u00efna M. t\'a envoye un message', temps: 'il y a 2 j', lue: true, lien: '/messagerie' },
];

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

function toTitle(value?: string | null) {
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
    disponible: item.chambre?.date_disponibilite ? new Date(item.chambre.date_disponibilite).toLocaleDateString('fr-FR') : 'Des maintenant',
    images: item.photos.length > 0 ? item.photos : [DEFAULT_IMAGE],
    tags: [
      ...item.services.slice(0, 2).map(service => ({ label: service, variant: 'cy' as const })),
      ...item.regles.slice(0, 1).map(rule => ({ label: rule, variant: 'gr' as const })),
    ],
    services: item.services,
    regles: item.regles,
    description: item.description || undefined,
    proprio: item.auteur,
    badge: item.booster ? 'Booste' : undefined,
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('FR');
  const [auth, setAuth] = useState<AuthState>('guest');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [liteMode, setLiteMode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFS);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [catalogVersion, setCatalogVersion] = useState(0);
  const unreadCount = notifications.filter(n => !n.lue).length;

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

  const loadSession = useCallback(async () => {
    if (!token) return;
    try {
      const remoteUser = await api.auth.me(token);
      const nextUser = normalizeUser(remoteUser, remoteUser.role as AuthState);
      applySession(nextUser, token);
      const remoteNotifs = await api.notifications.listMine(token);
      setNotifications(remoteNotifs.length > 0 ? remoteNotifs.map(normalizeNotification) : DEMO_NOTIFS);
    } catch {
      applySession(null, null);
      setNotifications(DEMO_NOTIFS);
    }
  }, [applySession, token]);

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
    const result = await api.auth.login({ email, mot_de_passe: password });
    const nextUser = normalizeUser(result.user, result.user.role as AuthState);
    applySession(nextUser, result.token);
    try {
      const remoteNotifs = await api.notifications.listMine(result.token);
      setNotifications(remoteNotifs.length > 0 ? remoteNotifs.map(normalizeNotification) : []);
    } catch {
      setNotifications([]);
    }
    setShowAuthModal(false);
  }, [applySession]);

  const registerWithCredentials = useCallback(async (payload: Record<string, unknown>) => {
    const result = await api.auth.register(payload);
    const nextUser = normalizeUser(result.user, result.user.role as AuthState);
    applySession(nextUser, result.token);
    setNotifications([]);
    setShowAuthModal(false);
  }, [applySession]);

  const logout = useCallback(() => {
    setAuth('guest');
    setUser(null);
    setToken(null);
    setNotifications(DEMO_NOTIFS);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const toggleLite = useCallback(() => setLiteMode(v => !v), []);

  const markAllRead = useCallback(async () => {
    if (token) {
      await api.notifications.markAllRead(token);
    }
    setNotifications(n => n.map(notif => ({ ...notif, lue: true })));
  }, [token]);

  return (
    <AppContext.Provider value={{
      lang, setLang,
      auth, user, token,
      login,
      loginWithCredentials,
      registerWithCredentials,
      logout,
      liteMode, toggleLite,
      notifications, unreadCount, markAllRead,
      showAuthModal, setShowAuthModal,
      authModalTab, setAuthModalTab,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}




