import React, { useEffect, useMemo, useState } from 'react'
import { MapPin, SlidersHorizontal } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { SiteLayout } from '../components/site/SiteLayout'
import { ListingCard } from '../components/site/ListingCard'
import { api, annonceToListing, Ville } from '../lib/api'
import { Listing } from '../types'

const typeOptions = ['', 'chambre', 'appartement', 'maison']

export default function Annonces() {
  const location = useLocation()
  const [city, setCity] = useState('')
  const [type, setType] = useState('')
  const [maxPrice, setMaxPrice] = useState(0)
  const [query, setQuery] = useState('')
  const [listings, setListings] = useState<Listing[]>([])
  const [villes, setVilles] = useState<Ville[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const urlQuery = params.get('q') || ''
    const urlType = params.get('type') || ''
    const urlCity = params.get('ville') || params.get('city') || ''
    const urlMaxPrice = Number(params.get('maxPrice') || 0)

    setQuery(urlQuery)
    setType(urlType)
    setCity(urlCity)
    setMaxPrice(urlMaxPrice)
  }, [location.search])

  useEffect(() => {
    setLoading(true)
    setError('')
    Promise.all([
      api.annonces({
        statut: 'active',
        ville: city,
        type,
        maxPrice: maxPrice || undefined,
        q: query || undefined,
      }),
      api.villes().catch(() => []),
    ])
      .then(([annonces, villesList]) => {
        setListings(annonces.map(annonceToListing))
        setVilles(villesList)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Impossible de charger les annonces'))
      .finally(() => setLoading(false))
  }, [city, type, maxPrice, query])

  const citiesList = useMemo(() => {
    const fromDb = villes.map((v) => v.nom_ville)
    const fromListings = listings.map((l) => l.city)
    return [...new Set([...fromDb, ...fromListings])]
  }, [listings, villes])

  return (
    <SiteLayout>
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="bebas text-4xl">Annonces a Madagascar</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? 'Chargement...' : `${listings.length} resultats valides`}
          </p>
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
                Recherche
              </label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ville, quartier, mot-clé"
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Ville
              </label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="input">
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
                    type="button"
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
                Prix max : {maxPrice ? `${maxPrice.toLocaleString('fr-FR')} Ar` : '-'}
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
            <button
              type="button"
              onClick={() => {
                setCity('')
                setType('')
                setMaxPrice(0)
                setQuery('')
              }}
              className="w-full text-xs text-brand-cyan-dark font-semibold hover:underline"
            >
              Reinitialiser
            </button>
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" /> Resultats tries par date de validation
            </div>
          </div>
          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          {loading && <div className="text-center text-muted-foreground py-20">Chargement des annonces...</div>}
          {!loading && !error && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((l) => (
                <ListingCard key={l.id} l={l} />
              ))}
            </div>
          )}
          {!loading && !error && listings.length === 0 && (
            <div className="text-center text-muted-foreground py-20">Aucune annonce validee pour le moment.</div>
          )}
        </div>
      </div>
    </SiteLayout>
  )
}
