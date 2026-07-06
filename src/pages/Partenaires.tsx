import React from 'react'
import { Link } from 'react-router-dom'
import { Building2, Check } from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { Button } from '../components/ui/Button'
import { useConfig } from '../lib/config'

const stats = [
  { t: '1 400+ colocataires actifs', d: 'Une communauté qualifiée à travers Madagascar.' },
  { t: 'Dossiers vérifiés', d: 'Chaque candidat fournit un dossier complet.' },
  { t: "+40% de taux d'occupation", d: 'Vos biens loués plus vite, sans vacance.' },
  { t: 'Outils pro', d: 'CRM, gestion des candidatures, signatures.' }
]

const plans = [
  {
    name: 'Découverte',
    price: 'Gratuit',
    features: ['3 annonces actives', 'Support email', 'Statistiques de base']
  },
  {
    name: 'Pro',
    price: '150 000 Ar/mois',
    highlight: true,
    features: ['Annonces illimitées', 'Badge vérifié', 'Priorité résultats', 'Support prioritaire', 'CRM candidatures']
  },
  {
    name: 'Agence',
    price: 'Sur devis',
    features: ['Multi-utilisateurs', 'API access', 'Manager dédié', "Formation équipe"]
  }
]

export default function Partenaires() {
  const { config } = useConfig()
  const partnerVisibility = config.PARTENAIRE_VISIBILITY !== false

  if (!partnerVisibility) {
    return (
      <SiteLayout>
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h1 className="bebas text-4xl">Page partenaires indisponible</h1>
          <p className="mt-4 text-muted-foreground">
            Cette fonctionnalité est actuellement désactivée par la configuration globale. Revenez plus tard.
          </p>
          <Link to="/">
            <Button className="mt-8 bg-brand-cyan hover:bg-brand-cyan-dark text-white">Retour à l’accueil</Button>
          </Link>
        </div>
      </SiteLayout>
    )
  }

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 bg-brand-cyan-light text-brand-cyan-dark px-3 py-1.5 rounded-full text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" /> Partenaires pro
          </span>
          <h1 className="bebas text-5xl mt-5">Devenez partenaire Sarintany'COLOC</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Agences, propriétaires bailleurs, promoteurs : publiez vos annonces et boostez votre visibilité auprès de
            milliers de colocataires.
          </p>
        </div>

        <div className="mt-14">
          <h2 className="bebas text-3xl text-center mb-8">Pourquoi nous rejoindre ?</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.t} className="bg-card border border-border rounded-2xl p-6">
                <div className="font-semibold">{s.t}</div>
                <div className="text-sm text-muted-foreground mt-2">{s.d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <h2 className="bebas text-3xl text-center mb-8">Nos formules</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl border p-8 ${
                  p.highlight ? 'border-brand-cyan bg-brand-cyan-light/40 shadow-lg scale-[1.02]' : 'border-border bg-card'
                }`}
              >
                <div className="font-semibold text-lg">{p.name}</div>
                <div className="bebas text-3xl mt-2 text-brand-cyan-dark">{p.price}</div>
                <ul className="mt-5 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-brand-green-dark" /> {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6 bg-brand-cyan hover:bg-brand-cyan-dark text-white">
                  Choisir {p.name}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link to="/deposer">
            <Button size="lg" className="bg-brand-green text-brand-dark hover:bg-brand-green-dark hover:text-white">
              Publier ma première annonce
            </Button>
          </Link>
        </div>
      </div>
    </SiteLayout>
  )
}
