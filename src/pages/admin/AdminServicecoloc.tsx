import React, {useEffect, useMemo, useState} from 'react'
import {AdminLayout} from '../../components/admin/AdminLayout'
import {api, type DemandeServiceStaffItem} from '../../lib/api'
import {
    Search,
    Clock,
    CheckCircle,
    XCircle,
    Trash2,
    RefreshCw,
    Users,
    Briefcase,
    Info,
    MessageCircle,
    Phone,
    Mail,
    Calendar as CalendarIcon,
    Plus,
    X,
    ChevronDown,
    ChevronUp,
    PhoneCall,
    Calendar,
    User,
    Loader2,
} from 'lucide-react'

// ============================================================================
//  INTERFACES
// ============================================================================

interface ServiceLigne {
    nom: string
    quantite: number
    prix_unitaire: number
    sous_total: number
}

interface ServiceDemande {
    reference: string
    idUtilisateur: number
    demandeur: string
    telephone: string | null
    email: string | null
    message: string | null
    services: string[]
    lignes: ServiceLigne[]
    total: number
    dateCreation: string
    statut: 'nouvelle' | 'en-cours' | 'traitee' | 'annulee'
    // NOUVEAUX CHAMPS POUR LE SUIVI
    dernier_contact: string | null
    relance: string | null
    synthese: string | null
    rdv_date: string | null
    rdv_note: string | null
}

interface ApiServiceCkooRow {
    id_service: number
    cle_service?: string | null
    nom: string
    description?: string | null
    prix: number
    unite?: string | null
    est_actif: 0 | 1
}

interface OffreService {
    id: string
    cle: string
    nom: string
    prixParJour: number
    unite: string
    description?: string
    actif: boolean
}

// ============================================================================
//  FONCTIONS DE MAPPING
// ============================================================================

function mapDemandeService(d: DemandeServiceStaffItem): ServiceDemande {
    const demandeur = d.demandeur || d.nom || d.prenom || 'Utilisateur'

    return {
        reference: d.reference || 'N/A',
        idUtilisateur: d.id_utilisateur || 0,
        demandeur: demandeur,
        telephone: d.telephone || null,
        email: d.email || null,
        message: d.message || null,
        services: d.services || [],
        lignes: (d.lignes || []).map((l) => ({
            nom: l.nom || 'Service',
            quantite: l.quantite || 1,
            prix_unitaire: l.prix_unitaire || 0,
            sous_total: l.sous_total || 0,
        })),
        total: d.total || 0,
        dateCreation: d.date_creation
            ? new Date(d.date_creation).toLocaleString('fr-FR', {dateStyle: 'short', timeStyle: 'short'})
            : '',
        statut: d.statut || 'nouvelle',
        // NOUVEAUX CHAMPS
        dernier_contact: d.dernier_contact || null,
        relance: d.relance || null,
        synthese: d.synthese || null,
        rdv_date: d.rdv_date || null,
        rdv_note: d.rdv_note || null,
    }
}

function mapServiceCkooRow(service: ApiServiceCkooRow): OffreService | null {
    if (!service.cle_service || !service.cle_service.startsWith('service_')) {
        return null
    }

    return {
        id: String(service.id_service),
        cle: service.cle_service || '',
        nom: service.nom || 'Service sans nom',
        prixParJour: Number(service.prix || 0),
        unite: service.unite || 'heure',
        description: service.description || undefined,
        actif: Boolean(service.est_actif),
    }
}

// ============================================================================
//  CONFIGURATION DES STATUTS
// ============================================================================

const STATUT_CONFIG: Record<ServiceDemande['statut'], {
    label: string;
    className: string;
    accent: string;
    icon: React.ElementType
}> = {
    'nouvelle': {
        label: 'Nouvelle',
        className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        accent: 'border-l-amber-400',
        icon: Clock
    },
    'en-cours': {
        label: 'En cours',
        className: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        accent: 'border-l-blue-400',
        icon: MessageCircle
    },
    'traitee': {
        label: 'Traitée',
        className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        accent: 'border-l-emerald-400',
        icon: CheckCircle
    },
    'annulee': {
        label: 'Annulée',
        className: 'bg-red-500/15 text-red-400 border-red-500/30',
        accent: 'border-l-red-400',
        icon: XCircle
    },
}

// ============================================================================
//  COMPOSANT : BADGE DE STATUT
// ============================================================================

