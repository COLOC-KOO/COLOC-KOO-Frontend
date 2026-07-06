import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, getToken } from './api'
import { useAuth } from './auth'

interface ConfigContextValue {
  config: Record<string, unknown>
  loading: boolean
  error: string | null
  refreshConfig: () => Promise<void>
}

const ConfigContext = createContext<ConfigContextValue | null>(null)

function parseConfigValue(value: unknown): unknown {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadConfig = async () => {
    setLoading(true)
    setError(null)

    if (!getToken()) {
      setConfig({})
      setLoading(false)
      return
    }

    try {
      const data = await api.backofficeAdministration()
      const configuration = Array.isArray(data.configuration) ? data.configuration : []
      const map = configuration.reduce((acc: Record<string, unknown>, item: any) => {
        if (item?.cle) {
          acc[item.cle] = parseConfigValue(item.valeur)
        }
        return acc
      }, {})
      setConfig(map)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger la configuration.')
    } finally {
      setLoading(false)
    }
  }

  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setConfig({})
      setLoading(false)
      setError(null)
      return
    }

    loadConfig()
  }, [user, authLoading])

  const value = useMemo(
    () => ({ config, loading, error, refreshConfig: loadConfig }),
    [config, loading, error]
  )

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
}

export function useConfig() {
  const context = useContext(ConfigContext)
  if (!context) {
    throw new Error('useConfig must be used inside ConfigProvider')
  }
  return context
}
