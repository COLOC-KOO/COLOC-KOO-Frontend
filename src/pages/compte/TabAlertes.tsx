import React, { useEffect, useState } from 'react'
import { Bell, BellPlus, Check, Trash, X, Plus } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  MES ALERTES — branché sur l'API backend :                          */
/*  GET    /api/alertes/:idUtilisateur                                 */
/*  POST   /api/alertes                                                */
/*  DELETE /api/alertes/:id                                            */
/* ------------------------------------------------------------------ */

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
const API = BASE.endsWith('/api') ? BASE.slice(0, -4) : BASE

const VILLES = [
  { id: 1, nom: 'Antananarivo' },
  { id: 2, nom: 'Mahajanga' },
  { id: 3, nom: 'Toamasina' },
  { id: 4, nom: 'Fianarantsoa' },
  { id: 5, nom: 'Antsirabe' },
  { id: 6, nom: 'Antsiranana' },
]

const TYPES_BIEN = ['Appartement', 'Maison'] as const
const REGLES_COLOC = ['Fille uniquement', 'Garçon uniquement', 'Animaux acceptés'] as const
const TYPES_ANNONCE = ['Colocation existante', "Création d'une colocation", 'Bien immobilier potentiel'] as const

interface AlerteForm {
  idVille: string
  quartier: string
  prixMax: string
  typeBien: string[]
  reglesColoc: string[]
  typeAnnonce: string[]
}

const EMPTY_FORM: AlerteForm = {
  idVille: '',
  quartier: '',
  prixMax: '',
  typeBien: [],
  reglesColoc: [],
  typeAnnonce: [],
}

/* Ligne renvoyée par l'API (table recherches_sauvegardees) */
interface Alerte {
  id: number
  nom_ville: string | null
  quartier: string | null
  prix_max: number | null
  type_propriete: string | null
  type_annonce: string | null
  regles: string | null
  notif_push: number
  notif_email: number
}

function toggleInArray(arr: string[], value: string) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-3 border border-border rounded-lg px-3 py-2.5 text-sm cursor-pointer hover:bg-muted/50 transition-colors">
      <span
        onClick={(e) => { e.preventDefault(); onChange() }}
        className={`w-5 h-5 shrink-0 rounded flex items-center justify-center border transition-colors ${
          checked ? 'bg-brand-green border-brand-green' : 'border-border bg-white'
        }`}
      >
        {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </span>
      <span className="text-foreground/90">{label}</span>
    </label>
  )
}

function buildTitre(a: Alerte): string {
  const ville = a.nom_ville ?? 'Toutes villes'
  const suite = a.quartier ?? (a.type_annonce ? a.type_annonce.split(',')[0] : 'Colocation')
  return `${ville} · ${suite}`
}

function buildCriteres(a: Alerte): string[] {
  const criteres: string[] = []
  if (a.prix_max) criteres.push(`Loyer ≤ ${Number(a.prix_max).toLocaleString('fr-FR')} Ar`)
  if (a.type_propriete) criteres.push(...a.type_propriete.split(',').filter(Boolean))
  if (a.regles) {
    try { criteres.push(...(JSON.parse(a.regles) as string[])) } catch { /* ignore */ }
  }
  if (a.type_annonce) criteres.push(...a.type_annonce.split(',').filter(Boolean))
  return criteres
}

