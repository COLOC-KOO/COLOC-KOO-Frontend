const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export type ApiOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || 'Requete API echouee');
  }
  return payload as T;
}

export type ApiUser = {
  id: number;
  email: string;
  telephone?: string | null;
  nom: string;
  prenom: string;
  name: string;
  initials: string;
  role: string;
  avatar?: string | null;
  age?: number | null;
  bio?: string | null;
  profession?: string | null;
  verification?: boolean;
};

export type ApiAnnonce = {
  id: number;
  reference: string;
  titre: string;
  description?: string | null;
  statut: string;
  type_annonce: 'existante' | 'creation';
  type_propriete?: string;
  total_colocataires?: number | null;
  surface_totale?: number | null;
  quartier?: string | null;
  ville?: string | null;
  region?: string | null;
  prix?: number;
  chambre?: { surface?: number | null; prix_loyer?: number | null; date_disponibilite?: string | null } | null;
  services: string[];
  regles: string[];
  photos: string[];
  booster?: boolean;
  auteur?: string;
};

export type ApiNotification = {
  id_notification: number;
  type_notification: 'message' | 'candidature' | 'systeme';
  titre: string;
  texte: string;
  lien?: string | null;
  est_lue: number | boolean;
  date_creation: string;
};

export const api = {
  request,
  auth: {
    login: (body: { email: string; mot_de_passe: string }) => request<{ user: ApiUser; token: string }>('/auth/login', { method: 'POST', body }),
    register: (body: Record<string, unknown>) => request<{ user: ApiUser; token: string }>('/auth/register', { method: 'POST', body }),
    me: (token: string) => request<ApiUser>('/auth/me', { token }),
  },
  annonces: {
    list: (params?: Record<string, string | number | undefined>) => {
      const search = new URLSearchParams();
      Object.entries(params || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== '') search.set(key, String(value));
      });
      const suffix = search.toString() ? `?${search.toString()}` : '';
      return request<ApiAnnonce[]>(`/annonces${suffix}`);
    },
    getById: (id: number | string) => request<ApiAnnonce>(`/annonces/${id}`),
    create: (body: Record<string, unknown>, token: string) => request<ApiAnnonce>('/annonces', { method: 'POST', body, token }),
  },
  favoris: {
    list: (token: string) => request<ApiAnnonce[]>('/favoris', { token }),
    toggle: (idAnnonce: number | string, token: string) => request<{ favori: boolean }>(`/favoris/${idAnnonce}`, { method: 'POST', token }),
  },
  candidatures: {
    listMine: (token: string) => request<any[]>('/candidatures', { token }),
    create: (body: Record<string, unknown>, token: string) => request<any>('/candidatures', { method: 'POST', body, token }),
  },
  notifications: {
    listMine: (token: string) => request<ApiNotification[]>('/notifications', { token }),
    markAllRead: (token: string) => request<{ message: string }>('/notifications/read-all', { method: 'PATCH', token }),
  },
  partenaires: {
    list: () => request<any[]>('/partenaires'),
    createRequest: (body: Record<string, unknown>) => request<{ id_demande: number }>('/partenaires/requests', { method: 'POST', body }),
  },
  contact: {
    create: (body: Record<string, unknown>) => request<{ id_message: number }>('/contact', { method: 'POST', body }),
  },
};

export { API_BASE };

