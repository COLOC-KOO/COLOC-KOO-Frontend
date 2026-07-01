import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, Camera, Check, DollarSign, House, Info, MapPin } from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { Button } from '../components/ui/Button'

const steps = [
  { n: 1, label: 'Type', icon: House },
  { n: 2, label: 'Localisation', icon: MapPin },
  { n: 3, label: 'Détails', icon: Info },
  { n: 4, label: 'Photos', icon: Camera },
  { n: 5, label: 'Tarifs', icon: DollarSign }
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

function StepType() {
  return (
    <div>
      <h2 className="bebas text-2xl">Quel type de bien proposes-tu ?</h2>
      <div className="mt-5 grid md:grid-cols-3 gap-3">
        {['Chambre en coloc', 'Appartement entier', 'Maison / villa'].map((t) => (
          <label
            key={t}
            className="border-2 border-border rounded-xl p-5 cursor-pointer has-[:checked]:border-brand-cyan has-[:checked]:bg-brand-cyan-light transition"
          >
            <input type="radio" name="type" className="sr-only" />
            <House className="w-6 h-6 text-brand-cyan-dark" />
            <div className="mt-3 font-semibold">{t}</div>
          </label>
        ))}
      </div>
    </div>
  )
}

function StepLocation() {
  return (
    <div>
      <h2 className="bebas text-2xl">Où se situe le bien ?</h2>
      <div className="mt-5 grid md:grid-cols-2 gap-4">
        <Field label="Ville">
          <select className="input">
            <option>Antananarivo</option>
            <option>Toamasina</option>
            <option>Mahajanga</option>
          </select>
        </Field>
        <Field label="Quartier">
          <input className="input" placeholder="Ex : Isoraka" />
        </Field>
        <Field label="Adresse">
          <input className="input" placeholder="Lot XII A 45..." />
        </Field>
        <Field label="Étage / accès">
          <input className="input" placeholder="RDC, ascenseur..." />
        </Field>
      </div>
    </div>
  )
}

function StepDetails() {
  return (
    <div>
      <h2 className="bebas text-2xl">Détails du bien</h2>
      <div className="mt-5 grid md:grid-cols-2 gap-4">
        <Field label="Surface chambre (m²)">
          <input type="number" className="input" />
        </Field>
        <Field label="Nb de colocataires">
          <input type="number" className="input" />
        </Field>
        <Field label="Meublé">
          <select className="input">
            <option>Oui</option>
            <option>Non</option>
          </select>
        </Field>
        <Field label="Disponibilité">
          <input type="date" className="input" />
        </Field>
        <div className="md:col-span-2">
          <Field label="Description">
            <textarea rows={4} className="input" placeholder="Décris l'ambiance, les colocs, le quartier..." />
          </Field>
        </div>
      </div>
    </div>
  )
}

function StepPhotos() {
  return (
    <div>
      <h2 className="bebas text-2xl">Ajoute des photos</h2>
      <p className="text-sm text-muted-foreground mt-1">Minimum 3 photos, jusqu'à 12.</p>
      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        <label className="aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:border-brand-cyan hover:bg-brand-cyan-light">
          <Camera className="w-8 h-8" />
          <span className="text-xs mt-2">Ajouter</span>
          <input type="file" className="sr-only" />
        </label>
      </div>
    </div>
  )
}

function StepPricing() {
  return (
    <div>
      <h2 className="bebas text-2xl">Tarif & conditions</h2>
      <div className="mt-5 grid md:grid-cols-2 gap-4">
        <Field label="Loyer / mois (Ar)">
          <input type="number" className="input" />
        </Field>
        <Field label="Charges (Ar)">
          <input type="number" className="input" />
        </Field>
        <Field label="Caution">
          <input type="number" className="input" />
        </Field>
        <Field label="Durée minimum">
          <select className="input">
            <option>1 mois</option>
            <option>3 mois</option>
            <option>6 mois</option>
            <option>1 an</option>
          </select>
        </Field>
      </div>
    </div>
  )
}

export default function Deposer() {
  const [step, setStep] = useState(1)

  return (
    <SiteLayout>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="bebas text-4xl">Dépose ton annonce</h1>
        <p className="text-muted-foreground mt-1">Publication gratuite pour les particuliers.</p>

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
                  <span
                    className={`text-[11px] font-semibold ${
                      active ? 'text-brand-cyan-dark' : 'text-muted-foreground'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${done ? 'bg-brand-green' : 'bg-border'}`} />
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-8 bg-card border border-border rounded-2xl p-8">
          {step === 1 && <StepType />}
          {step === 2 && <StepLocation />}
          {step === 3 && <StepDetails />}
          {step === 4 && <StepPhotos />}
          {step === 5 && <StepPricing />}

          <div className="mt-8 pt-6 border-t border-border flex justify-between">
            <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
              <ArrowLeft className="w-4 h-4" /> Précédent
            </Button>
            {step < 5 ? (
              <Button onClick={() => setStep(step + 1)} className="bg-brand-cyan hover:bg-brand-cyan-dark text-white">
                Continuer <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button className="bg-brand-green hover:bg-brand-green-dark text-white">Publier l'annonce</Button>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
