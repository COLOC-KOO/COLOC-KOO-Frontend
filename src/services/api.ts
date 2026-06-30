// src/services/api.ts - Version simplifiée sans langues

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// ==========================================
// TYPES
// ==========================================

export interface ApiUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  bio?: string;
  age?: number;
  profession?: string;
  profile_picture?: string;
  ville_actuelle?: string;
  ville_origine?: string;
  navigation_light?: boolean;
  role: string;
  nom_role?: string;
  date_inscription?: string;
  name?: string;
  initials?: string;
  avatar?: string;
}

export interface ApiAnnonce {
  id: string;
  reference?: string;
  titre: string;
  description?: string;
  type_annonce: 'existante' | 'creation';
  type_propriete?: string;
  total_colocataires?: number;
  surface_totale?: number;
  quartier?: string;
  ville?: string;
  prix?: number;
  photos: string[];
  services: string[];
  regles: string[];
  statut: 'active' | 'pending' | 'inactive' | 'archived';
  chambre?: {
    id?: number;
    surface?: number;
    est_meuble?: boolean;
    prix_meubles?: number;
    description_meubles?: string;
    prix_loyer?: number;
    prix_charges?: number;
    type_garantie?: string;
    montant_garantie?: number;
    date_disponibilite?: string;
  };
  auteur?: {
    id?: number;
    nom: string;
    prenom: string;
  };
  latitude?: number;
  longitude?: number;
  booster?: boolean;
  date_creation?: string;
  date_publication?: string;
  date_expiration?: string;
  views?: number;
  candidatures?: number;
}

export interface ApiNotification {
  id_notification: number;
  type_notification: 'message' | 'candidature' | 'systeme' | 'alerte' | 'info';
  titre: string;
  texte: string;
  date_creation: string;
  est_lue: boolean;
  lien?: string;
}

export interface ApiVille {
  id_ville: number;
  nom_ville: string;
  code_postal?: string;
  id_region?: number;
  nom_region?: string;
}

export interface ApiRegion {
  id_region: number;
  nom_region: string;
  code_region?: string;
}

// ==========================================
// API OBJECT
// ==========================================

export const api = {
  // ==========================================
  // AUTH
  // ==========================================
  auth: {
    async me(token: string): Promise<ApiUser> {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur de session' }));
        throw new Error(error.message || 'Erreur de session');
      }
      return response.json();
    },

    async login(credentials: { email: string; mot_de_passe: string }): Promise<{ user: ApiUser; token: string }> {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur de connexion' }));
        throw new Error(error.message || 'Email ou mot de passe incorrect');
      }
      return response.json();
    },

    async register(payload: Record<string, unknown>): Promise<{ user: ApiUser; token: string }> {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur d\'inscription' }));
        throw new Error(error.message || 'Erreur lors de l\'inscription');
      }
      return response.json();
    },

    async changePassword(data: { currentPassword: string; newPassword: string }, token: string): Promise<{ message: string }> {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur de changement de mot de passe' }));
        throw new Error(error.message || 'Erreur lors du changement de mot de passe');
      }
      return response.json();
    },

    async logout(token: string): Promise<void> {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
  },

  // ==========================================
  // USERS
  // ==========================================
  users: {
    async me(token: string): Promise<ApiUser> {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur de chargement du profil' }));
        throw new Error(error.message || 'Erreur lors du chargement du profil');
      }
      return response.json();
    },

    async updateMe(data: Partial<ApiUser>, token: string): Promise<ApiUser> {
      // Ne pas envoyer les champs qui causent des problèmes de clés étrangères
      const cleanData: Partial<ApiUser> = {};
      
      // Liste des champs autorisés (sans les clés étrangères)
      const allowedFields = ['nom', 'prenom', 'telephone', 'bio', 'age', 'profession', 'profile_picture'];
      
      for (const field of allowedFields) {
        if (data[field as keyof ApiUser] !== undefined) {
          cleanData[field as keyof ApiUser] = data[field as keyof ApiUser];
        }
      }
      
      // Ne pas envoyer ville_actuelle, ville_origine, langue_preferee qui causent des problèmes
      
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur de mise à jour' }));
        throw new Error(error.message || 'Erreur lors de la mise à jour du profil');
      }
      return response.json();
    },

    async getById(id: string | number, token: string): Promise<ApiUser> {
      const response = await fetch(`${API_URL}/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Utilisateur introuvable' }));
        throw new Error(error.message || 'Utilisateur introuvable');
      }
      return response.json();
    },

    async list(filters?: { role?: string; q?: string }, token?: string): Promise<ApiUser[]> {
      const params = new URLSearchParams();
      if (filters?.role) params.append('role', filters.role);
      if (filters?.q) params.append('q', filters.q);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/users?${params.toString()}`, { headers });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur de chargement' }));
        throw new Error(error.message || 'Erreur lors du chargement des utilisateurs');
      }
      return response.json();
    },
  },

  // ==========================================
  // ANNONCES
  // ==========================================
  annonces: {
    async list(filters: Record<string, string | number> = {}): Promise<ApiAnnonce[]> {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`${API_URL}/annonces?${params.toString()}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur de chargement' }));
        throw new Error(error.message || 'Erreur lors du chargement des annonces');
      }
      
      return response.json();
    },

    async getById(id: string, token?: string): Promise<ApiAnnonce> {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/annonces/${id}`, { headers });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Annonce introuvable' }));
        throw new Error(error.message || 'Annonce introuvable');
      }
      
      return response.json();
    },

    async create(data: Record<string, unknown>, token: string): Promise<ApiAnnonce> {
      const response = await fetch(`${API_URL}/annonces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur de création' }));
        throw new Error(error.message || 'Erreur lors de la création de l\'annonce');
      }
      
      return response.json();
    },

    async update(id: string, data: Record<string, unknown>, token: string): Promise<ApiAnnonce> {
      const response = await fetch(`${API_URL}/annonces/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur de mise à jour' }));
        throw new Error(error.message || 'Erreur lors de la mise à jour');
      }
      
      return response.json();
    },

    async updateStatus(id: string, statut: string, token: string): Promise<{ message: string }> {
      const response = await fetch(`${API_URL}/annonces/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ statut }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur de mise à jour du statut' }));
        throw new Error(error.message || 'Erreur lors de la mise à jour du statut');
      }
      
      return response.json();
    },

    async delete(id: string, token: string): Promise<{ message: string }> {
      const response = await fetch(`${API_URL}/annonces/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur de suppression' }));
        throw new Error(error.message || 'Erreur lors de la suppression');
      }
      
      return response.json();
    },
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  notifications: {
    async listMine(token: string): Promise<ApiNotification[]> {
      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur de chargement' }));
        throw new Error(error.message || 'Erreur lors du chargement des notifications');
      }
      return response.json();
    },

    async markAllRead(token: string): Promise<{ message: string }> {
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur de mise à jour' }));
        throw new Error(error.message || 'Erreur lors du marquage des notifications');
      }
      return response.json();
    },
  },
};

export default api;