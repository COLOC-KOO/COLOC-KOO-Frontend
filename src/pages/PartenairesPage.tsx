import { useState } from 'react';

const TIERS = ['Diamant', 'Or', 'Argent', 'Bronze'] as const;

const PARTENAIRES = [
  { id: 'p1', nom: 'BNI Madagascar', secteur: 'Banque & Finance', tier: 'Diamant' as const, remise: '5% sur frais de dossier', engagement: 'Accompagnement bancaire des nouveaux colocataires', logo: '🏦' },
  { id: 'p2', nom: 'Orange Madagascar', secteur: 'Télécommunications', tier: 'Diamant' as const, remise: '20% sur forfaits fibre', engagement: 'Connexion internet prioritaire pour les colocs', logo: '📱' },
  { id: 'p3', nom: 'Jirama', secteur: 'Eau & Électricité', tier: 'Or' as const, remise: 'Raccordement rapide', engagement: 'Mise en service prioritaire pour les nouvelles colocs', logo: '💡' },
  { id: 'p4', nom: 'Moov Africa', secteur: 'Télécommunications', tier: 'Or' as const, remise: '15% sur abonnements data', engagement: 'Offres mobiles avantageuses pour les colocataires', logo: '📶' },
  { id: 'p5', nom: 'Pizza Place', secteur: 'Restauration', tier: 'Argent' as const, remise: '10% sur commandes', engagement: 'Livraison offerte au-dessus de 50 000 Ar', logo: '🍕' },
  { id: 'p6', nom: 'TechMada', secteur: 'High-Tech', tier: 'Argent' as const, remise: '8% sur appareils', engagement: 'Équipement tech pour votre coloc', logo: '💻' },
  { id: 'p7', nom: 'Pharmacie Centrale', secteur: 'Santé', tier: 'Bronze' as const, remise: '5% sur achats', engagement: 'Santé de proximité pour colocataires', logo: '💊' },
  { id: 'p8', nom: 'Supermarché Leader Price', secteur: 'Alimentation', tier: 'Bronze' as const, remise: 'Carte de fidélité', engagement: 'Courses du quotidien à prix avantageux', logo: '🛒' },
];

const TIER_STYLES = {
  Diamant: { bg: 'bg-gradient-to-br from-[#E8F4FD] to-[#D0E8F8]', border: 'border-[#46BDD6]', badge: 'bg-sc-cy text-white', top: 'border-t-4 border-t-sc-cy' },
  Or: { bg: 'bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7]', border: 'border-amber-300', badge: 'bg-amber-400 text-white', top: 'border-t-4 border-t-amber-400' },
  Argent: { bg: 'bg-gradient-to-br from-[#F8F8F8] to-[#EFEFEF]', border: 'border-gray-300', badge: 'bg-gray-400 text-white', top: 'border-t-4 border-t-gray-400' },
  Bronze: { bg: 'bg-gradient-to-br from-[#FFF7F3] to-[#FDEEE8]', border: 'border-orange-200', badge: 'bg-orange-400 text-white', top: 'border-t-4 border-t-orange-400' },
};

