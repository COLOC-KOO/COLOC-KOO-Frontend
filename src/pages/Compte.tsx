import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  ArrowLeft, Bell, Check, FileText, Lock, MessageSquare, Send, Upload, User, 
  Edit, Trash, AlertTriangle, X, Camera, Home, MapPin, DollarSign, Ruler, 
  Calendar, Bed, Building2, Users, Image as ImageIcon, Heart, Search 
} from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { Button } from '../components/ui/Button'
import { api, ApiAnnonce, Langue } from '../lib/api'
import { useAuth } from '../lib/auth'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'

function normalizePhotos(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split('||').map((item) => item.trim()).filter(Boolean)
  }
  return []
}

function normalizeDateInputValue(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return ''
  const trimmed = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  const compact = trimmed.split('T')[0].split(' ')[0]
  return /^\d{4}-\d{2}-\d{2}$/.test(compact) ? compact : ''
}

function TabProfil({ user, onSave }: { user: ReturnType<typeof useAuth>['user']; onSave: (payload: Record<string, unknown>) => Promise<unknown> }) {
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

// Composant Modal amélioré
function EditAnnonceModal({ 
  annonce, 
  onClose, 
  onSave 
}: { 
  annonce: ApiAnnonce | null
  onClose: () => void
  onSave: (updated: ApiAnnonce) => void
}) {
  const { t } = useTranslation('compte')
  const [form, setForm] = useState({
    titre: '',
    description: '',
    quartier: '',
    adresse_exacte: '',
    type_propriete: 'appartement',
    prix_loyer: '',
    surface: '',
    total_colocataires: '',
    date_disponibilite: '',
    est_meuble: false,
  })
  const [editFiles, setEditFiles] = useState<File[]>([])
  const [editSaving, setEditSaving] = useState(false)
  const [editMessage, setEditMessage] = useState('')
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (annonce) {
      setForm({
        titre: annonce.titre || '',
        description: annonce.description || '',
        quartier: annonce.quartier || '',
        adresse_exacte: annonce.adresse_exacte || '',
        type_propriete: annonce.type_propriete || 'appartement',
        prix_loyer: annonce.chambre?.prix_loyer ? String(annonce.chambre.prix_loyer) : '',
        surface: annonce.chambre?.surface ? String(annonce.chambre.surface) : '',
        total_colocataires: annonce.total_colocataires !== null && annonce.total_colocataires !== undefined ? String(annonce.total_colocataires) : '',
        date_disponibilite: annonce.chambre?.date_disponibilite || '',
        est_meuble: Boolean(annonce.chambre?.date_disponibilite && annonce.chambre.est_meuble === 1),
      })
      setPhotoPreviews(normalizePhotos(annonce.photos))
    }
  }, [annonce])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setEditFiles(files)
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setPhotoPreviews(prev => [...prev, ...newPreviews])
  }

  const removePhoto = (index: number) => {
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
    if (editFiles.length > 0) {
      setEditFiles(prev => prev.filter((_, i) => i !== index - (prev.length - editFiles.length)))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!annonce) return

    const prix = Number(form.prix_loyer)
    if (!form.titre.trim() || Number.isNaN(prix) || prix < 0) {
      setEditMessage(t('requiredFields'))
      return
    }

    setEditSaving(true)
    setEditMessage('')
    try {
      let photoUrls = photoPreviews
      if (editFiles.length > 0) {
        const formData = new FormData()
        editFiles.forEach((file) => formData.append('photos', file))
        const uploadResult = await api.uploadAnnoncePhotos(formData)
        photoUrls = uploadResult.photos
      }

      const updated = await api.updateAnnonce(annonce.id, {
        titre: form.titre.trim(),
        description: form.description.trim() || null,
        quartier: form.quartier.trim() || null,
        adresse_exacte: form.adresse_exacte.trim() || null,
        type_propriete: form.type_propriete,
        total_colocataires: form.total_colocataires ? Number(form.total_colocataires) : null,
        id_ville: annonce.id_ville,
        chambres: {
          surface: form.surface ? Number(form.surface) : null,
          prix_loyer: prix,
          date_disponibilite: form.date_disponibilite || null,
          est_meuble: form.est_meuble ? 1 : 0,
        },
        photos: photoUrls,
      })
      onSave(updated)
      onClose()
    } catch (err) {
      setEditMessage(err instanceof Error ? err.message : t('updateErrorTitle'))
    } finally {
      setEditSaving(false)
    }
  }

  if (!annonce) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-border/50 px-8 py-5 flex items-start justify-between gap-3 rounded-t-3xl">
          <div>
            <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Edit className="w-6 h-6 text-brand-cyan" />
              {t('editAnnouncement')}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {annonce.titre} · {annonce.ville}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand-cyan" />
                {t('photos')}
              </div>
            </label>
            <div className="rounded-2xl border-2 border-dashed border-border hover:border-brand-cyan/50 transition-colors p-4 bg-muted/30">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                {photoPreviews.map((photo, index) => (
                  <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-border">
                    <img
                      src={photo}
                      alt={`${t('photos')} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-brand-cyan/50 transition-colors flex flex-col items-center justify-center cursor-pointer bg-white/50 hover:bg-white"
                >
                  <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">{t('addPhoto')}</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="text-xs text-muted-foreground">
                {editFiles.length > 0 
                  ? `${editFiles.length} ${t('newFilesSelected')}` 
                  : t('clickToAddPhotos')}
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-brand-cyan" />
                  {t('title')}
                </div>
              </label>
              <input
                required
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all outline-none"
                placeholder={t('exampleTitle')}
                value={form.titre}
                onChange={(e) => setForm((prev) => ({ ...prev, titre: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                {t('description')}
              </label>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all outline-none"
                placeholder={t('describeYourHome')}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-brand-cyan" />
                  {t('price')}
                </div>
              </label>
              <input
                required
                type="number"
                min="0"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all outline-none"
                placeholder={t('pricePlaceholder')}
                value={form.prix_loyer}
                onChange={(e) => setForm((prev) => ({ ...prev, prix_loyer: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-brand-cyan" />
                  {t('propertyType')}
                </div>
              </label>
              <select
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all outline-none"
                value={form.type_propriete}
                onChange={(e) => setForm((prev) => ({ ...prev, type_propriete: e.target.value }))}
              >
                <option value="appartement">{t('apartment')}</option>
                <option value="maison">{t('house')}</option>
                <option value="studio">{t('studio')}</option>
                <option value="autre">{t('other')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-cyan" />
                  {t('numberOfColocataires')}
                </div>
              </label>
              <input
                type="number"
                min="1"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all outline-none"
                placeholder={t('colocatairesPlaceholder')}
                value={form.total_colocataires}
                onChange={(e) => setForm((prev) => ({ ...prev, total_colocataires: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-cyan" />
                  {t('neighborhood')}
                </div>
              </label>
              <input
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all outline-none"
                placeholder={t('neighborhoodPlaceholder')}
                value={form.quartier}
                onChange={(e) => setForm((prev) => ({ ...prev, quartier: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                {t('exactAddress')}
              </label>
              <input
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all outline-none"
                placeholder={t('addressPlaceholder')}
                value={form.adresse_exacte}
                onChange={(e) => setForm((prev) => ({ ...prev, adresse_exacte: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-brand-cyan" />
                  {t('surface')}
                </div>
              </label>
              <input
                type="number"
                min="0"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all outline-none"
                placeholder={t('surfacePlaceholder')}
                value={form.surface}
                onChange={(e) => setForm((prev) => ({ ...prev, surface: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-cyan" />
                  {t('availableFrom')}
                </div>
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all outline-none"
                value={form.date_disponibilite}
                onChange={(e) => setForm((prev) => ({ ...prev, date_disponibilite: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.est_meuble}
                  onChange={(e) => setForm((prev) => ({ ...prev, est_meuble: e.target.checked }))}
                  className="w-4 h-4 rounded border-border text-brand-cyan focus:ring-brand-cyan focus:ring-offset-0"
                />
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-brand-cyan" />
                  {t('furnished')}
                </div>
              </label>
            </div>
          </div>

          {editMessage && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-center gap-2 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {editMessage}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end border-t border-border/50 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={editSaving}
              className="rounded-xl bg-brand-cyan hover:bg-brand-cyan-dark px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {editSaving ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('saving')}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {t('saveChanges')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TabMesAnnonces() {
  const { t } = useTranslation('compte')
  const [annonces, setAnnonces] = useState<ApiAnnonce[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingAnnonce, setEditingAnnonce] = useState<ApiAnnonce | null>(null)

  useEffect(() => {
    api.annonces({ mine: 'true', statut: 'all' })
      .then((data) => setAnnonces(data))
      .catch((err) => setError(err instanceof Error ? err.message : t('updateError')))
      .finally(() => setLoading(false))
  }, [t])

  const handleUpdateAnnonce = (updated: ApiAnnonce) => {
    setAnnonces((current) => current.map((a) => (a.id === updated.id ? updated : a)))
  }

  const handleDeleteAnnonce = async (annonce: ApiAnnonce) => {
    if (!window.confirm(t('deleteConfirm'))) return
    try {
      await api.deleteAnnonce(annonce.id)
      setAnnonces((current) => current.filter((a) => a.id !== annonce.id))
    } catch (err) {
      alert(err instanceof Error ? err.message : t('deleteError'))
    }
  }

  const statutStyles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    active: 'bg-brand-green-light text-brand-green-dark',
    rejected: 'bg-red-100 text-red-700',
    archived: 'bg-slate-100 text-slate-700',
    expired: 'bg-slate-100 text-slate-700',
  }

  const statutLabels: Record<string, string> = {
    pending: t('pending'),
    active: t('active'),
    rejected: t('rejected'),
    archived: t('archived'),
    expired: t('expired'),
  }

  return (
    <div>
      <h2 className="bebas text-2xl">{t('myAnnouncements')}</h2>
      <p className="text-sm text-muted-foreground mt-1">
        {t('allAnnouncementsDesc')}
      </p>

      {loading ? (
        <p className="mt-5 text-sm text-muted-foreground">{t('loading')}</p>
      ) : error ? (
        <p className="mt-5 text-sm text-red-600">{error}</p>
      ) : annonces.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">{t('noAnnouncements')}</p>
      ) : (
        <div className="mt-5 space-y-4">
          {annonces.map((annonce) => {
            const photos = normalizePhotos(annonce.photos)
            const img = photos[0] || FALLBACK_IMG
            return (
              <div key={annonce.id} className="rounded-3xl border border-border bg-white shadow-sm overflow-hidden">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link to={`/annonces/${annonce.id}`} className="sm:w-48 sm:h-36 shrink-0 overflow-hidden bg-muted">
                    <img
                      src={img}
                      alt={annonce.titre}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <div className="flex-1 p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <Link to={`/annonces/${annonce.id}`} className="text-lg font-semibold text-foreground hover:text-brand-cyan-dark">
                            {annonce.titre}
                          </Link>
                          <button title={t('editAnnonce')} onClick={() => setEditingAnnonce(annonce)} className="p-1.5 hover:bg-muted rounded text-muted-foreground">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button title={t('deleteAnnonce')} onClick={() => handleDeleteAnnonce(annonce)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {annonce.quartier ? `${annonce.quartier}, ` : ''}{annonce.ville}
                        </div>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statutStyles[annonce.statut] || 'bg-slate-100 text-slate-700'}`}>
                        {statutLabels[annonce.statut] || annonce.statut}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm text-muted-foreground">
                      <div>{t('priceLabel')}: {annonce.chambre?.prix_loyer ? `${annonce.chambre.prix_loyer.toLocaleString('fr-FR')} Ar` : t('unavailable')}</div>
                      <div>{t('type')}: {annonce.type_propriete}</div>
                      <div>{t('createdOn')}: {new Date(annonce.date_creation).toLocaleDateString('fr-FR')}</div>
                    </div>

                    {photos.length > 1 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto">
                        {photos.slice(1, 5).map((p, i) => (
                          <img key={i} src={p} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0 border border-border" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editingAnnonce && (
        <EditAnnonceModal
          annonce={editingAnnonce}
          onClose={() => setEditingAnnonce(null)}
          onSave={handleUpdateAnnonce}
        />
      )}
    </div>
  )
}

function TabMesFavoris() {
  const { t } = useTranslation('compte')
  const [favoris, setFavoris] = useState<ApiAnnonce[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api.favoris()
      .then(setFavoris)
      .catch((err) => {
        setFavoris([])
        setError(err instanceof Error ? err.message : t('removeFavoriteError'))
      })
      .finally(() => setLoading(false))
  }, [t])

  useEffect(() => {
    if (!toastMessage) return
    const timer = window.setTimeout(() => setToastMessage(''), 3000)
    return () => window.clearTimeout(timer)
  }, [toastMessage])

  const showToast = (message: string) => {
    setToastMessage('')
    window.setTimeout(() => setToastMessage(message), 20)
  }

  const removeFavorite = async (id: number) => {
    try {
      await api.deleteFavori(id)
      setFavoris((prev) => prev.filter((item) => item.id !== id))
      window.dispatchEvent(new CustomEvent('colockoo:favori-removed', { detail: { id: String(id) } }))
      showToast(t('removeFavoriteSuccess'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('removeFavoriteError'))
    }
  }

  return (
    <div className="relative">
      {toastMessage ? (
        <div className="fixed top-5 right-5 z-50 max-w-sm rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground shadow-2xl">
          {toastMessage}
        </div>
      ) : null}

      <h2 className="bebas text-2xl">{t('myFavorites')}</h2>
      <p className="text-sm text-muted-foreground mt-1">
        {t('myFavoritesDesc')}
      </p>

      {loading ? (
        <div className="mt-5 rounded-3xl border border-border bg-white p-6 text-sm text-muted-foreground">
          {t('loadingFavorites')}
        </div>
      ) : error ? (
        <div className="mt-5 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : favoris.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-dashed border-border bg-white p-6 text-sm text-muted-foreground">
          {t('noFavorites')}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {favoris.map((annonce) => {
            const photos = normalizePhotos(annonce.photos)
            const img = photos[0] || FALLBACK_IMG
            return (
              <div key={annonce.id} className="relative rounded-3xl border border-border bg-white shadow-sm overflow-hidden">
                <div className="absolute right-4 top-4 z-10 rounded-full bg-red-500 p-2 text-white shadow-lg">
                  <Heart className="h-4 w-4 fill-current" />
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link to={`/annonces/${annonce.id}`} className="sm:w-48 sm:h-36 shrink-0 overflow-hidden bg-muted">
                    <img
                      src={img}
                      alt={annonce.titre}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <div className="flex-1 p-5 pr-16">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <Link to={`/annonces/${annonce.id}`} className="text-lg font-semibold text-foreground hover:text-brand-cyan-dark">
                            {annonce.titre}
                          </Link>
                          <button title={t('removeFavorite')} onClick={() => removeFavorite(annonce.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {annonce.quartier ? `${annonce.quartier}, ` : ''}{annonce.ville}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm text-muted-foreground">
                      <div>{t('priceLabel')}: {annonce.chambre?.prix_loyer ? `${annonce.chambre.prix_loyer.toLocaleString('fr-FR')} Ar` : t('unavailable')}</div>
                      <div>{t('type')}: {annonce.type_propriete}</div>
                      <div>{t('addedToFavorites')}</div>
                    </div>

                    {photos.length > 1 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto">
                        {photos.slice(1, 5).map((p, i) => (
                          <img key={i} src={p} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0 border border-border" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TabNotif() {
  const { t } = useTranslation('compte')
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Array<{ 
    id_notification: number
    titre: string
    texte: string
    est_lue: number
    type_notification: string
    date_creation: string
    lien: string | null
    id_annonce?: number | null
    id_message?: number | null
    id_candidature?: number | null
  }>>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.notifications()
      .then((data) => setNotifications(data))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [])

  const handleNotificationClick = async (notification: typeof notifications[0]) => {
    try {
      // Marquer comme lu
      await api.markNotificationRead(notification.id_notification)
      
      // Construire l'URL de redirection en fonction du type
      let redirectUrl = '/compte?tab=notif'
      
      if (notification.lien) {
        // Si un lien est déjà fourni, l'utiliser
        redirectUrl = notification.lien
      } else if (notification.type_notification === 'message' && notification.id_message) {
        // Rediriger vers la messagerie
        redirectUrl = '/compte?tab=paiements'
      } else if (notification.type_notification === 'candidature' && notification.id_candidature) {
        // Rediriger vers les candidatures
        redirectUrl = '/compte?tab=dossier'
      } else if (notification.type_notification === 'annonce' && notification.id_annonce) {
        // Rediriger vers l'annonce
        redirectUrl = `/annonces/${notification.id_annonce}`
      } else if (notification.type_notification === 'favori') {
        // Rediriger vers les favoris
        redirectUrl = '/compte?tab=favoris'
      }
      
      // Supprimer la notification de la liste
      setNotifications((prev) => prev.filter((n) => n.id_notification !== notification.id_notification))
      
      // Naviguer vers la destination
      navigate(redirectUrl)
    } catch {
      // En cas d'erreur, naviguer quand même
      if (notification.lien) {
        navigate(notification.lien)
      }
    }
  }

  const handleDeleteNotification = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation()
    if (!window.confirm(t('deleteConversationConfirm'))) return
    try {
      await api.deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id_notification !== id))
    } catch {
      // ignore
    }
  }

  const handleReadAll = async () => {
    setSaving(true)
    try {
      await api.markNotificationsRead()
      setNotifications([])
    } finally {
      setSaving(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-4 h-4 text-brand-cyan" />
      case 'candidature': return <Users className="w-4 h-4 text-brand-green" />
      case 'annonce': return <Home className="w-4 h-4 text-brand-cyan-dark" />
      case 'favori': return <Heart className="w-4 h-4 text-red-500" />
      default: return <Bell className="w-4 h-4 text-muted-foreground" />
    }
  }

  return (
    <div>
      <h2 className="bebas text-2xl">{t('notifications')}</h2>
      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10">
            <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{t('noNotifications')}</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id_notification}
              onClick={() => handleNotificationClick(item)}
              className={`w-full text-left rounded-xl border p-4 transition-all cursor-pointer ${
                item.est_lue 
                  ? 'border-border bg-white hover:border-brand-cyan/30 hover:shadow-sm' 
                  : 'border-brand-cyan/20 bg-brand-cyan-light/10 hover:border-brand-cyan/40 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getNotificationIcon(item.type_notification)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-foreground">
                      {item.titre}
                    </div>
                    {!item.est_lue && (
                      <span className="inline-block w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></span>
                    )}
                  </div>
                  <div className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                    {item.texte}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-2.5 py-1 font-medium">
                      {item.type_notification === 'message' ? t('messageContact') : 
                       item.type_notification === 'candidature' ? 'Candidature' :
                       item.type_notification === 'annonce' ? 'Annonce' :
                       item.type_notification === 'favori' ? 'Favori' : t('notification')}
                    </span>
                    <span>{new Date(item.date_creation).toLocaleString('fr-FR')}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDeleteNotification(item.id_notification, e)}
                  title={t('delete')}
                  className="p-1.5 hover:bg-red-50 rounded text-red-500 transition-colors"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {notifications.length > 0 && (
        <Button className="mt-6 bg-brand-cyan text-white hover:bg-brand-cyan-dark" onClick={handleReadAll} disabled={saving}>
          {saving ? t('updating') : t('markAllAsRead')}
        </Button>
      )}
    </div>
  )
}

interface ChatMessage {
  id_message: number
  id_expediteur: number
  id_destinataire: number
  id_annonce: number | null
  sujet: string | null
  contenu: string
  date_envoi: string
  est_lu: number
  message_parent: number | null
  signalement_abus: number
  expediteur_nom: string
  expediteur_prenom: string
  destinataire_nom: string
  destinataire_prenom: string
  annonce_titre: string | null
}

interface SuperadminUser {
  id: number
  email: string
  nom: string
  prenom: string
  role: string
  poste: string
  name: string
  initials: string
}

function TabMessages() {
  const { t } = useTranslation('compte')
  const { user } = useAuth()
  const [superadmin, setSuperadmin] = useState<SuperadminUser | null>(null)
  const [threads, setThreads] = useState<Array<{
    interlocuteur_id: number
    interlocuteur_nom: string
    interlocuteur_prenom: string
    dernier_message: string
    total_messages: number
    non_lus: number
    date_dernier_message: string
  }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeThread, setActiveThread] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [msgLoading, setMsgLoading] = useState(false)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.messagesThreads(),
      api.superadmin().catch(() => null)
    ])
      .then(([threadsData, superadminData]) => {
        setThreads(threadsData)
        setSuperadmin(superadminData)
        if (threadsData.length > 0) {
          setActiveThread(threadsData[0].interlocuteur_id)
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : t('updateError')))
      .finally(() => setLoading(false))
  }, [t])

  useEffect(() => {
    if (activeThread === null) return
    setMsgLoading(true)
    setMessages([])
    api.messagesThread(activeThread)
      .then((data) => setMessages(data))
      .catch(() => setMessages([]))
      .finally(() => setMsgLoading(false))
  }, [activeThread])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!reply.trim() || activeThread === null) return
    setSending(true)
    setSendError('')
    try {
      await api.sendMessage({
        id_destinataire: activeThread,
        contenu: reply.trim(),
      })
      setReply('')
      const data = await api.messagesThread(activeThread)
      setMessages(data)
    } catch (err) {
      setSendError(err instanceof Error ? err.message : t('reportError'))
    } finally {
      setSending(false)
    }
  }

  const handleReportMessage = async (id_message: number) => {
    const raison = window.prompt(t('reportReason'))
    try {
      await api.reportMessage(id_message, { raison: raison || t('reportSent') })
      if (activeThread !== null) {
        const data = await api.messagesThread(activeThread)
        setMessages(data)
      }
      alert(t('reportSent'))
    } catch (err) {
      alert(err instanceof Error ? err.message : t('reportError'))
    }
  }

  const handleDeleteConversation = async (interlocutorId: number) => {
    if (!window.confirm(t('deleteConversationConfirm'))) return
    try {
      await api.deleteThread(interlocutorId)
      setThreads((prev) => prev.filter((t) => t.interlocuteur_id !== interlocutorId))
      if (activeThread === interlocutorId) {
        const remaining = threads.filter(t => t.interlocuteur_id !== interlocutorId)
        setActiveThread(remaining.length > 0 ? remaining[0].interlocuteur_id : null)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : t('deleteConversationError'))
    }
  }

  const filteredThreads = searchQuery 
    ? threads.filter(t => 
        `${t.interlocuteur_prenom} ${t.interlocuteur_nom}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : threads

  const getInitials = (prenom: string, nom: string) => {
    return `${(prenom || '?')[0]}${(nom || '?')[0]}`.toUpperCase()
  }

  // Si un thread est sélectionné, afficher la vue de conversation
  if (activeThread !== null) {
    const activeThreadInfo = threads.find((t) => t.interlocuteur_id === activeThread)
    const isSuperadmin = superadmin && activeThread === superadmin.id
    const displayName = activeThreadInfo 
      ? `${activeThreadInfo.interlocuteur_prenom} ${activeThreadInfo.interlocuteur_nom}`
      : isSuperadmin 
        ? `${superadmin.prenom} ${superadmin.nom}`
        : 'Utilisateur'

    return (
      <div className="flex flex-col h-[700px] -m-6 rounded-b-2xl overflow-hidden">
        {/* En-tête de la conversation */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border bg-white/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveThread(null)}
              className="lg:hidden p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-white font-bold text-lg shadow-md">
              {getInitials(
                activeThreadInfo?.interlocuteur_prenom || superadmin?.prenom || 'U',
                activeThreadInfo?.interlocuteur_nom || superadmin?.nom || 'S'
              )}
            </div>
            <div>
              <div className="text-base font-semibold text-foreground flex items-center gap-2">
                {displayName}
                {activeThreadInfo?.non_lus ? (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-brand-cyan rounded-full">
                    {activeThreadInfo.non_lus}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${activeThreadInfo?.non_lus ? 'bg-brand-cyan animate-pulse' : 'bg-green-500'}`}></span>
                  {activeThreadInfo?.non_lus ? 'En ligne' : 'Dernière connexion récente'}
                </span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                <span>{activeThreadInfo?.total_messages || 0} messages</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => activeThreadInfo && handleDeleteConversation(activeThreadInfo.interlocuteur_id)}
              className="p-2 rounded-full hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
              title="Supprimer la conversation"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-muted/20 space-y-3">
          {msgLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-brand-cyan/30 border-t-brand-cyan rounded-full animate-spin"></div>
                <p className="mt-2 text-sm text-muted-foreground">Chargement des messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Aucun message</p>
                <p className="text-xs text-muted-foreground/70">Démarrez la conversation !</p>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.id_expediteur === user?.id
              const senderName = isMe
                ? 'Moi'
                : `${msg.expediteur_prenom} ${msg.expediteur_nom}`
              const isAdmin = !isMe && (msg.expediteur_nom?.toLowerCase().includes('admin') || msg.expediteur_prenom?.toLowerCase().includes('admin'))
              const time = new Date(msg.date_envoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
              const date = new Date(msg.date_envoi).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
              
              // Afficher la date si différente du message précédent
              const prevDate = index > 0 ? new Date(messages[index - 1].date_envoi).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : null
              const showDate = index === 0 || date !== prevDate

              return (
                <div key={msg.id_message}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-muted-foreground bg-white px-3 py-1 rounded-full shadow-sm">
                        {date}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${isMe ? 'order-2' : 'order-2'}`}>
                      {!isMe && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-foreground/80">
                            {senderName}
                          </span>
                          {isAdmin && (
                            <span className="text-[10px] bg-brand-green text-white px-1.5 py-0.5 rounded-full font-semibold">
                              Admin
                            </span>
                          )}
                        </div>
                      )}
                      <div
                        className={`relative rounded-2xl px-4 py-2.5 shadow-sm ${
                          isMe
                            ? 'bg-brand-cyan text-white rounded-br-none'
                            : isAdmin
                              ? 'bg-brand-green-light text-brand-green-dark border border-brand-green/20 rounded-bl-none'
                              : 'bg-white text-foreground border border-border rounded-bl-none'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap break-words">
                          {msg.contenu}
                        </div>
                        <div className={`flex items-center justify-end gap-2 mt-1 ${isMe ? 'text-white/60' : 'text-muted-foreground'}`}>
                          <span className="text-[10px]">{time}</span>
                          {isMe && (
                            <span className="text-[10px]">
                              {msg.est_lu ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                      {!isMe && (
                        <button
                          onClick={() => handleReportMessage(msg.id_message)}
                          className="mt-1 text-[10px] text-muted-foreground/50 hover:text-red-500 transition-colors"
                        >
                          Signaler
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Zone de saisie */}
        <div className="border-t border-border bg-white/95 backdrop-blur-sm px-6 py-4">
          {sendError && (
            <p className="text-sm text-red-600 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {sendError}
            </p>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="Écrire un message..."
              className="flex-1 border border-border rounded-full px-4 py-2.5 text-sm bg-muted/30 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={sending || !reply.trim()}
              className="w-11 h-11 rounded-full bg-brand-cyan hover:bg-brand-cyan-dark text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shrink-0 transition-colors shadow-lg shadow-brand-cyan/20"
            >
              {sending ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Vue liste des conversations
  return (
    <div className="-m-6">
      <div className="flex flex-col lg:flex-row h-[700px]">
        {/* Sidebar des conversations */}
        <div className="w-full lg:w-80 border-r border-border bg-muted/10 flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-cyan" />
              Messages
              {threads.length > 0 && (
                <span className="ml-auto text-xs bg-brand-cyan text-white px-2 py-0.5 rounded-full">
                  {threads.reduce((acc, t) => acc + t.non_lus, 0)} non lus
                </span>
              )}
            </h3>
            <div className="mt-2 relative">
              <input
                type="text"
                placeholder="Rechercher une conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-border rounded-full px-4 py-2 text-sm bg-white outline-none focus:border-brand-cyan pl-9"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-brand-cyan/30 border-t-brand-cyan rounded-full animate-spin"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-4 text-sm text-red-600">{error}</div>
            ) : filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'Aucun résultat trouvé' : 'Aucune conversation'}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {searchQuery ? 'Essayez une autre recherche' : 'Commencez une nouvelle conversation'}
                </p>
                {superadmin && !searchQuery && (
                  <button
                    onClick={() => setActiveThread(superadmin.id)}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-cyan hover:text-brand-cyan-dark"
                  >
                    <Send className="w-4 h-4" />
                    Contacter {superadmin.prenom}
                  </button>
                )}
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isActive = activeThread === thread.interlocuteur_id
                const displayName = `${thread.interlocuteur_prenom} ${thread.interlocuteur_nom}`
                const initials = getInitials(thread.interlocuteur_prenom, thread.interlocuteur_nom)
                const isAdmin = thread.interlocuteur_nom?.toLowerCase().includes('admin') || thread.interlocuteur_prenom?.toLowerCase().includes('admin')
                const lastMessage = thread.dernier_message?.substring(0, 50) || 'Aucun message'
                const time = new Date(thread.date_dernier_message || thread.dernier_message).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

                return (
                  <button
                    key={thread.interlocuteur_id}
                    onClick={() => setActiveThread(thread.interlocuteur_id)}
                    className={`w-full text-left p-4 border-b border-border/50 transition-all hover:bg-muted/50 ${
                      isActive ? 'bg-brand-cyan-light/20 border-l-4 border-l-brand-cyan' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-white font-bold text-sm">
                          {initials}
                        </div>
                        {thread.non_lus > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                            {thread.non_lus}
                          </span>
                        )}
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          thread.non_lus > 0 ? 'bg-brand-cyan animate-pulse' : 'bg-green-500'
                        }`}></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
                            {displayName}
                            {isAdmin && (
                              <span className="text-[10px] bg-brand-green text-white px-1.5 py-0.5 rounded-full font-semibold">
                                Admin
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0">{time}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <span className={`text-xs truncate ${thread.non_lus > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                            {lastMessage}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Zone de conversation vide */}
        <div className="flex-1 hidden lg:flex items-center justify-center bg-muted/5">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h4 className="text-lg font-semibold text-foreground">Messagerie</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Sélectionnez une conversation pour commencer
            </p>
            {superadmin && threads.length === 0 && (
              <button
                onClick={() => setActiveThread(superadmin.id)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-cyan text-white rounded-lg hover:bg-brand-cyan-dark transition-colors text-sm font-medium"
              >
                <Send className="w-4 h-4" />
                Nouvelle conversation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TabSecu() {
  const { t } = useTranslation('compte')
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    if (!form.current || !form.next || form.next !== form.confirm) {
      setMessage(t('passwordValidation'))
      return
    }
    setSaving(true)
    setMessage('')
    try {
      await api.changePassword({ mot_de_passe_actuel: form.current, nouveau_mot_de_passe: form.next })
      setMessage(t('passwordUpdateSuccess'))
      setForm({ current: '', next: '', confirm: '' })
    } catch {
      setMessage(t('passwordUpdateError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="bebas text-2xl">{t('security')}</h2>
      <div className="mt-5 grid md:grid-cols-2 gap-4 max-w-lg">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{t('currentPassword')}</label>
          <input type="password" value={form.current} onChange={(e) => setForm((prev) => ({ ...prev, current: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{t('newPassword')}</label>
          <input type="password" value={form.next} onChange={(e) => setForm((prev) => ({ ...prev, next: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{t('confirmPassword')}</label>
          <input type="password" value={form.confirm} onChange={(e) => setForm((prev) => ({ ...prev, confirm: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
      </div>
      {message ? <p className="mt-4 text-sm text-brand-cyan-dark">{message}</p> : null}
      <Button className="mt-6 bg-brand-cyan text-white hover:bg-brand-cyan-dark" onClick={handleSave} disabled={saving}>
        {saving ? t('updating') : t('update')}
      </Button>
    </div>
  )
}

export default function Compte() {
  const { t } = useTranslation('compte')
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading, logout, updateProfile, isAdmin } = useAuth()
  const isColocataire = user?.poste === 'colocataire'
  const tabs = [
    { id: 'profil', label: t('profile'), icon: User },
    { id: isColocataire ? 'favoris' : 'dossier', label: isColocataire ? t('myFavoritesTab') : t('myAnnouncementsTab'), icon: isColocataire ? Heart : FileText },
    { id: 'notif', label: t('notifications'), icon: Bell },
    { id: 'paiements', label: t('messagesTab'), icon: MessageSquare },
    { id: 'secu', label: t('securityTab'), icon: Lock }
  ]

  const getInitialTab = () => {
    const params = new URLSearchParams(location.search)
    const requestedTab = params.get('tab')
    if (!requestedTab) return 'profil'
    if (requestedTab === 'paiements' || requestedTab === 'messages') return 'paiements'
    if (requestedTab === 'favoris') return 'favoris'
    if (requestedTab === 'dossier') return isColocataire ? 'favoris' : 'dossier'
    if (requestedTab === 'notif') return 'notif'
    if (requestedTab === 'secu') return 'secu'
    if (requestedTab === 'profil') return 'profil'
    return 'profil'
  }
  const [tab, setTab] = useState(getInitialTab)

  useEffect(() => {
    setTab(getInitialTab())
  }, [location.search, isColocataire])

  const initials = (user?.prenom?.[0] || user?.name?.[0] || 'U').toUpperCase()
  const fullName = `${user?.prenom || ''} ${user?.nom || ''}`.trim() || user?.name || t('userProfile')
  const roleLabel = user?.poste === 'proprietaire' ? t('proprietaire') : user?.poste === 'colocataire' ? t('colocataire') : user?.poste || t('member')
  const profileMeta = [user?.profession].filter(Boolean).join(' • ')

  return (
    <SiteLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* En-tête amélioré */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-cyan/10 via-white to-brand-green/10 p-6 md:p-8 border border-border/50">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-white">
                {loading ? '...' : initials}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {loading ? 'Chargement...' : fullName}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">{user?.email}</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-cyan-dark bg-brand-cyan-light px-2.5 py-0.5 rounded-full">
                    {roleLabel}
                  </span>
                  {user?.verification && (
                    <span className="inline-flex items-center gap-1 text-sm text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">
                      <Check className="w-3 h-3" /> Vérifié
                    </span>
                  )}
                </div>
                {profileMeta && (
                  <div className="mt-1 text-sm text-muted-foreground">{profileMeta}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {user && isAdmin && (
                <Button variant="outline" onClick={() => navigate('/admin')} className="gap-2">
                  <Building2 className="w-4 h-4" /> Administration
                </Button>
              )}
              {user ? (
                <Button variant="outline" onClick={() => { logout(); navigate('/auth?mode=signin') }} className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                  Déconnexion
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-brand-cyan-dark">12</div>
            <div className="text-xs text-muted-foreground">Annonces vues</div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-brand-cyan-dark">5</div>
            <div className="text-xs text-muted-foreground">Favoris</div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-brand-cyan-dark">3</div>
            <div className="text-xs text-muted-foreground">Messages</div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-brand-cyan-dark">2</div>
            <div className="text-xs text-muted-foreground">Candidatures</div>
          </div>
        </div>

        {/* Tabs et contenu */}
        <div className="mt-8 grid md:grid-cols-[240px_1fr] gap-6">
          <aside className="space-y-1 bg-white rounded-2xl border border-border p-2">
            {tabs.map((t) => (
              <Link
                key={t.id}
                to={`/compte?tab=${t.id}`}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  tab === t.id 
                    ? 'bg-brand-cyan text-white shadow-lg shadow-brand-cyan/20' 
                    : 'hover:bg-muted text-foreground/70 hover:text-foreground'
                }`}
              >
                <t.icon className={`w-4 h-4 ${tab === t.id ? 'text-white' : ''}`} /> 
                {t.label}
                {tab === t.id && (
                  <span className="ml-auto">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </Link>
            ))}
          </aside>

          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            {tab === 'profil' && <TabProfil user={user} onSave={updateProfile} />}
            {tab === 'dossier' && <TabMesAnnonces />}
            {tab === 'favoris' && <TabMesFavoris />}
            {tab === 'notif' && <TabNotif />}
            {tab === 'paiements' && <TabMessages />}
            {tab === 'secu' && <TabSecu />}
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}