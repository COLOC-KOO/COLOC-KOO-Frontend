// src/i18n/index.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Importer toutes les traductions (FR)

import frCommon from './locales/fr/common.json'
import frHome from './locales/fr/home.json'
import frAuth from './locales/fr/auth.json'
import frAnnonces from './locales/fr/annonces.json'
import frAnnonceDetail from './locales/fr/annonceDetail.json'
import frCandidatures from './locales/fr/candidatures.json'
import frCompte from './locales/fr/compte.json'
import frContact from './locales/fr/contact.json'
import frDeposer from './locales/fr/deposer.json'
import frFooter from './locales/fr/footer.json'
import frHeader from './locales/fr/header.json' 
import frPartenaires from './locales/fr/partenaires.json'
import frServices from './locales/fr/services.json'
import frCgu from './locales/fr/cgu.json'
import frConversations from './locales/fr/conversations.json' // <--- AJOUTÉ
import frMessages from './locales/fr/messages.json'
import frTableauCompte from './locales/fr/tableauCompte.json'
import frAlertes from './locales/fr/alertes.json'
import frPreferences from './locales/fr/preferences.json'
import frCompteSecurites from './locales/fr/compteSecurite.json'
// Importer toutes les traductions (MG)
import mgCommon from './locales/mg/common.json'
import mgHome from './locales/mg/home.json'
import mgAuth from './locales/mg/auth.json'
import mgAnnonces from './locales/mg/annonces.json'
import mgAnnonceDetail from './locales/mg/annonceDetail.json'
import mgCandidatures from './locales/mg/candidatures.json'
import mgCompte from './locales/mg/compte.json'
import mgContact from './locales/mg/contact.json'
import mgDeposer from './locales/mg/deposer.json'
import mgFooter from './locales/mg/footer.json'
import mgHeader from './locales/mg/header.json'
import mgPartenaires from './locales/mg/partenaires.json'
import mgServices from './locales/mg/services.json'
import mgCgu from './locales/mg/cgu.json'
import mgConversations from './locales/mg/conversations.json' // <--- AJOUTÉ
import mgMessages from './locales/mg/messages.json'
import mgTableauCompte from './locales/mg/tableauCompte.json'
import mgAlertes from './locales/mg/alertes.json'
import mgPreferences from './locales/mg/preferences.json'
import mgCompteSecurites from './locales/mg/compteSecurite.json'
// Importer toutes les traductions (EN)
import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'
import enAuth from './locales/en/auth.json'
import enAnnonces from './locales/en/annonces.json'
import enAnnonceDetail from './locales/en/annonceDetail.json'
import enCandidatures from './locales/en/candidatures.json'
import enCompte from './locales/en/compte.json'
import enContact from './locales/en/contact.json'
import enDeposer from './locales/en/deposer.json'
import enFooter from './locales/en/footer.json'
import enHeader from './locales/en/header.json'
import enPartenaires from './locales/en/partenaires.json'
import enServices from './locales/en/services.json'
import enCgu from './locales/en/cgu.json'
import enConversations from './locales/en/conversations.json' // <--- AJOUTÉ
import enMessages from './locales/en/messages.json'
import enTableauCompte from './locales/en/tableauCompte.json'
import enAlertes from './locales/en/alertes.json'
import enPreferences from './locales/en/preferences.json'
import enCompteSecurite from './locales/en/compteSecurite.json'
const resources = {
  fr: {
    common: frCommon,
    home: frHome,
    auth: frAuth,
    annonces: frAnnonces,
    annonceDetail: frAnnonceDetail,
    candidatures: frCandidatures,
    compte: frCompte,
    contact: frContact,
    deposer: frDeposer,
    footer: frFooter,
    header: frHeader,
    partenaires: frPartenaires,
    services: frServices,
    cgu: frCgu,
    conversations: frConversations, // <--- AJOUTÉ
    messages:frMessages,
    tableauCompte:frTableauCompte,
    alertes:frAlertes,
    preferences:frPreferences,
    compteSecurites:frCompteSecurites,
  },
  mg: {
    common: mgCommon,
    home: mgHome,
    auth: mgAuth,
    annonces: mgAnnonces,
    annonceDetail: mgAnnonceDetail,
    candidatures: mgCandidatures,
    compte: mgCompte,
    contact: mgContact,
    deposer: mgDeposer,
    footer: mgFooter,
    header: mgHeader,
    partenaires: mgPartenaires,
    services: mgServices,
    cgu: mgCgu,
    conversations: mgConversations, 
    messages:mgMessages,
    tableauCompte:mgTableauCompte,
    alertes:mgAlertes,
    preferences:mgPreferences,
    compteSecurites:mgCompteSecurites,

  },
  en: {
    common: enCommon,
    home: enHome,
    auth: enAuth,
    annonces: enAnnonces,
    annonceDetail: enAnnonceDetail,
    candidatures: enCandidatures,
    compte: enCompte,
    contact: enContact,
    deposer: enDeposer,
    footer: enFooter,
    header: enHeader,
    partenaires: enPartenaires,
    services: enServices,
    cgu: enCgu,
    conversations: enConversations, 
    messages:enMessages,
    tableauCompte:enTableauCompte,
    alertes:enAlertes,
    preferences:enPreferences,
    compteSecurites:enCompteSecurite
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false,
    },
    ns: [
      'common',
      'home',
      'auth',
      'annonces',
      'annonceDetail',
      'candidatures',
      'compte',
      'contact',
      'deposer',
      'footer',
      'header',
      'partenaires',
      'services',
      'cgu',
      'conversations', 
      'messages',
      'tableauCompte',
      'alertes',
      'preferences',
      'compteSecurites'
    ],
    defaultNS: 'common',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'colockoo_language', // Garde la même clé que votre SiteHeader
    },
  })

export default i18n