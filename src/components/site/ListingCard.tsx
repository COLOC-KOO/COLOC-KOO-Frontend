import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BedDouble, Camera, Car, Check, Heart, MapPin, UserCircle, Users, Wifi } from 'lucide-react'
import { Listing } from '../../types'
import { formatAr } from '../../lib/utils'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { LazyImage } from '../ui/LazyImage'

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

interface ListingCardProps {
  l: Listing
  compact?: boolean
}

export function ListingCard({ l, compact = false }: ListingCardProps) {
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

  const ownerInitials = l.owner.name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'P'
  const photoCount = Math.max(l.gallery.length, l.image ? 1 : 0)
  const equipmentPreview = [
    ...l.amenities.slice(0, 2),
    l.internet ? 'Wifi' : '',
    (l.parkingVoitures ?? 0) > 0 || l.parkingCouvert ? 'Parking' : '',
  ].filter(Boolean).slice(0, 3)
  const bedrooms = l.bedrooms || l.rooms || 1

  return (
    <Link
      to={`/annonces/${l.id}`}
      className="group relative block w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl"
    >
      {toastMessage ? (
        <div className="fixed right-5 top-5 z-50 max-w-sm rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground shadow-2xl">
          {toastMessage}
        </div>
      ) : null}

      <button
        className={`absolute right-3 top-3 z-10 rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110 ${
          isFavorite
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-white/90 text-gray-400 hover:bg-white hover:text-red-500'
        } disabled:cursor-wait disabled:opacity-70`}
        onClick={handleFavoriteClick}
        disabled={savingFavorite}
        aria-label={isFavorite ? 'Annonce déjà dans vos favoris' : 'Ajouter aux favoris'}
      >
        <Heart className={`h-5 w-5 transition-colors ${isFavorite ? 'fill-current' : 'fill-none'}`} />
      </button>

      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <LazyImage
          src={l.image || FALLBACK_IMAGE}
          alt={l.title}
          onError={handleImageError}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {l.tags.includes('vedette') && (
            <span className="bg-[var(--brand-cyan-dark)] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Coup de coeur
            </span>
          )}
          {l.tags.includes('verifie') && (
            <span className="inline-flex items-center gap-1 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-green-dark)]">
              <Check className="h-3 w-3" /> Vérifié
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
          <Camera className="h-4 w-4" /> {photoCount}
        </div>
        <div className="absolute bottom-0 right-0 p-2">
          <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-white shadow-md">
            {l.owner.profilePicture ? (
              <img src={l.owner.profilePicture} alt={l.owner.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--brand-cyan-dark)] to-[var(--brand-green-dark)] text-sm font-bold text-white">
                {ownerInitials}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={compact ? 'p-3' : 'p-4'}>
        <h3 className="line-clamp-1 text-[15px] font-extrabold leading-snug text-slate-950">{l.title}</h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5" /> {l.district}, {l.city}
        </div>

        <div className="mt-2 flex items-end justify-between gap-3">
          <div>
            <div className="text-2xl font-bold leading-none text-[var(--brand-cyan-dark)]">{formatAr(l.price)}</div>
            <div className="mt-1 text-xs text-slate-500">
              {l.surface ? `${Math.round(l.price / Math.max(l.surface, 1)).toLocaleString('fr-FR')} Ar / m2` : 'Prix au mois'}
            </div>
          </div>
          <div className="min-w-0 text-right">
            <div className="truncate text-xs font-semibold text-slate-700">{l.owner.name}</div>
            <div className="inline-flex items-center gap-1 text-[11px] text-slate-500">
              <UserCircle className="h-3 w-3" /> Créateur
            </div>
          </div>
        </div>

        <div className={compact ? 'mt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-600' : 'mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600'}>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
            <BedDouble className="h-3.5 w-3.5" /> {bedrooms} chambre{bedrooms > 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
            <Users className="h-3.5 w-3.5" /> {l.surface} m2
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-cyan-light)] px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--brand-cyan-dark)]">
            {l.type === 'chambre' ? 'Chambre' : l.type === 'appartement' ? 'Appartement' : 'Maison'}
          </span>
          {l.internet ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
              <Wifi className="h-3.5 w-3.5" /> Wifi
            </span>
          ) : null}
          {(l.parkingVoitures ?? 0) > 0 || l.parkingCouvert ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
              <Car className="h-3.5 w-3.5" /> Parking
            </span>
          ) : null}
        </div>

        <div className={compact ? 'mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500' : 'mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500'}>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1">
            Dispo {l.available ? l.available.slice(0, 5) : 'à préciser'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1">
            {l.candidatureCount && l.candidatureCount > 0 ? 'Colocataires existants' : 'Colocataires à créer'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1">
            {equipmentPreview.length > 0 ? equipmentPreview.join(', ') : 'Equipements à préciser'}
          </span>
        </div>
      </div>
    </Link>
  )
}
