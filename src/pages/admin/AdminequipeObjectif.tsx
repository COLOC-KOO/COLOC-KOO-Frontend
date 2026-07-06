import React, { useEffect, useMemo, useState } from 'react'
import { api, BackofficeMember } from '../../lib/api'
import { AdminLayout } from '../../components/admin/AdminLayout'
import {
  UserPlus,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  Award,
  TrendingUp,
  TrendingDown,
  Calendar,
  Search,
  ChevronDown,
  ChevronUp,
  Shield,
  Star,
  UserCheck,
  UserX,
  Crown,
  ArrowUpDown,
  Info
} from 'lucide-react'

// Types
interface Membre {
  id: string
  nom: string
  email: string
  telephone?: string
  role: 'moderateur' | 'admin' | 'super_admin' | 'proprietaire' | 'colocataire'
  avatar?: string
  dateArrivee: string
  objectifJournalier: number
  objectifMensuel: number
  realiseAujourdhui: number
  realiseMois: number
  statut: 'actif' | 'suspendu' | 'inactif'
  dernierConnexion?: string
  performance: {
    tauxValidation: number
    tempsMoyen: number
    annoncesTraitees: number
    signalementsTraites: number
  }
  badges: string[]
}

interface BackofficeObjectif {
  id_objectif: number
  libelle: string
  objectif: number
  realise: number
  periode: string
  statut: string
  date_creation: string
}

// Type pour le formulaire d'ajout/modification
type MembreFormData = {
  nom: string
  email: string
  telephone: string
  mot_de_passe?: string
  role: Membre['role']
  objectifJournalier: number
  objectifMensuel: number
  dateArrivee: string
  statut: Membre['statut']
}

// Données mockées
const MOCK_MEMBRES: Membre[] = [
  {
    id: 'M-001',
    nom: 'Hanta R.',
    email: 'hanta.r@coloc.mg',
    telephone: '+261 34 12 345 67',
    role: 'moderateur',
    dateArrivee: '2026-01-15',
    objectifJournalier: 30,
    objectifMensuel: 600,
    realiseAujourdhui: 12,
    realiseMois: 380,
    statut: 'actif',
    dernierConnexion: '2026-06-15 09:41',
    performance: {
      tauxValidation: 94,
      tempsMoyen: 7,
      annoncesTraitees: 158,
      signalementsTraites: 23
    },
    badges: ['Étoile montante', 'Validation rapide']
  },
  {
    id: 'M-002',
    nom: 'Tovo M.',
    email: 'tovo.m@coloc.mg',
    telephone: '+261 33 98 765 43',
    role: 'moderateur',
    dateArrivee: '2026-02-01',
    objectifJournalier: 25,
    objectifMensuel: 500,
    realiseAujourdhui: 21,
    realiseMois: 420,
    statut: 'actif',
    dernierConnexion: '2026-06-15 08:30',
    performance: {
      tauxValidation: 97,
      tempsMoyen: 5,
      annoncesTraitees: 210,
      signalementsTraites: 31
    },
    badges: ['Top modérateur', 'Réactivité']
  },
  {
    id: 'M-003',
    nom: 'Sata L.',
    email: 'sata.l@coloc.mg',
    telephone: '+261 32 11 223 34',
    role: 'admin',
    dateArrivee: '2025-11-10',
    objectifJournalier: 0,
    objectifMensuel: 0,
    realiseAujourdhui: 0,
    realiseMois: 0,
    statut: 'actif',
    dernierConnexion: '2026-06-14 16:20',
    performance: {
      tauxValidation: 0,
      tempsMoyen: 0,
      annoncesTraitees: 45,
      signalementsTraites: 12
    },
    badges: ['Admin confirmé']
  },
  {
    id: 'M-004',
    nom: 'Koto R.',
    email: 'koto.r@coloc.mg',
    telephone: '+261 34 55 667 78',
    role: 'super_admin',
    dateArrivee: '2025-09-01',
    objectifJournalier: 0,
    objectifMensuel: 0,
    realiseAujourdhui: 0,
    realiseMois: 0,
    statut: 'actif',
    dernierConnexion: '2026-06-15 10:15',
    performance: {
      tauxValidation: 0,
      tempsMoyen: 0,
      annoncesTraitees: 0,
      signalementsTraites: 0
    },
    badges: ['Fondateur']
  },
  {
    id: 'M-005',
    nom: 'Mamy R.',
    email: 'mamy.r@coloc.mg',
    telephone: '+261 33 44 556 67',
    role: 'moderateur',
    dateArrivee: '2026-05-20',
    objectifJournalier: 20,
    objectifMensuel: 400,
    realiseAujourdhui: 0,
    realiseMois: 120,
    statut: 'suspendu',
    dernierConnexion: '2026-06-10 14:30',
    performance: {
      tauxValidation: 78,
      tempsMoyen: 12,
      annoncesTraitees: 45,
      signalementsTraites: 8
    },
    badges: []
  }
]

