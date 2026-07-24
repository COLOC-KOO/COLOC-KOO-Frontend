// pages/Partenaires.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import emailjs from '@emailjs/browser'
import { Link } from 'react-router-dom'
import {
  Building2, Check, Send, Gift, Handshake, ListChecks,
  Lightbulb, Users, HeartHandshake, MapPin, ChartNoAxesCombined,
  Rocket, Award, Store, Home, Landmark, Flag, ArrowUpRight,
  Feather, CircleCheck, Sparkles, TrendingUp, Shield,
  Zap, Crown, Briefcase, Target, Layers, Eye, BarChart3, ChevronLeft, ChevronRight,
  Compass,
} from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { Button } from '../components/ui/Button'
import { api } from '../lib/api'
import { useConfig } from '../lib/config'
import { motion, AnimatePresence } from 'framer-motion'
import { LazyImage } from '../components/ui/LazyImage'

// Image hero
const heroImage = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600&q=80"

// Police unifiée du site
const HEADING_FONT = "font-['Oswald']"

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

// =============================================
// COMPOSANT HERO - AVEC IMAGE DE FOND (style Services - hauteur identique)
// =============================================
const Hero: React.FC<{ onContactClick: () => void; onStatutsClick: () => void }> = ({
  onContactClick, onStatutsClick
}) => {
  const { t } = useTranslation(['partenaires', 'common'])

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <LazyImage src={heroImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan-dark/70 via-brand-cyan/45 to-brand-green/45 mix-blend-overlay" />
      </div>
      <div className="relative w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24 text-white">
        <div className="max-w-2xl mx-auto text-center">
          {/* Badge */}
          {/* <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-sm font-medium mb-5">
            <Gift className="w-4 h-4" />
            {t('partenaires:hero.badge')}
          </span> */}

          {/* Titre principal uniquement - sans le texte "Associez votre marque..." */}
          <h1 className="bebas text-3xl md:text-5xl leading-tight mb-4 drop-shadow-2xl">
            <span className="text-brand-cyan">{t('partenaires:hero.title')}</span>
          </h1>

          {/* Description courte */}
          <p className="text-white/75 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-6">
            {t('partenaires:hero.subtitle')}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={onContactClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl bg-gradient-to-r from-brand-cyan to-brand-green"
            >
              <Handshake className="w-4 h-4" />
              {t('partenaires:hero.cta')}
            </button>
            <button
              onClick={onStatutsClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl border border-white/20 backdrop-blur-sm hover:bg-white/10"
            >
              <ListChecks className="w-4 h-4" />
              {t('partenaires:hero.cta2')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// =============================================
// COMPOSANT POURQUOI
// =============================================
const WhySection: React.FC = () => {
  const { t } = useTranslation(['partenaires'])

  const cards: (WhyCard & { accent: 'cyan' | 'green' })[] = [
    {
      icon: <Users className="w-5 h-5" />,
      title: t('partenaires:why.cards.audience.title'),
      desc: t('partenaires:why.cards.audience.desc'),
      stat: '15k+',
      accent: 'cyan'
    },
    {
      icon: <HeartHandshake className="w-5 h-5" />,
      title: t('partenaires:why.cards.rse.title'),
      desc: t('partenaires:why.cards.rse.desc'),
      stat: '100%',
      accent: 'green'
    },
    {
      icon: <Compass className="w-5 h-5" />,
      title: t('partenaires:why.cards.visibility.title'),
      desc: t('partenaires:why.cards.visibility.desc'),
      stat: '50k+',
      accent: 'cyan'
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: t('partenaires:why.cards.data.title'),
      desc: t('partenaires:why.cards.data.desc'),
      stat: '365j',
      accent: 'green'
    }
  ]

  return (
    <section className="py-10 md:py-14 px-4 md:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
            {t('partenaires:why.title')}
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto mt-1">
            {t('partenaires:why.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, idx) => {
            const isCyan = card.accent === 'cyan'
            const accentColor = isCyan ? 'var(--brand-cyan)' : 'var(--brand-green)'
            const accentTint = isCyan ? 'oklch(97% 0.02 210)' : 'oklch(97% 0.16 130)'
            return (
              <motion.div
                key={idx}
                className="relative bg-white border rounded-2xl p-6 text-center transition-shadow duration-300 shadow-sm hover:shadow-md"
                style={{ borderColor: '#E4ECEA' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: accentTint }}
                >
                  <span style={{ color: accentColor }}>{card.icon}</span>
                </div>
                <h3 className="text-base font-semibold mb-2 text-foreground">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {card.desc}
                </p>
                {card.stat && (
                  <div className="mt-2 text-xl font-bold" style={{ color: accentColor }}>
                    {card.stat}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
        <div
          className="mt-4 border border-dashed rounded-2xl px-5 py-3 flex items-center gap-4"
          style={{ backgroundColor: 'oklch(97% 0.16 130)', borderColor: 'oklch(78% 0.16 130 / 0.33)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'oklch(78% 0.16 130 / 0.15)' }}>
            <Rocket className="w-5 h-5" style={{ color: 'var(--brand-green)' }} />
          </div>
          <p className="text-sm md:text-base leading-relaxed" style={{ color: 'var(--brand-green-dark)' }}>{t('partenaires:why.launchText')}</p>
        </div>
      </div>
    </section>
  )
}

// =============================================
// COMPOSANT TIER CARD
// =============================================
const TierCard: React.FC<{ tier: PartnerTier; index: number }> = ({ tier, index }) => {
  const { t } = useTranslation(['partenaires'])

  const getTierAccent = (tierClass: string) => {
    if (tierClass.includes('bronze')) return { top: 'var(--brand-cyan)', tint: 'oklch(97% 0.02 210)' }
    if (tierClass.includes('argent')) return { top: 'var(--brand-cyan)', tint: 'oklch(97% 0.02 210)' }
    if (tierClass.includes('or')) return { top: 'var(--brand-green)', tint: 'oklch(97% 0.16 130)' }
    if (tierClass.includes('platine')) return { top: 'var(--brand-cyan-dark)', tint: 'oklch(97% 0.02 210)' }
    if (tierClass.includes('green')) return { top: 'var(--brand-green)', tint: 'oklch(97% 0.16 130)' }
    if (tierClass.includes('cy')) return { top: 'var(--brand-cyan)', tint: 'oklch(97% 0.02 210)' }
    return { top: 'var(--brand-cyan)', tint: 'oklch(97% 0.02 210)' }
  }

  const accent = getTierAccent(tier.tierClass)

  return (
    <motion.div
      className="relative bg-white rounded-2xl p-5 flex flex-col h-full border transition-shadow duration-300 hover:shadow-lg"
      style={{ borderColor: '#E4ECEA' }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: accent.top }} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-1 pt-1">
        <div className="flex items-center gap-2.5">
          {tier.icon && (
            <span style={{ color: accent.top }}>
              {tier.icon}
            </span>
          )}
          <span className={`${HEADING_FONT} font-medium text-xl md:text-2xl text-foreground`}>
            {tier.name}
          </span>
        </div>
        {tier.launch && (
          <span
            className="text-[10px] font-bold border rounded-full px-3 py-0.5 whitespace-nowrap"
            style={{ backgroundColor: accent.tint, color: accent.top, borderColor: `${accent.top}40` }}
          >
            {tier.launch}
          </span>
        )}
      </div>

      <p className="text-sm italic leading-relaxed my-2 mb-3" style={{ color: accent.top }}>
        {tier.arg}
      </p>

      <ul className="list-none flex flex-col gap-2 p-0 m-0 flex-1">
        {tier.benefits.map((benefit, idx) => {
          const isHead = benefit.startsWith('Intègre toute')
          return (
            <li
              key={idx}
              className={`text-sm leading-relaxed flex gap-2.5 items-start ${isHead ? 'font-semibold' : ''}`}
              style={{ color: isHead ? 'var(--foreground)' : 'var(--muted-foreground)' }}
            >
              <span className="flex-shrink-0 mt-0.5" style={{ color: isHead ? '#999' : 'var(--brand-green)' }}>
                {isHead ? <ArrowUpRight className="w-4 h-4" /> : <Check className="w-4 h-4" />}
              </span>
              <span>{benefit}</span>
            </li>
          )
        })}
      </ul>

      {tier.popular && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: '#E4ECEA' }}>
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5"
            style={{ backgroundColor: 'oklch(97% 0.02 210)', color: 'var(--brand-cyan)' }}
          >
            <Sparkles className="w-3 h-3" />
            {t('partenaires:tiers.popular')}
          </span>
        </div>
      )}
    </motion.div>
  )
}

// =============================================
// COMPOSANT SECTION PARTENAIRE
// =============================================
const PartnerSectionComponent: React.FC<{ section: PartnerSection }> = ({ section }) => {
  const isCyan = section.iconClass === 'cy'
  const iconBg = isCyan ? 'oklch(97% 0.02 210)' : 'oklch(97% 0.16 130)'
  const iconColor = isCyan ? 'var(--brand-cyan)' : 'var(--brand-green)'

  if (section.isAddon) {
    return (
      <div
        className="bg-white border-2 rounded-2xl p-6 flex flex-col sm:flex-row gap-5 items-start transition-shadow duration-200 hover:shadow-lg"
        style={{ borderColor: 'var(--brand-cyan)' }}
      >
        <div
          className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center flex-shrink-0"
          style={{ borderColor: 'var(--brand-cyan)', backgroundColor: 'oklch(97% 0.02 210)' }}
        >
          <span style={{ color: 'var(--brand-cyan)' }}>{section.icon}</span>
        </div>
        <div>
          <h3 className={`${HEADING_FONT} font-semibold text-2xl md:text-3xl text-foreground`}>{section.title}</h3>
          <p className="text-sm md:text-base leading-relaxed mt-1.5 text-muted-foreground">{section.subtitle}</p>
          {section.addonNote && (
            <p className="text-xs md:text-sm mt-3 border-t pt-3" style={{ color: '#888', borderColor: 'oklch(74% 0.11 210 / 0.2)' }}>{section.addonNote}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="bg-white border rounded-2xl p-6"
      style={{ borderColor: '#E4ECEA' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row items-start gap-4 mb-5 pb-5 border-b" style={{ borderColor: '#E4ECEA' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconBg }}>
          <span style={{ color: iconColor }}>{section.icon}</span>
        </div>
        <div>
          <h3 className={`${HEADING_FONT} font-semibold text-2xl md:text-3xl leading-tight`} style={{ color: iconColor }}>
            {section.title}
          </h3>
          <p className="text-sm md:text-base leading-relaxed mt-0.5 text-muted-foreground">{section.subtitle}</p>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${section.id === 'entreprise-generale'
            ? 'xl:grid-cols-4'
            : 'xl:grid-cols-3'
          }`}
      >
        {section.tiers.map((tier, idx) => (
          <TierCard key={idx} tier={tier} index={idx} />
        ))}
      </div>
    </motion.div>
  )
}

// =============================================
// COMPOSANT CONTACT - COULEUR ALIGNÉE SUR SERVICES
// =============================================
const ContactSection: React.FC = () => {
  const { t } = useTranslation(['partenaires', 'common'])
  const [showCallback, setShowCallback] = useState(false)
  const [showOk, setShowOk] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneCC: '+261',
    phone: '',
    secteur: '',
    niveauSouhaite: '',
    activity: '',
    wantCallback: false,
    callbackDate: '',
    callbackSlot: '',
    wantBrochure: false
  })

  useEffect(() => {
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim()
    if (publicKey) {
      emailjs.init(publicKey)
    }
  }, [])

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

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim()
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim()
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim()

    if (!serviceId || !templateId || !publicKey || publicKey === 'your_public_key_here' || serviceId === 'your_service_id_here' || templateId === 'your_template_id_here') {
      setSubmitError('EmailJS n\'est pas encore configuré correctement. Veuillez renseigner les variables VITE_EMAILJS_PUBLIC_KEY, VITE_EMAILJS_SERVICE_ID et VITE_EMAILJS_TEMPLATE_ID dans le fichier .env du frontend.')
      setSubmitting(false)
      return
    }

    try {
      const phoneValue = `${formData.phoneCC} ${formData.phone}`.trim()

      const templateParams = {
        from_name: formData.name || 'Partenaire',
        name: formData.name || 'Partenaire',
        from_email: formData.email || '',
        email: formData.email || '',
        reply_to: formData.email || '',
        phone: phoneValue || 'Non renseigné',
        phone_number: phoneValue || 'Non renseigné',
        secteur: formData.secteur || 'Non renseigné',
        niveau_souhaite: formData.niveauSouhaite || 'Non renseigné',
        niveau: formData.niveauSouhaite || 'Non renseigné',
        message: formData.activity || 'Aucun message complémentaire',
        activity: formData.activity || 'Aucun message complémentaire',
        want_callback: formData.wantCallback ? 'Oui' : 'Non',
        callback_date: formData.callbackDate || 'Non renseignée',
        callback_slot: formData.callbackSlot || 'Non renseignée',
        want_brochure: formData.wantBrochure ? 'Oui' : 'Non',
        brochure: formData.wantBrochure ? 'Oui' : 'Non',
        time: new Date().toLocaleString('fr-FR', {
          dateStyle: 'full',
          timeStyle: 'short',
        }),
        to_email: 'contact@colockoo.com',
        to_name: "Sarintany'COLOC",
        subject: 'Nouvelle demande de partenaire',
      }

      await emailjs.send(serviceId, templateId, templateParams, publicKey)

      try {
        await api.createPartenaireRequest({
          nom: formData.name,
          email: formData.email,
          phone: formData.phone,
          phoneCC: formData.phoneCC,
          secteur: formData.secteur,
          niveau_souhaite: formData.niveauSouhaite,
          message: formData.activity,
          wantCallback: formData.wantCallback,
          callbackDate: formData.callbackDate,
          callbackSlot: formData.callbackSlot,
          wantBrochure: formData.wantBrochure,
        })
      } catch {
        // Silence: l’e-mail a déjà été envoyé, la sauvegarde backend est optionnelle.
      }

      setShowOk(true)
      setFormData({
        name: '',
        email: '',
        phoneCC: '+261',
        phone: '',
        secteur: '',
        niveauSouhaite: '',
        activity: '',
        wantCallback: false,
        callbackDate: '',
        callbackSlot: '',
        wantBrochure: false,
      })
      setShowCallback(false)
      if (formRef.current) {
        formRef.current.reset()
      }
    } catch (error: unknown) {
      const emailError = error as { text?: string; status?: number; message?: string }
      const detail = emailError?.text || emailError?.message || 'Erreur inconnue'
      setSubmitError(`${t('partenaires:contact.errors.emailjs')}${emailError?.status ? ` (${emailError.status})` : ''}: ${detail}`)
    } finally {
      setSubmitting(false)
    }
  }

  const phoneOptions = [
    { value: '+261', label: '+261 (Mada)' },
    { value: '+33', label: '+33 (France)' },
    { value: '+262', label: '+262 (Réunion)' },
    { value: '+230', label: '+230 (Maurice)' },
    { value: '+269', label: '+269 (Comores)' },
  ]

  const slotOptions = [
    { value: '', label: t('partenaires:contact.slotPlaceholder') },
    { value: 'morning', label: t('partenaires:contact.slotMorning') },
    { value: 'early_afternoon', label: t('partenaires:contact.slotEarlyAfternoon') },
    { value: 'late_afternoon', label: t('partenaires:contact.slotLateAfternoon') },
  ]

  const secteurOptions = [
    { value: '', label: t('partenaires:contact.sectorPlaceholder') },
    { value: 'Entreprise générale', label: t('partenaires:contact.sectorGeneral') },
    { value: 'Immobilier', label: t('partenaires:contact.sectorRealEstate') },
    { value: 'Institution publique', label: t('partenaires:contact.sectorPublic') },
    { value: 'Autre', label: t('partenaires:contact.sectorOther') },
  ]

  const niveauOptions = [
    { value: '', label: t('partenaires:contact.levelPlaceholder') },
    { value: 'Bronze', label: t('partenaires:contact.levelBronze') },
    { value: 'Argent', label: t('partenaires:contact.levelSilver') },
    { value: 'Or', label: t('partenaires:contact.levelGold') },
    { value: 'Diamant', label: t('partenaires:contact.levelDiamond') },
  ]

  return (
    <section className="relative py-12 md:py-16 px-4 md:px-6 lg:px-8 overflow-hidden" id="contact">
      <div className="absolute inset-0 bg-muted/40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl" style={{ backgroundColor: 'oklch(74% 0.11 210 / 0.05)' }} />

      <div className="max-w-xl mx-auto relative z-10">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h2 className={`${HEADING_FONT} font-semibold text-3xl md:text-4xl mb-2 text-foreground`}>
            {t('partenaires:contact.title')}
          </h2>
          <p className="text-sm max-w-sm mx-auto text-muted-foreground">
            {t('partenaires:contact.subtitle')}
          </p>
        </div>

        {/* Carte - style aligné sur Services */}
        <div className="rounded-2xl border border-border/60 bg-white shadow-sm p-6 md:p-8">
          {!showOk ? (
            <form ref={formRef} className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('partenaires:contact.name')}</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-4 py-2.5 rounded-xl border border-border/60 bg-white text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 transition-all duration-200"
                  placeholder={t('partenaires:contact.namePlaceholder')}
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('partenaires:contact.email')}</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-4 py-2.5 rounded-xl border border-border/60 bg-white text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 transition-all duration-200"
                  placeholder={t('partenaires:contact.emailPlaceholder')}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('partenaires:contact.phone')}</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    name="phoneCC"
                    className="w-full sm:w-[120px] px-4 py-2.5 rounded-xl border border-border/60 bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
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
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border/60 bg-white text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
                    placeholder={t('partenaires:contact.phonePlaceholder')}
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('partenaires:contact.sector')}</label>
                <select
                  name="secteur"
                  className="w-full px-4 py-2.5 rounded-xl border border-border/60 bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
                  value={formData.secteur}
                  onChange={handleInputChange}
                >
                  {secteurOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('partenaires:contact.level')}</label>
                <select
                  name="niveauSouhaite"
                  className="w-full px-4 py-2.5 rounded-xl border border-border/60 bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
                  value={formData.niveauSouhaite}
                  onChange={handleInputChange}
                >
                  {niveauOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('partenaires:contact.activity')}</label>
                <textarea
                  name="activity"
                  className="w-full px-4 py-2.5 rounded-xl border border-border/60 bg-white text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 resize-y min-h-[70px]"
                  placeholder={t('partenaires:contact.activityPlaceholder')}
                  value={formData.activity}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2.5 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border/60 cursor-pointer accent-brand-green"
                    checked={formData.wantCallback}
                    onChange={(e) => handleCallbackToggle(e.target.checked)}
                  />
                  {t('partenaires:contact.callback')}
                </label>

                {showCallback && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-7">
                    <input
                      type="date"
                      name="callbackDate"
                      className="px-4 py-2.5 rounded-xl border border-border/60 bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
                      value={formData.callbackDate}
                      onChange={handleInputChange}
                    />
                    <select
                      name="callbackSlot"
                      className="px-4 py-2.5 rounded-xl border border-border/60 bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
                      value={formData.callbackSlot}
                      onChange={handleInputChange}
                    >
                      {slotOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                <label className="flex items-center gap-2.5 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  <input
                    type="checkbox"
                    name="wantBrochure"
                    className="w-4 h-4 rounded border-border/60 cursor-pointer accent-brand-green"
                    checked={formData.wantBrochure}
                    onChange={handleInputChange}
                  />
                  {t('partenaires:contact.brochure')}
                </label>
              </div>

              {submitError && (
                <p className="text-sm text-red-600">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-1 bg-gradient-to-r from-brand-cyan to-brand-green shadow-md hover:shadow-lg"
              >
                {submitting ? t('common:common.loading') : t('partenaires:contact.submit')}
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'oklch(78% 0.16 130 / 0.15)' }}>
                <CircleCheck className="w-8 h-8" style={{ color: 'var(--brand-green)' }} />
              </div>
              <h3 className={`${HEADING_FONT} font-semibold text-2xl text-foreground mb-1`}>{t('partenaires:contact.thanks')}</h3>
              <p className="text-sm text-muted-foreground">{t('partenaires:contact.thanksText')}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 text-xs text-muted-foreground">
          <span>✉️ contact@colockoo.com</span>
          <span className="hidden sm:inline text-muted-foreground/30">•</span>
          <span>📱 +261 34 00 000 00</span>
          <span className="hidden sm:inline text-muted-foreground/30">•</span>
          <span>🕐 {t('partenaires:contact.hours')}</span>
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
    title: 'partenaires:sections.entreprise.title',
    subtitle: 'partenaires:sections.entreprise.subtitle',
    tiers: [
      {
        name: 'partenaires:tiers.bronze.name',
        icon: <Shield className="w-4 h-4 sm:w-5 sm:h-5" />,
        arg: 'partenaires:tiers.bronze.arg',
        benefits: [
          'partenaires:tiers.bronze.benefit1',
          'partenaires:tiers.bronze.benefit2',
          'partenaires:tiers.bronze.benefit3'
        ],
        tierClass: 'bronze'
      },
      {
        name: 'partenaires:tiers.silver.name',
        icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />,
        arg: 'partenaires:tiers.silver.arg',
        benefits: [
          'partenaires:tiers.silver.benefit1',
          'partenaires:tiers.silver.benefit2',
          'partenaires:tiers.silver.benefit3',
          'partenaires:tiers.silver.benefit4'
        ],
        tierClass: 'argent',
        popular: true
      },
      {
        name: 'partenaires:tiers.gold.name',
        icon: <Crown className="w-4 h-4 sm:w-5 sm:h-5" />,
        arg: 'partenaires:tiers.gold.arg',
        benefits: [
          'partenaires:tiers.gold.benefit1',
          'partenaires:tiers.gold.benefit2',
          'partenaires:tiers.gold.benefit3',
          'partenaires:tiers.gold.benefit4',
          'partenaires:tiers.gold.benefit5',
          'partenaires:tiers.gold.benefit6'
        ],
        tierClass: 'or'
      },
      {
        name: 'partenaires:tiers.platinum.name',
        icon: <Layers className="w-4 h-4 sm:w-5 sm:h-5" />,
        arg: 'partenaires:tiers.platinum.arg',
        benefits: [
          'partenaires:tiers.platinum.benefit1',
          'partenaires:tiers.platinum.benefit2',
          'partenaires:tiers.platinum.benefit3',
          'partenaires:tiers.platinum.benefit4',
          'partenaires:tiers.platinum.benefit5',
          'partenaires:tiers.platinum.benefit6',
          'partenaires:tiers.platinum.benefit7'
        ],
        tierClass: 'platine'
      }
    ]
  },
  {
    id: 'immobilier',
    icon: <Home className="w-5 h-5 sm:w-6 sm:h-6" />,
    iconClass: '',
    title: 'partenaires:sections.realEstate.title',
    subtitle: 'partenaires:sections.realEstate.subtitle',
    tiers: [
      {
        name: 'partenaires:tiers.independent.name',
        launch: 'partenaires:tiers.independent.launch',
        icon: <Target className="w-4 h-4 sm:w-5 sm:h-5" />,
        arg: 'partenaires:tiers.independent.arg',
        benefits: [
          'partenaires:tiers.independent.benefit1',
          'partenaires:tiers.independent.benefit2',
          'partenaires:tiers.independent.benefit3'
        ],
        tierClass: 'green'
      },
      {
        name: 'partenaires:tiers.agency.name',
        launch: 'partenaires:tiers.agency.launch',
        icon: <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />,
        arg: 'partenaires:tiers.agency.arg',
        benefits: [
          'partenaires:tiers.agency.benefit1',
          'partenaires:tiers.agency.benefit2',
          'partenaires:tiers.agency.benefit3'
        ],
        tierClass: 'green',
        popular: true
      },
      {
        name: 'partenaires:tiers.network.name',
        launch: 'partenaires:tiers.network.launch',
        icon: <Layers className="w-4 h-4 sm:w-5 sm:h-5" />,
        arg: 'partenaires:tiers.network.arg',
        benefits: [
          'partenaires:tiers.network.benefit1',
          'partenaires:tiers.network.benefit2',
          'partenaires:tiers.network.benefit3',
          'partenaires:tiers.network.benefit4'
        ],
        tierClass: 'green'
      }
    ]
  },
  {
    id: 'institution',
    icon: <Landmark className="w-5 h-5 sm:w-6 sm:h-6" />,
    iconClass: 'cy',
    title: 'partenaires:sections.public.title',
    subtitle: 'partenaires:sections.public.subtitle',
    tiers: [
      {
        name: 'partenaires:tiers.publicSilver.name',
        icon: <Shield className="w-4 h-4 sm:w-5 sm:h-5" />,
        arg: 'partenaires:tiers.publicSilver.arg',
        benefits: [
          'partenaires:tiers.publicSilver.benefit1',
          'partenaires:tiers.publicSilver.benefit2',
          'partenaires:tiers.publicSilver.benefit3',
          'partenaires:tiers.publicSilver.benefit4'
        ],
        tierClass: 'cy'
      },
      {
        name: 'partenaires:tiers.publicGold.name',
        icon: <Crown className="w-4 h-4 sm:w-5 sm:h-5" />,
        arg: 'partenaires:tiers.publicGold.arg',
        benefits: [
          'partenaires:tiers.publicGold.benefit1',
          'partenaires:tiers.publicGold.benefit2',
          'partenaires:tiers.publicGold.benefit3',
          'partenaires:tiers.publicGold.benefit4'
        ],
        tierClass: 'cy',
        popular: true
      },
      {
        name: 'partenaires:tiers.publicPlatinum.name',
        icon: <Layers className="w-4 h-4 sm:w-5 sm:h-5" />,
        arg: 'partenaires:tiers.publicPlatinum.arg',
        benefits: [
          'partenaires:tiers.publicPlatinum.benefit1',
          'partenaires:tiers.publicPlatinum.benefit2',
          'partenaires:tiers.publicPlatinum.benefit3',
          'partenaires:tiers.publicPlatinum.benefit4'
        ],
        tierClass: 'cy'
      }
    ]
  },
  {
    id: 'addon',
    icon: <Flag className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'partenaires:sections.addon.title',
    subtitle: 'partenaires:sections.addon.subtitle',
    isAddon: true,
    addonNote: 'partenaires:sections.addon.note',
    tiers: []
  }
]

// =============================================
// COMPOSANT PRINCIPAL
// =============================================
export default function Partenaires() {
  const { t } = useTranslation(['partenaires', 'common'])
  const { config } = useConfig()
  const [lightOn, setLightOn] = useState(false)
  const [showLightPopup, setShowLightPopup] = useState(false)

  const [currentSection, setCurrentSection] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const transitionTimeoutRef = useRef<number | null>(null)

  const partnerVisibility = config.PARTENAIRE_VISIBILITY !== false
  const totalSections = partnerSections.length

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
          <h1 className={`${HEADING_FONT} font-semibold text-3xl sm:text-4xl text-foreground`}>{t('partenaires:unavailable.title')}</h1>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground">
            {t('partenaires:unavailable.subtitle')}
          </p>
          <Link to="/">
            <Button className="mt-6 sm:mt-8 text-white bg-gradient-to-r from-brand-cyan to-brand-green">{t('common:common.back')}</Button>
          </Link>
        </div>
      </SiteLayout>
    )
  }

  const getTranslatedSections = () => {
    return partnerSections.map(section => {
      if (section.isAddon) {
        return {
          ...section,
          title: t(section.title),
          subtitle: t(section.subtitle),
          addonNote: t(section.addonNote || '')
        }
      }
      return {
        ...section,
        title: t(section.title),
        subtitle: t(section.subtitle),
        tiers: section.tiers.map(tier => ({
          ...tier,
          name: t(tier.name),
          arg: t(tier.arg),
          launch: tier.launch ? t(tier.launch) : undefined,
          benefits: tier.benefits.map(b => t(b))
        }))
      }
    })
  }

  const translatedSections = getTranslatedSections()
  const currentSectionData = translatedSections[currentSection]
  const isFirst = currentSection === 0
  const isLast = currentSection === totalSections - 1

  return (
    <SiteLayout>
      <div className="partenaires-page min-h-screen font-sans bg-muted/40 text-foreground">
        <Hero
          onContactClick={scrollToContact}
          onStatutsClick={scrollToStatuts}
        />

        <WhySection />

        <section className="py-6 px-4 md:px-6 lg:px-8" id="statuts">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
                {t('partenaires:statuts.title')}
              </h2>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto mt-1">
                {t('partenaires:statuts.subtitle')}
              </p>
            </div>

            <div className="relative">
              <div className="flex justify-center gap-1.5 mb-4">
                {translatedSections.map((_, idx) => (
                  <div
                    key={idx}
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: idx === currentSection ? '2rem' : '0.375rem',
                      backgroundColor: idx === currentSection ? 'var(--brand-cyan)' : '#d5dedc'
                    }}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSection}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                >
                  <PartnerSectionComponent section={currentSectionData} />
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                <button
                  onClick={goToPrev}
                  disabled={isFirst || isTransitioning}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border text-sm font-medium transition-all duration-200"
                  style={{
                    borderColor: '#E4ECEA',
                    color: 'var(--muted-foreground)',
                    opacity: !isFirst && !isTransitioning ? 1 : 0.4,
                    cursor: !isFirst && !isTransitioning ? 'pointer' : 'not-allowed'
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('common:common.previous')}</span>
                </button>

                <span className="text-sm font-medium order-first sm:order-none text-muted-foreground">
                  {currentSection + 1} / {totalSections}
                </span>

                <button
                  onClick={goToNext}
                  disabled={isLast || isTransitioning}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border text-sm font-medium transition-all duration-200"
                  style={{
                    borderColor: '#E4ECEA',
                    color: 'var(--muted-foreground)',
                    opacity: !isLast && !isTransitioning ? 1 : 0.4,
                    cursor: !isLast && !isTransitioning ? 'pointer' : 'not-allowed'
                  }}
                >
                  <span className="hidden sm:inline">{t('common:common.next')}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="w-full h-1 rounded-full overflow-hidden mt-4" style={{ backgroundColor: '#e2e8e6' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${((currentSection + 1) / totalSections) * 100}%`, backgroundColor: 'var(--brand-cyan)' }}
                />
              </div>
            </div>
          </div>
        </section>

        <ContactSection />

        {showLightPopup && (
          <div className="fixed inset-0 bg-black/45 z-[100000] flex items-center justify-center p-4 sm:p-5 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl max-w-[360px] w-full px-6 py-8 text-center shadow-2xl">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'oklch(97% 0.16 130)' }}>
                <Feather className="w-7 h-7" style={{ color: 'var(--brand-green)' }} />
              </div>
              <h3 className={`${HEADING_FONT} font-semibold text-2xl mb-2 text-foreground`}>{t('partenaires:lightpop.title')}</h3>
              <p className="text-sm leading-relaxed mb-6 text-muted-foreground">{t('partenaires:lightpop.desc')}</p>
              <div className="flex flex-col gap-2.5">
                <button
                  className="px-4 py-3 rounded-xl border-none text-white text-sm font-semibold transition-colors duration-200 bg-gradient-to-r from-brand-cyan to-brand-green"
                  onClick={handleEnableLight}
                >
                  {t('partenaires:lightpop.enable')}
                </button>
                <button
                  className="px-4 py-3 rounded-xl border text-sm font-semibold transition-colors duration-200"
                  style={{ borderColor: '#E4ECEA', color: 'var(--muted-foreground)' }}
                  onClick={handleCloseLightPopup}
                >
                  {t('partenaires:lightpop.disable')}
                </button>
              </div>
              <label className="flex items-center justify-center gap-2 mt-4 text-xs cursor-pointer" style={{ color: '#999' }}>
                <input
                  type="checkbox"
                  className="cursor-pointer accent-brand-green"
                  onChange={(e) => handleDontRemind(e.target.checked)}
                />
                <span>{t('partenaires:lightpop.remind')}</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  )
}