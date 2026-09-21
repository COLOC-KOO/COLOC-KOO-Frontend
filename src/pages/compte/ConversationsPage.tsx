import React, { useEffect, useState } from 'react'
import { Home, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'

type GroupedAnnonce = {
  id_groupe: number
  id_annonce: number | string | null
  annonce_titre: string
  annonce_photo: string | null
  annonce_prix: number | null
  annonce_lieu?: string
  total_non_lus: number
  proprietaire_nom: string
  dernier_message?: string
  est_dernier_message_mien?: boolean
  date_raw?: string | Date | number
}

// Horodatage sûr : une valeur absente ou invalide ne doit pas produire NaN,
// sinon le tri de la liste devient incohérent.
function timeOf(value?: string | Date | number | null): number {
  const time = new Date(value || 0).getTime()
  return Number.isNaN(time) ? 0 : time
}

// Calcule dynamiquement le temps écoulé (ex: "il y a 2 h", "hier", "3 j")
function formatTimeAgo(dateInput?: string | Date | number): string {
  if (!dateInput) return ''

  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return String(dateInput)

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "à l'instant"

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `il y a ${diffInMinutes} min`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `il y a ${diffInHours} h`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return 'hier'
  if (diffInDays < 7) return `${diffInDays} j`

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  })
}

export default function ConversationsPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('conversations')
  const { user } = useAuth()

  const [groups, setGroups] = useState<GroupedAnnonce[]>([])
  const [loading, setLoading] = useState(true)
  // Photos dont l'URL est cassée : on retombe alors sur l'illustration par défaut.
  const [brokenPhotos, setBrokenPhotos] = useState<Record<number, boolean>>({})

  useEffect(() => {
    let mounted = true
    setLoading(true)

    // Cette section ne montre QUE les discussions de groupe : un logement =
    // son groupe de colocation, avec la photo de l'annonce et le dernier
    // message échangé dans ce groupe. Les échanges privés restent dans la
    // messagerie et ne remontent pas ici.
    api
      .groupThreads()
      .then((groupThreads) => {
        if (!mounted) return

        const items: GroupedAnnonce[] = (groupThreads || [])
          .map((g: any) => ({
            id_groupe: Number(g.id_groupe),
            id_annonce: g.id_annonce ?? null,
            annonce_titre: g.annonce_titre || g.nom || '',
            annonce_photo: g.annonce_photo || null,
            annonce_prix: g.annonce_prix != null ? Number(g.annonce_prix) : null,
            annonce_lieu: g.annonce_quartier || g.annonce_ville || '',
            total_non_lus: Number(g.non_lus || 0),
            proprietaire_nom: g.proprietaire_nom || g.nom || 'Propriétaire',
            dernier_message: g.dernier_message || '',
            est_dernier_message_mien:
              g.dernier_expediteur_id != null &&
              Number(g.dernier_expediteur_id) === Number(user?.id),
            date_raw: g.date_dernier_message || g.date_creation,
          }))
          .sort((a, b) => timeOf(b.date_raw) - timeOf(a.date_raw))

        setGroups(items)
      })
      .catch(() => setGroups([]))
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [user?.id])

  const openConversation = (group: GroupedAnnonce) => {
    navigate(`/compte?tab=messages&group=${group.id_groupe}`)
  }

  const lang = i18n.language.toLowerCase()

  return (
    /* Pas de carte ici : le conteneur d'onglet de /compte fournit déjà le fond
       blanc, la bordure et le padding. L'imbrication doublait les marges et
       rendait la liste très étroite sur mobile. */
    <div className="w-full max-w-3xl mx-auto">
      {/* En-tête */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-5 h-5 text-brand-cyan shrink-0" />
          <h2 className="bebas text-xl sm:text-2xl tracking-wide text-foreground">
            {t('title', 'MES CONVERSATIONS')}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {t(
            'subtitle',
            'Chaque conversation est rattachée à l\'annonce concernée. Tu peux signaler ou bloquer un utilisateur depuis une conversation.'
          )}
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground py-10 text-center">
          {t('loading', 'Chargement...')}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-10 sm:py-12 px-4 text-sm text-muted-foreground bg-muted/20 rounded-2xl border border-border">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          {t('empty', 'Aucune conversation pour le moment')}
        </div>
      ) : (
        <div className="space-y-2.5 sm:space-y-4">
          {groups.map((group) => {
            const initial = group.proprietaire_nom
              ? group.proprietaire_nom.charAt(0).toUpperCase()
              : 'P'

            const timeAgo = formatTimeAgo(group.date_raw)

            return (
              <button
                key={group.id_groupe}
                type="button"
                onClick={() => openConversation(group)}
                className="w-full text-left flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white border border-border/70 rounded-2xl hover:border-brand-cyan/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40 transition-all"
              >
                {/* Photo du logement telle qu'ajoutée par l'utilisateur ;
                    illustration par défaut si aucune photo ou URL cassée. */}
                {group.annonce_photo && !brokenPhotos[group.id_groupe] ? (
                  <img
                    src={group.annonce_photo}
                    alt={group.annonce_titre}
                    onError={() =>
                      setBrokenPhotos((prev) => ({ ...prev, [group.id_groupe]: true }))
                    }
                    className="w-16 h-16 sm:w-24 sm:h-20 rounded-xl object-cover shrink-0 bg-muted"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-24 sm:h-20 rounded-xl shrink-0 bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <Home className="w-7 h-7 sm:w-8 sm:h-8 opacity-40" />
                  </div>
                )}

                {/* Information textuelle. L'heure fait partie du flux (et non
                    plus en position absolue) : plus de chevauchement avec le
                    nom sur les petits écrans. */}
                <div className="flex-1 min-w-0">
                  {/* Badge initiale + Nom du propriétaire (issu de depot_annonce) */}
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {initial}
                    </span>
                    <h3 className="flex-1 min-w-0 truncate text-sm sm:text-base font-bold text-foreground">
                      {group.proprietaire_nom}
                    </h3>
                    <span className="shrink-0 flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 font-medium">
                      {timeAgo}
                      {group.total_non_lus > 0 && (
                        <span className="w-2.5 h-2.5 bg-brand-cyan rounded-full inline-block shrink-0" />
                      )}
                    </span>
                  </div>

                  {/* Détails Annonce (Titre, Quartier, Prix) */}
                  <div className="mt-1.5 inline-flex max-w-full items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] sm:text-xs font-medium">
                    <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {group.annonce_titre}
                      {group.annonce_lieu && ` · ${group.annonce_lieu}`}
                    </span>
                    {group.annonce_prix && (
                      <span className="font-bold text-brand-cyan ml-1 shrink-0">
                        {group.annonce_prix.toLocaleString(
                          lang === 'mg' ? 'mg-MG' : lang === 'en' ? 'en-US' : 'fr-FR'
                        )}{' '}
                        Ar
                      </span>
                    )}
                  </div>

                  {/* Dernier Message */}
                  {group.dernier_message && (
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {group.est_dernier_message_mien && (
                        <span className="font-semibold text-slate-800">Tu : </span>
                      )}
                      {group.dernier_message}
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Bouton d'action en bas */}
      <div className="mt-6 sm:mt-8">
        <button
          onClick={() => navigate('/compte?tab=messages')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-brand-cyan text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
        >
          <span>→</span> {t('open', 'Ouvrir la messagerie')}
        </button>
      </div>
    </div>
  )
}