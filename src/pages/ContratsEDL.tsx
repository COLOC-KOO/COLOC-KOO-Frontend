import React, { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ArrowRight, Check, Download, FileText, Loader2 } from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { api, ContractDocumentRequest } from '../lib/api'
import { useAuth } from '../lib/auth'

type DocumentType = 'contrat' | 'edl'
type Profile = 'locataire' | 'proprietaire' | 'professionnel'
type Step = 'details' | 'clauses' | 'preview' | 'payment' | 'done'
type PageTab = 'create' | 'requests'

const EMPTY_FIELDS: Record<string, string> = {
  nom_demandeur: '',
  cin_demandeur: '',
  telephone_demandeur: '',
  email_demandeur: '',
  nom_autre_partie: '',
  cin_autre_partie: '',
  telephone_autre_partie: '',
  email_autre_partie: '',
  nom_entreprise: '',
  nif: '',
  representant: '',
  adresse: '',
  quartier: '',
  ville: '',
  type_bien: '',
  date_entree: '',
  loyer: '',
  charges: '',
  caution: '',
  type_bail: 'Collectif',
  solidarite: 'Sans',
  observations: '',
}

function guessProfile(poste?: string): Profile {
  if (poste === 'proprietaire') return 'proprietaire'
  if (poste === 'agent') return 'professionnel'
  return 'locataire'
}

function statusLabel(status: ContractDocumentRequest['statut']) {
  const labels: Record<ContractDocumentRequest['statut'], string> = {
    brouillon: 'Brouillon',
    'a-verifier': 'Paiement à vérifier',
    'en-cours': 'En traitement',
    valide: 'Validée',
    refuse: 'Refusée',
  }
  return labels[status]
}

function normalizePhone(value: string) {
  const startsWithPlus = value.trimStart().startsWith('+')
  const digits = value.replace(/\D/g, '').slice(0, 13)
  return startsWithPlus ? `+${digits}` : digits
}

