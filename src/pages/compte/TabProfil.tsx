import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { api, Langue } from '../../lib/api'

function normalizeDateInputValue(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return ''
  const trimmed = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  const compact = trimmed.split('T')[0].split(' ')[0]
  return /^\d{4}-\d{2}-\d{2}$/.test(compact) ? compact : ''
}

export default function TabProfil({ user, onSave }: { user: any; onSave: (payload: Record<string, unknown>) => Promise<unknown> }) {
  const { t } = useTranslation('compte')
  const [form, setForm] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    cin: user?.cin || '',
    dateNaissance: normalizeDateInputValue(user?.dateNaissance),
    profession: user?.profession || '',
    bio: user?.bio || '',
    languePreferee: user?.languePreferee || '',
    profilePicture: user?.profilePicture || '',
  })
  const [langues, setLangues] = useState<Langue[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setForm({
      prenom: user?.prenom || '',
      nom: user?.nom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      cin: user?.cin || '',
      dateNaissance: normalizeDateInputValue(user?.dateNaissance),
      profession: user?.profession || '',
      bio: user?.bio || '',
      languePreferee: user?.languePreferee || '',
      profilePicture: user?.profilePicture || '',
    })
  }, [user])

  useEffect(() => {
    api.langues()
      .then(setLangues)
      .catch(() => setLangues([]))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      let profilePicture = form.profilePicture || null
      if (selectedProfileFile) {
        setUploadingProfile(true)
        const formData = new FormData()
        formData.append('photo', selectedProfileFile)
        const uploaded = await api.uploadProfilePicture(formData)
        profilePicture = uploaded.profilePicture || null
        setForm((prev) => ({ ...prev, profilePicture: profilePicture || '' }))
      }

      const birthDate = form.dateNaissance || null
      const age = birthDate ? (() => {
        const today = new Date()
        const birth = new Date(birthDate)
        let computedAge = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        const dayDiff = today.getDate() - birth.getDate()
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          computedAge -= 1
        }
        return Math.max(0, computedAge)
      })() : null
      await onSave({
        prenom: form.prenom || null,
        nom: form.nom || null,
        email: form.email || null,
        telephone: form.telephone || null,
        cin: form.cin || null,
        bio: form.bio || null,
        date_naissance: birthDate,
        age,
        profession: form.profession || null,
        langue_preferee: form.languePreferee ? Number(form.languePreferee) : null,
        profile_picture: profilePicture,
      })
      setSelectedProfileFile(null)
      setMessage(t('profileUpdated'))
    } catch {
      setMessage(t('updateError'))
    } finally {
      setSaving(false)
      setUploadingProfile(false)
    }
  }

  const initials = `${(form.prenom || user?.prenom || '').charAt(0)}${(form.nom || user?.nom || '').charAt(0)}`.toUpperCase() || 'U'

  return (
    <div>
      <h2 className="bebas text-2xl">{t('personalInfo')}</h2>
      <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-cyan to-brand-green text-lg font-semibold text-white">
            {form.profilePicture ? <img src={form.profilePicture} alt={t('profilePicture')} className="h-full w-full rounded-full object-cover" /> : initials}
          </div>
          <div>
            <div className="font-semibold text-foreground">{[form.prenom, form.nom].filter(Boolean).join(' ') || t('userProfile')}</div>
            <div className="text-sm text-muted-foreground">
              {user?.verification ? t('verifiedAccount') : t('unverifiedAccount')} • {user?.statut || 'active'}
            </div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {user?.createdAt ? `${t('memberSince')} ${new Date(user.createdAt).toLocaleDateString('fr-FR')}` : t('updatingProfile')}
        </div>
      </div>
      <div className="mt-5 grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{t('firstName')}</label>
          <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.prenom} onChange={(e) => setForm((prev) => ({ ...prev, prenom: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{t('lastName')}</label>
          <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.nom} onChange={(e) => setForm((prev) => ({ ...prev, nom: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{t('email')}</label>
          <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{t('phone')}</label>
          <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.telephone} onChange={(e) => setForm((prev) => ({ ...prev, telephone: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{t('cin')}</label>
          <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.cin} onChange={(e) => setForm((prev) => ({ ...prev, cin: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{t('birthDate')}</label>
          <input type="date" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.dateNaissance} onChange={(e) => setForm((prev) => ({ ...prev, dateNaissance: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{t('profession')}</label>
          <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.profession} onChange={(e) => setForm((prev) => ({ ...prev, profession: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{t('preferredLanguage')}</label>
          <select
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white"
            value={form.languePreferee ?? ''}
            onChange={(e) => setForm((prev) => ({ ...prev, languePreferee: e.target.value }))}
          >
            <option value="">{t('chooseLanguage')}</option>
            {langues.map((langue) => (
              <option key={langue.id_langue} value={langue.id_langue}>
                {langue.nom_langue}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{t('profilePicture')}</label>
          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border bg-muted/30 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-cyan to-brand-green text-lg font-semibold text-white">
                {form.profilePicture ? <img src={form.profilePicture} alt={t('profilePicture')} className="h-full w-full object-cover" /> : <span>{initials}</span>}
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedProfileFile ? `${t('fileReady')} ${selectedProfileFile.name}` : t('chooseImage')}
              </div>
            </div>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setSelectedProfileFile(e.target.files?.[0] || null)}
              />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" /> {t('chooseImageBtn')}
              </Button>
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{t('userLoves')}</label>
          <textarea
            rows={4}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white"
            value={form.bio}
            onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
            placeholder="Voyages, musique, sport, cuisine, lecture..."
          />
          <p className="mt-1 text-xs text-muted-foreground">{t('fieldOptional')}</p>
        </div>
      </div>
      {message ? <p className="mt-4 text-sm text-brand-cyan-dark">{message}</p> : null}
      <Button className="mt-6 bg-brand-cyan text-white hover:bg-brand-cyan-dark" onClick={handleSave} disabled={saving || uploadingProfile}>
        {saving || uploadingProfile ? t('saving') : t('save')}
      </Button>
    </div>
  )
}
