import React, { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Camera, Check, DollarSign, House, Info, MapPin } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { SiteLayout } from '../components/site/SiteLayout'
import { Button } from '../components/ui/Button'
import { api, Ville } from '../lib/api'
import { useAuth } from '../lib/auth'

const steps = [
  { n: 1, label: 'Type', icon: House },
  { n: 2, label: 'Localisation', icon: MapPin },
  { n: 3, label: 'Details', icon: Info },
  { n: 4, label: 'Photos', icon: Camera },
  { n: 5, label: 'Tarifs', icon: DollarSign },
]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

export default function Deposer() {
  const [step, setStep] = useState(1)
  const [villes, setVilles] = useState<Ville[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    titre: '',
    description: '',
    type_propriete: 'appartement',
    type_bailleur: 'membre',
    id_ville: 1,
    quartier: '',
    adresse_exacte: '',
    surface_totale: '',
    total_colocataires: '',
    surface_chambre: '',
    est_meuble: 'Oui',
    date_disponibilite: '',
    prix_loyer: '',
    prix_charges: '',
    montant_garantie: '',
    services: 'Wi-Fi, Cuisine equipee',
    regles: 'Non fumeur',
    photos: [] as string[],
  })

  useEffect(() => {
    api.villes().then((rows) => {
      setVilles(rows)
      if (rows[0]) setForm((current) => ({ ...current, id_ville: rows[0].id_ville }))
    })
  }, [])

  function update(name: string, value: string | number) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return

    const previews = await Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
            reader.onerror = () => reject(new Error('Impossible de lire l’image'))
            reader.readAsDataURL(file)
          })
      )
    )

    setForm((current) => ({ ...current, photos: [...current.photos, ...previews.filter(Boolean)] }))
  }

  async function submitAnnonce() {
    if (!user) {
      navigate('/auth?mode=signin&redirect=/deposer')
      return
    }
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await api.createAnnonce({
        titre: form.titre,
        description: form.description,
        type_bailleur: form.type_bailleur,
        type_annonce: user.poste === 'proprietaire' ? 'creation' : 'existante',
        type_propriete: form.type_propriete,
        total_colocataires: form.total_colocataires ? Number(form.total_colocataires) : null,
        surface_totale: form.surface_totale ? Number(form.surface_totale) : null,
        adresse_exacte: form.adresse_exacte || null,
        quartier: form.quartier || null,
        id_ville: Number(form.id_ville),
        chambres: {
          surface: form.surface_chambre ? Number(form.surface_chambre) : null,
          est_meuble: form.est_meuble,
          prix_loyer: Number(form.prix_loyer),
          prix_charges: form.prix_charges ? Number(form.prix_charges) : null,
          montant_garantie: form.montant_garantie ? Number(form.montant_garantie) : null,
          date_disponibilite: form.date_disponibilite,
        },
        services: form.services.split(',').map((item) => item.trim()).filter(Boolean),
        regles: form.regles.split(',').map((item) => item.trim()).filter(Boolean),
        photos: form.photos,
      })
      setSuccess("Annonce envoyee. Elle sera visible apres validation par l'admin.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer l'annonce")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SiteLayout>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="bebas text-4xl">Depose ton annonce</h1>
        <p className="text-muted-foreground mt-1">Publication apres validation admin.</p>

        {!user && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-center justify-between gap-3">
            <span>Connecte-toi pour envoyer une annonce.</span>
            <Link to="/auth?mode=signin&redirect=/deposer" className="font-semibold underline">
              Connexion
            </Link>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          {steps.map((s, i) => {
            const active = step === s.n
            const done = step > s.n
            return (
              <div key={s.n} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      done
                        ? 'bg-brand-green border-brand-green text-white'
                        : active
                        ? 'bg-brand-cyan border-brand-cyan text-white'
                        : 'bg-white border-border text-muted-foreground'
                    }`}
                  >
                    {done ? <Check className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[11px] font-semibold ${active ? 'text-brand-cyan-dark' : 'text-muted-foreground'}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${done ? 'bg-brand-green' : 'bg-border'}`} />}
              </div>
            )
          })}
        </div>

        <div className="mt-8 bg-card border border-border rounded-2xl p-8">
          {step === 1 && (
            <div>
              <h2 className="bebas text-2xl">Type de bien</h2>
              <div className="mt-5 grid md:grid-cols-3 gap-3">
                {[
                  ['appartement', 'Appartement'],
                  ['maison', 'Maison'],
                  ['autre', 'Autre'],
                ].map(([value, label]) => (
                  <label key={value} className="border-2 border-border rounded-xl p-5 cursor-pointer has-[:checked]:border-brand-cyan has-[:checked]:bg-brand-cyan-light transition">
                    <input
                      type="radio"
                      name="type_propriete"
                      value={value}
                      checked={form.type_propriete === value}
                      onChange={(e) => update('type_propriete', e.target.value)}
                      className="sr-only"
                    />
                    <House className="w-6 h-6 text-brand-cyan-dark" />
                    <div className="mt-3 font-semibold">{label}</div>
                  </label>
                ))}
              </div>
              <div className="mt-5">
                <Field label="Titre">
                  <input required className="input" value={form.titre} onChange={(e) => update('titre', e.target.value)} placeholder="Chambre lumineuse a Isoraka" />
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="bebas text-2xl">Localisation</h2>
              <div className="mt-5 grid md:grid-cols-2 gap-4">
                <Field label="Ville">
                  <select className="input" value={form.id_ville} onChange={(e) => update('id_ville', Number(e.target.value))}>
                    {villes.map((v) => (
                      <option key={v.id_ville} value={v.id_ville}>{v.nom_ville}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Quartier">
                  <input className="input" value={form.quartier} onChange={(e) => update('quartier', e.target.value)} />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Adresse">
                    <input className="input" value={form.adresse_exacte} onChange={(e) => update('adresse_exacte', e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="bebas text-2xl">Details</h2>
              <div className="mt-5 grid md:grid-cols-2 gap-4">
                <Field label="Surface totale (m2)">
                  <input type="number" className="input" value={form.surface_totale} onChange={(e) => update('surface_totale', e.target.value)} />
                </Field>
                <Field label="Nb de colocataires">
                  <input type="number" className="input" value={form.total_colocataires} onChange={(e) => update('total_colocataires', e.target.value)} />
                </Field>
                <Field label="Surface chambre (m2)">
                  <input type="number" className="input" value={form.surface_chambre} onChange={(e) => update('surface_chambre', e.target.value)} />
                </Field>
                <Field label="Meuble">
                  <select className="input" value={form.est_meuble} onChange={(e) => update('est_meuble', e.target.value)}>
                    <option>Oui</option>
                    <option>Partiellement</option>
                    <option>Non</option>
                    <option>Rachat</option>
                  </select>
                </Field>
                <Field label="Disponibilite">
                  <input type="date" className="input" value={form.date_disponibilite} onChange={(e) => update('date_disponibilite', e.target.value)} />
                </Field>
                <Field label="Equipements (separes par virgule)">
                  <input className="input" value={form.services} onChange={(e) => update('services', e.target.value)} />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Description">
                    <textarea rows={4} className="input" value={form.description} onChange={(e) => update('description', e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="bebas text-2xl">Photos</h2>
              <p className="text-sm text-muted-foreground mt-1">Ajoute une ou plusieurs photos depuis ton appareil.</p>
              <div className="mt-5">
                <Field label="Photos du bien">
                  <input type="file" accept="image/*" multiple className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm" onChange={handlePhotoUpload} />
                </Field>
                {form.photos.length > 0 ? (
                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                    {form.photos.map((photo, index) => (
                      <img key={`${photo.slice(0, 20)}-${index}`} src={photo} alt={`Photo ${index + 1}`} className="h-28 w-full rounded-lg object-cover border border-border" />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="bebas text-2xl">Tarif et conditions</h2>
              <div className="mt-5 grid md:grid-cols-2 gap-4">
                <Field label="Loyer / mois (Ar)">
                  <input required type="number" className="input" value={form.prix_loyer} onChange={(e) => update('prix_loyer', e.target.value)} />
                </Field>
                <Field label="Charges (Ar)">
                  <input type="number" className="input" value={form.prix_charges} onChange={(e) => update('prix_charges', e.target.value)} />
                </Field>
                <Field label="Caution (Ar)">
                  <input type="number" className="input" value={form.montant_garantie} onChange={(e) => update('montant_garantie', e.target.value)} />
                </Field>
                <Field label="Regles (separees par virgule)">
                  <input className="input" value={form.regles} onChange={(e) => update('regles', e.target.value)} />
                </Field>
              </div>
            </div>
          )}

          {error && <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {success && <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

          <div className="mt-8 pt-6 border-t border-border flex justify-between">
            <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
              <ArrowLeft className="w-4 h-4" /> Precedent
            </Button>
            {step < 5 ? (
              <Button type="button" onClick={() => setStep(step + 1)} className="bg-brand-cyan hover:bg-brand-cyan-dark text-white">
                Continuer <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button disabled={submitting || !form.titre || !form.prix_loyer || !form.date_disponibilite} onClick={submitAnnonce} className="bg-brand-green hover:bg-brand-green-dark text-white">
                {submitting ? 'Envoi...' : "Envoyer a l'admin"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
