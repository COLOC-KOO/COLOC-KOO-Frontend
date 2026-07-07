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
        <defs>
          <clipPath id="us-clip">
            <path d="M0 0h640v480H0z"/>
          </clipPath>
          <g id="us-stripe">
            <rect width="640" height="480" fill="#b22234"/>
            <rect width="640" height="36.92" y="36.92" fill="#fff"/>
            <rect width="640" height="36.92" y="110.77" fill="#fff"/>
            <rect width="640" height="36.92" y="184.62" fill="#fff"/>
            <rect width="640" height="36.92" y="258.46" fill="#fff"/>
            <rect width="640" height="36.92" y="332.31" fill="#fff"/>
            <rect width="640" height="36.92" y="406.15" fill="#fff"/>
          </g>
          <g id="us-union">
            <rect width="266.67" height="200" fill="#3c3b6e"/>
            <g fill="#fff">
              <rect x="0" y="0" width="106.67" height="20"/>
              <rect x="0" y="40" width="106.67" height="20"/>
              <rect x="0" y="80" width="106.67" height="20"/>
              <rect x="0" y="120" width="106.67" height="20"/>
              <rect x="0" y="160" width="106.67" height="20"/>
              <rect x="53.33" y="0" width="106.67" height="20"/>
              <rect x="53.33" y="40" width="106.67" height="20"/>
              <rect x="53.33" y="80" width="106.67" height="20"/>
              <rect x="53.33" y="120" width="106.67" height="20"/>
              <rect x="53.33" y="160" width="106.67" height="20"/>
              <rect x="26.67" y="20" width="106.67" height="20"/>
              <rect x="26.67" y="60" width="106.67" height="20"/>
              <rect x="26.67" y="100" width="106.67" height="20"/>
              <rect x="26.67" y="140" width="106.67" height="20"/>
              <rect x="26.67" y="180" width="106.67" height="20"/>
              <rect x="80" y="20" width="106.67" height="20"/>
              <rect x="80" y="60" width="106.67" height="20"/>
              <rect x="80" y="100" width="106.67" height="20"/>
              <rect x="80" y="140" width="106.67" height="20"/>
              <rect x="80" y="180" width="106.67" height="20"/>
            </g>
          </g>
        </defs>
        <g clipPath="url(#us-clip)">
          <use href="#us-stripe"/>
          <use href="#us-union"/>
        </g>
      </svg>
    )
  }

  return flags[code] || flags.FR
}