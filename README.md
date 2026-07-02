# Sarintany'COLOC

Copie fonctionnelle complète (front public + back-office admin) de la plateforme de colocation
**Sarintany'COLOC**, reconstruite en **React + Vite + TypeScript + Tailwind CSS**, avec un
routing via `react-router-dom` (`App.tsx`, `components/`, `pages/`).

## Aperçu du projet
- **Nom** : Sarintany'COLOC
- **Objectif** : Plateforme de colocation à Madagascar (Antananarivo, Toamasina, Mahajanga,
  Fianarantsoa, Antsirabe, Nosy Be) — recherche d'annonces, dépôt d'annonce, candidature en ligne,
  espace compte locataire, et back-office admin complet.
- **Stack** : React 18, Vite 5, TypeScript, Tailwind CSS, React Router v6, lucide-react (icônes).

## Structure du code
```gg
src/
  App.tsx                 # Routing principal (react-router-dom)d
  main.tsx                # Point d'entrée React
  index.css               # Thème Tailwind + variables de couleur (oklch)
  types/                  # Types TypeScript (Listing, Candidature, AdminUser, ...)
  data/mockData.ts        # Données mock (annonces, utilisateurs, paiements, messages...)
  lib/utils.ts            # Helpers (formatAr, unsplash, cn)
  components/
    Logo.tsx
    ui/Button.tsx, ui/Badge.tsx
    site/SiteHeader.tsx, SiteFooter.tsx, SiteLayout.tsx, ListingCard.tsx
    admin/AdminLayout.tsx
  pages/
    Home.tsx, Annonces.tsx, AnnonceDetail.tsx, Deposer.tsx,
    Partenaires.tsx, Contact.tsx, Auth.tsx, Compte.tsx, Candidatures.tsx, NotFound.tsx
    admin/Dashboard.tsx, AdminAnnonces.tsx, AdminCandidatures.tsx,
    AdminUtilisateurs.tsx, AdminPartenaires.tsx, AdminPaiements.tsx,
    AdminMessages.tsx, AdminParametres.tsx
```

## Fonctionnalités côté client (site public)
- **Accueil (`/`)** : hero avec recherche, exploration par ville, annonces vedettes,
  section "Comment ça marche", CTA propriétaire/agence.
- **Annonces (`/annonces`)** : liste filtrable (ville, type, prix max, options), grille de cartes.
- **Détail annonce (`/annonces/:id`)** : galerie photo, description, équipements, colocataires
  actuels, encart prix + bouton "Postuler", infos propriétaire.
- **Déposer une annonce (`/deposer`)** : formulaire en 5 étapes (Type, Localisation, Détails,
  Photos, Tarifs) avec stepper visuel.
- **Partenaires (`/partenaires`)** : argumentaire B2B, 3 formules d'abonnement (Découverte, Pro,
  Agence).
- **Contact (`/contact`)** : coordonnées + formulaire de message.
- **Authentification (`/auth`)** : connexion / inscription (mock), lien vers back-office admin.
- **Espace compte (`/compte`)** : profil, dossier locatif (upload documents), notifications,
  paiements, sécurité (onglets).
- **Candidatures (`/candidatures`)** : suivi du pipeline de candidature (Envoyée → Reçue →
  Dossier → Signature → Convention).
- **404** : page d'erreur personnalisée.

## Fonctionnalités côté back-office (admin, `/admin/*`)
Layout sombre avec sidebar de navigation, bandeau "DÉMO" (bascule de vue admin/proprio/locataire),
recherche globale, notifications.
- **Dashboard (`/admin`)** : KPIs (annonces actives, candidatures, utilisateurs, revenus),
  candidatures récentes, top villes, dernières annonces.
- **Annonces (`/admin/annonces`)** : table avec recherche, filtres statut, actions (voir, éditer,
  supprimer).
- **Candidatures (`/admin/candidatures`)** : vue Kanban (5 colonnes de statut).
- **Utilisateurs (`/admin/utilisateurs`)** : table des utilisateurs (locataires, propriétaires,
  agences) avec rôle/statut.
- **Partenaires (`/admin/partenaires`)** : cartes agences/propriétaires (annonces, CA).
- **Paiements (`/admin/paiements`)** : KPIs financiers + table des transactions.
- **Messages (`/admin/messages`)** : boîte de réception + fil de conversation (support/modération).
- **Paramètres (`/admin/parametres`)** : configuration plateforme (général, commissions, emails).

## Données
Toutes les données sont des **mock data statiques** définies dans `src/data/mockData.ts`
(aucun backend / base de données). Pour un usage réel, il faudrait connecter ces pages à une API
(Cloudflare D1, KV ou service externe).

## Démarrage local
```bash
npm install
npm run dev        # serveur de développement (Vite)
npm run build      # build de production dans dist/
npm run preview    # prévisualiser le build de production
```

## Déploiement
Projet buildé en site statique (SPA), déployable sur **Cloudflare Pages** :
```bash
npm run build
npx wrangler pages deploy dist --project-name sarintany-coloc
```

## Prochaines étapes possibles
- Connecter un vrai backend (Cloudflare D1 pour les annonces/utilisateurs/paiements).
- Authentification réelle (sessions, JWT).
- Upload de photos réel (Cloudflare R2).
- Recherche/filtrage côté serveur, pagination.
