import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, Trash, Image as ImageIcon } from 'lucide-react'
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

export default function TabMesFavoris() {
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
