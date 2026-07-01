import React, { useState } from 'react'
import { 
  Eye, Filter, Plus, Search, SquarePen, Trash2, CheckCircle, 
  XCircle, Clock, Save, X, ArrowLeft, Pencil, RefreshCw 
} from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { listings as initialListings } from '../../data/mockData'
import { formatAr } from '../../lib/utils'

const filters = ['Toutes', 'Actives', 'En attente', 'Rejetées']

type AnnonceStatus = 'active' | 'pending' | 'rejected'

interface Annonce {
  id: string
  title: string
  description: string
  image: string
  city: string
  price: number
  owner: {
    name: string
    email: string
    phone: string
  }
  status: AnnonceStatus
  pendingSince?: string
  rejectionReason?: string
  createdAt: string
  category: string
}

// Données mockées complètes
const mockListings: Annonce[] = [
  {
    id: '1',
    title: 'Appartement spacieux 3 pièces',
    description: 'Bel appartement rénové avec vue sur la ville',
    image: 'https://picsum.photos/seed/1/200/200',
    city: 'Antananarivo',
    price: 15000000,
    owner: {
      name: 'Jean Rakoto',
      email: 'jean.rakoto@email.com',
      phone: '+261 34 12 345 67'
    },
    status: 'pending',
    pendingSince: new Date(Date.now() - 86400000 * 2).toLocaleDateString('fr-FR'),
    category: 'Appartement',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: '2',
    title: 'Maison avec jardin',
    description: 'Maison individuelle avec grand jardin arboré',
    image: 'https://picsum.photos/seed/2/200/200',
    city: 'Toamasina',
    price: 25000000,
    owner: {
      name: 'Marie Rasoa',
      email: 'marie.rasoa@email.com',
      phone: '+261 32 98 765 43'
    },
    status: 'active',
    category: 'Maison',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    id: '3',
    title: 'Studio moderne centre-ville',
    description: 'Studio tout équipé en plein centre',
    image: 'https://picsum.photos/seed/3/200/200',
    city: 'Antsirabe',
    price: 8000000,
    owner: {
      name: 'Pierre Andriana',
      email: 'pierre.andriana@email.com',
      phone: '+261 33 12 345 67'
    },
    status: 'rejected',
    rejectionReason: 'Photos manquantes',
    category: 'Studio',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
  },
  {
    id: '4',
    title: 'Villa de luxe',
    description: 'Villa avec piscine et vue panoramique',
    image: 'https://picsum.photos/seed/4/200/200',
    city: 'Fianarantsoa',
    price: 45000000,
    owner: {
      name: 'Sophie Raharimanana',
      email: 'sophie.rah@email.com',
      phone: '+261 34 56 789 01'
    },
    status: 'pending',
    pendingSince: new Date(Date.now() - 86400000 * 1).toLocaleDateString('fr-FR'),
    category: 'Maison',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: '5',
    title: 'Bureau commercial',
    description: 'Espace bureau de 50m² en centre-ville',
    image: 'https://picsum.photos/seed/5/200/200',
    city: 'Antananarivo',
    price: 12000000,
    owner: {
      name: 'David Ranaivo',
      email: 'david.ranaivo@email.com',
      phone: '+261 32 12 345 67'
    },
    status: 'active',
    category: 'Bureau',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString()
  },
  {
    id: '6',
    title: 'Appartement T2',
    description: 'Appartement calme proche des commodités',
    image: 'https://picsum.photos/seed/6/200/200',
    city: 'Toamasina',
    price: 9500000,
    owner: {
      name: 'Lina Razafy',
      email: 'lina.razafy@email.com',
      phone: '+261 33 98 765 43'
    },
    status: 'rejected',
    rejectionReason: 'Prix trop élevé par rapport au marché',
    category: 'Appartement',
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString()
  },
  {
    id: '7',
    title: 'Studio étudiants',
    description: 'Studio proche université',
    image: 'https://picsum.photos/seed/7/200/200',
    city: 'Antananarivo',
    price: 5000000,
    owner: {
      name: 'Marc Randria',
      email: 'marc.randria@email.com',
      phone: '+261 34 56 789 01'
    },
    status: 'pending',
    pendingSince: new Date(Date.now() - 86400000 * 3).toLocaleDateString('fr-FR'),
    category: 'Studio',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
  },
  {
    id: '8',
    title: 'Local commercial',
    description: 'Local de 100m² pour commerce',
    image: 'https://picsum.photos/seed/8/200/200',
    city: 'Antsirabe',
    price: 18000000,
    owner: {
      name: 'Sarah Ramanantsoa',
      email: 'sarah.ramanantsoa@email.com',
      phone: '+261 32 12 345 67'
    },
    status: 'active',
    category: 'Local',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  }
]

