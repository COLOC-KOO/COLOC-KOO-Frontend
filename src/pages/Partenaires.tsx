// pages/Partenaires.tsx
import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  Building2, Check, Send, Gift, Handshake, ListChecks, 
  Lightbulb, Users, HeartHandshake, MapPin, ChartNoAxesCombined, 
  Rocket, Award, Store, Home, Landmark, Flag, ArrowUpRight, 
  Feather, CircleCheck, Sparkles, TrendingUp, Shield, 
  Zap, Crown, Briefcase, Target, Layers, Eye, BarChart3, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { Button } from '../components/ui/Button'
import { api } from '../lib/api'
import { useConfig } from '../lib/config'

// Types
interface PartnerTier {
  name: string
  launch?: string
  arg: string
  benefits: string[]
  tierClass: string
  icon?: React.ReactNode
}

interface PartnerSection {
  id: string
  icon: React.ReactNode
  iconClass?: string
  title: string
  subtitle: string
  tiers: PartnerTier[]
  isAddon?: boolean
  addonNote?: string
}

interface WhyCard {
  icon: React.ReactNode
  title: string
  desc: string
  color?: 'cyan' | 'green'
}

// Données i18n
const t = {
  heroBadge: "Lancement 2026",
  heroTitle: "Devenez partenaire",
  heroDesc: "Associez votre marque à une solution malgache d'accès au logement et touchez une audience jeune, urbaine et active. Du statut indépendant aux grandes entreprises et réseaux immobiliers, il existe un statut adapté à chaque structure.",
  heroMission: "« Habiter autrement pour étudier, travailler et s'émanciper »",
  heroCta: "Devenir Partenaire",
  heroCta2: "Voir les offres",
  whyTitle: "Pourquoi devenir partenaire ?",
  whySub: "Sarintany'COLOC est le site de référence de la colocation à Madagascar.",
  whyReasons: "",
  launchTxt: "Lancement 2026 : plusieurs statuts offerts aux premiers partenaires. Contactez-nous pour découvrir les conditions.",
  statutsTitle: "Les statuts partenaires",
  statutsSub: "Quatre familles de partenaires, avec des niveaux et des avantages évolutifs.",
  secEnt: "Entreprise générale",
  secImmo: "Immobilier",
  secInst: "Institution publique — mécénat",
  secAddon: "Option · Bandeau régional exclusif",
  contactH: "Prêt à rejoindre Sarintany'COLOC ?",
  contactP: "Dites-nous qui vous êtes : nous vous orientons vers le statut le plus adapté .",
  contactCta: "Nous contacter",
  // Benefits
  b1: "Logo + page « Partenaires »",
  b2: "Présence dans 1 newsletter / an",
  b3: "Signalétique « Partenaire engagé 2026 »",
  b4: "Intègre toute l'offre précédente, plus :",
  b5: "Référencement prioritaire",
  b6: "Point d'intérêt sur la carte",
  b7: "Redirection vers vos liens web",
  b8: "Stats annuelles globales (personas, villes attractives)",
  b9: "Référencement prioritaire + présentation 3 lignes",
  b10: "Encarts natifs dans le fil d'annonces",
  b11: "Retour annuel d'audiences statistiques",
  b12: "Logo intégré aux campagnes de communication",
  b13: "Partenaire mis en avant « ils participent le plus »",
  b14: "Présence sur la page d'accueil",
  b15: "Intégration nationale d'une chaîne",
  b16: "Mise en avant dans les campagnes",
  b17: "Reporting semestriel personnalisé",
  b18: "1 bandeau régional exclusif compris",
  b19: "1 annonce à but commercial",
  b20: "Validité 4 mois",
  b21: "Colocataires s'inscrivent puis confirment",
  b22: "1 compte agence + 12 annonces/an",
  b23: "Newsletter annuelle + signalétique",
  b24: "Intégration de tout le réseau",
  b25: "Publications illimitées",
  b26: "Visibilité maximale en page d'accueil",
  b27: "Logo + page « Partenaires » mécène",
  b28: "Signalétique « Mécène engagé 2026 »",
  b29: "Visibilité équivalente au niveau Argent",
  b30: "Référencement et présentation du mécène",
  b31: "Logo du mécène dans les campagnes",
  b32: "Visibilité équivalente au niveau Or",
  b33: "Mise en avant en page d'accueil",
  b34: "Visibilité maximale équivalente Platine",
  b35: "Modalités définies ensemble",
  // Form
  callMe: "Je souhaite être rappelé(e)",
  receiveBrochure: "Recevoir la plaquette des offres par e-mail",
  namePlaceholder: "Nom et structure",
  emailPlaceholder: "Adresse e-mail",
  phonePlaceholder: "Numéro de téléphone",
  activityPlaceholder: "Votre activité et le statut qui vous intéresse",
  datePlaceholder: "Date souhaitée de rappel",
  slotPlaceholder: "Créneau horaire…",
  slotMorning: "Matinée (08h–12h)",
  slotEarlyAfternoon: "Début d'après-midi (12h–15h)",
  slotLateAfternoon: "Fin d'après-midi (15h–18h)",
  lightpopH: "Naviguer en mode allégé ?",
  lightpopP: "Connexion lente ou data limitée ? Le mode allégé désactive les animations et allège l'affichage.",
  lightpopYes: "Activer le mode allégé",
  lightpopNo: "Continuer normalement",
  lightpopRemind: "Ne plus me le rappeler",
}

