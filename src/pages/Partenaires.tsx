// pages/Partenaires.tsx
import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  Building2, Check, Send, Gift, Handshake, ListChecks, 
  Lightbulb, Users, HeartHandshake, MapPin, ChartNoAxesCombined, 
  Rocket, Award, Store, Home, Landmark, Flag, ArrowUpRight, 
  Feather, CircleCheck, Sparkles, TrendingUp, Shield, 
  Zap, Crown, Briefcase, Target, Layers, Eye, BarChart3,
  ChevronRight, Star, UserCheck, Clock, Phone, Mail,
  ExternalLink, ThumbsUp, Compass, Globe, Megaphone,
  Play, PlayCircle, ArrowRightCircle, Quote, BriefcaseBusiness,
  Building, LandPlot, HandCoins, BadgeCheck, ArrowRight
} from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { Button } from '../components/ui/Button'
import { api } from '../lib/api'
import { useConfig } from '../lib/config'
import { motion, AnimatePresence } from 'framer-motion'

// Images d'arrière-plan (Unsplash)
const heroBgImage = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1920&q=80'
const cityBgImage = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1920&q=80'
const teamBgImage = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80'
const officeBgImage = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80'
const partnersBgImage = 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?auto=format&fit=crop&w=1920&q=80'

// Types
interface PartnerTier {
  name: string
  launch?: string
  arg: string
  benefits: string[]
  tierClass: string
  icon?: React.ReactNode
  popular?: boolean
  price?: string
  amount?: string
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
  bgImage?: string
}

interface WhyCard {
  icon: React.ReactNode
  title: string
  desc: string
  stat?: string
}

// Données i18n
const t = {
  heroBadge: "Lancement 2026",
  heroTitle: "Devenez partenaire",
  heroDesc: "Associez votre marque à une solution malgache d'accès au logement et touchez une audience jeune, urbaine et active.",
  heroCta: "Devenir partenaire",
  heroCta2: "Voir les offres",
  whyTitle: "Pourquoi devenir partenaire ?",
  whySub: "Sarintany'COLOC est le site de référence de la colocation à Madagascar.",
  statutsTitle: "Nos offres partenaires",
  statutsSub: "Quatre familles de partenaires, chacune avec ses niveaux et ses avantages cumulatifs.",
  contactH: "Prêt à rejoindre l'aventure ?",
  contactP: "Dites-nous qui vous êtes : nous vous orientons vers le statut le plus adapté.",
  contactCta: "Nous contacter",
  launchTxt: "Lancement 2026 : de nombreux statuts sont offerts ou inclus pour les premiers partenaires.",
  // Benefits mapping...
  b1: "Logo + page « Partenaires »",
  b2: "Présence dans 1 newsletter / an",
  b3: "Signalétique « Partenaire engagé 2026 »",
  b4: "Intègre toute l'offre précédente, plus :",
  b5: "Référencement prioritaire",
  b6: "Point d'intérêt sur la carte",
  b7: "Redirection vers vos liens web",
  b8: "Stats annuelles globales",
  b9: "Référencement prioritaire + présentation 3 lignes",
  b10: "Encarts natifs dans le fil d'annonces",
  b11: "Retour annuel d'audiences statistiques",
  b12: "Logo intégré aux campagnes de communication",
  b13: "Partenaire mis en avant",
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
  lightpopP: "Connexion lente ou data limitée ?",
  lightpopYes: "Activer le mode allégé",
  lightpopNo: "Continuer normalement",
  lightpopRemind: "Ne plus me le rappeler",
}

