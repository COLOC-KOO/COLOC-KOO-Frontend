// lib/useLiteMode.ts
import { useEffect, useState } from 'react'

const LITE_MODE_STORAGE_KEY = 'colockoo_lite_mode'

export function useLiteMode() {
  const [liteMode, setLiteMode] = useState(
    () => localStorage.getItem(LITE_MODE_STORAGE_KEY) === 'true'
  )

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ liteMode: boolean }>
      setLiteMode(custom.detail.liteMode)
    }
    window.addEventListener('litemodechange', handler)
    return () => window.removeEventListener('litemodechange', handler)
  }, [])

  return liteMode
}