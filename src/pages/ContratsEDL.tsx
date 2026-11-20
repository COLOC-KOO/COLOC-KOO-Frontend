import React, { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ArrowRight, Check, Download, FileText, Loader2, Trash2 } from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { api, ContractDocumentRequest } from '../lib/api'
import { useAuth } from '../lib/auth'
import contratsImmoSpec from '../data/contratsImmoSpec.json'

type DocumentType = 'contrat' | 'edl'
type Profile = 'locataire' | 'proprietaire' | 'professionnel'
type Step = 'details' | 'clauses' | 'summary' | 'preview' | 'payment' | 'done'
type PageTab = 'create' | 'requests'
type TemplateId = 'autorisation_colocation' | 'avenant_substitution' | 'charte_colocation' | 'contrat_intercolocs' | 'contrat_mandacolocs' | 'contrat_propriocolocs' | 'etat_des_lieux' | 'mandat_gestion' | 'attestation_logement'

const DOCUMENT_TEMPLATES: Array<{ id: TemplateId; title: string; keyword: string; profile?: Profile }> = [
  { id: 'contrat_intercolocs', title: 'Contrat Intercolocs', keyword: 'Intercolocs', profile: 'locataire' },
  { id: 'contrat_propriocolocs', title: 'Contrat Propriocolocs', keyword: 'Propriocolocs', profile: 'proprietaire' },
  { id: 'contrat_mandacolocs', title: 'Contrat Mandacolocs', keyword: 'Mandacolocs', profile: 'professionnel' },
  { id: 'autorisation_colocation', title: 'Autorisation de colocation', keyword: 'Autorisation' },
  { id: 'mandat_gestion', title: 'Mandat de gestion', keyword: 'Mandat' },
  { id: 'avenant_substitution', title: 'Avenant de substitution', keyword: 'Avenant' },
  { id: 'etat_des_lieux', title: 'État des lieux', keyword: 'lieux' },
  { id: 'charte_colocation', title: 'Charte de colocation', keyword: 'Charte' },
  { id: 'attestation_logement', title: 'Attestation de logement', keyword: 'Attestation logement' },
]

function humanizeVariable(value: string) { return value.replace(/_/g, ' ').replace(/\b\w/g, (letter: string) => letter.toUpperCase()) }