// =============================================
// COMPOSANT HERO - FULLY RESPONSIVE
const Hero: React.FC<{ onContactClick: () => void; onStatutsClick: () => void }> = ({ 
  onContactClick, onStatutsClick 
}) => {
  // Image de fond
  const bgImage = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600&q=80'

  return (
    <section className="relative overflow-hidden bg-[#0b1628] border-b border-white/10 min-h-[500px] sm:min-h-[600px] flex items-center">
      {/* Image de fond */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b1628]/90 via-[#16324f]/80 to-[#214c70]/80" />
      
      {/* ✅ REFLET LUMINEUX DIAGONAL PUR - sans masque sur les éléments clés */}
      <div className="absolute inset-0 pointer-events-none shimmer-container">
        {/* Premier rayon lumineux diagonal */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_3s_infinite] skew-x-12" />
        {/* Deuxième rayon lumineux décalé pour un effet plus naturel */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[200%] animate-[shimmer_4s_infinite_1.5s] skew-x-12" />
      </div>

      <div className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-6 py-10 sm:py-12 md:py-16 text-white">
        <div className="text-center">
          {/* Badge - SANS EFFET SHIMMER (classe no-shimmer) */}
          <div className="relative inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-[#b7df58] text-[10px] sm:text-xs mb-3 sm:mb-5 overflow-hidden no-shimmer">
            <Gift className="w-3 h-3 sm:w-3.5 sm:h-3.5 relative z-10" />
            <span className="relative z-10">{t.heroBadge}</span>
          </div>

          {/* Mission - SANS EFFET SHIMMER */}
          <p className="font-['Bebas_Neue'] text-xl sm:text-2xl md:text-3xl text-white/90 leading-tight mb-1 sm:mb-2 px-2 drop-shadow-lg no-shimmer">
            {t.heroMission}
          </p>

          {/* Titre - SANS EFFET SHIMMER */}
          <div className="relative inline-block no-shimmer">
            <h1 className="font-['Bebas_Neue'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-none tracking-wide bg-gradient-to-r from-white to-[#99CC33] bg-clip-text text-transparent relative z-10 px-2 drop-shadow-lg">
              {t.heroTitle}
            </h1>
          </div>

          {/* Description - SANS EFFET SHIMMER */}
          <p className="max-w-xl mx-auto text-xs sm:text-sm md:text-base text-white/80 leading-relaxed mb-5 sm:mb-7 px-3 backdrop-blur-sm bg-black/10 rounded-xl py-2 no-shimmer">
            {t.heroDesc}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 px-3">
            <button
              onClick={onContactClick}
              onContextMenu={(e) => e.preventDefault()}
              className="relative flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-[#99CC33] text-[#102033] text-xs sm:text-sm font-semibold shadow-lg shadow-[#99CC33]/30 transition-all hover:-translate-y-0.5 overflow-hidden group"
            >
              {/* Effet shimmer UNIQUEMENT sur le bouton au hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
              <Handshake className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10" />
              <span className="relative z-10">{t.heroCta}</span>
            </button>

            <button
              onClick={onStatutsClick}
              onContextMenu={(e) => e.preventDefault()}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg border border-white/30 bg-white/10 text-white text-xs sm:text-sm font-semibold backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/50 no-shimmer"
            >
              <ListChecks className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {t.heroCta2}
            </button>
          </div>
        </div>
      </div>

      {/* Styles pour un reflet lumineux pur et ciblé */}
      <style>{`
        /* Animation du reflet lumineux */
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }

        /* Masquer le shimmer sur les éléments .no-shimmer */
        .shimmer-container {
          mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='white' /%3E%3C/svg%3E");
          -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='white' /%3E%3C/svg%3E");
          mask-composite: add;
          -webkit-mask-composite: source-over;
        }

        /* Masquer le shimmer sur les éléments .no-shimmer en utilisant mask-image avec des trous */
        .shimmer-container .no-shimmer {
          /* Forcer le rendu au-dessus du shimmer */
          position: relative;
          z-index: 2;
        }

        /* Approche alternative : utiliser un pseudo-élément pour cacher le shimmer sous les éléments .no-shimmer */
        .shimmer-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background: transparent;
          pointer-events: none;
          /* Créer des "trous" dans le masque aux emplacements des éléments no-shimmer */
          mask-image: radial-gradient(ellipse 300px 80px at 50% 15%, transparent 0%, transparent 60%, black 61%, black 100%),
                      radial-gradient(ellipse 500px 100px at 50% 30%, transparent 0%, transparent 70%, black 71%, black 100%),
                      radial-gradient(ellipse 200px 40px at 50% 65%, transparent 0%, transparent 60%, black 61%, black 100%);
          -webkit-mask-image: radial-gradient(ellipse 300px 80px at 50% 15%, transparent 0%, transparent 60%, black 61%, black 100%),
                              radial-gradient(ellipse 500px 100px at 50% 30%, transparent 0%, transparent 70%, black 71%, black 100%),
                              radial-gradient(ellipse 200px 40px at 50% 65%, transparent 0%, transparent 60%, black 61%, black 100%);
          mask-composite: exclude;
          -webkit-mask-composite: xor;
        }

        /* Version simplifiée : appliquer un no-shimmer via z-index */
        .no-shimmer {
          position: relative;
          z-index: 5 !important;
          isolation: isolate;
        }

        /* S'assurer que le conteneur shimmer n'affecte pas les éléments no-shimmer */
        .shimmer-container > * {
          pointer-events: none;
        }
      `}</style>
    </section>
  )
}

// =============================================
// COMPOSANT POURQUOI - FULLY RESPONSIVE
// =============================================
const WhySection: React.FC = () => {
  const cards: WhyCard[] = [
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Audience ciblée',
      desc: 'Étudiants, jeunes actifs et familles : une audience jeune, urbaine et active, difficile à atteindre ailleurs.',
      color: 'cyan'
    },
    {
      icon: <HeartHandshake className="w-5 h-5" />,
      title: 'Engagement RSE',
      desc: 'Affichez la signalétique « Partenaire engagé » et associez votre image au logement et à l\'émancipation.',
      color: 'green'
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: 'Visibilité sur la carte',
      desc: 'Votre logo et votre page partenaire visibles par tous les visiteurs de Sarintany\'COLOC.',
      color: 'green'
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Données utiles',
      desc: 'Selon le palier : stats de fréquentation, personas, villes attractives et zones de tension du marché.',
      color: 'cyan'
    }
  ]

  return (
    <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6">
      <div className="max-w-[1120px] mx-auto">
        <div className="flex flex-col items-center gap-3 mb-2">
        <h2 className="font-['Bebas_Neue'] text-2xl sm:text-3xl md:text-4xl text-[#2C2C2C] text-center">
          {t.whyTitle}
        </h2>
      </div>
        <p className="text-xs sm:text-sm md:text-base text-[#666] leading-relaxed max-w-3xlmx-auto text-center mb-4 sm:mb-6">
          {t.whySub}
        </p>
        <p className="font-['Bebas_Neue'] text-xl sm:text-2xl md:text-3xl text-[#99CC33] text-center my-2 mb-4 sm:mb-6">
          {t.whyReasons}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {cards.map((card, idx) => (
            <div 
              key={idx} 
              className={`group bg-white border border-[#e8e8e8] rounded-2xl p-4 sm:p-6 text-center transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
                card.color === 'cyan' ? 'hover:border-[#46BDD6]' : 'hover:border-[#99CC33]'
              }`}
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-all duration-200 group-hover:scale-110 ${
                card.color === 'cyan' ? 'bg-[#E8F7FA]' : 'bg-[#F4F8E8]'
              }`}>
                <span className={card.color === 'cyan' ? 'text-[#46BDD6]' : 'text-[#99CC33]'}>
                  {card.icon}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-[#2C2C2C] mb-1 sm:mb-2">{card.title}</h3>
              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 sm:mt-6 bg-[#F4F8E8] border border-dashed border-[#99CC33]/60 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#99CC33]/20 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
            <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-[#99CC33]" />
          </div>
          <p className="text-xs sm:text-sm md:text-base text-[#4d6b1a] leading-relaxed">{t.launchTxt}</p>
        </div>
      </div>
    </section>
  )
}

// =============================================
// COMPOSANT TIER CARD - FULLY RESPONSIVE
// =============================================
const TierCard: React.FC<{ tier: PartnerTier }> = ({ tier }) => {
  const keyMap: Record<string, string> = {
    'Logo + page « Partenaires »': t.b1,
    'Présence dans 1 newsletter / an de Sarintany\'COLOC': t.b2,
    'Signalétique « Partenaire engagé Sarintany\'COLOC 2026 »': t.b3,
    'Intègre toute l\'offre précédente, plus :': t.b4,
    'Référencement prioritaire par rapport au statut précédent': t.b5,
    'Implantation de votre entreprise comme point d\'intérêt sur la carte': t.b6,
    'Intégration et redirection vers vos liens web': t.b7,
    'Stats annuelles globales (personas, villes attractives, zones de tension)': t.b8,
    'Référencement prioritaire + présentation 3 lignes': t.b9,
    'Encarts natifs dans le fil d\'annonces': t.b10,
    'Retour annuel d\'audiences statistiques et visibilité': t.b11,
    'Intégration du logo partenaires dans les campagnes de communication de Sarintany\'COLOC': t.b12,
    'Partenaire mis en avant en « ils participent le plus »': t.b13,
    'Présence sur la page d\'accueil du site': t.b14,
    'Intégration nationale d\'une chaîne (tous les points de vente)': t.b15,
    'Mise en avant dans les campagnes de communication': t.b16,
    'Reporting semestriel personnalisé': t.b17,
    '1 bandeau régional exclusif compris (hors Antananarivo, région d\'Analamanga)': t.b18,
    '1 annonce à but commercial': t.b19,
    'Validité 4 mois (identique à l\'offre Propriétaire)': t.b20,
    'Les colocataires s\'inscrivent puis confirment': t.b21,
    '1 compte agence + 12 annonces par an, puis tarif réduit': t.b22,
    '1 newsletter par an + signalétique d\'engagement': t.b23,
    'Intégration de tout le réseau (1 compte par agence)': t.b24,
    'Publications illimitées': t.b25,
    'Visibilité maximale : mise en avant en page d\'accueil et dans les campagnes de communication': t.b26,
    'Logo + page « Partenaires » au titre de mécène': t.b27,
    'Signalétique « Mécène engagé Sarintany\'COLOC 2026 »': t.b28,
    'Visibilité équivalente au niveau Argent, sans logique commerciale': t.b29,
    'Référencement et présentation du mécène mis en avant': t.b30,
    'Logo du mécène dans les campagnes de communication de Sarintany\'COLOC': t.b31,
    'Visibilité équivalente au niveau Or': t.b32,
    'Mise en avant en page d\'accueil (« ils nous soutiennent »)': t.b33,
    'Visibilité maximale, équivalente au niveau Platine': t.b34,
    'Modalités définies ensemble (mécénat sur mesure)': t.b35,
  }

  const benefits = tier.benefits.map((b) => {
    const translated = keyMap[b] || b
    const isHead = b.startsWith('Intègre toute')
    return { text: translated, isHead }
  })

  const getBadgeColor = (tierClass: string) => {
    if (tierClass.includes('bronze')) return 'border-[#c8843c]'
    if (tierClass.includes('argent')) return 'border-[#9aa3ad]'
    if (tierClass.includes('or')) return 'border-[#d4af37]'
    if (tierClass.includes('platine')) return 'border-[#5a8aa0]'
    if (tierClass.includes('green')) return 'border-[#99CC33]'
    if (tierClass.includes('cy')) return 'border-[#46BDD6]'
    return 'border-[#e8e8e8]'
  }

  return (
    <div className={`group bg-white border border-[#e8e8e8] rounded-2xl p-4 sm:p-5 flex flex-col transition-all duration-200 hover:shadow-xl hover:-translate-y-1 border-t-[4px] ${tier.tierClass}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-1">
        <div className="flex items-center gap-2 sm:gap-2.5">
          {tier.icon && (
            <span className="text-[#99CC33]">{tier.icon}</span>
          )}
          <span className="font-['Bebas_Neue'] text-lg sm:text-xl md:text-2xl text-[#2C2C2C]">{tier.name}</span>
        </div>
        {tier.launch && (
          <span className={`text-[8px] sm:text-[10px] font-bold text-[#5a7a1a] bg-[#F4F8E8] border ${getBadgeColor(tier.tierClass)} rounded-full px-2 sm:px-3 py-0.5 sm:py-1 whitespace-nowrap`}>
            {tier.launch}
          </span>
        )}
      </div>
      <p className="text-xs sm:text-sm text-[#46BDD6] italic leading-relaxed my-1 sm:my-2 mb-2 sm:mb-3">{tier.arg}</p>
      <ul className="list-none flex flex-col gap-1.5 sm:gap-2 p-0 m-0 flex-1">
        {benefits.map((b, idx) => (
          <li key={idx} className={`text-xs sm:text-sm leading-relaxed flex gap-2 sm:gap-2.5 items-start ${b.isHead ? 'font-semibold text-[#2C2C2C]' : 'text-[#555]'}`}>
            <span className={`flex-shrink-0 mt-0.5 ${b.isHead ? 'text-[#999]' : 'text-[#99CC33]'}`}>
              {b.isHead ? <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" /> : <Check className="w-3 h-3 sm:w-4 sm:h-4" />}
            </span>
            <span>{b.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// =============================================
// COMPOSANT SECTION PARTENAIRE - FULLY RESPONSIVE
// =============================================
const PartnerSectionComponent: React.FC<{ section: PartnerSection }> = ({ section }) => {
  const isCyan = section.iconClass === 'cy'

  if (section.isAddon) {
    return (
      <div className="group bg-gradient-to-br from-white via-[#E8F7FA] to-[#E8F7FA]/50 border-2 border-[#46BDD6] rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start transition-all duration-200 hover:shadow-xl">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border-2 border-[#46BDD6] flex items-center justify-center flex-shrink-0 text-xl sm:text-2xl shadow-sm">
          <span className="text-[#46BDD6]">{section.icon}</span>
        </div>
        <div>
          <h3 className="font-['Bebas_Neue'] text-xl sm:text-2xl md:text-3xl text-[#2C2C2C]">{section.title}</h3>
          <p className="text-xs sm:text-sm md:text-base text-[#555] leading-relaxed mt-1 sm:mt-1.5">{section.subtitle}</p>
          {section.addonNote && (
            <p className="text-[10px] sm:text-xs md:text-sm text-[#888] mt-2 border-t border-[#46BDD6]/30 pt-2 sm:pt-3">{section.addonNote}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#e8e8e8] rounded-2xl p-4 sm:p-5 md:p-6 transition-all duration-200 hover:shadow-lg">
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-[#e8e8e8]">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${isCyan ? 'bg-[#E8F7FA]' : 'bg-[#F4F8E8]'}`}>
          <span className={isCyan ? 'text-[#46BDD6]' : 'text-[#99CC33]'}>{section.icon}</span>
        </div>
        <div>
          <h3 className={`font-['Bebas_Neue'] text-xl sm:text-2xl md:text-3xl leading-tight ${isCyan ? 'text-[#46BDD6]' : 'text-[#99CC33]'}`}>
            {section.title}
          </h3>
          <p className="text-xs sm:text-sm md:text-base text-[#666] leading-relaxed mt-0.5">{section.subtitle}</p>
        </div>
      </div>
   
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 ${
          section.id === 'entreprise-generale'
            ? 'xl:grid-cols-4'
            : 'xl:grid-cols-3'
        }`}
      >
        {section.tiers.map((tier, idx) => (
          <TierCard key={idx} tier={tier} />
        ))}
      </div>
    </div>
  )
}

// COMPOSANT CONTACT - FULLY RESPONSIVE
// =============================================
const ContactSection: React.FC = () => {
  const [showCallback, setShowCallback] = useState(false)
  const [showOk, setShowOk] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneCC: '+261',
    phone: '',
    activity: '',
    wantCallback: false,
    callbackDate: '',
    callbackSlot: '',
    wantBrochure: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleCallbackToggle = (checked: boolean) => {
    setShowCallback(checked)
    setFormData(prev => ({ ...prev, wantCallback: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)

    try {
      await api.createPartenaireRequest({
        nom: formData.name,
        email: formData.email,
        phone: formData.phone,
        phoneCC: formData.phoneCC,
        message: formData.activity,
        wantCallback: formData.wantCallback,
        callbackDate: formData.callbackDate,
        callbackSlot: formData.callbackSlot,
        wantBrochure: formData.wantBrochure,
      })
      setShowOk(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Impossible d’envoyer votre demande. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  const phoneOptions = [
    { value: '+261', label: '+261 (Mada)' },
    { value: '+33', label: '+33 (France)' },
    { value: '+262', label: '+262 (Réunion / Mayotte)' },
    { value: '+230', label: '+230 (Maurice)' },
    { value: '+269', label: '+269 (Comores)' },
    { value: '+32', label: '+32 (Belgique)' },
    { value: '+41', label: '+41 (Suisse)' },
  ]

  const slotOptions = [
    { value: '', label: t.slotPlaceholder },
    { value: 'morning', label: t.slotMorning },
    { value: 'early_afternoon', label: t.slotEarlyAfternoon },
    { value: 'late_afternoon', label: t.slotLateAfternoon },
  ]

  return (
    <section className="relative py-12 sm:py-16 md:py-24 px-4 sm:px-6 overflow-hidden" id="contact">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f5f7f2] via-white to-[#f0f5ed]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#99CC33]/8 rounded-full blur-3xl" />

      <div className="max-w-xl mx-auto relative z-10 px-2 sm:px-0">
        {/* En-tête */}
        <div className="text-center mb-6 sm:mb-8">
          
          <h2 className="font-['Bebas_Neue'] text-2xl sm:text-3xl md:text-4xl text-[#2C2C2C] mb-1 sm:mb-2">
            {t.contactH}
          </h2>
          <p className="text-[#666] text-xs sm:text-sm max-w-sm mx-auto px-2">
            {t.contactP}
          </p>
        </div>

        {/* Carte noire */}
        <div className="bg-[#1a1a2e] rounded-2xl shadow-2xl shadow-black/20 border border-white/10 p-4 sm:p-6 md:p-8">
          {!showOk ? (
            <form className="flex flex-col gap-3 sm:gap-4" onSubmit={handleSubmit}>
              {/* Nom & Structure */}
              <div>
                <label className="block text-xs font-medium text-white mb-1 sm:mb-1.5">Nom & Structure</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-white/10 bg-white/5 text-white text-xs sm:text-sm placeholder:text-white/20 focus:outline-none focus:border-[#99CC33] focus:ring-2 focus:ring-[#99CC33]/20 transition-all duration-200"
                  placeholder={t.namePlaceholder}
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-white mb-1 sm:mb-1.5">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-white/10 bg-white/5 text-white text-xs sm:text-sm placeholder:text-white/20 focus:outline-none focus:border-[#99CC33] focus:ring-2 focus:ring-[#99CC33]/20 transition-all duration-200"
                  placeholder={t.emailPlaceholder}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-xs font-medium text-white mb-1 sm:mb-1.5">Téléphone</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    name="phoneCC"
                    className="w-full sm:w-[120px] px-3 py-2.5 sm:py-3 rounded-xl border border-white/10 bg-white/5 text-white text-xs sm:text-sm focus:outline-none focus:border-[#99CC33] focus:ring-2 focus:ring-[#99CC33]/20 transition-all duration-200 [&>option]:text-[#1a1a2e]"
                    value={formData.phoneCC}
                    onChange={handleInputChange}
                  >
                    {phoneOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    inputMode="tel"
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-white/10 bg-white/5 text-white text-xs sm:text-sm placeholder:text-white/20 focus:outline-none focus:border-[#99CC33] focus:ring-2 focus:ring-[#99CC33]/20 transition-all duration-200"
                    placeholder={t.phonePlaceholder}
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Activité */}
              <div>
                <label className="block text-xs font-medium text-white mb-1 sm:mb-1.5">Votre activité</label>
                <textarea
                  name="activity"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-white/10 bg-white/5 text-white text-xs sm:text-sm placeholder:text-white/20 focus:outline-none focus:border-[#99CC33] focus:ring-2 focus:ring-[#99CC33]/20 transition-all duration-200 resize-y min-h-[60px] sm:min-h-[70px]"
                  placeholder={t.activityPlaceholder}
                  value={formData.activity}
                  onChange={handleInputChange}
                />
              </div>

              {/* Options */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2.5 text-xs sm:text-sm text-white/60 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-white/20 bg-white/5 accent-[#99CC33] cursor-pointer"
                    checked={formData.wantCallback}
                    onChange={(e) => handleCallbackToggle(e.target.checked)}
                  />
                  {t.callMe}
                </label>

                {showCallback && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pl-5 sm:pl-7">
                    <input
                      type="date"
                      name="callbackDate"
                      className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs sm:text-sm focus:outline-none focus:border-[#99CC33] focus:ring-2 focus:ring-[#99CC33]/20 transition-all duration-200"
                      value={formData.callbackDate}
                      onChange={handleInputChange}
                    />
                    <select
                      name="callbackSlot"
                      className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs sm:text-sm focus:outline-none focus:border-[#99CC33] focus:ring-2 focus:ring-[#99CC33]/20 transition-all duration-200 [&>option]:text-[#1a1a2e]"
                      value={formData.callbackSlot}
                      onChange={handleInputChange}
                    >
                      {slotOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                <label className="flex items-center gap-2.5 text-xs sm:text-sm text-white/60 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    name="wantBrochure"
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-white/20 bg-white/5 accent-[#99CC33] cursor-pointer"
                    checked={formData.wantBrochure}
                    onChange={handleInputChange}
                  />
                  {t.receiveBrochure}
                </label>
              </div>

              {submitError && (
                <p className="text-xs sm:text-sm text-red-400/80">{submitError}</p>
              )}

              {/* Bouton */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#99CC33] to-[#46BDD6] text-white text-xs sm:text-sm font-semibold hover:shadow-lg hover:shadow-[#99CC33]/25 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-1"
              >
                {submitting ? 'Envoi en cours...' : t.contactCta}
              </button>
            </form>
          ) : (
            <div className="text-center py-4 sm:py-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#99CC33]/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CircleCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[#99CC33]" />
              </div>
              <h3 className="font-['Bebas_Neue'] text-xl sm:text-2xl text-white mb-1">Merci !</h3>
              <p className="text-white/50 text-xs sm:text-sm">Votre demande est notée — l'équipe Coloc'KOO revient vers vous très vite.</p>
            </div>
          )}
        </div>

        {/* Coordonnées */}
        <div className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-2 mt-4 sm:mt-6 text-[10px] sm:text-xs text-[#555]">
          <span>✉️ contact@colockoo.com</span>
          <span className="hidden sm:inline text-[#d0d5c8]">•</span>
          <span>📱 +261 34 00 000 00</span>
          <span className="hidden sm:inline text-[#d0d5c8]">•</span>
          <span>🕐 Lun-Ven 8h-18h</span>
        </div>
      </div>
    </section>
  )
}

// =============================================
// DONNÉES DES SECTIONS PARTENAIRES
// =============================================
const partnerSections: PartnerSection[] = [
  {
    id: 'entreprise-generale',
    icon: <Store className="w-5 h-5 sm:w-6 sm:h-6" />,
    iconClass: 'cy',
    title: 'Entreprise générale',
    subtitle: 'De la PME à la grande entreprise, une visibilité croissante et des données d\'audience à chaque niveau.',
    tiers: [
      {
        name: 'PME · Bronze',
        icon: <Shield className="w-4 h-4 sm:w-5 sm:h-5" />,
        arg: 'Être référencé comme partenaire officiel du site et afficher son engagement RSE.',
        benefits: [
          'Logo + page « Partenaires »',
          'Présence dans 1 newsletter / an de Sarintany\'COLOC',
          'Signalétique « Partenaire engagé Sarintany\'COLOC 2026 »'
        ],
        tierClass: 'border-t-[#c8843c]'
      },
      {
        name: 'Entreprise · Argent',
        icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />,
        arg: 'Passer devant les autres PME, avec un lien direct vers votre point de vente.',
        benefits: [
          'Intègre toute l\'offre précédente, plus :',
          'Référencement prioritaire par rapport au statut précédent',
          'Implantation de votre entreprise comme point d\'intérêt sur la carte',
          'Intégration et redirection vers vos liens web'
        ],
        tierClass: 'border-t-[#9aa3ad]'
      },
      {
        name: 'Grande entreprise · Or',
        icon: <Crown className="w-4 h-4 sm:w-5 sm:h-5" />,
        arg: 'Le bon profil au bon endroit, prouvé par la donnée.',
        benefits: [
          'Intègre toute l\'offre précédente, plus :',
          'Stats annuelles globales (personas, villes attractives, zones de tension)',
          'Référencement prioritaire + présentation 3 lignes',
          'Encarts natifs dans le fil d\'annonces',
          'Retour annuel d\'audiences statistiques et visibilité',
          'Intégration du logo partenaires dans les campagnes de communication de Sarintany\'COLOC'
        ],
        tierClass: 'border-t-[#d4af37]'
      },
      {
        name: 'Grande entreprise · Platine',
        icon: <Layers className="w-4 h-4 sm:w-5 sm:h-5" />,
        arg: 'Notoriété maximale et exclusivité géographique.',
        benefits: [
          'Intègre toute l\'offre précédente, plus :',
          'Partenaire mis en avant en « ils participent le plus »',
          'Présence sur la page d\'accueil du site',
          'Intégration nationale d\'une chaîne (tous les points de vente)',
          'Mise en avant dans les campagnes de communication',
          'Reporting semestriel personnalisé',
          '1 bandeau régional exclusif compris (hors Antananarivo, région d\'Analamanga)'
        ],
        tierClass: 'border-t-[#5a8aa0]'
      }
    ]
  },
  {
    id: 'immobilier',
    icon: <Home className="w-5 h-5 sm:w-6 sm:h-6" />,
    iconClass: '',
    title: 'Immobilier',
    subtitle: 'De l\'agent indépendant au réseau national, un canal d\'acquisition rentable et des leads qualifiés.',
    tiers: [
      {
        name: 'Indépendant',
        launch: 'Gratuit au lancement',
        icon: <Target className="w-4 h-4 sm:w-5 sm:h-5" />,
        arg: 'Sans risque : 4 mois de visibilité, une seule colocation conclue rentabilise largement.',
        benefits: [
          '1 annonce à but commercial',
          'Validité 4 mois (identique à l\'offre Propriétaire)',
          'Les colocataires s\'inscrivent puis confirment'
        ],
        tierClass: 'border-t-[#99CC33]'
      },
      {
        name: 'Agence',
        launch: 'Annonces offertes',
        icon: <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />,
        arg: 'Un canal d\'acquisition rentable, leads qualifiés et statut partenaire pour votre cabinet.',
        benefits: [
          '1 compte agence + 12 annonces par an, puis tarif réduit',
          'Logo + page « Partenaires »',
          '1 newsletter par an + signalétique d\'engagement'
        ],
        tierClass: 'border-t-[#99CC33]'
      },
      {
        name: 'Réseau d\'agences',
        launch: 'Annonces offertes',
        icon: <Layers className="w-4 h-4 sm:w-5 sm:h-5" />,
        arg: 'L\'offre maximale réseau : couverture nationale et exclusivité régionale.',
        benefits: [
          'Intégration de tout le réseau (1 compte par agence)',
          'Publications illimitées',
          'Visibilité maximale : mise en avant en page d\'accueil et dans les campagnes de communication',
          '1 bandeau régional exclusif compris (hors Antananarivo, région d\'Analamanga)'
        ],
        tierClass: 'border-t-[#99CC33]'
      }
    ]
  },
  {
    id: 'institution',
    icon: <Landmark className="w-5 h-5 sm:w-6 sm:h-6" />,
    iconClass: 'cy',
    title: 'Institution publique — mécénat',
    subtitle: 'Soutenez une solution malgache d\'accès au logement, sans logique commerciale.',
    tiers: [
      {
        name: 'Mécène Argent',
        icon: <Shield className="w-4 h-4 sm:w-5 sm:h-5" />,
        arg: 'Associez votre institution à l\'émancipation des jeunes par le logement.',
        benefits: [
          'Logo + page « Partenaires » au titre de mécène',
          'Présence dans 1 newsletter / an de Sarintany\'COLOC',
          'Signalétique « Mécène engagé Sarintany\'COLOC 2026 »',
          'Visibilité équivalente au niveau Argent, sans logique commerciale'
        ],
        tierClass: 'border-t-[#46BDD6]'
      },
      {
        name: 'Mécène Or',
        icon: <Crown className="w-4 h-4 sm:w-5 sm:h-5" />,
        arg: 'Un mécénat valorisant, au plus près du développement du projet.',
        benefits: [
          'Intègre toute l\'offre précédente, plus :',
          'Référencement et présentation du mécène mis en avant',
          'Logo du mécène dans les campagnes de communication de Sarintany\'COLOC',
          'Visibilité équivalente au niveau Or'
        ],
        tierClass: 'border-t-[#46BDD6]'
      },
      {
        name: 'Mécène Platine',
        icon: <Layers className="w-4 h-4 sm:w-5 sm:h-5" />,
        arg: 'L\'engagement de mécénat le plus fort, sur mesure.',
        benefits: [
          'Intègre toute l\'offre précédente, plus :',
          'Mise en avant en page d\'accueil (« ils nous soutiennent »)',
          'Visibilité maximale, équivalente au niveau Platine',
          'Modalités définies ensemble (mécénat sur mesure)'
        ],
        tierClass: 'border-t-[#46BDD6]'
      }
    ]
  },
  {
    id: 'addon',
    icon: <Flag className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'Option · Bandeau régional exclusif',
    subtitle: 'Un bandeau exclusif pleine largeur en bas de carte, contextuel à la région affichée. Un seul partenaire par région (hors Antananarivo, région d\'Analamanga) — l\'exclusivité géographique pour sécuriser un marché entier.',
    isAddon: true,
    addonNote: '1er bandeau inclus aux niveaux Platine et Réseau Platine · jusqu\'à 5 régions au total · 22 régions réservables (hors Antananarivo, région d\'Analamanga).',
    tiers: []
  }
]

// =============================================
// COMPOSANT PRINCIPAL - FULLY RESPONSIVE
// =============================================
export default function Partenaires() {
  const { config } = useConfig()
  const [lightOn, setLightOn] = useState(false)
  const [showLightPopup, setShowLightPopup] = useState(false)

  const [currentSection, setCurrentSection] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const lastScrollRef = useRef(0)
  const transitionTimeoutRef = useRef<number | null>(null)

  const partnerVisibility = config.PARTENAIRE_VISIBILITY !== false
  const totalSections = partnerSections.length

  // EMPÊCHER LE GLISSEMENT HORIZONTAL SUR MOBILE
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'prevent-horizontal-scroll'
    style.textContent = `
      html, body, #root, .partenaires-page {
        overflow-x: hidden !important;
        max-width: 100vw !important;
        width: 100% !important;
      }
      * {
        overscroll-behavior-x: none !important;
        max-width: 100%;
        box-sizing: border-box;
      }
    `
    document.head.appendChild(style)

    document.body.style.overflowX = 'hidden'
    document.body.style.maxWidth = '100vw'

    return () => {
      const styleEl = document.getElementById('prevent-horizontal-scroll')
      if (styleEl) styleEl.remove()
      document.body.style.overflowX = ''
      document.body.style.maxWidth = ''
    }
  }, [])

  // Light mode
  useEffect(() => {
    const savedLight = localStorage.getItem('scLight')
    if (savedLight === '1') {
      setLightOn(true)
      document.body.classList.add('low-data')
    }
    const hidePopup = localStorage.getItem('scLightPopHide')
    if (!lightOn && !hidePopup) {
      const timer = setTimeout(() => {
        setShowLightPopup(true)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleEnableLight = () => {
    setLightOn(true)
    localStorage.setItem('scLight', '1')
    document.body.classList.add('low-data')
    setShowLightPopup(false)
  }

  const handleCloseLightPopup = () => {
    setShowLightPopup(false)
  }

  const handleDontRemind = (checked: boolean) => {
    if (checked) {
      localStorage.setItem('scLightPopHide', '1')
    }
  }

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToStatuts = () => {
    document.getElementById('statuts')?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (lightOn) {
      document.body.classList.add('low-data')
    } else {
      document.body.classList.remove('low-data')
    }
  }, [lightOn])

  // Navigation
  const goToNext = () => {
    if (isTransitioning) return
    if (currentSection < totalSections - 1) {
      setCurrentSection(prev => prev + 1)
      setIsTransitioning(true)
    }
  }

  const goToPrev = () => {
    if (isTransitioning) return
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1)
      setIsTransitioning(true)
    }
  }

  useEffect(() => {
    if (isTransitioning) {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false)
      }, 600)
    }

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [isTransitioning])

  if (!partnerVisibility) {
    return (
      <SiteLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <h1 className="font-['Bebas_Neue'] text-3xl sm:text-4xl">Page partenaires indisponible</h1>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base">
            Cette fonctionnalité est actuellement désactivée par la configuration globale. Revenez plus tard.
          </p>
          <Link to="/">
            <Button className="mt-6 sm:mt-8 bg-[#46BDD6] hover:bg-[#3aadca] text-white">Retour à l'accueil</Button>
          </Link>
        </div>
      </SiteLayout>
    )
  }

  const currentSectionData = partnerSections[currentSection]
  const isFirst = currentSection === 0
  const isLast = currentSection === totalSections - 1

  return (
    <SiteLayout>
      <div className="partenaires-page bg-[#f5f7f2] min-h-screen font-sans text-[#2C2C2C]">
        <Hero 
          onContactClick={scrollToContact}
          onStatutsClick={scrollToStatuts}
        />

        <WhySection />

        {/* Statuts Section - CARROUSEL */}
        <section className="py-4 px-4 sm:px-6" id="statuts">
          <div className="max-w-[1120px] mx-auto">
        <div className="flex justify-center mb-2">
          <h2 className="font-['Bebas_Neue'] text-2xl sm:text-3xl md:text-4xl text-[#2C2C2C] text-center">
            {t.statutsTitle}
          </h2>
        </div>
            <p className="text-xs sm:text-sm md:text-base text-[#666] leading-relaxed max-w-3xl mx-auto mb-4 sm:mb-6 text-center">
              {t.statutsSub}
            </p>

            {/* CARROUSEL */}
            <div className="relative">
              {/* Dots */}
              <div className="flex justify-center gap-1.5 mb-3 sm:mb-4">
                {partnerSections.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      idx === currentSection 
                        ? 'w-6 sm:w-8 bg-[#99CC33]' 
                        : 'w-1.5 bg-[#d0d5c8]'
                    }`}
                  />
                ))}
              </div>

              {/* Section courante */}
              <div
                key={currentSection}
                className="animate-[fadeSlideUp_0.6s_ease]"
              >
                <PartnerSectionComponent section={currentSectionData} />
              </div>

              {/* Boutons de navigation */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 mt-4 sm:mt-6">
                <button
                  onClick={goToPrev}
                  disabled={isFirst || isTransitioning}
                  className={`
                    w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl
                    bg-white border border-[#e8e8e8]
                    text-xs sm:text-sm font-medium text-[#555]
                    transition-all duration-200
                    ${!isFirst && !isTransitioning 
                      ? 'hover:border-[#99CC33] hover:text-[#99CC33] hover:shadow-md' 
                      : 'opacity-40 cursor-not-allowed'
                    }
                  `}
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Précédent</span>
                </button>

                <span className="text-xs sm:text-sm text-[#888] font-medium order-first sm:order-none">
                  {currentSection + 1} / {totalSections}
                </span>

                <button
                  onClick={goToNext}
                  disabled={isLast || isTransitioning}
                  className={`
                    w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl
                    bg-white border border-[#e8e8e8]
                    text-xs sm:text-sm font-medium text-[#555]
                    transition-all duration-200
                    ${!isLast && !isTransitioning 
                      ? 'hover:border-[#99CC33] hover:text-[#99CC33] hover:shadow-md' 
                      : 'opacity-40 cursor-not-allowed'
                    }
                  `}
                >
                  <span className="hidden sm:inline">Suivant</span>
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Barre de progression */}
              <div className="w-full h-1 rounded-full bg-[#e0e5da] overflow-hidden mt-3 sm:mt-4">
                <div 
                  className="h-full bg-[#99CC33] rounded-full transition-all duration-700"
                  style={{ width: `${((currentSection + 1) / totalSections) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <ContactSection />

        {/* Light Mode Popup */}
        {showLightPopup && (
          <div className="fixed inset-0 bg-black/45 z-[100000] flex items-center justify-center p-4 sm:p-5 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl max-w-[320px] sm:max-w-[360px] w-full px-4 sm:px-6 py-6 sm:py-8 text-center shadow-2xl">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#F4F8E8] flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Feather className="w-6 h-6 sm:w-7 sm:h-7 text-[#99CC33]" />
              </div>
              <h3 className="font-['Bebas_Neue'] text-xl sm:text-2xl text-[#2C2C2C] mb-2">{t.lightpopH}</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-[#666] mb-5 sm:mb-6">{t.lightpopP}</p>
              <div className="flex flex-col gap-2.5">
                <button 
                  className="px-4 py-2.5 sm:py-3 rounded-xl border-none bg-[#99CC33] text-white text-xs sm:text-sm font-semibold hover:bg-[#88bb2e] transition-colors duration-200" 
                  onClick={handleEnableLight}
                >
                  {t.lightpopYes}
                </button>
                <button 
                  className="px-4 py-2.5 sm:py-3 rounded-xl border border-[#e8e8e8] bg-transparent text-[#666] text-xs sm:text-sm font-semibold hover:bg-[#f5f5f5] transition-colors duration-200" 
                  onClick={handleCloseLightPopup}
                >
                  {t.lightpopNo}
                </button>
              </div>
              <label className="flex items-center justify-center gap-2 mt-4 text-[10px] sm:text-xs text-[#999] cursor-pointer">
                <input 
                  type="checkbox" 
                  className="accent-[#99CC33] cursor-pointer" 
                  onChange={(e) => handleDontRemind(e.target.checked)} 
                />
                <span>{t.lightpopRemind}</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  )
}