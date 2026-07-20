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

// Image hero
const heroImage = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600&q=80"

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
// COMPOSANT HERO - AVEC IMAGE DE FOND
// =============================================
const Hero: React.FC<{ onContactClick: () => void; onStatutsClick: () => void }> = ({
  onContactClick, onStatutsClick
}) => {
  const { t } = useTranslation(['partenaires', 'common'])

  return (
    <section className="relative overflow-hidden min-h-[400px] sm:min-h-[450px] flex items-center">
      {/* Image de fond */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/70 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/20 to-brand-green/20 mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12 text-white w-full">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-yellow-300 text-[10px] sm:text-xs mb-2 sm:mb-3 shadow-lg">
            <Gift className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{t('partenaires:hero.badge')}</span>
          </div>

          {/* Mission */}
          <p className="font-['Bebas_Neue'] text-lg sm:text-xl md:text-2xl text-white/90 leading-tight mb-1 px-2 drop-shadow-lg">
            {t('partenaires:hero.mission')}
          </p>

          {/* Titre */}
          <h1 className="font-['Bebas_Neue'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-none tracking-wide drop-shadow-2xl">
            <span className="text-white">{t('partenaires:hero.title')}</span>
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm md:text-base text-white/80 max-w-2xl mx-auto leading-relaxed mt-2 sm:mt-3 mb-4 sm:mb-5 px-2">
            {t('partenaires:hero.subtitle')}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 px-3">
            <button
              onClick={onContactClick}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-white text-xs sm:text-sm font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              style={{
                backgroundColor: 'oklch(66% 0.11 210)',
                boxShadow: '0 8px 25px rgba(0, 150, 200, 0.35)'
              }}
            >
              <Handshake className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {t('partenaires:hero.cta')}
            </button>
            <button
              onClick={onStatutsClick}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-white text-xs sm:text-sm font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              style={{
                backgroundColor: 'oklch(78% 0.16 130)',
                boxShadow: '0 8px 25px rgba(80, 200, 80, 0.35)'
              }}
            >
              <ListChecks className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {t('partenaires:hero.cta2')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// =============================================
// COMPOSANT POURQUOI - CARTES BLANCHES AVEC ZOOM ET DÉGRADÉ AU HOVER
// =============================================
const WhySection: React.FC = () => {
  const { t } = useTranslation(['partenaires'])

  const cards: WhyCard[] = [
    {
      icon: <Users className="w-5 h-5" />,
      title: t('partenaires:why.cards.audience.title'),
      desc: t('partenaires:why.cards.audience.desc'),
      stat: '15k+'
    },
    {
      icon: <HeartHandshake className="w-5 h-5" />,
      title: t('partenaires:why.cards.rse.title'),
      desc: t('partenaires:why.cards.rse.desc'),
      stat: '100%'
    },
    {
      icon: <Compass className="w-5 h-5" />,
      title: t('partenaires:why.cards.visibility.title'),
      desc: t('partenaires:why.cards.visibility.desc'),
      stat: '50k+'
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: t('partenaires:why.cards.data.title'),
      desc: t('partenaires:why.cards.data.desc'),
      stat: '365j'
    }
  ]

  return (
    <section className="py-6 sm:py-8 md:py-10 px-4 sm:px-6 bg-gradient-to-b from-white to-[#f5f7f2]">
      <div className="max-w-[1120px] mx-auto">
        <div className="flex flex-col items-center gap-2 mb-2">
          <h2 className="font-['Bebas_Neue'] text-2xl sm:text-3xl md:text-4xl text-[#2C2C2C] text-center">
            {t('partenaires:why.title')}
          </h2>
        </div>
        <p className="text-xs sm:text-sm md:text-base text-[#666] leading-relaxed max-w-3xl mx-auto text-center mb-3 sm:mb-4">
          {t('partenaires:why.subtitle')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              className="group relative bg-white border border-[#e8e8e8] rounded-2xl p-4 sm:p-6 text-center transition-all duration-500 cursor-pointer overflow-hidden shadow-sm hover:shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#99CC33] to-[#46BDD6] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-all duration-500 bg-[#F4F8E8] group-hover:bg-white/20 group-hover:scale-110">
                  <span className="text-[#99CC33] group-hover:text-white transition-colors duration-500">
                    {card.icon}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-[#2C2C2C] group-hover:text-white transition-colors duration-500 mb-1 sm:mb-2">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#666] group-hover:text-white/90 transition-colors duration-500 leading-relaxed">
                  {card.desc}
                </p>
                {card.stat && (
                  <div className="mt-2 text-lg sm:text-xl font-bold text-[#46BDD6] group-hover:text-white/80 transition-colors duration-500">
                    {card.stat}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-3 sm:mt-4 bg-[#F4F8E8] border border-dashed border-[#99CC33]/60 rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#99CC33]/20 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
            <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-[#99CC33]" />
          </div>
          <p className="text-xs sm:text-sm md:text-base text-[#4d6b1a] leading-relaxed">{t('partenaires:why.launchText')}</p>
        </div>
      </div>
    </section>
  )
}

// =============================================
// COMPOSANT TIER CARD AMÉLIORÉ AVEC DÉGRADÉ
// =============================================
const TierCard: React.FC<{ tier: PartnerTier; index: number }> = ({ tier, index }) => {
  const { t } = useTranslation(['partenaires'])

  const getTierBorderColor = (tierClass: string) => {
    if (tierClass.includes('bronze')) return 'from-[#c8843c]/30 to-[#c8843c]/10'
    if (tierClass.includes('argent')) return 'from-[#9aa3ad]/30 to-[#9aa3ad]/10'
    if (tierClass.includes('or')) return 'from-[#d4af37]/30 to-[#d4af37]/10'
    if (tierClass.includes('platine')) return 'from-[#5a8aa0]/30 to-[#5a8aa0]/10'
    if (tierClass.includes('green')) return 'from-[#99CC33]/30 to-[#99CC33]/10'
    if (tierClass.includes('cy')) return 'from-[#46BDD6]/30 to-[#46BDD6]/10'
    return 'from-gray-200 to-gray-100'
  }

  return (
    <motion.div
      className="group relative bg-gradient-to-br from-[#99CC33] to-[#46BDD6] rounded-2xl p-[2px] shadow-lg hover:shadow-2xl transition-all duration-500"
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.15,
        duration: 0.6,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{
        scale: 1.03,
        rotateY: 2,
        rotateX: 2,
        transition: { duration: 0.3 }
      }}
    >
      <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
      </div>

      <div className="relative bg-white rounded-2xl p-4 sm:p-5 flex flex-col h-full transition-all duration-300">
        <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${getTierBorderColor(tier.tierClass)}`} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-1 pt-1">
          <div className="flex items-center gap-2 sm:gap-2.5">
            {tier.icon && (
              <span className="text-[#99CC33] group-hover:scale-110 transition-transform duration-300">
                {tier.icon}
              </span>
            )}
            <span className="font-['Bebas_Neue'] text-lg sm:text-xl md:text-2xl text-[#2C2C2C] group-hover:text-[#46BDD6] transition-colors duration-300">
              {tier.name}
            </span>
          </div>
          {tier.launch && (
            <span className={`text-[8px] sm:text-[10px] font-bold border rounded-full px-2 sm:px-3 py-0.5 sm:py-1 whitespace-nowrap bg-[#99CC33]/10 text-[#99CC33] border-[#99CC33]/30`}>
              {tier.launch}
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-[#46BDD6] italic leading-relaxed my-1 sm:my-2 mb-2 sm:mb-3">
          {tier.arg}
        </p>

        <ul className="list-none flex flex-col gap-1.5 sm:gap-2 p-0 m-0 flex-1">
          {tier.benefits.map((benefit, idx) => {
            const isHead = benefit.startsWith('Intègre toute')
            return (
              <motion.li
                key={idx}
                className={`text-xs sm:text-sm leading-relaxed flex gap-2 sm:gap-2.5 items-start ${isHead ? 'font-semibold text-[#2C2C2C]' : 'text-[#555]'}`}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: index * 0.15 + idx * 0.06,
                  duration: 0.4,
                  type: "spring",
                  stiffness: 200
                }}
              >
                <span className={`flex-shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-110 ${isHead ? 'text-[#999]' : 'text-[#99CC33]'}`}>
                  {isHead ? <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" /> : <Check className="w-3 h-3 sm:w-4 sm:h-4" />}
                </span>
                <span>{benefit}</span>
              </motion.li>
            )
          })}
        </ul>

        {tier.popular && (
          <motion.div
            className="mt-3 pt-3 border-t border-[#e8e8e8]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 + 0.3, duration: 0.4 }}
          >
            <span className="text-[10px] sm:text-xs font-semibold text-[#99CC33] bg-[#F4F8E8] px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              {t('partenaires:tiers.popular')}
            </span>
          </motion.div>
        )}

        <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#99CC33]/20 to-[#46BDD6]/20 blur-xl" />
        </div>
      </div>
    </motion.div>
  )
}

// =============================================
// COMPOSANT SECTION PARTENAIRE
// =============================================
const PartnerSectionComponent: React.FC<{ section: PartnerSection }> = ({ section }) => {
  const { t } = useTranslation(['partenaires'])
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
    <motion.div
      className="bg-white border border-[#e8e8e8] rounded-2xl p-4 sm:p-5 md:p-6 transition-all duration-200 hover:shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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
        className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 ${section.id === 'entreprise-generale'
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
// COMPOSANT CONTACT
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
      setSubmitError('EmailJS n’est pas encore configuré correctement. Veuillez renseigner les variables VITE_EMAILJS_PUBLIC_KEY, VITE_EMAILJS_SERVICE_ID et VITE_EMAILJS_TEMPLATE_ID dans le fichier .env du frontend.')
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
    <section className="relative py-8 sm:py-12 md:py-16 px-4 sm:px-6 overflow-hidden" id="contact">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f5f7f2] via-white to-[#f0f5ed]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#99CC33]/8 rounded-full blur-3xl" />

      <div className="max-w-xl mx-auto relative z-10 px-2 sm:px-0">
        {/* En-tête */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="font-['Bebas_Neue'] text-2xl sm:text-3xl md:text-4xl text-[#2C2C2C] mb-1 sm:mb-2">
            {t('partenaires:contact.title')}
          </h2>
          <p className="text-[#666] text-xs sm:text-sm max-w-sm mx-auto px-2">
            {t('partenaires:contact.subtitle')}
          </p>
        </div>

        {/* Carte noire */}
        <div className="bg-[#1a1a2e] rounded-2xl shadow-2xl shadow-black/20 border border-white/10 p-4 sm:p-6 md:p-8">
          {!showOk ? (
            <form ref={formRef} className="flex flex-col gap-3 sm:gap-4" onSubmit={handleSubmit}>
              {/* Nom & Structure */}
              <div>
                <label className="block text-xs font-medium text-white mb-1 sm:mb-1.5">{t('partenaires:contact.name')}</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-white/10 bg-white/5 text-white text-xs sm:text-sm placeholder:text-white/20 focus:outline-none focus:border-[#99CC33] focus:ring-2 focus:ring-[#99CC33]/20 transition-all duration-200"
                  placeholder={t('partenaires:contact.namePlaceholder')}
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-white mb-1 sm:mb-1.5">{t('partenaires:contact.email')}</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-white/10 bg-white/5 text-white text-xs sm:text-sm placeholder:text-white/20 focus:outline-none focus:border-[#99CC33] focus:ring-2 focus:ring-[#99CC33]/20 transition-all duration-200"
                  placeholder={t('partenaires:contact.emailPlaceholder')}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-xs font-medium text-white mb-1 sm:mb-1.5">{t('partenaires:contact.phone')}</label>
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
                    placeholder={t('partenaires:contact.phonePlaceholder')}
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Secteur */}
              <div>
                <label className="block text-xs font-medium text-white mb-1 sm:mb-1.5">{t('partenaires:contact.sector')}</label>
                <select
                  name="secteur"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-white/10 bg-white/5 text-white text-xs sm:text-sm focus:outline-none focus:border-[#99CC33] focus:ring-2 focus:ring-[#99CC33]/20 transition-all duration-200 [&>option]:text-[#1a1a2e]"
                  value={formData.secteur}
                  onChange={handleInputChange}
                >
                  {secteurOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Niveau souhaité */}
              <div>
                <label className="block text-xs font-medium text-white mb-1 sm:mb-1.5">{t('partenaires:contact.level')}</label>
                <select
                  name="niveauSouhaite"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-white/10 bg-white/5 text-white text-xs sm:text-sm focus:outline-none focus:border-[#99CC33] focus:ring-2 focus:ring-[#99CC33]/20 transition-all duration-200 [&>option]:text-[#1a1a2e]"
                  value={formData.niveauSouhaite}
                  onChange={handleInputChange}
                >
                  {niveauOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Activité */}
              <div>
                <label className="block text-xs font-medium text-white mb-1 sm:mb-1.5">{t('partenaires:contact.activity')}</label>
                <textarea
                  name="activity"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-white/10 bg-white/5 text-white text-xs sm:text-sm placeholder:text-white/20 focus:outline-none focus:border-[#99CC33] focus:ring-2 focus:ring-[#99CC33]/20 transition-all duration-200 resize-y min-h-[60px] sm:min-h-[70px]"
                  placeholder={t('partenaires:contact.activityPlaceholder')}
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
                  {t('partenaires:contact.callback')}
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
                  {t('partenaires:contact.brochure')}
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
                {submitting ? t('common:common.loading') : t('partenaires:contact.submit')}
              </button>
            </form>
          ) : (
            <div className="text-center py-4 sm:py-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#99CC33]/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CircleCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[#99CC33]" />
              </div>
              <h3 className="font-['Bebas_Neue'] text-xl sm:text-2xl text-white mb-1">{t('partenaires:contact.thanks')}</h3>
              <p className="text-white/50 text-xs sm:text-sm">{t('partenaires:contact.thanksText')}</p>
            </div>
          )}
        </div>

        {/* Coordonnées */}
        <div className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-2 mt-4 sm:mt-6 text-[10px] sm:text-xs text-[#555]">
          <span>✉️ contact@colockoo.com</span>
          <span className="hidden sm:inline text-[#d0d5c8]">•</span>
          <span>📱 +261 34 00 000 00</span>
          <span className="hidden sm:inline text-[#d0d5c8]">•</span>
          <span>🕐 {t('partenaires:contact.hours')}</span>
        </div>
      </div>
    </section>
  )
}

// =============================================
// DONNÉES DES SECTIONS PARTENAIRES - AVEC CLÉS DE TRADUCTION
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
          <h1 className="font-['Bebas_Neue'] text-3xl sm:text-4xl">{t('partenaires:unavailable.title')}</h1>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base">
            {t('partenaires:unavailable.subtitle')}
          </p>
          <Link to="/">
            <Button className="mt-6 sm:mt-8 bg-[#46BDD6] hover:bg-[#3aadca] text-white">{t('common:common.back')}</Button>
          </Link>
        </div>
      </SiteLayout>
    )
  }

  // Fonction pour obtenir les traductions des sections
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
                {t('partenaires:statuts.title')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-[#666] leading-relaxed max-w-3xl mx-auto mb-4 sm:mb-6 text-center">
              {t('partenaires:statuts.subtitle')}
            </p>

            {/* CARROUSEL */}
            <div className="relative">
              {/* Dots */}
              <div className="flex justify-center gap-1.5 mb-3 sm:mb-4">
                {translatedSections.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSection
                        ? 'w-6 sm:w-8 bg-[#99CC33]'
                        : 'w-1.5 bg-[#d0d5c8]'
                      }`}
                  />
                ))}
              </div>

              {/* Section courante */}
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
                  <span className="hidden sm:inline">{t('common:common.previous')}</span>
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
                  <span className="hidden sm:inline">{t('common:common.next')}</span>
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
              <h3 className="font-['Bebas_Neue'] text-xl sm:text-2xl text-[#2C2C2C] mb-2">{t('partenaires:lightpop.title')}</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-[#666] mb-5 sm:mb-6">{t('partenaires:lightpop.desc')}</p>
              <div className="flex flex-col gap-2.5">
                <button
                  className="px-4 py-2.5 sm:py-3 rounded-xl border-none bg-[#99CC33] text-white text-xs sm:text-sm font-semibold hover:bg-[#88bb2e] transition-colors duration-200"
                  onClick={handleEnableLight}
                >
                  {t('partenaires:lightpop.enable')}
                </button>
                <button
                  className="px-4 py-2.5 sm:py-3 rounded-xl border border-[#e8e8e8] bg-transparent text-[#666] text-xs sm:text-sm font-semibold hover:bg-[#f5f5f5] transition-colors duration-200"
                  onClick={handleCloseLightPopup}
                >
                  {t('partenaires:lightpop.disable')}
                </button>
              </div>
              <label className="flex items-center justify-center gap-2 mt-4 text-[10px] sm:text-xs text-[#999] cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-[#99CC33] cursor-pointer"
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