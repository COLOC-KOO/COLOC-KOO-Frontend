// components/ui/FlagIcon.tsx
import React from 'react'
import { cn } from '../../lib/utils'

interface FlagIconProps {
  code: 'FR' | 'MG' | 'EN'
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const flagSizes = {
  sm: 'w-5 h-4',
  md: 'w-6 h-5',
  lg: 'w-8 h-6',
  xl: 'w-10 h-8'
}

export function FlagIcon({ code, className, size = 'md' }: FlagIconProps) {
  const sizeClass = flagSizes[size]
  
  const flags: Record<'FR' | 'MG' | 'EN', React.ReactElement> = {
    FR: (
      <svg viewBox="0 0 640 480" className={cn(sizeClass, className)}>
        <g fillRule="evenodd" strokeWidth="1pt">
          <path fill="#fff" d="M0 0h640v480H0z"/>
          <path fill="#00267f" d="M0 0h213.3v480H0z"/>
          <path fill="#f31830" d="M426.7 0H640v480H426.7z"/>
        </g>
      </svg>
    ),
    MG: (
      <svg viewBox="0 0 640 480" className={cn(sizeClass, className)}>
        <g fillRule="evenodd" strokeWidth="1pt">
          <path fill="#fff" d="M0 0h640v480H0z"/>
          <path fill="#fc3d32" d="M0 0h213.3v480H0z"/>
          <path fill="#007e3a" d="M213.3 240h426.7v240H213.3z"/>
          <path fill="#fff" d="M213.3 0h426.7v240H213.3z"/>
        </g>
      </svg>
    ),
    EN: (
      <svg viewBox="0 0 640 480" className={cn(sizeClass, className)}>
        {/* Drapeau des États-Unis */}
        <path fill="#b22234" d="M0 0h640v480H0z"/>
        <g fill="#fff">
          {[36.923, 110.769, 184.615, 258.462, 332.308, 406.154].map(y => (
            <rect key={y} width="640" height="36.923" y={y}/>
          ))}
        </g>
        <rect width="266.667" height="200" fill="#3c3b6e"/>
        <g fill="#fff">
          {[...Array(9)].map((_, row) => {
            const stars = row % 2 === 0 ? 6 : 5
            const y = 18.182 + row * 27.273
            return [...Array(stars)].map((_, col) => (
              <circle 
                key={`${row}-${col}`}
                cx={row % 2 === 0 ? 22.222 + col * 44.444 : 44.444 + col * 44.444}
                cy={y}
                r="9.091"
              />
            ))
          })}
        </g>
      </svg>
    )
  }

  return flags[code] || flags.FR
}