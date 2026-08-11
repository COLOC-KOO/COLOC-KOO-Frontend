import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Edit, Trash, Image as ImageIcon, Eye, Archive } from 'lucide-react'
import { api, ApiAnnonce } from '../../lib/api'

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

export default function TabMesAnnonces() {
  const { t } = useTranslation('compte')
  const [annonces, setAnnonces] = useState<ApiAnnonce[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingAnnonce, setEditingAnnonce] = useState<ApiAnnonce | null>(null)
  const [editForm, setEditForm] = useState({
    titre: '',
    description: '',
    quartier: '',
    type_propriete: 'appartement',
    type_bail: 'collectif',
    surface_totale: '',
    total_colocataires: '',
    prix_loyer: '',
    prix_charges: '',
    est_meuble: 'Oui',
    date_disponibilite: '',
    internet: '',
  })
  const [saving, setSaving] = useState(false)
  const [editablePhotos, setEditablePhotos] = useState<string[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [archivingId, setArchivingId] = useState<number | string | null>(null)
  const [modalStep, setModalStep] = useState<number>(1)

  useEffect(() => {
    api.annonces({ mine: 'true', statut: 'all' })
      .then((data) => setAnnonces(data))
      .catch((err) => setError(err instanceof Error ? err.message : t('updateError')))
      .finally(() => setLoading(false))
  }, [t])

  useEffect(() => {
    if (!editingAnnonce) {
      setEditForm({
        titre: '',
        description: '',
        quartier: '',
        type_propriete: 'appartement',
        type_bail: 'collectif',
        surface_totale: '',
        total_colocataires: '',
        prix_loyer: '',
        prix_charges: '',
        est_meuble: 'Oui',
        date_disponibilite: '',
        internet: '',
      })
      return
    }

    setEditForm({
      titre: editingAnnonce.titre,
      description: editingAnnonce.description || '',
      quartier: editingAnnonce.quartier || '',
      type_propriete: editingAnnonce.type_propriete || 'appartement',
      type_bail: editingAnnonce.type_bail || 'collectif',
      surface_totale: editingAnnonce.surface_totale != null ? String(editingAnnonce.surface_totale) : '',
      total_colocataires: editingAnnonce.total_colocataires != null ? String(editingAnnonce.total_colocataires) : '',
      prix_loyer: editingAnnonce.chambre?.prix_loyer != null ? String(editingAnnonce.chambre.prix_loyer) : '',
      prix_charges: editingAnnonce.chambre?.prix_charges != null ? String(editingAnnonce.chambre.prix_charges) : '',
      est_meuble: editingAnnonce.chambre?.est_meuble != null ? String(editingAnnonce.chambre.est_meuble) : 'Oui',
      date_disponibilite: editingAnnonce.chambre?.date_disponibilite || '',
      internet: editingAnnonce.internet || '',
    })
    setEditablePhotos(normalizePhotos(editingAnnonce.photos))
  }, [editingAnnonce])

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

  const handleArchiveAnnonce = async (annonce: ApiAnnonce) => {
    setArchivingId(annonce.id)
    try {
      await api.archiveAnnonce?.(annonce.id)
      setAnnonces((current) =>
        current.map((a) => (a.id === annonce.id ? { ...a, statut: a.statut === 'archived' ? 'active' : 'archived' } : a))
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : t('updateError'))
    } finally {
      setArchivingId(null)
    }
  }

  const openEditModal = (annonce: ApiAnnonce) => {
    setEditingAnnonce(annonce)
    setModalStep(1)
  }

  const closeEditModal = () => {
    setEditingAnnonce(null)
    setModalStep(1)
  }

  const previousStep = () => setModalStep((step) => Math.max(1, step - 1))
  const nextStep = () => setModalStep((step) => Math.min(2, step + 1))

  const handleEditFormChange = (field: keyof typeof editForm, value: string) => {
    setEditForm((current) => ({ ...current, [field]: value }))
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith('image/'))
    event.target.value = ''
    if (!files.length) return

    setUploadingPhotos(true)
    try {
      const formData = new FormData()
      files.forEach((file) => formData.append('photos', file))
      const { photos } = await api.uploadAnnoncePhotos(formData)
      setEditablePhotos((current) => [...current, ...photos])
    } catch (err) {
      alert(err instanceof Error ? err.message : t('updateError'))
    } finally {
      setUploadingPhotos(false)
    }
  }

  const removePhoto = (index: number) => {
    setEditablePhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))
  }

  const handleSaveEdit = async () => {
    if (!editingAnnonce) return
    setSaving(true)
    try {
      const payload = {
        titre: editForm.titre,
        description: editForm.description,
        quartier: editForm.quartier,
        type_propriete: editForm.type_propriete,
        type_bail: editForm.type_bail,
        surface_totale: editForm.surface_totale ? Number(editForm.surface_totale) : null,
        total_colocataires: editForm.total_colocataires ? Number(editForm.total_colocataires) : null,
        internet: editForm.internet || null,
        photos: editablePhotos,
        chambre: {
          prix_loyer: editForm.prix_loyer ? Number(editForm.prix_loyer) : null,
          prix_charges: editForm.prix_charges ? Number(editForm.prix_charges) : null,
          date_disponibilite: editForm.date_disponibilite || null,
          est_meuble: editForm.est_meuble || null,
        },
      }
      const updated = await api.updateAnnonce(editingAnnonce.id, payload)
      handleUpdateAnnonce(updated)
      closeEditModal()
    } catch (err) {
      alert(err instanceof Error ? err.message : t('updateError'))
    } finally {
      setSaving(false)
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
            const isArchived = annonce.statut === 'archived'
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
                        <Link to={`/annonces/${annonce.id}`} className="text-lg font-semibold text-foreground hover:text-brand-cyan-dark">
                          {annonce.titre}
                        </Link>
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

                    {/* Actions : Voir / Modifier / Archiver / Supprimer */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        to={`/annonces/${annonce.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold border border-border rounded-lg px-3 py-1.5 text-foreground/80 hover:bg-muted transition-colors"
                      >
                        <Eye className="w-4 h-4" /> Voir
                      </Link>
                      <button
                        onClick={() => openEditModal(annonce)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold border border-border rounded-lg px-3 py-1.5 text-foreground/80 hover:bg-muted transition-colors"
                      >
                        <Edit className="w-4 h-4" /> Modifier
                      </button>
                      <button
                        onClick={() => handleArchiveAnnonce(annonce)}
                        disabled={archivingId === annonce.id}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold border border-border rounded-lg px-3 py-1.5 text-foreground/80 hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        <Archive className="w-4 h-4" /> {isArchived ? 'Désarchiver' : 'Archiver'}
                      </button>
                      <button
                        onClick={() => handleDeleteAnnonce(annonce)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold border border-red-600 text-red-600 rounded-lg px-3 py-1.5 hover:bg-red-600 hover:text-white transition-colors"
                      >
                        <Trash className="w-4 h-4" /> Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editingAnnonce && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex w-full max-w-md max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-border p-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={previousStep}
                  className="hidden"
                >
                  Précédente
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="hidden"
                >
                  Suivante
                </button>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Modifier l'annonce</h3>
                  <p className="text-sm text-muted-foreground">Mets à jour les informations et enregistre.</p>
                </div>
              </div>
              <div>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground/80 hover:bg-muted"
                >
                  Fermer
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${modalStep===1? 'bg-brand-cyan text-white':'bg-slate-100 text-slate-700'}`}>1 — Général</div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${modalStep===2? 'bg-brand-cyan text-white':'bg-slate-100 text-slate-700'}`}>2 — Détails</div>
              </div>
              <div>
                <h4 className="text-base font-semibold text-foreground">Photos de l'annonce</h4>
                <div className="mt-3 flex flex-wrap gap-3">
                  {editablePhotos.map((photo, index) => (
                    <div key={`${photo}-${index}`} className="relative">
                      <img src={photo} alt={`Photo ${index + 1}`} className="h-16 w-24 rounded-2xl object-cover border border-border" />
                      <button type="button" onClick={() => removePhoto(index)} className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white" aria-label="Supprimer cette photo">×</button>
                    </div>
                  ))}
                  {editablePhotos.length === 0 && <img src={FALLBACK_IMG} alt="Aucune photo" className="h-16 w-24 rounded-2xl object-cover border border-border" />}
                  <label className="flex h-16 w-24 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-brand-cyan text-center text-xs font-semibold text-brand-cyan hover:bg-brand-cyan/5">
                    {uploadingPhotos ? 'Ajout...' : '+ Ajouter'}
                    <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" disabled={uploadingPhotos} />
                  </label>
                </div>
              </div>

              {modalStep === 1 ? (
                <>
                  <label className="space-y-2 text-sm text-foreground">
                    <span>Titre</span>
                    <input
                      type="text"
                      value={editForm.titre}
                      onChange={(event) => handleEditFormChange('titre', event.target.value)}
                      className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
                    />
                  </label>

                  <label className="space-y-2 text-sm text-foreground">
                    <span>Description</span>
                    <textarea
                      value={editForm.description}
                      onChange={(event) => handleEditFormChange('description', event.target.value)}
                      rows={3}
                      className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-foreground">
                      <span>Quartier</span>
                      <input
                        type="text"
                        value={editForm.quartier}
                        onChange={(event) => handleEditFormChange('quartier', event.target.value)}
                        className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-foreground">
                      <span>Surface totale (m²)</span>
                      <input
                        type="number"
                        value={editForm.surface_totale}
                        onChange={(event) => handleEditFormChange('surface_totale', event.target.value)}
                        className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-foreground">
                      <span>Prix loyer (Ar)</span>
                      <input
                        type="number"
                        value={editForm.prix_loyer}
                        onChange={(event) => handleEditFormChange('prix_loyer', event.target.value)}
                        className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-foreground">
                      <span>Charges (Ar)</span>
                      <input
                        type="number"
                        value={editForm.prix_charges}
                        onChange={(event) => handleEditFormChange('prix_charges', event.target.value)}
                        className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
                      />
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-foreground">
                      <span>Nombre de colocataires</span>
                      <input
                        type="number"
                        value={editForm.total_colocataires}
                        onChange={(event) => handleEditFormChange('total_colocataires', event.target.value)}
                        className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-foreground">
                      <span>Type de bail</span>
                      <select
                        value={editForm.type_bail}
                        onChange={(event) => handleEditFormChange('type_bail', event.target.value)}
                        className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
                      >
                        <option value="collectif">Collectif</option>
                        <option value="individuel">Individuel</option>
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-foreground">
                      <span>Meublé</span>
                      <select
                        value={editForm.est_meuble}
                        onChange={(event) => handleEditFormChange('est_meuble', event.target.value)}
                        className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
                      >
                        <option value="Oui">Oui</option>
                        <option value="Non">Non</option>
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-foreground">
                      <span>Date disponibilité</span>
                      <input
                        type="date"
                        value={editForm.date_disponibilite}
                        onChange={(event) => handleEditFormChange('date_disponibilite', event.target.value)}
                        className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-foreground">
                      <span>Type de propriété</span>
                      <select
                        value={editForm.type_propriete}
                        onChange={(event) => handleEditFormChange('type_propriete', event.target.value)}
                        className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
                      >
                        <option value="appartement">Appartement</option>
                        <option value="maison">Maison</option>
                        <option value="autre">Autre</option>
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-foreground">
                      <span>Internet</span>
                      <input
                        type="text"
                        value={editForm.internet}
                        onChange={(event) => handleEditFormChange('internet', event.target.value)}
                        className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
                      />
                    </label>
                  </div>
                </>
              )}

            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
              <div className="flex items-center gap-3">
                {modalStep > 1 && (
                  <button
                    type="button"
                    onClick={previousStep}
                    className="rounded-2xl border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
                  >
                    Précédent
                  </button>
                )}
                {modalStep < 2 && (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="rounded-2xl bg-white/5 border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-white/10"
                  >
                    Suivant
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                  Annuler
                </button>
                {modalStep === 2 ? (
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="rounded-2xl bg-brand-cyan px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
