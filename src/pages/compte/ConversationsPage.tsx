import React, { useEffect, useState } from 'react'
import { Home, MapPin, MessageSquare, Tag, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'

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
}

export default function ConversationsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api.messagesThreads()
      .then((data) => {
        if (!mounted) return
        setThreads(data.map((d: any) => ({
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
        })))
      })
      .catch(() => setThreads([]))
      .finally(() => setLoading(false))

    return () => { mounted = false }
  }, [])

  const openThread = (id: number) => {
    navigate(`/compte?tab=paiements&user=${id}`)
  }

  const getInitials = (p?: string, n?: string) => {
    const a = (p || '')[0] || '?' 
    const b = (n || '')[0] || '?' 
    return (a + b).toUpperCase()
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <main>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          {/* Profile + featured annonce */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-cyan-400 to-green-400 text-white flex items-center justify-center font-bold text-lg">{(user?.prenom?.[0]||user?.name?.[0]||'U').toUpperCase()}</div>
              <div>
                <div className="text-lg md:text-xl font-semibold">{user?.prenom} {user?.nom}</div>
                <div className="text-sm text-gray-500">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 md:mt-0 md:ml-auto w-full md:w-72">
              {threads[0] && threads[0].annonce_titre ? (
                <div className="border border-gray-100 rounded-lg overflow-hidden bg-white shadow-sm">
                  <img src={threads[0].annonce_photo || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&q=70'} alt="annonce" className="w-full h-44 object-cover" />
                  <div className="p-3">
                    <div className="text-sm font-semibold text-foreground truncate">{threads[0].annonce_titre}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {threads[0].annonce_quartier && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600">
                          <MapPin className="w-3.5 h-3.5" />
                          {threads[0].annonce_quartier}
                        </span>
                      )}
                      {threads[0].annonce_ville && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600">
                          <MapPin className="w-3.5 h-3.5" />
                          {threads[0].annonce_ville}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-brand-cyan-dark inline-flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      {threads[0].annonce_prix ? `${threads[0].annonce_prix} €` : 'Prix non disponible'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">Aucune annonce mise en avant</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-5 h-5 text-cyan-600" />
            <h2 className="text-lg font-semibold">MES CONVERSATIONS</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">Chaque conversation est rattachée à l'annonce concernée. Tu peux signaler ou bloquer un utilisateur depuis une conversation.</p>

          <div className="space-y-3">
            {loading ? (
              <div className="text-sm text-gray-500">Chargement...</div>
            ) : threads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Aucune conversation</div>
            ) : (
              threads.map((t) => (
                <div key={t.interlocuteur_id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm cursor-pointer" onClick={() => openThread(t.interlocuteur_id)}>
                  <img src={t.annonce_photo || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&q=70'} alt="thumb" className="w-full sm:w-24 h-40 sm:h-24 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-green-400 text-white flex items-center justify-center font-bold text-sm">{getInitials(t.interlocuteur_prenom, t.interlocuteur_nom)}</div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{t.interlocuteur_prenom} {t.interlocuteur_nom}</div>
                          <div className="text-xs text-muted-foreground truncate">{t.annonce_quartier ? `${t.annonce_quartier}, ` : ''}{t.annonce_ville || ''}</div>
                        </div>
                      </div>
                      <div className="ml-auto text-xs text-gray-400">{t.date_dernier_message ? new Date(t.date_dernier_message).toLocaleDateString() : ''}</div>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-gray-700">
                      <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        <Home className="w-3.5 h-3.5" />
                        {t.annonce_titre || 'Annonce'}
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-700">
                        <Tag className="w-3.5 h-3.5" />
                        {t.annonce_prix ? `${t.annonce_prix} €` : 'Prix indisponible'}
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        <MapPin className="w-3.5 h-3.5" />
                        {t.annonce_quartier ? `${t.annonce_quartier}, ` : ''}{t.annonce_ville || 'Lieu inconnu'}
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-700 line-clamp-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {t.dernier_message || 'Dernier message indisponible'}
                    </div>
                  </div>
                  {t.non_lus > 0 ? <div className="w-3 h-3 rounded-full bg-cyan-500 ml-2 mt-2 sm:mt-0" /> : null}
                </div>
              ))
            )}
          </div>

          <div className="mt-4">
            <button onClick={() => navigate('/compte?tab=paiements')} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white font-semibold">→ Ouvrir la messagerie</button>
          </div>
        </div>
      </main>
    </div>
  )
}