export default function ContratsEDL() {
  const { user, loading } = useAuth()
  const [type, setType] = useState<DocumentType>('contrat')
  const [profile, setProfile] = useState<Profile>(() => guessProfile(user?.poste))
  const [fields, setFields] = useState(EMPTY_FIELDS)
  const [selectedClauses, setSelectedClauses] = useState<number[]>([])
  const [step, setStep] = useState<Step>('details')
  const [pageTab, setPageTab] = useState<PageTab>('create')
  const [clauses, setClauses] = useState<Array<{ id_clause: number; titre: string; description: string }>>([])
  const [mobileMoney, setMobileMoney] = useState<Array<{ nom: string; numero: string; couleur: string; hint: string }>>([])
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentReference, setPaymentReference] = useState('')
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [draft, setDraft] = useState<{ id: number; reference: string; montant: number } | null>(null)
  const [previewHtml, setPreviewHtml] = useState('')
  const [requests, setRequests] = useState<ContractDocumentRequest[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user) return
    setFields((current) => ({
      ...current,
      nom_demandeur: current.nom_demandeur || user.name || `${user.prenom} ${user.nom}`.trim(),
      email_demandeur: current.email_demandeur || user.email || '',
      telephone_demandeur: current.telephone_demandeur || normalizePhone(user.telephone || ''),
    }))
  }, [user])

  useEffect(() => {
    let active = true
    api.contractConfig().then((config) => {
      if (!active) return
      setClauses(config.clauses)
      setMobileMoney(config.mobileMoney)
    }).catch((loadError: unknown) => {
      if (active) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger le catalogue de documents.')
    })
    return () => { active = false }
  }, [])

  const refreshRequests = async () => {
    try {
      setRequests(await api.myContractDocumentRequests())
    } catch (loadError) {
      console.error('Erreur de chargement des demandes de documents :', loadError)
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger vos demandes.')
    }
  }

  useEffect(() => {
    if (user) void refreshRequests()
  }, [user])

  const requestPayload = useMemo(() => ({
    type_document: type,
    profil_demandeur: profile,
    donnees: fields,
    clauses_ids: selectedClauses,
  }), [fields, profile, selectedClauses, type])

  const updateField = (key: string, value: string) => {
    setFields((current) => ({ ...current, [key]: value }))
    setDraft(null)
  }

  const toggleClause = (id: number) => {
    setSelectedClauses((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id])
    setDraft(null)
  }

  const showPreview = async () => {
    setBusy(true)
    setError('')
    try {
      setPreviewHtml(await api.previewContractDocument(requestPayload))
      setStep('preview')
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : 'Impossible de générer l’aperçu.')
    } finally {
      setBusy(false)
    }
  }

  const continueToClauses = () => {
    const requiredFields = [
      'nom_demandeur',
      'telephone_demandeur',
      'email_demandeur',
      'nom_autre_partie',
      'telephone_autre_partie',
      'email_autre_partie',
      'adresse',
      'ville',
      'type_bien',
      'date_entree',
      ...(type === 'contrat' ? ['loyer'] : []),
      ...(profile === 'professionnel' ? ['nom_entreprise', 'representant'] : []),
    ]
    const missing = requiredFields.filter((key) => !fields[key]?.trim())
    if (missing.length) {
      setError('Merci de renseigner tous les champs obligatoires marqués d’un astérisque.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email_demandeur) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email_autre_partie)) {
      setError('Merci de vérifier le format des adresses e-mail.')
      return
    }
    if (['cin_demandeur', 'cin_autre_partie'].some((key) => fields[key] && !/^\d{1,12}$/.test(fields[key]))) {
      setError('Le CIN doit contenir au maximum 12 chiffres.')
      return
    }
    if (['telephone_demandeur', 'telephone_autre_partie'].some((key) => !/^\+?\d{1,13}$/.test(fields[key]))) {
      setError('Le téléphone doit contenir au maximum 13 chiffres.')
      return
    }
    setError('')
    setStep('clauses')
  }

  const continueToPayment = async () => {
    setBusy(true)
    setError('')
    try {
      const request = await api.createContractDocumentRequest(requestPayload)
      setDraft(request)
      setStep('payment')
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Impossible d’enregistrer la demande.')
    } finally {
      setBusy(false)
    }
  }

  const submitPayment = async () => {
    if (!draft) return
    setBusy(true)
    setError('')
    try {
      await api.submitContractDocumentPayment(draft.id, {
        moyen_paiement: paymentMethod,
        reference_operateur: paymentReference.trim(),
        preuve: paymentProof,
      })
      await refreshRequests()
      setStep('done')
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : 'Impossible d’enregistrer le paiement.')
    } finally {
      setBusy(false)
    }
  }

  const openFinalDocument = async (id: number) => {
    const documentWindow = window.open('', '_blank')
    if (!documentWindow) {
      setError('Autorise les fenêtres contextuelles pour ouvrir le document.')
      return
    }
    try {
      const html = await api.getContractDocumentRequestDocument(id)
      const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
      documentWindow.location.href = url
      window.setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (documentError) {
      documentWindow.close()
      setError(documentError instanceof Error ? documentError.message : 'Impossible de télécharger le document.')
    }
  }

  if (loading) return <div className="grid min-h-screen place-items-center">Chargement...</div>
  if (!user) return <Navigate to="/auth?mode=signin&redirect=%2Fcontrats-edl" replace />

  const isDocumentType = type === 'contrat' ? 'Contrat de location / colocation' : 'État des lieux'
  const otherParty = profile === 'locataire' ? 'Propriétaire / bailleur' : 'Locataire / autre partie'
  const numericFieldLimits: Record<string, number> = {
    cin_demandeur: 12,
    cin_autre_partie: 12,
    telephone_demandeur: 14,
    telephone_autre_partie: 14,
  }
  const field = (key: string, label: string, required = false, typeName = 'text') => (
    <label key={key} className="block text-sm">
      <span className="mb-1 block font-semibold">{label}{required && ' *'}</span>
      <input
        type={typeName}
        required={required}
        inputMode={key.startsWith('telephone_') ? 'tel' : numericFieldLimits[key] ? 'numeric' : undefined}
        maxLength={numericFieldLimits[key]}
        value={fields[key] || ''}
        onChange={(event) => updateField(
          key,
          key.startsWith('telephone_')
            ? normalizePhone(event.target.value)
            : numericFieldLimits[key]
              ? event.target.value.replace(/\D/g, '').slice(0, numericFieldLimits[key])
              : event.target.value,
        )}
        className="w-full rounded-lg border border-border bg-white px-3 py-2.5"
      />
    </label>
  )

  return (
    <SiteLayout>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <Link to="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-cyan-dark hover:underline">
          <ArrowLeft className="h-4 w-4" /> Services
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-cyan-light text-brand-cyan-dark">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="bebas text-3xl sm:text-4xl">Contrats &amp; états des lieux</h1>
            <p className="text-sm text-muted-foreground">Crée ton document en quelques étapes, vérifie l’aperçu, puis règle par Mobile Money.</p>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 rounded-2xl border border-brand-cyan/20 bg-brand-cyan-light/40 p-2 shadow-sm" role="tablist" aria-label="Contrats et états des lieux">
          <button
            type="button"
            role="tab"
            aria-selected={pageTab === 'create'}
            onClick={() => setPageTab('create')}
            className={`flex min-h-14 items-center justify-center rounded-xl border px-3 py-3 text-center text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 ${pageTab === 'create' ? 'border-brand-cyan bg-white text-brand-cyan-dark shadow-sm' : 'border-transparent bg-transparent text-muted-foreground hover:border-brand-cyan/30 hover:bg-white/70 hover:text-brand-cyan-dark'}`}
          >
            Créer un document
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={pageTab === 'requests'}
            onClick={() => { setPageTab('requests'); void refreshRequests() }}
            className={`flex min-h-14 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-center text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 ${pageTab === 'requests' ? 'border-brand-cyan bg-white text-brand-cyan-dark shadow-sm' : 'border-transparent bg-transparent text-muted-foreground hover:border-brand-cyan/30 hover:bg-white/70 hover:text-brand-cyan-dark'}`}
          >
            Mes demandes
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${pageTab === 'requests' ? 'bg-brand-cyan text-white' : 'bg-white text-brand-cyan-dark'}`}>{requests.length}</span>
          </button>
        </div>

        {error && <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}

        {pageTab === 'create' && step !== 'done' ? (
          <section className="mt-7 rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-7">
            <div className="mb-6 flex flex-wrap gap-2 text-xs font-semibold">
              {(['details', 'clauses', 'preview', 'payment'] as const).map((current, index) => (
                <span key={current} className={`rounded-full px-3 py-1.5 ${step === current ? 'bg-brand-cyan text-white' : 'bg-muted text-muted-foreground'}`}>
                  {index + 1}. {['Informations', 'Clauses', 'Aperçu', 'Paiement'][index]}
                </span>
              ))}
            </div>

            {step === 'details' && (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm"><span className="mb-1 block font-semibold">Document</span><select value={type} onChange={(event) => { setType(event.target.value as DocumentType); setDraft(null) }} className="w-full rounded-lg border border-border bg-white px-3 py-2.5"><option value="contrat">Contrat de location / colocation</option><option value="edl">État des lieux (commun aux profils)</option></select></label>
                  <label className="block text-sm"><span className="mb-1 block font-semibold">Profil du demandeur</span><select value={profile} onChange={(event) => { setProfile(event.target.value as Profile); setDraft(null) }} className="w-full rounded-lg border border-border bg-white px-3 py-2.5"><option value="locataire">Locataire</option><option value="proprietaire">Propriétaire</option><option value="professionnel">Professionnel</option></select></label>
                </div>
                {profile === 'professionnel' && <div className="grid gap-4 rounded-xl bg-muted/40 p-4 sm:grid-cols-2"><h2 className="font-bold sm:col-span-2">Informations professionnelles</h2>{field('nom_entreprise', 'Nom de l’entreprise', true)}{field('nif', 'NIF / identifiant professionnel')}{field('representant', 'Nom du représentant', true)}</div>}
                <div className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
                  <h2 className="font-bold sm:col-span-2">Demandeur</h2>
                  {field('nom_demandeur', profile === 'professionnel' ? 'Nom du contact' : 'Nom complet', true)}
                  {field('cin_demandeur', 'CIN (12 chiffres maximum)')}
                  {field('telephone_demandeur', 'Téléphone (13 chiffres maximum)', true, 'tel')}
                  {field('email_demandeur', 'E-mail', true, 'email')}
                </div>
                <div className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
                  <h2 className="font-bold sm:col-span-2">{otherParty}</h2>
                  {field('nom_autre_partie', 'Nom complet / raison sociale', true)}
                  {field('cin_autre_partie', 'CIN (12 chiffres maximum)')}
                  {field('telephone_autre_partie', 'Téléphone (13 chiffres maximum)', true, 'tel')}
                  {field('email_autre_partie', 'E-mail', true, 'email')}
                </div>
                <div className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
                  <h2 className="font-bold sm:col-span-2">Logement</h2>
                  {field('adresse', 'Adresse du logement', true)}
                  {field('quartier', 'Quartier')}
                  {field('ville', 'Ville', true)}
                  {field('type_bien', 'Type de bien (appartement, maison…)', true)}
                </div>
                {type === 'contrat' && (
                  <div className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
                    <h2 className="font-bold sm:col-span-2">Conditions de location</h2>
                    {field('date_entree', 'Date d’entrée', true, 'date')}
                    {field('loyer', 'Loyer mensuel (Ar)', true, 'number')}
                    {field('charges', 'Charges mensuelles (Ar)', false, 'number')}
                    {field('caution', 'Dépôt de garantie (Ar)', false, 'number')}
                    <label className="block text-sm"><span className="mb-1 block font-semibold">Type de bail</span><select value={fields.type_bail} onChange={(event) => updateField('type_bail', event.target.value)} className="w-full rounded-lg border border-border bg-white px-3 py-2.5"><option>Collectif</option><option>Individuel</option></select></label>
                    <label className="block text-sm"><span className="mb-1 block font-semibold">Clause de solidarité</span><select value={fields.solidarite} onChange={(event) => updateField('solidarite', event.target.value)} className="w-full rounded-lg border border-border bg-white px-3 py-2.5"><option>Sans</option><option>Avec</option></select></label>
                  </div>
                )}
                {type === 'edl' && field('date_entree', 'Date du constat', true, 'date')}
                <label className="block text-sm"><span className="mb-1 block font-semibold">Observations</span><textarea rows={3} value={fields.observations} onChange={(event) => updateField('observations', event.target.value)} className="w-full rounded-lg border border-border bg-white px-3 py-2.5" /></label>
                <div className="flex justify-end"><button type="button" onClick={continueToClauses} className="inline-flex items-center gap-2 rounded-xl bg-brand-magenta px-5 py-3 text-sm font-bold text-white">Continuer <ArrowRight className="h-4 w-4" /></button></div>
              </div>
            )}

            {step === 'clauses' && (
              <div>
                <h2 className="bebas text-2xl">Choisis les clauses à inclure</h2>
                <p className="mb-4 text-sm text-muted-foreground">Le catalogue est rédigé et géré par l’équipe Coloc’KOO. Les clauses d’état des lieux sont communes aux locataires, propriétaires et professionnels.</p>
                <div className="space-y-3">
                  {clauses.map((clause) => (
                    <label key={clause.id_clause} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 hover:bg-muted/30">
                      <input type="checkbox" checked={selectedClauses.includes(clause.id_clause)} onChange={() => toggleClause(clause.id_clause)} className="mt-1 h-4 w-4 accent-brand-cyan" />
                      <span><span className="block font-semibold">{clause.titre}</span><span className="mt-1 block text-sm text-muted-foreground">{clause.description}</span></span>
                    </label>
                  ))}
                  {clauses.length === 0 && <p className="text-sm text-muted-foreground">Aucune clause active n’est disponible. Tu peux continuer avec les clauses communes du document.</p>}
                </div>
                <div className="mt-5 flex justify-between"><button type="button" onClick={() => setStep('details')} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold">Précédent</button><button type="button" disabled={busy} onClick={() => void showPreview()} className="inline-flex items-center gap-2 rounded-xl bg-brand-magenta px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Générer l’aperçu</button></div>
              </div>
            )}

            {step === 'preview' && (
              <div>
                <h2 className="bebas text-2xl">Aperçu des deux premières pages</h2>
                <p className="mb-4 text-sm text-muted-foreground">Les pages de signature ne sont pas incluses. Vérifie les informations avant de continuer vers le paiement.</p>
                <iframe title="Aperçu du document" sandbox="" srcDoc={previewHtml} className="h-[70vh] w-full rounded-xl border border-border bg-white" />
                <div className="mt-5 flex flex-wrap justify-between gap-3"><button type="button" onClick={() => setStep('clauses')} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold">Modifier les clauses</button><button type="button" disabled={busy} onClick={() => void continueToPayment()} className="inline-flex items-center gap-2 rounded-xl bg-brand-magenta px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Continuer vers le paiement <ArrowRight className="h-4 w-4" /></button></div>
              </div>
            )}

            {step === 'payment' && (
              <div>
                <h2 className="bebas text-2xl">Paiement Mobile Money</h2>
                <p className="mb-4 text-sm text-muted-foreground">Sélectionne un moyen configuré, effectue le transfert puis saisis la référence opérateur. Sans accès à l’API officielle de l’opérateur, la référence et le montant seront vérifiés manuellement par notre équipe avant validation.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {mobileMoney.map((option) => (
                    <button key={option.nom} type="button" onClick={() => setPaymentMethod(option.nom)} className={`rounded-xl border p-4 text-left ${paymentMethod === option.nom ? 'border-brand-cyan bg-brand-cyan-light' : 'border-border'}`}>
                      <strong style={{ color: option.couleur }}>{option.nom}</strong>
                      <div className="mt-1 font-mono">{option.numero}</div>
                      <p className="mt-1 text-xs text-muted-foreground">{option.hint}</p>
                    </button>
                  ))}
                </div>
                {mobileMoney.length === 0 && <p role="alert" className="mt-3 text-sm text-red-600">Aucun moyen de paiement n’est configuré. Contacte l’équipe Coloc’KOO.</p>}
                <label className="mt-4 block text-sm"><span className="mb-1 block font-semibold">Référence du transfert *</span><input value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} maxLength={255} className="w-full rounded-lg border border-border px-3 py-2.5 font-mono" autoComplete="off" /><span className="mt-1 block text-xs text-muted-foreground">La référence seule ne confirme pas le paiement : l’équipe la comparera au reçu et au relevé Mobile Money.</span></label>
                {paymentMethod.toLowerCase().includes('mvola') && (
                  <label className="mt-4 block text-sm">
                    <span className="mb-1 block font-semibold">Capture du message de confirmation MVola * (PNG, JPEG ou WebP, 5 Mo maximum)</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      required
                      onChange={(event) => setPaymentProof(event.target.files?.[0] || null)}
                      className="block w-full rounded-lg border border-border bg-white px-3 py-2.5"
                    />
                    {paymentProof && <span className="mt-1 block text-xs text-muted-foreground">{paymentProof.name}</span>}
                    <span className="mt-1 block text-xs text-muted-foreground">La capture est conservée en privé et visible uniquement par l’équipe de vérification.</span>
                  </label>
                )}
                <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/50 p-4"><span className="font-semibold">{isDocumentType} · {draft?.reference}</span><strong className="bebas text-2xl text-brand-magenta">{Number(draft?.montant || 0).toLocaleString('fr-FR')} Ar</strong></div>
                <div className="mt-5 flex justify-between"><button type="button" onClick={() => setStep('preview')} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold">Retour à l’aperçu</button><button type="button" disabled={busy || !paymentMethod || paymentReference.trim().length < 4 || (paymentMethod.toLowerCase().includes('mvola') && !paymentProof)} onClick={() => void submitPayment()} className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Soumettre le paiement</button></div>
              </div>
            )}
          </section>
        ) : pageTab === 'create' ? (
          <section className="mt-7 rounded-2xl border border-brand-green/30 bg-brand-green-light/40 p-5">
            <h2 className="bebas text-2xl">Demande envoyée</h2>
            <p className="mt-1 text-sm text-muted-foreground">Le paiement sera vérifié par notre équipe. Le document final sera disponible dans cette page après validation.</p>
            <button type="button" onClick={() => setPageTab('requests')} className="mt-4 rounded-xl border border-brand-cyan px-4 py-2 text-sm font-bold text-brand-cyan-dark">Voir mes demandes</button>
            <button type="button" onClick={() => { setStep('details'); setDraft(null); setFields({ ...EMPTY_FIELDS, nom_demandeur: user.name, email_demandeur: user.email, telephone_demandeur: normalizePhone(user.telephone || '') }); setSelectedClauses([]); setPaymentReference(''); setPaymentMethod(''); setPaymentProof(null) }} className="mt-4 rounded-xl bg-brand-cyan px-4 py-2 text-sm font-bold text-white">Faire une nouvelle demande</button>
          </section>
        ) : (
          <section className="mt-7">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="bebas text-2xl">Mes demandes</h2>
                <p className="text-sm text-muted-foreground">Suivez le statut de vos demandes et retrouvez vos documents validés.</p>
              </div>
              <button type="button" onClick={() => void refreshRequests()} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-muted/50">Actualiser</button>
            </div>
            <div className="space-y-3">
            {requests.map((request) => (
              <article key={request.id_demande} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-4">
                <div>
                  <div className="font-semibold">{request.type_document === 'edl' ? 'État des lieux' : 'Contrat'} · {request.reference}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{statusLabel(request.statut)} · Paiement : {request.statut_paiement.replace(/-/g, ' ')}</div>
                </div>
                {request.statut === 'valide' && request.statut_paiement === 'conforme' && <button type="button" onClick={() => void openFinalDocument(request.id_demande)} className="inline-flex items-center gap-2 rounded-lg border border-brand-cyan px-3 py-2 text-sm font-bold text-brand-cyan-dark"><Download className="h-4 w-4" />Télécharger / imprimer le PDF</button>}
              </article>
            ))}
            {requests.length === 0 && <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">Aucune demande de document pour le moment.</p>}
            </div>
          </section>
        )}
      </main>
    </SiteLayout>
  )
}
