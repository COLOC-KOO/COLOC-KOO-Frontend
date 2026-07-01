import React, { useState } from 'react'
import { Bell, Check, CreditCard, FileText, Lock, Upload, User } from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { Button } from '../components/ui/Button'

const tabs = [
  { id: 'profil', label: 'Profil', icon: User },
  { id: 'dossier', label: 'Dossier locatif', icon: FileText },
  { id: 'notif', label: 'Notifications', icon: Bell },
  { id: 'paiements', label: 'Paiements', icon: CreditCard },
  { id: 'secu', label: 'Sécurité', icon: Lock }
]

function TabProfil() {
  const fields = ['Prénom', 'Nom', 'Email', 'Téléphone', 'Date de naissance', 'Profession']
  return (
    <div>
      <h2 className="bebas text-2xl">Informations personnelles</h2>
      <div className="mt-5 grid md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f}>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              {f}
            </label>
            <input
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white"
              defaultValue={f === 'Prénom' ? 'Volana' : f === 'Nom' ? 'Rakoto' : ''}
            />
          </div>
        ))}
      </div>
      <Button className="mt-6 bg-brand-cyan text-white hover:bg-brand-cyan-dark">Enregistrer</Button>
    </div>
  )
}

function TabDossier() {
  const docs = [
    { name: "Pièce d'identité", status: 'ok' },
    { name: 'Justificatif de revenus', status: 'ok' },
    { name: 'Attestation employeur', status: 'pending' },
    { name: 'Garant (facultatif)', status: 'missing' }
  ]
  return (
    <div>
      <h2 className="bebas text-2xl">Dossier locatif</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Ces documents sont partagés avec les propriétaires quand tu postules.
      </p>
      <div className="mt-5 space-y-2">
        {docs.map((d) => (
          <div key={d.name} className="flex items-center justify-between p-4 border border-border rounded-xl">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div className="text-sm font-medium">{d.name}</div>
            </div>
            {d.status === 'ok' && (
              <span className="inline-flex items-center gap-1 text-xs text-brand-green-dark font-semibold">
                <Check className="w-3 h-3" /> Validé
              </span>
            )}
            {d.status === 'pending' && (
              <span className="text-xs text-amber-700 font-semibold">En vérification</span>
            )}
            {d.status === 'missing' && (
              <Button size="sm" variant="outline">
                <Upload className="w-3.5 h-3.5" /> Ajouter
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function TabNotif() {
  const notifs = [
    'Nouvelles annonces correspondant à mes critères',
    'Réponses à mes candidatures',
    'Newsletter mensuelle',
    'Offres partenaires'
  ]
  return (
    <div>
      <h2 className="bebas text-2xl">Notifications</h2>
      <div className="mt-5 space-y-3">
        {notifs.map((n, i) => (
          <label key={n} className="flex items-center justify-between p-4 border border-border rounded-xl cursor-pointer">
            <span className="text-sm">{n}</span>
            <input type="checkbox" defaultChecked={i < 2} className="accent-brand-cyan w-4 h-4" />
          </label>
        ))}
      </div>
    </div>
  )
}

function TabPaiements() {
  return (
    <div>
      <h2 className="bebas text-2xl">Paiements</h2>
      <p className="text-sm text-muted-foreground mt-1">Historique de tes paiements de loyer et cautions.</p>
      <div className="mt-5 space-y-2">
        {[
          { label: 'Loyer Juillet 2026', amount: '450 000 Ar', status: 'Payé' },
          { label: 'Caution — Isoraka', amount: '900 000 Ar', status: 'Payé' }
        ].map((p) => (
          <div key={p.label} className="flex items-center justify-between p-4 border border-border rounded-xl">
            <div className="text-sm font-medium">{p.label}</div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{p.amount}</span>
              <span className="text-xs font-bold text-brand-green-dark bg-brand-green-light px-2 py-1 rounded-full">
                {p.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TabSecu() {
  return (
    <div>
      <h2 className="bebas text-2xl">Sécurité</h2>
      <div className="mt-5 grid md:grid-cols-2 gap-4 max-w-lg">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Mot de passe actuel
          </label>
          <input type="password" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Nouveau mot de passe
          </label>
          <input type="password" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Confirmer
          </label>
          <input type="password" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
      </div>
      <Button className="mt-6 bg-brand-cyan text-white hover:bg-brand-cyan-dark">Mettre à jour</Button>
    </div>
  )
}

export default function Compte() {
  const [tab, setTab] = useState('profil')

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-white font-bold text-xl">
            V
          </div>
          <div>
            <h1 className="bebas text-3xl">Volana Rakoto</h1>
            <div className="text-sm text-muted-foreground">Membre depuis mars 2026 · Locataire</div>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-[220px_1fr] gap-6">
          <aside className="space-y-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  tab === t.id ? 'bg-brand-cyan-light text-brand-cyan-dark' : 'hover:bg-muted text-foreground/70'
                }`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </aside>

          <div className="bg-card border border-border rounded-2xl p-6">
            {tab === 'profil' && <TabProfil />}
            {tab === 'dossier' && <TabDossier />}
            {tab === 'notif' && <TabNotif />}
            {tab === 'paiements' && <TabPaiements />}
            {tab === 'secu' && <TabSecu />}
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
