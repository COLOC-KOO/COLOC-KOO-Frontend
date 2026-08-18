import React, { useEffect, useRef, useState } from 'react'
import { Settings, Smartphone, Download, Check } from 'lucide-react'
import { useTranslation, Trans } from 'react-i18next'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
const API = BASE.endsWith('/api') ? BASE.slice(0, -4) : BASE

// Doit correspondre à la clé utilisée dans src/lib/api.ts (TOKEN_KEY)
const TOKEN_KEY = 'colockoo_token'

export interface EventPreference {
  id: string
  push: boolean
  email: boolean | null
}

interface TabPreferenceProps {
  idUtilisateur?: number | string
}

const DEFAULT_EVENTS: EventPreference[] = [
  { id: 'new_msg', push: true, email: true },
  { id: 'expire_j7', push: true, email: true },
  { id: 'expired', push: true, email: true },
  { id: 'alert_match', push: true, email: true },
  { id: 'msg_auto', push: true, email: null },
  { id: 'msg_blocked', push: true, email: null },
  { id: 'pub_confirm', push: true, email: true },
]

const USER_STORAGE_KEY = 'colockoo_user'

// Filet de sécurité : si le parent ne transmet pas idUtilisateur (prop
// undefined/null/0/""), on va chercher l'id directement dans le user stocké
// en localStorage au login. Ça évite de dépendre d'un composant parent
// potentiellement bugué, tout en gardant idUtilisateur en priorité s'il est
// bien fourni.
function getUserIdFromStorage(): number | string | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    if (!raw) return undefined
    const parsed = JSON.parse(raw)
    return parsed?.id ?? parsed?.id_utilisateur ?? undefined
  } catch (e) {
    console.error('[TabPreference] impossible de parser colockoo_user depuis localStorage', e)
    return undefined
  }
}

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
  console.log('[TabPreference] token trouvé dans localStorage ?', token ? 'OUI (' + token.slice(0, 12) + '...)' : 'NON')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange?: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <label
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-brand-green' : 'bg-gray-300'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </label>
  )
}

