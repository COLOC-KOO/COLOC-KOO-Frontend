import React from 'react'
import { Link } from 'react-router-dom'
import { SiteLayout } from '../components/site/SiteLayout'

export default function CGU() {
  return (
    <SiteLayout>
      <section className="max-w-5xl mx-auto px-6 py-16 text-slate-900">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500 mb-3">Conditions générales d'utilisation</p>
          <h1 className="bebas text-4xl md:text-5xl text-slate-900 leading-tight">Conditions générales d'utilisation de Sarintany'COLOC</h1>
          <p className="mt-4 text-sm text-slate-600 leading-7">
            Ce document regroupe les conditions générales d'utilisation, la politique de confidentialité et la gestion des données personnelles pour le service Sarintany'COLOC.
          </p>
        </div>

        <div className="space-y-10 text-sm leading-7 text-slate-700">
          <article className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">1. Objet</h2>
            <p>
              Les présentes conditions générales d'utilisation (CGU) définissent les modalités et conditions dans lesquelles vous utilisez le site et les services proposés par Sarintany'COLOC.
            </p>
            <p>
              En accédant au site, vous acceptez expressément l'ensemble des clauses de ce document.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">2. Champ d'application</h2>
            <p>
              Ce texte s'applique à toutes les personnes utilisant le site pour rechercher un logement, publier une annonce, contacter un partenaire ou utiliser les services associés.
            </p>
            <p>
              Il couvre également la collecte, le traitement et la protection des données personnelles.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">3. Accès et disponibilité</h2>
            <p>
              Sarintany'COLOC met tout en œuvre pour garantir un accès continu au service, sans toutefois pouvoir garantir une disponibilité permanente en raison de maintenances, mises à jour ou incidents techniques.
            </p>
            <p>
              L'accès au site peut être interrompu ou restreint temporairement sans préavis.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">4. Inscription et utilisation</h2>
            <p>
              Certaines fonctionnalités peuvent nécessiter la création d'un compte. Vous êtes responsable des informations que vous fournissez et devez vous assurer qu'elles sont exactes et à jour.
            </p>
            <p>
              Il est interdit d'utiliser le site à des fins illégales, diffamatoires, frauduleuses, ou contraires aux bonnes mœurs.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">5. Propriété intellectuelle</h2>
            <p>
              Tous les éléments du site (textes, images, logos, design, etc.) sont protégés par le droit de la propriété intellectuelle et demeurent la propriété de Sarintany'COLOC ou de ses partenaires.
            </p>
            <p>
              Toute reproduction ou utilisation non autorisée est interdite.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">6. Données personnelles</h2>
            <p>
              Les données collectées sont utilisées pour la gestion des comptes, l'amélioration du service et la communication avec les utilisateurs.
            </p>
            <p>
              Vous disposez de droits d'accès, de rectification et de suppression de vos données. Pour toute demande, vous pouvez nous contacter depuis la <Link to="/contact" className="text-brand-cyan hover:underline">page contact</Link>.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">7. Sécurité</h2>
            <p>
              Sarintany'COLOC met en place des mesures techniques raisonnables pour protéger les données, mais ne peut garantir une sécurité absolue contre toutes les intrusions ou attaques informatiques.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">8. Limitation de responsabilité</h2>
            <p>
              Sarintany'COLOC n'est pas responsable des préjudices résultant de l'utilisation du service, notamment en cas d'inexactitudes dans les annonces ou de comportement des tiers.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">9. Liens externes</h2>
            <p>
              Le site peut contenir des liens vers des sites tiers. Sarintany'COLOC n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">10. Modification des CGU</h2>
            <p>
              Nous pouvons mettre à jour ces conditions à tout moment. Les modifications sont publiées sur cette page et deviennent effectives dès leur publication.
            </p>
          </article>

          <article className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">11. Contact</h2>
            <p>
              Pour toute question concernant ces conditions générales d'utilisation, veuillez nous écrire via la <Link to="/contact" className="text-brand-cyan hover:underline">page contact</Link> ou à l'adresse hello@sarintany-coloc.mg.
            </p>
          </article>
        </div>
      </section>
    </SiteLayout>
  )
}