function documentTitle(templateId?: string | null, type?: DocumentType, profile?: Profile) {
  const matched = DOCUMENT_TEMPLATES.find((item) => item.id === templateId)
  if (matched) return matched.title
  if (type === 'edl') return 'État des lieux'
  return DOCUMENT_TEMPLATES.find((item) => item.profile === profile)?.title || 'Contrat'
}

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
  nom_proprietaire: '',
  adresse_proprietaire: '',
  cin_proprietaire: '',
  telephone_proprietaire: '',
  email_proprietaire: '',
  date_naissance_demandeur: '',
  ville_naissance_demandeur: '',
  pays_naissance_demandeur: '',
  date_naissance_autre_partie: '',
  ville_naissance_autre_partie: '',
  pays_naissance_autre_partie: '',
  adresse: '',
  code_postal: '',
  quartier: '',
  ville: '',
  type_bien: '',
  date_entree: '',
  loyer: '',
  charges: '',
  caution: '',
  solidarite: '',
  observations: '',
  nombre_colocataires: '',
  choix_colocataires: '',
  delai_validation: '',
  personne_morale: '',
  pouvoir_signature: '',
  meuble: '',
  duree_bail: '',
  mois_depot: '1',
  periodicite_revision: '3',
  revision_date_anniversaire: '',
  taux_revision: '',
  preavis_bailleur: '',
  jour_paiement: '',
  salle_bain_privee: '',
  niveaux_texte: '',
  espace_privatif_description: '',
  charges_avec: '',
  charges_lignes_texte: '',
  modes_reglement: '',
  bail_principal_proprietaire: '',
  bail_principal_date_effet: '',
  bail_principal_duree: '',
  bail_principal_date_fin: '',
  bail_principal_article: '',
  representant_qualite: '',
  forme_juridique: '',
  rcs: '',
  stat: '',
  adresse_entreprise: '',
  mandataire_agrement: '',
  mandataire_rc_pro: '',
  date_mandat: '',
  inclure_charte: 'non',
  inclure_attestation_logement: 'non',
  inclure_attestation_especes: 'non',
  especes_montant: '',
  especes_motif: '',
  especes_ville: '',
  especes_date: '',
  autorisation_signee: '',
  gestionnaire_date_naissance: '',
  tranquillite_21h_6h: '',
  tranquillite_debut: '',
  tranquillite_fin: '',
  invites_3_6: '',
  invites_limite_nuits: '',
  menage_planning: '',
  tabac_exterieur: '',
  tabac_interieur_communs: '',
  tabac_interieur_privatifs: '',
  tabac_espaces_designes: '',
  tabac_espaces: '',
  repartition_texte: '',
  loyer_total: '',
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
  const [templateId, setTemplateId] = useState<TemplateId | ''>('')
  const [profile, setProfile] = useState<Profile | ''>('')
  const [fields, setFields] = useState(EMPTY_FIELDS)
  const [selectedClauses, setSelectedClauses] = useState<number[]>([])
  const [step, setStep] = useState<Step>('details')
  const [pageTab, setPageTab] = useState<PageTab>('create')
  const [clauses, setClauses] = useState<Array<{ id_clause: number; titre: string; description: string }>>([])
  const [mobileMoney, setMobileMoney] = useState<Array<{ nom: string; numero: string; couleur: string; hint: string }>>([])
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentReference, setPaymentReference] = useState('')
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [autorisationFile, setAutorisationFile] = useState<File | null>(null)
  const [mandatFile, setMandatFile] = useState<File | null>(null)
  const [occupantIndex, setOccupantIndex] = useState(1)
  const [draft, setDraft] = useState<{ id: number; reference: string; montant: number } | null>(null)
  const [previewPages, setPreviewPages] = useState<string[]>([])
  const [requests, setRequests] = useState<ContractDocumentRequest[]>([])
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

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
    template_id: templateId || undefined,
    profil_demandeur: profile as Profile,
    donnees: fields,
    clauses_ids: selectedClauses,
  }), [fields, profile, selectedClauses, templateId, type])

  const activeTemplate = DOCUMENT_TEMPLATES.find((item) => item.id === templateId)
  const isAuxiliaryTemplate = Boolean(activeTemplate && !activeTemplate.profile)
  const extraVariables = activeTemplate && !activeTemplate.profile
    ? contratsImmoSpec.variables.filter((item) => item.documents.includes(activeTemplate.keyword) && !item.type.toLowerCase().includes('calcul') && !/^(so_|repartition_)/.test(item.variable))
    : []

  const chooseTemplate = (value: string) => {
    const selected = DOCUMENT_TEMPLATES.find((item) => item.id === value)
    setTemplateId((value || '') as TemplateId | '')
    setType(value === 'etat_des_lieux' ? 'edl' : 'contrat')
    if (selected?.profile) setProfile(selected.profile)
    setFields({ ...EMPTY_FIELDS })
    setAutorisationFile(null)
    setMandatFile(null)
    setOccupantIndex(1)
    setDraft(null)
    setError('')
  }

  const updateField = (key: string, value: string) => {
    setFields((current) => ({ ...current, [key]: value }))
    if (key === 'autorisation_signee' && value !== 'oui') setAutorisationFile(null)
    if (key === 'pouvoir_signature' && value !== 'oui') setMandatFile(null)
    setDraft(null)
  }

  const toggleClause = (id: number) => {
    setSelectedClauses((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id])
    setDraft(null)
  }

  const showPreview = async () => {
    setBusy(true)
    setError('')
    setPreviewPages([])
    try {
      const preview = await api.previewContractDocument(requestPayload)
      setPreviewPages(preview.pages)
      setStep('preview')
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : 'Impossible de générer l’aperçu.')
    } finally {
      setBusy(false)
    }
  }

  const goToSummary = () => {
    setError('')
    setStep('summary')
  }

  const continueToClauses = () => {
    if (!templateId) {
      setError('Choisis le document à générer.')
      return
    }
    if (!profile) {
      setError('Choisis ton profil pour afficher le parcours correspondant.')
      return
    }
    if (type === 'contrat' && profile === 'locataire' && fields.autorisation_signee === 'oui' && !autorisationFile) {
      setError('Ajoute la copie PDF de l’Autorisation signée pour la joindre à l’Intercolocs.')
      return
    }
    if (type === 'contrat' && profile === 'professionnel' && fields.pouvoir_signature === 'oui' && !mandatFile) {
      setError('Ajoute la copie PDF du Mandat signé pour le joindre en annexe 0 au Mandacolocs.')
      return
    }
    if (type === 'contrat' && profile === 'locataire' && templateId !== 'autorisation_colocation' && fields.autorisation_signee === 'non') {
      setTemplateId('autorisation_colocation')
      setType('contrat')
      setError('L’Autorisation de colocation doit être établie et signée avant l’Intercolocs. Le parcours est dirigé vers ce document.')
      return
    }
    if (type === 'contrat' && profile === 'professionnel' && templateId !== 'mandat_gestion' && fields.pouvoir_signature === 'non') {
      setTemplateId('mandat_gestion')
      setType('contrat')
      setError('Le mandat signé avec pouvoir est requis. Le parcours est dirigé vers le Mandat de gestion à faire signer avant le Mandacolocs.')
      return
    }
    if (activeTemplate && !activeTemplate.profile) {
      const missingSpecific = extraVariables.filter((item) => !item.description.toLowerCase().includes('facultatif') && !String(fields[item.type.toLowerCase() === 'liste' ? `${item.variable}_texte` : item.variable] || '').trim())
      if (missingSpecific.length) {
        setError(`Renseigne les champs du modèle : ${missingSpecific.map((item) => humanizeVariable(item.variable)).join(', ')}.`)
        return
      }
      setError('')
      setStep('clauses')
      return
    }
    const requiredFields = [
      'nom_demandeur',
      'telephone_demandeur',
      'email_demandeur',
      'nom_autre_partie',
      'telephone_autre_partie',
      'email_autre_partie',
      'adresse',
      'code_postal',
      'ville',
      'type_bien',
      'date_entree',
      ...(type === 'contrat' ? ['loyer'] : []),
      ...(type === 'contrat' ? ['nombre_colocataires', 'choix_colocataires', 'solidarite', 'meuble', 'duree_bail', 'mois_depot', 'periodicite_revision', 'taux_revision', 'preavis_bailleur', 'jour_paiement', 'modes_reglement'] : []),
      ...(type === 'contrat' ? ['niveaux_texte', 'espace_privatif_description', 'charges_avec'] : []),
      ...(type === 'contrat' && fields.charges_avec === 'oui' ? ['charges_lignes_texte'] : []),
      ...(type === 'contrat' && profile === 'professionnel' ? ['pouvoir_signature'] : []),
      ...(type === 'contrat' && profile === 'locataire' ? ['autorisation_signee'] : []),
      ...(type === 'contrat' && profile === 'proprietaire' ? ['personne_morale'] : []),
      ...(type === 'contrat' && profile === 'professionnel' ? ['nom_proprietaire', 'adresse_proprietaire'] : []),
      ...(type === 'contrat' && profile !== 'professionnel' ? ['date_naissance_demandeur', 'ville_naissance_demandeur', 'pays_naissance_demandeur'] : []),
      ...(type === 'contrat' && profile === 'locataire' ? ['revision_date_anniversaire'] : []),
      ...(type === 'contrat' ? ['date_naissance_autre_partie', 'ville_naissance_autre_partie', 'pays_naissance_autre_partie'] : []),
      ...(type === 'contrat' && fields.choix_colocataires === 'gestionnaire_presel_proprietaire_valide' ? ['delai_validation'] : []),
      'salle_bain_privee',
      ...(profile === 'professionnel' ? ['nom_entreprise', 'representant', 'forme_juridique', 'rcs', 'stat', 'adresse_entreprise', 'date_mandat'] : []),
      ...(type === 'contrat' && profile === 'proprietaire' && fields.personne_morale === 'oui' ? ['nom_entreprise', 'representant'] : []),
      ...(type === 'contrat' && profile === 'proprietaire' && fields.personne_morale === 'oui' ? ['representant_qualite'] : []),
      ...(type === 'contrat' && profile === 'locataire' ? ['bail_principal_proprietaire', 'bail_principal_date_effet', 'bail_principal_duree', 'bail_principal_date_fin', 'bail_principal_article'] : []),
      ...(type === 'contrat' && fields.inclure_charte === 'oui' ? ['tranquillite_21h_6h', 'invites_3_6', 'menage_planning', 'tabac_exterieur', 'tabac_interieur_communs', 'tabac_interieur_privatifs', 'tabac_espaces_designes', ...(fields.tranquillite_21h_6h === 'non' ? ['tranquillite_debut', 'tranquillite_fin'] : []), ...(fields.invites_3_6 === 'non' ? ['invites_limite_nuits'] : []), ...(fields.tabac_espaces_designes === 'oui' ? ['tabac_espaces'] : [])] : []),
      ...(type === 'contrat' && fields.inclure_attestation_logement === 'oui' && profile === 'professionnel' ? ['gestionnaire_date_naissance'] : []),
      ...(type === 'contrat' && fields.inclure_attestation_especes === 'oui' ? ['especes_montant', 'especes_motif', 'especes_ville', 'especes_date'] : []),
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
      const request = draft || await api.createContractDocumentRequest(requestPayload)
      setDraft(request)
      if (templateId === 'contrat_intercolocs' && profile === 'locataire' && autorisationFile) {
        await api.uploadSignedContractAnnex(request.id, 'autorisation', autorisationFile)
      }
      if (templateId === 'contrat_mandacolocs' && profile === 'professionnel' && mandatFile) {
        await api.uploadSignedContractAnnex(request.id, 'mandat', mandatFile)
      }
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

  const startNextOccupantRequest = () => {
    const nextFields = { ...fields }
    for (const key of [
      'nom_autre_partie', 'cin_autre_partie', 'telephone_autre_partie', 'email_autre_partie',
      'date_naissance_autre_partie', 'ville_naissance_autre_partie', 'pays_naissance_autre_partie',
    ]) nextFields[key] = ''
    setFields(nextFields)
    setSelectedClauses([])
    setPaymentReference('')
    setPaymentMethod('')
    setPaymentProof(null)
    setDraft(null)
    setOccupantIndex((index) => index + 1)
    setStep('details')
    setPageTab('create')
    setError('')
  }

  const downloadFinalDocument = async (request: ContractDocumentRequest) => {
    setDownloadingDocumentId(request.id_demande)
    setError('')
    try {
      const downloadLink = await api.createContractDocumentDownloadLink(request.id_demande)
      const blob = await api.getContractDocumentByDownloadToken(downloadLink.token)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${request.reference}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (documentError) {
      setError(documentError instanceof Error ? documentError.message : 'Impossible de télécharger le document.')
    } finally {
      setDownloadingDocumentId(null)
    }
  }

  const deleteRequest = async (request: ContractDocumentRequest) => {
    if (!window.confirm('Supprimer cette demande de votre historique ? La copie d’archive Coloc’KOO sera conservée.')) return
    setBusy(true)
    setError('')
    try {
      await api.deleteContractDocumentRequest(request.id_demande)
      await refreshRequests()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Impossible de supprimer cette demande.')
    } finally { setBusy(false) }
  }

  if (loading) return <div className="grid min-h-screen place-items-center">Chargement...</div>
  if (!user) return <Navigate to="/auth?mode=signin&redirect=%2Fcontrats-edl" replace />
  const isDocumentType = documentTitle(templateId, type, profile as Profile)
  const otherParty = profile === 'locataire' ? 'Propriétaire / bailleur' : 'Locataire / autre partie'
  const repartitionTotal = fields.repartition_texte
    .split(/\r?\n/)
    .filter(Boolean)
    .reduce((total, row) => total + Number((row.split('|')[2] || '').replace(/\D/g, '') || 0), 0)
  const mandatRent = Number((fields.loyer_total || '').replace(/\D/g, '') || 0)
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

        <div className="mt-7 grid grid-cols-2 gap-2 rounded-2xl border border-brand-cyan/20 bg-brand-cyan-light/40 p-2 shadow-sm sm:gap-3 sm:p-3" role="tablist" aria-label="Contrats et états des lieux">
          <button
            type="button"
            role="tab"
            aria-selected={pageTab === 'create'}
            onClick={() => setPageTab('create')}
            className={`flex min-h-14 min-w-0 items-center justify-center rounded-xl border px-2 py-3 text-center text-xs font-bold leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 sm:px-4 sm:text-sm ${pageTab === 'create' ? 'border-brand-cyan bg-white text-brand-cyan-dark shadow-sm' : 'border-transparent bg-transparent text-muted-foreground hover:border-brand-cyan/30 hover:bg-white/70 hover:text-brand-cyan-dark'}`}
          >
            Créer un document
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={pageTab === 'requests'}
            onClick={() => { setPageTab('requests'); void refreshRequests() }}
            className={`flex min-h-14 min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-center text-xs font-bold leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 sm:gap-2 sm:px-4 sm:text-sm ${pageTab === 'requests' ? 'border-brand-cyan bg-white text-brand-cyan-dark shadow-sm' : 'border-transparent bg-transparent text-muted-foreground hover:border-brand-cyan/30 hover:bg-white/70 hover:text-brand-cyan-dark'}`}
          >
            Mes demandes
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${pageTab === 'requests' ? 'bg-brand-cyan text-white' : 'bg-white text-brand-cyan-dark'}`}>{requests.length}</span>
          </button>
        </div>

        {error && <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}

        {pageTab === 'create' && step !== 'done' ? (
          <section className="mt-7 rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-7">
            <div className="mb-6 grid grid-cols-2 gap-2 text-xs font-semibold sm:flex sm:flex-wrap">
              {(['details', 'clauses', 'summary', 'preview', 'payment'] as const).map((current, index) => (
                <span key={current} className={`rounded-full px-3 py-1.5 ${step === current ? 'bg-brand-cyan text-white' : 'bg-muted text-muted-foreground'}`}>
                  {index + 1}. {['Questionnaire', 'Clauses', 'Récapitulatif', 'Aperçu', 'Paiement'][index]}
                </span>
              ))}
            </div>

            {step === 'details' && (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm"><span className="mb-1 block font-semibold">Document à générer *</span><select value={templateId} onChange={(event) => chooseTemplate(event.target.value)} className="w-full rounded-lg border border-border bg-white px-3 py-2.5"><option value="">Choisir un document…</option>{DOCUMENT_TEMPLATES.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
<label className="block text-sm"><span className="mb-1 block font-semibold">Profil du demandeur *</span><select value={profile} onChange={(event) => { const nextProfile = event.target.value as Profile | ''; setProfile(nextProfile); const currentTemplate = DOCUMENT_TEMPLATES.find((item) => item.id === templateId); if (!currentTemplate || currentTemplate.profile) { const routed = DOCUMENT_TEMPLATES.find((item) => item.profile === nextProfile); if (routed) { setTemplateId(routed.id); setType('contrat') } setFields((current) => ({ ...current, periodicite_revision: current.periodicite_revision || '3' })) } setDraft(null) }} className="w-full rounded-lg border border-border bg-white px-3 py-2.5"><option value="">Choisir…</option><option value="locataire">Occupant principal</option><option value="proprietaire">Propriétaire</option><option value="professionnel">Professionnel immobilier</option></select></label>
                </div>
                <aside className="rounded-xl border border-brand-cyan/30 bg-brand-cyan-light/30 p-4 text-sm"><h2 className="font-bold">Modèles PDF vierges à télécharger</h2><div className="mt-2 flex flex-wrap gap-x-5 gap-y-2"><a className="font-semibold text-brand-cyan-dark underline" href="/documents-contractuels/quittance-loyer-2026.pdf" download>Télécharger la quittance de loyer</a><a className="font-semibold text-brand-cyan-dark underline" href="/documents-contractuels/attestation-remise-especes.pdf" download>Télécharger l’attestation de remise en espèces</a></div><p className="mt-2 text-xs text-muted-foreground">Ces deux PDF sont vierges et se téléchargent tels quels, sans passer par le questionnaire.</p></aside>
                {extraVariables.length > 0 && <section className="grid gap-4 rounded-xl border border-brand-cyan/30 bg-brand-cyan-light/20 p-4 sm:grid-cols-2"><h2 className="font-bold sm:col-span-2">Informations pour {activeTemplate?.title}</h2>{extraVariables.map((item) => { const key = item.variable; const isOptional = item.description.toLowerCase().includes('facultatif'); const isBool = item.type.toLowerCase().includes('bool'); const isDate = item.type.toLowerCase().includes('date'); const isLong = item.type.toLowerCase().includes('long'); const isList = item.type.toLowerCase() === 'liste'; const fieldKey = isList ? `${key}_texte` : key; const listHint = key === 'sous_occupants' ? 'Une ligne par personne : nom et prénom | date du contrat (JJ/MM/AAAA)' : 'Une ligne par colocataire : habitant | chambre | montant'; return <label key={key} className="block text-sm"><span className="mb-1 block font-semibold">{item.description || humanizeVariable(key)}{isOptional ? '' : ' *'}</span>{isBool ? <select value={fields[fieldKey] || ''} onChange={(event) => updateField(fieldKey, event.target.value)} className="w-full rounded-lg border border-border bg-white px-3 py-2.5"><option value="">Choisir…</option><option value="true">Oui</option><option value="false">Non</option></select> : isList || isLong ? <><textarea rows={3} value={fields[fieldKey] || ''} onChange={(event) => updateField(fieldKey, event.target.value)} placeholder={isList ? listHint : undefined} className="w-full rounded-lg border border-border bg-white px-3 py-2.5" />{isList && <span className="text-xs text-muted-foreground">{listHint}</span>}</> : <input type={isDate ? 'date' : item.type.toLowerCase().includes('nombre') || item.type.toLowerCase().includes('montant') ? 'number' : 'text'} value={fields[fieldKey] || ''} onChange={(event) => updateField(fieldKey, event.target.value)} className="w-full rounded-lg border border-border bg-white px-3 py-2.5" />}</label> })}</section>}
                {(['autorisation_colocation', 'avenant_substitution'].includes(templateId) && fields.retribution_reduction === 'true') && field('loyer_total', 'Loyer mensuel total de référence (Ar)', true, 'number')}
                {templateId === 'mandat_gestion' && fields.repartition_texte && mandatRent > 0 && repartitionTotal !== mandatRent && <p role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">La répartition saisie ({repartitionTotal.toLocaleString('fr-FR')} Ar) diffère du loyer total ({mandatRent.toLocaleString('fr-FR')} Ar). Vérifie les montants avant de continuer.</p>}
                <div hidden={isAuxiliaryTemplate}>
                {(profile === 'professionnel' || (profile === 'proprietaire' && fields.personne_morale === 'oui')) && <div className="grid gap-4 rounded-xl bg-muted/40 p-4 sm:grid-cols-2"><h2 className="font-bold sm:col-span-2">Informations professionnelles</h2>{field('nom_entreprise', 'Nom de l’entreprise', true)}{field('nif', 'NIF / identifiant professionnel')}{field('representant', 'Nom du représentant', true)}</div>}
                {profile === 'professionnel' && field('date_mandat', 'Date du mandat signé', true, 'date')}
                {profile === 'professionnel' && <div className="grid gap-4 rounded-xl bg-muted/40 p-4 sm:grid-cols-2">{field('forme_juridique', 'Forme juridique de la société', true)}{field('rcs', 'Numéro RCS', true)}{field('stat', 'Numéro STAT', true)}{field('adresse_entreprise', 'Siège social', true)}{field('mandataire_agrement', 'Numéro d’agrément / carte professionnelle')}{field('mandataire_rc_pro', 'Numéro de police RC professionnelle')}</div>}
                {profile === 'proprietaire' && fields.personne_morale === 'oui' && field('representant_qualite', 'Qualité du représentant', true)}
                {type === 'contrat' && profile === 'locataire' && <div className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2"><h2 className="font-bold sm:col-span-2">Bail principal</h2><p className="text-sm text-muted-foreground sm:col-span-2">L’Occupant principal se réfère à son contrat initial pour renseigner ces champs.</p>{field('bail_principal_proprietaire', 'Nom du Propriétaire du bail principal', true)}{field('bail_principal_date_effet', 'Date de début du bail principal', true, 'date')}{field('bail_principal_duree', 'Durée du bail principal', true)}{field('bail_principal_date_fin', 'Date de fin du bail principal', true, 'date')}{field('bail_principal_article', 'Article autorisant la sous-location', true)}</div>}
                {profile === 'professionnel' && <div className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2"><h2 className="font-bold sm:col-span-2">Propriétaire représenté</h2>{field('nom_proprietaire', 'Nom ou raison sociale du Propriétaire', true)}{field('cin_proprietaire', 'CIN ou immatriculation')}{field('adresse_proprietaire', 'Adresse du Propriétaire', true)}{field('telephone_proprietaire', 'Téléphone du Propriétaire')}{field('email_proprietaire', 'E-mail du Propriétaire', false, 'email')}</div>}
                <div className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
                  <h2 className="font-bold sm:col-span-2">Demandeur</h2>
                  {field('nom_demandeur', profile === 'professionnel' ? 'Nom du contact' : 'Nom complet', true)}
                  {field('cin_demandeur', 'CIN (12 chiffres maximum)')}
                  {field('telephone_demandeur', 'Téléphone (13 chiffres maximum)', true, 'tel')}
                  {field('email_demandeur', 'E-mail', true, 'email')}
                  {type === 'contrat' && profile !== 'professionnel' && <>{field('date_naissance_demandeur', 'Date de naissance', true, 'date')}{field('ville_naissance_demandeur', 'Ville de naissance', true)}{field('pays_naissance_demandeur', 'Pays de naissance', true)}</>}
                </div>
                <div className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
                  <h2 className="font-bold sm:col-span-2">{otherParty}</h2>
                  {field('nom_autre_partie', 'Nom complet / raison sociale', true)}
                  {field('cin_autre_partie', 'CIN (12 chiffres maximum)')}
                  {field('telephone_autre_partie', 'Téléphone (13 chiffres maximum)', true, 'tel')}
                  {field('email_autre_partie', 'E-mail', true, 'email')}
                  {type === 'contrat' && <>{field('date_naissance_autre_partie', 'Date de naissance', true, 'date')}{field('ville_naissance_autre_partie', 'Ville de naissance', true)}{field('pays_naissance_autre_partie', 'Pays de naissance', true)}</>}
                </div>
                <div className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
                  <h2 className="font-bold sm:col-span-2">Logement</h2>
                  {field('adresse', 'Adresse du logement', true)}
                  {field('code_postal', 'Code postal')}
                  {field('quartier', 'Quartier')}
                  {field('ville', 'Ville', true)}
                  {field('type_bien', 'Type de bien (appartement, maison…)', true)}
                  {type === 'contrat' && <label className="block text-sm sm:col-span-2"><span className="mb-1 block font-semibold">Niveaux du logement *</span><textarea rows={3} value={fields.niveaux_texte} onChange={(event) => updateField('niveaux_texte', event.target.value)} placeholder="Une ligne par niveau : libellé | description (ex. RDC | salon, cuisine ; R+1 | chambres)" className="w-full rounded-lg border border-border bg-white px-3 py-2.5" /></label>}
                </div>
                {type === 'contrat' && (
                  <div className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
                    <h2 className="font-bold sm:col-span-2">Parcours de colocation</h2>
                    <p className="text-sm text-muted-foreground sm:col-span-2">Le contrat proposé dépend du profil : Intercolocs pour un Occupant principal, Propriocolocs pour un Propriétaire, Mandacolocs pour un Professionnel.</p>
                    {field('nombre_colocataires', 'Nombre de colocataires', true, 'number')}
                    <p className="text-xs text-muted-foreground sm:col-span-2">Un contrat et un paiement sont créés séparément pour chaque Sous-occupant. Les réponses communes sont reprises ; seuls les huit champs d’identité du Sous-occupant sont à renseigner à nouveau.</p>
                    <label className="block text-sm"><span className="mb-1 block font-semibold">Qui choisit les colocataires ? *</span><select required value={fields.choix_colocataires} onChange={(event) => updateField('choix_colocataires', event.target.value)} className="w-full rounded-lg border border-border bg-white px-3 py-2.5"><option value="">Choisir…</option>{profile === 'professionnel' ? <><option value="gestionnaire_seul">Le Mandataire seul</option><option value="mandant_valide">Le Mandant valide</option></> : <><option value="gestionnaire_seul">Le gestionnaire seul</option><option value="gestionnaire_presel_proprietaire_valide">Le gestionnaire présélectionne, le Propriétaire valide</option><option value="proprietaire_seul">Le Propriétaire seul</option></>}</select></label>
                    {fields.choix_colocataires === 'gestionnaire_presel_proprietaire_valide' && field('delai_validation', 'Délai de validation (jours)', true, 'number')}
                    {profile === 'locataire' && <label className="block text-sm sm:col-span-2"><span className="mb-1 block font-semibold">L’Autorisation de colocation entre l’Occupant principal et le Propriétaire est-elle signée ? *</span><select required value={fields.autorisation_signee} onChange={(event) => updateField('autorisation_signee', event.target.value)} className="w-full rounded-lg border border-border bg-white px-3 py-2.5"><option value="">Choisir…</option><option value="oui">Oui, elle est signée</option><option value="non">Non, je dois l’établir</option></select></label>}
                    {profile === 'locataire' && fields.autorisation_signee === 'oui' && <label className="block text-sm sm:col-span-2"><span className="mb-1 block font-semibold">Copie PDF de l’Autorisation signée *</span><input type="file" accept="application/pdf,.pdf" onChange={(event) => setAutorisationFile(event.target.files?.[0] || null)} className="w-full rounded-lg border border-border bg-white px-3 py-2.5" /><span className="mt-1 block text-xs text-muted-foreground">Elle sera jointe au contrat Intercolocs. Maximum 15 Mo.</span></label>}
                    {profile === 'professionnel' && <label className="block text-sm sm:col-span-2"><span className="mb-1 block font-semibold">Mandat de gestion signé et pouvoir de signer ? *</span><select required value={fields.pouvoir_signature} onChange={(event) => updateField('pouvoir_signature', event.target.value)} className="w-full rounded-lg border border-border bg-white px-3 py-2.5"><option value="">Choisir…</option><option value="oui">Oui</option><option value="non">Non</option></select>{fields.pouvoir_signature === 'non' && <span className="mt-2 block text-amber-800">Le Mandacolocs nécessite un mandat signé. Faites établir le Mandat de gestion avant de poursuivre.</span>}</label>}
                    {profile === 'professionnel' && fields.pouvoir_signature === 'oui' && <label className="block text-sm sm:col-span-2"><span className="mb-1 block font-semibold">Copie PDF du Mandat signé *</span><input type="file" accept="application/pdf,.pdf" onChange={(event) => setMandatFile(event.target.files?.[0] || null)} className="w-full rounded-lg border border-border bg-white px-3 py-2.5" /><span className="mt-1 block text-xs text-muted-foreground">Il sera joint en annexe 0 au contrat Mandacolocs. Maximum 15 Mo.</span></label>}
                    <fieldset className="sm:col-span-2"><legend className="mb-2 font-bold">Documents communs inclus dans le même paiement</legend><div className="grid gap-2 sm:grid-cols-2"><label className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm"><input type="checkbox" checked={fields.inclure_charte === 'oui'} onChange={(event) => updateField('inclure_charte', event.target.checked ? 'oui' : 'non')} />Générer une charte de colocation par occupant</label><label className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm"><input type="checkbox" checked={fields.inclure_attestation_logement === 'oui'} onChange={(event) => updateField('inclure_attestation_logement', event.target.checked ? 'oui' : 'non')} />Générer une attestation de logement</label>{fields.modes_reglement.split(';').map((item) => item.trim()).includes('Espèces') && <label className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm"><input type="checkbox" checked={fields.inclure_attestation_especes === 'oui'} onChange={(event) => updateField('inclure_attestation_especes', event.target.checked ? 'oui' : 'non')} />Joindre l’attestation de remise en espèces (2 exemplaires)</label>}</div><p className="mt-1 text-xs text-muted-foreground">L’état des lieux d’entrée est automatiquement joint au contrat. Ces documents sont préremplis et inclus dans le même paiement.</p></fieldset>
                    {fields.inclure_attestation_especes === 'oui' && <fieldset className="grid gap-3 rounded-lg border border-border p-4 sm:col-span-2 sm:grid-cols-2"><legend className="px-1 font-bold">Informations de remise en espèces</legend>{field('especes_montant', 'Montant remis (Ar)', true, 'number')}{field('especes_motif', 'Motif de la remise', true)}{field('especes_ville', 'Ville de remise', true)}{field('especes_date', 'Date de remise', true, 'date')}</fieldset>}
                    {fields.inclure_charte === 'oui' && <fieldset className="grid gap-3 rounded-lg border border-border p-4 sm:col-span-2 sm:grid-cols-2"><legend className="px-1 font-bold">Règles de la charte</legend><label className="block text-sm">Horaires habituels<select value={fields.tranquillite_21h_6h} onChange={(event) => updateField('tranquillite_21h_6h', event.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2"><option value="">Choisir…</option><option value="oui">21 h à 6 h</option><option value="non">Autres horaires</option></select></label>{fields.tranquillite_21h_6h === 'non' && <>{field('tranquillite_debut', 'Heure de début', true)}{field('tranquillite_fin', 'Heure de fin', true)}</>}<label className="block text-sm">Limite des invités<select value={fields.invites_3_6} onChange={(event) => updateField('invites_3_6', event.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2"><option value="">Choisir…</option><option value="oui">3 nuits consécutives, 6 nuits par mois</option><option value="non">Autre limite</option></select></label>{fields.invites_3_6 === 'non' && field('invites_limite_nuits', 'Limite en nuits par mois', true, 'number')}<label className="block text-sm">Entretien<select value={fields.menage_planning} onChange={(event) => updateField('menage_planning', event.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2"><option value="">Choisir…</option><option value="oui">Planning tournant</option><option value="non">Service de ménage</option></select></label>{(['tabac_exterieur', 'tabac_interieur_communs', 'tabac_interieur_privatifs'] as const).map((key) => <label key={key} className="block text-sm">{key === 'tabac_exterieur' ? 'Tabac autorisé à l’extérieur' : key === 'tabac_interieur_communs' ? 'Tabac autorisé dans les espaces communs' : 'Tabac autorisé dans les espaces privatifs'}<select value={fields[key]} onChange={(event) => updateField(key, event.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2"><option value="">Choisir…</option><option value="oui">Oui</option><option value="non">Non</option></select></label>)}<label className="block text-sm">Tabac dans des espaces désignés<select value={fields.tabac_espaces_designes} onChange={(event) => updateField('tabac_espaces_designes', event.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2"><option value="">Choisir…</option><option value="oui">Oui</option><option value="non">Non</option></select></label>{fields.tabac_espaces_designes === 'oui' && field('tabac_espaces', 'Espaces désignés', true)}</fieldset>}
                    {fields.inclure_attestation_logement === 'oui' && profile === 'professionnel' && field('gestionnaire_date_naissance', 'Date de naissance du Mandataire', true, 'date')}
                    {profile === 'proprietaire' && <label className="block text-sm"><span className="mb-1 block font-semibold">Le Propriétaire est une société ? *</span><select required value={fields.personne_morale} onChange={(event) => updateField('personne_morale', event.target.value)} className="w-full rounded-lg border border-border bg-white px-3 py-2.5"><option value="">Choisir…</option><option value="non">Non, personne physique</option><option value="oui">Oui, personne morale</option></select></label>}
                    <label className="block text-sm"><span className="mb-1 block font-semibold">Régime de responsabilité *</span><select required value={fields.solidarite} onChange={(event) => updateField('solidarite', event.target.value)} className="w-full rounded-lg border border-border bg-white px-3 py-2.5"><option value="">Choisir…</option><option value="Individuelle">Individuelle</option><option value="Solidaire">Collective (solidaire)</option></select>{profile !== 'locataire' && <span className="mt-1 block text-xs text-muted-foreground">Le régime choisi doit être identique pour tous les contrats du même logement.</span>}</label>
                    <h2 className="mt-3 font-bold sm:col-span-2">Conditions de location</h2>
                    {field('date_entree', 'Date d’entrée', true, 'date')}
                    <label className="block text-sm"><span className="mb-1 block font-semibold">Salle de bain privee dans la chambre ? *</span><select required value={fields.salle_bain_privee} onChange={(event) => updateField('salle_bain_privee', event.target.value)} className="w-full rounded-lg border border-border bg-white px-3 py-2.5"><option value="">Choisir...</option><option value="oui">Oui</option><option value="non">Non</option></select><span className="mt-1 block text-xs text-muted-foreground">Un etat des lieux dentree sera ajoute au contrat.</span></label>
                    {field('loyer', 'Loyer mensuel (Ar)', true, 'number')}
                    <fieldset className="block text-sm"><legend className="mb-1 block font-semibold">Modes de règlement *</legend><div className="grid gap-2 sm:grid-cols-2">{['Virement', 'Mobile money', 'Application de transfert', 'Espèces', 'Chèque'].map((method) => { const selected = fields.modes_reglement.split(';').map((item) => item.trim()).filter(Boolean); return <label key={method} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"><input type="checkbox" checked={selected.includes(method)} onChange={() => updateField('modes_reglement', (selected.includes(method) ? selected.filter((item) => item !== method) : [...selected, method]).join('; '))} />{method}</label> })}</div></fieldset>
                    {field('charges', 'Charges mensuelles (Ar)', false, 'number')}
                    <label className="block text-sm"><span className="mb-1 block font-semibold">Logement meuble ? *</span><select required value={fields.meuble} onChange={(event) => updateField('meuble', event.target.value)} className="w-full rounded-lg border border-border bg-white px-3 py-2.5"><option value="">Choisir...</option><option value="oui">Oui</option><option value="non">Non</option></select></label>
                    <label className="block text-sm sm:col-span-2"><span className="mb-1 block font-semibold">Espace privatif et équipements *</span><textarea rows={3} required value={fields.espace_privatif_description} onChange={(event) => updateField('espace_privatif_description', event.target.value)} className="w-full rounded-lg border border-border bg-white px-3 py-2.5" /></label>
                    <label className="block text-sm"><span className="mb-1 block font-semibold">Le loyer inclut-il des charges ? *</span><select required value={fields.charges_avec} onChange={(event) => updateField('charges_avec', event.target.value)} className="w-full rounded-lg border border-border bg-white px-3 py-2.5"><option value="">Choisir...</option><option value="non">Non</option><option value="oui">Oui</option></select></label>
                    {fields.charges_avec === 'oui' && <label className="block text-sm sm:col-span-2"><span className="mb-1 block font-semibold">Lignes de charges *</span><textarea rows={4} required value={fields.charges_lignes_texte} onChange={(event) => updateField('charges_lignes_texte', event.target.value)} placeholder="Une ligne par charge : nom | montant | répartition | description" className="w-full rounded-lg border border-border bg-white px-3 py-2.5" /></label>}
                    {field('duree_bail', 'Duree du bail', true)}
                    {field('mois_depot', 'Depot de garantie (nombre de mois)', true, 'number')}
                    {field('periodicite_revision', 'Periodicite de revision (annees)', true, 'number')}
                    {profile === 'locataire' && <>{field('revision_date_anniversaire', 'Date anniversaire de révision du bail principal', true, 'date')}<p className="text-xs text-muted-foreground sm:col-span-2">L’Occupant principal se réfère à son contrat initial pour renseigner ces champs.</p></>}
                    {profile === 'locataire' && <p className="text-xs text-muted-foreground sm:col-span-2">L’Occupant principal se réfère à son contrat initial pour renseigner ces champs.</p>}
                    {field('taux_revision', 'Taux de revision du loyer (%)', true, 'number')}
                    {field('preavis_bailleur', 'Preavis du bailleur (mois)', true, 'number')}
                    {field('jour_paiement', 'Jour limite de paiement', true, 'number')}
                  </div>
                )}
                {type === 'edl' && <>{field('date_entree', 'Date du constat', true, 'date')}<label className="mt-4 block text-sm"><span className="mb-1 block font-semibold">La chambre possède une salle de bain privée ? *</span><select required value={fields.salle_bain_privee} onChange={(event) => updateField('salle_bain_privee', event.target.value)} className="w-full rounded-lg border border-border bg-white px-3 py-2.5"><option value="">Choisir…</option><option value="oui">Oui</option><option value="non">Non</option></select></label></>}
                <label className="block text-sm"><span className="mb-1 block font-semibold">Observations</span><textarea rows={3} value={fields.observations} onChange={(event) => updateField('observations', event.target.value)} className="w-full rounded-lg border border-border bg-white px-3 py-2.5" /></label>
                </div>
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
                <div className="mt-5 flex justify-between"><button type="button" onClick={() => setStep('details')} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold">Précédent</button><button type="button" onClick={goToSummary} className="inline-flex items-center gap-2 rounded-xl bg-brand-magenta px-5 py-3 text-sm font-bold text-white">Vérifier mes réponses <ArrowRight className="h-4 w-4" /></button></div>
              </div>
            )}

            {step === 'summary' && (
              <div>
                <h2 className="bebas text-2xl">Récapitulatif du questionnaire</h2>
                <p className="mb-4 text-sm text-muted-foreground">Vérifie les informations avant de générer l’aperçu. Tu peux revenir au questionnaire pour les modifier.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <section className="rounded-xl border border-border p-4 sm:col-span-2">
                    <h3 className="mb-2 font-bold">Document et profil</h3>
                    <p className="text-sm">{isDocumentType} · {profile === 'locataire' ? 'Occupant principal' : profile === 'proprietaire' ? 'Propriétaire' : 'Professionnel de l’immobilier'}</p>
                  </section>
                  <section className="rounded-xl border border-border p-4 sm:col-span-2">
                    <h3 className="mb-2 font-bold">Réponses fournies</h3>
                    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                      {Object.entries(fields).filter(([, value]) => value.trim()).map(([key, value]) => (
                        <div key={key} className="min-w-0 text-sm">
                          <dt className="text-muted-foreground">{key.replace(/_/g, ' ').replace(/^./, (letter) => letter.toUpperCase())}</dt>
                          <dd className="whitespace-pre-wrap break-words font-medium">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                  {selectedClauses.length > 0 && <section className="rounded-xl border border-border p-4 sm:col-span-2"><h3 className="mb-2 font-bold">Clauses sélectionnées</h3><ul className="list-inside list-disc text-sm">{clauses.filter((clause) => selectedClauses.includes(clause.id_clause)).map((clause) => <li key={clause.id_clause}>{clause.titre}</li>)}</ul></section>}
                </div>
                <div className="mt-5 flex flex-wrap justify-between gap-2">
                  <button type="button" onClick={() => setStep('details')} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold">Modifier le questionnaire</button>
                  <button type="button" onClick={() => setStep('clauses')} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold">Modifier les clauses</button>
                  <button type="button" disabled={busy} onClick={() => void showPreview()} className="inline-flex items-center gap-2 rounded-xl bg-brand-magenta px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Confirmer et générer l’aperçu</button>
                </div>
              </div>
            )}

            {step === 'preview' && (
              <div>
                <h2 className="bebas text-2xl">Aperçu du document</h2>
                <p className="mb-4 text-sm text-muted-foreground">Aperçu en lecture seule, affiché page par page. Vérifie les informations avant de continuer vers le paiement.</p>
                <div aria-label="Pages de l’aperçu du document" className="max-h-[70vh] space-y-4 overflow-auto rounded-xl border border-border bg-slate-100 p-3 sm:p-5">
                  {previewPages.map((page, index) => (
                    <img
                      key={index}
                      src={`data:image/png;base64,${page}`}
                      alt={`Page ${index + 1} de l’aperçu`}
                      className="mx-auto block h-auto w-full max-w-[850px] bg-white shadow"
                      draggable={false}
                    />
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap justify-between gap-3"><button type="button" onClick={() => setStep('details')} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold">Modifier les informations</button><button type="button" disabled={busy} onClick={() => void continueToPayment()} className="inline-flex items-center gap-2 rounded-xl bg-brand-magenta px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Continuer vers le paiement <ArrowRight className="h-4 w-4" /></button></div>
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
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/50 p-3 sm:p-4"><span className="min-w-0 break-words font-semibold">{isDocumentType} · {draft?.reference}</span><strong className="bebas shrink-0 text-2xl text-brand-magenta">{Number(draft?.montant || 0).toLocaleString('fr-FR')} Ar</strong></div>
                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:gap-3"><button type="button" onClick={() => setStep('preview')} className="w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold sm:w-auto">Retour à l’aperçu</button><button type="button" disabled={busy || !paymentMethod || paymentReference.trim().length < 4 || (paymentMethod.toLowerCase().includes('mvola') && !paymentProof)} onClick={() => void submitPayment()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green px-5 py-3 text-sm font-bold text-white disabled:opacity-50 sm:w-auto">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Soumettre le paiement</button></div>
              </div>
            )}
          </section>
        ) : pageTab === 'create' ? (
          <section className="mt-7 rounded-2xl border border-brand-green/30 bg-brand-green-light/40 p-5">
            <h2 className="bebas text-2xl">Demande envoyée</h2>
            <p className="mt-1 text-sm text-muted-foreground">Le paiement sera vérifié par notre équipe. Le document final sera disponible dans cette page après validation.</p>
            {type === 'contrat' && Number(fields.nombre_colocataires) > occupantIndex && <button type="button" onClick={startNextOccupantRequest} className="mt-4 block rounded-xl bg-brand-magenta px-4 py-2 text-sm font-bold text-white">Créer le contrat de l’occupant {occupantIndex + 1} sur {fields.nombre_colocataires}</button>}
            <button type="button" onClick={() => setPageTab('requests')} className="mt-4 rounded-xl border border-brand-cyan px-4 py-2 text-sm font-bold text-brand-cyan-dark">Voir mes demandes</button>
            <button type="button" onClick={() => { setStep('details'); setDraft(null); setFields({ ...EMPTY_FIELDS }); setSelectedClauses([]); setPaymentReference(''); setPaymentMethod(''); setPaymentProof(null); setOccupantIndex(1); setAutorisationFile(null); setMandatFile(null) }} className="mt-4 rounded-xl bg-brand-cyan px-4 py-2 text-sm font-bold text-white">Faire une nouvelle demande</button>
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
              <article key={request.id_demande} className="flex min-w-0 flex-col items-stretch justify-between gap-3 rounded-xl border border-border bg-white p-3 sm:flex-row sm:items-center sm:p-4">
                <div className="min-w-0">
                  <div className="break-words font-semibold">{documentTitle(request.template_id, request.type_document, request.profil_demandeur)} · {request.reference}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{statusLabel(request.statut)} · Paiement : {request.statut_paiement.replace(/-/g, ' ')}</div>
                </div>
                {request.statut === 'valide' && request.statut_paiement === 'conforme' && (
                  <div className="w-full sm:max-w-md">
                    <p className="mb-2 text-xs text-muted-foreground">Le lien de téléchargement est valable 15 minutes et peut être recréé à la demande.</p>
                    <button type="button" onClick={() => void downloadFinalDocument(request)} disabled={downloadingDocumentId === request.id_demande} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-brand-cyan px-3 py-2 text-sm font-bold text-brand-cyan-dark disabled:opacity-50">
                      {downloadingDocumentId === request.id_demande ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 shrink-0" />}Télécharger le PDF/A
                    </button>
                  </div>
                )}
                <button type="button" disabled={busy} onClick={() => void deleteRequest(request)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50" aria-label="Supprimer de mon historique">
                  <Trash2 className="h-4 w-4" /><span className="sm:hidden">Supprimer</span>
                </button>
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
