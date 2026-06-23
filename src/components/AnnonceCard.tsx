import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Annonce } from '../types';

interface Props {
  annonce: Annonce;
  compact?: boolean;
}

export default function AnnonceCard({ annonce, compact = false }: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const [fav, setFav] = useState(false);
  const navigate = useNavigate();

  const imgs = annonce.images;
  const isPropio = annonce.type === 'proprio';

  const handleCardClick = () => {
    if (isPropio) navigate(`/annonce-proprio/${annonce.id}`);
    else navigate(`/annonce/${annonce.id}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className={`rounded-xl overflow-hidden border border-sc-bd bg-white cursor-pointer card-hover ${
        compact ? 'flex flex-row h-28' : ''
      }`}
    >
      {/* Image carousel */}
      <div className={`relative overflow-hidden bg-gray-100 ${compact ? 'w-[120px] min-w-[120px] h-28 flex-shrink-0 rounded-l-xl' : 'h-40'}`}>
        <div
          className="flex h-full transition-transform duration-300"
          style={{ transform: `translateX(-${imgIdx * 100}%)` }}
        >
          {imgs.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={annonce.titre}
              className="min-w-full h-full object-cover flex-shrink-0"
              loading="lazy"
            />
          ))}
        </div>

        {/* Badge */}
        {annonce.badge && !compact && (
          <span
            className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded text-white z-10"
            style={{ background: annonce.badgeColor || '#46BDD6' }}
          >
            {annonce.badge}
          </span>
        )}

        {/* Verified */}
        {annonce.verified && !compact && (
          <span className="absolute top-1.5 right-8 text-[9px] font-bold px-1.5 py-0.5 rounded bg-sc-y2 text-white z-10">
            ✓ Vérifié
          </span>
        )}

        {/* Fav button */}
        <button
          onClick={e => { e.stopPropagation(); setFav(v => !v); }}
          className="absolute top-1.5 right-1.5 w-[26px] h-[26px] rounded-full bg-white/88 flex items-center justify-center z-10 border-none cursor-pointer hover:scale-110 transition-transform"
        >
          <i className={`ti ${fav ? 'ti-heart-filled text-[#E55555]' : 'ti-heart text-sc-dark'} text-sm`} />
        </button>

        {/* Dots */}
        {imgs.length > 1 && !compact && (
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
            {imgs.map((_, i) => (
              <span
                key={i}
                className={`w-1 h-1 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}

        {/* Nav arrows */}
        {imgs.length > 1 && !compact && (
          <>
            <button
              onClick={e => { e.stopPropagation(); setImgIdx(v => Math.max(0, v - 1)); }}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-[26px] h-[26px] rounded-full bg-white/88 border-none cursor-pointer flex items-center justify-center text-xs text-sc-dark hover:bg-white transition-colors z-10"
            >
              <i className="ti ti-chevron-left" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); setImgIdx(v => Math.min(imgs.length - 1, v + 1)); }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-[26px] h-[26px] rounded-full bg-white/88 border-none cursor-pointer flex items-center justify-center text-xs text-sc-dark hover:bg-white transition-colors z-10"
            >
              <i className="ti ti-chevron-right" />
            </button>
          </>
        )}
      </div>

      {/* Body */}
      <div className={`${compact ? 'flex-1 p-2 pb-2.5' : 'p-3'} flex flex-col`}>
        <p className={`font-bold text-sc-dark ${compact ? 'text-[13px]' : 'text-sm'} mb-0.5`}>
          {annonce.prix.toLocaleString('fr-FR')} Ar
          <span className="text-[10px] font-normal text-sc-gr2">/mois</span>
        </p>
        <p className={`font-bold text-sc-dark line-clamp-2 ${compact ? 'text-[11px]' : 'text-xs'} mb-0.5`}>
          {annonce.titre}
        </p>
        <p className={`uppercase text-sc-gr2 tracking-wide ${compact ? 'text-[9px]' : 'text-[10px]'} mb-1`}>
          {annonce.type === 'proprio' ? 'À constituer' : 'Colocation existante'}
        </p>
        {!compact && (
          <div className="flex gap-1.5 text-[10px] text-sc-gr2 flex-wrap mb-1">
            <span><i className="ti ti-ruler-2 text-[10px]" /> {annonce.surface} m²</span>
            <span><i className="ti ti-users text-[10px]" /> {annonce.colocataires} coloc.</span>
            {annonce.chambreSurface && <span><i className="ti ti-door text-[10px]" /> {annonce.chambreSurface} m²/ch.</span>}
          </div>
        )}
        <p className={`flex items-center gap-1 text-sc-gr1 ${compact ? 'text-[10px]' : 'text-[11px]'} mb-1.5`}>
          <i className="ti ti-map-pin text-[10px] text-sc-cy" />
          {annonce.quartier}, {annonce.ville}
        </p>
        {!compact && (
          <div className="flex flex-wrap gap-1">
            {annonce.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                  tag.variant === 'cy' ? 'bg-sc-cy-lt text-[#2a7a90]' :
                  tag.variant === 'gr' ? 'bg-sc-g-lt text-[#4a7020]' :
                  'bg-gray-100 text-gray-500'
                }`}
              >
                {tag.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
