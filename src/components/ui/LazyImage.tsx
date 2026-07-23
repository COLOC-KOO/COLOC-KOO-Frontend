// components/ui/LazyImage.tsx
import React, { useEffect, useState } from 'react'
import { ImageOff, Download } from 'lucide-react'
import { useLiteMode } from '../../lib/useLiteMode'
import { cn } from '../../lib/utils'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
}

export function LazyImage({ src, alt, className }: LazyImageProps) {
  const liteMode = useLiteMode()
  const [loaded, setLoaded] = useState(!liteMode)

  // Resynchronise l'affichage quand l'utilisateur bascule le toggle Lite
  useEffect(() => {
    if (!liteMode) {
      // Lite désactivé -> on affiche l'image automatiquement
      setLoaded(true)
    }
    // Si liteMode passe à true, on NE cache PAS une image déjà chargée
    // (évite qu'une image visible disparaisse brutalement pendant la navigation)
  }, [liteMode])

  if (!loaded) {
    return (
      <button
        type="button"
        onClick={() => setLoaded(true)}
        className={cn(
          'flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground text-xs cursor-pointer hover:bg-muted/80 transition-colors',
          className
        )}
      >
        <ImageOff className="w-6 h-6 opacity-50" />
        <span className="flex items-center gap-1">
          <Download className="w-3 h-3" /> Charger l'image
        </span>
      </button>
    )
  }

  return <img src={src} alt={alt} className={className} loading="lazy" />
}