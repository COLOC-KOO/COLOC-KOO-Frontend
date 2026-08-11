import React, { useEffect, useState } from 'react'
import { Home, MessageSquare, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../../lib/api'

// Type de données pour regrouper les messages d'une même annonce
type GroupedAnnonce = {
  id_annonce: number | string
  annonce_titre: string
  annonce_photo: string | null
  annonce_prix: number | null
  total_non_lus: number
  primary_user_id: number
}

// Composant principal gérant la page des conversations
export default function ConversationsPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('conversations')

  const [groups, setGroups] = useState<GroupedAnnonce[]>([])
  const [loading, setLoading] = useState(true)

  // Effet pour charger les discussions et regrouper les messages par annonce
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

          if (!groupedMap.has(key)) {
            groupedMap.set(key, {
              id_annonce: key,
              annonce_titre: d.annonce_titre,
              annonce_photo: d.annonce_photo || null,
              annonce_prix: d.annonce_prix || null,
              total_non_lus: nonLus,
              primary_user_id: d.interlocuteur_id,
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

  // Fonction de redirection vers une conversation spécifique
  const openConversation = (group: GroupedAnnonce) => {
    navigate(`/compte?tab=messages&user=${group.primary_user_id}`)
  }

  const lang = i18n.language.toLowerCase()

  // Rendu visuel de la page
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-brand-cyan shrink-0" />
        <h2 className="bebas text-xl sm:text-2xl">
          {t('title')}
        </h2>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground py-10 text-center">
          {t('loading')}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-white rounded-2xl border border-border">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          {t('empty')}
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <div
              key={group.id_annonce}
              onClick={() => openConversation(group)}
              className="flex items-center gap-4 p-4 bg-white border border-border rounded-2xl hover:shadow-md transition-all cursor-pointer"
            >
              {group.annonce_photo ? (
                <img
                  src={group.annonce_photo}
                  alt={group.annonce_titre}
                  className="w-16 h-14 sm:w-20 sm:h-16 rounded-xl object-cover shrink-0 bg-muted"
                />
              ) : (
                <div className="w-16 h-14 sm:w-20 sm:h-16 rounded-xl shrink-0 bg-brand-cyan/10 flex items-center justify-center text-brand-cyan">
                  <Home className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                  {group.annonce_titre}
                </h3>
                {group.annonce_prix && (
                  <p className="text-xs font-semibold text-brand-cyan">
                    {group.annonce_prix.toLocaleString(
                      lang === 'mg' ? 'mg-MG' : lang === 'en' ? 'en-US' : 'fr-FR'
                    )}{' '}
                    Ar
                  </p>
                )}
              </div>
              {group.total_non_lus > 0 && (
                <span className="w-6 h-6 bg-brand-cyan text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                  {group.total_non_lus}
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-muted-foreground/60 shrink-0" />
            </div>
          ))}
        </div>
      )}
      <div className="mt-6">
        <button
          onClick={() => navigate('/compte?tab=messages')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-cyan text-white text-sm font-semibold hover:bg-brand-cyan-dark transition-colors"
        >
          {t('open')}
        </button>
      </div>
    </div>
  )
}