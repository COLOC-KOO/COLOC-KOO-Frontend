import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  Download,
  Eye,
  EyeOff,
  Fingerprint,
  Key,
  Laptop,
  Lock,
  LogOut,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  Smartphone,
  Trash,
  X,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { api } from '../../lib/api'

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-brand-green' : 'bg-muted'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

interface AppareilConnecte {
  id: string
  type: 'mobile' | 'desktop'
  label: string
  lieu: string
  courant?: boolean
}

const APPAREILS_MOCK: AppareilConnecte[] = [
  { id: '1', type: 'mobile', label: 'Android', lieu: 'Antananarivo', courant: true },
  { id: '2', type: 'desktop', label: 'Chrome / Windows', lieu: 'il y a 3 jours' },
]

export default function TabCompteDonnees() {
  const { t } = useTranslation('compte')
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [twoFA, setTwoFA] = useState(true)
  const [savingTwoFA, setSavingTwoFA] = useState(false)
  const handleToggleTwoFA = async (value: boolean) => {
    setTwoFA(value)
    setSavingTwoFA(true)
    try {
      await api.updateSecuritySettings?.({ two_fa_enabled: value })
    } catch {
      setTwoFA(!value)
    } finally {
      setSavingTwoFA(false)
    }
  }

  const [appareils, setAppareils] = useState<AppareilConnecte[]>(APPAREILS_MOCK)
  const [disconnecting, setDisconnecting] = useState(false)
  const handleDisconnectOthers = async () => {
    setDisconnecting(true)
    try {
      await api.disconnectOtherDevices?.()
      setAppareils((prev) => prev.filter((a) => a.courant))
    } finally {
      setDisconnecting(false)
    }
  }

  const identityVerified = false

  const [analyticsOptIn, setAnalyticsOptIn] = useState(false)
  const [partnerOptIn, setPartnerOptIn] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const handleConfirmDelete = async () => {
    setDeleting(true)
    try {
      await api.deleteAccount?.()
      setShowDeleteModal(false)
    } catch {
      // on laisse le modal ouvert en cas d'erreur
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    if (!form.current || !form.next || form.next.length < 8 || form.next !== form.confirm) {
      setMessage(t('passwordValidation'))
      return
    }
    setSaving(true)
    setMessage('')
    try {
      await api.changePassword({ mot_de_passe_actuel: form.current, nouveau_mot_de_passe: form.next })
      setMessage(t('passwordUpdateSuccess'))
      setForm({ current: form.current, next: '', confirm: '' })
      setShowPasswordModal(false)
    } catch {
      setMessage(t('passwordUpdateError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Key className="w-5 h-5 text-brand-green" />
        <h2 className="bebas text-2xl">Sécurité du compte</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Tes données sont chiffrées en transit (HTTPS) et au repos. Choisis un mot de passe solide pour protéger ton compte.
      </p>

      <div className="max-w-lg">
        <label className="block text-sm font-semibold text-foreground mb-1.5">Mot de passe actuel</label>
        <div className="relative">
          <input
            type={showCurrent ? 'text' : 'password'}
            value={form.current}
            onChange={(e) => setForm((prev) => ({ ...prev, current: e.target.value }))}
            className="w-full border border-border rounded-lg px-3 py-2.5 pr-10 text-sm bg-muted/40"
          />
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {message && !showPasswordModal ? <p className="mt-4 text-sm text-brand-cyan-dark">{message}</p> : null}

      <Button
        className="mt-6 bg-brand-green text-white hover:opacity-90"
        onClick={() => {
          setMessage('')
          setShowPasswordModal(true)
        }}
        disabled={!form.current}
      >
        Changer le mot de passe
      </Button>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 relative">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-muted hover:bg-muted/70"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-full bg-brand-green-light text-brand-green flex items-center justify-center mx-auto mb-3">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="bebas text-xl text-center mb-1">Changer le mot de passe</h3>
            <p className="text-sm text-muted-foreground text-center mb-5">
              Choisis un nouveau mot de passe, différent de l'ancien.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Nouveau mot de passe <span className="font-normal text-muted-foreground">— 8 caractères min.</span>
              </label>
              <div className="relative">
                <input
                  type={showNext ? 'text' : 'password'}
                  value={form.next}
                  onChange={(e) => setForm((prev) => ({ ...prev, next: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2.5 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNext((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="mb-2">
              <label className="block text-sm font-semibold text-foreground mb-1.5">Confirmer le nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={(e) => setForm((prev) => ({ ...prev, confirm: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2.5 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {message ? <p className="mt-2 mb-2 text-sm text-brand-cyan-dark">{message}</p> : null}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 border border-border rounded-lg py-2.5 text-sm font-semibold hover:bg-muted"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-brand-green text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {saving ? t('updating') : 'Valider'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">Double authentification (2FA)</span>
              <span className="text-[10px] font-semibold bg-muted text-foreground/60 rounded-full px-2 py-0.5">recommandé</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Reçois un code à la connexion pour sécuriser ton compte. Elle est <strong>obligatoire</strong> pour les comptes administrateurs.
            </p>
          </div>
          <Toggle checked={twoFA} onChange={handleToggleTwoFA} disabled={savingTwoFA} />
        </div>

        <div className="mt-5 pt-5 border-t border-border/60">
          <div className="text-sm font-bold mb-3">Appareils connectés</div>
          <ul className="space-y-2">
            {appareils.map((a) => (
              <li key={a.id} className="flex items-center gap-2 text-sm text-foreground/80">
                {a.type === 'mobile' ? (
                  <Smartphone className="w-4 h-4 text-brand-green" />
                ) : (
                  <Laptop className="w-4 h-4 text-foreground/40" />
                )}
                <span>{a.label}</span>
                <span className="text-muted-foreground">· {a.courant ? `${a.lieu} · cet appareil` : a.lieu}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={handleDisconnectOthers}
            disabled={disconnecting || appareils.length <= 1}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold border border-border rounded-lg px-4 py-2 hover:bg-muted disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" /> {disconnecting ? 'Déconnexion...' : 'Déconnecter les autres appareils'}
          </button>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex items-center gap-2 mb-1">
          <Fingerprint className="w-5 h-5 text-brand-cyan" />
          <h3 className="bebas text-xl">Vérification d'identité</h3>
          <span className="text-[10px] font-semibold bg-muted text-foreground/60 rounded-full px-2 py-0.5">à venir · v2.0</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4 max-w-lg">
          Optionnelle. Une fois confirmée, un badge <strong>« Identité confirmée »</strong> rassure tes futurs colocataires. La vérification se fera via ton opérateur mobile (USSD : Telma / Orange / Airtel), sans frais de SMS.
        </p>
        <div className="flex gap-2">
          <button disabled className="inline-flex items-center gap-2 text-sm font-semibold border border-border rounded-lg px-4 py-2 text-foreground/60 opacity-70 cursor-not-allowed">
            <ShieldOff className="w-4 h-4" /> Identité non confirmée
          </button>
          <button disabled className="inline-flex items-center gap-2 text-sm font-semibold border border-border rounded-lg px-4 py-2 text-foreground/40 opacity-60 cursor-not-allowed">
            <Lock className="w-4 h-4" /> Bientôt disponible
          </button>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-brand-cyan" />
          <h3 className="bebas text-xl">Données personnelles</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Tu contrôles l'usage de tes données, conformément au RGPD.</p>
        <div className="flex items-start justify-between gap-4 py-3 border-b border-border/60">
          <div>
            <div className="text-sm font-semibold">Usage des données à des fins d'analyse anonymisée</div>
            <div className="text-xs text-muted-foreground mt-0.5">Aide à comprendre le marché de la colocation à Madagascar. Données anonymisées, jamais revendues.</div>
          </div>
          <Toggle checked={analyticsOptIn} onChange={setAnalyticsOptIn} />
        </div>
        <div className="flex items-start justify-between gap-4 py-3">
          <div>
            <div className="text-sm font-semibold">Recevoir des informations des partenaires</div>
            <div className="text-xs text-muted-foreground mt-0.5">Offres solidaires, logement, emploi étudiant. Aucun démarchage commercial intrusif.</div>
          </div>
          <Toggle checked={partnerOptIn} onChange={setPartnerOptIn} />
        </div>

        <div className="bg-brand-green/5 border border-brand-green/20 rounded-xl p-4 mt-4">
          <div className="flex items-center gap-1.5 text-sm font-bold text-brand-green">
            <RefreshCw className="w-4 h-4" /> Conservation de tes données
          </div>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
            <li>Annonces et textes : archivés 5 ans (invisibles publiquement), puis purge automatique.</li>
            <li>Photos : conservées 1 an maximum.</li>
            <li>Tu peux demander l'export ou la suppression de tes données à tout moment.</li>
          </ul>
        </div>

        <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold border border-border rounded-lg px-4 py-2 hover:bg-muted">
          <Download className="w-4 h-4" /> Télécharger mes données
        </button>
      </div>

      <div className="mt-8 border border-red-300 bg-red-50 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="bebas text-xl text-red-700">Supprimer mon compte</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Cette action est définitive : tes annonces, alertes et conversations seront supprimées.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center gap-2 text-sm font-semibold border border-red-600 text-red-600 rounded-lg px-4 py-2 hover:bg-red-600 hover:text-white transition-colors"
        >
          <Trash className="w-4 h-4" /> Supprimer définitivement mon compte
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 relative text-center">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-muted hover:bg-muted/70"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="bebas text-xl mb-2">Supprimer ton compte ?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Toutes tes données (annonces, alertes, conversations) seront définitivement effacées. Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 border border-border rounded-lg py-2.5 text-sm font-semibold hover:bg-muted"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 border border-red-600 text-red-600 rounded-lg py-2.5 text-sm font-semibold hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
              >
                <Trash className="w-4 h-4" /> {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
