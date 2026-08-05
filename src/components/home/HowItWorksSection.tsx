import React from 'react'
import { useTranslation } from 'react-i18next'

export function HowItWorksSection() {
  const { t } = useTranslation('home')

  const translations = t('howItWorks.steps', { returnObjects: true }) as Array<any>

  const defaultSteps = [
    {
      title: 'Recherche ta coloc',
      description: 'Filtre par ville, budget, services et règles de vie. Trouve le logement qui correspond à tes critères.',
    },
    {
      title: 'Postule ou contacte',
      description: 'Envoie ta candidature directement depuis la fiche. Complète ton profil pour rassurer les colocataires.',
    },
    {
      title: "Emménage !",
      description: "Finalise les démarches avec les colocataires et le propriétaire. Sarintany'COLOC t'accompagne jusqu'à la signature.",
    },
  ]

  const steps = Array.isArray(translations) && translations.length >= 3
    ? translations
    : defaultSteps

  const colors = ['#46BDD6', '#99CC33', '#CCCC33']

  return (
    <section className="py-6 px-5 bg-[#F7F9F3]">
      <h2 className="font-bebas text-[22px] text-sc-dark tracking-wide mb-1 text-center">{t('howItWorks.title') || 'Comment ça marche'}</h2>
      <p className="text-xs text-sc-gr2 mb-5 text-center">{t('howItWorks.subtitle') || 'En 3 étapes simples'}</p>

      <div className="flex flex-col gap-3.5 max-w-lg mx-auto">
        {steps.map((step: any, idx: number) => (
          <div key={idx} className="flex items-start gap-3.5">
            <div
              className="w-[30px] h-[30px] rounded-full flex items-center justify-center font-bebas text-base flex-shrink-0 text-white"
              style={{ background: colors[idx] || colors[0] }}
            >
              {idx + 1}
            </div>
            <div>
              <p className="text-sm font-bold text-sc-dark mb-0.5">{step.title || step.title}</p>
              <p className="text-xs text-sc-gr1 leading-relaxed">{step.description || step.desc || ''}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="max-w-3xl mx-auto rounded-xl border border-slate-200 bg-gradient-to-r from-[#F7FFF7] to-[#F3FFF1] p-6 text-center shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">{t('howItWorks.baseline.title') || "UNE PLATEFORME NÉE D'UNE COLOC, POUR TOUTES LES COLOCS"}</h3>
          <p className="text-sm text-slate-600 mt-3">{t('howItWorks.baseline.desc') || 'Le service est gratuit pour tous les colocataires. Les annonces publiées sont vérifiées afin de garantir la sécurité de chacun.'}</p>
          <div className="my-4 h-px bg-slate-200" />
          <p className="text-sm italic text-[var(--brand-cyan-dark)]">{t('howItWorks.baseline.quote') || '"Trouves ta colocation, partout à Madagascar."'}</p>
        </div>
      </div>
    </section>
  )
}
