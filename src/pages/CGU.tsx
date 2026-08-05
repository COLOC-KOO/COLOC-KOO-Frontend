import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SiteLayout } from '../components/site/SiteLayout'

const sections = [
  { id: 1, titleKey: 'section1.title', lines: ['section1.line1', 'section1.line2'] },
  { id: 2, titleKey: 'section2.title', lines: ['section2.line1', 'section2.line2'] },
  { id: 3, titleKey: 'section3.title', lines: ['section3.line1', 'section3.line2'] },
  { id: 4, titleKey: 'section4.title', lines: ['section4.line1', 'section4.line2'] },
  { id: 5, titleKey: 'section5.title', lines: ['section5.line1', 'section5.line2'] },
  { id: 6, titleKey: 'section6.title', lines: ['section6.line1', 'section6.line2'] },
  { id: 7, titleKey: 'section7.title', lines: ['section7.line1', 'section7.line2'] },
  { id: 8, titleKey: 'section8.title', lines: ['section8.line1', 'section8.line2'] },
  { id: 9, titleKey: 'section9.title', lines: ['section9.line1', 'section9.line2'] },
  { id: 10, titleKey: 'section10.title', lines: ['section10.line1', 'section10.line2'] },
]

export default function CGU() {
  const { t } = useTranslation(['cgu', 'common'])

  return (
    <SiteLayout>
      <section className="max-w-5xl mx-auto px-6 py-16 text-slate-900">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500 mb-3">{t('subtitle')}</p>
          <h1 className="bebas text-4xl md:text-5xl text-slate-900 leading-tight">{t('title')}</h1>
          <p className="mt-4 text-sm text-slate-600 leading-7">{t('intro')}</p>
        </div>

        <div className="space-y-10 text-sm leading-7 text-slate-700">
          {sections.map((section) => (
            <article className="space-y-3" key={section.id}>
              <h2 className="text-xl font-semibold text-slate-900">{t(section.titleKey)}</h2>
              {section.lines.map((line) => (
                <p key={line}>{t(line)}</p>
              ))}
            </article>
          ))}

          <article className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">{t('section11.title')}</h2>
            <p>
              {t('section11.line1')}{' '}
              <Link to="/contact" className="text-brand-cyan hover:underline">
                {t('linkContact')}
              </Link>
              .
            </p>
          </article>
        </div>
      </section>
    </SiteLayout>
  )
}
