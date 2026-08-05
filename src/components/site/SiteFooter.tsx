import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogoSVG, LogoName } from '../Logo'

export default function Footer() {
  const { t } = useTranslation(['common'])

  return (
    <footer className="bg-[#2c2c2c] py-6 px-6 text-center mt-9">
      <div className="flex items-center justify-center gap-2.5 mb-2">
        <LogoSVG height={28} />
        <LogoName />
      </div>
      <p className="text-[10px] text-white/35 mb-3 leading-7">
        Un service gratuit proposé par{' '}
        <a
          href="https://excellent-consonant-8e8.notion.site/Bienvenue-dans-Coloc-KOO-Services-page-publique-b75006b17258823eaa630105a47d1ffc"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sc-cy font-bold no-underline hover:underline"
        >
          Coloc'KOO SARL
        </a>
        <br />
        Immeuble ARO Ampefiloha, Étg.1 Esc.B, Porte B104, 101 Antananarivo, Madagascar
      </p>
      <div className="flex justify-center gap-3.5 flex-wrap">
        <Link
          to="/cgu"
          className="text-[11px] text-white/45 no-underline hover:text-white/75 transition-colors"
        >
          {t('common:cgu')}
        </Link>
        <Link
          to="/contact"
          className="text-[11px] text-white/45 no-underline hover:text-white/75 transition-colors"
        >
          {t('common:contact')}
        </Link>
        <Link
          to="/partenaires"
          className="text-[11px] text-white/45 no-underline hover:text-white/75 transition-colors"
        >
          {t('common:partenaires')}
        </Link>
      </div>
      <p className="text-[10px] text-white/20 mt-4">
        © {new Date().getFullYear()} Sarintany'COLOC — Tous droits réservés
      </p>
    </footer>
  )
}
