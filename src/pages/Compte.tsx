import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, Check, FileText, Lock, MessageSquare, Send, Upload, User, Edit, Trash, AlertTriangle, X, Camera, Home, MapPin, DollarSign, Ruler, Calendar, Bed, Building2, Users, Image as ImageIcon, Heart } from 'lucide-react'
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
  const [form, setForm] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    dateNaissance: normalizeDateInputValue(user?.dateNaissance),
    profession: user?.profession || '',
    bio: user?.bio || '',
    languePreferee: user?.languePreferee || '',
    profilePicture: user?.profilePicture || '',
    villeActuelle: typeof user?.villeActuelle === 'string' ? user.villeActuelle : (user?.villeActuelle ? String(user.villeActuelle) : ''),
    villeOrigine: typeof user?.villeOrigine === 'string' ? user.villeOrigine : (user?.villeOrigine ? String(user.villeOrigine) : ''),
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
      dateNaissance: normalizeDateInputValue(user?.dateNaissance),
      profession: user?.profession || '',
      bio: user?.bio || '',
      languePreferee: user?.languePreferee || '',
      profilePicture: user?.profilePicture || '',
      villeActuelle: typeof user?.villeActuelle === 'string' ? user.villeActuelle : (user?.villeActuelle ? String(user.villeActuelle) : ''),
      villeOrigine: typeof user?.villeOrigine === 'string' ? user.villeOrigine : (user?.villeOrigine ? String(user.villeOrigine) : ''),
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
        bio: form.bio || null,
        date_naissance: birthDate,
        age,
        profession: form.profession || null,
        langue_preferee: form.languePreferee ? Number(form.languePreferee) : null,
        profile_picture: profilePicture,
        ville_actuelle: form.villeActuelle || null,
        ville_origine: form.villeOrigine || null,
      })
      setSelectedProfileFile(null)
      setMessage('Profil mis à jour avec succès.')
    } catch {
      setMessage('Impossible de mettre à jour le profil.')
    } finally {
      setSaving(false)
      setUploadingProfile(false)
    }
  }

  const initials = `${(form.prenom || user?.prenom || '').charAt(0)}${(form.nom || user?.nom || '').charAt(0)}`.toUpperCase() || 'U'

  return (
    <div>
      <h2 className="bebas text-2xl">Informations personnelles</h2>
      <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-cyan to-brand-green text-lg font-semibold text-white">
            {form.profilePicture ? <img src={form.profilePicture} alt="Profil" className="h-full w-full rounded-full object-cover" /> : initials}
          </div>
          <div>
            <div className="font-semibold text-foreground">{[form.prenom, form.nom].filter(Boolean).join(' ') || 'Profil utilisateur'}</div>
            <div className="text-sm text-muted-foreground">
              {user?.verification ? 'Compte vérifié' : 'Compte non vérifié'} • {user?.statut || 'active'}
            </div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {user?.createdAt ? `Membre depuis ${new Date(user.createdAt).toLocaleDateString('fr-FR')}` : 'Profil en cours de mise à jour'}
        </div>
      </div>
      <div className="mt-5 grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Prénom</label>
          <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.prenom} onChange={(e) => setForm((prev) => ({ ...prev, prenom: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Nom</label>
          <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.nom} onChange={(e) => setForm((prev) => ({ ...prev, nom: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Email</label>
          <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Téléphone</label>
          <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.telephone} onChange={(e) => setForm((prev) => ({ ...prev, telephone: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Date de naissance</label>
          <input type="date" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.dateNaissance} onChange={(e) => setForm((prev) => ({ ...prev, dateNaissance: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Profession</label>
          <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.profession} onChange={(e) => setForm((prev) => ({ ...prev, profession: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Langue préférée</label>
          <select
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white"
            value={form.languePreferee ?? ''}
            onChange={(e) => setForm((prev) => ({ ...prev, languePreferee: e.target.value }))}
          >
            <option value="">-- Choisir une langue --</option>
            {langues.map((langue) => (
              <option key={langue.id_langue} value={langue.id_langue}>
                {langue.nom_langue}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Photo de profil</label>
          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border bg-muted/30 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-cyan to-brand-green text-lg font-semibold text-white">
                {form.profilePicture ? <img src={form.profilePicture} alt="Profil" className="h-full w-full object-cover" /> : <span>{initials}</span>}
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedProfileFile ? `Fichier prêt à être envoyé : ${selectedProfileFile.name}` : 'Choisissez une image de profil à télécharger.'}
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
                <Upload className="mr-2 h-4 w-4" /> Choisir une image
              </Button>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Ville actuelle</label>
          <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.villeActuelle} onChange={(e) => setForm((prev) => ({ ...prev, villeActuelle: e.target.value }))} placeholder="Antananarivo" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Ville d’origine</label>
          <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.villeOrigine} onChange={(e) => setForm((prev) => ({ ...prev, villeOrigine: e.target.value }))} placeholder="Fianarantsoa" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Biographie</label>
          <textarea rows={4} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.bio} onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))} />
        </div>
      </div>
      {message ? <p className="mt-4 text-sm text-brand-cyan-dark">{message}</p> : null}
      <Button className="mt-6 bg-brand-cyan text-white hover:bg-brand-cyan-dark" onClick={handleSave} disabled={saving || uploadingProfile}>
        {saving || uploadingProfile ? 'Enregistrement...' : 'Enregistrer'}
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
    // Créer des aperçus pour les nouveaux fichiers
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setPhotoPreviews(prev => [...prev, ...newPreviews])
  }

  const removePhoto = (index: number) => {
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
    // Si la photo est un nouveau fichier, le retirer aussi
    if (editFiles.length > 0) {
      setEditFiles(prev => prev.filter((_, i) => i !== index - (prev.length - editFiles.length)))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!annonce) return

    const prix = Number(form.prix_loyer)
    if (!form.titre.trim() || Number.isNaN(prix) || prix < 0) {
      setEditMessage('Le titre et un prix valide sont requis.')
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
      setEditMessage(err instanceof Error ? err.message : 'Impossible de modifier l\'annonce')
    } finally {
      setEditSaving(false)
    }
  }

  if (!annonce) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-border/50 px-8 py-5 flex items-start justify-between gap-3 rounded-t-3xl">
          <div>
            <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Edit className="w-6 h-6 text-brand-cyan" />
              Modifier l'annonce
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
          {/* Photos */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand-cyan" />
                Photos
              </div>
            </label>
            <div className="rounded-2xl border-2 border-dashed border-border hover:border-brand-cyan/50 transition-colors p-4 bg-muted/30">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                {photoPreviews.map((photo, index) => (
                  <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-border">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
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
                  <span className="text-xs text-muted-foreground">Ajouter</span>
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
                  ? `${editFiles.length} nouveau(x) fichier(s) sélectionné(s)` 
                  : 'Cliquez sur une case pour ajouter des photos'}
              </p>
            </div>
          </div>

          {/* Grid des champs */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* Titre */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-brand-cyan" />
                  Titre de l'annonce
                </div>
              </label>
              <input
                required
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all outline-none"
                placeholder="Ex: Superbe appartement en centre-ville"
                value={form.titre}
                onChange={(e) => setForm((prev) => ({ ...prev, titre: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all outline-none"
                placeholder="Décrivez votre logement en détail..."
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Prix */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-brand-cyan" />
                  Prix (Ar)
                </div>
              </label>
              <input
                required
                type="number"
                min="0"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all outline-none"
                placeholder="500 000"
                value={form.prix_loyer}
                onChange={(e) => setForm((prev) => ({ ...prev, prix_loyer: e.target.value }))}
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-brand-cyan" />
                  Type de bien
                </div>
              </label>
              <select
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all outline-none"
                value={form.type_propriete}
                onChange={(e) => setForm((prev) => ({ ...prev, type_propriete: e.target.value }))}
              >
                <option value="appartement">Appartement</option>
                <option value="maison">Maison</option>
                <option value="studio">Studio</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            {/* Nombre de colocataires */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-cyan" />
                  Nombre de colocataires
                </div>
              </label>
              <input
                type="number"
                min="1"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all outline-none"
                placeholder="3"
                value={form.total_colocataires}
                onChange={(e) => setForm((prev) => ({ ...prev, total_colocataires: e.target.value }))}
              />
            </div>

            {/* Quartier */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-cyan" />
                  Quartier
                </div>
              </label>
              <input
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all outline-none"
                placeholder="Analakely, Isoraka..."
                value={form.quartier}
                onChange={(e) => setForm((prev) => ({ ...prev, quartier: e.target.value }))}
              />
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Adresse exacte
              </label>
              <input
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all outline-none"
                placeholder="12 Rue de la Liberté"
                value={form.adresse_exacte}
                onChange={(e) => setForm((prev) => ({ ...prev, adresse_exacte: e.target.value }))}
              />
            </div>

            {/* Surface */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-brand-cyan" />
                  Surface (m²)
                </div>
              </label>
              <input
                type="number"
                min="0"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all outline-none"
                placeholder="45"
                value={form.surface}
                onChange={(e) => setForm((prev) => ({ ...prev, surface: e.target.value }))}
              />
            </div>

            {/* Date disponibilité */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-cyan" />
                  Disponible à partir du
                </div>
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all outline-none"
                value={form.date_disponibilite}
                onChange={(e) => setForm((prev) => ({ ...prev, date_disponibilite: e.target.value }))}
              />
            </div>

            {/* Meublé */}
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
                  Logement meublé
                </div>
              </label>
            </div>
          </div>

          {/* Message d'erreur */}
          {editMessage && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-center gap-2 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {editMessage}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end border-t border-border/50 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={editSaving}
              className="rounded-xl bg-brand-cyan hover:bg-brand-cyan-dark px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {editSaving ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Enregistrer les modifications
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
  const [annonces, setAnnonces] = useState<ApiAnnonce[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingAnnonce, setEditingAnnonce] = useState<ApiAnnonce | null>(null)

  useEffect(() => {
    api.annonces({ mine: 'true', statut: 'all' })
      .then((data) => setAnnonces(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Impossible de charger vos annonces.'))
      .finally(() => setLoading(false))
  }, [])

  const handleUpdateAnnonce = (updated: ApiAnnonce) => {
    setAnnonces((current) => current.map((a) => (a.id === updated.id ? updated : a)))
  }

  const handleDeleteAnnonce = async (annonce: ApiAnnonce) => {
    if (!window.confirm('Supprimer cette annonce ? Cette action est irréversible.')) return
    try {
      await api.deleteAnnonce(annonce.id)
      setAnnonces((current) => current.filter((a) => a.id !== annonce.id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Impossible de supprimer l\'annonce')
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
    pending: 'En attente',
    active: 'Active',
    rejected: 'Rejetée',
    archived: 'Archivée',
    expired: 'Expirée',
  }

  return (
    <div>
      <h2 className="bebas text-2xl">Mes annonces</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Toutes les annonces que tu as déposées, y compris celles en attente de validation.
      </p>

      {loading ? (
        <p className="mt-5 text-sm text-muted-foreground">Chargement...</p>
      ) : error ? (
        <p className="mt-5 text-sm text-red-600">{error}</p>
      ) : annonces.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">Aucune annonce trouvée. Dépose une annonce pour la voir ici.</p>
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
                          <button title="Modifier" onClick={() => setEditingAnnonce(annonce)} className="p-1.5 hover:bg-muted rounded text-muted-foreground">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button title="Supprimer" onClick={() => handleDeleteAnnonce(annonce)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
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
                      <div>Prix: {annonce.chambre?.prix_loyer ? `${annonce.chambre.prix_loyer.toLocaleString('fr-FR')} Ar` : 'Indisponible'}</div>
                      <div>Type: {annonce.type_propriete}</div>
                      <div>Créée le: {new Date(annonce.date_creation).toLocaleDateString('fr-FR')}</div>
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

      {/* Modal d'édition améliorée */}
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
        setError(err instanceof Error ? err.message : 'Impossible de charger vos favoris.')
      })
      .finally(() => setLoading(false))
  }, [])

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
      showToast('Suppression avec succès')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de retirer ce favori.')
    }
  }

  return (
    <div className="relative">
      {toastMessage ? (
        <div className="fixed top-5 right-5 z-50 max-w-sm rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground shadow-2xl">
          {toastMessage}
        </div>
      ) : null}

      <h2 className="bebas text-2xl">Mes favoris</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Retrouvez ici les annonces que vous avez enregistrées comme favorites.
      </p>

      {loading ? (
        <div className="mt-5 rounded-3xl border border-border bg-white p-6 text-sm text-muted-foreground">
          Chargement de vos favoris...
        </div>
      ) : error ? (
        <div className="mt-5 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : favoris.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-dashed border-border bg-white p-6 text-sm text-muted-foreground">
          Aucun favori pour l’instant. Ajoutez des annonces depuis la liste pour les retrouver ici.
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
                          <button title="Supprimer des favoris" onClick={() => removeFavorite(annonce.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {annonce.quartier ? `${annonce.quartier}, ` : ''}{annonce.ville}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm text-muted-foreground">
                      <div>Prix: {annonce.chambre?.prix_loyer ? `${annonce.chambre.prix_loyer.toLocaleString('fr-FR')} Ar` : 'Indisponible'}</div>
                      <div>Type: {annonce.type_propriete}</div>
                      <div>Ajouté aux favoris</div>
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
  const navigate = useNavigate()
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    annonces: true,
    candidatures: true,
    newsletter: false,
    offres: false,
  })
  const [notifications, setNotifications] = useState<Array<{ id_notification: number; titre: string; texte: string; est_lue: number; type_notification: string; date_creation: string; lien: string | null }>>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.notifications()
      .then((data) => setNotifications(data))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [])

  const handleMarkOne = async (id: number) => {
    try {
      await api.markNotificationRead(id)
      await api.deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id_notification !== id))
    } catch {
      // ignore
    }
  }

  const handleDeleteNotification = async (id: number) => {
    if (!window.confirm('Supprimer cette notification ?')) return
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

  return (
    <div>
      <h2 className="bebas text-2xl">Notifications</h2>
      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune notification pour le moment.</p>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id_notification}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (item.lien) {
                  navigate(item.lien)
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  if (item.lien) {
                    navigate(item.lien)
                  }
                }
              }}
              className="w-full text-left"
            >
              <div className="flex items-start justify-between gap-3 rounded-xl border border-border p-4 hover:border-brand-cyan hover:bg-brand-cyan-light/10 transition-colors cursor-pointer">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{item.titre}</div>
                  <div className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{item.texte}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-2.5 py-1 font-medium">
                      {item.type_notification === 'message' ? 'Message de contact' : 'Notification'}
                    </span>
                    <span>{new Date(item.date_creation).toLocaleString('fr-FR')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleMarkOne(item.id_notification)
                    }}
                    title="Marquer comme lu et supprimer"
                    className="p-1.5 hover:bg-white/5 rounded text-sm text-muted-foreground"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleDeleteNotification(item.id_notification)
                    }}
                    title="Supprimer"
                    className="p-1.5 hover:bg-white/5 rounded text-red-500"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.est_lue ? 'bg-muted text-muted-foreground' : 'bg-brand-cyan-light text-brand-cyan-dark'}`}>
                    {item.est_lue ? 'Lue' : 'Nouvelle'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <Button className="mt-6 bg-brand-cyan text-white hover:bg-brand-cyan-dark" onClick={handleReadAll} disabled={saving}>
        {saving ? 'Mise à jour…' : 'Tout marquer comme lu'}
      </Button>
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
  const { user } = useAuth()
  const [superadmin, setSuperadmin] = useState<SuperadminUser | null>(null)
  const [threads, setThreads] = useState<Array<{
    interlocuteur_id: number
    interlocuteur_nom: string
    interlocuteur_prenom: string
    dernier_message: string
    total_messages: number
    non_lus: number
  }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeThread, setActiveThread] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [msgLoading, setMsgLoading] = useState(false)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    api.messagesThreads()
      .then((data) => setThreads(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Impossible de charger les messages.'))
      .finally(() => setLoading(false))

    api.superadmin()
      .then((data) => setSuperadmin(data))
      .catch(() => setSuperadmin(null))
  }, [])

  useEffect(() => {
    if (activeThread === null) return
    setMsgLoading(true)
    setMessages([])
    api.messagesThread(activeThread)
      .then((data) => setMessages(data))
      .catch(() => setMessages([]))
      .finally(() => setMsgLoading(false))
  }, [activeThread])

  const openSuperadminThread = () => {
    if (superadmin) {
      setActiveThread(superadmin.id)
    }
  }

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
      setSendError(err instanceof Error ? err.message : "Impossible d'envoyer le message.")
    } finally {
      setSending(false)
    }
  }

  const handleReportMessage = async (id_message: number) => {
    const raison = window.prompt('Raison du signalement (optionnel)')
    try {
      await api.reportMessage(id_message, { raison: raison || 'Signalement utilisateur' })
      if (activeThread !== null) {
        const data = await api.messagesThread(activeThread)
        setMessages(data)
      }
      alert('Signalement envoyé.')
    } catch (err) {
      alert(err instanceof Error ? err.message : "Impossible d'envoyer le signalement.")
    }
  }

  const handleDeleteConversation = async (interlocutorId: number) => {
    if (!window.confirm('Supprimer cette conversation ?')) return
    try {
      await api.deleteThread(interlocutorId)
      setThreads((prev) => prev.filter((t) => t.interlocuteur_id !== interlocutorId))
      if (activeThread === interlocutorId) setActiveThread(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Impossible de supprimer la conversation.")
    }
  }

  const activeThreadInfo = threads.find((t) => t.interlocuteur_id === activeThread)
  const currentThreadName = activeThreadInfo
    ? `${activeThreadInfo.interlocuteur_prenom} ${activeThreadInfo.interlocuteur_nom}`
    : superadmin && activeThread === superadmin.id
      ? `${superadmin.prenom} ${superadmin.nom}`
      : 'Conversation'
  
  if (activeThread !== null) {
    return (
      <div className="flex flex-col h-[600px]">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <button
            onClick={() => setActiveThread(null)}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-white font-bold text-sm">
            {((activeThreadInfo?.interlocuteur_prenom?.[0] || activeThreadInfo?.interlocuteur_nom?.[0]) || (superadmin && activeThread === superadmin.id ? superadmin.prenom?.[0] || superadmin.nom?.[0] : '?'))?.toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold">
              {currentThreadName}
            </div>
            <div className="text-xs text-muted-foreground">
              {activeThreadInfo ? `${activeThreadInfo.total_messages} message${activeThreadInfo.total_messages > 1 ? 's' : ''}` : 'Conversation avec le superadmin'}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {msgLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Chargement des messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucun message dans cette conversation.</p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.id_expediteur === user?.id
              const senderName = isMe
                ? 'Vous'
                : `${msg.expediteur_prenom} ${msg.expediteur_nom}`
              const isAdmin = !isMe && (msg.expediteur_nom?.toLowerCase().includes('admin') || msg.expediteur_prenom?.toLowerCase().includes('admin') || msg.expediteur_nom?.toLowerCase().includes('super'))
              return (
                <div key={msg.id_message} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isMe
                      ? 'bg-brand-cyan text-white rounded-br-sm'
                      : isAdmin
                        ? 'bg-brand-green-light text-brand-green-dark border border-brand-green/30 rounded-bl-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                  }`}>
                    {!isMe && (
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold mb-0.5 opacity-80">
                          {senderName}
                          {isAdmin && <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] bg-brand-green text-white px-1.5 py-0.5 rounded-full">Admin</span>}
                        </div>
                          <div className="ml-3">
                            <button title="Signaler" onClick={() => handleReportMessage(msg.id_message)} className="p-1.5 hover:bg-white/5 rounded text-muted-foreground">
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          </div>
                      </div>
                    )}
                    {msg.sujet && (
                      <div className="text-xs font-medium mb-1 opacity-70 italic">Re: {msg.sujet}</div>
                    )}
                    <div className="text-sm whitespace-pre-wrap break-words">{msg.contenu}</div>
                    <div className={`text-[10px] mt-1 ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {new Date(msg.date_envoi).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {sendError && <p className="text-sm text-red-600 mb-2">{sendError}</p>}

        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <input
            type="text"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Écris ton message..."
            className="flex-1 border border-border rounded-full px-4 py-2.5 text-sm bg-white outline-none focus:border-brand-cyan"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={sending || !reply.trim()}
            className="w-10 h-10 rounded-full bg-brand-cyan hover:bg-brand-cyan-dark text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="bebas text-2xl">Messages</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Retrouve tes conversations avec l'administration et le support.
      </p>

      <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Démarre une conversation avec le superadmin ou choisis un fil existant.</p>
        </div>
        <button
          type="button"
          onClick={openSuperadminThread}
          disabled={!superadmin}
          className="inline-flex items-center justify-center rounded-full bg-brand-cyan px-4 py-2 text-sm font-semibold text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {superadmin ? `Contacter ${superadmin.prenom}` : 'Superadmin indisponible'}
        </button>
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-muted-foreground">Chargement...</p>
      ) : error ? (
        <p className="mt-5 text-sm text-red-600">{error}</p>
      ) : threads.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-border bg-white p-5">
          <p className="text-sm text-muted-foreground">Tu n'as pas encore de conversation. Clique sur "Contacter {superadmin ? superadmin.prenom : 'le superadmin'}" pour démarrer.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {threads.map((thread) => {
            const isAdmin = thread.interlocuteur_nom?.toLowerCase().includes('admin') || thread.interlocuteur_prenom?.toLowerCase().includes('admin') || thread.interlocuteur_nom?.toLowerCase().includes('super')
            return (
              <div
                key={thread.interlocuteur_id}
                onClick={() => setActiveThread(thread.interlocuteur_id)}
                role="button"
                className="w-full text-left rounded-2xl border border-border p-4 bg-white shadow-sm hover:shadow-md hover:border-brand-cyan/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {(thread.interlocuteur_prenom?.[0] || thread.interlocuteur_nom?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">
                        {thread.interlocuteur_prenom} {thread.interlocuteur_nom}
                      </span>
                      {isAdmin && (
                        <span className="text-[10px] bg-brand-green text-white px-1.5 py-0.5 rounded-full font-semibold">Admin</span>
                      )}
                      {thread.non_lus > 0 && (
                        <span className="text-[10px] bg-brand-cyan text-white px-1.5 py-0.5 rounded-full font-semibold">
                          {thread.non_lus} non lu{thread.non_lus > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {thread.total_messages} message{thread.total_messages > 1 ? 's' : ''} · Dernière activité le {new Date(thread.dernier_message).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteConversation(thread.interlocuteur_id) }}
                      title="Supprimer la conversation"
                      className="p-1.5 hover:bg-white/5 rounded text-red-500"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
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

function TabSecu() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    if (!form.current || !form.next || form.next !== form.confirm) {
      setMessage('Vérifie le mot de passe actuel et la confirmation.')
      return
    }
    setSaving(true)
    setMessage('')
    try {
      await api.changePassword({ mot_de_passe_actuel: form.current, nouveau_mot_de_passe: form.next })
      setMessage('Mot de passe mis à jour avec succès.')
      setForm({ current: '', next: '', confirm: '' })
    } catch {
      setMessage('Impossible de changer le mot de passe.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="bebas text-2xl">Sécurité</h2>
      <div className="mt-5 grid md:grid-cols-2 gap-4 max-w-lg">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Mot de passe actuel</label>
          <input type="password" value={form.current} onChange={(e) => setForm((prev) => ({ ...prev, current: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Nouveau mot de passe</label>
          <input type="password" value={form.next} onChange={(e) => setForm((prev) => ({ ...prev, next: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Confirmer</label>
          <input type="password" value={form.confirm} onChange={(e) => setForm((prev) => ({ ...prev, confirm: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
      </div>
      {message ? <p className="mt-4 text-sm text-brand-cyan-dark">{message}</p> : null}
      <Button className="mt-6 bg-brand-cyan text-white hover:bg-brand-cyan-dark" onClick={handleSave} disabled={saving}>
        {saving ? 'Mise à jour…' : 'Mettre à jour'}
      </Button>
    </div>
  )
}

export default function Compte() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading, logout, updateProfile, isAdmin } = useAuth()
  const isColocataire = user?.poste === 'colocataire'
  const tabs = [
    { id: 'profil', label: 'Profil', icon: User },
    { id: isColocataire ? 'favoris' : 'dossier', label: isColocataire ? 'Mes favoris' : 'Mes annonces', icon: isColocataire ? Heart : FileText },
    { id: 'notif', label: 'Notifications', icon: Bell },
    { id: 'paiements', label: 'Messages', icon: MessageSquare },
    { id: 'secu', label: 'Sécurité', icon: Lock }
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
  const fullName = `${user?.prenom || ''} ${user?.nom || ''}`.trim() || user?.name || 'Utilisateur'
  const roleLabel = user?.poste === 'proprietaire' ? 'Propriétaire' : user?.poste === 'colocataire' ? 'Locataire' : user?.poste || 'Membre'
  const profileMeta = [user?.profession].filter(Boolean).join(' • ')

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-white font-bold text-xl">
              {initials}
            </div>
            <div>
              <h1 className="bebas text-3xl">{loading ? 'Chargement...' : fullName}</h1>
              <div className="text-sm text-muted-foreground">
                {user ? `${user.email} · ${roleLabel}` : 'Connecte-toi pour voir ton profil'}
                {profileMeta ? <div className="mt-1">{profileMeta}</div> : null}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && isAdmin ? (
              <Button variant="outline" onClick={() => navigate('/admin')}>
                Aller au back office
              </Button>
            ) : null}
            {user ? (
              <Button variant="outline" onClick={() => { logout(); navigate('/auth?mode=signin') }}>
                Se déconnecter
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-[220px_1fr] gap-6">
          <aside className="space-y-1">
            {tabs.map((t) => (
            <Link
              key={t.id}
              to={`/compte?tab=${t.id}`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                tab === t.id ? 'bg-brand-cyan-light text-brand-cyan-dark' : 'hover:bg-muted text-foreground/70'
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </Link>
          ))}
          </aside>

          <div className="bg-card border border-border rounded-2xl p-6">
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
