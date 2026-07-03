import React, { useState } from 'react'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { Button } from '../components/ui/Button'
import { api } from '../lib/api'

const infos = [
  { icon: Mail, t: 'Email', v: 'hello@sarintany-coloc.mg' },
  { icon: Phone, t: 'Téléphone', v: '+261 34 12 345 67' },
  { icon: MapPin, t: 'Bureau', v: 'Isoraka, Antananarivo' }
]

export default function Contact() {
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' })
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('')
    setError('')
    setSubmitting(true)
    try {
      await api.contact(form)
      setStatus('Message envoye. Nous revenons vers vous rapidement.')
      setForm({ nom: '', email: '', sujet: '', message: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible d envoyer le message')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="bebas text-5xl text-center">On vous écoute</h1>
        <p className="text-center text-muted-foreground mt-2">
          Une question, un partenariat, un souci ? Écrivez-nous.
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {infos.map((i) => (
            <div key={i.t} className="bg-card border border-border rounded-2xl p-6 text-center">
              <div className="w-11 h-11 rounded-xl bg-brand-cyan-light text-brand-cyan-dark flex items-center justify-center mx-auto">
                <i.icon className="w-5 h-5" />
              </div>
              <div className="mt-4 text-xs uppercase text-muted-foreground font-semibold">{i.t}</div>
              <div className="mt-1 font-semibold">{i.v}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-8 bg-card border border-border rounded-2xl p-8">
          <div>
            <h2 className="bebas text-3xl">Envoyer un message</h2>
            <p className="text-sm text-muted-foreground mt-1">Réponse sous 24h ouvrées.</p>
            <MessageCircle className="w-24 h-24 text-brand-cyan-light mt-8" />
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {[
              ['nom', 'Nom', 'text'],
              ['email', 'Email', 'email'],
              ['sujet', 'Sujet', 'text']
            ].map(([name, label, type]) => (
              <div key={name}>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">{label}</label>
                <input
                  required
                  type={type}
                  value={form[name as keyof typeof form]}
                  onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white"
              />
            </div>
            {status && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{status}</div>}
            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <Button disabled={submitting} className="w-full bg-brand-cyan text-white hover:bg-brand-cyan-dark">
              {submitting ? 'Envoi...' : 'Envoyer'}
            </Button>
          </form>
        </div>
      </div>
    </SiteLayout>
  )
}
