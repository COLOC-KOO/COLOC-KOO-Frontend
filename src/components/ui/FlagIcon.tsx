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
  
  const flags = {
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
        <defs>
          <clipPath id="en-clip">
            <path d="M-85.3 0h682.6v512H-85.3z"/>
          </clipPath>
          <g id="en-stripe">
            <path fill="#fff" stroke="#012169" strokeWidth="20" d="M-20 0v40H-60v80H-20v40h40v-40h40V40H-20V0z"/>
          </g>
          <g id="en-cross">
            <path fill="#c8102e" d="M-20 0h40v160h-40z"/>
            <path fill="#c8102e" d="M-60 40h160v40H-60z"/>
          </g>
          <g id="en-union">
            <rect x="-85.3" y="-40" fill="#012169" width="682.6" height="512"/>
            <use href="#en-cross"/>
            <use href="#en-stripe"/>
          </g>
        </defs>
        <clipPath id="en-outline">
          <path d="M-85.3 0h682.6v512H-85.3z"/>
        </clipPath>
        <g clipPath="url(#en-outline)">
          <use href="#en-union"/>
        </g>
      </svg>
    )
  }

  return flags[code] || flags.FR
}