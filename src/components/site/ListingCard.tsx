import React from 'react'
import { Link } from 'react-router-dom'
import { BedDouble, Check, MapPin, Users, Heart } from 'lucide-react'
import { Listing } from '../../types'
import { formatAr } from '../../lib/utils'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'

export function ListingCard({ l }: { l: Listing }) {
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget
    if (target.getAttribute('data-fallback-used') !== 'true') {
      target.setAttribute('data-fallback-used', 'true')
      target.src = FALLBACK_IMAGE
    }
  }

  return (
    <Link
      to={`/annonces/${l.id}`}
      className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:-translate-y-0.5 transition-all relative"
    >
      {/* Bouton cœur - statique pour le moment */}
      <button 
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg hover:scale-110 transition-all duration-300"
        onClick={(e) => {
          e.preventDefault() // Empêche la navigation
          e.stopPropagation() // Empêche la propagation du clic
          console.log('❤️ Cœur cliqué pour l\'annonce:', l.id)
          // Plus tard, vous ajouterez la logique des favoris ici
        }}
        aria-label="Ajouter aux favoris"
      >
        <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
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
              <Check className="w-3 h-3" /> Vérifié
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
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5" /> {l.surface} m²
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {l.colocs.length + 1} colocs
          </span>
          <span className="ml-auto text-brand-cyan-dark font-medium">
            Dispo {l.available.slice(0, 5)}
          </span>
        </div>
      </div>
    </Link>
  )
}

// import React from "react";
// import { Link } from "react-router-dom";
// import { BedDouble, Check, MapPin, Users, Heart } from "lucide-react";
// import { Listing } from "../../types";
// import { formatAr } from "../../lib/utils";

// const FALLBACK_IMAGE =
//   "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80";

// export function ListingCard({ l }: { l: Listing }) {
//   const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
//     const target = event.currentTarget;
//     if (target.getAttribute("data-fallback-used") !== "true") {
//       target.setAttribute("data-fallback-used", "true");
//       target.src = FALLBACK_IMAGE;
//     }
//   };

//   // Simuler que certaines annonces sont en favori (par exemple les annonces avec un ID pair)
//   const estFavori = parseInt(l.id) % 2 === 0;

//   return (
//     <Link
//       to={`/annonces/${l.id}`}
//       className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:-translate-y-0.5 transition-all relative"
//     >
//       {/* Bouton cœur - statique avec simulation */}
//       <button
//         className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-300 ${
//           estFavori
//             ? "bg-red-500 text-white hover:bg-red-600"
//             : "bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white"
//         } shadow-lg hover:scale-110`}
//         onClick={(e) => {
//           e.preventDefault();
//           e.stopPropagation();
//           console.log(
//             "❤️ Cœur cliqué pour l'annonce:",
//             l.id,
//             "Favori:",
//             estFavori,
//           );
//         }}
//         aria-label={estFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
//       >
//         <Heart
//           className={`w-5 h-5 transition-colors ${estFavori ? "fill-current" : "fill-none"}`}
//         />
//       </button>
//       {/* Reste du composant identique */}
//       <div className="relative aspect-[4/3] overflow-hidden bg-muted">
//         <img
//           src={l.image || FALLBACK_IMAGE}
//           alt={l.title}
//           onError={handleImageError}
//           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//         />
//         <div className="absolute top-3 left-3 flex gap-1.5">
//           {l.tags.includes("vedette") && (
//             <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-olive text-brand-dark px-2 py-1 rounded-full">
//               Vedette
//             </span>
//           )}
//           {l.tags.includes("verifie") && (
//             <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-brand-green-dark px-2 py-1 rounded-full inline-flex items-center gap-1">
//               <Check className="w-3 h-3" /> Vérifié
//             </span>
//           )}
//         </div>
//         <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-sm font-bold">
//           {formatAr(l.price)}
//           <span className="text-xs text-muted-foreground font-normal">
//             /mois
//           </span>
//         </div>
//       </div>
//       ;
//       <div className="p-4">
//         <div className="flex items-center gap-1 text-xs text-muted-foreground">
//           <MapPin className="w-3.5 h-3.5" /> {l.district}, {l.city}
//         </div>
//         <h3 className="mt-1.5 font-semibold text-[15px] leading-snug line-clamp-2 min-h-[42px]">
//           {l.title}
//         </h3>
//         <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
//           <span className="inline-flex items-center gap-1">
//             <BedDouble className="w-3.5 h-3.5" /> {l.surface} m²
//           </span>
//           <span className="inline-flex items-center gap-1">
//             <Users className="w-3.5 h-3.5" /> {l.colocs.length + 1} colocs
//           </span>
//           <span className="ml-auto text-brand-cyan-dark font-medium">
//             Dispo {l.available.slice(0, 5)}
//           </span>
//         </div>
//       </div>
//     </Link>
//   );
// }