export default function PartenairesPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nom: '', email: '', secteur: '', tier: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-sc-bg">
      {/* Hero */}
      <div className="bg-sc-dark py-10 px-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-sc-y1/20 flex items-center justify-center mx-auto mb-4">
          <i className="ti ti-building text-3xl text-sc-y1" />
        </div>
        <h1 className="font-bebas text-3xl text-white tracking-wide mb-2">Nos Partenaires</h1>
        <p className="text-sm text-white/60 max-w-lg mx-auto">
          Sarintany'COLOC s'associe aux meilleures entreprises de Madagascar pour offrir des avantages exclusifs à nos colocataires.
        </p>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-sc-bd">
        <div className="max-w-4xl mx-auto px-4 py-5 grid grid-cols-3 gap-4 text-center">
          {[
            { n: '15+', l: 'Partenaires actifs' },
            { n: '4', l: 'Niveaux de partenariat' },
            { n: '850+', l: 'Colocataires bénéficiaires' },
          ].map(s => (
            <div key={s.l}>
              <p className="font-bebas text-2xl text-sc-cy tracking-wide">{s.n}</p>
              <p className="text-xs text-sc-gr2">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tiers */}
        {TIERS.map(tier => {
          const partners = PARTENAIRES.filter(p => p.tier === tier);
          const style = TIER_STYLES[tier];
          return (
            <div key={tier} className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-xl text-xs font-bold ${style.badge}`}>
                  {tier === 'Diamant' ? '💎' : tier === 'Or' ? '⭐' : tier === 'Argent' ? '🥈' : '🥉'} {tier}
                </span>
                <div className="flex-1 h-px bg-sc-bd" />
                <span className="text-xs text-sc-gr2">{partners.length} partenaire{partners.length > 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {partners.map(p => (
                  <div
                    key={p.id}
                    className={`rounded-2xl border-2 p-4 ${style.bg} ${style.border} ${style.top}`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                        {p.logo}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-sc-dark">{p.nom}</p>
                        <p className="text-[10px] text-sc-gr2">{p.secteur}</p>
                      </div>
                    </div>
                    {p.remise && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/70 rounded-xl mb-2 w-fit">
                        <i className="ti ti-tag text-xs text-sc-y2" />
                        <span className="text-xs font-bold text-[#4a7020]">{p.remise}</span>
                      </div>
                    )}
                    <p className="text-xs text-sc-gr1 italic leading-relaxed">{p.engagement}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Become partner CTA */}
        <div className="bg-sc-dark rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-sc-y1/20 flex items-center justify-center mx-auto mb-3">
            <i className="ti ti-handshake text-2xl text-sc-y1" />
          </div>
          <h2 className="font-bebas text-2xl text-white tracking-wide mb-2">Devenez partenaire</h2>
          <p className="text-sm text-white/60 mb-4 max-w-md mx-auto">
            Votre entreprise propose des services utiles aux colocataires ? Rejoignez notre réseau de partenaires et touchez des milliers d'utilisateurs.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-5">
            {['Visibilité sur 850+ profils', 'Logo sur toutes les pages', 'Newsletter mensuelle', 'Badge partenaire vérifié'].map(a => (
              <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white/80 text-xs rounded-xl">
                <i className="ti ti-check text-sc-y2 text-xs" />
                {a}
              </span>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-sc-y2 text-white border-none rounded-xl text-sm font-bold cursor-pointer hover:bg-[#7faa28] transition-colors inline-flex items-center gap-2"
          >
            <i className="ti ti-send text-sm" />
            Soumettre une demande
          </button>
        </div>
      </div>

      {/* Partner request modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center py-8 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 animate-fadeIn">
            {!sent ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bebas text-xl text-sc-dark">Demande de partenariat</h3>
                  <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-full bg-gray-100 border-none cursor-pointer flex items-center justify-center">
                    <i className="ti ti-x text-sm" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                  {[
                    { label: 'Nom de l\'entreprise', field: 'nom', type: 'text', placeholder: 'Mon Entreprise SARL' },
                    { label: 'Email de contact', field: 'email', type: 'email', placeholder: 'contact@monentreprise.mg' },
                    { label: 'Secteur d\'activité', field: 'secteur', type: 'text', placeholder: 'ex: Finance, Télécom, Restauration…' },
                  ].map(f => (
                    <div key={f.field}>
                      <label className="block text-xs font-bold text-sc-dark mb-1">{f.label}</label>
                      <input
                        type={f.type}
                        value={form[f.field as keyof typeof form]}
                        onChange={e => setForm(prev => ({ ...prev, [f.field]: e.target.value }))}
                        placeholder={f.placeholder}
                        required
                        className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sc-cy"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-bold text-sc-dark mb-1">Niveau souhaité</label>
                    <div className="flex gap-2 flex-wrap">
                      {TIERS.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, tier: t }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${form.tier === t ? TIER_STYLES[t].badge + ' border-transparent' : 'border-sc-bd bg-white text-sc-gr1 hover:border-sc-cy'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sc-dark mb-1">Message (offre envisagée)</label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Décrivez l'avantage ou la remise que vous souhaitez offrir aux colocataires…"
                      rows={3}
                      className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sc-cy resize-none"
                    />
                  </div>
                  <button type="submit" className="w-full bg-sc-cy text-white border-none rounded-xl py-3 text-sm font-bold cursor-pointer hover:bg-sc-cy-d">
                    Envoyer la demande
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-sc-g-lt flex items-center justify-center mx-auto mb-4">
                  <i className="ti ti-circle-check text-3xl text-sc-y2" />
                </div>
                <h3 className="font-bebas text-xl text-sc-dark mb-2">Demande envoyée !</h3>
                <p className="text-sm text-sc-gr1 mb-4">Notre équipe commerciale vous contactera sous 48h.</p>
                <button onClick={() => { setShowModal(false); setSent(false); }} className="bg-sc-cy text-white border-none rounded-xl px-5 py-2.5 text-sm font-bold cursor-pointer hover:bg-sc-cy-d">
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
