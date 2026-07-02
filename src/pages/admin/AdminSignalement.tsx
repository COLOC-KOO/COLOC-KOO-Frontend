import React, { useState, useMemo } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Mail,
  MessageCircle,
  MoreVertical,
  Search,
  Shield,
  UserMinus,
  UserX,
  X,
  CheckCircle,
  Clock,
  Flag,
  Users,
  Ban,
  AlertTriangle
} from 'lucide-react'

// Types
interface Message {
  sender: 'A' | 'B'
  text: string
  timestamp: string
}

interface ConversationSignalement {
  id: string
  motif: string
  signaler: string // 'Membre A' ou 'Membre B'
  date: string
  status: 'en-attente' | 'en-cours' | 'traite' | 'classe'
  messages: Message[]
  participants: {
    id: string
    name: string
    role: string
  }[]
  actions: {
    suspension?: {
      membre: string
      date: string
      duree: number
    }
    avertissement?: {
      envoye: boolean
      date: string
    }
  }
}

// Données mockées
const MOCK_SIGNALEMENTS: ConversationSignalement[] = [
  {
    id: 'C-318',
    motif: 'Contenu commercial / démarchage',
    signaler: 'Membre B',
    date: '2026-06-15 14:32',
    status: 'en-attente',
    participants: [
      { id: 'M-001', name: 'Rivo A.', role: 'Colocataire' },
      { id: 'M-002', name: 'Naina B.', role: 'Propriétaire' }
    ],
    messages: [
      { sender: 'A', text: 'Bonjour, la chambre est toujours dispo ?', timestamp: '14:30' },
      { sender: 'B', text: 'Oui, dispo.', timestamp: '14:31' },
      { sender: 'A', text: 'Super, je peux visiter cette semaine ?', timestamp: '14:32' },
      { sender: 'B', text: 'Avant, versez 200 000 MGA d\'acompte sur mon MVOLA perso.', timestamp: '14:33' },
      { sender: 'A', text: 'Ce n\'est pas censé passer par la plateforme ?', timestamp: '14:35' },
      { sender: 'B', text: 'Non, c\'est plus simple en direct. Sinon je passe au suivant.', timestamp: '14:36' },
      { sender: 'A', text: 'Je préfère qu\'on reste sur Sarintany\'COLOC.', timestamp: '14:38' }
    ],
    actions: {}
  },
  {
    id: 'C-317',
    motif: 'Harcèlement ou pression',
    signaler: 'Membre A',
    date: '2026-06-15 10:15',
    status: 'en-cours',
    participants: [
      { id: 'M-003', name: 'Tahiana R.', role: 'Colocataire' },
      { id: 'M-004', name: 'Mamy C.', role: 'Colocataire' }
    ],
    messages: [
      { sender: 'A', text: 'Bonjour, j\'hésite encore pour la chambre.', timestamp: '09:45' },
      { sender: 'B', text: 'Décide-toi vite.', timestamp: '09:47' },
      { sender: 'B', text: 'Réponds-moi tout de suite.', timestamp: '09:50' },
      { sender: 'B', text: 'Tu m\'ignores ? Je sais où se trouve l\'appart.', timestamp: '09:52' },
      { sender: 'A', text: 'Merci d\'arrêter de me contacter.', timestamp: '09:55' },
      { sender: 'B', text: 'Tu vas le regretter.', timestamp: '09:56' }
    ],
    actions: {
      avertissement: {
        envoye: true,
        date: '2026-06-15 11:00'
      }
    }
  },
  {
    id: 'C-316',
    motif: 'Propos discriminatoires',
    signaler: 'Membre B',
    date: '2026-06-14 08:45',
    status: 'traite',
    participants: [
      { id: 'M-005', name: 'Faniry T.', role: 'Propriétaire' },
      { id: 'M-006', name: 'Hery R.', role: 'Colocataire' }
    ],
    messages: [
      { sender: 'A', text: 'Je préfère un colocataire de ma région.', timestamp: '08:30' },
      { sender: 'B', text: 'C\'est discriminatoire, non ?', timestamp: '08:32' },
      { sender: 'A', text: 'Non, c\'est mon choix.', timestamp: '08:34' },
      { sender: 'B', text: 'Je vais signaler ce message.', timestamp: '08:35' }
    ],
    actions: {
      suspension: {
        membre: 'Membre A',
        date: '2026-06-14',
        duree: 10
      }
    }
  }
]

