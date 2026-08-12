import React, { useState } from 'react'
import { Smartphone, Settings, Download } from 'lucide-react'
import { useTranslation, Trans } from 'react-i18next'

/* ------------------------------------------------------------------ */
/*  Toggle réutilisable (switch vert, façon maquette)                 */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Table des préférences de notification                             */
/* ------------------------------------------------------------------ */
type EventItem = {
  id: string
  push: boolean
  email: boolean | null // null = non applicable ("—")
}

const DEFAULT_EVENTS: EventItem[] = [
  { id: 'new_msg', push: true, email: true },
  { id: 'expire_j7', push: true, email: true },
  { id: 'expired', push: true, email: true },
  { id: 'alert_match', push: true, email: true },
  { id: 'msg_auto', push: true, email: null },
  { id: 'msg_blocked', push: true, email: null },
  { id: 'pub_confirm', push: true, email: true },
]

export default function TabPreference() {
  const { t } = useTranslation('preferences')

  /* Affichage & réseau */
  const [modeAllege, setModeAllege] = useState(false)
  const [horsLigne, setHorsLigne] = useState(true)

  /* Notifications */
  const [defaultMode, setDefaultMode] = useState<'push' | 'email' | 'both'>('push')
  const [events, setEvents] = useState<EventItem[]>(DEFAULT_EVENTS)
  const [saved, setSaved] = useState(false)

  const toggleEvent = (id: string, field: 'push' | 'email') => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id && ev[field] !== null ? { ...ev, [field]: !ev[field] } : ev))
    )
  }

  const handleSave = () => {
    // TODO: brancher à l'API de préférences quand elle sera disponible
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------ */}
      {/* AFFICHAGE & RÉSEAU                                           */}
      {/* ------------------------------------------------------------ */}
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

      {/* ------------------------------------------------------------ */}
      {/* PRÉFÉRENCES DE NOTIFICATION                                  */}
      {/* ------------------------------------------------------------ */}
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
              onClick={() => setDefaultMode(opt.id as typeof defaultMode)}
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
          className="mt-6 inline-flex items-center gap-2 bg-brand-green text-white text-sm font-bold rounded-lg px-5 py-2.5 hover:brightness-95 transition-all"
        >
          ✓ {saved ? t('notifications.saved') : t('notifications.save')}
        </button>
      </div>
    </div>
  )
}