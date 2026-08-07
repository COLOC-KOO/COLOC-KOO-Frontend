import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SiteLayout } from '../components/site/SiteLayout'
import { api, type ApiPartenaireCampagne } from '../lib/api'
import { LazyImage } from '../components/ui/LazyImage'

function normalizeImageUrl(value: string | null | undefined) {
  if (!value) return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `${import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:4000'}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`
}

function normalizePartnerLevel(value: string | null | undefined) {
  return (value || '').trim().toLowerCase()
}

function getLevelStyle(level: string) {
  switch (level) {
    case 'diamant':
      return {
        badge: 'border-cyan-200 bg-cyan-50 text-cyan-700',
        card: 'border-cyan-200/70 bg-gradient-to-br from-cyan-50/60 to-white',
      }
    case 'or':
      return {
        badge: 'border-amber-200 bg-amber-50 text-amber-700',
        card: 'border-amber-200/70 bg-gradient-to-br from-amber-50/60 to-white',
      }
    case 'argent':
      return {
        badge: 'border-slate-200 bg-slate-50 text-slate-700',
        card: 'border-slate-200/70 bg-gradient-to-br from-slate-50/70 to-white',
      }
    case 'bronze':
      return {
        badge: 'border-orange-200 bg-orange-50 text-orange-700',
        card: 'border-orange-200/70 bg-gradient-to-br from-orange-50/60 to-white',
      }
    default:
      return {
        badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        card: 'border-emerald-200/70 bg-gradient-to-br from-emerald-50/60 to-white',
      }
  }
}

export default function PartenairesTous() {
  const { t } = useTranslation(['home', 'common'])
  const [partners, setPartners] = useState<ApiPartenaireCampagne[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    api.partenairesCampagnes()
      .then((data) => {
        if (cancelled) return
        if (!Array.isArray(data)) {
          setPartners([])
          return
        }

        const deduped = data.filter((item, index, array) => {
          const firstIndex = array.findIndex((candidate) => candidate.id_partenaire === item.id_partenaire)
          return firstIndex === index
        })

        setPartners(deduped)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Impossible de charger les partenaires.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <SiteLayout>
      <section className="max-w-6xl mx-auto px-4 py-14 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500 mb-2">{t('home:partners.title')}</p>
            <h1 className="bebas text-4xl md:text-5xl text-slate-900 leading-tight">{t('home:partners.allPartnersTitle')}</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">{t('home:partners.allPartnersSubtitle')}</p>
          </div>
          <Link
            to="/partenaires"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {t('home:partners.becomePartner')}
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
            {t('common:common.loading')}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-10 text-center text-rose-700">
            {error}
          </div>
        ) : partners.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
            {t('home:partners.empty')}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {partners.map((partner) => {
              const levelValue = normalizePartnerLevel(partner.partenaire_niveau || partner.niveau)
              const levelStyle = getLevelStyle(levelValue)
              const levelLabel = partner.partenaire_niveau || partner.niveau || ''

              return (
                <div key={partner.id_partenaire} className={`rounded-2xl border border-slate-200 border-t-[3px] border-t-[#cacc7d] bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${levelStyle.card}`}>
                  <div className="mb-4 flex flex-col items-center justify-center gap-3 text-center">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white/90 shadow-sm">
                      {partner.visuel || partner.logo ? (
                        <LazyImage
                          src={normalizeImageUrl(partner.visuel || partner.logo)}
                          alt={partner.partenaire_nom || partner.titre || partner.nom || 'Partenaire'}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-slate-700">{(partner.partenaire_nom || partner.titre || partner.nom || 'P').charAt(0)}</span>
                      )}
                    </div>
                    {levelLabel && (
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${levelStyle.badge}`}>
                        {levelLabel}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-center space-y-1 text-center">
                    <h2 className="text-base font-semibold text-slate-900">
                      {partner.partenaire_nom || partner.titre || partner.nom || 'Partenaire'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {partner.secteur || 'Partenaire'}
                    </p>
                  </div>

                  {partner.description && <p className="mt-3 text-sm leading-relaxed text-slate-600">{partner.description}</p>}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(partner.engagement || partner.remise) && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700">
                        {partner.engagement || partner.remise}
                      </span>
                    )}
                    {partner.statut && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700">
                        {partner.statut}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </SiteLayout>
  )
}
