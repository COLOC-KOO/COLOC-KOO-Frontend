import React, { useMemo, useState } from 'react'
import { MapPin, SlidersHorizontal } from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { ListingCard } from '../components/site/ListingCard'
import { listings } from '../data/mockData'

const typeOptions = ['', 'chambre', 'appartement', 'maison']
const optionLabels = ['Meublé', 'Wi-Fi fibre', 'Parking', 'Terrasse', 'Vérifié']

export default function Annonces() {
  const [city, setCity] = useState('')
  const [type, setType] = useState('')
  const [maxPrice, setMaxPrice] = useState(0)

  const filtered = useMemo(
    () =>
      listings.filter(
        (l) => (!city || l.city === city) && (!type || l.type === type) && (!maxPrice || l.price <= maxPrice)
      ),
    [city, type, maxPrice]
  )

  const citiesList = useMemo(() => [...new Set(listings.map((l) => l.city))], [])

  return (
    <SiteLayout>
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="bebas text-4xl">Annonces à Madagascar</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} résultats</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-[280px_1fr] gap-8">
        <aside className="bg-card rounded-2xl border border-border p-5 h-fit sticky top-24">
          <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
            <SlidersHorizontal className="w-4 h-4 text-brand-cyan-dark" />
            <div className="font-semibold text-sm">Filtres</div>
          </div>
          <div className="space-y-5 text-sm">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Ville
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 bg-white"
              >
                <option value="">Toutes</option>
                {citiesList.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Type
              </label>
              <div className="flex flex-wrap gap-2">
                {typeOptions.map((t) => (
                  <button
                    key={t || 'all'}
                    onClick={() => setType(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                      type === t ? 'bg-brand-cyan text-white border-brand-cyan' : 'border-border hover:bg-muted'
                    }`}
                  >
                    {t || 'Tous'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Prix max : {maxPrice ? `${maxPrice.toLocaleString('fr-FR')} Ar` : '—'}
              </label>
              <input
                type="range"
                min={0}
                max={1000000}
                step={50000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(+e.target.value)}
                className="w-full accent-brand-cyan"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Options
              </label>
              <div className="space-y-2">
                {optionLabels.map((o) => (
                  <label key={o} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-brand-cyan" /> {o}
                  </label>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                setCity('')
                setType('')
                setMaxPrice(0)
              }}
              className="w-full text-xs text-brand-cyan-dark font-semibold hover:underline"
            >
              Réinitialiser
            </button>
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" /> Résultats triés par pertinence
            </div>
            <select className="border border-border rounded-lg px-3 py-1.5 text-sm bg-white">
              <option>Plus récent</option>
              <option>Prix croissant</option>
              <option>Prix décroissant</option>
            </select>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((l) => (
              <ListingCard key={l.id} l={l} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center text-muted-foreground py-20">Aucune annonce ne correspond à ces critères.</div>
          )}
        </div>
      </div>
    </SiteLayout>
  )
}
