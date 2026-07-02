import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, AuthUser, clearSession, getStoredUser, getToken, saveSession } from './api'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  isAdmin: boolean
  login: (email: string, mot_de_passe: string) => Promise<AuthUser>
  register: (payload: Parameters<typeof api.register>[0]) => Promise<AuthUser>
  updateProfile: (payload: Record<string, unknown>) => Promise<AuthUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const adminRoles = new Set(['superadmin', 'admin', 'moderateur'])

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser())
  const [loading, setLoading] = useState(Boolean(getToken()))

  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    api
      .me()
      .then((freshUser) => {
        setUser(freshUser)
        localStorage.setItem('colockoo_user', JSON.stringify(freshUser))
      })
      .catch(() => {
        clearSession()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAdmin: Boolean(user && adminRoles.has(user.poste)),
      async login(email, mot_de_passe) {
        const session = await api.login({ email, mot_de_passe })
        saveSession(session.user, session.token)
        setUser(session.user)
        return session.user
      },
      async register(payload) {
        const session = await api.register(payload)
        saveSession(session.user, session.token)
        setUser(session.user)
        return session.user
      },
      async updateProfile(payload) {
        const updated = await api.updateMe(payload)
        const mergedUser: AuthUser = {
          ...updated,
          bio: typeof payload.bio === 'string' ? payload.bio : updated.bio ?? null,
          profilePicture: typeof payload.profile_picture === 'string' ? payload.profile_picture : updated.profilePicture ?? null,
          dateNaissance: typeof payload.date_naissance === 'string' ? payload.date_naissance : updated.dateNaissance ?? null,
        }
        saveSession(mergedUser, getToken() || '')
        setUser(mergedUser)
        return mergedUser
      },
      logout() {
        clearSession()
        setUser(null)
      },
    }),
    [loading, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return value
}

export function roleLevel(poste?: string) {
  if (poste === 'superadmin') return 3
  if (poste === 'admin') return 2
  if (poste === 'moderateur') return 1
  return 0
}
