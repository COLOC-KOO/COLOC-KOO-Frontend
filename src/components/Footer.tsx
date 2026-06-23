import { Link } from 'react-router-dom';
import { LogoSVG, LogoName } from './Logo';

export default function Footer() {
  return (
    <footer className="bg-sc-dark py-6 px-6 text-center mt-9">
      <div className="flex items-center justify-center gap-2.5 mb-2">
        <LogoSVG height={28} />
        <span className="font-bebas text-[17px] tracking-wide">
          <span style={{ color: '#46BDD6' }}>SARINTANY'</span>
          <span style={{ color: '#99CC33' }}>COLOC</span>
        </span>
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
        {[
          { to: '/cgu', label: 'Conditions générales d\'utilisation' },
          { to: '/confidentialite', label: 'Politique de confidentialité RGPD' },
          { to: '/donnees', label: 'Données personnelles' },
          { to: '/contact', label: 'Contact' },
          { to: '/partenaires', label: 'Partenaires' },
        ].map(link => (
          <Link
            key={link.to}
            to={link.to}
            className="text-[11px] text-white/45 no-underline hover:text-white/75 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <p className="text-[10px] text-white/20 mt-4">
        © {new Date().getFullYear()} Sarintany'COLOC — Tous droits réservés
      </p>
    </footer>
  );
}
