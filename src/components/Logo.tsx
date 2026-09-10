import React from 'react'
import { Link } from 'react-router-dom'
import logoImg from '../assets/ColocKOO_LOGO-color-72dpi.png'

// Logo officiel (icône + texte indissociables dans le fichier fourni).
export function LogoMark({ className = 'h-8 w-auto', style }: { className?: string; style?: React.CSSProperties }) {
  return <img src={logoImg} alt="Coloc'KOO" className={className} style={style} />
}

export function LogoSVG({ height = 28 }: { height?: number }) {
  return <LogoMark className="w-auto" style={{ height }} />
}

export function LogoName({ className = 'bebas text-2xl leading-none' }: { className?: string }) {
  return (
    <span className={className}>
      <span className="text-[--brand-cyan-dark]">SARINTANY'</span>
      <span className="text-[--brand-green-dark]">COLOC</span>
    </span>
  )
}

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
      <LogoMark className={small ? 'h-9 w-auto' : 'h-11 w-auto'} />
      <LogoName className={small ? 'bebas text-xl leading-none' : 'bebas text-2xl leading-none'} />
    </Link>
  )
}
