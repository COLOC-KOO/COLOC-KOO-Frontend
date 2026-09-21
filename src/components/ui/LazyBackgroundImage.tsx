// components/ui/LazyBackgroundImage.tsx
import React from 'react'
import { useLiteMode } from '../../lib/useLiteMode'
import { cn } from '../../lib/utils'

interface LazyBackgroundImageProps {
  src: string
  className?: string
  overlayClassName?: string
  children?: React.ReactNode
}

// Dégradé de la charte utilisé à la place des visuels en mode Lite.
export const LITE_HERO_GRADIENT = 'linear-gradient(to right, #000000 0%, #d9dfd1 100%)'

export function LazyBackgroundImage({ src, className, overlayClassName, children }: LazyBackgroundImageProps) {
  const liteMode = useLiteMode()

  if (liteMode) {
    return (
      <div className={cn('absolute inset-0 z-0', className)} style={{ background: LITE_HERO_GRADIENT }}>
        {children}
      </div>
    )
  }

  return (
    <div
      className={cn('absolute inset-0 z-0', className)}
      style={{ backgroundImage: `url("${src}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className={overlayClassName} />
      {children}
    </div>
  )
}
