import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BedDouble, Check, MapPin, Users, Heart } from 'lucide-react'
import { Listing } from '../../types'
import { formatAr } from '../../lib/utils'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'

let favoriteIdsCache: Set<string> | null = null
let favoriteIdsPromise: Promise<Set<string>> | null = null
let favoriteIdsUserId: number | string | null = null

function loadFavoriteIds(userId: number | string) {
  if (favoriteIdsUserId !== userId) {
    favoriteIdsCache = null
    favoriteIdsPromise = null
    favoriteIdsUserId = userId
  }
  if (favoriteIdsCache) return Promise.resolve(favoriteIdsCache)
  if (!favoriteIdsPromise) {
    favoriteIdsPromise = api.favoris().then((items) => {
      favoriteIdsCache = new Set(items.map((item) => String(item.id)))
      return favoriteIdsCache
    }).catch((error) => {
      favoriteIdsPromise = null
      throw error
    })
  }
  return favoriteIdsPromise
}

export function ListingCard({ l }: { l: Listing }) {
  const { user } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [savingFavorite, setSavingFavorite] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!user) {
      setIsFavorite(false)
      return
    }

    loadFavoriteIds(user.id)
      .then((ids) => {
        if (!cancelled) setIsFavorite(ids.has(String(l.id)))
      })
      .catch(() => {
        if (!cancelled) setIsFavorite(false)
      })

    return () => {
      cancelled = true
    }
  }, [l.id, user])

  useEffect(() => {
    if (!toastMessage) return
    const timer = window.setTimeout(() => setToastMessage(''), 3000)
    return () => window.clearTimeout(timer)
  }, [toastMessage])

  useEffect(() => {
    const handleFavoriteRemoved = (event: Event) => {
      const removedId = (event as CustomEvent<{ id?: string }>).detail?.id
      if (removedId !== String(l.id)) return
      setIsFavorite(false)
      favoriteIdsCache?.delete(String(l.id))
    }

    window.addEventListener('colockoo:favori-removed', handleFavoriteRemoved)
    return () => window.removeEventListener('colockoo:favori-removed', handleFavoriteRemoved)
  }, [l.id])

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget
    if (target.getAttribute('data-fallback-used') !== 'true') {
      target.setAttribute('data-fallback-used', 'true')
      target.src = FALLBACK_IMAGE
    }
  }

  const showToast = (message: string) => {
    setToastMessage('')
    window.setTimeout(() => setToastMessage(message), 20)
  }

  const handleFavoriteClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (!user) {
      showToast('Connectez-vous pour ajouter cette annonce aux favoris.')
      return
    }

    if (isFavorite) {
      showToast("c'est déjà dans votre favoris")
      return
    }

    setSavingFavorite(true)
    try {
      const response = await api.addFavori(l.id)
      setIsFavorite(true)
      favoriteIdsCache = favoriteIdsCache || new Set()
      favoriteIdsCache.add(String(l.id))
      favoriteIdsUserId = user.id
      favoriteIdsPromise = Promise.resolve(favoriteIdsCache)
      showToast(response.alreadyExists ? "c'est déjà dans votre favoris" : 'Ajouté comme favoris avec succès')
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Impossible d'ajouter ce favori.")
    } finally {
      setSavingFavorite(false)
    }
  }

  return (
    <Link
      to={`/annonces/${l.id}`}
      className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:-translate-y-0.5 transition-all relative block w-full"
    >
      {toastMessage ? (
        <div className="fixed top-5 right-5 z-50 max-w-sm rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground shadow-2xl">
          {toastMessage}
        </div>
      ) : null}

      <button
        className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-lg hover:scale-110 transition-all duration-300 ${
          isFavorite
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-white/90 text-gray-400 hover:bg-white hover:text-red-500'
        } disabled:opacity-70 disabled:cursor-wait`}
        onClick={handleFavoriteClick}
        disabled={savingFavorite}
        aria-label={isFavorite ? 'Annonce deja dans vos favoris' : 'Ajouter aux favoris'}
      >
        <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-current' : 'fill-none'}`} />
      </button>

      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={l.image || FALLBACK_IMAGE}
          alt={l.title}
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {l.tags.includes('vedette') && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-olive text-brand-dark px-2 py-1 rounded-full">
              Vedette
            </span>
          )}
          {l.tags.includes('verifie') && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-brand-green-dark px-2 py-1 rounded-full inline-flex items-center gap-1">
              <Check className="w-3 h-3" /> Verifie
            </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-sm font-bold">
          {formatAr(l.price)}
          <span className="text-xs text-muted-foreground font-normal">/mois</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" /> {l.district}, {l.city}
        </div>
        <h3 className="mt-1.5 font-semibold text-[15px] leading-snug line-clamp-2 min-h-[42px]">
          {l.title}
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5" /> {l.surface} m2
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {l.rooms} colocataire{l.rooms > 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-[11px] uppercase tracking-wide text-brand-cyan-dark bg-white/90">
            {l.type === 'chambre' ? 'Chambre' : l.type === 'appartement' ? 'Appartement' : 'Maison'}
          </span>
          <span className="ml-auto text-brand-cyan-dark font-medium">
            Dispo {l.available.slice(0, 5)}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 bg-white/90">
            {l.candidatureCount && l.candidatureCount > 0
              ? 'Colocataires existants'
              : 'Colocataires à créer'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 bg-white/90">
            {l.candidatureCount && l.candidatureCount > 0
              ? `${l.candidatureCount} candidature${l.candidatureCount > 1 ? 's' : ''}`
              : 'Aucune candidature'}
          </span>
          {l.amenities.length > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 bg-white/90">
              {l.amenities.slice(0, 2).join(', ')}{l.amenities.length > 2 ? ` +${l.amenities.length - 2}` : ''}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 bg-white/90">
              Equipements à préciser
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
