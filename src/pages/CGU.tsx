import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SiteLayout } from '../components/site/SiteLayout'

type LegalSection = { title: string; paragraphs: string[] }
type LegalPart = { badge: string; title: string; intro?: string; sections: LegalSection[] }

export default function CGU() {
  const { t } = useTranslation(['cgu', 'common'])

  const mentionsLegales = t('mentionsLegales', { returnObjects: true }) as { title: string; paragraphs: string[] }
  const cgu = t('cgu', { returnObjects: true }) as LegalPart
  const confidentialite = t('confidentialite', { returnObjects: true }) as LegalPart
  const cgv = t('cgv', { returnObjects: true }) as LegalPart

  const parts = [cgu, confidentialite, cgv]

  return (
    <SiteLayout>
      <section className="max-w-4xl mx-auto px-6 py-16 text-slate-900">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500 mb-3">{t('pageSubtitle')}</p>
          <h1 className="bebas text-4xl md:text-5xl text-slate-900 leading-tight">{t('pageTitle')}</h1>
        </div>

        {/* Sommaire */}
        <nav className="mb-12 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Sommaire</div>
          <ul className="grid gap-2 sm:grid-cols-2 text-sm">
            <li><a href="#mentions-legales" className="text-brand-cyan hover:underline">Mentions légales</a></li>
            {parts.map((part) => (
              <li key={part.title}>
                <a href={`#partie-${part.badge}`} className="text-brand-cyan hover:underline">{part.title}</a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mentions légales */}
        <article id="mentions-legales" className="scroll-mt-24 mb-12 space-y-3 text-sm leading-7 text-slate-700">
          <h2 className="text-xl font-semibold text-slate-900">{mentionsLegales.title}</h2>
          {mentionsLegales.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </article>

        {/* CGU / Confidentialité / CGV */}
        {parts.map((part) => (
          <div key={part.title} id={`partie-${part.badge}`} className="scroll-mt-24 mb-14">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-bold text-brand-cyan/40">{part.badge}</span>
              <h2 className="bebas text-2xl md:text-3xl text-slate-900">{part.title}</h2>
            </div>
            {part.intro && (
              <p className="text-xs italic text-slate-500 leading-6 mb-6 border-l-2 border-brand-cyan/30 pl-3">
                {part.intro}
              </p>
            )}
            <div className="space-y-8 text-sm leading-7 text-slate-700">
              {part.sections.map((section) => (
                <article className="space-y-2" key={section.title}>
                  <h3 className="text-base font-semibold text-slate-900">{section.title}</h3>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </article>
              ))}
            </div>
          </div>
        ))}

        <p className="text-xs text-slate-400 border-t border-slate-200 pt-6">
          {t('lastUpdate')}{' '}
          Une question sur ces conditions ?{' '}
          <Link to="/contact" className="text-brand-cyan hover:underline">
            {t('linkContact')}
          </Link>
          .
        </p>
      </section>
    </SiteLayout>
  )
}
