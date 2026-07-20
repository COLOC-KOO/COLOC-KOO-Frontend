import React, { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  ArrowLeft, ArrowRight, Camera, Check, House, Info, MapPin, 
  Upload, X, Image, Trash2, Sparkles, Shield, Clock, Users, Ruler, Bed, 
  Wifi, Coffee, Car, Dog, AlertCircle, Building2, CheckCircle2, 
  Loader2, PartyPopper, Home, Key, Heart, Star, Award, Zap, Search, Banknote
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { SiteLayout } from '../components/site/SiteLayout'
import { Button } from '../components/ui/Button'
import { api, Ville } from '../lib/api'
import { useAuth } from '../lib/auth'
import { motion, AnimatePresence } from 'framer-motion'

// Ajout de l'image hero
const heroImage = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80"

const steps = [
  { n: 1, label: 'Type', icon: House, description: 'Type de bien', color: 'from-blue-400 to-cyan-400' },
  { n: 2, label: 'Localisation', icon: MapPin, description: 'Où se situe-t-il ?', color: 'from-cyan-400 to-teal-400' },
  { n: 3, label: 'Détails', icon: Info, description: 'Caractéristiques', color: 'from-teal-400 to-green-400' },
  { n: 4, label: 'Photos', icon: Camera, description: 'Images du bien', color: 'from-green-400 to-yellow-400' },
  { n: 5, label: 'Tarifs', icon: Banknote, description: 'Prix et conditions', color: 'from-yellow-400 to-orange-400' },
]

function Field({ label, children, required, help, className = '' }: { 
  label: string; 
  children: React.ReactNode; 
  required?: boolean; 
  help?: string;
  className?: string;
}) {
  return (
    <motion.div 
      className={`space-y-1.5 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label className="block text-sm font-semibold text-foreground">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {help && <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Info className="w-3 h-3" />
        {help}
      </p>}
    </motion.div>
  )
}

export default function Deposer() {
  const { t } = useTranslation(['deposer', 'common'])
  const [step, setStep] = useState(1)
  const [villes, setVilles] = useState<Ville[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [form, setForm] = useState({
    titre: '',
    description: '',
    type_propriete: 'appartement',
    type_bail: 'collectif',
    clause_solidarite: 'sans',
    type_bailleur: 'membre',
    id_ville: 1,
    quartier: '',
    adresse_exacte: '',
    surface_totale: '',
    total_colocataires: '',
    surface_chambre: '',
    est_meuble: 'Oui',
    date_disponibilite: '',
    prix_loyer: '',
    prix_charges: '',
    montant_garantie: '',
    services: 'Wi-Fi, Cuisine équipée',
    regles: 'Non fumeur',
    photos: [] as string[],
  })

  useEffect(() => {
    api.villes().then((rows) => {
      const uniqueCities = rows.reduce<Ville[]>((acc, city) => {
        const exists = acc.some((item) => item.nom_ville.toLowerCase() === city.nom_ville.toLowerCase())
        if (!exists) {
          acc.push(city)
        }
        return acc
      }, [])
      setVilles(uniqueCities)
      if (uniqueCities[0]) setForm((current) => ({ ...current, id_ville: uniqueCities[0].id_ville }))
    })
  }, [])

  function update(name: string, value: string | number) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    await uploadPhotos(files)
  }

  async function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragOver(false)
    const files = Array.from(event.dataTransfer.files).filter(file => file.type.startsWith('image/'))
    if (!files.length) return
    await uploadPhotos(files)
  }

  async function uploadPhotos(files: File[]) {
    setError('')
    setUploadingPhotos(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      files.forEach((file) => formData.append('photos', file))
      
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const result = await api.uploadAnnoncePhotos(formData)
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (!Array.isArray(result.photos)) {
        throw new Error('Réponse photo invalide du serveur')
      }
      
      setTimeout(() => {
        setForm((current) => ({ ...current, photos: [...current.photos, ...result.photos] }))
        setUploadProgress(0)
      }, 300)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : t('deposer:errors.upload'))
      setUploadProgress(0)
    } finally {
      setTimeout(() => setUploadingPhotos(false), 500)
    }
  }

  function removePhoto(index: number) {
    setForm((current) => ({
      ...current,
      photos: current.photos.filter((_, i) => i !== index)
    }))
  }

  async function submitAnnonce() {
    if (!user) {
      navigate('/auth?mode=signin&redirect=/deposer')
      return
    }
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await api.createAnnonce({
        titre: form.titre,
        description: form.description,
        type_bailleur: form.type_bailleur,
        type_annonce: user.poste === 'proprietaire' ? 'creation' : 'existante',
        type_propriete: form.type_propriete,
        type_bail: form.type_bail,
        clause_solidarite: form.clause_solidarite,
        total_colocataires: form.total_colocataires ? Number(form.total_colocataires) : null,
        surface_totale: form.surface_totale ? Number(form.surface_totale) : null,
        adresse_exacte: form.adresse_exacte || null,
        quartier: form.quartier || null,
        id_ville: Number(form.id_ville),
        chambres: {
          surface: form.surface_chambre ? Number(form.surface_chambre) : null,
          est_meuble: form.est_meuble,
          prix_loyer: Number(form.prix_loyer),
          prix_charges: form.prix_charges ? Number(form.prix_charges) : null,
          montant_garantie: form.montant_garantie ? Number(form.montant_garantie) : null,
          date_disponibilite: form.date_disponibilite,
        },
        services: form.services.split(',').map((item) => item.trim()).filter(Boolean),
        regles: form.regles.split(',').map((item) => item.trim()).filter(Boolean),
        photos: form.photos.filter((photo) => Boolean(photo)),
      })
      
      setShowSuccessAnimation(true)
      setSuccess(t('deposer:success.message'))
      
      setTimeout(() => {
        setForm({
          titre: '',
          description: '',
          type_propriete: 'appartement',
          type_bail: 'collectif',
          clause_solidarite: 'sans',
          type_bailleur: 'membre',
          id_ville: form.id_ville,
          quartier: '',
          adresse_exacte: '',
          surface_totale: '',
          total_colocataires: '',
          surface_chambre: '',
          est_meuble: 'Oui',
          date_disponibilite: '',
          prix_loyer: '',
          prix_charges: '',
          montant_garantie: '',
          services: 'Wi-Fi, Cuisine équipée',
          regles: 'Non fumeur',
          photos: [],
        })
        setStep(1)
        setShowSuccessAnimation(false)
      }, 4000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : t('deposer:errors.submit'))
    } finally {
      setSubmitting(false)
    }
  }

  const isStepValid = () => {
    switch(step) {
      case 1: return form.titre.trim().length > 0
      case 2: return form.quartier.trim().length > 0
      case 3: return true
      case 4: return true
      case 5: return form.prix_loyer && form.date_disponibilite
      default: return true
    }
  }

  // Définition des animations
  const pageVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  }

  const pageTransition = {
    duration: 0.5,
    ease: "easeOut" as const
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <SiteLayout>
      {/* Section Hero avec l'image de fond */}
      <section className="relative">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/20 to-brand-green/20 mix-blend-overlay" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 py-12 text-white">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-semibold mb-4 border border-white/20 shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              {t('deposer:hero.badge')}
            </motion.div>
            <motion.h1 
              className="bebas text-5xl md:text-7xl drop-shadow-2xl"
              animate={{ 
                textShadow: ['0 0 20px rgba(255,255,255,0.2)', '0 0 40px rgba(255,255,255,0.1)', '0 0 20px rgba(255,255,255,0.2)'],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <span className="text-white">{t('deposer:hero.title')}</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
                {t('deposer:hero.highlight')}
              </span>
            </motion.h1>
            <motion.p 
              className="text-white/90 mt-2 max-w-2xl mx-auto text-lg bg-black/15 backdrop-blur-md p-4 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {t('deposer:hero.subtitle')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Formulaire */}
      <div className="relative bg-gradient-to-b from-brand-cyan-light/30 via-white/0 to-white/0 overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-6 py-12">
          {!user && (
            <motion.div 
              className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 flex items-center justify-between gap-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{t('deposer:auth.required')}</span>
              </div>
              <Link to="/auth?mode=signin&redirect=/deposer" className="font-semibold underline hover:text-amber-900 transition-colors">
                {t('deposer:auth.login')}
              </Link>
            </motion.div>
          )}

          {/* Steps */}
          <motion.div 
            className="relative mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="absolute top-6 left-0 right-0 h-1 bg-border rounded-full z-0 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-brand-cyan to-brand-green rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>

            <div className="relative z-10 flex justify-between">
              {steps.map((s, i) => {
                const active = step === s.n
                const done = step > s.n
                const stepLabel = t(`deposer:steps.${s.n}.label`)
                const stepDescription = t(`deposer:steps.${s.n}.description`)
                return (
                  <button
                    key={s.n}
                    onClick={() => setStep(s.n)}
                    className="flex flex-col items-center gap-2 group flex-1"
                    disabled={!done && !active}
                  >
                    <motion.div
                      className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center border-2 shadow-lg transition-all duration-300
                        ${done 
                          ? 'bg-gradient-to-br from-brand-green to-emerald-500 border-brand-green text-white shadow-green-500/30' 
                          : active 
                            ? 'bg-gradient-to-br from-brand-cyan to-blue-500 border-brand-cyan text-white shadow-cyan-500/30 scale-110' 
                            : 'bg-white border-border text-muted-foreground hover:border-brand-cyan/30 hover:shadow-md'
                        }
                      `}
                    >
                      {done ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                    </motion.div>
                    <div className="text-center">
                      <div className={`text-xs font-semibold ${active ? 'text-brand-cyan-dark' : done ? 'text-brand-green' : 'text-muted-foreground'}`}>
                        {stepLabel}
                      </div>
                      <div className="hidden md:block text-[10px] text-muted-foreground">
                        {stepDescription}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Form avec animations de transition */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={step}
              className="mt-10 bg-white rounded-3xl border border-border shadow-xl p-8 md:p-10"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              {step === 1 && (
                <motion.div 
                  className="space-y-6"
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                  transition={{ staggerChildren: 0.1 }}
                >
                  <motion.div 
                    className="flex items-center gap-3"
                    variants={itemVariants}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-blue-400/30">
                      <House className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{t('deposer:step1.title')}</h2>
                      <p className="text-sm text-muted-foreground">{t('deposer:step1.subtitle')}</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="grid md:grid-cols-3 gap-3"
                    variants={itemVariants}
                  >
                    {[
                      ['appartement', 'Appartement', '🏢'],
                      ['maison', 'Maison', '🏠'],
                      ['autre', 'Autre', '🏘️'],
                    ].map(([value, label, emoji]) => (
                      <label 
                        key={value} 
                        className={`
                          border-2 rounded-2xl p-5 cursor-pointer transition-all duration-300
                          ${form.type_propriete === value 
                            ? 'border-brand-cyan bg-brand-cyan-light shadow-md' 
                            : 'border-border hover:border-brand-cyan/30 hover:bg-muted/50'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="type_propriete"
                          value={value}
                          checked={form.type_propriete === value}
                          onChange={(e) => update('type_propriete', e.target.value)}
                          className="sr-only"
                        />
                        <div className="text-4xl">{emoji}</div>
                        <div className="mt-2 font-semibold">{label}</div>
                      </label>
                    ))}
                  </motion.div>

                  <Field label={t('deposer:step1.titleField')} required help={t('deposer:step1.titleHelp')}>
                    <input 
                      className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all" 
                      value={form.titre} 
                      onChange={(e) => update('titre', e.target.value)} 
                      placeholder={t('deposer:step1.titlePlaceholder')}
                    />
                  </Field>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  className="space-y-6"
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                  transition={{ staggerChildren: 0.1 }}
                >
                  <motion.div className="flex items-center gap-3" variants={itemVariants}>
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-cyan-400/30">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{t('deposer:step2.title')}</h2>
                      <p className="text-sm text-muted-foreground">{t('deposer:step2.subtitle')}</p>
                    </div>
                  </motion.div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label={t('deposer:step2.city')} required>
                      <select className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all" value={form.id_ville} onChange={(e) => update('id_ville', Number(e.target.value))}>
                        {villes.map((v) => (
                          <option key={v.id_ville} value={v.id_ville}>{v.nom_ville}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label={t('deposer:step2.district')} required>
                      <input className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all" value={form.quartier} onChange={(e) => update('quartier', e.target.value)} placeholder={t('deposer:step2.districtPlaceholder')} />
                    </Field>
                    <div className="md:col-span-2">
                      <Field label={t('deposer:step2.address')} help={t('deposer:step2.addressHelp')}>
                        <input className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all" value={form.adresse_exacte} onChange={(e) => update('adresse_exacte', e.target.value)} placeholder={t('deposer:step2.addressPlaceholder')} />
                      </Field>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  className="space-y-6"
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                  transition={{ staggerChildren: 0.1 }}
                >
                  <motion.div className="flex items-center gap-3" variants={itemVariants}>
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-green-400 text-white flex items-center justify-center shadow-lg shadow-teal-400/30">
                      <Info className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{t('deposer:step3.title')}</h2>
                      <p className="text-sm text-muted-foreground">{t('deposer:step3.subtitle')}</p>
                    </div>
                  </motion.div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label={t('deposer:step3.surface')}>
                      <div className="relative">
                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="number" className="w-full rounded-xl border border-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all" value={form.surface_totale} onChange={(e) => update('surface_totale', e.target.value)} placeholder="45" />
                      </div>
                    </Field>
                    <Field label={t('deposer:step3.colocataires')}>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="number" className="w-full rounded-xl border border-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all" value={form.total_colocataires} onChange={(e) => update('total_colocataires', e.target.value)} placeholder="3" />
                      </div>
                    </Field>
                    <Field label={t('deposer:step3.roomSurface')}>
                      <div className="relative">
                        <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="number" className="w-full rounded-xl border border-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all" value={form.surface_chambre} onChange={(e) => update('surface_chambre', e.target.value)} placeholder="12" />
                      </div>
                    </Field>
                    <Field label={t('deposer:step3.furnished')}>
                      <select className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all" value={form.est_meuble} onChange={(e) => update('est_meuble', e.target.value)}>
                        <option value="Oui">✅ {t('deposer:step3.furnishedYes')}</option>
                        <option value="Partiellement">🔶 {t('deposer:step3.furnishedPartial')}</option>
                        <option value="Non">❌ {t('deposer:step3.furnishedNo')}</option>
                        <option value="Rachat">🔄 {t('deposer:step3.furnishedBuyout')}</option>
                      </select>
                    </Field>
                    <Field label={t('deposer:step3.availability')} required>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="date" className="w-full rounded-xl border border-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all" value={form.date_disponibilite} onChange={(e) => update('date_disponibilite', e.target.value)} />
                      </div>
                    </Field>
                    <Field label={t('deposer:step3.services')} help={t('deposer:step3.servicesHelp')}>
                      <input className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all" value={form.services} onChange={(e) => update('services', e.target.value)} placeholder={t('deposer:step3.servicesPlaceholder')} />
                    </Field>
                    <div className="md:col-span-2">
                      <Field label={t('deposer:step3.description')}>
                        <textarea 
                          rows={4} 
                          className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all resize-none" 
                          value={form.description} 
                          onChange={(e) => update('description', e.target.value)} 
                          placeholder={t('deposer:step3.descriptionPlaceholder')}
                        />
                      </Field>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                  className="space-y-6"
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                  transition={{ staggerChildren: 0.1 }}
                >
                  <motion.div className="flex items-center gap-3" variants={itemVariants}>
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 to-yellow-400 text-white flex items-center justify-center shadow-lg shadow-green-400/30">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{t('deposer:step4.title')}</h2>
                      <p className="text-sm text-muted-foreground">{t('deposer:step4.subtitle')}</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className={`
                      relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300
                      ${dragOver ? 'border-brand-cyan bg-brand-cyan-light/40 shadow-lg shadow-brand-cyan/20' : 'border-border hover:border-brand-cyan/50 hover:bg-muted/30'}
                    `}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    variants={itemVariants}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handlePhotoUpload}
                    />
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-cyan-light to-brand-cyan/20 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-brand-cyan" />
                      </div>
                      <div>
                        <p className="font-medium">{dragOver ? t('deposer:step4.drop') : t('deposer:step4.drag')}</p>
                        <p className="text-sm text-muted-foreground">{t('deposer:step4.click')}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{t('deposer:step4.formats')}</span>
                    </div>
                  </motion.div>

                  {uploadingPhotos && (
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t('deposer:step4.uploading')}
                        </span>
                        <span className="font-semibold text-brand-cyan">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-brand-cyan to-brand-green rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {form.photos.length > 0 && (
                    <motion.div 
                      className="grid grid-cols-2 md:grid-cols-4 gap-3"
                      variants={itemVariants}
                    >
                      {form.photos.map((photo, index) => (
                        <motion.div 
                          key={index} 
                          className="relative group aspect-square rounded-xl overflow-hidden border border-border"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.05, zIndex: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                            {index + 1}/{form.photos.length}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {step === 5 && (
                <motion.div 
                  className="space-y-6"
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                  transition={{ staggerChildren: 0.1 }}
                >
                  <motion.div className="flex items-center gap-3" variants={itemVariants}>
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 text-white flex items-center justify-center shadow-lg shadow-yellow-400/30">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{t('deposer:step5.title')}</h2>
                      <p className="text-sm text-muted-foreground">{t('deposer:step5.subtitle')}</p>
                    </div>
                  </motion.div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label={t('deposer:step5.rent')} required>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">Ar</div>
                        <input type="number" className="w-full rounded-xl border border-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all" value={form.prix_loyer} onChange={(e) => update('prix_loyer', e.target.value)} placeholder="500 000" />
                      </div>
                    </Field>
                    <Field label={t('deposer:step5.charges')}>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">Ar</div>
                        <input type="number" className="w-full rounded-xl border border-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all" value={form.prix_charges} onChange={(e) => update('prix_charges', e.target.value)} placeholder="50 000" />
                      </div>
                    </Field>
                    <Field label={t('deposer:step5.deposit')}>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="number" className="w-full rounded-xl border border-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all" value={form.montant_garantie} onChange={(e) => update('montant_garantie', e.target.value)} placeholder="500 000" />
                      </div>
                    </Field>
                    <Field label={t('deposer:step5.rules')} help={t('deposer:step5.rulesHelp')}>
                      <input className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all" value={form.regles} onChange={(e) => update('regles', e.target.value)} placeholder={t('deposer:step5.rulesPlaceholder')} />
                    </Field>
                    <Field label={t('deposer:step5.leaseType')} help={t('deposer:step5.leaseHelp')}>
                      <select className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all" value={form.type_bail} onChange={(e) => update('type_bail', e.target.value)}>
                        <option value="collectif">{t('deposer:step5.leaseCollective')}</option>
                        <option value="individuel">{t('deposer:step5.leaseIndividual')}</option>
                      </select>
                    </Field>
                    <Field label={t('deposer:step5.solidarity')}>
                      <select className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all" value={form.clause_solidarite} onChange={(e) => update('clause_solidarite', e.target.value)}>
                        <option value="sans">{t('deposer:step5.solidarityWithout')}</option>
                        <option value="avec">{t('deposer:step5.solidarityWith')}</option>
                      </select>
                    </Field>
                  </div>

                  <motion.div 
                    className="rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 p-6 border border-border"
                    variants={itemVariants}
                  >
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-brand-green" />
                      {t('deposer:step5.summary')}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {[
                        [t('deposer:step5.summaryTitle'), form.titre || '—'],
                        [t('deposer:step5.summaryLocation'), form.quartier || '—'],
                        [t('deposer:step5.summaryPrice'), form.prix_loyer ? `${Number(form.prix_loyer).toLocaleString('fr-FR')} Ar` : '—'],
                        [t('deposer:step5.summaryType'), form.type_propriete.charAt(0).toUpperCase() + form.type_propriete.slice(1)],
                        [t('deposer:step5.summaryPhotos'), `${form.photos.length} ${t('deposer:step5.summaryPhotosLabel')}`],
                        [t('deposer:step5.summaryAvailability'), form.date_disponibilite ? new Date(form.date_disponibilite).toLocaleDateString('fr-FR') : '—'],
                      ].map(([label, value], index) => (
                        <div key={index}>
                          <span className="text-muted-foreground">{label}</span>
                          <p className="font-medium truncate">{value}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {error && (
                <motion.div 
                  className="mt-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3 text-sm text-red-700"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div 
                  className="mt-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-4 flex items-start gap-3 text-sm text-green-700"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  {success}
                </motion.div>
              )}

              {showSuccessAnimation && (
                <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
                  <div className="text-8xl">🎉</div>
                </div>
              )}

              {/* Navigation */}
              <div className="mt-8 pt-6 border-t border-border flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
                <Button 
                  onClick={() => setStep(Math.max(1, step - 1))} 
                  disabled={step === 1}
                  variant="outline"
                  className="rounded-xl border-2 hover:border-brand-cyan hover:bg-brand-cyan/5 transition-all duration-200 w-full sm:w-auto"
                >
                  {t('common:common.previous')}
                </Button>
                {step < 5 ? (
                  <Button 
                    type="button" 
                    onClick={() => setStep(step + 1)} 
                    className="rounded-xl bg-gradient-to-r from-brand-cyan to-blue-500 hover:from-brand-cyan-dark hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
                    disabled={!isStepValid()}
                  >
                    {t('common:common.next')}
                  </Button>
                ) : (
                  <Button 
                    disabled={submitting || !form.titre || !form.prix_loyer || !form.date_disponibilite} 
                    onClick={submitAnnonce} 
                    className="rounded-xl bg-gradient-to-r from-brand-green to-emerald-500 hover:from-brand-green-dark hover:to-emerald-600 text-white shadow-md hover:shadow-lg transition-all duration-200 text-base px-8 w-full sm:w-auto"
                  >
                    {submitting ? t('common:common.loading') : t('deposer:step5.submit')}
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </SiteLayout>
  )
}