export default function AdminAnnonces() {
  // États
  const [active, setActive] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAnnonces, setSelectedAnnonces] = useState<string[]>([])
  const [annonces, setAnnonces] = useState<Annonce[]>(mockListings)

  // États pour les modals
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showReactivateModal, setShowReactivateModal] = useState(false)
  const [selectedAnnonce, setSelectedAnnonce] = useState<Annonce | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  
  // États pour l'édition
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: '',
    city: '',
    category: ''
  })

  // Filtrer les annonces
  const filteredAnnonces = annonces.filter(annonce => {
    const matchesSearch = annonce.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         annonce.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         annonce.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         annonce.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = active === 0 || 
                         (active === 1 && annonce.status === 'active') ||
                         (active === 2 && annonce.status === 'pending') ||
                         (active === 3 && annonce.status === 'rejected')
    
    return matchesSearch && matchesFilter
  })

  // Fonctions de validation
  const validateAnnonce = (id: string) => {
    setAnnonces(prev => prev.map(annonce => 
      annonce.id === id 
        ? { ...annonce, status: 'active', pendingSince: undefined }
        : annonce
    ))
  }

  const rejectAnnonce = (id: string, reason: string) => {
    setAnnonces(prev => prev.map(annonce => 
      annonce.id === id 
        ? { ...annonce, status: 'rejected', rejectionReason: reason, pendingSince: undefined }
        : annonce
    ))
    setShowRejectionModal(false)
    setRejectionReason('')
    setSelectedAnnonce(null)
  }

  // Fonctions de modification
  const handleEdit = (annonce: Annonce) => {
    setSelectedAnnonce(annonce)
    setEditForm({
      title: annonce.title,
      description: annonce.description,
      price: annonce.price.toString(),
      city: annonce.city,
      category: annonce.category
    })
    setShowEditModal(true)
  }

  const saveEdit = () => {
    if (!selectedAnnonce) return
    
    setAnnonces(prev => prev.map(annonce => 
      annonce.id === selectedAnnonce.id 
        ? { 
            ...annonce, 
            title: editForm.title,
            description: editForm.description,
            price: parseFloat(editForm.price) || 0,
            city: editForm.city,
            category: editForm.category
          }
        : annonce
    ))
    setShowEditModal(false)
    setSelectedAnnonce(null)
  }

  // Fonctions de suppression
  const handleDelete = (annonce: Annonce) => {
    setSelectedAnnonce(annonce)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (!selectedAnnonce) return
    setAnnonces(prev => prev.filter(annonce => annonce.id !== selectedAnnonce.id))
    setShowDeleteModal(false)
    setSelectedAnnonce(null)
  }

  // Fonctions de réactivation
  const handleReactivate = (annonce: Annonce) => {
    setSelectedAnnonce(annonce)
    setShowReactivateModal(true)
  }

  const confirmReactivate = () => {
    if (!selectedAnnonce) return
    setAnnonces(prev => prev.map(annonce => 
      annonce.id === selectedAnnonce.id 
        ? { ...annonce, status: 'pending', pendingSince: new Date().toLocaleDateString('fr-FR'), rejectionReason: undefined }
        : annonce
    ))
    setShowReactivateModal(false)
    setSelectedAnnonce(null)
  }

  // Gestion sélection en masse
  const toggleAllAnnonces = () => {
    if (selectedAnnonces.length === filteredAnnonces.length) {
      setSelectedAnnonces([])
    } else {
      setSelectedAnnonces(filteredAnnonces.map(a => a.id))
    }
  }

  const validateMultipleAnnonces = () => {
    setAnnonces(prev => prev.map(annonce => 
      selectedAnnonces.includes(annonce.id) && annonce.status === 'pending'
        ? { ...annonce, status: 'active', pendingSince: undefined }
        : annonce
    ))
    setSelectedAnnonces([])
  }

  const rejectMultipleAnnonces = () => {
    setAnnonces(prev => prev.map(annonce => 
      selectedAnnonces.includes(annonce.id) && annonce.status === 'pending'
        ? { ...annonce, status: 'rejected', pendingSince: undefined, rejectionReason: 'Refusée en masse' }
        : annonce
    ))
    setSelectedAnnonces([])
  }

  const deleteMultipleAnnonces = () => {
    if (!confirm(`Supprimer ${selectedAnnonces.length} annonce(s) ?`)) return
    setAnnonces(prev => prev.filter(annonce => !selectedAnnonces.includes(annonce.id)))
    setSelectedAnnonces([])
  }

  // Statut badge
  const getStatusBadge = (status: AnnonceStatus) => {
    const statusConfig = {
      active: {
        text: 'Validée',
        className: 'text-brand-green border-brand-green/30 bg-brand-green/10'
      },
      pending: {
        text: 'En attente',
        className: 'text-brand-yellow border-brand-yellow/30 bg-brand-yellow/10'
      },
      rejected: {
        text: 'Rejetée',
        className: 'text-brand-magenta border-brand-magenta/30 bg-brand-magenta/10'
      }
    }
    return statusConfig[status] || statusConfig.pending
  }

  // Fonction pour ajouter une nouvelle annonce (placeholder)
  const handleAddNew = () => {
    const newAnnonce: Annonce = {
      id: (annonces.length + 1).toString(),
      title: 'Nouvelle annonce',
      description: 'Description de la nouvelle annonce',
      image: 'https://picsum.photos/seed/new/200/200',
      city: 'Antananarivo',
      price: 10000000,
      owner: {
        name: 'Nouveau Propriétaire',
        email: 'nouveau@email.com',
        phone: '+261 34 00 000 00'
      },
      status: 'pending',
      pendingSince: new Date().toLocaleDateString('fr-FR'),
      category: 'Appartement',
      createdAt: new Date().toISOString()
    }
    setAnnonces(prev => [...prev, newAnnonce])
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* En-tête */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="bebas text-3xl text-white">Annonces</h1>
            <p className="text-white/50 text-sm">
              <span className="text-brand-yellow">{annonces.filter(a => a.status === 'pending').length}</span> en attente · 
              <span className="text-brand-green ml-1">{annonces.filter(a => a.status === 'active').length}</span> actives · 
              <span className="text-brand-magenta ml-1">{annonces.filter(a => a.status === 'rejected').length}</span> rejetées
            </p>
          </div>
          <button 
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 bg-brand-cyan text-[oklch(0.15_0_0)] font-semibold px-4 py-2 rounded-lg text-sm hover:opacity-80 transition"
          >
            <Plus className="w-4 h-4" /> Nouvelle annonce
          </button>
        </div>

        {/* Actions en masse */}
        {selectedAnnonces.length > 0 && (
          <div className="bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg p-3 flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm">
              {selectedAnnonces.length} annonce{selectedAnnonces.length > 1 ? 's' : ''} sélectionnée{selectedAnnonces.length > 1 ? 's' : ''}
            </span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={validateMultipleAnnonces}
                className="px-3 py-1.5 bg-brand-green text-white rounded-lg text-xs font-semibold hover:opacity-80 transition flex items-center gap-1"
              >
                <CheckCircle className="w-3 h-3" /> Valider
              </button>
              <button
                onClick={rejectMultipleAnnonces}
                className="px-3 py-1.5 bg-brand-magenta text-white rounded-lg text-xs font-semibold hover:opacity-80 transition flex items-center gap-1"
              >
                <XCircle className="w-3 h-3" /> Refuser
              </button>
              <button
                onClick={deleteMultipleAnnonces}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:opacity-80 transition flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Supprimer
              </button>
            </div>
          </div>
        )}

        {/* Tableau */}
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
            <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition text-white/60">
              <Filter className="w-4 h-4" /> Filtrer
            </button>
            <div className="flex gap-1 ml-auto overflow-x-auto">
              {filters.map((f, i) => (
                <button
                  key={f}
                  onClick={() => setActive(i)}
                  className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition ${
                    active === i ? 'bg-brand-cyan text-[oklch(0.15_0_0)] font-semibold' : 'text-white/60 hover:bg-white/5'
                  }`}
                >
                  {f}
                  {i === 2 && annonces.filter(a => a.status === 'pending').length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-brand-yellow/20 text-brand-yellow rounded-full text-[10px]">
                      {annonces.filter(a => a.status === 'pending').length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-white/40 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 font-medium">
                    <input 
                      type="checkbox"
                      checked={selectedAnnonces.length === filteredAnnonces.length && filteredAnnonces.length > 0}
                      onChange={toggleAllAnnonces}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="text-left font-medium">Annonce</th>
                  <th className="text-left font-medium">Catégorie</th>
                  <th className="text-left font-medium">Prix</th>
                  <th className="text-left font-medium">Propriétaire</th>
                  <th className="text-left font-medium">Statut</th>
                  <th className="text-left font-medium">Date</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnnonces.map((l) => {
                  const status = getStatusBadge(l.status)
                  return (
                    <tr key={l.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="p-4">
                        <input 
                          type="checkbox"
                          checked={selectedAnnonces.includes(l.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAnnonces([...selectedAnnonces, l.id])
                            } else {
                              setSelectedAnnonces(selectedAnnonces.filter(id => id !== l.id))
                            }
                          }}
                          className="cursor-pointer"
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <img src={l.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                          <div className="min-w-0">
                            <div className="font-medium truncate max-w-[200px] text-white">{l.title}</div>
                            <div className="text-xs text-white/40">{l.city}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-white/70">{l.category}</td>
                      <td className="text-white/70 font-semibold">{formatAr(l.price)}</td>
                      <td>
                        <div className="text-white/70">{l.owner.name}</div>
                        <div className="text-xs text-white/40">{l.owner.email}</div>
                      </td>
                      <td>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${status.className}`}>
                          {status.text}
                        </span>
                        {l.status === 'rejected' && l.rejectionReason && (
                          <div className="text-[10px] text-white/40 mt-1 truncate max-w-[100px]" title={l.rejectionReason}>
                            {l.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="text-white/50 text-xs">
                        {l.pendingSince || new Date(l.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1 flex-wrap">
                          {/* Voir */}
                          <button 
                            onClick={() => {
                              setSelectedAnnonce(l)
                              setShowViewModal(true)
                            }}
                            className="p-1.5 hover:bg-white/10 rounded transition text-white/70 hover:text-white" 
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Actions selon statut */}
                          {l.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => validateAnnonce(l.id)}
                                className="p-1.5 hover:bg-white/10 rounded text-brand-green transition" 
                                title="Valider"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedAnnonce(l)
                                  setShowRejectionModal(true)
                                }}
                                className="p-1.5 hover:bg-white/10 rounded text-brand-magenta transition" 
                                title="Refuser"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {l.status === 'active' && (
                            <>
                              <button 
                                onClick={() => handleEdit(l)}
                                className="p-1.5 hover:bg-white/10 rounded text-brand-cyan transition" 
                                title="Modifier"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(l)}
                                className="p-1.5 hover:bg-white/10 rounded text-brand-magenta transition" 
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {l.status === 'rejected' && (
                            <>
                              <button 
                                onClick={() => handleReactivate(l)}
                                className="p-1.5 hover:bg-white/10 rounded text-brand-yellow transition" 
                                title="Réactiver"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(l)}
                                className="p-1.5 hover:bg-white/10 rounded text-brand-magenta transition" 
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredAnnonces.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-white/40">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 opacity-30" />
                        <p>Aucune annonce trouvée</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tous les modals... (les mêmes que précédemment) */}
      {/* Modal Voir */}
      {showViewModal && selectedAnnonce && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-white">Détails de l'annonce</h3>
                <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-white/10 rounded text-white/70">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <img src={selectedAnnonce.image} className="w-full h-48 object-cover rounded-lg" alt="" />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/40 text-xs">Titre</label>
                    <p className="font-medium text-white">{selectedAnnonce.title}</p>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs">Catégorie</label>
                    <p className="text-white/80">{selectedAnnonce.category}</p>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs">Prix</label>
                    <p className="text-brand-cyan font-semibold">{formatAr(selectedAnnonce.price)}</p>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs">Ville</label>
                    <p className="text-white/80">{selectedAnnonce.city}</p>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs">Propriétaire</label>
                    <p className="text-white/80">{selectedAnnonce.owner.name}</p>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs">Email</label>
                    <p className="text-sm text-white/80">{selectedAnnonce.owner.email}</p>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs">Téléphone</label>
                    <p className="text-white/80">{selectedAnnonce.owner.phone}</p>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs">Statut</label>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getStatusBadge(selectedAnnonce.status).className}`}>
                      {getStatusBadge(selectedAnnonce.status).text}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-white/40 text-xs">Description</label>
                  <p className="text-sm text-white/80">{selectedAnnonce.description}</p>
                </div>

                {selectedAnnonce.status === 'rejected' && selectedAnnonce.rejectionReason && (
                  <div className="bg-brand-magenta/10 border border-brand-magenta/30 rounded-lg p-3">
                    <label className="text-brand-magenta text-xs font-semibold">Motif du rejet</label>
                    <p className="text-sm text-white/80">{selectedAnnonce.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Refuser */}
      {showRejectionModal && selectedAnnonce && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-white">Refuser l'annonce</h3>
              <button 
                onClick={() => {
                  setShowRejectionModal(false)
                  setRejectionReason('')
                  setSelectedAnnonce(null)
                }}
                className="p-1 hover:bg-white/10 rounded text-white/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-white/60 text-sm mb-4">
              <span className="font-medium text-white">{selectedAnnonce.title}</span> - {selectedAnnonce.city}
            </p>
            
            <label className="block text-sm text-white/60 mb-2">Motif du rejet</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-brand-magenta transition resize-none text-white"
              rows={4}
              placeholder="Expliquez la raison du rejet..."
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectionModal(false)
                  setRejectionReason('')
                  setSelectedAnnonce(null)
                }}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition text-white/80"
              >
                Annuler
              </button>
              <button
                onClick={() => rejectAnnonce(selectedAnnonce.id, rejectionReason || 'Refusée sans motif')}
                className="flex-1 px-4 py-2 bg-brand-magenta text-white rounded-lg text-sm font-semibold hover:opacity-80 transition"
              >
                Refuser l'annonce
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifier */}
      {showEditModal && selectedAnnonce && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-white">Modifier l'annonce</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-white/10 rounded text-white/70">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">Titre *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan transition text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan transition resize-none text-white"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Prix (Ar) *</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan transition text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Ville *</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan transition text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-1">Catégorie</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan transition text-white"
                >
                  <option value="Appartement">Appartement</option>
                  <option value="Maison">Maison</option>
                  <option value="Studio">Studio</option>
                  <option value="Bureau">Bureau</option>
                  <option value="Local">Local commercial</option>
                </select>
              </div>
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition text-white/80"
                >
                  Annuler
                </button>
                <button
                  onClick={saveEdit}
                  className="flex-1 px-4 py-2 bg-brand-cyan text-[oklch(0.15_0_0)] rounded-lg text-sm font-semibold hover:opacity-80 transition flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Supprimer */}
      {showDeleteModal && selectedAnnonce && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-brand-magenta/10 rounded-full">
                <Trash2 className="w-6 h-6 text-brand-magenta" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">Supprimer l'annonce</h3>
                <p className="text-white/60 text-sm">
                  Êtes-vous sûr de vouloir supprimer définitivement 
                  <span className="text-white font-medium"> "{selectedAnnonce.title}"</span> ?
                </p>
                <p className="text-xs text-white/40 mt-2">Cette action est irréversible.</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition text-white/80"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-brand-magenta text-white rounded-lg text-sm font-semibold hover:opacity-80 transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Réactiver */}
      {showReactivateModal && selectedAnnonce && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-brand-yellow/10 rounded-full">
                <RefreshCw className="w-6 h-6 text-brand-yellow" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">Réactiver l'annonce</h3>
                <p className="text-white/60 text-sm">
                  Voulez-vous réactiver l'annonce 
                  <span className="text-white font-medium"> "{selectedAnnonce.title}"</span> ?
                </p>
                <p className="text-xs text-white/40 mt-2">Elle sera remise en attente de validation.</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowReactivateModal(false)}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition text-white/80"
              >
                Annuler
              </button>
              <button
                onClick={confirmReactivate}
                className="flex-1 px-4 py-2 bg-brand-yellow text-[oklch(0.15_0_0)] rounded-lg text-sm font-semibold hover:opacity-80 transition"
              >
                Réactiver
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}