import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BedDouble, Camera, MapPin, Users, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { Listing } from '../../types'
import { formatAr } from '../../lib/utils'
import { LazyImage } from '../ui/LazyImage'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'

interface ListingCardProps {
  l: Listing
  compact?: boolean
  isFavorite?: boolean
  onFavoriteClick?: (event: React.MouseEvent, listing: Listing) => void
}

export function ListingCard({ l, compact = false, isFavorite = false, onFavoriteClick }: ListingCardProps) {
  const navigate = useNavigate()
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => {
    setImgIdx(0)
  }, [l.id])

  const imgs: string[] = (l.gallery && l.gallery.length > 0) ? l.gallery : [l.image || FALLBACK_IMAGE]

  const handleCardClick = () => {
    navigate(`/annonces/${l.id}`)
  }

  return (
    <article
      onClick={handleCardClick}
      className={`rounded-xl overflow-hidden border border-slate-200 bg-white cursor-pointer ${compact ? 'flex flex-row h-28' : ''}`}
    >
      {/* Image area (carousel) */}
      <div className={`relative overflow-hidden bg-gray-100 ${compact ? 'w-[120px] min-w-[120px] h-28 flex-shrink-0 rounded-l-xl' : 'h-44'}`}>
        <div className="flex h-full transition-transform duration-300" style={{ transform: `translateX(-${imgIdx * 100}%)` }}>
          {imgs.map((src, i) => (
            <LazyImage key={i} src={src} alt={l.title} className="min-w-full h-full object-cover flex-shrink-0" />
          ))}
        </div>

        {/* Dots */}
        {imgs.length > 1 && !compact && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {imgs.map((_, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-white/60'}`} />
            ))}
          </div>
        )}

        {/* Nav arrows */}
        {imgs.length > 1 && !compact && (
          <>
            <button onClick={e => { e.stopPropagation(); setImgIdx(v => Math.max(0, v - 1)); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-xs text-gray-700 hover:bg-white transition-colors z-10">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={e => { e.stopPropagation(); setImgIdx(v => Math.min(imgs.length - 1, v + 1)); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-xs text-gray-700 hover:bg-white transition-colors z-10">
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {onFavoriteClick && (
          <button
            type="button"
            aria-label={isFavorite ? 'Annonce deja dans vos favoris' : 'Ajouter aux favoris'}
            onClick={(event) => onFavoriteClick(event, l)}
            className={`absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/90 shadow-sm transition-colors hover:bg-white ${
              isFavorite ? 'text-red-500' : 'text-slate-700'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className={`${compact ? 'flex-1 p-2 pb-2.5' : 'p-3'} flex flex-col`}>
        <p className={`font-bold text-slate-900 ${compact ? 'text-[13px]' : 'text-lg'} mb-0.5`}>
          {formatAr(l.price)}
          <span className="text-[10px] font-normal text-gray-500">/mois</span>
        </p>

        <p className={`font-bold text-slate-900 line-clamp-2 ${compact ? 'text-[11px]' : 'text-sm'} mb-0.5`}>
          {l.title}
        </p>

        <p className={`uppercase text-gray-500 tracking-wide ${compact ? 'text-[9px]' : 'text-[10px]'} mb-1`}>
          {l.type === 'chambre' ? 'Chambre' : l.type === 'appartement' ? 'Appartement' : 'Maison'}
        </p>

        {!compact && (
          <div className="flex gap-2 text-[12px] text-gray-600 flex-wrap mb-1">
            <span className="flex items-center gap-1"><BedDouble className="w-4 h-4" /> {l.surface ?? '-'} m²</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {l.bedrooms ?? 1} coloc.</span>
            {l.chambreSurface && <span className="flex items-center gap-1"><Camera className="w-4 h-4" /> {l.chambreSurface} m²/ch.</span>}
          </div>
        )}

        <p className={`flex items-center gap-1 text-gray-500 ${compact ? 'text-[10px]' : 'text-[12px]'} mb-1.5`}>
          <MapPin className="w-4 h-4 text-cyan-600" /> {l.district}, {l.city}
        </p>

        {!compact && (
          <div className="flex flex-wrap gap-2">
            {l.amenities?.slice(0,3).map((tag, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
