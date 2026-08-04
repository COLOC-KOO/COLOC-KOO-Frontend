// src/pages/admin/AdminBooster.tsx
import React, { useEffect, useMemo, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { api } from '../../lib/api'
import {
  Search,
  Plus,
  X,
  RefreshCw,
  CheckCircle,
  XCircle,
  Trash2,
  Info,
  Zap,
  TrendingUp,
  Edit,
  Power,
  AlertCircle,
  Loader2,
  Rocket,
  Siren,
} from 'lucide-react'

// ============================================================================
//  INTERFACES
// ============================================================================

interface ServiceBooster {
  id_booster: number
  cle_service: string
  nom: string
  description: string | null
  duree: number
  prix: number
  unite: string
  est_actif: 0 | 1
  date_creation: string
}

interface BoosterFormData {
  nom: string
  description: string
  duree: number
  prix: number
  unite: string
  est_actif: boolean
}

// ============================================================================
//  COMPOSANT : MODALE D'AJOUT/MODIFICATION (générique, réutilisée par les 2 sections)
// ============================================================================

const BoosterModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  loading,
  sectionLabel,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (data: BoosterFormData) => void
  initialData?: BoosterFormData | null
  loading: boolean
  sectionLabel: string
}) => {
  const [nom, setNom] = useState('')
  const [description, setDescription] = useState('')
  const [duree, setDuree] = useState(1)
  const [prix, setPrix] = useState(5000)
  const [unite, setUnite] = useState('jour')
  const [estActif, setEstActif] = useState(true)

  useEffect(() => {
    if (initialData) {
      setNom(initialData.nom || '')
      setDescription(initialData.description || '')
      setDuree(initialData.duree || 1)
      setPrix(initialData.prix || 0)
      setUnite(initialData.unite || 'jour')
      setEstActif(initialData.est_actif ?? true)
    } else {
      setNom('')
      setDescription('')
      setDuree(1)
      setPrix(5000)
      setUnite('jour')
      setEstActif(true)
    }
  }, [initialData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nom.trim()) {
      alert('Veuillez saisir un nom pour l\'offre')
      return
    }
    if (prix <= 0) {
      alert('Le prix doit être supérieur à 0')
      return
    }
    if (duree <= 0) {
      alert('La duree doit etre superieure a 0')
      return
    }
    onSave({
      nom: nom.trim(),
      description: description.trim(),
      duree,
      prix,
      unite,
      est_actif: estActif,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-brand-cyan" />
            <h3 className="text-xl font-bold">
              {initialData ? `Modifier l'offre (${sectionLabel})` : `Ajouter une offre (${sectionLabel})`}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Nom de l'offre *</label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50 text-white"
              placeholder="Ex: Boost Premium 7 jours"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50 text-white"
              placeholder="Description de l'offre..."
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Duree</label>
            <input
              type="number"
              min="1"
              required
              value={duree}
              onChange={(e) => setDuree(parseInt(e.target.value) || 1)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Prix (MGA)</label>
            <input
              type="number"
              min="1"
              required
              value={prix}
              onChange={(e) => setPrix(parseInt(e.target.value) || 0)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Unité</label>
            <select
              value={unite}
              onChange={(e) => setUnite(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50 text-white"
            >
              <option value="heure" className="bg-[oklch(0.22_0.005_260)]">Heure</option>
              <option value="jour" className="bg-[oklch(0.22_0.005_260)]">Jour</option>
              <option value="semaine" className="bg-[oklch(0.22_0.005_260)]">Semaine</option>
              <option value="mois" className="bg-[oklch(0.22_0.005_260)]">Mois</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-white/60">Actif</label>
            <button
              type="button"
              onClick={() => setEstActif(!estActif)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                estActif ? 'bg-brand-cyan' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  estActif ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-brand-cyan text-[oklch(0.15_0_0)] font-bold px-4 py-2 rounded-lg hover:opacity-80 transition disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 inline mr-2 animate-spin" /> Enregistrement…</>
              ) : (
                <><CheckCircle className="w-4 h-4 inline mr-2" /> {initialData ? 'Modifier' : 'Ajouter'}</>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition text-white/60"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================================================
//  COMPOSANT : UNE SECTION CRUD COMPLÈTE (stats + recherche + tableau)
//  Réutilisé pour "Boost Annonce" (boost_) et "Annonce urgente" (boosturgent_)
// ============================================================================

function BoosterSection({
  title,
  icon: Icon,
  accentClass,
  keyPrefix,
  items,
  globalLoading,
  onCreate,
  onEdit,
  onDelete,
  onToggle,
  infoText,
}: {
  title: string
  icon: React.ElementType
  accentClass: string
  keyPrefix: string
  items: ServiceBooster[]
  globalLoading: boolean
  onCreate: (data: BoosterFormData, keyPrefix: string) => Promise<void>
  onEdit: (id: number, data: BoosterFormData) => Promise<void>
  onDelete: (id: number, nom: string) => Promise<void>
  onToggle: (id: number, currentStatus: 0 | 1, nom: string) => Promise<void>
  infoText: React.ReactNode
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterActif, setFilterActif] = useState<string>('tous')
  const [showModal, setShowModal] = useState(false)
  const [editingBooster, setEditingBooster] = useState<ServiceBooster | null>(null)
  const [localLoading, setLocalLoading] = useState(false)

  const filteredBoosters = items.filter((b) => {
    const matchSearch =
      b.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchActif =
      filterActif === 'tous' ||
      (filterActif === 'actif' && b.est_actif === 1) ||
      (filterActif === 'inactif' && b.est_actif === 0)
    return matchSearch && matchActif
  })

  const stats = {
    total: items.length,
    actif: items.filter((b) => b.est_actif === 1).length,
    inactif: items.filter((b) => b.est_actif === 0).length,
    prixMoyen: items.length > 0 ? Math.round(items.reduce((sum, b) => sum + b.prix, 0) / items.length) : 0,
  }

  const openEditModal = (booster: ServiceBooster) => {
    setEditingBooster(booster)
    setShowModal(true)
  }

  const openAddModal = () => {
    setEditingBooster(null)
    setShowModal(true)
  }

  const handleModalSave = async (data: BoosterFormData) => {
    setLocalLoading(true)
    try {
      if (editingBooster) {
        await onEdit(editingBooster.id_booster, data)
      } else {
        await onCreate(data, keyPrefix)
      }
      setShowModal(false)
      setEditingBooster(null)
    } finally {
      setLocalLoading(false)
    }
  }

  const isBusy = globalLoading || localLoading

  return (
    <div className="space-y-4">
      {/* En-tête de section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <Icon className={`w-7 h-7 ${accentClass}`} />
            <h2 className="bebas text-2xl text-white">{title}</h2>
          </div>
          <p className="text-white/50 text-sm mt-1">
            {stats.total} offres · {stats.actif} actives · {stats.inactif} inactives
            {stats.prixMoyen > 0 && ` · Prix moyen: ${stats.prixMoyen.toLocaleString('fr-FR')} MGA`}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-3 py-2 bg-brand-cyan text-[oklch(0.15_0_0)] font-medium rounded-lg text-sm hover:opacity-80 transition"
        >
          <Plus className="w-4 h-4" />
          Ajouter une offre
        </button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <Zap className="w-4 h-4 text-brand-cyan" />
            Total
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <CheckCircle className="w-4 h-4 text-brand-green" />
            Actives
          </div>
          <div className="text-2xl font-bold text-brand-green">{stats.actif}</div>
        </div>
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <XCircle className="w-4 h-4 text-red-400" />
            Inactives
          </div>
          <div className="text-2xl font-bold text-red-400">{stats.inactif}</div>
        </div>
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <TrendingUp className="w-4 h-4 text-brand-cyan" />
            Prix moyen
          </div>
          <div className="text-xl font-bold text-brand-cyan">
            {stats.prixMoyen > 0 ? `${stats.prixMoyen.toLocaleString('fr-FR')} Ar` : '-'}
          </div>
        </div>
      </div>

      {/* Tableau des offres */}
      <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl overflow-hidden">
        {/* Barre de recherche */}
        <div className="p-4 border-b border-white/10">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
              <Search className="w-4 h-4 text-white/40" />
              <input
                placeholder="Rechercher une offre..."
                className="flex-1 bg-transparent outline-none text-sm text-white"
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

            <div className="flex gap-2 ml-auto">
              <select
                value={filterActif}
                onChange={(e) => setFilterActif(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-brand-cyan/50"
              >
                <option value="tous" className="bg-[oklch(0.22_0.005_260)]">Tous les statuts</option>
                <option value="actif" className="bg-[oklch(0.22_0.005_260)]">Actifs</option>
                <option value="inactif" className="bg-[oklch(0.22_0.005_260)]">Inactifs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des offres */}
        {globalLoading && items.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin" />
            <p className="text-sm">Chargement des offres...</p>
          </div>
        ) : filteredBoosters.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            <Icon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Aucune offre trouvée</p>
            {items.length === 0 && (
              <button
                onClick={openAddModal}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-cyan text-[oklch(0.15_0_0)] rounded-lg text-sm hover:opacity-80 transition"
              >
                <Plus className="w-4 h-4" />
                Créer la première offre
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                    Offre
                  </th>
                  <th className="text-right p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                    Prix (MGA)
                  </th>
                  <th className="text-center p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                    Duree
                  </th>
                  <th className="text-center p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                    Unité
                  </th>
                  <th className="text-center p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="text-center p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                    Clé
                  </th>
                  <th className="text-center p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBoosters.map((booster) => (
                  <tr key={booster.id_booster} className="hover:bg-white/5 transition">
                    <td className="p-3">
                      <div className="font-medium text-white">{booster.nom}</div>
                      {booster.description && (
                        <div className="text-xs text-white/40 mt-0.5">{booster.description}</div>
                      )}
                    </td>
                    <td className="p-3 text-right font-bold text-brand-cyan tabular-nums">
                      {booster.prix.toLocaleString('fr-FR')}
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-xs font-semibold text-white">{booster.duree}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-xs text-white/60 capitalize">{booster.unite}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                        booster.est_actif === 1
                          ? 'bg-green-500/15 text-green-400 border-green-500/30'
                          : 'bg-red-500/15 text-red-400 border-red-500/30'
                      }`}>
                        {booster.est_actif === 1 ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-[10px] font-mono text-white/30">
                        {booster.cle_service}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onToggle(booster.id_booster, booster.est_actif, booster.nom)}
                          className={`p-1.5 rounded-lg transition ${
                            booster.est_actif === 1
                              ? 'hover:bg-red-500/20 text-red-400/60'
                              : 'hover:bg-green-500/20 text-green-400/60'
                          }`}
                          title={booster.est_actif === 1 ? 'Désactiver' : 'Activer'}
                          disabled={isBusy}
                        >
                          {booster.est_actif === 1 ? <Power className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEditModal(booster)}
                          className="p-1.5 hover:bg-blue-500/20 rounded-lg transition text-blue-400/60"
                          title="Modifier"
                          disabled={isBusy}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(booster.id_booster, booster.nom)}
                          className="p-1.5 hover:bg-red-500/20 rounded-lg transition text-red-400/60"
                          title="Supprimer"
                          disabled={isBusy}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pied de tableau */}
        <div className="p-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-white/40">
          <span>{filteredBoosters.length} offre{filteredBoosters.length > 1 ? 's' : ''}</span>
          <span>·</span>
          <span className="text-brand-green">
            {filteredBoosters.filter((b) => b.est_actif === 1).length} active
            {filteredBoosters.filter((b) => b.est_actif === 1).length > 1 ? 's' : ''}
          </span>
          <span>·</span>
          <span className="text-red-400">
            {filteredBoosters.filter((b) => b.est_actif === 0).length} inactive
            {filteredBoosters.filter((b) => b.est_actif === 0).length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Note d'information */}
      <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-white/40">{infoText}</div>
        </div>
      </div>

      {/* Modale d'ajout/modification (propre à cette section) */}
      <BoosterModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingBooster(null)
        }}
        onSave={handleModalSave}
        initialData={editingBooster ? {
          nom: editingBooster.nom,
          description: editingBooster.description || '',
          duree: editingBooster.duree,
          prix: editingBooster.prix,
          unite: editingBooster.unite,
          est_actif: editingBooster.est_actif === 1,
        } : null}
        loading={isBusy}
        sectionLabel={title}
      />
    </div>
  )
}

// ============================================================================
//  COMPOSANT PRINCIPAL
// ============================================================================

export default function AdminBooster() {
  // On charge UNE fois tous les services (services_ckoo) puis on les
  // répartit entre les 2 sections par préfixe de cle_service.
  const [allServices, setAllServices] = useState<ServiceBooster[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadServices = async () => {
    setLoading(true)
    setError(null)
    try {
      const services = await api.backofficeBoosters()

      const normalized = (services || [])
        .filter((s: any) => s.cle_service && (
          s.cle_service.startsWith('boost_') || s.cle_service.startsWith('boosturgent_')
        ))
        .map((s: any) => ({
          id_booster: s.id_booster ?? s.id_service,
          cle_service: s.cle_service || '',
          nom: s.nom || 'Service sans nom',
          description: s.description || null,
          duree: Number(s.duree || 1),
          prix: Number(s.prix || 0),
          unite: s.unite || 'jour',
          est_actif: s.est_actif || 0,
          date_creation: s.date_creation || new Date().toISOString(),
        }))

      setAllServices(normalized)
    } catch (err) {
      console.error('❌ Erreur:', err)
      setError(err instanceof Error ? err.message : 'Impossible de charger les offres')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  // Répartition boost_ (hors boosturgent_) / boosturgent_
  const boostItems = useMemo(
    () => allServices.filter((s) => s.cle_service.startsWith('boost_') && !s.cle_service.startsWith('boosturgent_')),
    [allServices],
  )
  const urgentItems = useMemo(
    () => allServices.filter((s) => s.cle_service.startsWith('boosturgent_')),
    [allServices],
  )

  const flashSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  // ================================================================
  //  FONCTIONS D'ACTION (partagées par les 2 sections)
  // ================================================================

  const handleCreate = async (data: BoosterFormData, keyPrefix: string) => {
    setError(null)
    try {
      const cleService = `${keyPrefix}${Date.now()}`
      await api.createBooster({
        cle_service: cleService,
        nom: data.nom,
        description: data.description || '',
        duree: data.duree || 1,
        prix: data.prix,
        unite: (data.unite || 'jour') as any,
        est_actif: data.est_actif ? 1 : 0,
      })
      await loadServices()
      flashSuccess(`Offre "${data.nom}" ajoutée avec succès`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible d\'ajouter l\'offre')
      throw err
    }
  }

  const handleEdit = async (id: number, data: BoosterFormData) => {
    setError(null)
    try {
      await api.updateBooster(String(id), {
        nom: data.nom,
        description: data.description || '',
        duree: data.duree || 1,
        prix: data.prix,
        unite: (data.unite || 'jour') as any,
        est_actif: data.est_actif ? 1 : 0,
      })
      await loadServices()
      flashSuccess(`Offre "${data.nom}" modifiée avec succès`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de modifier l\'offre')
      throw err
    }
  }

  const handleDelete = async (id: number, nom: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'offre "${nom}" ?`)) return
    setLoading(true)
    setError(null)
    try {
      await api.deleteBooster(String(id))
      await loadServices()
      flashSuccess(`Offre "${nom}" supprimée avec succès`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de supprimer l\'offre')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (id: number, currentStatus: 0 | 1, nom: string) => {
    const newStatus = currentStatus === 1 ? 0 : 1
    setLoading(true)
    setError(null)
    try {
      await api.updateBooster(String(id), { est_actif: newStatus })
      await loadServices()
      flashSuccess(`Offre "${nom}" ${newStatus === 1 ? 'activée' : 'désactivée'}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de changer le statut')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadServices()
  }

  // ================================================================
  //  RENDU
  // ================================================================

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* En-tête global */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Rocket className="w-8 h-8 text-brand-cyan" />
              <h1 className="bebas text-3xl text-white">Boosters d'annonces</h1>
            </div>
            <p className="text-white/50 text-sm mt-1">
              Gestion des offres "Boost Annonce" et "Annonce Urgente"
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition text-white/60"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {/* Messages globaux */}
        {successMessage && (
          <div className="bg-brand-green/20 border border-brand-green/30 text-brand-green px-4 py-2 rounded-lg text-sm animate-in slide-in-from-top-2">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-2 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 inline mr-2" />
            {error}
          </div>
        )}

        {/* ===== SECTION 1 : BOOST ANNONCE (cle_service = boost_...) ===== */}
        <BoosterSection
          title="Boost Annonce"
          icon={Rocket}
          accentClass="text-brand-cyan"
          keyPrefix="boost_"
          items={boostItems}
          globalLoading={loading}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
          infoText={
            <>
              Les offres de <b className="text-brand-cyan">Boost Annonce</b> permettent aux utilisateurs de remonter leur annonce dans les résultats de recherche. Seules les offres avec une clé commençant par <b className="text-brand-cyan">"boost_"</b> apparaissent ici.
            </>
          }
        />

        {/* Séparateur */}
        <div className="border-t border-white/10" />

        {/* ===== SECTION 2 : ANNONCE URGENTE (cle_service = boosturgent_...) ===== */}
        <BoosterSection
          title="Annonce Urgente"
          icon={Siren}
          accentClass="text-orange-400"
          keyPrefix="boosturgent_"
          items={urgentItems}
          globalLoading={loading}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
          infoText={
            <>
              Les offres <b className="text-orange-400">Annonce Urgente</b> permettent de ressortir dans les résultats et de profiter du filtre "urgent". Seules les offres avec une clé commençant par <b className="text-orange-400">"boosturgent_"</b> apparaissent ici.
            </>
          }
        />
      </div>
    </AdminLayout>
  )
}

