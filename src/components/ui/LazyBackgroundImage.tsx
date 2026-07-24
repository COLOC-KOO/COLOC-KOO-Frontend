// components/ui/LazyBackgroundImage.tsx
import React, { useEffect, useState } from 'react'
import { ImageOff, Download } from 'lucide-react'
import { useLiteMode } from '../../lib/useLiteMode'
import { cn } from '../../lib/utils'

interface LazyBackgroundImageProps {
  src: string
  className?: string
  overlayClassName?: string
  children?: React.ReactNode
}

export function LazyBackgroundImage({ src, className, overlayClassName, children }: LazyBackgroundImageProps) {
  const liteMode = useLiteMode()
  const [loaded, setLoaded] = useState(!liteMode)

  useEffect(() => {
    setLoaded(!liteMode)
  }, [liteMode])

  if (!loaded) {
    return (
      <div className={cn('absolute inset-0 z-0 flex items-center justify-center bg-[var(--muted)]', className)}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setLoaded(true)
          }}
          className="flex flex-col items-center gap-2 text-muted-foreground text-xs px-4 py-2 rounded-lg hover:bg-black/5 transition-colors"
        >
          <ImageOff className="w-6 h-6 opacity-50" />
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" /> Charger l'image
          </span>
        </button>
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