import React, { useEffect, useState } from 'react'
import { Home, MapPin, MessageSquare, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'

type Thread = {
  interlocuteur_id: number
  interlocuteur_nom: string
  interlocuteur_prenom: string
  dernier_message: string
  date_dernier_message: string | null
  non_lus: number
  annonce_titre?: string | null
  annonce_prix?: number | null
  annonce_photo?: string | null
  annonce_quartier?: string | null
  annonce_ville?: string | null
  /** true pour les conversations de démonstration (pas encore de vraies données) */
  isStatic?: boolean
}

/* ------------------------------------------------------------------ */
/*  Conversations statiques — à retirer une fois l'API "messages"      */
/*  pleinement branchée. Servent d'exemple / de remplissage visuel.    */
/* ------------------------------------------------------------------ */
const STATIC_THREADS: Thread[] = [
  {
    interlocuteur_id: -1,
    interlocuteur_prenom: 'Mialy',
    interlocuteur_nom: 'R.',
    dernier_message: 'Merci pour les infos, je reviens vers toi vite !',
    date_dernier_message: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    non_lus: 0,
    annonce_titre: 'Maison partagée · Ivandry',
    annonce_prix: 420000,
    annonce_photo: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200&q=70',
    annonce_quartier: 'Ivandry',
    annonce_ville: 'Antananarivo',
    isStatic: true,
  },
  {
    interlocuteur_id: -2,
    interlocuteur_prenom: 'Tiana',
    interlocuteur_nom: 'N.',
    dernier_message: 'La chambre est-elle toujours disponible ?',
    date_dernier_message: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    non_lus: 1,
    annonce_titre: 'Coloc lumineuse · Ankadifotsy',
    annonce_prix: 350000,
    annonce_photo: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&q=70',
    annonce_quartier: 'Ankadifotsy',
    annonce_ville: 'Antananarivo',
    isStatic: true,
  },
]

function formatRelative(dateStr: string | null) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const diffMs = Date.now() - date.getTime()
  const diffH = Math.round(diffMs / (1000 * 60 * 60))
  if (diffH < 1) return "à l'instant"
  if (diffH < 24) return `il y a ${diffH} h`
  const diffJ = Math.round(diffH / 24)
  if (diffJ === 1) return 'hier'
  if (diffJ < 7) return `il y a ${diffJ} j`
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

export default function ConversationsPage() {
  const navigate = useNavigate()
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api.messagesThreads()
      .then((data) => {
        if (!mounted) return
        const real: Thread[] = data.map((d: any) => ({
          interlocuteur_id: d.interlocuteur_id,
          interlocuteur_nom: d.interlocuteur_nom,
          interlocuteur_prenom: d.interlocuteur_prenom,
          dernier_message: d.dernier_message || '',
          date_dernier_message: d.date_dernier_message || null,
          non_lus: d.non_lus || 0,
          annonce_titre: d.annonce_titre || null,
          annonce_prix: d.annonce_prix || null,
          annonce_photo: d.annonce_photo || null,
          annonce_quartier: d.annonce_quartier || null,
          annonce_ville: d.annonce_ville || null,
        }))
        // Les conversations statiques comblent la liste en attendant de vraies données
        setThreads([...real, ...STATIC_THREADS])
      })
      .catch(() => setThreads([...STATIC_THREADS]))
      .finally(() => setLoading(false))

    return () => { mounted = false }
  }, [])

  const openThread = (t: Thread) => {
    if (t.isStatic) return // pas de vrai thread à ouvrir pour la démo
    navigate(`/compte?tab=paiements&user=${t.interlocuteur_id}`)
  }

  const getInitials = (p?: string, n?: string) => {
    const a = (p || '')[0] || '?'
    const b = (n || '')[0] || '?'
    return (a + b).toUpperCase()
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="w-5 h-5 text-brand-cyan shrink-0" />
        <h2 className="bebas text-xl sm:text-2xl">Mes conversations</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Chaque conversation est rattachée à l'annonce concernée. Tu peux signaler ou bloquer un utilisateur depuis une conversation.
      </p>

      <div className="space-y-2.5">
        {loading ? (
          <div className="text-sm text-muted-foreground py-6 text-center">Chargement...</div>
        ) : threads.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            Aucune conversation
          </div>
        ) : (
          threads.map((t) => (
            <div
              key={t.interlocuteur_id}
              onClick={() => openThread(t)}
              className={`flex items-start gap-3 p-3 bg-white border border-border rounded-2xl transition-shadow ${
                t.isStatic ? 'cursor-default' : 'cursor-pointer hover:shadow-md'
              }`}
            >
              <img
                src={t.annonce_photo || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&q=70'}
                alt=""
                className="w-20 h-16 sm:w-24 sm:h-[70px] rounded-xl object-cover shrink-0 bg-muted"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    {getInitials(t.interlocuteur_prenom, t.interlocuteur_nom)}
                  </div>
                  <span className="text-sm font-bold text-foreground truncate">{t.interlocuteur_prenom} {t.interlocuteur_nom}</span>
                  <span className="ml-auto text-[11px] text-muted-foreground shrink-0">{formatRelative(t.date_dernier_message)}</span>
                </div>

                {t.annonce_titre && (
                  <div className="inline-flex items-center gap-1.5 bg-muted/60 border border-border/60 rounded-lg px-2.5 py-1 mb-1.5 max-w-full">
                    <Home className="w-3 h-3 text-brand-cyan shrink-0" />
                    <span className="text-[11px] font-semibold text-foreground/80 truncate">{t.annonce_titre}</span>
                    {t.annonce_prix ? (
                      <span className="text-[11px] font-semibold text-brand-cyan shrink-0">· {t.annonce_prix.toLocaleString('fr-FR')} Ar</span>
                    ) : null}
                  </div>
                )}

                <div className={`text-xs truncate flex items-center gap-1.5 ${t.non_lus > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                  {t.non_lus === 0 && <Clock className="w-3 h-3 text-muted-foreground shrink-0" />}
                  {t.dernier_message || 'Dernier message indisponible'}
                </div>
              </div>

              {t.non_lus > 0 && <div className="w-2.5 h-2.5 rounded-full bg-brand-cyan shrink-0 mt-1.5" />}
            </div>
          ))
        )}
      </div>

      <div className="mt-5">
        <button
          onClick={() => navigate('/compte?tab=paiements')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-cyan text-white text-sm font-semibold hover:bg-brand-cyan-dark transition-colors"
        >
          Ouvrir la messagerie →
        </button>
      </div>
    </div>
  )
}