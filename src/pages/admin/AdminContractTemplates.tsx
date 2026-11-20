import React, { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle, Clock, FileText, Save, Search } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'

const TEMPLATES = [
  ['autorisation_colocation', 'Autorisation de colocation'],
  ['avenant_substitution', 'Avenant de substitution'],
  ['charte_colocation', 'Charte de colocation'],
  ['contrat_intercolocs', 'Contrat Intercolocs'],
  ['contrat_mandacolocs', 'Contrat Mandacolocs'],
  ['contrat_propriocolocs', 'Contrat Propriocolocs'],
  ['etat_des_lieux', 'État des lieux'],
  ['mandat_gestion', 'Mandat de gestion'],
  ['attestation_logement', 'Attestation de logement'],
] as const

type TemplateState = Awaited<ReturnType<typeof api.getBackofficeContractTemplate>>

export default function AdminContractTemplates() {
  const { user } = useAuth()
  const isSuperAdmin = ['superadmin', 'super_admin'].includes(user?.poste || '') || ['superadmin', 'super_admin'].includes(user?.role || '')
  const [templateId, setTemplateId] = useState<string>(TEMPLATES[0][0])
  const [template, setTemplate] = useState<TemplateState | null>(null)
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isSuperAdmin) return
    let active = true
    setLoading(true)
    setError('')
    setSuccess('')
    api.getBackofficeContractTemplate(templateId)
      .then((result) => {
        if (!active) return
        setTemplate(result)
        setEdits(result.revisions.find((revision) => revision.active)?.edits || {})
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger le modèle.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [isSuperAdmin, templateId])

  const visibleParagraphs = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('fr')
    return (template?.paragraphs || []).filter(({ text }) => !query || text.toLocaleLowerCase('fr').includes(query))
  }, [search, template])

  const setParagraph = (index: number, original: string, value: string) => {
    setEdits((current) => {
      const next = { ...current }
      if (value === original) delete next[index]
      else next[index] = value
      return next
    })
    setSuccess('')
  }

  const restoreRevision = (revision: TemplateState['revisions'][number]) => {
    setEdits({ ...revision.edits })
    setSuccess(`La version ${revision.version} est chargée dans l’éditeur. Enregistre pour la publier comme nouvelle version.`)
  }

  const save = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const result = await api.saveBackofficeContractTemplate(templateId, edits)
      const refreshed = await api.getBackofficeContractTemplate(templateId)
      setTemplate(refreshed)
      setEdits(refreshed.revisions.find((revision) => revision.active)?.edits || {})
      setSuccess(`Version ${result.version} publiée. Les PDF déjà vendus restent inchangés.`)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible d’enregistrer cette version.')
    } finally {
      setSaving(false)
    }
  }

  if (!isSuperAdmin) {
    return <AdminLayout><div className="mx-auto max-w-3xl p-6 text-sm text-red-300">Cette page est réservée au Super Admin.</div></AdminLayout>
  }

  return (
    <AdminLayout>
      <main className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
        <header className="rounded-2xl border border-white/10 bg-[oklch(0.22_0.005_260)] p-5">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-brand-cyan" />
            <div>
              <h1 className="text-xl font-bold text-white">Modèles Contrats Immo</h1>
              <p className="mt-1 text-sm text-white/60">Modifie le texte des modèles sans toucher aux variables ni aux documents déjà archivés.</p>
            </div>
          </div>
        </header>

        {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
        {success && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />{success}</div>}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section className="min-w-0 space-y-4 rounded-2xl border border-white/10 bg-[oklch(0.22_0.005_260)] p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,22rem)]">
              <label className="text-sm font-semibold text-white/80">Modèle
                <select value={templateId} onChange={(event) => setTemplateId(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-white px-3 py-2 text-slate-900">
                  {TEMPLATES.map(([id, title]) => <option key={id} value={id} className="bg-white text-slate-900">{title}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-white/80"><span>Rechercher dans le texte</span>
                <span className="mt-1 flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3"><Search className="h-4 w-4 text-white/40" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent py-2 text-white outline-none" placeholder="Mot ou phrase" /></span>
              </label>
            </div>

            <p className="text-xs text-white/50">Les balises {'{{variables}}'} et conditions doivent rester inchangées. Chaque enregistrement crée une nouvelle révision.</p>
            {loading ? <p className="py-10 text-center text-sm text-white/50">Chargement du modèle…</p> : (
              <div className="max-h-[65vh] space-y-3 overflow-auto pr-1">
                {visibleParagraphs.map(({ index, text }) => (
                  <label key={index} className="block rounded-xl border border-white/10 bg-black/15 p-3">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-white/40">Paragraphe {index + 1}</span>
                    <span className="mb-2 block whitespace-pre-wrap text-xs text-white/45">Original : {text}</span>
                    <textarea value={edits[index] ?? text} onChange={(event) => setParagraph(index, text, event.target.value)} rows={Math.min(6, Math.max(2, Math.ceil((edits[index] ?? text).length / 100)))} className="w-full resize-y rounded-lg border border-white/10 bg-black/20 p-2.5 text-sm text-white outline-none focus:border-brand-cyan/50" />
                  </label>
                ))}
                {!visibleParagraphs.length && <p className="py-8 text-center text-sm text-white/50">Aucun paragraphe ne correspond à cette recherche.</p>}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <span className="text-xs text-white/45">{Object.keys(edits).length} paragraphe(s) modifié(s)</span>
              <button type="button" disabled={loading || saving} onClick={() => void save()} className="inline-flex items-center gap-2 rounded-lg bg-brand-cyan px-4 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Enregistrement…' : 'Publier une nouvelle version'}</button>
            </div>
          </section>

          <aside className="space-y-3 rounded-2xl border border-white/10 bg-[oklch(0.22_0.005_260)] p-4 sm:p-5">
            <h2 className="font-bold text-white">Historique des versions</h2>
            {!template?.revisions.length && <p className="text-sm text-white/50">Aucune révision publiée. Le modèle d’origine est actif.</p>}
            {template?.revisions.map((revision) => (
              <article key={revision.id} className="rounded-xl border border-white/10 bg-black/15 p-3">
                <div className="flex items-center justify-between gap-2"><span className="font-semibold text-white">Version {revision.version}</span>{revision.active && <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">Active</span>}</div>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-white/45"><Clock className="h-3 w-3" />{new Date(revision.created_at).toLocaleString('fr-FR')}</p>
                <button type="button" onClick={() => restoreRevision(revision)} className="mt-2 text-xs font-semibold text-brand-cyan hover:underline">Charger cette version</button>
              </article>
            ))}
          </aside>
        </div>
      </main>
    </AdminLayout>
  )
}
