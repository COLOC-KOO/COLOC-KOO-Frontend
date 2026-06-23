# Sarintany'COLOC — Application React

Plateforme de colocation à Madagascar, convertie en **React + Vite + TailwindCSS + TypeScript**.

## Stack technique

- **React 18** + **TypeScript**
- **Vite** (bundler)
- **TailwindCSS v3** (charte Sarintany'COLOC)
- **React Router v6** (SPA routing)
- **Tabler Icons** (CDN)
- **Bebas Neue** (police)

## Pages disponibles

| Route | Page |
|-------|------|
| `/` | Homepage — Hero, recherche, annonces vedettes |
| `/recherche` | Résultats — Vue carte/liste, filtres |
| `/annonce/:id` | Fiche colocation existante |
| `/annonce-proprio/:id` | Fiche coloc à constituer |
| `/deposer` | Formulaire dépôt d'annonce (5 étapes) |
| `/candidatures` | Mes candidatures (colocataires) |
| `/partenaires` | Partenaires par niveaux |
| `/contact` | Formulaire contact + FAQ |
| `/compte` | Mon compte (profil, annonces, sécurité) |
| `/backoffice` | Back-office (modérateur + admin) |

## Démarrage

```bash
npm install
npm run dev       # Dev server (Vite HMR)
npm run build     # Build production
npm run preview   # Preview production build
```

## Architecture

```
src/
├── components/       # Composants partagés (Navbar, Footer, Logo, AuthModal, AnnonceCard)
├── context/          # AppContext (auth, langue, lite mode, notifications)
├── data/             # Données mockées (annonces, villes, quartiers)
├── pages/
│   ├── HomePage.tsx
│   ├── ResultsPage.tsx
│   ├── FicheColocPage.tsx
│   ├── FichePropioPage.tsx
│   ├── DepotPage.tsx
│   ├── CandidaturesPage.tsx
│   ├── ContactPage.tsx
│   ├── PartenairesPage.tsx
│   ├── ComptePage.tsx
│   └── backoffice/
│       ├── BackofficePage.tsx
│       ├── BackofficeDashboard.tsx
│       ├── BackofficeAnnonces.tsx
│       ├── BackofficeMembers.tsx
│       └── BackofficeStats.tsx
└── types/            # Interfaces TypeScript
```

## Charte graphique

- **Jaune-vert 1** : `#CCCC33` (`sc-y1`)
- **Jaune-vert 2** : `#99CC33` (`sc-y2`)
- **Cyan** : `#46BDD6` (`sc-cy`)
- **Fond** : `#f5f7f2` (`sc-bg`)
- **Texte** : `#2C2C2C` (`sc-dark`)
- **Backoffice dark** : `#1f2023` (`bo-bg`)

## Fonctionnalités

- ✅ Navigation responsive avec dropdown notifications/profil
- ✅ Mode "Lite" (économie de données)
- ✅ Sélecteur de langue (FR/MG/ENG)
- ✅ Authentification simulée (démo rapide)
- ✅ Recherche avec suggestions
- ✅ Filtres avancés (type, budget, services, règles)
- ✅ Vue carte + vue liste
- ✅ Fiches annonces détaillées
- ✅ Formulaire dépôt en 5 étapes
- ✅ Suivi candidatures
- ✅ Back-office complet (dashboard, file d'annonces, membres, stats)
- ✅ Modèle partenaires avec niveaux Diamant/Or/Argent/Bronze
