import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Search, Shield, Sparkles, Star, Users } from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { ListingCard } from '../components/site/ListingCard'
import { Button } from '../components/ui/Button'
import { cities, listings } from '../data/mockData'

const heroImage =
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80'

const steps = [
  {
    n: '01',
    t: 'Cherche',
    d: 'Filtre par ville, prix, ambiance. Toutes les annonces sont vérifiées.',
    c: 'bg-brand-cyan-light text-brand-cyan-dark'
  },
  {
    n: '02',
    t: 'Postule',
    d: 'Dépose ton dossier locatif en ligne. Réponse sous 48h.',
    c: 'bg-brand-green-light text-brand-green-dark'
  },
  {
    n: '03',
    t: 'Emménage',
    d: 'Signature électronique, convention de coloc, tu prends les clés.',
    c: 'bg-pink-50 text-pink-800'
  }
]

export default function Home() {
  return (
    <SiteLayout>
      <section className="relative">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/50 via-brand-dark/40 to-brand-dark/70" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-32 text-white">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Colocation nouvelle génération
            </span>
            <h1 className="bebas text-5xl md:text-7xl mt-5 leading-[0.95]">
              Trouve ta coloc,
              <br />
              <span className="text-brand-cyan">partout à Madagascar</span>
            </h1>
            <p className="mt-5 text-lg text-white/85 max-w-lg">
              Chambres, appartements et maisons vérifiés — dossiers en ligne, signature simplifiée.
            </p>
          </div>

          <div className="mt-10 bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2 max-w-3xl">
            <div className="flex-1 flex items-center gap-2 px-4 py-3">
              <MapPin className="w-5 h-5 text-brand-cyan" />
              <input
                placeholder="Ville, quartier..."
                className="flex-1 bg-transparent text-foreground outline-none text-sm"
              />
            </div>
            <div className="hidden md:block w-px bg-border my-2" />
            <select className="px-4 py-3 bg-transparent text-foreground text-sm outline-none">
              <option>Tous types</option>
              <option>Chambre</option>
              <option>Appartement</option>
              <option>Maison</option>
            </select>
            <Link to="/annonces">
              <Button className="w-full md:w-auto bg-brand-cyan hover:bg-brand-cyan-dark text-white h-full px-6 rounded-xl">
                <Search className="w-4 h-4" /> Rechercher
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-green" /> Annonces vérifiées
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-green" /> 1 400+ colocataires
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-brand-olive" /> 4,8/5 satisfaction
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="bebas text-4xl">Explore par ville</h2>
            <p className="text-muted-foreground mt-1">6 villes couvertes, plus de 240 annonces</p>
          </div>
          <Link
            to="/annonces"
            className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-brand-cyan-dark hover:gap-2 transition-all"
          >
            Toutes les annonces <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cities.map((c) => (
            <Link
              key={c.name}
              to="/annonces"
              className="group relative aspect-square rounded-2xl overflow-hidden"
            >
              <img
                src={c.image}
                alt={c.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="bebas text-xl">{c.name}</div>
                <div className="text-xs text-white/70">{c.count} annonces</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white/60 border-y border-border py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="bebas text-4xl">Annonces vedettes</h2>
              <p className="text-muted-foreground mt-1">Sélection de la semaine, vérifiée par notre équipe</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.slice(0, 6).map((l) => (
              <ListingCard key={l.id} l={l} />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="bebas text-4xl">Comment ça marche</h2>
          <p className="text-muted-foreground mt-2">3 étapes pour rejoindre ta coloc</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="bg-card border border-border rounded-2xl p-8">
              <div className={`inline-block bebas text-3xl px-4 py-1 rounded-full ${s.c}`}>{s.n}</div>
              <h3 className="mt-5 text-xl font-semibold">{s.t}</h3>
              <p className="mt-2 text-muted-foreground text-sm">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="rounded-3xl bg-brand-dark text-white p-10 md:p-16 grid md:grid-cols-2 gap-10 items-center overflow-hidden relative">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-brand-cyan/20 blur-3xl" />
          <div className="relative">
            <h2 className="bebas text-4xl md:text-5xl">Propriétaire ou agence ?</h2>
            <p className="mt-3 text-white/70">Publie ton annonce et gère tes colocataires en toute simplicité.</p>
          </div>
          <div className="relative flex md:justify-end gap-3">
            <Link to="/deposer">
              <Button className="bg-brand-green text-brand-dark hover:bg-brand-green-dark hover:text-white">
                Déposer une annonce
              </Button>
            </Link>
            <Link to="/partenaires">
              <Button variant="outline" className="border-white/30 text-white bg-transparent hover:bg-white/10">
                Devenir partenaire
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}
