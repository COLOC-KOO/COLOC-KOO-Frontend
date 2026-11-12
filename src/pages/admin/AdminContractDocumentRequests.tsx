import React, { useEffect, useState } from 'react'
import { AlertCircle, Check, Clock, RefreshCw, X } from 'lucide-react'
import { api, ContractDocumentRequest } from '../../lib/api'

const STATUS_LABEL: Record<ContractDocumentRequest['statut'], string> = {
  brouillon: 'Brouillon',
  'a-verifier': 'Paiement à vérifier',
  'en-cours': 'En traitement',
  valide: 'Validée',
  refuse: 'Refusée',
}

export default function AdminContractDocumentRequests({ onRequestsChanged }: { onRequestsChanged?: () => void }) {
  const [view, setView] = useState<'requests' | 'clauses'>('requests')
  const [requests, setRequests] = useState<ContractDocumentRequest[]>([])
  const [clauses, setClauses] = useState<Array<{ id_clause: number; titre: string; description: string | null; ordre: number; est_actif: number }>>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [editingClauseId, setEditingClauseId] = useState<number | null>(null)
  const [clauseTitle, setClauseTitle] = useState('')
  const [clauseDescription, setClauseDescription] = useState('')
  const [clauseOrder, setClauseOrder] = useState('0')

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      setRequests(await api.backofficeContractDocumentRequests())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les demandes.')
    } finally {
      setLoading(false)
    }
  }

  const refreshClauses = async () => {
    setLoading(true)
    setError('')
    try {
      setClauses(await api.backofficeContractClauses())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger le catalogue de clauses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    void refreshClauses()
  }, [])

  const update = async (id: number, status: 'en-cours' | 'valide' | 'refuse') => {
    setBusyId(id)
    setError('')
    try {
      await api.updateBackofficeContractDocumentRequest(id, status)
      await refresh()
      onRequestsChanged?.()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Impossible de mettre à jour la demande.')
    } finally {
      setBusyId(null)
    }
  }

  const openPaymentProof = async (id: number) => {
    const proofWindow = window.open('', '_blank')
    if (!proofWindow) {
      setError('Autorise les fenêtres contextuelles pour consulter la capture.')
      return
    }
    setBusyId(id)
    setError('')
    try {
      const proof = await api.getBackofficeContractPaymentProof(id)
      const url = URL.createObjectURL(proof)
      proofWindow.location.href = url
      window.setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (proofError) {
      proofWindow.close()
      setError(proofError instanceof Error ? proofError.message : 'Impossible de charger la capture de paiement.')
    } finally {
      setBusyId(null)
    }
  }

  const resetClauseForm = () => {
    setEditingClauseId(null)
    setClauseTitle('')
    setClauseDescription('')
    setClauseOrder('0')
  }

  const saveClause = async () => {
    if (!clauseTitle.trim()) {
      setError('Le titre de la clause est requis.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = { titre: clauseTitle.trim(), description: clauseDescription.trim(), ordre: Number(clauseOrder) || 0 }
      if (editingClauseId) {
        const existing = clauses.find((clause) => clause.id_clause === editingClauseId)
        await api.updateBackofficeContractClause(editingClauseId, { ...payload, est_actif: Number(existing?.est_actif) === 1 })
      } else {
        await api.createBackofficeContractClause(payload)
      }
      resetClauseForm()
      await refreshClauses()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible d’enregistrer la clause.')
    } finally {
      setLoading(false)
    }
  }

  const startEditingClause = (clause: typeof clauses[number]) => {
    setEditingClauseId(clause.id_clause)
    setClauseTitle(clause.titre)
    setClauseDescription(clause.description || '')
    setClauseOrder(String(clause.ordre))
  }

  const toggleClause = async (clause: typeof clauses[number]) => {
    setBusyId(clause.id_clause)
    setError('')
    try {
      await api.updateBackofficeContractClause(clause.id_clause, {
        titre: clause.titre,
        description: clause.description || '',
        ordre: clause.ordre,
        est_actif: Number(clause.est_actif) !== 1,
      })
      await refreshClauses()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Impossible de modifier la clause.')
    } finally {
      setBusyId(null)
    }
  }

  const paidRequests = requests.filter((request) => request.statut !== 'brouillon')

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 sm:border-b sm:border-white/10">
        <button type="button" onClick={() => setView('requests')} className={`rounded-lg px-3 py-2 text-left text-xs font-semibold leading-tight sm:rounded-none sm:text-sm ${view === 'requests' ? 'bg-brand-cyan/10 text-brand-cyan sm:border-b-2 sm:bg-transparent sm:border-brand-cyan' : 'bg-white/[0.03] text-white/60 hover:bg-white/5 sm:bg-transparent'}`}>Demandes soumises</button>
        <button type="button" onClick={() => setView('clauses')} className={`rounded-lg px-3 py-2 text-left text-xs font-semibold leading-tight sm:rounded-none sm:text-sm ${view === 'clauses' ? 'bg-brand-cyan/10 text-brand-cyan sm:border-b-2 sm:bg-transparent sm:border-brand-cyan' : 'bg-white/[0.03] text-white/60 hover:bg-white/5 sm:bg-transparent'}`}>Catalogue de clauses</button>
      </div>
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <p className="min-w-0 text-sm text-white/60">{view === 'requests' ? `${paidRequests.length} demande(s) soumise(s), paiement déclaré à vérifier manuellement auprès de l’opérateur.` : `${clauses.length} clause(s) dans le catalogue.`}</p>
        <button type="button" onClick={() => void (view === 'requests' ? refresh() : refreshClauses())} disabled={loading} className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/5 disabled:opacity-50 sm:self-auto">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser
        </button>
      </div>
      {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      {loading && <p className="text-sm text-white/50">Chargement des demandes…</p>}
      {view === 'clauses' && (
        <div className="space-y-3">
          <div className="grid min-w-0 gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_100px_auto]">
            <input value={clauseTitle} onChange={(event) => setClauseTitle(event.target.value)} placeholder="Titre de la clause" className="w-full min-w-0 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" />
            <input value={clauseDescription} onChange={(event) => setClauseDescription(event.target.value)} placeholder="Texte / description de la clause" className="w-full min-w-0 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" />
            <input type="number" value={clauseOrder} onChange={(event) => setClauseOrder(event.target.value)} aria-label="Ordre" className="w-full min-w-0 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" />
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={loading} onClick={() => void saveClause()} className="flex-1 rounded-lg bg-brand-cyan px-3 py-2 text-xs font-bold text-brand-dark disabled:opacity-50 sm:flex-none">{editingClauseId ? 'Enregistrer' : 'Ajouter'}</button>
              {editingClauseId && <button type="button" onClick={resetClauseForm} className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 sm:flex-none">Annuler</button>}
            </div>
          </div>
          {clauses.map((clause) => (
            <article key={clause.id_clause} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div><h3 className="font-semibold text-white">{clause.titre}</h3><p className="mt-1 whitespace-pre-line text-sm text-white/60">{clause.description || 'Pas de description.'}</p><p className="mt-1 text-[11px] text-white/40">Ordre {clause.ordre} · {Number(clause.est_actif) === 1 ? 'Active' : 'Désactivée'}</p></div>
              <div className="flex gap-2">
                <button type="button" onClick={() => startEditingClause(clause)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/5">Modifier</button>
                <button type="button" disabled={busyId === clause.id_clause} onClick={() => void toggleClause(clause)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/5 disabled:opacity-50">{Number(clause.est_actif) === 1 ? 'Désactiver' : 'Activer'}</button>
              </div>
            </article>
          ))}
          {!loading && clauses.length === 0 && <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-white/50">Aucune clause n’est configurée.</p>}
        </div>
      )}
      {view === 'requests' && !loading && paidRequests.length === 0 && <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-white/50">Aucune demande payée à traiter.</p>}
      {view === 'requests' && paidRequests.map((request) => {
        const isPending = request.statut === 'a-verifier'
        return (
          <article key={request.id_demande} className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
          <div className="flex min-w-0 flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <h3 className="break-words font-semibold text-white">{request.reference} · {request.type_document === 'edl' ? 'État des lieux' : 'Contrat'}</h3>
              <p className="mt-1 break-words text-xs text-white/50">{request.profil_demandeur} · {request.prenom} {request.nom} · {request.email}</p>
                <p className="mt-1 text-xs text-white/60">{STATUS_LABEL[request.statut]} · Paiement : {request.statut_paiement} · {Number(request.montant).toLocaleString('fr-FR')} Ar</p>
              </div>
              <div className="min-w-0 text-left text-xs text-white/60 sm:max-w-[45%] sm:text-right">
                <div className="break-words">{request.moyen_paiement || 'Moyen non renseigné'}</div>
                <div className="mt-1 break-all font-mono">{request.reference_operateur || 'Référence manquante'}</div>
                <div className="mt-1">À comparer au reçu et au relevé opérateur</div>
              </div>
            </div>
            {request.has_payment_proof && <button type="button" disabled={busyId === request.id_demande} onClick={() => void openPaymentProof(request.id_demande)} className="mt-3 w-full rounded-lg border border-brand-cyan/30 px-3 py-2 text-xs font-semibold text-brand-cyan hover:bg-brand-cyan/10 disabled:opacity-50 sm:w-auto">{busyId === request.id_demande ? 'Chargement…' : 'Voir la capture de paiement'}</button>}
            <details className="mt-3 rounded-lg bg-black/10 p-3 text-xs text-white/70">
              <summary className="cursor-pointer break-words font-semibold">Voir les informations et les parties</summary>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {Object.entries(request.donnees).map(([key, value]) => value ? <div key={key} className="min-w-0 break-words"><span className="text-white/40">{key.replace(/_/g, ' ')} : </span>{value}</div> : null)}
              </div>
              {!!request.clauses?.length && <div className="mt-3 border-t border-white/10 pt-3"><strong>Clauses sélectionnées</strong><ul className="mt-1 list-inside list-disc">{request.clauses.map((clause) => <li key={clause.id_clause}>{clause.titre}</li>)}</ul></div>}
            </details>
            {isPending && (
              <div className="mt-4 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                <button type="button" disabled={busyId === request.id_demande} onClick={() => void update(request.id_demande, 'en-cours')} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-400/10 disabled:opacity-50"><Clock className="h-3.5 w-3.5" />Prendre en charge</button>
                <button type="button" disabled={busyId === request.id_demande} onClick={() => void update(request.id_demande, 'valide')} className="inline-flex items-center gap-1.5 rounded-lg border border-green-400/30 px-3 py-2 text-xs font-semibold text-green-200 hover:bg-green-400/10 disabled:opacity-50"><Check className="h-3.5 w-3.5" />Référence vérifiée — valider</button>
                <button type="button" disabled={busyId === request.id_demande} onClick={() => void update(request.id_demande, 'refuse')} className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/30 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-400/10 disabled:opacity-50"><X className="h-3.5 w-3.5" />Refuser</button>
              </div>
            )}
            {request.statut === 'en-cours' && (
              <div className="mt-3 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                <button type="button" disabled={busyId === request.id_demande} onClick={() => void update(request.id_demande, 'valide')} className="inline-flex items-center gap-1.5 rounded-lg border border-green-400/30 px-3 py-2 text-xs font-semibold text-green-200 hover:bg-green-400/10 disabled:opacity-50"><Check className="h-3.5 w-3.5" />Référence vérifiée — valider le document</button>
                <button type="button" disabled={busyId === request.id_demande} onClick={() => void update(request.id_demande, 'refuse')} className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/30 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-400/10 disabled:opacity-50"><X className="h-3.5 w-3.5" />Refuser</button>
              </div>
            )}
            {request.statut === 'valide' && <p className="mt-3 flex items-center gap-2 text-xs text-green-300"><Check className="h-4 w-4" />L’archive PDF/A est conservée en privé. Le demandeur peut télécharger une copie PDF chiffrée avec son propre mot de passe.</p>}
            {request.statut === 'refuse' && <p className="mt-3 flex items-center gap-2 text-xs text-red-300"><AlertCircle className="h-4 w-4" />Demande refusée.</p>}
          </article>
        )
      })}
    </section>
  )
}