function mapBackofficeMemberToMembre(user: BackofficeMember): Membre {
  const role = ['moderateur', 'admin', 'super_admin', 'proprietaire', 'colocataire'].includes(user.role)
    ? (user.role as Membre['role'])
    : 'moderateur'

  const statut = user.statut === 'suspended'
    ? 'suspendu'
    : user.statut === 'inactive' || user.statut === 'inactif'
      ? 'inactif'
      : 'actif'

  return {
    id: String(user.id),
    nom: user.name || `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Utilisateur',
    email: user.email,
    telephone: user.telephone || undefined,
    role,
    avatar: user.profilePicture || undefined,
    dateArrivee: user.createdAt ? user.createdAt.slice(0, 10) : '',
    objectifJournalier: 0,
    objectifMensuel: 0,
    realiseAujourdhui: 0,
    realiseMois: 0,
    statut,
    dernierConnexion: user.createdAt || undefined,
    performance: {
      tauxValidation: 0,
      tempsMoyen: 0,
      annoncesTraitees: user.annoncesCount || 0,
      signalementsTraites: user.candidaturesCount || 0,
    },
    badges: [],
  }
}

// Composant de badge de rôle
const RoleBadge = ({ role }: { role: Membre['role'] }) => {
  const config = {
    'moderateur': { label: 'Modérateur', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: UserCheck },
    'admin': { label: 'Admin', className: 'bg-purple-500/15 text-purple-400 border-purple-500/30', icon: Shield },
    'super_admin': { label: 'Super Admin', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: Crown },
    'proprietaire': { label: 'Propriétaire', className: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30', icon: UserCheck },
    'colocataire': { label: 'Colocataire', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: Users }
  }
  const { label, className, icon: Icon } = config[role]
  
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

// Composant de badge de statut
const StatusBadge = ({ statut }: { statut: Membre['statut'] }) => {
  const config = {
    'actif': { label: 'Actif', className: 'bg-green-500/15 text-green-400 border-green-500/30', icon: CheckCircle },
    'suspendu': { label: 'Suspendu', className: 'bg-red-500/15 text-red-400 border-red-500/30', icon: UserX },
    'inactif': { label: 'Inactif', className: 'bg-gray-500/15 text-gray-400 border-gray-500/30', icon: Clock }
  }
  const { label, className, icon: Icon } = config[statut]
  
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

// Composant de modale d'ajout/modification
const MembreModal = ({ 
  membre, 
  onClose, 
  onSave 
}: { 
  membre?: Membre
  onClose: () => void
  onSave: (membre: MembreFormData) => void
}) => {
  const [formData, setFormData] = useState<MembreFormData>({
    nom: membre?.nom || '',
    email: membre?.email || '',
    telephone: membre?.telephone || '',
    mot_de_passe: '',
    role: membre?.role || 'moderateur',
    objectifJournalier: membre?.objectifJournalier || 20,
    objectifMensuel: membre?.objectifMensuel || 400,
    dateArrivee: membre?.dateArrivee || new Date().toISOString().split('T')[0],
    statut: membre?.statut || 'actif'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[oklch(0.22_0.005_260)] p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xl font-bold">
            {membre ? 'Modifier le membre' : 'Ajouter un membre'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Nom complet *</label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Téléphone</label>
            <input
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData({...formData, telephone: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Mot de passe</label>
            <input
              type="password"
              value={formData.mot_de_passe || ''}
              onChange={(e) => setFormData({...formData, mot_de_passe: e.target.value})}
              placeholder={membre ? 'Laisser vide pour conserver le mot de passe' : '123456 par défaut'}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Rôle *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value as Membre['role']})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50"
            >
              <option value="moderateur" className="bg-[oklch(0.22_0.005_260)]">Modérateur</option>
              <option value="admin" className="bg-[oklch(0.22_0.005_260)]">Admin</option>
              <option value="super_admin" className="bg-[oklch(0.22_0.005_260)]">Super Admin</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">Objectif / jour</label>
              <input
                type="number"
                min="0"
                value={formData.objectifJournalier}
                onChange={(e) => setFormData({...formData, objectifJournalier: parseInt(e.target.value) || 0})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Objectif / mois</label>
              <input
                type="number"
                min="0"
                value={formData.objectifMensuel}
                onChange={(e) => setFormData({...formData, objectifMensuel: parseInt(e.target.value) || 0})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Date d'arrivée</label>
            <input
              type="date"
              value={formData.dateArrivee}
              onChange={(e) => setFormData({...formData, dateArrivee: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Statut</label>
            <select
              value={formData.statut}
              onChange={(e) => setFormData({...formData, statut: e.target.value as Membre['statut']})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50"
            >
              <option value="actif" className="bg-[oklch(0.22_0.005_260)]">Actif</option>
              <option value="suspendu" className="bg-[oklch(0.22_0.005_260)]">Suspendu</option>
              <option value="inactif" className="bg-[oklch(0.22_0.005_260)]">Inactif</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-brand-cyan text-[oklch(0.15_0_0)] font-bold px-4 py-2 rounded-lg hover:opacity-80 transition">
              <Save className="w-4 h-4 inline mr-2" />
              {membre ? 'Modifier' : 'Ajouter'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition text-white/60">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Composant principal
export default function AdminEquipeObjectifs() {
  const [membres, setMembres] = useState(MOCK_MEMBRES)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<string>('tous')
  const [filterStatut, setFilterStatut] = useState<string>('tous')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMembre, setEditingMembre] = useState<Membre | null>(null)
  const [sortField, setSortField] = useState<keyof Membre>('nom')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [backendError, setBackendError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [objectifs, setObjectifs] = useState<BackofficeObjectif[]>([])
  const [objectifsLoading, setObjectifsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list')

  const loadMembers = async () => {
    setLoading(true)
    setBackendError(null)

    try {
      const rows = await api.backofficeMembers()
      if (!rows || rows.length === 0) {
        setBackendError('Aucun membre trouvé dans le back-office.')
      }
      setMembres(rows.map(mapBackofficeMemberToMembre))
    } catch (err) {
      setBackendError(err instanceof Error ? err.message : 'Impossible de charger les membres.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
    loadObjectifs()
  }, [])

  const loadObjectifs = async () => {
    setObjectifsLoading(true)
    setBackendError(null)

    try {
      const data = await api.backofficeAdministration()
      setObjectifs(data.objectifs || [])
    } catch (err) {
      setBackendError(err instanceof Error ? err.message : 'Impossible de charger les objectifs.')
    } finally {
      setObjectifsLoading(false)
    }
  }

  const handleAddObjectif = async () => {
    const libelle = prompt('Libellé de l’objectif')
    if (!libelle) return

    const objectifValue = parseInt(prompt('Valeur cible (nombre)') || '', 10)
    if (Number.isNaN(objectifValue)) return

    try {
      await api.saveBackofficeObjectif({ libelle, objectif: objectifValue })
      setSuccessMessage('Objectif ajouté avec succès')
      setTimeout(() => setSuccessMessage(null), 3000)
      loadObjectifs()
    } catch (err) {
      setBackendError(err instanceof Error ? err.message : 'Impossible d’enregistrer l’objectif.')
    }
  }

  const handleEditObjectif = async (objectif: BackofficeObjectif) => {
    const libelle = prompt('Libellé', objectif.libelle)
    if (!libelle) return

    const objectifValue = parseInt(prompt('Objectif', String(objectif.objectif)) || '', 10)
    if (Number.isNaN(objectifValue)) return

    try {
      await api.saveBackofficeObjectif({
        id: objectif.id_objectif,
        libelle,
        objectif: objectifValue,
        realise: objectif.realise,
        periode: objectif.periode,
        statut: objectif.statut,
      })
      setSuccessMessage('Objectif mis à jour avec succès')
      setTimeout(() => setSuccessMessage(null), 3000)
      loadObjectifs()
    } catch (err) {
      setBackendError(err instanceof Error ? err.message : 'Impossible de mettre à jour l’objectif.')
    }
  }

  // Rôles uniques pour le filtre
  const roles = useMemo(() => {
    const unique = new Set(membres.map(m => m.role))
    return ['tous', ...Array.from(unique)]
  }, [membres])

  const statuts = useMemo(() => {
    const unique = new Set(membres.map(m => m.statut))
    return ['tous', ...Array.from(unique)]
  }, [membres])

  // Filtrer et trier les membres
  const filteredMembres = useMemo(() => {
    let filtered = membres

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(m =>
        m.nom.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        (m.telephone && m.telephone.includes(query))
      )
    }

    if (filterRole !== 'tous') {
      filtered = filtered.filter(m => m.role === filterRole)
    }

    if (filterStatut !== 'tous') {
      filtered = filtered.filter(m => m.statut === filterStatut)
    }

    filtered = filtered.sort((a, b) => {
      let aVal: any = a[sortField]
      let bVal: any = b[sortField]
      
      if (sortField === 'performance') {
        aVal = a.performance.tauxValidation
        bVal = b.performance.tauxValidation
      }
      
      if (typeof aVal === 'string') {
        return sortOrder === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal)
      }
      
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
    })

    return filtered
  }, [membres, searchQuery, filterRole, filterStatut, sortField, sortOrder])

  // Statistiques
  const stats = useMemo(() => {
    const total = membres.length
    const actifs = membres.filter(m => m.statut === 'actif').length
    const suspendus = membres.filter(m => m.statut === 'suspendu').length
    const moderateurs = membres.filter(m => m.role === 'moderateur').length
    const admins = membres.filter(m => m.role === 'admin' || m.role === 'super_admin').length
    
    const moyenneObjectif = moderateurs > 0 
      ? Math.round(membres.filter(m => m.role === 'moderateur').reduce((sum, m) => sum + m.objectifJournalier, 0) / moderateurs)
      : 0
    
    const moyenneRealise = moderateurs > 0
      ? Math.round(membres.filter(m => m.role === 'moderateur').reduce((sum, m) => sum + m.realiseAujourdhui, 0) / moderateurs)
      : 0
    
    return {
      total,
      actifs,
      suspendus,
      moderateurs,
      admins,
      moyenneObjectif,
      moyenneRealise
    }
  }, [membres])

  // Toggle de tri
  const handleSort = (field: keyof Membre) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Obtenir l'icône de tri
  const getSortIcon = (field: keyof Membre) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
  }

  // Ajouter un membre
  const handleAddMembre = async (data: MembreFormData) => {
    setLoading(true)
    setBackendError(null)

    try {
      const response = await api.createBackofficeMember({
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
        mot_de_passe: data.mot_de_passe,
        role: data.role,
        statut: data.statut,
      })

      const mapped = mapBackofficeMemberToMembre(response as BackofficeMember)
      const newMembre: Membre = {
        ...mapped,
        objectifJournalier: data.objectifJournalier,
        objectifMensuel: data.objectifMensuel,
        realiseAujourdhui: 0,
        realiseMois: 0,
        badges: [],
        dateArrivee: data.dateArrivee || mapped.dateArrivee || new Date().toISOString().slice(0, 10),
      }

      setMembres((current) => [newMembre, ...current])
      setSuccessMessage(`${newMembre.nom} a été ajouté avec succès`)
      setShowAddModal(false)
    } catch (err) {
      setBackendError(err instanceof Error ? err.message : 'Impossible d’ajouter le membre.')
    } finally {
      setLoading(false)
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  // Modifier un membre
  const handleEditMembre = async (data: MembreFormData) => {
    if (!editingMembre) return
    setLoading(true)
    setBackendError(null)

    try {
      const response = await api.updateBackofficeMember(editingMembre.id, {
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
        mot_de_passe: data.mot_de_passe,
        role: data.role,
        statut: data.statut,
      })

      const mapped = mapBackofficeMemberToMembre(response as BackofficeMember)
      setMembres((current) => current.map((m) => m.id === editingMembre.id ? {
        ...m,
        ...mapped,
        objectifJournalier: data.objectifJournalier,
        objectifMensuel: data.objectifMensuel,
        dateArrivee: data.dateArrivee,
      } : m))
      setSuccessMessage(`${data.nom} a été modifié avec succès`)
      setEditingMembre(null)
    } catch (err) {
      setBackendError(err instanceof Error ? err.message : 'Impossible de modifier le membre.')
    } finally {
      setLoading(false)
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  const handleToggleStatus = async (id: string, currentStatut: Membre['statut']) => {
    const nextStatut = currentStatut === 'actif' ? 'suspended' : 'active'
    try {
      await api.updateMemberStatus(id, { statut: nextStatut })
      setMembres((current) => current.map((m) => m.id === id ? { ...m, statut: nextStatut === 'active' ? 'actif' : 'suspendu' } : m))
      setSuccessMessage(nextStatut === 'active' ? 'Membre activé.' : 'Membre suspendu.')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setBackendError(err instanceof Error ? err.message : 'Impossible de mettre à jour le statut.')
    }
  }

  // Supprimer un membre
  const handleDeleteMembre = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) return
    setLoading(true)
    setBackendError(null)

    try {
      await api.deleteBackofficeMember(id)
      setMembres((current) => current.filter((m) => m.id !== id))
      setSuccessMessage('Membre supprimé avec succès')
    } catch (err) {
      setBackendError(err instanceof Error ? err.message : 'Impossible de supprimer le membre.')
    } finally {
      setLoading(false)
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  // Mettre à jour l'objectif
  const handleUpdateObjectif = (id: string, field: 'objectifJournalier' | 'objectifMensuel', value: number) => {
    const index = membres.findIndex(m => m.id === id)
    if (index === -1) return
    
    const updatedMembres = [...membres]
    updatedMembres[index] = {
      ...updatedMembres[index],
      [field]: value
    }
    setMembres(updatedMembres)
    setSuccessMessage(`Objectif mis à jour pour ${updatedMembres[index].nom}`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  // Calcul du pourcentage d'objectif
  const getObjectifProgress = (membre: Membre) => {
    if (membre.objectifJournalier === 0) return 0
    return Math.min(100, Math.round((membre.realiseAujourdhui / membre.objectifJournalier) * 100))
  }

  // Obtenir la couleur de la barre de progression
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-brand-green'
    if (progress >= 50) return 'bg-amber-400'
    return 'bg-red-400'
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="bebas text-3xl text-white">Équipe &amp; objectifs</h1>
            <p className="text-white/50 text-sm">
              {stats.total} membres · {stats.actifs} actifs · {stats.suspendus} suspendus · {stats.moderateurs} modérateurs
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => loadMembers()}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition text-white/60"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'cards' : 'list')}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition text-white/60"
            >
              {viewMode === 'list' ? 'Vue cartes' : 'Vue liste'}
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-cyan text-[oklch(0.15_0_0)] font-bold rounded-lg hover:opacity-80 transition"
            >
              <UserPlus className="w-4 h-4" />
              Ajouter un membre
            </button>
          </div>
        </div>

        {/* Message de succès */}
        {successMessage && (
          <div className="bg-brand-green/20 border border-brand-green/30 text-brand-green px-4 py-2 rounded-lg text-sm animate-in slide-in-from-top-2">
            {successMessage}
          </div>
        )}
        {backendError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-2 rounded-lg text-sm">
            {backendError}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-brand-cyan">{stats.total}</div>
            <div className="text-xs text-white/40">Total membres</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-brand-green">{stats.actifs}</div>
            <div className="text-xs text-white/40">Actifs</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">{stats.moderateurs}</div>
            <div className="text-xs text-white/40">Modérateurs</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.admins}</div>
            <div className="text-xs text-white/40">Admins</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
            <div className="text-2xl font-bold text-brand-cyan">
              {stats.moyenneRealise}/{stats.moyenneObjectif}
            </div>
            <div className="text-xs text-white/40">Moyenne objectif/jour</div>
          </div>
        </div>

        {/* Objectifs équipe */}
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Objectifs de l'équipe</h2>
              <p className="text-white/50 text-sm">Charge les objectifs depuis le back-office et édite les cibles.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadObjectifs}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition text-white/60"
              >
                <RefreshCw className="w-4 h-4" />
                Rafraîchir
              </button>
              <button
                onClick={handleAddObjectif}
                className="px-3 py-2 bg-brand-cyan text-[oklch(0.15_0_0)] rounded-lg text-sm font-semibold hover:opacity-80 transition"
              >
                Ajouter un objectif
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-xs uppercase tracking-wider text-white/40">Libellé</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider text-white/40">Cible</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider text-white/40">Réalisé</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider text-white/40">Période</th>
                  <th className="text-left p-4 text-xs uppercase tracking-wider text-white/40">Statut</th>
                  <th className="text-right p-4 text-xs uppercase tracking-wider text-white/40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {objectifsLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-white/40">Chargement des objectifs...</td>
                  </tr>
                ) : objectifs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-white/40">Aucun objectif disponible.</td>
                  </tr>
                ) : (
                  objectifs.map((objectif) => (
                    <tr key={objectif.id_objectif} className="hover:bg-white/5 transition">
                      <td className="p-4">{objectif.libelle}</td>
                      <td className="p-4">{objectif.objectif}</td>
                      <td className="p-4">{objectif.realise}</td>
                      <td className="p-4">{objectif.periode}</td>
                      <td className="p-4">{objectif.statut}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleEditObjectif(objectif)}
                          className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 rounded-lg transition text-white/70"
                        >
                          Modifier
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
                <Search className="w-4 h-4 text-white/40" />
                <input
                  placeholder="Rechercher un membre..."
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

              <div className="flex gap-2 flex-wrap ml-auto">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                >
                  {roles.map(role => (
                    <option key={role} value={role} className="bg-[oklch(0.22_0.005_260)]">
                      {role === 'tous' ? 'Tous les rôles' : 
                        role === 'moderateur' ? 'Modérateurs' :
                        role === 'admin' ? 'Admins' : 'Super Admins'}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatut}
                  onChange={(e) => setFilterStatut(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                >
                  {statuts.map(statut => (
                    <option key={statut} value={statut} className="bg-[oklch(0.22_0.005_260)]">
                      {statut === 'tous' ? 'Tous les statuts' :
                        statut === 'actif' ? 'Actifs' :
                        statut === 'suspendu' ? 'Suspendus' : 'Inactifs'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Vue Liste */}
          {viewMode === 'list' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th 
                      className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-white/70"
                      onClick={() => handleSort('nom')}
                    >
                      <div className="flex items-center gap-1">
                        Membre {getSortIcon('nom')}
                      </div>
                    </th>
                    <th 
                      className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-white/70"
                      onClick={() => handleSort('role')}
                    >
                      <div className="flex items-center gap-1">
                        Rôle {getSortIcon('role')}
                      </div>
                    </th>
                    <th 
                      className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-white/70"
                      onClick={() => handleSort('statut')}
                    >
                      <div className="flex items-center gap-1">
                        Statut {getSortIcon('statut')}
                      </div>
                    </th>
                    <th 
                      className="text-center p-3 text-white/40 font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-white/70"
                      onClick={() => handleSort('objectifJournalier')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Objectif/jour {getSortIcon('objectifJournalier')}
                      </div>
                    </th>
                    <th 
                      className="text-center p-3 text-white/40 font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-white/70"
                      onClick={() => handleSort('realiseAujourdhui')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Aujourd'hui {getSortIcon('realiseAujourdhui')}
                      </div>
                    </th>
                    <th 
                      className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-white/70"
                      onClick={() => handleSort('performance')}
                    >
                      <div className="flex items-center gap-1">
                        Performance {getSortIcon('performance')}
                      </div>
                    </th>
                    <th className="text-center p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredMembres.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-white/40">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Aucun membre trouvé</p>
                      </td>
                    </tr>
                  ) : (
                    filteredMembres.map((m) => {
                      const progress = getObjectifProgress(m)
                      return (
                        <tr key={m.id} className="hover:bg-white/5 transition">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-[oklch(0.15_0_0)] text-xs font-bold flex-shrink-0">
                                {m.nom[0]}
                              </div>
                              <div>
                                <div className="font-medium">{m.nom}</div>
                                <div className="text-white/40 text-xs">{m.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <RoleBadge role={m.role} />
                          </td>
                          <td className="p-3">
                            <StatusBadge statut={m.statut} />
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-medium">{m.objectifJournalier}</span>
                              <button
                                onClick={() => {
                                  const newVal = prompt('Nouvel objectif journalier:', String(m.objectifJournalier))
                                  if (newVal && !isNaN(parseInt(newVal))) {
                                    handleUpdateObjectif(m.id, 'objectifJournalier', parseInt(newVal))
                                  }
                                }}
                                className="text-white/30 hover:text-white/60 transition"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center">
                              <span className={`font-bold ${
                                progress >= 80 ? 'text-brand-green' :
                                progress >= 50 ? 'text-amber-400' : 'text-red-400'
                              }`}>
                                {m.realiseAujourdhui}
                              </span>
                              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                                <div 
                                  className={`h-full rounded-full ${getProgressColor(progress)}`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-white/40">{progress}%</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-white/60">
                                {m.performance.tauxValidation > 0 ? `${m.performance.tauxValidation}%` : '-'}
                              </span>
                              <span className="text-white/40">·</span>
                              <span className="text-white/60">
                                {m.performance.tempsMoyen > 0 ? `${m.performance.tempsMoyen}min` : '-'}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-1">
                              <button 
                                onClick={() => setEditingMembre(m)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4 text-white/40" />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(m.id, m.statut)}
                                className={`p-1.5 rounded-lg transition ${m.statut === 'actif' ? 'hover:bg-red-500/20' : 'hover:bg-brand-green/20'}`}
                                title={m.statut === 'actif' ? 'Suspendre' : 'Activer'}
                              >
                                {m.statut === 'actif' ? (
                                  <UserX className="w-4 h-4 text-red-400/60" />
                                ) : (
                                  <UserCheck className="w-4 h-4 text-brand-green" />
                                )}
                              </button>
                              {m.role !== 'super_admin' && (
                                <button 
                                  onClick={() => handleDeleteMembre(m.id)}
                                  className="p-1.5 hover:bg-red-500/20 rounded-lg transition"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4 text-red-400/60" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Vue Cartes */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredMembres.length === 0 ? (
                <div className="col-span-full text-center py-12 text-white/40">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Aucun membre trouvé</p>
                </div>
              ) : (
                filteredMembres.map((m) => {
                  const progress = getObjectifProgress(m)
                  return (
                    <div key={m.id} className="bg-[oklch(0.24_0.005_260)] border border-white/10 rounded-xl p-4 hover:border-white/20 transition">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-[oklch(0.15_0_0)] text-lg font-bold flex-shrink-0">
                            {m.nom[0]}
                          </div>
                          <div>
                            <div className="font-semibold">{m.nom}</div>
                            <div className="text-white/40 text-xs">{m.email}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <RoleBadge role={m.role} />
                          <StatusBadge statut={m.statut} />
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Objectif aujourd'hui</span>
                          <span className="font-bold">
                            {m.realiseAujourdhui} / {m.objectifJournalier}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-1">
                          <div 
                            className={`h-full rounded-full ${getProgressColor(progress)}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-white/40 mt-1">
                          <span>{progress}%</span>
                          <span>Objectif mensuel: {m.objectifMensuel}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-white/5 rounded-lg p-2">
                          <div className="text-white/40">Validation</div>
                          <div className="font-bold text-brand-cyan">
                            {m.performance.tauxValidation > 0 ? `${m.performance.tauxValidation}%` : '-'}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2">
                          <div className="text-white/40">Temps moyen</div>
                          <div className="font-bold text-amber-400">
                            {m.performance.tempsMoyen > 0 ? `${m.performance.tempsMoyen}min` : '-'}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2">
                          <div className="text-white/40">Annonces</div>
                          <div className="font-bold text-brand-green">
                            {m.performance.annoncesTraitees}
                          </div>
                        </div>
                      </div>

                      {m.badges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {m.badges.map((badge, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                              <Star className="w-3 h-3" />
                              {badge}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                        <button 
                          onClick={() => setEditingMembre(m)}
                          className="flex-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/60 transition"
                        >
                          <Edit className="w-3 h-3 inline mr-1" />
                          Modifier
                        </button>
                        {m.role !== 'super_admin' && (
                          <button 
                            onClick={() => handleDeleteMembre(m.id)}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-xs text-red-400 transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          <div className="p-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-white/40">
            <span>Total: {filteredMembres.length} membres</span>
            <span>·</span>
            <span>Actifs: {filteredMembres.filter(m => m.statut === 'actif').length}</span>
            <span>·</span>
            <span>Suspendus: {filteredMembres.filter(m => m.statut === 'suspendu').length}</span>
            <span className="ml-auto">
              Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
            </span>
          </div>
        </div>
      </div>

      {showAddModal && (
        <MembreModal 
          onClose={() => setShowAddModal(false)}
          onSave={handleAddMembre}
        />
      )}

      {editingMembre && (
        <MembreModal 
          membre={editingMembre}
          onClose={() => setEditingMembre(null)}
          onSave={handleEditMembre}
        />
      )}
    </AdminLayout>
  )
}