// Composant de statut
const StatusBadge = ({ status }: { status: ConversationSignalement['status'] }) => {
  const config = {
    'en-attente': { label: 'En attente', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    'en-cours': { label: 'En cours', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    'traite': { label: 'Traité', className: 'bg-green-500/15 text-green-400 border-green-500/30' },
    'classe': { label: 'Classé', className: 'bg-gray-500/15 text-gray-400 border-gray-500/30' }
  }
  const { label, className } = config[status]
  
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${className}`}>
      {status === 'en-attente' && <Clock className="w-3 h-3" />}
      {status === 'en-cours' && <AlertCircle className="w-3 h-3" />}
      {status === 'traite' && <CheckCircle className="w-3 h-3" />}
      {status === 'classe' && <X className="w-3 h-3" />}
      {label}
    </span>
  )
}

// Composant de conversation
const ConversationView = ({ 
  signalement, 
  onAction, 
  onClose 
}: { 
  signalement: ConversationSignalement
  onAction: (id: string, action: string, membre?: string) => void
  onClose: () => void
}) => {
  const [showFull, setShowFull] = useState(false)
  const visibleMessages = showFull ? signalement.messages : signalement.messages.slice(0, 5)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold">{signalement.id}</h3>
              <StatusBadge status={signalement.status} />
            </div>
            <p className="text-white/50 text-sm mt-1">
              {signalement.motif} · signalé par {signalement.signaler} · {signalement.date}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Participants */}
        <div className="px-4 py-3 border-b border-white/10 flex gap-6 text-sm">
          {signalement.participants.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-[oklch(0.15_0_0)] text-xs font-bold">
                {p.name[0]}
              </div>
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-white/40 text-xs">{p.role}</div>
              </div>
              {i === 0 && <span className="text-white/30 text-xs ml-1">(Membre A)</span>}
              {i === 1 && <span className="text-white/30 text-xs ml-1">(Membre B)</span>}
            </div>
          ))}
        </div>

        {/* Messages */}
        <div className="p-4 overflow-y-auto max-h-[40vh]">
          <div className="space-y-3">
            {visibleMessages.map((msg, idx) => {
              const isA = msg.sender === 'A'
              const participant = isA ? signalement.participants[0] : signalement.participants[1]
              
              return (
                <div key={idx} className={`flex ${isA ? 'justify-start' : 'justify-end'}`}>
                  <div 
                    className={`max-w-[75%] rounded-lg px-4 py-2.5 ${
                      isA 
                        ? 'bg-white/5 border border-white/10' 
                        : 'bg-brand-cyan/15 border border-brand-cyan/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                      <span className="font-bold">{participant?.name}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              )
            })}
            
            {signalement.messages.length > 5 && (
              <button 
                onClick={() => setShowFull(!showFull)}
                className="w-full text-center text-xs text-white/40 hover:text-white/70 py-2 transition"
              >
                {showFull ? 'Voir moins' : `Voir les ${signalement.messages.length - 5} messages suivants`}
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-white/10 flex flex-wrap gap-2">
          <button 
            onClick={() => onAction(signalement.id, 'suspendre', 'Membre A')}
            className="px-3 py-1.5 bg-red-500/15 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium hover:bg-red-500/25 transition"
          >
            <Ban className="w-3 h-3 inline mr-1" />
            Suspendre Membre A
          </button>
          <button 
            onClick={() => onAction(signalement.id, 'suspendre', 'Membre B')}
            className="px-3 py-1.5 bg-red-500/15 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium hover:bg-red-500/25 transition"
          >
            <Ban className="w-3 h-3 inline mr-1" />
            Suspendre Membre B
          </button>
          <button 
            onClick={() => onAction(signalement.id, 'avertir')}
            className="px-3 py-1.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-medium hover:bg-amber-500/25 transition"
          >
            <Mail className="w-3 h-3 inline mr-1" />
            Envoyer un avertissement
          </button>
          <button 
            onClick={() => onAction(signalement.id, 'classer')}
            className="px-3 py-1.5 bg-white/5 text-white/60 border border-white/10 rounded-lg text-xs font-medium hover:bg-white/10 transition"
          >
            Classer sans suite
          </button>
          <button 
            onClick={() => onAction(signalement.id, 'ouvrir')}
            className="px-3 py-1.5 bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 rounded-lg text-xs font-medium hover:bg-brand-cyan/25 transition ml-auto"
          >
            <MessageCircle className="w-3 h-3 inline mr-1" />
            Ouvrir la conversation
          </button>
        </div>
      </div>
    </div>
  )
}

// Composant principal
export default function AdminSignalements() {
  const [signalements, setSignalements] = useState(MOCK_SIGNALEMENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSignalement, setSelectedSignalement] = useState<ConversationSignalement | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('tous')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Filtrer les signalements
  const filteredSignalements = useMemo(() => {
    let filtered = signalements
    
    if (filterStatus !== 'tous') {
      filtered = filtered.filter(s => s.status === filterStatus)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(s => 
        s.id.toLowerCase().includes(query) ||
        s.motif.toLowerCase().includes(query) ||
        s.signaler.toLowerCase().includes(query) ||
        s.participants.some(p => p.name.toLowerCase().includes(query))
      )
    }
    
    return filtered
  }, [signalements, filterStatus, searchQuery])

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: signalements.length,
      enAttente: signalements.filter(s => s.status === 'en-attente').length,
      enCours: signalements.filter(s => s.status === 'en-cours').length,
      traite: signalements.filter(s => s.status === 'traite').length
    }
  }, [signalements])

  // Actions sur les signalements
  const handleAction = (id: string, action: string, membre?: string) => {
    const index = signalements.findIndex(s => s.id === id)
    if (index === -1) return

    const updatedSignalements = [...signalements]
    const signalement = { ...updatedSignalements[index] }

    let message = ''

    switch(action) {
      case 'suspendre':
        if (membre) {
          signalement.actions.suspension = {
            membre,
            date: new Date().toLocaleDateString('fr-FR'),
            duree: 10
          }
          signalement.status = 'traite'
          message = `${membre} a été suspendu pour 10 jours`
          // Log l'action
          console.log(`[LOG] Suspension de ${membre} - Conversation ${id}`)
        }
        break
        
      case 'avertir':
        signalement.actions.avertissement = {
          envoye: true,
          date: new Date().toLocaleDateString('fr-FR')
        }
        signalement.status = 'en-cours'
        message = 'Un avertissement a été envoyé'
        console.log(`[LOG] Avertissement envoyé - Conversation ${id}`)
        break
        
      case 'classer':
        signalement.status = 'classe'
        message = 'Signalement classé sans suite'
        console.log(`[LOG] Signalement classé - Conversation ${id}`)
        break
        
      case 'ouvrir':
        message = 'Ouverture de la conversation'
        break
        
      default:
        return
    }

    updatedSignalements[index] = signalement
    setSignalements(updatedSignalements)
    setSelectedSignalement(null)
    
    if (message) {
      setSuccessMessage(message)
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* En-tête */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="bebas text-3xl text-white">Signalements de conversations</h1>
            <p className="text-white/50 text-sm">
              {stats.total} signalements · {stats.enAttente} en attente, {stats.enCours} en cours, {stats.traite} traités
            </p>
          </div>
        </div>

        {/* Message de succès */}
        {successMessage && (
          <div className="bg-brand-green/20 border border-brand-green/30 text-brand-green px-4 py-2 rounded-lg text-sm animate-in slide-in-from-top-2">
            {successMessage}
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl">
          <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
              <Search className="w-4 h-4 text-white/40" />
              <input
                placeholder="Rechercher un signalement..."
                className="flex-1 bg-transparent outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-white/40 hover:text-white/70 text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex gap-1 ml-auto flex-wrap">
              {[
                { value: 'tous', label: 'Tous' },
                { value: 'en-attente', label: 'En attente' },
                { value: 'en-cours', label: 'En cours' },
                { value: 'traite', label: 'Traités' },
                { value: 'classe', label: 'Classés' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setFilterStatus(filter.value)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition ${
                    filterStatus === filter.value
                      ? 'bg-brand-cyan text-[oklch(0.15_0_0)] font-semibold'
                      : 'text-white/60 hover:bg-white/5'
                  }`}
                >
                  {filter.label}
                  {filter.value === 'tous' && (
                    <span className="ml-1 text-[10px] opacity-60">({stats.total})</span>
                  )}
                  {filter.value === 'en-attente' && stats.enAttente > 0 && (
                    <span className="ml-1 text-[10px] text-amber-400">({stats.enAttente})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Liste des signalements */}
          <div className="divide-y divide-white/5">
            {filteredSignalements.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <Flag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Aucun signalement trouvé</p>
              </div>
            ) : (
              filteredSignalements.map((s) => (
                <div 
                  key={s.id}
                  className="p-4 hover:bg-white/5 transition cursor-pointer"
                  onClick={() => setSelectedSignalement(s)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icône */}
                    <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                      <Flag className="w-4 h-4 text-red-400" />
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold">{s.id}</h3>
                        <StatusBadge status={s.status} />
                        <span className="text-white/30 text-xs">·</span>
                        <span className="text-white/50 text-sm">{s.date}</span>
                      </div>
                      <p className="text-sm text-white/80 mt-0.5">{s.motif}</p>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-white/40">
                        <span>Signalé par {s.signaler}</span>
                        <span>·</span>
                        <span>{s.participants.map(p => p.name).join(' vs ')}</span>
                        {s.actions.suspension && (
                          <>
                            <span>·</span>
                            <span className="text-red-400 flex items-center gap-1">
                              <Ban className="w-3 h-3" />
                              Suspension {s.actions.suspension.membre}
                            </span>
                          </>
                        )}
                        {s.actions.avertissement?.envoye && (
                          <>
                            <span>·</span>
                            <span className="text-amber-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              Avertissement envoyé
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Nombre de messages */}
                    <div className="flex items-center gap-2 text-white/30 text-xs">
                      <MessageCircle className="w-3 h-3" />
                      {s.messages.length}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pied de tableau */}
          <div className="p-4 border-t border-white/10 flex gap-6 text-xs text-white/40">
            <span>Total: {filteredSignalements.length}</span>
            <span>En attente: {filteredSignalements.filter(s => s.status === 'en-attente').length}</span>
            <span>En cours: {filteredSignalements.filter(s => s.status === 'en-cours').length}</span>
            <span>Traités: {filteredSignalements.filter(s => s.status === 'traite').length}</span>
            <span>Classés: {filteredSignalements.filter(s => s.status === 'classe').length}</span>
          </div>
        </div>
      </div>

      {/* Modale de conversation */}
      {selectedSignalement && (
        <ConversationView 
          signalement={selectedSignalement}
          onAction={handleAction}
          onClose={() => setSelectedSignalement(null)}
        />
      )}
    </AdminLayout>
  )
}