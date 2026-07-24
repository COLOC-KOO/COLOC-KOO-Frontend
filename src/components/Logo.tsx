import React from 'react'
import { Link } from 'react-router-dom'

export function LogoMark({ className = 'h-8 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="oklch(0.74 0.11 210)" />
      <path d="M12 24 L20 12 L28 24 Z" fill="oklch(0.78 0.16 130)" />
      <circle cx="20" cy="24" r="4" fill="#fff" />
    </svg>
  )
}

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
      <LogoMark className={small ? 'h-7 w-auto' : 'h-9 w-auto'} />
      <div className="flex flex-col leading-none">
          <h5 className="bebas text-2xl">
            <span className="text-[--brand-cyan-dark]">Coloc’KOO</span>
            <span className="text-[--brand-green-dark]">Miara-Trano</span>
          </h5>
        <span className="text-[9px] text-muted-foreground">by Sarintany Group</span>
      </div>
    </Link>
  )
}
