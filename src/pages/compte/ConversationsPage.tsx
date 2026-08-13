import React, { useEffect, useState } from 'react'
import { Home, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../../lib/api'

type GroupedAnnonce = {
  id_annonce: number | string
  annonce_titre: string
  annonce_photo: string | null
  annonce_prix: number | null
  annonce_lieu?: string
  total_non_lus: number
  primary_user_id: number
  proprietaire_nom: string
  dernier_message?: string
  est_dernier_message_mien?: boolean
  date_raw?: string | Date | number
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

  const [groups, setGroups] = useState<GroupedAnnonce[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    api.messagesThreads()
      .then((data) => {
        if (!mounted) return

        const groupedMap = new Map<number | string, GroupedAnnonce>()

        data.forEach((d: any) => {
          if (!d.id_annonce && !d.annonce_titre) return

          const key = d.id_annonce || d.annonce_titre
          const nonLus = d.non_lus || 0

          // Récupération du propriétaire (depot_annonce -> id_utilisateur / email)
          const proprietaireNom = 
            d.proprietaire_nom || 
            d.nom_utilisateur || 
            d.email || 
            'Propriétaire'

          const dernierMessage = 
            d.dernier_message || 
            d.last_message || 
            d.message || 
            ''

          const dateRaw = 
            d.date_creation || 
            d.date_dernier_message || 
            d.created_at || 
            d.updated_at

          if (!groupedMap.has(key)) {
            groupedMap.set(key, {
              id_annonce: key,
              annonce_titre: d.annonce_titre,
              annonce_photo: d.annonce_photo || null,
              annonce_prix: d.annonce_prix || null,
              annonce_lieu: d.quartier || d.adresse || '',
              total_non_lus: nonLus,
              primary_user_id: d.id_utilisateur || d.interlocuteur_id,
              proprietaire_nom: proprietaireNom,
              dernier_message: dernierMessage,
              est_dernier_message_mien: Boolean(d.est_dernier_message_mien || d.is_mine),
              date_raw: dateRaw,
            })
          } else {
            const existingGroup = groupedMap.get(key)!
            existingGroup.total_non_lus += nonLus
          }
        })

        setGroups(Array.from(groupedMap.values()))
      })
      .catch(() => setGroups([]))
      .finally(() => setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  const openConversation = (group: GroupedAnnonce) => {
    navigate(`/compte?tab=messages&user=${group.primary_user_id}`)
  }

  const lang = i18n.language.toLowerCase()

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-border/80 shadow-sm">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-5 h-5 text-brand-cyan shrink-0" />
          <h2 className="bebas text-2xl tracking-wide text-foreground">
            {t('title', 'MES CONVERSATIONS')}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
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
        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border border-border">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          {t('empty', 'Aucune conversation pour le moment')}
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const initial = group.proprietaire_nom
              ? group.proprietaire_nom.charAt(0).toUpperCase()
              : 'P'

            const timeAgo = formatTimeAgo(group.date_raw)

            return (
              <div
                key={group.id_annonce}
                onClick={() => openConversation(group)}
                className="flex items-start gap-4 p-4 bg-white border border-border/70 rounded-2xl hover:border-brand-cyan/40 hover:shadow-sm transition-all cursor-pointer relative"
              >
                {/* Photo de l'annonce */}
                {group.annonce_photo ? (
                  <img
                    src={group.annonce_photo}
                    alt={group.annonce_titre}
                    className="w-20 h-20 sm:w-24 sm:h-20 rounded-xl object-cover shrink-0 bg-muted"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-20 rounded-xl shrink-0 bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <Home className="w-8 h-8 opacity-40" />
                  </div>
                )}

                {/* Information textuelle */}
                <div className="flex-1 min-w-0 pr-16">
                  {/* Badge initiale + Nom du propriétaire (issu de depot_annonce) */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {initial}
                    </span>
                    <h3 className="text-base font-bold text-foreground truncate">
                      {group.proprietaire_nom}
                    </h3>
                  </div>

                  {/* Détails Annonce (Titre, Quartier, Prix) */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium mb-2 max-w-full truncate">
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
                    <p className="text-xs sm:text-sm text-slate-600 truncate">
                      {group.est_dernier_message_mien && (
                        <span className="font-semibold text-slate-800">Tu : </span>
                      )}
                      {group.dernier_message}
                    </p>
                  )}
                </div>

                {/* Heure / Date calculée dynamiquement */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">
                    {timeAgo}
                  </span>
                  {group.total_non_lus > 0 && (
                    <span className="w-2.5 h-2.5 bg-brand-cyan rounded-full inline-block shrink-0" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Bouton d'action en bas */}
      <div className="mt-8">
        <button
          onClick={() => navigate('/compte?tab=messages')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-cyan text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
        >
          <span>→</span> {t('open', 'Ouvrir la messagerie')}
        </button>
      </div>
    </div>
  )
}