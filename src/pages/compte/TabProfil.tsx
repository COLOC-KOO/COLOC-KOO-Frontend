import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Check, CircleUserRound, Info, Lock, Store, Upload } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { api, Langue } from '../../lib/api'

function normalizeDateInputValue(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return ''
  const trimmed = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  const compact = trimmed.split('T')[0].split(' ')[0]
  return /^\d{4}-\d{2}-\d{2}$/.test(compact) ? compact : ''
}

function computeAge(value: unknown) {
  const birthDate = normalizeDateInputValue(value)
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return null
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  const dayDiff = today.getDate() - birth.getDate()
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age -= 1
  return Math.max(0, age)
}

export default function TabProfil({
  user,
  onSave,
}: {
  user: any
  onSave: (payload: Record<string, unknown>) => Promise<unknown>
}) {
  const { t } = useTranslation('compte')
  const [form, setForm] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    cin: user?.cin || '',
    dateNaissance: normalizeDateInputValue(user?.dateNaissance),
    profession: user?.profession || '',
    villeOrigine: user?.villeOrigine || '',
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
      villeOrigine: user?.villeOrigine || '',
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
      await onSave({
        prenom: form.prenom || null,
        nom: form.nom || null,
        email: form.email || null,
        telephone: form.telephone || null,
        cin: form.cin || null,
        bio: form.bio || null,
        date_naissance: birthDate,
        age: computeAge(birthDate),
        profession: form.profession || null,
        ville_origine: form.villeOrigine || null,
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
  const ageDisplay = user?.age || computeAge(form.dateNaissance)
  const bioLength = form.bio.length
  const inputClass = 'w-full rounded-xl border border-[#d8d8d8] bg-white px-4 py-3 text-sm text-[#2b2b2b] outline-none transition-colors focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/15 disabled:bg-[#f6f6f4] disabled:text-[#5c5c5c]'
  const labelClass = 'mb-2 block text-sm font-semibold text-[#2b2b2b]'
  const lockNote = (
    <span className="ml-1 inline-flex items-center gap-1 text-xs font-normal text-[#9b9b9b]">
      <Lock className="h-3 w-3" /> {t('notEditable')}
    </span>
  )

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#e5e2dc] bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-3 font-bebas text-2xl tracking-wide text-[#2b2b2b]">
              <CircleUserRound className="h-5 w-5 text-brand-cyan" />
              {t('profile')}
            </h2>
            <p className="mt-1 text-sm text-[#8b8b8b]">
              {t('profileInfoDescription')}
            </p>
          </div>
          <div className="hidden h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-cyan to-brand-green text-sm font-semibold text-white sm:flex">
            {form.profilePicture ? <img src={form.profilePicture} alt={t('profilePicture')} className="h-full w-full object-cover" /> : initials}
          </div>
        </div>

        <div className="grid gap-x-4 gap-y-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>{t('lastName')} {lockNote}</label>
            <input className={inputClass} value={form.nom} disabled readOnly />
          </div>

          <div>
            <label className={labelClass}>{t('firstName')} {lockNote}</label>
            <input className={inputClass} value={form.prenom} disabled readOnly />
          </div>

          <div>
            <label className={labelClass}>{t('age')} {lockNote}</label>
            <input className={`${inputClass} md:max-w-[275px]`} value={ageDisplay ? `${ageDisplay} ${t('years')}` : ''} disabled readOnly />
          </div>

          <div className="hidden md:block" />

          <div className="md:col-span-2">
            <label className={labelClass}>
              {t('bio')} <span className="font-normal text-[#a3a3a3]">- {t('bioMaxLength')}</span>
            </label>
            <textarea
              rows={4}
              maxLength={500}
              className={`${inputClass} min-h-[105px] resize-y`}
              value={form.bio}
              onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder={t('bioPlaceholder')}
            />
            <p className="mt-2 text-right text-xs text-[#9b9b9b]">{bioLength} / 500 {t('characters')}</p>
          </div>

          <div>
            <label className={labelClass}>{t('email')}</label>
            <input className={inputClass} value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
          </div>

          <div>
            <label className={labelClass}>{t('phone')}</label>
            <div className="grid grid-cols-[140px_1fr] gap-3">
              <select className={inputClass} defaultValue="+261" aria-label={t('countryCode')}>
                <option value="+261">MG +261</option>
                <option value="+33">FR +33</option>
              </select>
              <input className={inputClass} value={form.telephone} onChange={(e) => setForm((prev) => ({ ...prev, telephone: e.target.value }))} />
            </div>
            <p className="mt-2 flex items-center gap-1 text-xs text-[#9b9b9b]">
              <Info className="h-3.5 w-3.5 text-lime-500" />
              {t('phoneExample')}
            </p>
          </div>

          <div>
            <label className={labelClass}>{t('originCity')} <span className="font-normal text-[#a3a3a3]">({t('optional')})</span></label>
            <input className={inputClass} value={form.villeOrigine} onChange={(e) => setForm((prev) => ({ ...prev, villeOrigine: e.target.value }))} />
          </div>

          <div>
            <label className={labelClass}>{t('profession')} <span className="font-normal text-[#a3a3a3]">({t('optional')})</span></label>
            <select className={inputClass} value={form.profession} onChange={(e) => setForm((prev) => ({ ...prev, profession: e.target.value }))}>
              <option value="">{t('select')}</option>
              <option value="Étudiant(e)">{t('student')}</option>
              <option value="Salarié(e)">{t('employee')}</option>
              <option value="Indépendant(e)">{t('selfEmployed')}</option>
              <option value="En recherche">{t('lookingForWork')}</option>
              {form.profession && !['Étudiant(e)', 'Salarié(e)', 'Indépendant(e)', 'En recherche'].includes(form.profession) ? (
                <option value={form.profession}>{form.profession}</option>
              ) : null}
            </select>
          </div>

          <div>
            <label className={labelClass}>{t('cin')}</label>
            <input className={inputClass} value={form.cin} onChange={(e) => setForm((prev) => ({ ...prev, cin: e.target.value }))} />
          </div>

          <div>
            <label className={labelClass}>{t('preferredLanguage')}</label>
            <select
              className={inputClass}
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
            <label className={labelClass}>{t('profilePicture')}</label>
            <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-[#d8d8d8] bg-[#fafaf8] p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-cyan to-brand-green text-lg font-semibold text-white">
                  {form.profilePicture ? <img src={form.profilePicture} alt={t('profilePicture')} className="h-full w-full object-cover" /> : <span>{initials}</span>}
                </div>
                <div className="text-sm text-[#777]">
                  {selectedProfileFile ? `${t('fileReady')} ${selectedProfileFile.name}` : t('chooseImage')}
                </div>
              </div>
              <div>
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

          {message ? <p className="md:col-span-2 text-sm font-medium text-brand-cyan-dark">{message}</p> : null}

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploadingProfile}
              className="inline-flex items-center gap-2 rounded-xl bg-lime-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-lime-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
              {saving || uploadingProfile ? t('saving') : t('saveChanges')}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-cyan/20 bg-brand-cyan/10 px-6 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <Store className="mt-1 h-7 w-7 shrink-0 text-brand-cyan" />
            <div>
              <h3 className="text-base font-bold text-[#2b2b2b]">{t('partnerSectionTitle')}</h3>
              <p className="mt-1 text-sm text-[#8b8b8b]">
                {t('partnerSectionDescription')}
              </p>
            </div>
          </div>
          <a
            href="/partenaires"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-cyan px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-cyan-dark"
          >
            <ArrowRight className="h-4 w-4" />
            {t('becomePartner')}
          </a>
        </div>
      </section>
    </div>
  )
}