export default function TabPreference({ idUtilisateur }: TabPreferenceProps) {
  const { t } = useTranslation('preferences')

  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [saved, setSaved] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [modeAllege, setModeAllege] = useState(false)
  const [horsLigne, setHorsLigne] = useState(true)

  const [defaultMode, setDefaultMode] = useState<'push' | 'email' | 'both'>('push')
  const [events, setEvents] = useState<EventPreference[]>(DEFAULT_EVENTS)

  const requestIdRef = useRef(0)
  const dirtyRef = useRef(false)

  // idUtilisateur effectif : priorité à la prop reçue du parent ; si elle
  // est absente/falsy, on retombe sur l'id stocké en localStorage au login.
  const [resolvedId, setResolvedId] = useState<number | string | undefined>(
    idUtilisateur || getUserIdFromStorage()
  )

  useEffect(() => {
    if (idUtilisateur) {
      console.log('[TabPreference] idUtilisateur reçu via prop =', idUtilisateur)
      setResolvedId(idUtilisateur)
      return
    }
    const fallback = getUserIdFromStorage()
    console.log('[TabPreference] idUtilisateur absent des props, fallback localStorage =', fallback)
    setResolvedId(fallback)
  }, [idUtilisateur])

  const charger = async () => {
    console.log('[TabPreference] charger() appelé, resolvedId =', resolvedId)

    if (!resolvedId) {
      console.log('[TabPreference] pas de resolvedId (ni prop ni localStorage), on annule le chargement')
      setLoading(false)
      return
    }

    const myRequestId = ++requestIdRef.current
    const url = `${API}/api/preferences/${resolvedId}`
    console.log('[TabPreference] GET vers', url, '(requestId =', myRequestId, ')')

    try {
      setLoading(true)
      setErrorMsg(null)

      const res = await fetch(url, { headers: authHeaders() })
      console.log('[TabPreference] GET réponse status =', res.status, res.ok ? 'OK' : 'ERREUR')

      if (!res.ok) throw new Error('Erreur au chargement des préférences')

      const data = await res.json()
      console.log('[TabPreference] GET body reçu =', data)

      if (myRequestId !== requestIdRef.current) {
        console.log('[TabPreference] requête obsolète (une plus récente est partie entre-temps), on ignore la réponse')
        return
      }

      if (dirtyRef.current) {
        console.log('[TabPreference] état local "dirty" (modifs non sauvegardées), on n\'écrase pas les toggles')
        return
      }

      const loadedMode = data.mode_defaut || data.defaultMode
      if (loadedMode === 'push' || loadedMode === 'email' || loadedMode === 'both') {
        console.log('[TabPreference] mode par défaut chargé =', loadedMode)
        setDefaultMode(loadedMode)
      }

      const loadedEvents = data.evenements || data.events
      console.log('[TabPreference] evenements bruts reçus =', loadedEvents)
      if (Array.isArray(loadedEvents) && loadedEvents.length > 0) {
        console.log('[TabPreference] on applique', loadedEvents.length, 'événements chargés depuis le serveur')
        setEvents(loadedEvents)
      } else {
        console.warn('[TabPreference] evenements vide ou absent côté serveur → on garde DEFAULT_EVENTS (donc les toggles semblent "revenir à zéro")')
      }
    } catch (err) {
      if (myRequestId !== requestIdRef.current) return
      console.error('[TabPreference] erreur chargement des préférences :', err)
      setErrorMsg('Impossible de charger vos préférences.')
    } finally {
      if (myRequestId === requestIdRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    charger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedId])

  const toggleEvent = (id: string, field: 'push' | 'email') => {
    dirtyRef.current = true
    console.log('[TabPreference] toggle', field, 'pour l\'événement', id, '(dirty = true)')
    setEvents((prev) => {
      const next = prev.map((ev) => {
        if (ev.id === id && ev[field] !== null) {
          return { ...ev, [field]: !ev[field] }
        }
        return ev
      })
      console.log('[TabPreference] nouvel état local events après toggle =', next)
      return next
    })
  }

  const handleDefaultModeChange = (mode: 'push' | 'email' | 'both') => {
    dirtyRef.current = true
    console.log('[TabPreference] changement de mode par défaut →', mode, '(dirty = true)')
    setDefaultMode(mode)
  }

  const handleSave = async () => {
    if (!resolvedId) {
      console.log('[TabPreference] handleSave annulé : pas de resolvedId')
      return
    }

    const url = `${API}/api/preferences/${resolvedId}`
    const payload = { mode_defaut: defaultMode, evenements: events }
    console.log('[TabPreference] PUT vers', url)
    console.log('[TabPreference] payload envoyé =', payload)

    try {
      setSaving(true)
      setErrorMsg(null)

      const res = await fetch(url, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })

      console.log('[TabPreference] PUT réponse status =', res.status, res.ok ? 'OK' : 'ERREUR')

      const responseBody = await res.clone().json().catch(() => null)
      console.log('[TabPreference] PUT body reçu =', responseBody)

      if (!res.ok) throw new Error('Erreur lors de la sauvegarde')

      dirtyRef.current = false
      console.log('[TabPreference] sauvegarde OK, dirty remis à false')

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('[TabPreference] erreur sauvegarde préférences :', err)
      setErrorMsg('Erreur lors de l’enregistrement des modifications.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        Chargement des préférences...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold">
          {errorMsg}
        </div>
      )}

      {/* AFFICHAGE & RÉSEAU */}
      <div className="bg-white border border-border rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-1">
          <Smartphone className="w-5 h-5 text-brand-cyan shrink-0" />
          <h2 className="bebas text-xl sm:text-2xl">{t('displayNetwork.title')}</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          {t('displayNetwork.subtitle')}
        </p>

        <div className="flex items-start justify-between gap-4 py-4 border-b border-border/60">
          <div className="min-w-0">
            <div className="text-sm font-bold text-foreground">
              {t('displayNetwork.lightMode')}
            </div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
              <Trans
                i18nKey="displayNetwork.lightModeDesc"
                t={t}
                components={{
                  boldActivated: <b>{t('displayNetwork.activatedAutomatically')}</b>,
                }}
              />
            </div>
          </div>
          <Toggle checked={modeAllege} onChange={setModeAllege} />
        </div>

        <div className="flex items-start justify-between gap-4 py-4 border-b border-border/60">
          <div className="min-w-0">
            <div className="text-sm font-bold text-foreground">
              {t('displayNetwork.offlineAvailability')}
            </div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {t('displayNetwork.offlineAvailabilityDesc')}
            </div>
          </div>
          <Toggle checked={horsLigne} onChange={setHorsLigne} />
        </div>

        <div className="flex items-center justify-between gap-4 py-4">
          <div className="min-w-0">
            <div className="text-sm font-bold text-foreground">
              {t('displayNetwork.installApp')}
            </div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {t('displayNetwork.installAppDesc')}
            </div>
          </div>
          <button className="shrink-0 inline-flex items-center gap-2 bg-brand-cyan text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-brand-cyan-dark transition-colors">
            <Download className="w-4 h-4" /> {t('displayNetwork.installButton')}
          </button>
        </div>
      </div>

      {/* PRÉFÉRENCES DE NOTIFICATION */}
      <div className="bg-white border border-border rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-brand-cyan shrink-0" />
          <h2 className="bebas text-xl sm:text-2xl">{t('notifications.title')}</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          {t('notifications.subtitle')}{' '}
          <span className="text-foreground/70">{t('notifications.smsInfo')}</span>
        </p>

        <label className="block text-sm font-bold text-foreground mb-2">
          {t('notifications.defaultMode')}
        </label>
        <div className="inline-flex bg-muted rounded-xl p-1 gap-1 mb-6 flex-wrap">
          {[
            { id: 'push', label: t('notifications.pushOnly') },
            { id: 'email', label: t('notifications.emailOnly') },
            { id: 'both', label: t('notifications.both') },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleDefaultModeChange(opt.id as typeof defaultMode)}
              className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
                defaultMode === opt.id
                  ? 'bg-white text-brand-cyan shadow-sm'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[420px] border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground pb-2 px-1">
                  {t('notifications.table.event')}
                </th>
                <th className="text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground pb-2 px-1 w-20">
                  {t('notifications.table.push')}
                </th>
                <th className="text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground pb-2 px-1 w-20">
                  {t('notifications.table.email')}
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id} className="border-b border-border/50 last:border-b-0">
                  <td className="py-3 px-1 text-sm text-foreground">
                    {t(`notifications.events.${ev.id}`)}
                  </td>
                  <td className="py-3 px-1 text-center">
                    <div className="flex justify-center">
                      <Toggle checked={ev.push} onChange={() => toggleEvent(ev.id, 'push')} />
                    </div>
                  </td>
                  <td className="py-3 px-1 text-center">
                    {ev.email === null ? (
                      <span
                        className="text-muted-foreground text-sm"
                        title={t('notifications.table.notApplicable')}
                      >
                        —
                      </span>
                    ) : (
                      <div className="flex justify-center">
                        <Toggle checked={ev.email} onChange={() => toggleEvent(ev.id, 'email')} />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 inline-flex items-center gap-2 bg-brand-green text-white text-sm font-bold rounded-lg px-5 py-2.5 hover:brightness-95 transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            'Enregistrement...'
          ) : saved ? (
            <>
              <Check className="w-4 h-4" /> {t('notifications.saved')}
            </>
          ) : (
            <>
              <Check className="w-4 h-4" /> {t('notifications.save')}
            </>
          )}
        </button>
      </div>
    </div>
  )
}