// Composant Hero
const Hero: React.FC<{ onContactClick: () => void; onStatutsClick: () => void }> = ({ 
  onContactClick, onStatutsClick 
}) => {
  return (
    <div 
      className="relative overflow-hidden min-h-[80vh] flex items-center"
    >
      {/* Image de fond */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${heroBgImage})`,
          backgroundPosition: 'center 30%'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628]/90 via-[#1a2a4a]/80 to-[#2a4a7a]/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      
      <div className="relative z-10 max-w-[1120px] mx-auto px-6 py-20 text-white w-full">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#99CC33]/20 backdrop-blur-sm border border-[#99CC33]/30 text-[#99CC33] text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <Gift className="w-3.5 h-3.5" />
            <span>{t.heroBadge}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] text-white mb-4">
            {t.heroTitle}
          </h1>
          
          <p className="text-base md:text-lg text-white/80 leading-relaxed max-w-xl mb-8">
            {t.heroDesc}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onContactClick}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#99CC33] text-white text-sm font-semibold hover:bg-[#88bb2e] transition-all duration-200 shadow-lg shadow-[#99CC33]/25"
            >
              {t.heroCta} <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={onStatutsClick}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-all duration-200"
            >
              {t.heroCta2}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Composant Why Section
const WhySection: React.FC = () => {
  const cards: WhyCard[] = [
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Audience ciblée',
      desc: 'Étudiants, jeunes actifs et familles : une audience jeune, urbaine et active.',
      stat: '15k+'
    },
    {
      icon: <HeartHandshake className="w-5 h-5" />,
      title: 'Engagement RSE',
      desc: 'Affichez la signalétique « Partenaire engagé » et associez votre image au logement.',
      stat: '100%'
    },
    {
      icon: <Compass className="w-5 h-5" />,
      title: 'Visibilité maximale',
      desc: 'Votre logo et votre page partenaire visibles par tous les visiteurs.',
      stat: '50k+'
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Données exclusives',
      desc: 'Stats de fréquentation, personas, villes attractives et zones de tension.',
      stat: '365j'
    }
  ]

  return (
    <section className="py-20 md:py-28 px-6 bg-[#f8faf8]">
      <div className="max-w-[1120px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#2C2C2C]">{t.whyTitle}</h2>
          <p className="text-[#666] mt-2 max-w-2xl mx-auto">{t.whySub}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl p-6 text-center border border-[#e8e8e8] hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-full bg-[#F4F8E8] flex items-center justify-center mx-auto mb-4">
                <span className="text-[#99CC33]">{card.icon}</span>
              </div>
              <div className="text-2xl font-bold text-[#2C2C2C]">{card.stat}</div>
              <h3 className="text-sm font-semibold text-[#2C2C2C] mt-1">{card.title}</h3>
              <p className="text-xs text-[#666] mt-1 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-[#F4F8E8] border border-[#99CC33]/30 rounded-2xl px-6 py-5 flex items-center gap-4">
          <Rocket className="w-6 h-6 text-[#99CC33] flex-shrink-0" />
          <p className="text-sm text-[#4d6b1a] leading-relaxed">{t.launchTxt}</p>
        </div>
      </div>
    </section>
  )
}

// Composant Tier Card
const TierCard: React.FC<{ tier: PartnerTier; index: number }> = ({ tier, index }) => {
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

  const getTierColor = (tierClass: string) => {
    if (tierClass.includes('bronze')) return 'border-t-[#c8843c]'
    if (tierClass.includes('argent')) return 'border-t-[#9aa3ad]'
    if (tierClass.includes('or')) return 'border-t-[#d4af37]'
    if (tierClass.includes('platine')) return 'border-t-[#5a8aa0]'
    if (tierClass.includes('green')) return 'border-t-[#99CC33]'
    if (tierClass.includes('cy')) return 'border-t-[#46BDD6]'
    return 'border-t-[#e8e8e8]'
  }

  const getTierBadge = (tierClass: string) => {
    if (tierClass.includes('bronze')) return '🥉'
    if (tierClass.includes('argent')) return '🥈'
    if (tierClass.includes('or')) return '🥇'
    if (tierClass.includes('platine')) return '💎'
    if (tierClass.includes('green')) return '🌿'
    if (tierClass.includes('cy')) return '🔷'
    return '⭐'
  }

  return (
    <div className={`group bg-white border border-[#e8e8e8] rounded-2xl p-6 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-t-4 ${getTierColor(tier.tierClass)} relative`}>
      {tier.popular && (
        <div className="absolute top-3 right-3 bg-[#99CC33] text-white text-[10px] font-bold px-3 py-1 rounded-full">
          <Star className="w-3 h-3 inline mr-1 fill-white" />
          Populaire
        </div>
      )}
      
      <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{getTierBadge(tier.tierClass)}</span>
          <span className="text-xl font-bold text-[#2C2C2C]">{tier.name}</span>
        </div>
        {tier.launch && (
          <span className="text-[10px] font-bold text-[#99CC33] bg-[#F4F8E8] border border-[#99CC33]/40 rounded-full px-3 py-1 whitespace-nowrap">
            {tier.launch}
          </span>
        )}
      </div>
      
      <p className="text-sm text-[#46BDD6] leading-relaxed my-2 mb-4">{tier.arg}</p>
      
      <ul className="list-none flex flex-col gap-2 p-0 m-0 flex-1">
        {benefits.map((b, idx) => (
          <li 
            key={idx} 
            className={`text-sm leading-relaxed flex gap-2.5 items-start ${b.isHead ? 'font-semibold text-[#2C2C2C]' : 'text-[#555]'}`}
          >
            <span className={`flex-shrink-0 mt-0.5 ${b.isHead ? 'text-[#46BDD6]' : 'text-[#99CC33]'}`}>
              {b.isHead ? <ArrowUpRight className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            </span>
            <span>{b.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Composant Section Partenaire
const PartnerSectionComponent: React.FC<{ section: PartnerSection }> = ({ section }) => {
  const isCyan = section.iconClass === 'cy'

  if (section.isAddon) {
    return (
      <div className="bg-white border-2 border-[#46BDD6] rounded-2xl p-6 flex gap-5 items-start transition-all duration-300 hover:shadow-lg">
        <div className="w-14 h-14 rounded-full bg-[#E8F7FA] flex items-center justify-center flex-shrink-0">
          <span className="text-[#46BDD6]">{section.icon}</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#2C2C2C]">{section.title}</h3>
          <p className="text-sm text-[#555] leading-relaxed mt-1">{section.subtitle}</p>
          {section.addonNote && (
            <p className="text-xs text-[#888] mt-3 pt-3 border-t border-[#46BDD6]/30">{section.addonNote}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#e8e8e8] rounded-2xl p-6 md:p-8 mb-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-start gap-4 mb-6 pb-6 border-b border-[#e8e8e8]">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isCyan ? 'bg-[#E8F7FA]' : 'bg-[#F4F8E8]'}`}>
          <span className={isCyan ? 'text-[#46BDD6]' : 'text-[#99CC33]'}>{section.icon}</span>
        </div>
        <div>
          <h3 className={`text-2xl font-bold ${isCyan ? 'text-[#46BDD6]' : 'text-[#99CC33]'}`}>
            {section.title}
          </h3>
          <p className="text-sm text-[#666] leading-relaxed">{section.subtitle}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
        {section.tiers.map((tier, idx) => (
          <TierCard key={idx} tier={tier} index={idx} />
        ))}
      </div>
    </div>
  )
}

// Composant Contact
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
      setSubmitError(error instanceof Error ? error.message : 'Impossible d’envoyer votre demande.')
    } finally {
      setSubmitting(false)
    }
  }

  const phoneOptions = [
    { value: '+261', label: '+261 (Madagascar)' },
    { value: '+33', label: '+33 (France)' },
    { value: '+262', label: '+262 (Réunion)' },
    { value: '+230', label: '+230 (Maurice)' },
    { value: '+269', label: '+269 (Comores)' },
  ]

  const slotOptions = [
    { value: '', label: t.slotPlaceholder },
    { value: 'morning', label: t.slotMorning },
    { value: 'early_afternoon', label: t.slotEarlyAfternoon },
    { value: 'late_afternoon', label: t.slotLateAfternoon },
  ]

  return (
    <section className="relative py-20 md:py-28 px-6 overflow-hidden" id="contact">
      {/* Image de fond */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${officeBgImage})`,
          backgroundPosition: 'center center'
        }}
      />
      <div className="absolute inset-0 bg-[#0a1628]/85" />
      
      <div className="relative z-10 max-w-[1120px] mx-auto">
        <div className="text-center text-white mb-10">
          <h2 className="text-3xl md:text-4xl font-bold">{t.contactH}</h2>
          <p className="text-white/70 mt-2">{t.contactP}</p>
        </div>

        <div className="max-w-lg mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          {!showOk ? (
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  name="name"
                  className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#99CC33] transition-all"
                  placeholder={t.namePlaceholder}
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#99CC33] transition-all"
                  placeholder={t.emailPlaceholder}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="flex gap-2.5">
                <select
                  name="phoneCC"
                  className="flex-shrink-0 min-w-[130px] px-3 py-3 rounded-xl border border-white/15 bg-white/5 text-white text-sm focus:outline-none focus:border-[#99CC33] transition-all [&>option]:text-[#2C2C2C]"
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
                  className="flex-1 min-w-[120px] px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#99CC33] transition-all"
                  placeholder={t.phonePlaceholder}
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <textarea
                name="activity"
                className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#99CC33] transition-all resize-y min-h-[80px]"
                placeholder={t.activityPlaceholder}
                value={formData.activity}
                onChange={handleInputChange}
              />

              <label className="flex items-center gap-2.5 text-sm text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#99CC33] cursor-pointer"
                  checked={formData.wantCallback}
                  onChange={(e) => handleCallbackToggle(e.target.checked)}
                />
                {t.callMe}
              </label>

              {showCallback && (
                <div className="flex gap-2.5 flex-wrap">
                  <input
                    type="date"
                    name="callbackDate"
                    className="flex-1 min-w-[140px] px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white text-sm focus:outline-none focus:border-[#99CC33] transition-all"
                    value={formData.callbackDate}
                    onChange={handleInputChange}
                  />
                  <select
                    name="callbackSlot"
                    className="flex-1 min-w-[140px] px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white text-sm focus:outline-none focus:border-[#99CC33] transition-all [&>option]:text-[#2C2C2C]"
                    value={formData.callbackSlot}
                    onChange={handleInputChange}
                  >
                    {slotOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <label className="flex items-center gap-2.5 text-sm text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  name="wantBrochure"
                  className="w-4 h-4 accent-[#99CC33] cursor-pointer"
                  checked={formData.wantBrochure}
                  onChange={handleInputChange}
                />
                {t.receiveBrochure}
              </label>

              {submitError && (
                <p className="text-sm text-red-300">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#99CC33] text-white text-sm font-semibold hover:bg-[#88bb2e] transition-all duration-200 mt-1 disabled:opacity-70"
              >
                <Send className="w-4 h-4" /> {submitting ? 'Envoi...' : t.contactCta}
              </button>
            </form>
          ) : (
            <div className="bg-[#F4F8E8] text-[#3d5614] rounded-xl p-4 text-sm font-semibold text-center">
              <CircleCheck className="w-5 h-5 inline mr-2 text-[#99CC33]" />
              Merci ! L'équipe revient vers vous très vite.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// Données des sections partenaires
const partnerSections: PartnerSection[] = [
  {
    id: 'entreprise-generale',
    icon: <Store className="w-6 h-6" />,
    iconClass: 'cy',
    title: 'Entreprise générale',
    subtitle: 'De la PME à la grande entreprise, une visibilité croissante.',
    tiers: [
      {
        name: 'PME · Bronze',
        arg: 'Être référencé comme partenaire officiel du site.',
        benefits: [
          'Logo + page « Partenaires »',
          'Présence dans 1 newsletter / an',
          'Signalétique « Partenaire engagé 2026 »'
        ],
        tierClass: 'border-t-[#c8843c]'
      },
      {
        name: 'Entreprise · Argent',
        arg: 'Visibilité renforcée avec référencement prioritaire.',
        benefits: [
          'Intègre toute l\'offre précédente, plus :',
          'Référencement prioritaire',
          'Point d\'intérêt sur la carte',
          'Redirection vers vos liens web'
        ],
        tierClass: 'border-t-[#9aa3ad]',
        popular: true
      },
      {
        name: 'Grande entreprise · Or',
        arg: 'Le bon profil au bon endroit, prouvé par la donnée.',
        benefits: [
          'Intègre toute l\'offre précédente, plus :',
          'Stats annuelles globales',
          'Référencement prioritaire + présentation 3 lignes',
          'Encarts natifs dans le fil d\'annonces',
          'Retour annuel d\'audiences statistiques',
          'Logo intégré aux campagnes de communication'
        ],
        tierClass: 'border-t-[#d4af37]'
      },
      {
        name: 'Grande entreprise · Platine',
        arg: 'Notoriété maximale et exclusivité géographique.',
        benefits: [
          'Intègre toute l\'offre précédente, plus :',
          'Partenaire mis en avant',
          'Présence sur la page d\'accueil',
          'Intégration nationale d\'une chaîne',
          'Mise en avant dans les campagnes',
          'Reporting semestriel personnalisé',
          '1 bandeau régional exclusif compris'
        ],
        tierClass: 'border-t-[#5a8aa0]'
      }
    ]
  },
  {
    id: 'immobilier',
    icon: <Home className="w-6 h-6" />,
    iconClass: '',
    title: 'Immobilier',
    subtitle: 'De l\'agent indépendant au réseau national.',
    tiers: [
      {
        name: 'Indépendant',
        launch: 'Gratuit',
        arg: 'Sans risque : 4 mois de visibilité.',
        benefits: [
          '1 annonce à but commercial',
          'Validité 4 mois',
          'Les colocataires s\'inscrivent puis confirment'
        ],
        tierClass: 'border-t-[#99CC33]'
      },
      {
        name: 'Agence',
        launch: 'Offert',
        arg: 'Un canal d\'acquisition rentable.',
        benefits: [
          '1 compte agence + 12 annonces/an',
          'Logo + page « Partenaires »',
          '1 newsletter par an + signalétique'
        ],
        tierClass: 'border-t-[#99CC33]',
        popular: true
      },
      {
        name: 'Réseau d\'agences',
        launch: 'Offert',
        arg: 'L\'offre maximale réseau.',
        benefits: [
          'Intégration de tout le réseau',
          'Publications illimitées',
          'Visibilité maximale en page d\'accueil',
          '1 bandeau régional exclusif compris'
        ],
        tierClass: 'border-t-[#99CC33]'
      }
    ]
  },
  {
    id: 'institution',
    icon: <Landmark className="w-6 h-6" />,
    iconClass: 'cy',
    title: 'Institution publique — mécénat',
    subtitle: 'Soutenez une solution malgache d\'accès au logement.',
    tiers: [
      {
        name: 'Mécène Argent',
        arg: 'Associez votre institution à l\'émancipation des jeunes.',
        benefits: [
          'Logo + page « Partenaires » mécène',
          'Présence dans 1 newsletter / an',
          'Signalétique « Mécène engagé 2026 »',
          'Visibilité équivalente au niveau Argent'
        ],
        tierClass: 'border-t-[#46BDD6]'
      },
      {
        name: 'Mécène Or',
        arg: 'Un mécénat valorisant.',
        benefits: [
          'Intègre toute l\'offre précédente, plus :',
          'Référencement et présentation du mécène',
          'Logo du mécène dans les campagnes',
          'Visibilité équivalente au niveau Or'
        ],
        tierClass: 'border-t-[#46BDD6]',
        popular: true
      },
      {
        name: 'Mécène Platine',
        arg: 'L\'engagement de mécénat le plus fort.',
        benefits: [
          'Intègre toute l\'offre précédente, plus :',
          'Mise en avant en page d\'accueil',
          'Visibilité maximale équivalente Platine',
          'Modalités définies ensemble'
        ],
        tierClass: 'border-t-[#46BDD6]'
      }
    ]
  },
  {
    id: 'addon',
    icon: <Flag className="w-6 h-6" />,
    title: 'Option · Bandeau régional exclusif',
    subtitle: 'Un bandeau exclusif pleine largeur en bas de carte, contextuel à la région affichée.',
    isAddon: true,
    addonNote: '1er bandeau inclus aux niveaux Platine et Réseau Platine · jusqu\'à 5 régions au total.',
    tiers: []
  }
]

// Composant principal
export default function Partenaires() {
  const { config } = useConfig()
  const [lightOn, setLightOn] = useState(false)
  const [showLightPopup, setShowLightPopup] = useState(false)

  const partnerVisibility = config.PARTENAIRE_VISIBILITY !== false

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

  if (!partnerVisibility) {
    return (
      <SiteLayout>
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl font-bold">Page partenaires indisponible</h1>
          <p className="mt-4 text-muted-foreground">
            Cette fonctionnalité est actuellement désactivée.
          </p>
          <Link to="/">
            <Button className="mt-8 bg-[#46BDD6] text-white">Retour à l'accueil</Button>
          </Link>
        </div>
      </SiteLayout>
    )
  }

  return (
    <SiteLayout>
      <div className="partenaires-page min-h-screen font-sans text-[#2C2C2C]">
        {/* Hero */}
        <Hero 
          onContactClick={scrollToContact}
          onStatutsClick={scrollToStatuts}
        />

        {/* Why Section */}
        <WhySection />

        {/* Statuts Section */}
        <section className="py-12 px-6 bg-[#f8faf8]" id="statuts">
          <div className="max-w-[1120px] mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-[#2C2C2C]">{t.statutsTitle}</h2>
              <p className="text-[#666] mt-2 max-w-2xl mx-auto">{t.statutsSub}</p>
            </div>

            {partnerSections.map((section, idx) => (
              <PartnerSectionComponent key={idx} section={section} />
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <ContactSection />

        {/* Light Mode Popup */}
        {showLightPopup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100000] flex items-center justify-center p-5">
            <div className="bg-white rounded-2xl max-w-[380px] w-full px-6 py-8 text-center shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-[#F4F8E8] flex items-center justify-center mx-auto mb-4">
                <Feather className="w-7 h-7 text-[#99CC33]" />
              </div>
              <h3 className="text-2xl font-bold text-[#2C2C2C] mb-2">{t.lightpopH}</h3>
              <p className="text-sm text-[#666] mb-6">{t.lightpopP}</p>
              <div className="flex flex-col gap-2.5">
                <button 
                  className="px-4 py-3 rounded-full bg-[#99CC33] text-white text-sm font-semibold hover:bg-[#88bb2e] transition-all" 
                  onClick={handleEnableLight}
                >
                  {t.lightpopYes}
                </button>
                <button 
                  className="px-4 py-3 rounded-full border border-[#e8e8e8] text-[#666] text-sm font-semibold hover:bg-[#f5f5f5] transition-all" 
                  onClick={handleCloseLightPopup}
                >
                  {t.lightpopNo}
                </button>
              </div>
              <label className="flex items-center justify-center gap-2 mt-4 text-xs text-[#999] cursor-pointer">
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