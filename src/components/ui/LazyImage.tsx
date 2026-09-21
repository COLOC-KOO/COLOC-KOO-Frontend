// components/ui/LazyImage.tsx
import React from 'react'
import { useLiteMode } from '../../lib/useLiteMode'
import { cn } from '../../lib/utils'

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  className?: string
}

// Fond neutre (rayures légères) affiché à la place des images en mode Lite :
// pas de téléchargement d'image ni de bouton « Charger l'image ».
export const LITE_PLACEHOLDER_STYLE: React.CSSProperties = {
  backgroundColor: '#eef0ea',
  backgroundImage:
    'repeating-linear-gradient(135deg, rgba(255,255,255,.75) 0 10px, transparent 10px 20px)',
}

export function LazyImage({ src, alt, className, onError, ...rest }: LazyImageProps) {
  const liteMode = useLiteMode()

  if (liteMode) {
    return <div role="img" aria-label={alt} className={cn('block', className)} style={LITE_PLACEHOLDER_STYLE} />
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={onError}
      {...rest}
    />
  )
}
