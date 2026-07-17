import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ConciergeBell, Sparkles, Check, ShoppingCart, Send, CheckCircle2,
  UserCircle, Mail, Phone, MapPin, Briefcase, ArrowRight, Loader2, ClipboardList, Trash2,
  Leaf, Zap, Droplets, SprayCan, Shield, Paintbrush, Truck, Wrench,
} from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { Button } from '../components/ui/Button'
import { useAuth } from '../lib/auth'
import { api, ServiceCatalogueItem, DemandeServiceGroup } from '../lib/api'
import { cn } from '../lib/utils'

// Choisit une icône adaptée selon le nom du service (fallback : cloche).
function getServiceIcon(nom: string): React.ElementType {
  const k = (nom || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  if (k.includes('jardin') || k.includes('espace vert')) return Leaf
  if (k.includes('jirama') || k.includes('electr') || k.includes('courant')) return Zap
  if (k.includes('eau') || k.includes('plomb')) return Droplets
  if (k.includes('menage') || k.includes('nettoy') || k.includes('propre')) return SprayCan
  if (k.includes('gardien') || k.includes('securit') || k.includes('surveill')) return Shield
  if (k.includes('peint')) return Paintbrush
  if (k.includes('demenag') || k.includes('transport') || k.includes('livr')) return Truck
  if (k.includes('bricol') || k.includes('repar') || k.includes('depann')) return Wrench
  return ConciergeBell
}

const heroImage =
  'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80'

const UNITE_LABEL: Record<string, string> = {
  heure: '/ heure',
  forfait: 'forfait',
  jour: '/ jour',
  mois: '/ mois',
  an: '/ an',
  stere: '/ stère',
}

function formatAr(n: number) {
  return `${(n || 0).toLocaleString('fr-FR')} Ar`
}

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export default function Services() {
  const { t } = useTranslation(['services', 'common'])
  const { user } = useAuth()
  const navigate = useNavigate()

  const [catalogue, setCatalogue] = useState<ServiceCatalogueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Sélection multiple (sans quantité) : ensemble d'id_service cochés.
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [message, setMessage] = useState('')
  const [telephone, setTelephone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<{ reference: string; total: number } | null>(null)

  const [history, setHistory] = useState<DemandeServiceGroup[]>([])

  useEffect(() => {
    api
      .serviceCatalogue()
      .then(setCatalogue)
      .catch((e) => setError(e instanceof Error ? e.message : t('services:errors.load')))
      .finally(() => setLoading(false))
  }, [t])

  useEffect(() => {
    if (user?.telephone) setTelephone((prev) => prev || user.telephone || '')
  }, [user])

  useEffect(() => {
    if (!user) {
      setHistory([])
      return
    }
    api.myDemandesService().then(setHistory).catch(() => setHistory([]))
  }, [user, confirmation])

  const selectedLines = useMemo(
    () => catalogue.filter((s) => selected.has(s.id)),
    [catalogue, selected],
  )
  const total = selectedLines.reduce((sum, l) => sum + l.prix, 0)
  const count = selectedLines.length

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  const clearCart = () => setSelected(new Set())

  async function handleSubmit() {
    if (!user) {
      navigate('/auth?mode=signin&redirect=/services')
      return
    }
    if (!selectedLines.length) return
    setSubmitting(true)
    setError('')
    try {
      const res = await api.createDemandeService({
        services: selectedLines.map((l) => ({ id_service: l.id })),
        message: message.trim() || undefined,
        telephone: telephone.trim() || undefined,
      })
      setConfirmation({ reference: res.reference, total: res.total })
      clearCart()
      setMessage('')
    } catch (e) {
      setError(e instanceof Error ? e.message : t('services:errors.submit'))
    } finally {
      setSubmitting(false)
    }
  }

  const STATUT_LABEL: Record<string, { label: string; cls: string }> = {
    nouvelle: { label: t('services:status.new'), cls: 'bg-brand-cyan/10 text-brand-cyan-dark' },
    'en-cours': { label: t('services:status.inProgress'), cls: 'bg-amber-100 text-amber-700' },
    traitee: { label: t('services:status.processed'), cls: 'bg-brand-green/10 text-brand-green-dark' },
    annulee: { label: t('services:status.canceled'), cls: 'bg-red-100 text-red-600' },
  }

  return (
    <SiteLayout>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan-dark/90 via-brand-cyan/70 to-brand-green/70" />
        </div>
        <div className="relative w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24 text-white">
          <motion.div {...fadeInUp} className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-sm font-medium mb-5">
              <ConciergeBell className="w-4 h-4" /> {t('services:hero.badge')}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
              {t('services:hero.title')}
            </h1>
            <p className="text-white/90 text-base md:text-lg">
              {t('services:hero.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-14">
        {/* ===== INFOS UTILISATEUR (compact, secondaire) ===== */}
        <motion.div {...fadeInUp} className="mb-6">
          {user ? (
            <div className="rounded-2xl border border-border/60 bg-white shadow-sm px-4 py-2.5 flex items-center gap-3 flex-wrap">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                {(user.prenom?.[0] || '') + (user.nom?.[0] || '') || user.initials || 'U'}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm leading-tight truncate">
                  {`${user.prenom || ''} ${user.nom || ''}`.trim() || t('services:user.myAccount')}
                </p>
                <div className="flex items-center gap-x-3 gap-y-0.5 flex-wrap text-xs text-muted-foreground mt-0.5">
                  <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</span>
                  {user.telephone && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{user.telephone}</span>}
                  {user.villeActuelle && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{user.villeActuelle}</span>}
                </div>
              </div>
              <span className="ml-auto text-[11px] text-muted-foreground hidden md:block">{t('services:user.accountLabel')}</span>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-brand-cyan/40 bg-brand-cyan/5 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-cyan/15 flex items-center justify-center flex-shrink-0">
                  <UserCircle className="w-5 h-5 text-brand-cyan-dark" />
                </div>
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{t('services:user.notConnected')}</span>
                  <span className="text-muted-foreground"> — {t('services:user.notConnectedDesc')}</span>
                </p>
              </div>
              <Link to="/auth?mode=signin&redirect=/services" className="sm:ml-auto">
                <Button size="sm" className="rounded-xl bg-gradient-to-r from-brand-cyan to-brand-green text-white">
                  {t('common:common.login')} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* ===== CATALOGUE + PANIER ===== */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Liste des services */}
          <div className="lg:col-span-2">
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-brand-green" />
                <h2 className="text-2xl font-extrabold text-foreground">{t('services:catalogue.title')}</h2>
                {!loading && (
                  <span className="text-sm font-semibold text-brand-cyan-dark bg-brand-cyan/10 rounded-full px-2.5 py-0.5">
                    {catalogue.length}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {t('services:catalogue.subtitle')}
              </p>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-[76px] rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : error && !catalogue.length ? (
              <p className="text-red-600">{error}</p>
            ) : catalogue.length === 0 ? (
              <div className="rounded-2xl border border-border/60 bg-white p-8 text-center text-muted-foreground">
                {t('services:catalogue.empty')}
              </div>
            ) : (
              <div className="space-y-3">
                {catalogue.map((s, i) => {
                  const active = selected.has(s.id)
                  const Icon = getServiceIcon(s.nom)
                  return (
                    <motion.button
                      key={s.id}
                      type="button"
                      onClick={() => toggle(s.id)}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      aria-pressed={active}
                      className={cn(
                        'group w-full text-left rounded-2xl border bg-white p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-md',
                        active
                          ? 'border-brand-cyan ring-2 ring-brand-cyan/25 shadow-sm'
                          : 'border-border/60 hover:border-brand-cyan/40',
                      )}
                    >
                      {/* Icône */}
                      <div className="w-9 h-9 rounded-xl bg-brand-cyan/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-brand-cyan-dark" />
                      </div>

                      {/* Nom + description */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground leading-snug truncate">{s.nom}</div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {s.description || t('services:catalogue.defaultDesc')}
                        </p>
                      </div>

                      {/* Prix (unité masquée) */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-extrabold text-foreground tabular-nums leading-none">{formatAr(s.prix)}</div>
                      </div>

                      {/* Checkbox rond */}
                      <span
                        className={cn(
                          'w-6 h-6 rounded-full grid place-items-center border-2 flex-shrink-0 transition-all',
                          active
                            ? 'bg-brand-cyan border-brand-cyan text-white'
                            : 'border-border/70 group-hover:border-brand-cyan/60',
                        )}
                      >
                        {active && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Panier / récap */}
          <div className="lg:sticky lg:top-24">
            <div className="rounded-3xl border border-border/60 bg-white shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-brand-cyan to-brand-green px-6 py-4 text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <h2 className="font-semibold">{t('services:cart.title')}</h2>
                {count > 0 && (
                  <span className="ml-auto text-xs font-bold bg-white/20 px-2 py-1 rounded-full">
                    {count} {count > 1 ? t('services:cart.items') : t('services:cart.item')}
                  </span>
                )}
              </div>

              <div className="p-6">
                {selectedLines.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    {t('services:cart.empty')}
                  </p>
                ) : (
                  <>
                    <ul className="space-y-3 mb-4">
                      <AnimatePresence initial={false}>
                        {selectedLines.map((l) => (
                          <motion.li
                            key={l.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <div className="min-w-0 flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-brand-green flex-shrink-0" />
                              <p className="font-medium text-foreground truncate">{l.nom}</p>
                            </div>
                            <span className="font-semibold whitespace-nowrap">{formatAr(l.prix)}</span>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>

                    <div className="flex items-center justify-between border-t border-border/60 pt-4 mb-4">
                      <span className="font-semibold text-foreground">{t('services:cart.total')}</span>
                      <span className="text-xl font-extrabold text-brand-cyan-dark">{formatAr(total)}</span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <input
                        type="tel"
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        placeholder={t('services:cart.phonePlaceholder')}
                        className="w-full rounded-xl border border-border/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
                      />
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        placeholder={t('services:cart.messagePlaceholder')}
                        className="w-full rounded-xl border border-border/60 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
                      />
                    </div>

                    {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full rounded-xl bg-gradient-to-r from-brand-cyan to-brand-green text-white shadow-md"
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> {t('common:common.loading')}</>
                      ) : user ? (
                        <><Send className="w-4 h-4 mr-1" /> {t('services:cart.submit')}</>
                      ) : (
                        <><UserCircle className="w-4 h-4 mr-1" /> {t('services:cart.loginToSubmit')}</>
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={clearCart}
                      className="w-full mt-2 inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> {t('services:cart.clear')}
                    </button>
                  </>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-3 px-4">
              {t('services:cart.disclaimer')}
            </p>
          </div>
        </div>

        {/* ===== HISTORIQUE ===== */}
        {user && history.length > 0 && (
          <motion.div {...fadeInUp} className="mt-14">
            <div className="flex items-center gap-2 mb-5">
              <ClipboardList className="w-5 h-5 text-brand-cyan-dark" />
              <h2 className="text-xl font-bold text-foreground">{t('services:history.title')}</h2>
            </div>
            <div className="space-y-4">
              {history.map((d) => {
                const st = STATUT_LABEL[d.statut] || STATUT_LABEL.nouvelle
                return (
                  <div key={d.reference} className="rounded-2xl border border-border/60 bg-white p-5">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="font-mono text-sm font-semibold text-foreground">{d.reference}</span>
                      <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', st.cls)}>
                        {st.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(d.date_creation).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="ml-auto font-bold text-brand-cyan-dark">{formatAr(d.total)}</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {d.lignes.map((l, idx) => (
                        <li key={idx} className="flex justify-between gap-3">
                          <span>{l.nom}</span>
                          <span>{formatAr(l.sous_total)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* ===== CONFIRMATION ===== */}
      <AnimatePresence>
        {confirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm grid place-items-center p-4"
            onClick={() => setConfirmation(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full bg-brand-green/15 grid place-items-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9 text-brand-green" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1">{t('services:confirmation.title')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('services:confirmation.subtitle')}
              </p>
              <div className="rounded-2xl bg-muted/60 px-4 py-3 mb-6">
                <p className="text-xs text-muted-foreground">{t('services:confirmation.reference')}</p>
                <p className="font-mono font-bold text-foreground">{confirmation.reference}</p>
                <p className="text-sm mt-1">
                  {t('services:confirmation.total')} : <span className="font-semibold">{formatAr(confirmation.total)}</span>
                </p>
              </div>
              <Button
                onClick={() => setConfirmation(null)}
                className="w-full rounded-xl bg-gradient-to-r from-brand-cyan to-brand-green text-white"
              >
                {t('services:confirmation.ok')}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SiteLayout>
  )
}

function Info({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-brand-cyan mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  )
}