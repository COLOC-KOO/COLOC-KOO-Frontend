import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Lang, AuthState, User, Notification } from '../types';

interface AppContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  auth: AuthState;
  user: User | null;
  login: (role?: AuthState) => void;
  logout: () => void;
  liteMode: boolean;
  toggleLite: () => void;
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;
  authModalTab: 'login' | 'register';
  setAuthModalTab: (t: 'login' | 'register') => void;
}

const AppContext = createContext<AppContextType | null>(null);

const DEMO_USERS: Record<AuthState, User | null> = {
  guest: null,
  coloc: { id: 'u1', name: 'Rakoto A.', initials: 'RA', email: 'rakoto.a@email.mg', role: 'coloc' },
  proprio: { id: 'u2', name: 'Rabe M.', initials: 'RM', email: 'rabe.m@email.mg', role: 'proprio' },
  agent: { id: 'u3', name: 'Hery R.', initials: 'HR', email: 'hery.r@colockoo.mg', role: 'agent' },
  admin: { id: 'u4', name: 'Super Admin', initials: 'SA', email: 'admin@colockoo.mg', role: 'admin' },
  moderator: { id: 'u5', name: 'Modérateur', initials: 'MO', email: 'moderateur@colockoo.mg', role: 'moderator' },
};

const DEMO_NOTIFS: Notification[] = [
  { id: 'n1', type: 'message', titre: 'Nouveau message', texte: 'Hery R. t\'a envoyé un message', temps: 'il y a 5 min', lue: false, lien: '/messagerie' },
  { id: 'n2', type: 'candidature', titre: 'Équipe complète', texte: 'L\'équipe « Les Tana 4 » est complète — réponse attendue', temps: 'il y a 1 h', lue: false, lien: '/candidatures' },
  { id: 'n3', type: 'systeme', titre: 'Candidature acceptée', texte: 'Ta candidature pour Ankadifotsy a été acceptée', temps: 'hier', lue: false, lien: '/candidatures' },
  { id: 'n4', type: 'message', titre: 'Nouveau message', texte: 'Naïna M. t\'a envoyé un message', temps: 'il y a 2 j', lue: true, lien: '/messagerie' },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('FR');
  const [auth, setAuth] = useState<AuthState>('guest');
  const [user, setUser] = useState<User | null>(null);
  const [liteMode, setLiteMode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFS);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const unreadCount = notifications.filter(n => !n.lue).length;

  const login = useCallback((role: AuthState = 'coloc') => {
    setAuth(role);
    setUser(DEMO_USERS[role]);
    setShowAuthModal(false);
  }, []);

  const logout = useCallback(() => {
    setAuth('guest');
    setUser(null);
  }, []);

  const toggleLite = useCallback(() => setLiteMode(v => !v), []);

  const markAllRead = useCallback(() => {
    setNotifications(n => n.map(notif => ({ ...notif, lue: true })));
  }, []);

  return (
    <AppContext.Provider value={{
      lang, setLang,
      auth, user,
      login, logout,
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
