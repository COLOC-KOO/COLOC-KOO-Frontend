import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Edit, Trash, Image as ImageIcon } from 'lucide-react'
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
    </div>
  )
}
