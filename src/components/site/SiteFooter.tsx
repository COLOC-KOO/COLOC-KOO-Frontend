import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function SiteFooter() {
  const { t } = useTranslation('footer')

  return (
    <footer className="bg-brand-dark text-white/85 w-full">
      <div className="w-full px-4 md:px-6 lg:px-8 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="bebas text-2xl text-white">Sarintany'COLOC</div>
          <p className="text-sm mt-3 text-white/60">
            {t('tagline')}
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-white/50 mb-3">{t('explore')}</div>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/annonces" className="hover:text-white transition-colors">{t('announcements')}</Link>
            </li>
            <li>
              <Link to="/deposer" className="hover:text-white transition-colors">{t('postAnnouncement')}</Link>
            </li>
            <li>
              <Link to="/partenaires" className="hover:text-white transition-colors">{t('becomePartner')}</Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-white/50 mb-3">{t('support')}</div>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/contact" className="hover:text-white transition-colors">{t('contact')}</Link>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">{t('faq')}</a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">{t('terms')}</a>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-white/50 mb-3">{t('newsletter')}</div>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              placeholder={t('emailPlaceholder')}
              className="flex-1 bg-white/10 border border-white/15 rounded-md px-3 py-2 text-sm placeholder:text-white/40 focus:outline-none focus:border-white/30"
            />
            <button className="bg-brand-green text-brand-dark font-bold px-3 rounded-md text-sm hover:bg-brand-green-dark transition-colors">
              {t('subscribe')}
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40 w-full px-4 md:px-6 lg:px-8">
        © 2026 {t('copyright')}
      </div>
    </footer>
  )
}