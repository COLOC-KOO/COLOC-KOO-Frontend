// pages/Partenaires.tsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Building2, Check, Send, Gift, Handshake, ListChecks, 
  Lightbulb, Users, HeartHandshake, MapPin, ChartNoAxesCombined, 
  Rocket, Award, Store, Home, Landmark, Flag, ArrowUpRight, 
  Feather, CircleCheck, Sparkles, TrendingUp, Shield, 
  Zap, Crown, Briefcase, Target, Layers, Eye, BarChart3
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
  heroBadge: "Offres offertes ou incluses au lancement 2026",
  heroTitle: "Devenez partenaire",
  heroDesc: "Associez votre marque à une solution malgache d'accès au logement et touchez une audience jeune, urbaine et active. Du statut indépendant aux grandes entreprises et réseaux immobiliers, il existe un statut adapté à chaque structure.",
  heroMission: "« Habiter autrement pour étudier, travailler et s'émanciper »",
  heroCta: "Je veux devenir partenaire",
  heroCta2: "Voir les statuts",
  whyTitle: "Pourquoi devenir partenaire ?",
  whySub: "Sarintany'COLOC est le site de référence de la colocation à Madagascar. Y figurer, c'est gagner en visibilité tout en affirmant un engagement concret pour le logement des jeunes et des moyens jeunes.",
  whyReasons: "4 raisons de devenir partenaire",
  launchTxt: "Lancement 2026 : de nombreux statuts sont offerts ou inclus pour les premiers partenaires. Les conditions tarifaires détaillées sont communiquées sur demande — contactez-nous.",
  statutsTitle: "Les statuts partenaires",
  statutsSub: "Quatre familles de partenaires, chacune avec ses niveaux et ses avantages cumulatifs. Choisissez le statut qui correspond à votre structure.",
  secEnt: "Entreprise générale",
  secImmo: "Immobilier",
  secInst: "Institution publique — mécénat",
  secAddon: "Option · Bandeau régional exclusif",
  contactH: "Prêt à rejoindre Sarintany'COLOC ?",
  contactP: "Dites-nous qui vous êtes : nous vous orientons vers le statut le plus adapté et vous communiquons les conditions de lancement.",
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

// Composant Hero
const Hero: React.FC<{ onContactClick: () => void; onStatutsClick: () => void }> = ({ 
  onContactClick, onStatutsClick 
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#1a365d] via-[#21436b] to-[#2a5298] border-b border-border">
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(16,28,54,0.85)] via-[rgba(16,28,54,0.55)] to-[rgba(16,28,54,0.40)]"></div>
      <div className="absolute inset-0 opacity-[0.08]" 
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #99CC33 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      <div className="relative z-10 max-w-[1120px] mx-auto px-6 py-16 md:py-20 lg:py-24 text-white">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-[#99CC33]/40 text-[#99CC33] text-xs font-semibold px-4 py-1.5 rounded-full">
            <Gift className="w-3.5 h-3.5" />
            <span>{t.heroBadge}</span>
          </div>
          <p className="font-['Bebas_Neue'] text-3xl md:text-4xl lg:text-5xl leading-[1.05] text-white/90 mt-4 max-w-3xl mx-auto">
            {t.heroMission}
          </p>
        </div>
        <h1 className="font-['Bebas_Neue'] text-4xl md:text-5xl lg:text-6xl leading-[1.02] text-white text-center mb-4">
          {t.heroTitle}
        </h1>
        <p className="text-base md:text-lg text-white/85 leading-relaxed max-w-2xl mx-auto text-center mb-8">
          {t.heroDesc}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={onContactClick}
            className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 rounded-xl bg-[#99CC33] text-white text-sm md:text-base font-semibold hover:bg-[#88bb2e] transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-[#99CC33]/25"
          >
            <Handshake className="w-4 h-4 md:w-5 md:h-5" /> {t.heroCta}
          </button>
          <button 
            onClick={onStatutsClick}
            className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 rounded-xl border-2 border-[#46BDD6] bg-white/10 backdrop-blur-sm text-white text-sm md:text-base font-semibold hover:bg-[#46BDD6]/20 transition-all duration-200"
          >
            <ListChecks className="w-4 h-4 md:w-5 md:h-5" /> {t.heroCta2}
          </button>
        </div>
      </div>
    </div>
  )
}

// Composant Pourquoi
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
    <section className="py-12 md:py-16 px-6">
      <div className="max-w-[1120px] mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#F4F8E8] flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-[#99CC33]" />
          </div>
          <h2 className="font-['Bebas_Neue'] text-3xl md:text-4xl text-[#2C2C2C]">{t.whyTitle}</h2>
        </div>
        <p className="text-sm md:text-base text-[#666] leading-relaxed max-w-3xl ml-0 md:ml-13 mb-6">
          {t.whySub}
        </p>
        <p className="font-['Bebas_Neue'] text-2xl md:text-3xl text-[#99CC33] text-center my-2 mb-6">
          {t.whyReasons}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, idx) => (
            <div 
              key={idx} 
              className={`group bg-white border border-[#e8e8e8] rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
                card.color === 'cyan' ? 'hover:border-[#46BDD6]' : 'hover:border-[#99CC33]'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-200 group-hover:scale-110 ${
                card.color === 'cyan' ? 'bg-[#E8F7FA]' : 'bg-[#F4F8E8]'
              }`}>
                <span className={card.color === 'cyan' ? 'text-[#46BDD6]' : 'text-[#99CC33]'}>
                  {card.icon}
                </span>
              </div>
              <h3 className="text-base font-semibold text-[#2C2C2C] mb-2">{card.title}</h3>
              <p className="text-sm text-[#666] leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-[#F4F8E8] border border-dashed border-[#99CC33]/60 rounded-2xl px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#99CC33]/20 flex items-center justify-center flex-shrink-0">
            <Rocket className="w-5 h-5 text-[#99CC33]" />
          </div>
          <p className="text-sm md:text-base text-[#4d6b1a] leading-relaxed">{t.launchTxt}</p>
        </div>
      </div>
    </section>
  )
}

