import React, { useEffect, useState, useMemo } from 'react'
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  Image,
  Globe,
  MapPin,
  TrendingUp,
  Eye,
  EyeOff,
  Clock,
  AlertCircle,
  Upload,
  X,
  Filter,
  SortAsc,
  SortDesc,
  FileImage,
  Link2,
  Tag,
  Users,
  Award,
  Star,
  StarOff
} from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { api } from '../../lib/api'

// ===== TYPES =====
interface Partenaire {
  id: string
  nom: string
  secteur: string
  niveau: string
  remise: string
  engagement: string
  logo: string
  actif: boolean
  dateCreation: string
  contact?: {
    ref: string
    fonction: string
    telephone: string
    email: string
    adresse: string
  }
}

interface Campagne {
  id_campagne: number
  id_partenaire: number
  titre: string
  description: string | null
  emplacement: 'carte' | 'fil_annonces' | 'bandeau_regional' | 'page_partenaire'
  visuel: string | null
  date_debut: string
  date_fin: string | null
  statut: 'active' | 'programmee' | 'suspendue' | 'terminee'
  date_creation: string
  partenaire_nom?: string
  partenaire_niveau?: string
}

interface ApiPartenaire {
  id_partenaire: number
  nom: string
  secteur?: string | null
  niveau?: string | null
  remise?: string | null
  engagement?: string | null
  logo?: string | null
  actif: 0 | 1
  date_creation: string
  contact_ref?: string | null
  contact_fonction?: string | null
  contact_telephone?: string | null
  contact_email?: string | null
  contact_adresse?: string | null
}

// ===== FONCTIONS DE MAPPING =====
function mapPartenaire(row: ApiPartenaire): Partenaire {
  return {
    id: String(row.id_partenaire),
    nom: row.nom,
    secteur: row.secteur || 'Non renseigné',
    niveau: row.niveau || 'Standard',
    remise: row.remise || 'Aucune',
    engagement: row.engagement || 'Aucun',
    logo: row.logo || '',
    actif: row.actif === 1,
    dateCreation: row.date_creation ? new Date(row.date_creation).toLocaleDateString('fr-FR') : '-',
    contact: {
      ref: row.contact_ref || 'Non renseigné',
      fonction: row.contact_fonction || 'Non renseigné',
      telephone: row.contact_telephone || 'Non renseigné',
      email: row.contact_email || 'Non renseigné',
      adresse: row.contact_adresse || 'Non renseigné',
    }
  }
}

function mapCampagne(row: any): Campagne {
  return {
    id_campagne: row.id_campagne,
    id_partenaire: row.id_partenaire,
    titre: row.titre,
    description: row.description || null,
    emplacement: row.emplacement || 'fil_annonces',
    visuel: row.visuel || null,
    date_debut: row.date_debut,
    date_fin: row.date_fin || null,
    statut: row.statut || 'programmee',
    date_creation: row.date_creation,
    partenaire_nom: row.partenaire_nom,
    partenaire_niveau: row.partenaire_niveau,
  }
}

// ===== COMPOSANTS =====

