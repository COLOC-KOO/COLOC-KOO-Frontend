import logoImg from '../assets/ColocKOO_LOGO-color-72dpi.png'

// Utilisé partout où une annonce / un partenaire / un élément n'a pas de
// photo : on affiche le logo Coloc'KOO plutôt qu'une photo de stock
// générique. Le logo est un rectangle compact (pas une photo pleine
// largeur) : les composants qui l'utilisent doivent l'afficher en
// `object-contain` sur un fond de couleur, jamais en `object-cover`
// (ça l'étirerait/couperait comme une vraie photo).
export const LOGO_PLACEHOLDER = logoImg

export function isLogoPlaceholder(src: string | null | undefined): boolean {
  return src === LOGO_PLACEHOLDER
}
