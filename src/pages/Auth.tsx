import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Logo } from '../components/Logo'
import { Button } from '../components/ui/Button'
import { Poste } from '../lib/api'
import { roleLevel, useAuth } from '../lib/auth'

const postes: { value: Poste; label: string }[] = [
  { value: 'colocataire', label: 'colocataire' },
  { value: 'proprietaire', label: 'proprietaire' },
  /*{ value: 'moderateur', label: 'moderateur' },
  { value: 'admin', label: 'admin' },
  { value: 'superadmin', label: 'superadmin' },*/
]

export default function Auth() {
  const { t } = useTranslation('auth')
  const [params] = useSearchParams()
  const [mode, setMode] = useState<'signin' | 'signup'>(
    params.get('mode') === 'signup' ? 'signup' : 'signin'
  )
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    mot_de_passe: '',
    poste: 'colocataire' as Poste,
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login, register, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    navigate(roleLevel(user.poste) > 0 ? '/admin' : '/compte', { replace: true })
  }, [navigate, user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const connected =
        mode === 'signin'
          ? await login(form.email, form.mot_de_passe)
          : await register({
              email: form.email,
              mot_de_passe: form.mot_de_passe,
              nom: form.nom,
              prenom: form.prenom,
              telephone: form.telephone || undefined,
              poste: form.poste,
            })

      const redirect = params.get('redirect')
      navigate(redirect || (roleLevel(connected.poste) > 0 ? '/admin' : '/compte'), { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loginError'))
    } finally {
      setSubmitting(false)
    }
  }

  // Fonction pour obtenir le label traduit d'un poste
  const getPosteLabel = (posteValue: string): string => {
    const translationMap: Record<string, string> = {
      'colocataire': t('colocataire'),
      'proprietaire': t('proprietaire'),
      'moderateur': t('moderateur'),
      'admin': t('admin'),
      'superadmin': t('superadmin'),
    }
    return translationMap[posteValue] || posteValue
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex bg-gradient-to-br from-brand-cyan via-brand-cyan-dark to-brand-green p-12 text-white flex-col justify-between">
        <Logo />
        <div>
          <div className="bebas text-5xl leading-none">
            {t('welcome')}
          </div>
          <p className="mt-4 text-white/85 max-w-sm">
            {t('verifiedAnnouncements')}
          </p>
        </div>
        <div className="text-xs text-white/60">2026 {t('copyright')}</div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-6">
            <Logo />
          </div>
          <div className="flex gap-1 p-1 bg-muted rounded-lg text-sm mb-6">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 rounded-md font-semibold ${
                mode === 'signin' ? 'bg-white shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {t('signin')}
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-md font-semibold ${
                mode === 'signup' ? 'bg-white shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {t('signup')}
            </button>
          </div>

          <h1 className="bebas text-3xl">{mode === 'signin' ? t('welcomeBack') : t('createAccount')}</h1>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">{t('firstName')}</label>
                    <input
                      required
                      className="input"
                      value={form.prenom}
                      onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">{t('lastName')}</label>
                    <input
                      required
                      className="input"
                      value={form.nom}
                      onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">{t('role')}</label>
                  <select
                    required
                    className="input"
                    value={form.poste}
                    onChange={(e) => setForm({ ...form, poste: e.target.value as Poste })}
                  >
                    {postes.map((poste) => (
                      <option key={poste.value} value={poste.value}>
                        {getPosteLabel(poste.value)}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">{t('email')}</label>
              <input
                required
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">{t('password')}</label>
              <input
                required
                minLength={6}
                type="password"
                className="input"
                value={form.mot_de_passe}
                onChange={(e) => setForm({ ...form, mot_de_passe: e.target.value })}
              />
              {mode === 'signup' && (
                <p className="mt-1 text-xs text-muted-foreground">{t('passwordMinLength')}</p>
              )}
            </div>
            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <Button disabled={submitting} type="submit" className="w-full bg-brand-cyan hover:bg-brand-cyan-dark text-white">
              {submitting ? t('processing') : mode === 'signin' ? t('signinBtn') : t('signupBtn')}
            </Button>
          </form>

          <div className="mt-6 text-xs text-center text-muted-foreground">
            <Link to="/admin" className="text-brand-cyan-dark font-semibold">
              {t('backOfficeAccess')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}