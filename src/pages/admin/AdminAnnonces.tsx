import React, { useEffect, useMemo, useState } from 'react'
import { CheckCircle, Eye, Pencil, RefreshCw, Search, Save, Trash2, X, XCircle } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { ApiAnnonce, api } from '../../lib/api'
import { formatAr } from '../../lib/utils'

const filters = [
  { label: 'Toutes', value: 'all' },
  { label: 'Actives', value: 'active' },
  { label: 'En attente', value: 'pending' },
  { label: 'Rejetees', value: 'rejected' },
]

export default function AdminAnnonces() {
  const [active, setActive] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [annonces, setAnnonces] = useState<ApiAnnonce[]>([])
  const [selectedAnnonce, setSelectedAnnonce] = useState<ApiAnnonce | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [editForm, setEditForm] = useState({ titre: '', description: '', prix_loyer: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAnnonces = () => {
    setLoading(true)
    setError('')
    api
      .annonces({ statut: 'all' })
      .then(setAnnonces)
      .catch((err) => setError(err instanceof Error ? err.message : 'Chargement impossible'))
      .finally(() => setLoading(false))
  }

  useEffect(loadAnnonces, [])

  const filteredAnnonces = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return annonces.filter((annonce) => {
      const matchesSearch =
        annonce.titre.toLowerCase().includes(term) ||
        (annonce.ville || '').toLowerCase().includes(term) ||
        (annonce.auteur || '').toLowerCase().includes(term) ||
        (annonce.reference || '').toLowerCase().includes(term)
      const matchesFilter = active === 'all' || annonce.statut === active
      return matchesSearch && matchesFilter
    })
  }, [active, annonces, searchTerm])

  async function changeStatus(annonce: ApiAnnonce, statut: 'active' | 'pending' | 'rejected') {
    const updated = await api.updateAnnonceStatus(annonce.id, statut)
    setAnnonces((current) => current.map((item) => (item.id === annonce.id ? updated : item)))
    setShowRejectionModal(false)
    setSelectedAnnonce(null)
    setRejectionReason('')
  }

  function openEdit(annonce: ApiAnnonce) {
    setSelectedAnnonce(annonce)
    setEditForm({
      titre: annonce.titre,
      description: annonce.description || '',
      prix_loyer: String(annonce.chambre?.prix_loyer || ''),
    })
    setShowEditModal(true)
  }

  async function saveEdit() {
    if (!selectedAnnonce) return
    const updated = await api.updateAnnonce(selectedAnnonce.id, {
      titre: editForm.titre,
      description: editForm.description,
    })
    setAnnonces((current) => current.map((item) => (item.id === selectedAnnonce.id ? updated : item)))
    setShowEditModal(false)
    setSelectedAnnonce(null)
  }

  async function confirmDelete() {
    if (!selectedAnnonce) return
    await api.deleteAnnonce(selectedAnnonce.id)
    setAnnonces((current) => current.filter((item) => item.id !== selectedAnnonce.id))
    setShowDeleteModal(false)
    setSelectedAnnonce(null)
  }

  const stats = {
    pending: annonces.filter((a) => a.statut === 'pending').length,
    active: annonces.filter((a) => a.statut === 'active').length,
    rejected: annonces.filter((a) => a.statut === 'rejected').length,
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="bebas text-3xl text-white">Annonces</h1>
            <p className="text-white/50 text-sm">
              <span className="text-brand-yellow">{stats.pending}</span> en attente ·
              <span className="text-brand-green ml-1">{stats.active}</span> actives ·
              <span className="text-brand-magenta ml-1">{stats.rejected}</span> rejetees
            </p>
          </div>
          <button
            onClick={loadAnnonces}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/80 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition"
          >
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-200">{error}</div>}

        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl">
          <div className="p-4 border-b border-white/10 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1 min-w-[200px] max-w-xs">
              <Search className="w-4 h-4 text-white/40" />
              <input
                placeholder="Rechercher..."
                className="flex-1 bg-transparent outline-none text-sm text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-1 ml-auto overflow-x-auto">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActive(filter.value)}
                  className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition ${
                    active === filter.value ? 'bg-brand-cyan text-[oklch(0.15_0_0)] font-semibold' : 'text-white/60 hover:bg-white/5'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-white/40 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 font-medium">Annonce</th>
                  <th className="text-left font-medium">Ville</th>
                  <th className="text-left font-medium">Prix</th>
                  <th className="text-left font-medium">Proprietaire</th>
                  <th className="text-left font-medium">Statut</th>
                  <th className="text-left font-medium">Date</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnnonces.map((annonce) => (
                  <tr key={annonce.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={annonce.photos[0] || 'https://picsum.photos/seed/colockoo/200/200'}
                          className="w-10 h-10 rounded-lg object-cover"
                          alt=""
                        />
                        <div className="min-w-0">
                          <div className="font-medium truncate max-w-[260px] text-white">{annonce.titre}</div>
                          <div className="text-xs text-white/40">{annonce.reference}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-white/70">{annonce.ville}</td>
                    <td className="text-white/70 font-semibold">{formatAr(Number(annonce.chambre?.prix_loyer || 0))}</td>
                    <td className="text-white/70">{annonce.auteur || '-'}</td>
                    <td>
                      <StatusBadge status={annonce.statut} />
                    </td>
                    <td className="text-white/50 text-xs">{new Date(annonce.date_creation).toLocaleDateString('fr-FR')}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1 flex-wrap">
                        <button onClick={() => { setSelectedAnnonce(annonce); setShowViewModal(true) }} className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white" title="Voir">
                          <Eye className="w-4 h-4" />
                        </button>
                        {annonce.statut === 'pending' && (
                          <>
                            <button onClick={() => changeStatus(annonce, 'active')} className="p-1.5 hover:bg-white/10 rounded text-brand-green" title="Valider">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => { setSelectedAnnonce(annonce); setShowRejectionModal(true) }} className="p-1.5 hover:bg-white/10 rounded text-brand-magenta" title="Refuser">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {annonce.statut === 'active' && (
                          <button onClick={() => openEdit(annonce)} className="p-1.5 hover:bg-white/10 rounded text-brand-cyan" title="Modifier">
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {annonce.statut === 'rejected' && (
                          <button onClick={() => changeStatus(annonce, 'pending')} className="p-1.5 hover:bg-white/10 rounded text-brand-yellow" title="Reactiver">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => { setSelectedAnnonce(annonce); setShowDeleteModal(true) }} className="p-1.5 hover:bg-white/10 rounded text-brand-magenta" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredAnnonces.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-white/40">Aucune annonce trouvee</td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-white/40">Chargement...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showViewModal && selectedAnnonce && (
        <Modal title="Details de l'annonce" onClose={() => setShowViewModal(false)}>
          <img src={selectedAnnonce.photos[0] || 'https://picsum.photos/seed/colockoo/900/400'} className="w-full h-48 object-cover rounded-lg" alt="" />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Info label="Titre" value={selectedAnnonce.titre} />
            <Info label="Ville" value={selectedAnnonce.ville} />
            <Info label="Prix" value={formatAr(Number(selectedAnnonce.chambre?.prix_loyer || 0))} />
            <Info label="Proprietaire" value={selectedAnnonce.auteur || '-'} />
          </div>
          <p className="mt-4 text-sm text-white/70">{selectedAnnonce.description || 'Aucune description.'}</p>
        </Modal>
      )}

      {showRejectionModal && selectedAnnonce && (
        <Modal title="Refuser l'annonce" onClose={() => setShowRejectionModal(false)} narrow>
          <p className="text-white/60 text-sm mb-4">{selectedAnnonce.titre}</p>
          <label className="block text-sm text-white/60 mb-2">Motif du rejet</label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-brand-magenta transition resize-none text-white"
            rows={4}
          />
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowRejectionModal(false)} className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80">Annuler</button>
            <button onClick={() => changeStatus(selectedAnnonce, 'rejected')} className="flex-1 px-4 py-2 bg-brand-magenta text-white rounded-lg text-sm font-semibold">Refuser</button>
          </div>
        </Modal>
      )}

      {showEditModal && selectedAnnonce && (
        <Modal title="Modifier l'annonce" onClose={() => setShowEditModal(false)}>
          <div className="space-y-4">
            <EditInput label="Titre" value={editForm.titre} onChange={(value) => setEditForm({ ...editForm, titre: value })} />
            <div>
              <label className="block text-sm text-white/60 mb-1">Description</label>
              <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-white" rows={3} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80">Annuler</button>
              <button onClick={saveEdit} className="flex-1 px-4 py-2 bg-brand-cyan text-[oklch(0.15_0_0)] rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Enregistrer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showDeleteModal && selectedAnnonce && (
        <Modal title="Supprimer l'annonce" onClose={() => setShowDeleteModal(false)} narrow>
          <p className="text-white/60 text-sm">Supprimer definitivement "{selectedAnnonce.titre}" ?</p>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80">Annuler</button>
            <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-brand-magenta text-white rounded-lg text-sm font-semibold">Supprimer</button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  )
}

function StatusBadge({ status }: { status: ApiAnnonce['statut'] }) {
  const config = {
    active: ['Validee', 'text-brand-green border-brand-green/30 bg-brand-green/10'],
    pending: ['En attente', 'text-brand-yellow border-brand-yellow/30 bg-brand-yellow/10'],
    rejected: ['Rejetee', 'text-brand-magenta border-brand-magenta/30 bg-brand-magenta/10'],
    archived: ['Archivee', 'text-white/60 border-white/20 bg-white/5'],
    expired: ['Expiree', 'text-white/60 border-white/20 bg-white/5'],
    en_attente: ['En attente', 'text-brand-yellow border-brand-yellow/30 bg-brand-yellow/10'],
    refusee: ['Refusee', 'text-brand-magenta border-brand-magenta/30 bg-brand-magenta/10'],
    terminee: ['Terminee', 'text-brand-green border-brand-green/30 bg-brand-green/10'],
  } as const
  const [text, className] = config[status] || config.pending
  return <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${className}`}>{text}</span>
}

function Modal({ title, children, onClose, narrow = false }: { title: string; children: React.ReactNode; onClose: () => void; narrow?: boolean }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className={`bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl ${narrow ? 'max-w-md' : 'max-w-2xl'} w-full max-h-[90vh] overflow-y-auto p-6`}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-white/70">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-white/40 text-xs">{label}</label>
      <p className="font-medium text-white">{value}</p>
    </div>
  )
}

function EditInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="block text-sm text-white/60 mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-white" />
    </div>
  )
}
