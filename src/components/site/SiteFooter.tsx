import React from 'react'
import { Link } from 'react-router-dom'

export function SiteFooter() {
  return (
    <footer className="bg-brand-dark text-white/85 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="bebas text-2xl text-white">Sarintany'COLOC</div>
          <p className="text-sm mt-3 text-white/60">
            La colocation nouvelle génération, partout à Madagascar.
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-white/50 mb-3">Explorer</div>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/annonces">Annonces</Link>
            </li>
            <li>
              <Link to="/deposer">Déposer une annonce</Link>
            </li>
            <li>
              <Link to="/partenaires">Devenir partenaire</Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-white/50 mb-3">Support</div>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <a href="#">FAQ</a>
            </li>
            <li>
              <a href="#">CGU · Confidentialité</a>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-white/50 mb-3">Newsletter</div>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              placeholder="Votre email"
              className="flex-1 bg-white/10 border border-white/15 rounded-md px-3 py-2 text-sm placeholder:text-white/40"
            />
            <button className="bg-brand-green text-brand-dark font-bold px-3 rounded-md text-sm">
              OK
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © 2026 Sarintany Group — Antananarivo, Madagascar
      </div>
    </footer>
  )
}