// Badge de statut pour les campagnes
const CampagneStatusBadge = ({ statut }: { statut: Campagne['statut'] }) => {
  const config = {
    'active': { label: 'Active', className: 'bg-green-500/15 text-green-400 border-green-500/30', icon: CheckCircle },
    'programmee': { label: 'Programmée', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: Clock },
    'suspendue': { label: 'Suspendue', className: 'bg-red-500/15 text-red-400 border-red-500/30', icon: XCircle },
    'terminee': { label: 'Terminée', className: 'bg-gray-500/15 text-gray-400 border-gray-500/30', icon: EyeOff },
  }
  const { label, className, icon: Icon } = config[statut]
  
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

// Badge d'emplacement
const EmplacementBadge = ({ emplacement }: { emplacement: Campagne['emplacement'] }) => {
  const config = {
    'carte': { label: 'Carte', className: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30', icon: MapPin },
    'fil_annonces': { label: 'Fil d\'annonces', className: 'bg-purple-500/15 text-purple-400 border-purple-500/30', icon: TrendingUp },
    'bandeau_regional': { label: 'Bandeau régional', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: Globe },
    'page_partenaire': { label: 'Page partenaire', className: 'bg-pink-500/15 text-pink-400 border-pink-500/30', icon: Building2 },
  }
  const { label, className, icon: Icon } = config[emplacement]
  
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

// ===== MODALE PARTENAIRE =====
function PartnerModal({
  partner,
  onClose,
  onSave,
}: {
  partner?: Partenaire | null
  onClose: () => void
  onSave: (payload: Omit<Partenaire, 'id' | 'dateCreation'> & { logoFile?: File | null }) => Promise<void>
}) {
  const [nom, setNom] = useState(partner?.nom || '')
  const [secteur, setSecteur] = useState(partner?.secteur || '')
  const [niveau, setNiveau] = useState(partner?.niveau || '')
  const [remise, setRemise] = useState(partner?.remise || '')
  const [engagement, setEngagement] = useState(partner?.engagement || '')
  const [logo, setLogo] = useState(partner?.logo || '')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [preview, setPreview] = useState(partner?.logo || '')
  const [actif, setActif] = useState(partner?.actif ?? true)
  const [submitting, setSubmitting] = useState(false)
  const [contactRef, setContactRef] = useState(partner?.contact?.ref || '')
  const [contactFonction, setContactFonction] = useState(partner?.contact?.fonction || '')
  const [contactTelephone, setContactTelephone] = useState(partner?.contact?.telephone || '')
  const [contactEmail, setContactEmail] = useState(partner?.contact?.email || '')
  const [contactAdresse, setContactAdresse] = useState(partner?.contact?.adresse || '')

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!nom.trim()) return
    setSubmitting(true)
    try {
      await onSave({ 
        nom: nom.trim(), 
        secteur: secteur.trim(), 
        niveau: niveau.trim(), 
        remise: remise.trim(), 
        engagement: engagement.trim(), 
        logo: logo.trim(), 
        actif,
        logoFile
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[oklch(0.22_0.005_260)] z-10">
          <div>
            <h2 className="text-xl font-bold">{partner ? 'Modifier un partenaire' : 'Ajouter un partenaire'}</h2>
            <p className="text-white/50 text-sm">Remplissez les informations du partenaire.</p>
          </div>
          <button className="p-2 rounded-lg hover:bg-white/10" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 uppercase">Nom *</label>
              <input value={nom} onChange={(e) => setNom(e.target.value)} className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50" />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase">Secteur</label>
              <input value={secteur} onChange={(e) => setSecteur(e.target.value)} className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 uppercase">Niveau</label>
              <input value={niveau} onChange={(e) => setNiveau(e.target.value)} className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50" />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase">Remise</label>
              <input value={remise} onChange={(e) => setRemise(e.target.value)} className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50" />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase">Engagement</label>
            <textarea value={engagement} onChange={(e) => setEngagement(e.target.value)} rows={2} className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50 resize-none" />
          </div>
          
          <div className="border-t border-white/10 pt-4">
            <h3 className="text-sm font-medium text-white/60 mb-3">Contact référent</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/40 uppercase">Nom du référent</label>
                <input value={contactRef} onChange={(e) => setContactRef(e.target.value)} className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50" />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase">Fonction</label>
                <input value={contactFonction} onChange={(e) => setContactFonction(e.target.value)} className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50" />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase">Téléphone</label>
                <input value={contactTelephone} onChange={(e) => setContactTelephone(e.target.value)} className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50" />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase">Email</label>
                <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-white/40 uppercase">Adresse</label>
                <input value={contactAdresse} onChange={(e) => setContactAdresse(e.target.value)} className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase">Logo</label>
            <div className="mt-2 flex items-center gap-3">
              <input 
                type="text" 
                value={logo} 
                onChange={(e) => setLogo(e.target.value)} 
                placeholder="URL du logo"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50" 
              />
              <label className="cursor-pointer px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition text-sm text-white/60">
                <Upload className="w-4 h-4 inline mr-1" />
                Upload
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
            {(preview || logo) && (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-2">
                <img src={preview || logo} alt="Prévisualisation logo" className="h-10 w-10 rounded object-cover" />
                <span className="text-xs text-white/50">Logo prêt à être enregistré</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" checked={actif} onChange={(e) => setActif(e.target.checked)} className="rounded border-white/20 bg-white/5 text-brand-cyan" />
              Partenaire actif
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm">
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-brand-cyan text-[oklch(0.15_0_0)] text-sm font-medium hover:opacity-90 disabled:opacity-70">
              {submitting ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ===== MODALE CAMPAGNE =====
function CampagneModal({
  campagne,
  partenaires,
  onClose,
  onSave,
}: {
  campagne?: Campagne | null
  partenaires: Partenaire[]
  onClose: () => void
  onSave: (payload: Omit<Campagne, 'id_campagne' | 'date_creation' | 'partenaire_nom' | 'partenaire_niveau'> & { visuelFile?: File | null }) => Promise<void>
}) {
  const [idPartenaire, setIdPartenaire] = useState(campagne?.id_partenaire || 0)
  const [titre, setTitre] = useState(campagne?.titre || '')
  const [description, setDescription] = useState(campagne?.description || '')
  const [emplacement, setEmplacement] = useState<Campagne['emplacement']>(campagne?.emplacement || 'fil_annonces')
  const [visuel, setVisuel] = useState(campagne?.visuel || '')
  const [visuelFile, setVisuelFile] = useState<File | null>(null)
  const [preview, setPreview] = useState(campagne?.visuel || '')
  const [dateDebut, setDateDebut] = useState(campagne?.date_debut || '')
  const [dateFin, setDateFin] = useState(campagne?.date_fin || '')
  const [statut, setStatut] = useState<Campagne['statut']>(campagne?.statut || 'programmee')
  const [submitting, setSubmitting] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setVisuelFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!idPartenaire || !titre.trim() || !dateDebut) {
      alert('Veuillez remplir tous les champs obligatoires.')
      return
    }
    setSubmitting(true)
    try {
      await onSave({ 
        id_partenaire: idPartenaire,
        titre: titre.trim(),
        description: description.trim() || null,
        emplacement,
        visuel: visuel.trim() || null,
        date_debut: dateDebut,
        date_fin: dateFin || null,
        statut,
        visuelFile
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[oklch(0.22_0.005_260)] z-10">
          <div>
            <h2 className="text-xl font-bold">{campagne ? 'Modifier une campagne' : 'Nouvelle campagne'}</h2>
            <p className="text-white/50 text-sm">Créez une campagne de publicité native.</p>
          </div>
          <button className="p-2 rounded-lg hover:bg-white/10" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 grid gap-4">
          <div>
            <label className="text-xs text-white/40 uppercase">Partenaire *</label>
            <select 
              value={idPartenaire} 
              onChange={(e) => setIdPartenaire(parseInt(e.target.value))}
              className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50"
            >
              <option value="0" className="bg-[oklch(0.22_0.005_260)]">Sélectionner un partenaire</option>
              {partenaires.map(p => (
                <option key={p.id} value={p.id} className="bg-[oklch(0.22_0.005_260)]">{p.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase">Titre *</label>
            <input value={titre} onChange={(e) => setTitre(e.target.value)} className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50" />
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50 resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 uppercase">Emplacement *</label>
              <select 
                value={emplacement} 
                onChange={(e) => setEmplacement(e.target.value as Campagne['emplacement'])}
                className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50"
              >
                <option value="carte" className="bg-[oklch(0.22_0.005_260)]">Carte</option>
                <option value="fil_annonces" className="bg-[oklch(0.22_0.005_260)]">Fil d'annonces</option>
                <option value="bandeau_regional" className="bg-[oklch(0.22_0.005_260)]">Bandeau régional</option>
                <option value="page_partenaire" className="bg-[oklch(0.22_0.005_260)]">Page partenaire</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase">Statut</label>
              <select 
                value={statut} 
                onChange={(e) => setStatut(e.target.value as Campagne['statut'])}
                className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50"
              >
                <option value="programmee" className="bg-[oklch(0.22_0.005_260)]">Programmée</option>
                <option value="active" className="bg-[oklch(0.22_0.005_260)]">Active</option>
                <option value="suspendue" className="bg-[oklch(0.22_0.005_260)]">Suspendue</option>
                <option value="terminee" className="bg-[oklch(0.22_0.005_260)]">Terminée</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 uppercase">Date de début *</label>
              <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50" />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase">Date de fin</label>
              <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50" />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase">Visuel</label>
            <div className="mt-2 flex items-center gap-3">
              <input 
                type="text" 
                value={visuel} 
                onChange={(e) => setVisuel(e.target.value)} 
                placeholder="URL du visuel"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50" 
              />
              <label className="cursor-pointer px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition text-sm text-white/60">
                <Upload className="w-4 h-4 inline mr-1" />
                Upload
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
            {(preview || visuel) && (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-2">
                <img src={preview || visuel} alt="Prévisualisation" className="h-16 w-16 rounded object-cover" />
                <span className="text-xs text-white/50">Visuel prêt à être enregistré</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm">
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-brand-cyan text-[oklch(0.15_0_0)] text-sm font-medium hover:opacity-90 disabled:opacity-70">
              {submitting ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ===== COMPOSANT PRINCIPAL =====
export default function AdminPartenaires() {
  const [activeTab, setActiveTab] = useState<'comptes' | 'campagnes'>('comptes')
  const [partenaires, setPartenaires] = useState<Partenaire[]>([])
  const [campagnes, setCampagnes] = useState<Campagne[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showPartnerModal, setShowPartnerModal] = useState(false)
  const [showCampagneModal, setShowCampagneModal] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partenaire | null>(null)
  const [editingCampagne, setEditingCampagne] = useState<Campagne | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatut, setFilterStatut] = useState<string>('tous')
  const [filterEmplacement, setFilterEmplacement] = useState<string>('tous')
  const [sortField, setSortField] = useState<'nom' | 'date' | 'niveau'>('nom')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Statistiques
  const stats = useMemo(() => {
    const total = partenaires.length
    const actifs = partenaires.filter(p => p.actif).length
    const inactifs = total - actifs
    const niveaux = partenaires.reduce((acc, p) => {
      acc[p.niveau] = (acc[p.niveau] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return { total, actifs, inactifs, niveaux }
  }, [partenaires])

  const campagneStats = useMemo(() => {
    const total = campagnes.length
    const actives = campagnes.filter(c => c.statut === 'active').length
    const programmees = campagnes.filter(c => c.statut === 'programmee').length
    const suspendues = campagnes.filter(c => c.statut === 'suspendue').length
    const terminees = campagnes.filter(c => c.statut === 'terminee').length
    return { total, actives, programmees, suspendues, terminees }
  }, [campagnes])

  // Filtrer les partenaires
  const filteredPartenaires = useMemo(() => {
    let filtered = partenaires
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.nom.toLowerCase().includes(q) || 
        p.secteur.toLowerCase().includes(q) ||
        p.niveau.toLowerCase().includes(q)
      )
    }
    return filtered
  }, [partenaires, searchQuery])

  // Filtrer les campagnes
  const filteredCampagnes = useMemo(() => {
    let filtered = campagnes
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(c => 
        c.titre.toLowerCase().includes(q) || 
        (c.partenaire_nom || '').toLowerCase().includes(q)
      )
    }
    if (filterStatut !== 'tous') {
      filtered = filtered.filter(c => c.statut === filterStatut)
    }
    if (filterEmplacement !== 'tous') {
      filtered = filtered.filter(c => c.emplacement === filterEmplacement)
    }
    return filtered
  }, [campagnes, searchQuery, filterStatut, filterEmplacement])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [partenairesData, campagnesData] = await Promise.all([
        api.backofficePartenaires(),
        api.campagnes ? api.campagnes() : Promise.resolve([])
      ])
      setPartenaires(partenairesData.map(mapPartenaire))
      setCampagnes((campagnesData || []).map(mapCampagne))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les données')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Gestion des partenaires
  const handleOpenAddPartner = () => {
    setEditingPartner(null)
    setShowPartnerModal(true)
  }

  const handleSavePartner = async (payload: Omit<Partenaire, 'id' | 'dateCreation'> & { logoFile?: File | null }) => {
    setLoading(true)
    setError(null)
    try {
      let logoValue = payload.logo || ''
      if (payload.logoFile) {
        const uploadResult = await api.uploadPartenaireLogo(payload.logoFile)
        logoValue = uploadResult.url
      }

      if (editingPartner) {
        await api.updatePartenaire(editingPartner.id, {
          nom: payload.nom,
          secteur: payload.secteur,
          niveau: payload.niveau,
          remise: payload.remise,
          engagement: payload.engagement,
          logo: logoValue,
          actif: payload.actif ? 1 : 0,
        })
        setSuccessMessage('Partenaire mis à jour')
      } else {
        await api.createPartenaire({
          nom: payload.nom,
          secteur: payload.secteur,
          niveau: payload.niveau,
          remise: payload.remise,
          engagement: payload.engagement,
          logo: logoValue,
          actif: payload.actif ? 1 : 0,
        })
        setSuccessMessage('Partenaire créé')
      }
      setShowPartnerModal(false)
      await loadData()
      window.setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de sauvegarder le partenaire')
    } finally {
      setLoading(false)
    }
  }

  const handleEditPartner = (partner: Partenaire) => {
    setEditingPartner(partner)
    setShowPartnerModal(true)
  }

  const handleDeletePartner = async (id: string) => {
    if (!confirm('Supprimer ce partenaire ?')) return
    setLoading(true)
    setError(null)
    try {
      await api.deletePartenaire(id)
      setSuccessMessage('Partenaire supprimé')
      await loadData()
      window.setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de supprimer le partenaire')
    } finally {
      setLoading(false)
    }
  }

  // Gestion des campagnes
  const handleOpenAddCampagne = () => {
    setEditingCampagne(null)
    setShowCampagneModal(true)
  }

  const handleSaveCampagne = async (payload: any) => {
    setLoading(true)
    setError(null)
    try {
      let visuelValue = payload.visuel || ''
      if (payload.visuelFile) {
        const uploadResult = await api.uploadCampagneVisuel(payload.visuelFile)
        visuelValue = uploadResult.url
      }

      const data = {
        id_partenaire: payload.id_partenaire,
        titre: payload.titre,
        description: payload.description,
        emplacement: payload.emplacement,
        visuel: visuelValue,
        date_debut: payload.date_debut,
        date_fin: payload.date_fin,
        statut: payload.statut,
      }

      if (editingCampagne) {
        await api.updateCampagne(editingCampagne.id_campagne, data)
        setSuccessMessage('Campagne mise à jour')
      } else {
        await api.createCampagne(data)
        setSuccessMessage('Campagne créée')
      }
      setShowCampagneModal(false)
      await loadData()
      window.setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de sauvegarder la campagne')
    } finally {
      setLoading(false)
    }
  }

  const handleEditCampagne = (campagne: Campagne) => {
    setEditingCampagne(campagne)
    setShowCampagneModal(true)
  }

  const handleDeleteCampagne = async (id: number) => {
    if (!confirm('Supprimer cette campagne ?')) return
    setLoading(true)
    setError(null)
    try {
      await api.deleteCampagne(id)
      setSuccessMessage('Campagne supprimée')
      await loadData()
      window.setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de supprimer la campagne')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="bebas text-3xl text-white">Partenaires</h1>
            <p className="text-white/50 text-sm">
              {stats.total} partenaires · {stats.actifs} actifs · {stats.inactifs} inactifs
            </p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition text-white/60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="bg-brand-green/20 border border-brand-green/30 text-brand-green px-4 py-2 rounded-lg text-sm animate-in slide-in-from-top-2">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Onglets */}
        <div className="border-b border-white/10">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('comptes')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'comptes'
                  ? 'text-brand-cyan border-b-2 border-brand-cyan'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              Comptes partenaires
            </button>
            <button
              onClick={() => setActiveTab('campagnes')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'campagnes'
                  ? 'text-brand-cyan border-b-2 border-brand-cyan'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              Campagnes de publicités natives
            </button>
          </div>
        </div>

        {/* ===== ONGLET COMPTES PARTENAIRES ===== */}
        {activeTab === 'comptes' && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-brand-cyan">{stats.total}</div>
                <div className="text-xs text-white/40">Total partenaires</div>
              </div>
              <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{stats.actifs}</div>
                <div className="text-xs text-white/40">Actifs</div>
              </div>
              <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-red-400">{stats.inactifs}</div>
                <div className="text-xs text-white/40">Inactifs</div>
              </div>
              <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-amber-400">
                  {Object.keys(stats.niveaux).length}
                </div>
                <div className="text-xs text-white/40">Niveaux différents</div>
              </div>
            </div>

            {/* Recherche et bouton ajout */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1">
                <Search className="w-4 h-4 text-white/40" />
                <input
                  placeholder="Rechercher un partenaire..."
                  className="flex-1 bg-transparent outline-none text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-white/40 hover:text-white/70 text-xs p-1">
                    ✕
                  </button>
                )}
              </div>
              <button
                onClick={handleOpenAddPartner}
                className="flex items-center gap-2 px-4 py-2 bg-brand-cyan text-[oklch(0.15_0_0)] rounded-lg hover:opacity-90 transition whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Ajouter un partenaire
              </button>
            </div>

            {/* Liste des partenaires */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPartenaires.map((partner) => (
                <div key={partner.id} className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-brand-cyan/10 text-brand-cyan flex items-center justify-center overflow-hidden">
                        {partner.logo ? (
                          <img src={partner.logo} alt={partner.nom} className="h-full w-full object-cover" />
                        ) : (
                          <Building2 className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-white">{partner.nom}</div>
                        <div className="text-xs text-white/40">{partner.secteur}</div>
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full border text-white/70 ${partner.actif ? 'bg-green-500/10 text-green-300 border-green-500/20' : 'bg-red-500/10 text-red-300 border-red-500/20'}`}>
                      {partner.actif ? 'Actif' : 'Inactif'}
                    </div>
                  </div>

                  <div className="grid gap-2 text-sm text-white/60">
                    <div><span className="text-white/40">Niveau:</span> {partner.niveau}</div>
                    <div><span className="text-white/40">Remise:</span> {partner.remise}</div>
                    <div><span className="text-white/40">Engagement:</span> {partner.engagement}</div>
                    <div><span className="text-white/40">Créé le:</span> {partner.dateCreation}</div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    <button onClick={() => handleEditPartner(partner)} className="flex-1 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/5 transition gap-2 inline-flex items-center justify-center">
                      <Edit className="w-4 h-4" /> Modifier
                    </button>
                    <button onClick={() => handleDeletePartner(partner.id)} className="flex-1 border border-red-500/30 rounded-xl px-3 py-2 text-sm text-red-200 hover:bg-red-500/10 transition gap-2 inline-flex items-center justify-center">
                      <Trash2 className="w-4 h-4" /> Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredPartenaires.length === 0 && !loading && (
              <div className="text-center py-12 text-white/40">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Aucun partenaire trouvé</p>
              </div>
            )}
          </>
        )}

        {/* ===== ONGLET CAMPAGNES DE PUBLICITÉS NATIVES ===== */}
        {activeTab === 'campagnes' && (
          <>
            {/* KPIs Campagnes */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-brand-cyan">{campagneStats.total}</div>
                <div className="text-xs text-white/40">Total campagnes</div>
              </div>
              <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{campagneStats.actives}</div>
                <div className="text-xs text-white/40">Actives</div>
              </div>
              <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">{campagneStats.programmees}</div>
                <div className="text-xs text-white/40">Programmées</div>
              </div>
              <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-red-400">{campagneStats.suspendues}</div>
                <div className="text-xs text-white/40">Suspendues</div>
              </div>
              <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-gray-400">{campagneStats.terminees}</div>
                <div className="text-xs text-white/40">Terminées</div>
              </div>
            </div>

            {/* Filtres et recherche */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1">
                <Search className="w-4 h-4 text-white/40" />
                <input
                  placeholder="Rechercher une campagne..."
                  className="flex-1 bg-transparent outline-none text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-white/40 hover:text-white/70 text-xs p-1">
                    ✕
                  </button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={filterStatut}
                  onChange={(e) => setFilterStatut(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                >
                  <option value="tous" className="bg-[oklch(0.22_0.005_260)]">Tous les statuts</option>
                  <option value="active" className="bg-[oklch(0.22_0.005_260)]">Active</option>
                  <option value="programmee" className="bg-[oklch(0.22_0.005_260)]">Programmée</option>
                  <option value="suspendue" className="bg-[oklch(0.22_0.005_260)]">Suspendue</option>
                  <option value="terminee" className="bg-[oklch(0.22_0.005_260)]">Terminée</option>
                </select>
                <select
                  value={filterEmplacement}
                  onChange={(e) => setFilterEmplacement(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                >
                  <option value="tous" className="bg-[oklch(0.22_0.005_260)]">Tous les emplacements</option>
                  <option value="carte" className="bg-[oklch(0.22_0.005_260)]">Carte</option>
                  <option value="fil_annonces" className="bg-[oklch(0.22_0.005_260)]">Fil d'annonces</option>
                  <option value="bandeau_regional" className="bg-[oklch(0.22_0.005_260)]">Bandeau régional</option>
                  <option value="page_partenaire" className="bg-[oklch(0.22_0.005_260)]">Page partenaire</option>
                </select>
                <button
                  onClick={handleOpenAddCampagne}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-cyan text-[oklch(0.15_0_0)] rounded-lg hover:opacity-90 transition whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" /> Nouvelle campagne
                </button>
              </div>
            </div>

            {/* Liste des campagnes */}
            <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider">Campagne</th>
                      <th className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider">Partenaire</th>
                      <th className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider">Emplacement</th>
                      <th className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider">Période</th>
                      <th className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider">Statut</th>
                      <th className="text-center p-3 text-white/40 font-medium text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-white/40">
                          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-40" />
                          Chargement des campagnes...
                        </td>
                      </tr>
                    ) : filteredCampagnes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-white/40">
                          <Image className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p>Aucune campagne trouvée</p>
                        </td>
                      </tr>
                    ) : (
                      filteredCampagnes.map((campagne) => (
                        <tr key={campagne.id_campagne} className="hover:bg-white/5 transition">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {campagne.visuel ? (
                                <img src={campagne.visuel} alt={campagne.titre} className="w-10 h-10 rounded object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded bg-brand-cyan/10 flex items-center justify-center">
                                  <Image className="w-4 h-4 text-brand-cyan" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{campagne.titre}</div>
                                {campagne.description && (
                                  <div className="text-xs text-white/40 truncate max-w-[200px]">{campagne.description}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-sm">{campagne.partenaire_nom || `#${campagne.id_partenaire}`}</span>
                            {campagne.partenaire_niveau && (
                              <div className="text-xs text-white/40">{campagne.partenaire_niveau}</div>
                            )}
                          </td>
                          <td className="p-3">
                            <EmplacementBadge emplacement={campagne.emplacement} />
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              {new Date(campagne.date_debut).toLocaleDateString('fr-FR')}
                              {campagne.date_fin && (
                                <> → {new Date(campagne.date_fin).toLocaleDateString('fr-FR')}</>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <CampagneStatusBadge statut={campagne.statut} />
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditCampagne(campagne)}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCampagne(campagne.id_campagne)}
                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                <span>{filteredCampagnes.length} campagne(s)</span>
                <span className="flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Les encarts natifs s'affichent dans le fil d'annonces (niveau Or et +)
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modale Partenaire */}
      {showPartnerModal && (
        <PartnerModal
          partner={editingPartner}
          onClose={() => setShowPartnerModal(false)}
          onSave={handleSavePartner}
        />
      )}

      {/* Modale Campagne */}
      {showCampagneModal && (
        <CampagneModal
          campagne={editingCampagne}
          partenaires={partenaires}
          onClose={() => setShowCampagneModal(false)}
          onSave={handleSaveCampagne}
        />
      )}
    </AdminLayout>
  )
}