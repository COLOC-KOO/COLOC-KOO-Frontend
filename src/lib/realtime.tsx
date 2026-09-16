import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react'
import { getWebSocketUrl, getToken } from './api'   // ⬅️ un seul import
import { useAuth } from './auth'

type Listener = (payload: any) => void

interface RealtimeCtx {
  connected: boolean
  subscribe: (fn: Listener) => () => void
  send: (data: any) => boolean
}

const RealtimeContext = createContext<RealtimeCtx | null>(null)

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [connected, setConnected] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const listenersRef = useRef<Set<Listener>>(new Set())
  const reconnectRef = useRef<number | null>(null)
  const disposedRef = useRef(false)

  useEffect(() => {
    if (!user) return

    disposedRef.current = false

    const connect = () => {
      const base = getWebSocketUrl()
      const hasToken = /[?&]token=/.test(base)

      // getWebSocketUrl() peut déjà inclure ?token=... → ne pas doubler
      let url = base
      if (!hasToken) {
        const token = getToken()
        if (!token) {
          console.warn('[realtime] Pas de token, WS non ouvert')
          return
        }
        url = base.includes('?')
          ? `${base}&token=${encodeURIComponent(token)}`
          : `${base}?token=${encodeURIComponent(token)}`
      }

      console.log('[realtime] connexion WS ->', url.split('token=')[0] + 'token=***')
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('[realtime] WS connecté ✅')
        setConnected(true)
      }

      ws.onmessage = (event) => {
        console.log('[realtime] message reçu :', event.data)
        try {
          const payload = JSON.parse(event.data)
          listenersRef.current.forEach((fn) => fn(payload))
        } catch (err) {
          console.warn('[realtime] payload invalide', err)
        }
      }

      ws.onclose = (e) => {
        console.log('[realtime] WS fermé (code', e.code, ') → reconnexion dans 1.5s')
        setConnected(false)
        if (!disposedRef.current) {
          reconnectRef.current = window.setTimeout(connect, 1500)
        }
      }

      ws.onerror = () => {
        // onclose gère la reconnexion
      }
    }

    connect()

    return () => {
      disposedRef.current = true
      if (reconnectRef.current) window.clearTimeout(reconnectRef.current)
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [user?.id])

  const subscribe = useCallback((fn: Listener) => {
    listenersRef.current.add(fn)
    return () => {
      listenersRef.current.delete(fn)
    }
  }, [])

  const send = useCallback((data: any) => {
    const ws = wsRef.current
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data))
      return true
    }
    console.warn('[realtime] send ignoré : WS non ouvert')
    return false
  }, [])

  return (
    <RealtimeContext.Provider value={{ connected, subscribe, send }}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext)
  if (!ctx) throw new Error('useRealtime doit être utilisé dans <RealtimeProvider>')
  return ctx
}