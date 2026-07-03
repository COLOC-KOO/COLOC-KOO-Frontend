import React, { useEffect, useState } from 'react'
import { Building2, Plus, Edit, Trash2, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { api } from '../../lib/api'

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
}

interface ApiPartenaire {
  id_partenaire: number
  nom: string
  secteur: string | null
  niveau: string | null
  remise: string | null
  engagement: string | null
  logo: string | null
  actif: 0 | 1
  date_creation: string
}

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
  }
}

function PartnerModal({
  partner,
  onClose,
  onSave,
}: {
  partner?: Partenaire | null
  onClose: () => void
  onSave: (payload: Omit<Partenaire, 'id' | 'dateCreation'>) => void
}) {
  const [nom, setNom] = useState(partner?.nom || '')
  const [secteur, setSecteur] = useState(partner?.secteur || '')
  const [niveau, setNiveau] = useState(partner?.niveau || '')
  const [remise, setRemise] = useState(partner?.remise || '')
  const [engagement, setEngagement] = useState(partner?.engagement || '')
  const [logo, setLogo] = useState(partner?.logo || '')
  const [actif, setActif] = useState(partner?.actif ?? true)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!nom.trim()) return
    onSave({ nom: nom.trim(), secteur: secteur.trim(), niveau: niveau.trim(), remise: remise.trim(), engagement: engagement.trim(), logo: logo.trim(), actif })
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-3xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{partner ? 'Modifier un partenaire' : 'Ajouter un partenaire'}</h2>
            <p className="text-white/50 text-sm">Remplissez les informations du partenaire.</p>
          </div>
          <button className="p-2 rounded-lg hover:bg-white/10" onClick={onClose}>
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 uppercase">Nom</label>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 uppercase">Engagement</label>
              <input value={engagement} onChange={(e) => setEngagement(e.target.value)} className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50" />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase">Logo</label>
              <input value={logo} onChange={(e) => setLogo(e.target.value)} className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" checked={actif} onChange={(e) => setActif(e.target.checked)} className="rounded border-white/20 bg-white/5 text-brand-cyan" />
              Actif
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm">
              Annuler
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-brand-cyan text-[oklch(0.15_0_0)] text-sm font-medium hover:opacity-90">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminPartenaires() {
  const [partenaires, setPartenaires] = useState<Partenaire[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partenaire | null>(null)

  const loadPartenaires = async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await api.backofficePartenaires()
      setPartenaires(rows.map(mapPartenaire))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les partenaires')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPartenaires()
  }, [])

  const handleOpenAdd = () => {
    setEditingPartner(null)
    setShowModal(true)
  }

  const handleSavePartenaire = async (payload: Omit<Partenaire, 'id' | 'dateCreation'>) => {
    setLoading(true)
    setError(null)
    try {
      if (editingPartner) {
        await api.updatePartenaire(editingPartner.id, {
          nom: payload.nom,
          secteur: payload.secteur,
          niveau: payload.niveau,
          remise: payload.remise,
          engagement: payload.engagement,
          logo: payload.logo,
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
          logo: payload.logo,
          actif: payload.actif ? 1 : 0,
        })
        setSuccessMessage('Partenaire créé')
      }
      setShowModal(false)
      await loadPartenaires()
      window.setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de sauvegarder le partenaire')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (partner: Partenaire) => {
    setEditingPartner(partner)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce partenaire ?')) return
    setLoading(true)
    setError(null)
    try {
      await api.deletePartenaire(id)
      setSuccessMessage('Partenaire supprimé')
      await loadPartenaires()
      window.setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de supprimer le partenaire')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="bebas text-3xl text-white">Partenaires</h1>
            <p className="text-white/50 text-sm">Gestion des partenaires enregistrés dans la base.</p>
          </div>
          <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2 bg-brand-cyan text-[oklch(0.15_0_0)] rounded-lg hover:opacity-90 transition">
            <Plus className="w-4 h-4" /> Ajouter un partenaire
          </button>
        </div>

        {successMessage && (
          <div className="bg-brand-green/20 border border-brand-green/30 text-brand-green px-4 py-2 rounded-lg text-sm">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}
        {loading && (
          <div className="bg-white/5 border border-white/10 text-white/70 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Chargement...
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partenaires.map((partner) => (
            <div key={partner.id} className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-brand-cyan/10 text-brand-cyan flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
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
                <button onClick={() => handleEdit(partner)} className="flex-1 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/5 transition gap-2 inline-flex items-center justify-center">
                  <Edit className="w-4 h-4" /> Modifier
                </button>
                <button onClick={() => handleDelete(partner.id)} className="flex-1 border border-red-500/30 rounded-xl px-3 py-2 text-sm text-red-200 hover:bg-red-500/10 transition gap-2 inline-flex items-center justify-center">
                  <Trash2 className="w-4 h-4" /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <PartnerModal
            partner={editingPartner}
            onClose={() => setShowModal(false)}
            onSave={handleSavePartenaire}
          />
        )}
      </div>
    </AdminLayout>
  )
}
