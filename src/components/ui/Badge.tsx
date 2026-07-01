import React from 'react'
import { cn } from '../../lib/utils'

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border',
        className
      )}
    >
      {children}
    </span>
  )
}
