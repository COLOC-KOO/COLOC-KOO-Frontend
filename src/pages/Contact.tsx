import React, { useState, useRef } from 'react'
import { Mail, MapPin, MessageCircle, Phone, Send, CheckCircle2, Sparkles, Clock, Award, Building2, Users, Heart, ArrowRight, Facebook, Twitter, Linkedin, Instagram, Search } from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { Button } from '../components/ui/Button'
import { api } from '../lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

// Image hero identique à celle de Home.tsx
const heroImage = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80"

const infos = [
  { icon: Mail, t: 'Email', v: 'hello@sarintany-coloc.mg', desc: 'Réponse sous 24h' },
  { icon: Phone, t: 'Téléphone', v: '+261 34 12 345 67', desc: 'Lun - Ven, 9h - 18h' },
  { icon: MapPin, t: 'Bureau', v: 'Isoraka, Antananarivo', desc: 'Venez nous rencontrer' }
]

const stats = [
  { label: 'Colocataires', value: '1 400+', icon: Users },
  { label: 'Annonces', value: '120+', icon: Building2 },
  { label: 'Satisfaction', value: '4.8/5', icon: Heart },
  { label: 'Partenaires', value: '25+', icon: Award },
]

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Instagram, href: '#', label: 'Instagram' },
]

export default function Contact() {
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' })
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('')
    setError('')
    setSubmitting(true)
    try {
      await api.contact(form)
      setStatus('Message envoyé avec succès ! Nous revenons vers vous rapidement.')
      setForm({ nom: '', email: '', sujet: '', message: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible d\'envoyer le message')
    } finally {
      setSubmitting(false)
    }
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <SiteLayout>
      {/* Section Hero avec l'image de fond */}
      <section className="relative">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
          {/* Overlay plus foncé pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          {/* Ajout d'un overlay de couleur pour harmoniser */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/20 to-brand-green/20 mix-blend-overlay" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-16 text-white">
          {/* Header avec animation */}
          <motion.div 
            className="text-center"
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
              Contactez-nous
            </motion.div>
            <motion.h1 
              className="bebas text-5xl md:text-7xl drop-shadow-2xl"
              animate={{ 
                textShadow: ['0 0 20px rgba(255,255,255,0.2)', '0 0 40px rgba(255,255,255,0.1)', '0 0 20px rgba(255,255,255,0.2)'],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <span className="text-white">On vous</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
                écoute
              </span>
            </motion.h1>
            <motion.p 
              className="text-white/90 mt-2 max-w-2xl mx-auto text-lg bg-black/15 backdrop-blur-md p-4 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Une question, un partenariat, un souci ? Écrivez-nous. 
              Notre équipe est là pour vous accompagner.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Le reste du contenu */}
      <div className="relative overflow-hidden">
        {/* Background gradient avec formes */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-cyan-light/20 via-white/0 to-white/0" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-brand-cyan/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-brand-green/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-6xl mx-auto px-6 py-16">
          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                className="bg-white border border-border/60 rounded-2xl p-5 text-center shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <stat.icon className="w-6 h-6 text-brand-cyan mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Contact Cards */}
          <motion.div 
            className="grid md:grid-cols-3 gap-4 mb-12"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {infos.map((info, index) => (
              <motion.div
                key={info.t}
                variants={fadeInUp}
                className="group relative bg-white border border-border/60 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-brand-cyan/30"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-cyan-light/0 to-brand-cyan-light/0 group-hover:from-brand-cyan-light/20 group-hover:to-brand-cyan/5 transition-all duration-300" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-cyan-light to-brand-cyan/20 text-brand-cyan-dark flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <info.icon className="w-6 h-6" />
                  </div>
                  <div className="mt-4 text-xs uppercase text-muted-foreground font-semibold tracking-wider">{info.t}</div>
                  <div className="mt-1 font-semibold text-foreground">{info.v}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{info.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Formulaire principal */}
          <motion.div 
            className="grid md:grid-cols-5 gap-8 bg-white border border-border/60 rounded-3xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Sidebar gauche */}
            <div className="md:col-span-2 bg-gradient-to-br from-brand-cyan to-brand-green p-8 md:p-10 flex flex-col justify-between text-white">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="bebas text-4xl md:text-5xl">Envoyer un message</h2>
                  <p className="mt-2 text-white/80 text-sm">
                    Réponse sous 24h ouvrées. Nous sommes à votre écoute.
                  </p>
                </motion.div>
                
                <motion.div 
                  className="mt-8 space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {[
                    { icon: Clock, text: 'Réponse rapide' },
                    { icon: Users, text: 'Équipe dédiée' },
                    { icon: CheckCircle2, text: 'Satisfaction garantie' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-white/80">
                      <item.icon className="w-4 h-4 text-white/60" />
                      <span className="text-sm">{item.text}</span>
                    </div>
                  ))}
                </motion.div>
              </div>

              <motion.div 
                className="mt-8 pt-6 border-t border-white/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-sm text-white/70">Suivez-nous</p>
                <div className="flex gap-3 mt-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
                      aria-label={social.label}
                    >
                      <social.icon className="w-4 h-4 text-white" />
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Formulaire */}
            <div className="md:col-span-3 p-8 md:p-10">
              <form ref={formRef} className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <motion.div 
                    className="space-y-1.5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-semibold text-foreground">
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={form.nom}
                      onChange={(event) => setForm((current) => ({ ...current, nom: event.target.value }))}
                      className="w-full rounded-xl border border-border/60 px-4 py-3 text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all"
                      placeholder="Jean Dupont"
                    />
                  </motion.div>
                  <motion.div 
                    className="space-y-1.5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <label className="block text-sm font-semibold text-foreground">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                      className="w-full rounded-xl border border-border/60 px-4 py-3 text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all"
                      placeholder="jean@exemple.com"
                    />
                  </motion.div>
                </div>

                <motion.div 
                  className="space-y-1.5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-semibold text-foreground">
                    Sujet <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={form.sujet}
                    onChange={(event) => setForm((current) => ({ ...current, sujet: event.target.value }))}
                    className="w-full rounded-xl border border-border/60 px-4 py-3 text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all"
                    placeholder="Demande d'information"
                  />
                </motion.div>

                <motion.div 
                  className="space-y-1.5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <label className="block text-sm font-semibold text-foreground">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                    className="w-full rounded-xl border border-border/60 px-4 py-3 text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all resize-none"
                    placeholder="Décrivez votre demande en détail..."
                  />
                </motion.div>

                {/* Messages de statut */}
                <AnimatePresence>
                  {status && (
                    <motion.div 
                      className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-4 flex items-start gap-3 text-sm text-green-700"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    >
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
                      {status}
                    </motion.div>
                  )}
                  {error && (
                    <motion.div 
                      className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3 text-sm text-red-700"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    >
                      <span className="text-red-500 text-lg">⚠️</span>
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button 
                    disabled={submitting} 
                    className="w-full rounded-xl bg-gradient-to-r from-brand-cyan to-blue-500 hover:from-brand-cyan-dark hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200 text-base py-3.5"
                  >
                    {submitting ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </motion.div>

                <motion.p 
                  className="text-center text-xs text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 }}
                >
                  En envoyant ce formulaire, vous acceptez notre politique de confidentialité.
                </motion.p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </SiteLayout>
  )
}