const StatusBadge = ({statut}: { statut: ServiceDemande['statut'] }) => {
    const {label, className, icon: Icon} = STATUT_CONFIG[statut]
    return (
        <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${className}`}>
      <Icon className="w-3 h-3"/>
            {label}
    </span>
    )
}

// ============================================================================
//  COMPOSANT : MODALE RDV TÉLÉPHONIQUE
// ============================================================================

const RdvModal = ({
                      demande,
                      onClose,
                      onSave,
                      loading
                  }: {
    demande: ServiceDemande
    onClose: () => void
    onSave: (date: string, note: string) => void
    loading: boolean
}) => {
    const [rdvDate, setRdvDate] = useState(demande.rdv_date || new Date().toISOString().slice(0, 16))
    const [rdvNote, setRdvNote] = useState(demande.rdv_note || 'Confirmation des offres souscrites')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!rdvDate) {
            alert('Veuillez choisir une date.')
            return
        }
        onSave(rdvDate, rdvNote)
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl max-w-md w-full"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-xl font-bold">Programmer un RDV téléphonique</h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition">
                        <X className="w-5 h-5"/>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                        <User className="w-4 h-4"/>
                        <span>Référence :</span>
                        <span className="font-medium text-white">{demande.reference}</span>
                        <span className="text-white/40">·</span>
                        <span className="text-white/60">{demande.demandeur}</span>
                    </div>

                    <div>
                        <label className="block text-sm text-white/60 mb-1">
                            <PhoneCall className="w-4 h-4 inline mr-1"/>
                            Date & heure
                        </label>
                        <input
                            type="datetime-local"
                            required
                            value={rdvDate}
                            onChange={(e) => setRdvDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-white/60 mb-1">Note</label>
                        <input
                            type="text"
                            value={rdvNote}
                            onChange={(e) => setRdvNote(e.target.value)}
                            placeholder="Objet de l'appel…"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50"
                        />
                    </div>

                    <div
                        className="flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                        <Clock className="w-4 h-4"/>
                        Un rappel sera émis la veille
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-brand-cyan text-[oklch(0.15_0_0)] font-bold px-4 py-2 rounded-lg hover:opacity-80 transition disabled:opacity-50"
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 inline mr-2 animate-spin"/> Envoi…</>
                            ) : (
                                <><Calendar className="w-4 h-4 inline mr-2"/> Programmer l'appel</>
                            )}
                        </button>
                        {demande.rdv_date && (
                            <button
                                type="button"
                                onClick={() => onSave('', '')}
                                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                            >
                                Annuler RDV
                            </button>
                        )}
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
//  COMPOSANT : MODALE D'AJOUT D'OFFRE
// ============================================================================

const OffreModal = ({
                        onClose,
                        onSave
                    }: {
    onClose: () => void
    onSave: (offre: Omit<OffreService, 'id' | 'cle'>) => void
}) => {
    const [nom, setNom] = useState('')
    const [prixParJour, setPrixParJour] = useState(8800)
    const [unite, setUnite] = useState('heure')
    const [description, setDescription] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!nom.trim()) {
            alert('Veuillez saisir un nom pour l\'offre')
            return
        }
        onSave({
            nom: nom.trim(),
            prixParJour,
            unite,
            description: description.trim() || undefined,
            actif: true
        })
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl max-w-md w-full"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-xl font-bold">Ajouter une offre</h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition">
                        <X className="w-5 h-5"/>
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
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50"
                            placeholder="Ex: Service de jardinage"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-white/60 mb-1">Prix par jour (MGA)</label>
                        <input
                            type="number"
                            min="0"
                            value={prixParJour}
                            onChange={(e) => setPrixParJour(parseInt(e.target.value) || 0)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-white/60 mb-1">Unité</label>
                        <select
                            value={unite}
                            onChange={(e) => setUnite(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50"
                        >
                            <option value="heure" className="bg-[oklch(0.22_0.005_260)]">Heure</option>
                            <option value="jour" className="bg-[oklch(0.22_0.005_260)]">Jour</option>
                            <option value="forfait" className="bg-[oklch(0.22_0.005_260)]">Forfait</option>
                            <option value="mois" className="bg-[oklch(0.22_0.005_260)]">Mois</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-white/60 mb-1">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50"
                            placeholder="Description de l'offre..."
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit"
                                className="flex-1 bg-brand-cyan text-[oklch(0.15_0_0)] font-bold px-4 py-2 rounded-lg hover:opacity-80 transition">
                            <Plus className="w-4 h-4 inline mr-2"/>
                            Ajouter
                        </button>
                        <button type="button" onClick={onClose}
                                className="flex-1 bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition text-white/60">
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ============================================================================
//  COMPOSANT PRINCIPAL
// ============================================================================

export default function AdminServicesColockoo() {
    const [demandes, setDemandes] = useState<ServiceDemande[]>([])
    const [offres, setOffres] = useState<OffreService[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatut, setFilterStatut] = useState<string>('tous')
    const [showOffreModal, setShowOffreModal] = useState(false)
    const [showRdvModal, setShowRdvModal] = useState(false)
    const [selectedDemande, setSelectedDemande] = useState<ServiceDemande | null>(null)
    const [expandedRef, setExpandedRef] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'demandes' | 'offres'>('demandes')
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // ================================================================
    //  CHARGEMENT DES DONNÉES
    // ================================================================

    const loadAdminServiceData = async () => {
        setLoading(true)
        setError(null)
        try {
            const [demandesData, services] = await Promise.all([
                api.backofficeDemandesService(),
                api.backofficeServicesCkoo(),
            ])

            console.log('📊 Données reçues:', demandesData)

            setDemandes((demandesData || []).map(mapDemandeService))

            const filteredServices = (services || [])
                .map(mapServiceCkooRow)
                .filter((service): service is OffreService => service !== null)

            setOffres(filteredServices)
            setSuccessMessage('Données chargées depuis le backend')
            window.setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err) {
            console.error('❌ Erreur:', err)
            setError(err instanceof Error ? err.message : 'Impossible de charger les données')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadAdminServiceData()
    }, [])

    // ================================================================
    //  FILTRES ET STATISTIQUES
    // ================================================================

    const filteredDemandes = useMemo(() => {
        let filtered = demandes

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(d =>
                d.demandeur.toLowerCase().includes(query) ||
                d.reference.toLowerCase().includes(query) ||
                d.services.join(' ').toLowerCase().includes(query)
            )
        }

        if (filterStatut !== 'tous') {
            filtered = filtered.filter(d => d.statut === filterStatut)
        }

        return filtered
    }, [demandes, searchQuery, filterStatut])

    const groupesParPersonne = useMemo(() => {
        const map = new Map<number, {
            idUtilisateur: number
            demandeur: string
            email: string | null
            telephone: string | null
            demandes: ServiceDemande[]
            total: number
        }>()
        for (const d of filteredDemandes) {
            if (!map.has(d.idUtilisateur)) {
                map.set(d.idUtilisateur, {
                    idUtilisateur: d.idUtilisateur,
                    demandeur: d.demandeur || 'Utilisateur',
                    email: d.email || null,
                    telephone: d.telephone || null,
                    demandes: [],
                    total: 0,
                })
            }
            const g = map.get(d.idUtilisateur)!
            g.demandes.push(d)
            g.total += d.total
            if (!g.telephone && d.telephone) g.telephone = d.telephone
            if (!g.email && d.email) g.email = d.email
        }
        return [...map.values()]
    }, [filteredDemandes])

    const stats = useMemo(() => ({
        total: demandes.length,
        nouvelle: demandes.filter(d => d.statut === 'nouvelle').length,
        enCours: demandes.filter(d => d.statut === 'en-cours').length,
        traitee: demandes.filter(d => d.statut === 'traitee').length,
        annulee: demandes.filter(d => d.statut === 'annulee').length,
        totalMontant: demandes.reduce((sum, d) => sum + d.total, 0),
    }), [demandes])

    // ================================================================
    //  FONCTIONS D'ACTION - SUIVI
    // ================================================================

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—'
        try {
            const d = new Date(dateStr)
            return d.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return dateStr
        }
    }

    // Marquer comme appelé
    const handleMarquerAppele = async (reference: string) => {
        setLoading(true)
        try {
            const now = new Date().toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'})
            const message = `Appel le ${now}`

            // Mise à jour locale immédiate
            setDemandes(prev => prev.map(d =>
                d.reference === reference ? {...d, dernier_contact: message, statut: 'en-cours'} : d
            ))

            await api.marquerAppele(reference)
            await loadAdminServiceData()
            setSuccessMessage(`Appel marqué pour la demande ${reference}`)
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err) {
            console.error('Erreur:', err)
            await loadAdminServiceData()
            setError(err instanceof Error ? err.message : 'Impossible de marquer l\'appel')
            setTimeout(() => setError(null), 3000)
        } finally {
            setLoading(false)
        }
    }

    // Marquer mail envoyé
    const handleMailEnvoye = async (reference: string) => {
        setLoading(true)
        try {
            const now = new Date().toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'})
            const message = `Mail le ${now}`

            setDemandes(prev => prev.map(d =>
                d.reference === reference ? {...d, dernier_contact: message, statut: 'en-cours'} : d
            ))

            await api.marquerMailEnvoye(reference)
            await loadAdminServiceData()
            setSuccessMessage(`Mail envoyé marqué pour la demande ${reference}`)
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err) {
            console.error('Erreur:', err)
            await loadAdminServiceData()
            setError(err instanceof Error ? err.message : 'Impossible de marquer le mail')
            setTimeout(() => setError(null), 3000)
        } finally {
            setLoading(false)
        }
    }

    // Relancer
    const handleRelancer = async (reference: string) => {
        setLoading(true)
        try {
            const now = new Date().toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'})
            const message = `Relance le ${now}`

            setDemandes(prev => prev.map(d =>
                d.reference === reference ? {...d, relance: message} : d
            ))

            await api.relancerDemande(reference)
            await loadAdminServiceData()
            setSuccessMessage(`Relance effectuée pour la demande ${reference}`)
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err) {
            console.error('Erreur:', err)
            await loadAdminServiceData()
            setError(err instanceof Error ? err.message : 'Impossible de relancer')
            setTimeout(() => setError(null), 3000)
        } finally {
            setLoading(false)
        }
    }

    // Ouvrir le modal RDV
    const handleOpenRdvModal = (demande: ServiceDemande) => {
        setSelectedDemande(demande)
        setShowRdvModal(true)
    }

    // Sauvegarder RDV
    const handleSaveRdv = async (date: string, note: string) => {
        if (!selectedDemande) return

        if (!date) {
            setLoading(true)
            try {
                await api.annulerRdv(selectedDemande.reference)
                await loadAdminServiceData()
                setShowRdvModal(false)
                setSelectedDemande(null)
                setSuccessMessage(`RDV annulé pour la demande ${selectedDemande.reference}`)
                setTimeout(() => setSuccessMessage(null), 3000)
            } catch (err) {
                console.error('Erreur:', err)
                setError(err instanceof Error ? err.message : 'Impossible d\'annuler le RDV')
                setTimeout(() => setError(null), 3000)
            } finally {
                setLoading(false)
            }
            return
        }

        setLoading(true)
        try {
            await api.programmerRdv(selectedDemande.reference, date, note)
            await loadAdminServiceData()
            setShowRdvModal(false)
            setSelectedDemande(null)
            setSuccessMessage(`RDV programmé pour la demande ${selectedDemande.reference}`)
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err) {
            console.error('Erreur:', err)
            setError(err instanceof Error ? err.message : 'Impossible de programmer le RDV')
            setTimeout(() => setError(null), 3000)
        } finally {
            setLoading(false)
        }
    }

    // Mettre à jour la synthèse
    const handleSyntheseChange = async (reference: string, value: string) => {
        setDemandes(prev => prev.map(d =>
            d.reference === reference ? {...d, synthese: value} : d
        ))

        try {
            await api.updateSynthese(reference, value)
        } catch (err) {
            console.error('Erreur mise à jour synthèse:', err)
        }
    }

    // Changer le statut
    const handleChangeStatut = async (reference: string, statut: ServiceDemande['statut']) => {
        const previous = demandes
        setDemandes(demandes.map(d => (d.reference === reference ? {...d, statut} : d)))
        try {
            await api.updateDemandeServiceStatut(reference, statut)
            setSuccessMessage(`Statut changé en "${STATUT_CONFIG[statut].label}"`)
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err) {
            setDemandes(previous)
            setError(err instanceof Error ? err.message : 'Impossible de changer le statut')
            setTimeout(() => setError(null), 3000)
        }
    }

    // ================================================================
    //  FONCTIONS D'ACTION - OFFRES
    // ================================================================

    const handleAddOffre = async (offre: Omit<OffreService, 'id' | 'cle'>) => {
        setLoading(true)
        setError(null)
        try {
            const cleService = `service_${Date.now()}`
            await api.createServiceCkoo({
                cle_service: cleService,
                nom: offre.nom,
                description: offre.description || '',
                prix: offre.prixParJour,
                unite: offre.unite || 'heure',
                est_actif: offre.actif ? 1 : 0,
            })
            await loadAdminServiceData()
            setSuccessMessage(`Offre "${offre.nom}" ajoutée avec succès`)
            window.setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Impossible d\'ajouter l\'offre')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteOffre = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return
        setLoading(true)
        setError(null)
        try {
            await api.deleteServiceCkoo(id)
            await loadAdminServiceData()
            setSuccessMessage('Offre supprimée avec succès')
            window.setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Impossible de supprimer l\'offre')
        } finally {
            setLoading(false)
        }
    }

    const handleToggleOffre = async (id: string) => {
        const index = offres.findIndex(o => o.id === id)
        if (index === -1) return
        const updatedOffre = {...offres[index], actif: !offres[index].actif}

        setLoading(true)
        setError(null)
        try {
            await api.updateServiceCkoo(id, {est_actif: updatedOffre.actif ? 1 : 0})
            await loadAdminServiceData()
            setSuccessMessage(`Offre ${updatedOffre.actif ? 'activée' : 'désactivée'}`)
            window.setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Impossible de changer le statut de l\'offre')
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = () => {
        loadAdminServiceData()
    }

    // ================================================================
    //  RENDU
    // ================================================================

    return (
        <AdminLayout>
            <div className="space-y-5">
                {/* En-tête */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="bebas text-3xl text-white">Services Coloc'KOO</h1>
                        <p className="text-white/50 text-sm">
                            {stats.total} demandes · {stats.nouvelle} nouvelles · {stats.enCours} en cours
                            · {stats.traitee} traitées
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition text-white/60"
                    >
                        <RefreshCw className="w-4 h-4"/>
                        Actualiser
                    </button>
                </div>

                {/* Messages */}
                {successMessage && (
                    <div
                        className="bg-brand-green/20 border border-brand-green/30 text-brand-green px-4 py-2 rounded-lg text-sm animate-in slide-in-from-top-2">
                        {successMessage}
                    </div>
                )}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-2 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                {loading && (
                    <div className="bg-white/5 border border-white/10 text-white/70 px-4 py-2 rounded-lg text-sm">
                        <Loader2 className="w-4 h-4 inline mr-2 animate-spin"/>
                        Chargement des données...
                    </div>
                )}

                {/* Onglets */}
                <div className="flex flex-wrap gap-1 border-b border-white/10 pb-0">
                    <button
                        onClick={() => setActiveTab('demandes')}
                        className={`px-4 py-2.5 text-sm font-medium transition rounded-t-lg ${
                            activeTab === 'demandes'
                                ? 'bg-[oklch(0.22_0.005_260)] text-brand-cyan border-b-2 border-brand-cyan'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Users className="w-4 h-4 inline mr-2"/>
                        Demandes de services
                        <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">{demandes.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('offres')}
                        className={`px-4 py-2.5 text-sm font-medium transition rounded-t-lg ${
                            activeTab === 'offres'
                                ? 'bg-[oklch(0.22_0.005_260)] text-brand-cyan border-b-2 border-brand-cyan'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Briefcase className="w-4 h-4 inline mr-2"/>
                        Offres commerciales
                        <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">{offres.length}</span>
                    </button>
                </div>

                {/* Contenu */}
                <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl overflow-hidden">

                    {/* TAB: Demandes */}
                    {activeTab === 'demandes' && (
                        <>
                            <div className="p-4 border-b border-white/10">
                                <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                                    <div
                                        className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
                                        <Search className="w-4 h-4 text-white/40"/>
                                        <input
                                            placeholder="Rechercher une demande..."
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
                                            value={filterStatut}
                                            onChange={(e) => setFilterStatut(e.target.value)}
                                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                                        >
                                            <option value="tous" className="bg-[oklch(0.22_0.005_260)]">Tous les
                                                statuts
                                            </option>
                                            <option value="nouvelle" className="bg-[oklch(0.22_0.005_260)]">Nouvelle
                                            </option>
                                            {/*<option value="en-cours" className="bg-[oklch(0.22_0.005_260)]">En cours</option>*/}
                                            <option value="traitee" className="bg-[oklch(0.22_0.005_260)]">Validée
                                            </option>
                                            <option value="annulee" className="bg-[oklch(0.22_0.005_260)]">Annulée
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Liste groupée par personne */}
                            {filteredDemandes.length === 0 ? (
                                <div className="text-center py-16 text-white/40">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20"/>
                                    <p className="text-sm">Aucune demande trouvée</p>
                                </div>
                            ) : (
                                <div className="p-2.5 space-y-3">
                                    {groupesParPersonne.map((personne) => (
                                        <div
                                            key={personne.idUtilisateur}
                                            className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
                                        >
                                            {/* En-tête personne */}
                                            <div
                                                className="flex items-center gap-3 px-3 py-2.5 bg-white/[0.04] border-b border-white/10">
                                                <div
                                                    className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-[oklch(0.15_0_0)] text-sm font-bold flex-shrink-0">
                                                    {personne.demandeur[0]?.toUpperCase() || '?'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div
                                                        className="font-semibold text-white text-sm truncate">{personne.demandeur}</div>
                                                    <div
                                                        className="flex items-center gap-x-3 gap-y-0.5 flex-wrap text-[11px] text-white/40 mt-0.5">
                                                        {personne.email && (
                                                            <span className="inline-flex items-center gap-1"><Mail
                                                                className="w-3 h-3"/>{personne.email}</span>
                                                        )}
                                                        {personne.telephone && (
                                                            <span className="inline-flex items-center gap-1"><Phone
                                                                className="w-3 h-3"/>{personne.telephone}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-[11px] text-white/40">
                                                        {personne.demandes.length} demande{personne.demandes.length > 1 ? 's' : ''}
                                                    </div>
                                                    <div className="text-sm font-bold text-brand-green tabular-nums">
                                                        {personne.total.toLocaleString('fr-FR')} <span
                                                        className="text-[9px] text-white/40">MGA</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Demandes de la personne */}
                                            <div className="divide-y divide-white/5">
                                                {personne.demandes.map((demande) => {
                                                    const cfg = STATUT_CONFIG[demande.statut]
                                                    const open = expandedRef === demande.reference
                                                    return (
                                                        <div key={demande.reference}
                                                             className={`border-l-[3px] ${cfg.accent}`}>
                                                            {/* Ligne compacte */}
                                                            <div className="flex items-center gap-3 px-3 py-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setExpandedRef(open ? null : demande.reference)}
                                                                    className="flex-1 min-w-0 text-left"
                                                                >
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <span
                                                                            className="text-[10px] font-mono text-white/45 flex-shrink-0">{demande.reference}</span>
                                                                        <StatusBadge statut={demande.statut}/>
                                                                    </div>
                                                                    <div
                                                                        className="flex items-center gap-x-3 gap-y-1 mt-1 flex-wrap text-[11px] text-white/40">
                                                                        {demande.services && demande.services.map((s, i) => (
                                                                            <span key={i}
                                                                                  className="inline-flex items-center font-medium bg-brand-cyan/10 text-brand-cyan rounded px-1.5 py-px">
                                        {s}
                                      </span>
                                                                        ))}
                                                                        <span
                                                                            className="inline-flex items-center gap-1">
                                      <CalendarIcon className="w-3 h-3"/>{demande.dateCreation}
                                    </span>
                                                                    </div>
                                                                </button>

                                                                {/* Droite : montant + statut + chevron */}
                                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                                    <div className="text-right leading-none">
                                                                        <span
                                                                            className="text-sm font-bold text-brand-green tabular-nums">{demande.total.toLocaleString('fr-FR')}</span>
                                                                        <span
                                                                            className="block text-[9px] text-white/40 mt-0.5">MGA</span>
                                                                    </div>
                                                                    <select
                                                                        value={demande.statut}
                                                                        onChange={(e) => handleChangeStatut(demande.reference, e.target.value as ServiceDemande['statut'])}
                                                                        className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-white/80 outline-none focus:border-brand-cyan/50 hover:bg-white/10 transition cursor-pointer"
                                                                    >
                                                                        <option value="nouvelle"
                                                                                className="bg-[oklch(0.22_0.005_260)]">Nouvelle
                                                                        </option>
                                                                        {/*<option value="en-cours" className="bg-[oklch(0.22_0.005_260)]">En cours</option>*/}
                                                                        <option value="traitee"
                                                                                className="bg-[oklch(0.22_0.005_260)]">Validée
                                                                        </option>
                                                                        <option value="annulee"
                                                                                className="bg-[oklch(0.22_0.005_260)]">Annulée
                                                                        </option>
                                                                    </select>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setExpandedRef(open ? null : demande.reference)}
                                                                        className="p-1.5 rounded-md hover:bg-white/10 text-white/50 hover:text-white transition"
                                                                        title={open ? 'Réduire' : 'Voir le détail'}
                                                                    >
                                                                        {open ? <ChevronUp className="w-4 h-4"/> :
                                                                            <ChevronDown className="w-4 h-4"/>}
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Détail déplié - AVEC TOUS LES CHAMPS DE SUIVI */}
                                                            {open && (
                                                                <div
                                                                    className="px-4 pb-4 pt-3 border-t border-white/10 space-y-3">
                                                                    {/* Lignes de devis */}
                                                                    <div
                                                                        className="rounded-lg border border-white/10 overflow-hidden">
                                                                        <table className="w-full text-sm">
                                                                            <thead className="bg-white/5">
                                                                            <tr className="text-white/40 text-[11px] uppercase tracking-wider">
                                                                                <th className="text-left p-2.5 font-medium">Service</th>
                                                                                <th className="text-right p-2.5 font-medium">Prix</th>
                                                                                <th className="text-right p-2.5 font-medium">Total</th>
                                                                            </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-white/5">
                                                                            {demande.lignes && demande.lignes.map((l, idx) => (
                                                                                <tr key={idx} className="text-white/80">
                                                                                    <td className="p-2.5">{l.nom || 'Service'}</td>
                                                                                    <td className="p-2.5 text-right tabular-nums">{l.prix_unitaire.toLocaleString('fr-FR')} Ar</td>
                                                                                    <td className="p-2.5 text-right tabular-nums">{l.sous_total.toLocaleString('fr-FR')} Ar</td>
                                                                                </tr>
                                                                            ))}
                                                                            <tr className="bg-white/5">
                                                                                <td className="p-2.5 text-right font-bold text-white"
                                                                                    colSpan={2}>Total
                                                                                </td>
                                                                                <td className="p-2.5 text-right font-bold text-brand-cyan tabular-nums">{demande.total.toLocaleString('fr-FR')} MGA</td>
                                                                            </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>

                                                                    {/* ============================================================ */}
                                                                    {/* CHAMPS DE SUIVI */}
                                                                    {/* ============================================================ */}

                                                                    {/* RDV Téléphonique */}
                                                                    {demande.rdv_date && (
                                                                        <div
                                                                            className="flex items-center gap-2 text-sm bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                                                                            <PhoneCall
                                                                                className="w-4 h-4 text-blue-400"/>
                                                                            <span className="text-white/60">RDV téléphonique :</span>
                                                                            <span
                                                                                className="font-medium text-white">{formatDate(demande.rdv_date)}</span>
                                                                            {demande.rdv_note && (
                                                                                <span
                                                                                    className="text-white/40">— {demande.rdv_note}</span>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {/* Dernier contact */}
                                                                    <div
                                                                        className="flex items-center gap-2 text-sm bg-white/5 rounded-lg px-3 py-2">
                                                                        <Phone className="w-4 h-4 text-white/40"/>
                                                                        <span className="text-white/40">Dernier contact :</span>
                                                                        <span className="font-medium text-brand-cyan">
                                      {demande.dernier_contact || 'Aucun contact'}
                                    </span>
                                                                    </div>

                                                                    {/* Relance */}
                                                                    <div
                                                                        className="flex items-center gap-2 text-sm bg-white/5 rounded-lg px-3 py-2">
                                                                        <RefreshCw className="w-4 h-4 text-white/40"/>
                                                                        <span className="text-white/40">Relance :</span>
                                                                        <span className="font-medium text-amber-400">
                                      {demande.relance || 'Aucune relance'}
                                    </span>
                                                                    </div>

                                                                    {/* Synthèse échange */}
                                                                    <div className="space-y-1">
                                                                        <label className="text-sm text-white/40">Synthèse
                                                                            échange</label>
                                                                        <textarea
                                                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-brand-cyan/50 resize-none"
                                                                            rows={3}
                                                                            value={demande.synthese || ''}
                                                                            onChange={(e) => handleSyntheseChange(demande.reference, e.target.value)}
                                                                            placeholder="Synthèse des échanges avec le prospect..."
                                                                        />
                                                                    </div>

                                                                    {/* Message du demandeur */}
                                                                    {demande.message && (
                                                                        <div>
                                                                            <div
                                                                                className="text-white/35 text-[10px] uppercase tracking-wider mb-1">Message
                                                                                du demandeur
                                                                            </div>
                                                                            <p className="text-sm text-white/70 italic bg-white/5 rounded-lg p-3">« {demande.message} »</p>
                                                                        </div>
                                                                    )}

                                                                    {/* ============================================================ */}
                                                                    {/* BOUTONS D'ACTION */}
                                                                    {/* ============================================================ */}
                                                                    <div
                                                                        className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                                                                        <button
                                                                            onClick={() => handleMarquerAppele(demande.reference)}
                                                                            disabled={loading}
                                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-cyan/20 border border-brand-cyan/30 rounded-lg text-xs text-brand-cyan hover:bg-brand-cyan/30 transition disabled:opacity-50"
                                                                        >
                                                                            <Phone className="w-4 h-4"/>
                                                                            Marquer appelé
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleMailEnvoye(demande.reference)}
                                                                            disabled={loading}
                                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs text-blue-400 hover:bg-blue-500/30 transition disabled:opacity-50"
                                                                        >
                                                                            <Mail className="w-4 h-4"/>
                                                                            Mail envoyé
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleRelancer(demande.reference)}
                                                                            disabled={loading}
                                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-lg text-xs text-amber-400 hover:bg-amber-500/30 transition disabled:opacity-50"
                                                                        >
                                                                            <RefreshCw className="w-4 h-4"/>
                                                                            Relancer
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleOpenRdvModal(demande)}
                                                                            disabled={loading}
                                                                            className="flex items-center gap-1.5 px-3 py-1.5 border border-purple-500/50 rounded-lg text-xs text-purple-400 hover:bg-purple-500/10 transition disabled:opacity-50"
                                                                        >
                                                                            <PhoneCall className="w-4 h-4"/>
                                                                            RDV téléphonique
                                                                        </button>
                                                                        <button
                                                                            onClick={async () => {
                                                                                if (demande.statut === 'traitee') return
                                                                                await handleChangeStatut(demande.reference, 'traitee')
                                                                            }}
                                                                            disabled={loading || demande.statut === 'traitee'}
                                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-green/20 border border-brand-green/30 rounded-lg text-xs text-brand-green hover:bg-brand-green/30 transition disabled:opacity-50"
                                                                        >
                                                                            <CheckCircle className="w-4 h-4"/>
                                                                            Valider
                                                                        </button>
                                                                        <button
                                                                            onClick={async () => {
                                                                                if (demande.statut === 'annulee') return
                                                                                if (!confirm('Confirmer l\'annulation de cette demande ?')) return
                                                                                await handleChangeStatut(demande.reference, 'annulee')
                                                                            }}
                                                                            disabled={loading || demande.statut === 'annulee'}
                                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg text-xs text-red-400 hover:bg-red-500/30 transition disabled:opacity-50"
                                                                        >
                                                                            <XCircle className="w-4 h-4"/>
                                                                            Annuler
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* TAB: Offres */}
                    {activeTab === 'offres' && (
                        <div>
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-sm text-white/40">
                  Catalogue des offres commerciales
                  <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">{offres.length} offres</span>
                </span>
                                <button
                                    onClick={() => setShowOffreModal(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-cyan text-[oklch(0.15_0_0)] font-medium rounded-lg text-sm hover:opacity-80 transition"
                                >
                                    <Plus className="w-4 h-4"/>
                                    Ajouter une offre
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-white/5">
                                    <tr>
                                        <th className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                                            Offre
                                        </th>
                                        <th className="text-right p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                                            Prix / jour (MGA)
                                        </th>
                                        <th className="text-center p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                                            Unité
                                        </th>
                                        <th className="text-center p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                                            Statut
                                        </th>
                                        <th className="text-center p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                    {offres.map((offre) => (
                                        <tr key={offre.id} className="hover:bg-white/5 transition">
                                            <td className="p-3 font-medium">
                                                {offre.nom}
                                                {offre.description && (
                                                    <div className="text-xs text-white/40">{offre.description}</div>
                                                )}
                                            </td>
                                            <td className="p-3 text-right font-bold text-brand-cyan">
                                                {offre.prixParJour.toLocaleString('fr-FR')} MGA
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className="text-xs text-white/60">{offre.unite}</span>
                                            </td>
                                            <td className="p-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                              offre.actif
                                  ? 'bg-green-500/15 text-green-400 border-green-500/30'
                                  : 'bg-red-500/15 text-red-400 border-red-500/30'
                          }`}>
                            {offre.actif ? 'Actif' : 'Inactif'}
                          </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => handleToggleOffre(offre.id)}
                                                        className={`p-1.5 rounded-lg transition ${
                                                            offre.actif
                                                                ? 'hover:bg-red-500/20 text-red-400/60'
                                                                : 'hover:bg-green-500/20 text-green-400/60'
                                                        }`}
                                                        title={offre.actif ? 'Désactiver' : 'Activer'}
                                                    >
                                                        {offre.actif ? <XCircle className="w-4 h-4"/> :
                                                            <CheckCircle className="w-4 h-4"/>}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOffre(offre.id)}
                                                        className="p-1.5 hover:bg-red-500/20 rounded-lg transition text-red-400/60"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pied de tableau */}
                    <div
                        className="p-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-white/40">
                        {activeTab === 'demandes' ? (
                            <>
                                <span>{filteredDemandes.length} demandes</span>
                                <span>·</span>
                                <span
                                    className="text-amber-400">{filteredDemandes.filter(d => d.statut === 'nouvelle').length} nouvelles</span>
                                <span>·</span>
                                <span
                                    className="text-blue-400">{filteredDemandes.filter(d => d.statut === 'en-cours').length} en cours</span>
                                <span>·</span>
                                <span
                                    className="text-brand-green">{filteredDemandes.filter(d => d.statut === 'traitee').length} traitées</span>
                                <span>·</span>
                                <span
                                    className="text-red-400">{filteredDemandes.filter(d => d.statut === 'annulee').length} annulées</span>
                                <span className="ml-auto">
                  Montant total: <b className="text-brand-cyan">{stats.totalMontant.toLocaleString('fr-FR')} MGA</b>
                </span>
                            </>
                        ) : (
                            <>
                                <span>{offres.length} offres</span>
                                <span>·</span>
                                <span className="text-brand-green">{offres.filter(o => o.actif).length} actives</span>
                                <span>·</span>
                                <span className="text-red-400">{offres.filter(o => !o.actif).length} inactives</span>
                                <span className="ml-auto">
                  Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Note */}
                <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <Info className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5"/>
                        <div className="text-xs text-white/40">
                            Prix des services en Ariary <b>en attente de confirmation</b> par l'équipe Coloc'KOO.
                            Mention légale CNAPS / OSTIE rappelée à la validation. Les offres commerciales sont
                            modifiables par le super admin. Seuls les services avec une clé commençant
                            par <b>"service_"</b> sont affichés.
                            Les actions de suivi (appel, mail, relance, RDV) sont traçables et modifient le statut
                            automatiquement.
                        </div>
                    </div>
                </div>
            </div>

            {/* Modale RDV Téléphonique */}
            {showRdvModal && selectedDemande && (
                <RdvModal
                    demande={selectedDemande}
                    onClose={() => {
                        setShowRdvModal(false)
                        setSelectedDemande(null)
                    }}
                    onSave={handleSaveRdv}
                    loading={loading}
                />
            )}

            {/* Modale d'ajout d'offre */}
            {showOffreModal && (
                <OffreModal
                    onClose={() => setShowOffreModal(false)}
                    onSave={handleAddOffre}
                />
            )}
        </AdminLayout>
    )
}