// Composant Tier Card
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

  // Couleur de bordure pour le badge
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
    <div className={`group bg-white border border-[#e8e8e8] rounded-2xl p-5 flex flex-col transition-all duration-200 hover:shadow-xl hover:-translate-y-1 border-t-[4px] ${tier.tierClass}`}>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
        <div className="flex items-center gap-2.5">
          {tier.icon && (
            <span className="text-[#99CC33]">{tier.icon}</span>
          )}
          <span className="font-['Bebas_Neue'] text-xl md:text-2xl text-[#2C2C2C]">{tier.name}</span>
        </div>
        {tier.launch && (
          <span className={`text-[10px] font-bold text-[#5a7a1a] bg-[#F4F8E8] border ${getBadgeColor(tier.tierClass)} rounded-full px-3 py-1 whitespace-nowrap`}>
            {tier.launch}
          </span>
        )}
      </div>
      <p className="text-sm text-[#46BDD6] italic leading-relaxed my-2 mb-3">{tier.arg}</p>
      <ul className="list-none flex flex-col gap-2 p-0 m-0 flex-1">
        {benefits.map((b, idx) => (
          <li key={idx} className={`text-sm leading-relaxed flex gap-2.5 items-start ${b.isHead ? 'font-semibold text-[#2C2C2C]' : 'text-[#555]'}`}>
            <span className={`flex-shrink-0 mt-0.5 ${b.isHead ? 'text-[#999]' : 'text-[#99CC33]'}`}>
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
  const gridClass = section.tiers.length === 2 ? 'grid-cols-1 md:grid-cols-2' : ''
  const isCyan = section.iconClass === 'cy'

  if (section.isAddon) {
    return (
      <div className="group bg-gradient-to-br from-white via-[#E8F7FA] to-[#E8F7FA]/50 border-2 border-[#46BDD6] rounded-2xl p-6 flex gap-5 items-start transition-all duration-200 hover:shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#46BDD6] flex items-center justify-center flex-shrink-0 text-2xl shadow-sm">
          <span className="text-[#46BDD6]">{section.icon}</span>
        </div>
        <div>
          <h3 className="font-['Bebas_Neue'] text-2xl md:text-3xl text-[#2C2C2C]">{section.title}</h3>
          <p className="text-sm md:text-base text-[#555] leading-relaxed mt-1.5">{section.subtitle}</p>
          {section.addonNote && (
            <p className="text-xs md:text-sm text-[#888] mt-2 border-t border-[#46BDD6]/30 pt-3">{section.addonNote}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#e8e8e8] rounded-2xl p-5 md:p-6 mb-5 transition-all duration-200 hover:shadow-lg">
      <div className="flex items-start gap-4 mb-5 pb-5 border-b border-[#e8e8e8]">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${isCyan ? 'bg-[#E8F7FA]' : 'bg-[#F4F8E8]'}`}>
          <span className={isCyan ? 'text-[#46BDD6]' : 'text-[#99CC33]'}>{section.icon}</span>
        </div>
        <div>
          <h3 className={`font-['Bebas_Neue'] text-2xl md:text-3xl leading-tight ${isCyan ? 'text-[#46BDD6]' : 'text-[#99CC33]'}`}>
            {section.title}
          </h3>
          <p className="text-sm md:text-base text-[#666] leading-relaxed mt-0.5">{section.subtitle}</p>
        </div>
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 ${gridClass}`}>
        {section.tiers.map((tier, idx) => (
          <TierCard key={idx} tier={tier} />
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
      setSubmitError(error instanceof Error ? error.message : 'Impossible d’envoyer votre demande. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  const phoneOptions = [
    { value: '+261', label: '+261 (Madagascar)' },
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
    <section className="py-12 md:py-16 px-6">
      <div className="max-w-[1120px] mx-auto">
        <div className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] rounded-3xl px-6 md:px-10 py-10 md:py-14 text-center text-white shadow-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 text-xs font-semibold text-[#99CC33] mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Contact
          </div>
          <h2 className="font-['Bebas_Neue'] text-3xl md:text-4xl lg:text-5xl mb-3">{t.contactH}</h2>
          <p className="text-sm md:text-base text-white/60 leading-relaxed max-w-lg mx-auto mb-6">{t.contactP}</p>
          {!showOk ? (
            <form className="max-w-lg mx-auto flex flex-col gap-3 text-left" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#46BDD6] focus:shadow-[0_0_0_4px_rgba(70,189,214,0.15)] transition-all duration-200"
                placeholder={t.namePlaceholder}
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#46BDD6] focus:shadow-[0_0_0_4px_rgba(70,189,214,0.15)] transition-all duration-200"
                placeholder={t.emailPlaceholder}
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <div className="flex gap-2.5">
                <select
                  name="phoneCC"
                  className="flex-shrink-0 min-w-[130px] px-3 py-3 rounded-xl border border-white/15 bg-white/5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#46BDD6] focus:shadow-[0_0_0_4px_rgba(70,189,214,0.15)] transition-all duration-200 [&>option]:text-[#2C2C2C]"
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
                  className="flex-1 min-w-[120px] px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#46BDD6] focus:shadow-[0_0_0_4px_rgba(70,189,214,0.15)] transition-all duration-200"
                  placeholder={t.phonePlaceholder}
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <textarea
                name="activity"
                className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#46BDD6] focus:shadow-[0_0_0_4px_rgba(70,189,214,0.15)] transition-all duration-200 resize-y min-h-[80px]"
                placeholder={t.activityPlaceholder}
                value={formData.activity}
                onChange={handleInputChange}
              />
              <label className="flex items-center gap-2.5 text-sm text-white/80 cursor-pointer text-left">
                <input
                  type="checkbox"
                  className="w-4 h-4 flex-shrink-0 accent-[#99CC33] cursor-pointer"
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
                    className="flex-1 min-w-[140px] px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#46BDD6] focus:shadow-[0_0_0_4px_rgba(70,189,214,0.15)] transition-all duration-200"
                    value={formData.callbackDate}
                    onChange={handleInputChange}
                  />
                  <select
                    name="callbackSlot"
                    className="flex-1 min-w-[140px] px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#46BDD6] focus:shadow-[0_0_0_4px_rgba(70,189,214,0.15)] transition-all duration-200 [&>option]:text-[#2C2C2C]"
                    value={formData.callbackSlot}
                    onChange={handleInputChange}
                  >
                    {slotOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}
              <label className="flex items-center gap-2.5 text-sm text-white/80 cursor-pointer text-left">
                <input
                  type="checkbox"
                  name="wantBrochure"
                  className="w-4 h-4 flex-shrink-0 accent-[#99CC33] cursor-pointer"
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
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#99CC33] text-white text-sm md:text-base font-semibold hover:bg-[#88bb2e] transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-[#99CC33]/25 mt-1 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Send className="w-4 h-4" /> {submitting ? 'Envoi en cours...' : t.contactCta}
              </button>
            </form>
          ) : (
            <div className="bg-[#F4F8E8] text-[#3d5614] rounded-xl p-4 text-sm md:text-base font-semibold text-center max-w-lg mx-auto">
              <CircleCheck className="w-6 h-6 inline-block mr-2 text-[#99CC33]" />
              Merci ! Votre demande est notée — l'équipe Coloc'KOO revient vers vous très vite.
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
    subtitle: 'De la PME à la grande entreprise, une visibilité croissante et des données d\'audience à chaque niveau.',
    tiers: [
      {
        name: 'PME · Bronze',
        icon: <Shield className="w-5 h-5" />,
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
        icon: <TrendingUp className="w-5 h-5" />,
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
        icon: <Crown className="w-5 h-5" />,
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
        icon: <Layers className="w-5 h-5" />,
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
    icon: <Home className="w-6 h-6" />,
    iconClass: '',
    title: 'Immobilier',
    subtitle: 'De l\'agent indépendant au réseau national, un canal d\'acquisition rentable et des leads qualifiés.',
    tiers: [
      {
        name: 'Indépendant',
        launch: 'Gratuit au lancement',
        icon: <Target className="w-5 h-5" />,
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
        icon: <Briefcase className="w-5 h-5" />,
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
        icon: <Layers className="w-5 h-5" />,
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
    icon: <Landmark className="w-6 h-6" />,
    iconClass: 'cy',
    title: 'Institution publique — mécénat',
    subtitle: 'Soutenez une solution malgache d\'accès au logement, sans logique commerciale.',
    tiers: [
      {
        name: 'Mécène Argent',
        icon: <Shield className="w-5 h-5" />,
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
        icon: <Crown className="w-5 h-5" />,
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
        icon: <Layers className="w-5 h-5" />,
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
    icon: <Flag className="w-6 h-6" />,
    title: 'Option · Bandeau régional exclusif',
    subtitle: 'Un bandeau exclusif pleine largeur en bas de carte, contextuel à la région affichée. Un seul partenaire par région (hors Antananarivo, région d\'Analamanga) — l\'exclusivité géographique pour sécuriser un marché entier.',
    isAddon: true,
    addonNote: '1er bandeau inclus aux niveaux Platine et Réseau Platine · jusqu\'à 5 régions au total · 22 régions réservables (hors Antananarivo, région d\'Analamanga).',
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
          <h1 className="font-['Bebas_Neue'] text-4xl">Page partenaires indisponible</h1>
          <p className="mt-4 text-muted-foreground">
            Cette fonctionnalité est actuellement désactivée par la configuration globale. Revenez plus tard.
          </p>
          <Link to="/">
            <Button className="mt-8 bg-[#46BDD6] hover:bg-[#3aadca] text-white">Retour à l'accueil</Button>
          </Link>
        </div>
      </SiteLayout>
    )
  }

  return (
    <SiteLayout>
      <div className="partenaires-page bg-[#f5f7f2] min-h-screen font-sans text-[#2C2C2C]">
        {/* Hero */}
        <Hero 
          onContactClick={scrollToContact}
          onStatutsClick={scrollToStatuts}
        />

        {/* Why Section */}
        <WhySection />

        {/* Statuts Section */}
        <section className="py-4 px-6" id="statuts">
          <div className="max-w-[1120px] mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#F4F8E8] flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-[#99CC33]" />
              </div>
              <h2 className="font-['Bebas_Neue'] text-3xl md:text-4xl text-[#2C2C2C]">{t.statutsTitle}</h2>
            </div>
            <p className="text-sm md:text-base text-[#666] leading-relaxed max-w-3xl ml-0 md:ml-13 mb-6">
              {t.statutsSub}
            </p>

            {partnerSections.map((section, idx) => (
              <PartnerSectionComponent key={idx} section={section} />
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <ContactSection />

        {/* Light Mode Popup */}
        {showLightPopup && (
          <div className="fixed inset-0 bg-black/45 z-[100000] flex items-center justify-center p-5 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl max-w-[360px] w-full px-6 py-8 text-center shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-[#F4F8E8] flex items-center justify-center mx-auto mb-4">
                <Feather className="w-7 h-7 text-[#99CC33]" />
              </div>
              <h3 className="font-['Bebas_Neue'] text-2xl text-[#2C2C2C] mb-2">{t.lightpopH}</h3>
              <p className="text-sm leading-relaxed text-[#666] mb-6">{t.lightpopP}</p>
              <div className="flex flex-col gap-2.5">
                <button 
                  className="px-4 py-3 rounded-xl border-none bg-[#99CC33] text-white text-sm font-semibold hover:bg-[#88bb2e] transition-colors duration-200" 
                  onClick={handleEnableLight}
                >
                  {t.lightpopYes}
                </button>
                <button 
                  className="px-4 py-3 rounded-xl border border-[#e8e8e8] bg-transparent text-[#666] text-sm font-semibold hover:bg-[#f5f5f5] transition-colors duration-200" 
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