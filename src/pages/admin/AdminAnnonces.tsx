import React, { useEffect, useMemo, useState } from 'react'
import { CheckCircle, ChevronLeft, ChevronRight, Eye, Pencil, RefreshCw, Search, Save, Trash2, X, XCircle, Home, Users, Ruler, Bed, Wifi, Car, Dog, Shield } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { ApiAnnonce, api } from '../../lib/api'
import { formatAr } from '../../lib/utils'
import { useAuth } from '../../lib/auth'

const filters = [
  { label: 'Toutes', value: 'all' },
  { label: 'Actives', value: 'active' },
  { label: 'En attente', value: 'pending' },
  { label: 'Rejetees', value: 'rejected' },
]

export default function AdminAnnonces() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isModerator = user?.poste === 'moderateur'
  const [searchParams, setSearchParams] = useSearchParams()
  const [active, setActive] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [annonces, setAnnonces] = useState<ApiAnnonce[]>([])
  const [selectedAnnonce, setSelectedAnnonce] = useState<ApiAnnonce | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false)
   const [editForm, setEditForm] = useState({
     titre: '',
     description: '',
     prix_loyer: '',
     type_propriete: 'appartement',
     type_bail: 'collectif',
     surface_totale: '',
     total_colocataires: '',
     est_meuble: 'Oui',
     date_disponibilite: '',
     energy_class: '',
     ghg_class: '',
     elevator: false,
     pets_allowed: false,
     smokers_allowed: false,
     women_only: false,
     men_only: false,
   })
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

  useEffect(() => {
    const annonceId = Number(searchParams.get('annonceId'))
    if (!Number.isInteger(annonceId) || annonceId <= 0) return
    const annonce = annonces.find((item) => item.id === annonceId)
    if (!annonce) return
    setSelectedAnnonce(annonce)
    setSelectedPhotoIndex(0)
    setShowViewModal(true)
  }, [annonces, searchParams])

  useEffect(() => {
    if (!showViewModal || !selectedAnnonce) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isPhotoZoomed) {
          setIsPhotoZoomed(false)
        } else {
          closeViewModal()
        }
        return
      }

      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      ) return

      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        const photosCount = selectedAnnonce.photos.length || 1
        setSelectedPhotoIndex((current) => (
          event.key === 'ArrowRight'
            ? (current + 1) % photosCount
            : (current - 1 + photosCount) % photosCount
        ))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showViewModal, selectedAnnonce, isPhotoZoomed])

  function closeViewModal() {
    setIsPhotoZoomed(false)
    setShowViewModal(false)
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.delete('annonceId')
      return next
    })
  }

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

  async function changeStatus(annonce: ApiAnnonce, statut: 'active' | 'pending' | 'rejected', raison?: string) {
    setError('')
    try {
      const updated = await api.updateAnnonceStatus(annonce.id, statut, raison)
      setAnnonces((current) => current.map((item) => (item.id === annonce.id ? updated : item)))
      setShowRejectionModal(false)
      setShowViewModal(false)
      setSelectedAnnonce(null)
      setRejectionReason('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mise à jour impossible')
    }
  }

   function openEdit(annonce: ApiAnnonce) {
     setSelectedAnnonce(annonce)
     setEditForm({
       titre: annonce.titre,
       description: annonce.description || '',
       prix_loyer: String(annonce.chambre?.prix_loyer || ''),
       type_propriete: annonce.type_propriete || 'appartement',
       type_bail: annonce.type_bail || 'collectif',
       surface_totale: String(annonce.surface_totale || ''),
       total_colocataires: String(annonce.total_colocataires || ''),
       est_meuble: annonce.chambre?.est_meuble != null ? String(annonce.chambre.est_meuble) : 'Oui',
       date_disponibilite: annonce.chambre?.date_disponibilite || '',
       energy_class: annonce.energy_class || '',
       ghg_class: annonce.ghg_class || '',
       elevator: Boolean(annonce.elevator),
       pets_allowed: Boolean(annonce.pets_allowed),
       smokers_allowed: Boolean(annonce.smokers_allowed),
       women_only: Boolean(annonce.women_only),
       men_only: Boolean(annonce.men_only),
     })
     setShowEditModal(true)
   }

   async function saveEdit() {
     if (!selectedAnnonce) return
     const updated = await api.updateAnnonce(selectedAnnonce.id, {
       titre: editForm.titre,
       description: editForm.description,
       type_propriete: editForm.type_propriete,
       type_bail: editForm.type_bail,
       surface_totale: editForm.surface_totale ? Number(editForm.surface_totale) : null,
       total_colocataires: editForm.total_colocataires ? Number(editForm.total_colocataires) : null,
       chambre: {
         est_meuble: editForm.est_meuble,
         prix_loyer: Number(editForm.prix_loyer) || null,
         date_disponibilite: editForm.date_disponibilite || null,
       },
       energy_class: editForm.energy_class || null,
       ghg_class: editForm.ghg_class || null,
       elevator: editForm.elevator,
       pets_allowed: editForm.pets_allowed,
       smokers_allowed: editForm.smokers_allowed,
       women_only: editForm.women_only,
       men_only: editForm.men_only,
     })
     setAnnonces((current) => current.map((item) => (item.id === selectedAnnonce.id ? updated : item)))
     setShowEditModal(false)
     setSelectedAnnonce(null)
   }

  async function confirmDelete() {
    if (!selectedAnnonce) return
    setError('')
    try {
      await api.deleteAnnonce(selectedAnnonce.id)
      setAnnonces((current) => current.filter((item) => item.id !== selectedAnnonce.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible')
    }
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
                   <th className="text-left font-medium">Type</th>
                   <th className="text-left font-medium">Bail</th>
                   <th className="text-left font-medium">Surface</th>
                   <th className="text-left font-medium">Colocs</th>
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
                           <div className="font-medium truncate max-w-[200px] text-white">{annonce.titre}</div>
                           <div className="text-xs text-white/40">{annonce.reference}</div>
                         </div>
                       </div>
                     </td>
                     <td className="text-white/70">{annonce.ville}</td>
                     <td className="text-white/70">{annonce.type_propriete}</td>
                     <td className="text-white/70">{annonce.type_bail || '-'}</td>
                     <td className="text-white/70">{annonce.surface_totale ? `${annonce.surface_totale} m²` : '-'}</td>
                     <td className="text-white/70">{annonce.total_colocataires || '-'}</td>
                     <td className="text-white/70 font-semibold">{formatAr(Number(annonce.chambre?.prix_loyer || 0))}</td>
                     <td className="text-white/70">{annonce.auteur || '-'}</td>
                     <td>
                       <StatusBadge status={annonce.statut} />
                     </td>
                     <td className="text-white/50 text-xs">{new Date(annonce.date_creation).toLocaleDateString('fr-FR')}</td>
                     <td className="p-4 text-right">
                       <div className="flex justify-end gap-1 flex-wrap">
                         <button onClick={() => { setSelectedAnnonce(annonce); setSelectedPhotoIndex(0); setShowViewModal(true) }} className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white" title="Voir">
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
                         {annonce.statut === 'active' && !isModerator && (
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
         <Modal title="Détails de l'annonce" onClose={closeViewModal}>
           <PhotoGallery
             photos={selectedAnnonce.photos}
             title={selectedAnnonce.titre}
             selectedIndex={selectedPhotoIndex}
             onSelect={setSelectedPhotoIndex}
             onZoom={() => setIsPhotoZoomed(true)}
           />
           <div className="grid grid-cols-2 gap-4 mt-4">
             <Info label="Titre" value={selectedAnnonce.titre} />
             <Info label="Ville" value={selectedAnnonce.ville} />
             <Info label="Type" value={selectedAnnonce.type_propriete} />
             <Info label="Bail" value={selectedAnnonce.type_bail || '-'} />
             <Info label="Surface" value={selectedAnnonce.surface_totale ? `${selectedAnnonce.surface_totale} m²` : '-'} />
             <Info label="Colocataires" value={String(selectedAnnonce.total_colocataires || '-')} />
             <Info label="Prix" value={formatAr(Number(selectedAnnonce.chambre?.prix_loyer || 0))} />
             <div>
               <label className="text-white/40 text-xs">Propriétaire</label>
               {selectedAnnonce.id_utilisateur ? (
                 <button
                   type="button"
                   onClick={() => navigate(`/admin/utilisateurs?userId=${selectedAnnonce.id_utilisateur}`)}
                   className="block text-left text-sm text-brand-cyan hover:underline"
                 >
                   {selectedAnnonce.auteur || '-'}
                 </button>
               ) : (
                 <div className="text-sm text-white">{selectedAnnonce.auteur || '-'}</div>
               )}
             </div>
             <Info label="Ref" value={selectedAnnonce.reference} />
             <Info label="Meublé" value={formatFurnished(selectedAnnonce.chambre?.est_meuble)} />
           </div>
           {selectedAnnonce.amenities && selectedAnnonce.amenities.length > 0 && (
             <div className="mt-4">
               <label className="text-white/40 text-xs">Equipements</label>
               <div className="flex flex-wrap gap-1 mt-1">
                 {selectedAnnonce.amenities.map((a, i) => (
                   <span key={i} className="text-xs bg-brand-cyan/10 text-brand-cyan px-2 py-0.5 rounded-full">{a}</span>
                 ))}
               </div>
             </div>
           )}
           {selectedAnnonce.services && selectedAnnonce.services.length > 0 && (
             <div className="mt-4">
               <label className="text-white/40 text-xs">Services inclus</label>
               <div className="flex flex-wrap gap-1 mt-1">
                 {selectedAnnonce.services.map((service, index) => (
                   <span key={`${service}-${index}`} className="text-xs bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full">{service}</span>
                 ))}
               </div>
             </div>
           )}
           {selectedAnnonce.regles && selectedAnnonce.regles.length > 0 && (
             <div className="mt-4">
               <label className="text-white/40 text-xs">Regles</label>
               <div className="flex flex-wrap gap-1 mt-1">
                 {selectedAnnonce.regles.map((r, i) => (
                   <span key={i} className="text-xs bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full">{r}</span>
                 ))}
               </div>
             </div>
           )}
           <div className="mt-4 flex flex-wrap gap-2">
             {selectedAnnonce.elevator && <span className="text-xs bg-white/5 text-white/70 px-2 py-1 rounded-full flex items-center gap-1"><Home className="w-3 h-3" /> Ascenseur</span>}
             {selectedAnnonce.pets_allowed && <span className="text-xs bg-white/5 text-white/70 px-2 py-1 rounded-full flex items-center gap-1"><Dog className="w-3 h-3" /> Animaux</span>}
             {selectedAnnonce.smokers_allowed && <span className="text-xs bg-white/5 text-white/70 px-2 py-1 rounded-full flex items-center gap-1">🚬 Fumeurs</span>}
             {selectedAnnonce.women_only && <span className="text-xs bg-white/5 text-white/70 px-2 py-1 rounded-full flex items-center gap-1">👩 Femmes</span>}
             {selectedAnnonce.men_only && <span className="text-xs bg-white/5 text-white/70 px-2 py-1 rounded-full flex items-center gap-1">👨 Hommes</span>}
             {selectedAnnonce.energy_class && <span className="text-xs bg-white/5 text-white/70 px-2 py-1 rounded-full">Energy: {selectedAnnonce.energy_class}</span>}
             {selectedAnnonce.ghg_class && <span className="text-xs bg-white/5 text-white/70 px-2 py-1 rounded-full">GHG: {selectedAnnonce.ghg_class}</span>}
           </div>
           <p className="mt-4 text-sm text-white/70">{selectedAnnonce.description || 'Aucune description.'}</p>
           {selectedAnnonce.statut === 'pending' && (
             <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
               <button
                 type="button"
                 onClick={() => setShowRejectionModal(true)}
                 className="inline-flex items-center gap-2 rounded-lg bg-brand-magenta px-4 py-2 text-sm font-semibold text-white"
               >
                 <XCircle className="h-4 w-4" /> Refuser
               </button>
               <button
                 type="button"
                 onClick={() => changeStatus(selectedAnnonce, 'active')}
                 className="inline-flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white"
               >
                 <CheckCircle className="h-4 w-4" /> Valider
               </button>
             </div>
           )}
         </Modal>
       )}

      {isPhotoZoomed && selectedAnnonce && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo agrandie de ${selectedAnnonce.titre}`}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setIsPhotoZoomed(false)}
        >
          <button
            type="button"
            autoFocus
            aria-label="Fermer la photo agrandie"
            onClick={() => setIsPhotoZoomed(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={(selectedAnnonce.photos.length ? selectedAnnonce.photos : ['https://picsum.photos/seed/colockoo/900/400'])[selectedPhotoIndex]}
            alt={`${selectedAnnonce.titre} — photo ${selectedPhotoIndex + 1}`}
            className="max-h-[90vh] max-w-[92vw] cursor-zoom-out object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          {selectedAnnonce.photos.length > 1 && (
            <div className="absolute bottom-4 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
              {selectedPhotoIndex + 1} / {selectedAnnonce.photos.length} · utilisez ← et → pour naviguer
            </div>
          )}
        </div>
      )}

      {showRejectionModal && selectedAnnonce && (
        <Modal title="Refuser l'annonce" onClose={() => setShowRejectionModal(false)} narrow>
          <p className="text-white/60 text-sm mb-4">{selectedAnnonce.titre}</p>
          <label className="block text-sm text-white/60 mb-2">Motif du rejet</label>
          <textarea
            required
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-brand-magenta transition resize-none text-white"
            rows={4}
          />
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowRejectionModal(false)} className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80">Annuler</button>
            <button
              onClick={() => changeStatus(selectedAnnonce, 'rejected', rejectionReason.trim())}
              disabled={!rejectionReason.trim()}
              className="flex-1 px-4 py-2 bg-brand-magenta text-white rounded-lg text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Refuser
            </button>
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
             <div className="grid grid-cols-2 gap-3">
               <EditInput label="Type de bien" value={editForm.type_propriete} onChange={(value) => setEditForm({ ...editForm, type_propriete: value })} />
               <EditInput label="Type de bail" value={editForm.type_bail} onChange={(value) => setEditForm({ ...editForm, type_bail: value })} />
             </div>
             <div className="grid grid-cols-2 gap-3">
               <EditInput label="Surface totale (m²)" value={editForm.surface_totale} onChange={(value) => setEditForm({ ...editForm, surface_totale: value })} />
               <EditInput label="Total colocataires" value={editForm.total_colocataires} onChange={(value) => setEditForm({ ...editForm, total_colocataires: value })} />
             </div>
             <div className="grid grid-cols-2 gap-3">
               <EditInput label="Meuble" value={editForm.est_meuble} onChange={(value) => setEditForm({ ...editForm, est_meuble: value })} />
               <EditInput label="Date dispo" value={editForm.date_disponibilite} onChange={(value) => setEditForm({ ...editForm, date_disponibilite: value })} />
             </div>
             <div className="grid grid-cols-2 gap-3">
               <EditInput label="Prix loyer (Ar)" value={editForm.prix_loyer} onChange={(value) => setEditForm({ ...editForm, prix_loyer: value })} />
               <EditInput label="Classe énergie" value={editForm.energy_class} onChange={(value) => setEditForm({ ...editForm, energy_class: value })} />
             </div>
             <EditInput label="Classe GHG" value={editForm.ghg_class} onChange={(value) => setEditForm({ ...editForm, ghg_class: value })} />
             <div className="flex flex-wrap gap-4">
               <label className="flex items-center gap-2 text-sm text-white/70">
                 <input type="checkbox" checked={editForm.elevator} onChange={(e) => setEditForm({ ...editForm, elevator: e.target.checked })} />
                 Ascenseur
               </label>
               <label className="flex items-center gap-2 text-sm text-white/70">
                 <input type="checkbox" checked={editForm.pets_allowed} onChange={(e) => setEditForm({ ...editForm, pets_allowed: e.target.checked })} />
                 Animaux
               </label>
               <label className="flex items-center gap-2 text-sm text-white/70">
                 <input type="checkbox" checked={editForm.smokers_allowed} onChange={(e) => setEditForm({ ...editForm, smokers_allowed: e.target.checked })} />
                 Fumeurs
               </label>
               <label className="flex items-center gap-2 text-sm text-white/70">
                 <input type="checkbox" checked={editForm.women_only} onChange={(e) => setEditForm({ ...editForm, women_only: e.target.checked })} />
                 Femmes uniquement
               </label>
               <label className="flex items-center gap-2 text-sm text-white/70">
                 <input type="checkbox" checked={editForm.men_only} onChange={(e) => setEditForm({ ...editForm, men_only: e.target.checked })} />
                 Hommes uniquement
               </label>
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

function formatFurnished(value: string | number | null | undefined) {
  if (value === 1 || value === '1' || String(value).toLowerCase() === 'oui' || String(value).toLowerCase() === 'meuble') return 'Oui'
  if (value === 0 || value === '0' || String(value).toLowerCase() === 'non' || String(value).toLowerCase() === 'non meuble') return 'Non'
  if (String(value).toLowerCase() === 'partiel' || String(value).toLowerCase() === 'partiellement') return 'Partiellement'
  return value == null || value === '' ? '-' : String(value)
}

function PhotoGallery({
  photos,
  title,
  selectedIndex,
  onSelect,
  onZoom,
}: {
  photos: string[]
  title: string
  selectedIndex: number
  onSelect: (index: number) => void
  onZoom: () => void
}) {
  const images = photos.length ? photos : ['https://picsum.photos/seed/colockoo/900/400']
  const currentIndex = Math.min(selectedIndex, images.length - 1)

  return (
    <div>
      <div className="relative">
        <button
          type="button"
          onClick={onZoom}
          aria-label="Agrandir la photo sélectionnée"
          className="block w-full cursor-zoom-in"
        >
          <img src={images[currentIndex]} className="w-full h-56 object-cover rounded-lg" alt={`${title} — photo ${currentIndex + 1}`} />
        </button>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => onSelect((currentIndex - 1 + images.length) % images.length)}
              aria-label="Photo précédente"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => onSelect((currentIndex + 1) % images.length)}
              aria-label="Photo suivante"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
              {currentIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {images.map((photo, index) => (
            <button
              key={`${photo}-${index}`}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Afficher la photo ${index + 1}`}
              aria-pressed={currentIndex === index}
              className={`shrink-0 rounded-md border-2 ${currentIndex === index ? 'border-brand-cyan' : 'border-transparent'}`}
            >
              <img src={photo} alt="" className="h-14 w-20 rounded object-cover" />
            </button>
          ))}
        </div>
      )}
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