export default function TabAlertes({ idUtilisateur }: { idUtilisateur: number }) {
  const [alertes, setAlertes] = useState<Alerte[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<AlerteForm>(EMPTY_FORM)

  const charger = async () => {
    try {
      const res = await fetch(`${API}/api/alertes/${idUtilisateur}`)
      if (res.ok) setAlertes(await res.json())
    } catch (err) {
      console.error('Erreur chargement des alertes :', err)
    }
  }

  useEffect(() => { charger() }, [idUtilisateur])

  const removeAlerte = async (id: number) => {
    await fetch(`${API}/api/alertes/${id}`, { method: 'DELETE' })
    setAlertes((prev) => prev.filter((a) => a.id !== id))
  }

  const closeModal = () => {
    setShowModal(false)
    setForm(EMPTY_FORM)
  }

  const handleSubmit = async () => {
    await fetch(`${API}/api/alertes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_utilisateur: idUtilisateur,
        id_ville: form.idVille ? Number(form.idVille) : null,
        quartier: form.quartier || null,
        prix_max: form.prixMax ? Number(form.prixMax) : null,
        types_bien: form.typeBien,
        regles: form.reglesColoc,
        types_annonce: form.typeAnnonce,
      }),
    })
    closeModal()
    charger()
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Bell className="w-5 h-5 text-brand-cyan" />
        <h2 className="bebas text-2xl">Mes alertes sauvegardées</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Sois notifié·e dès qu'une nouvelle annonce correspond à tes critères.
      </p>

      {alertes.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Bell className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm font-semibold">Aucune alerte pour le moment</p>
        </div>
      ) : (
        alertes.map((a) => (
          <div key={a.id} className="border border-border rounded-2xl p-4 mb-3">
            <div className="text-sm font-bold text-foreground mb-2">{buildTitre(a)}</div>
            <div className="flex flex-wrap gap-2 mb-3">
              {buildCriteres(a).map((c) => (
                <span key={c} className="text-[11px] font-semibold bg-muted text-foreground/70 rounded-md px-2.5 py-1">
                  {c}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-xs text-muted-foreground">Notification :</span>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" defaultChecked={!!a.notif_push} className="accent-brand-green w-4 h-4" /> Push
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" defaultChecked={!!a.notif_email} className="accent-brand-green w-4 h-4" /> E-mail
              </label>
              <button
                onClick={() => removeAlerte(a.id)}
                className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-600 rounded-lg px-3 py-1.5 hover:bg-red-600 hover:text-white transition-colors"
              >
                <Trash className="w-3.5 h-3.5" /> Supprimer
              </button>
            </div>
          </div>
        ))
      )}

      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 text-sm font-semibold border border-border rounded-lg px-4 py-2 hover:bg-muted transition-colors"
      >
        <Plus className="w-4 h-4" /> Créer une nouvelle alerte
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-1.5 rounded-full bg-muted hover:bg-muted/70">
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-full bg-brand-green-light text-brand-green flex items-center justify-center mx-auto mb-3">
              <BellPlus className="w-6 h-6" />
            </div>
            <h3 className="bebas text-xl text-center mb-1">Créer une alerte</h3>
            <p className="text-xs text-muted-foreground text-center mb-5">
              Sois notifié·e dès qu'une annonce correspond à tes critères.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Ville</label>
                <select
                  value={form.idVille}
                  onChange={(e) => setForm((prev) => ({ ...prev, idVille: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="">— Choisir —</option>
                  {VILLES.map((v) => (
                    <option key={v.id} value={v.id}>{v.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Quartier <span className="font-normal text-muted-foreground">— optionnel</span>
                </label>
                <input
                  value={form.quartier}
                  onChange={(e) => setForm((prev) => ({ ...prev, quartier: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                  placeholder="Ex. Ankadindramamy"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1">Prix maximum (Ar)</label>
              <input
                type="number"
                value={form.prixMax}
                onChange={(e) => setForm((prev) => ({ ...prev, prixMax: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                placeholder="Ex. 400 000"
              />
            </div>

            <div className="mb-4">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Type de bien</div>
              <div className="grid grid-cols-2 gap-2">
                {TYPES_BIEN.map((label) => (
                  <Checkbox
                    key={label}
                    label={label}
                    checked={form.typeBien.includes(label)}
                    onChange={() => setForm((prev) => ({ ...prev, typeBien: toggleInArray(prev.typeBien, label) }))}
                  />
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Règles de la coloc</div>
              <div className="grid grid-cols-2 gap-2">
                {REGLES_COLOC.map((label) => (
                  <Checkbox
                    key={label}
                    label={label}
                    checked={form.reglesColoc.includes(label)}
                    onChange={() => setForm((prev) => ({ ...prev, reglesColoc: toggleInArray(prev.reglesColoc, label) }))}
                  />
                ))}
              </div>
            </div>

            <div className="mb-5">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Type d'annonce</div>
              <div className="grid grid-cols-2 gap-2">
                {TYPES_ANNONCE.map((label) => (
                  <Checkbox
                    key={label}
                    label={label}
                    checked={form.typeAnnonce.includes(label)}
                    onChange={() => setForm((prev) => ({ ...prev, typeAnnonce: toggleInArray(prev.typeAnnonce, label) }))}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 border border-border rounded-lg py-2.5 text-sm font-semibold hover:bg-muted">
                Annuler
              </button>
              <button onClick={handleSubmit} className="flex-1 bg-brand-green text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90">
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
