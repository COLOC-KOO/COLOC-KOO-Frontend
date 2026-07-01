import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BedDouble, Calendar, Check, Heart, MapPin, Share2, Shield, Users } from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { Button } from '../components/ui/Button'
import { listings } from '../data/mockData'
import { formatAr } from '../lib/utils'
import NotFound from './NotFound'

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-brand-cyan-light text-brand-cyan-dark flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">
        {icon}
      </div>
      <div>
        <div className="font-semibold text-sm">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

export default function AnnonceDetail() {
  const { id } = useParams()
  const listing = listings.find((l) => l.id === id)

  if (!listing) return <NotFound />

  return (
    <SiteLayout>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Link to="/annonces" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Retour aux annonces
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-[2fr_1fr] gap-3 aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden">
          <img src={listing.gallery[0]} alt={listing.title} className="w-full h-full object-cover" />
          <div className="hidden md:grid grid-rows-2 gap-3">
            {listing.gallery.slice(1, 3).map((g, i) => (
              <img key={i} src={g} alt="" className="w-full h-full object-cover" />
            ))}
            {listing.gallery.length < 3 && <div className="bg-muted" />}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-[1fr_380px] gap-10">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" /> {listing.district}, {listing.city}
          </div>
          <h1 className="bebas text-4xl mt-2">{listing.title}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            {listing.tags.includes('verifie') && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-brand-green-light text-brand-green-dark px-3 py-1 rounded-full border border-brand-green/30">
                <Shield className="w-3 h-3" /> Annonce vérifiée
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-brand-cyan-light text-brand-cyan-dark px-3 py-1 rounded-full">
              {listing.furnished ? 'Meublé' : 'Non meublé'}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-muted px-3 py-1 rounded-full">
              {listing.type}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 border-y border-border py-6">
            <StatItem icon={<BedDouble />} value={`${listing.surface} m²`} label="Chambre" />
            <StatItem icon={<Users />} value={`${listing.colocs.length + 1}`} label="Colocataires" />
            <StatItem icon={<Calendar />} value={listing.available.slice(0, 5)} label="Disponible" />
            <StatItem icon={<Check />} value={`${listing.rooms}`} label="Pièces total" />
          </div>

          <section className="mt-8">
            <h2 className="bebas text-2xl">Description</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">{listing.description}</p>
          </section>

          <section className="mt-8">
            <h2 className="bebas text-2xl">Équipements</h2>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
              {listing.amenities.map((a) => (
                <div key={a} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-brand-green-dark" /> {a}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="bebas text-2xl">Les colocataires actuels</h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {listing.colocs.map((c) => (
                <div key={c.name} className="flex items-center gap-3 p-4 border border-border rounded-xl bg-card">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-white font-bold">
                    {c.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      {c.name}, {c.age} ans
                    </div>
                    <div className="text-xs text-muted-foreground">{c.job}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 h-fit space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-baseline gap-2">
              <div className="bebas text-4xl text-brand-cyan-dark">{formatAr(listing.price)}</div>
              <div className="text-sm text-muted-foreground">/ mois</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">+ {formatAr(listing.charges)} de charges</div>
            <div className="mt-5 space-y-2">
              <Link to="/candidatures">
                <Button className="w-full bg-brand-cyan hover:bg-brand-cyan-dark text-white h-11">
                  Postuler à cette coloc
                </Button>
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <Heart className="w-4 h-4" /> Sauver
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" /> Partager
                </Button>
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-border">
              <div className="text-xs text-muted-foreground mb-2">Propriétaire</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-green-light flex items-center justify-center font-bold text-brand-green-dark">
                  {listing.owner.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold flex items-center gap-1">
                    {listing.owner.name}
                    {listing.owner.verified && <Shield className="w-3.5 h-3.5 text-brand-cyan-dark" />}
                  </div>
                  <div className="text-xs text-muted-foreground">Membre depuis {listing.owner.since}</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </SiteLayout>
  )
}
