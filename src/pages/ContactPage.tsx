import { useState } from 'react';
import { api } from '../services/api';

export default function ContactPage() {
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.contact.create(form);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Envoi impossible');
    } finally {
      setLoading(false);
    }
  };

  const CONTACTS = [
    { icon: 'ti-map-pin', label: 'Adresse', val: 'Immeuble ARO Ampefiloha, Etg.1 Esc.B, Porte B104\n101 Antananarivo, Madagascar', color: 'text-sc-cy' },
    { icon: 'ti-mail', label: 'Email', val: 'contact@sarintanycoloc.mg', color: 'text-sc-y2' },
    { icon: 'ti-phone', label: 'Telephone', val: '+261 34 00 000 00', color: 'text-sc-cy' },
    { icon: 'ti-clock', label: 'Horaires', val: 'Lun - Ven · 8h - 17h\nSam · 9h - 12h', color: 'text-sc-y1' },
  ];

  const FAQ = [
    { q: 'Comment deposer une annonce ?', r: 'Creez un compte gratuit, puis cliquez sur "Deposer une annonce". Notre equipe verifie et publie votre annonce sous 24h.' },
    { q: 'Est-ce que le service est vraiment gratuit ?', r: 'Oui, Sarintany\'COLOC est 100% gratuit pour les colocataires et les proprietaires. Nous sommes finances par nos partenaires.' },
    { q: 'Comment fonctionne la verification des annonces ?', r: 'Notre equipe de moderateurs verifie chaque annonce avant publication : photos, prix, informations du proprietaire.' },
    { q: 'Comment signaler une annonce suspecte ?', r: 'Utilisez le bouton "Signaler" sur chaque annonce. Notre equipe traite les signalements sous 2h.' },
  ];

  return (
    <div className="min-h-screen bg-sc-bg">
      <div className="bg-sc-dark py-10 px-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-sc-cy/20 flex items-center justify-center mx-auto mb-4">
          <i className="ti ti-message-circle text-3xl text-sc-cy" />
        </div>
        <h1 className="font-bebas text-3xl text-white tracking-wide mb-2">Contactez-nous</h1>
        <p className="text-sm text-white/60 max-w-md mx-auto">Notre equipe est disponible pour repondre a toutes vos questions sur Sarintany'COLOC.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div>
            {sent ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-sc-bd">
                <div className="w-16 h-16 rounded-full bg-sc-g-lt flex items-center justify-center mx-auto mb-4">
                  <i className="ti ti-circle-check text-4xl text-sc-y2" />
                </div>
                <h3 className="font-bebas text-2xl text-sc-dark mb-2">Message envoye !</h3>
                <p className="text-sm text-sc-gr1 mb-4">Nous vous repondrons dans les 24 heures.</p>
                <button
                  onClick={() => { setSent(false); setForm({ nom: '', email: '', sujet: '', message: '' }); }}
                  className="px-5 py-2.5 bg-sc-cy text-white border-none rounded-xl text-sm font-bold cursor-pointer hover:bg-sc-cy-d"
                >
                  Nouveau message
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-sc-bd">
                <h2 className="font-bebas text-xl text-sc-dark mb-1">Envoyez-nous un message</h2>
                <p className="text-xs text-sc-gr2 mb-4">Reponse garantie sous 24h</p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-sc-dark mb-1">Nom complet</label>
                      <input
                        type="text"
                        value={form.nom}
                        onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                        placeholder="Rakoto Andriamahefa"
                        required
                        className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sc-cy"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-sc-dark mb-1">Email</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="mon@email.mg"
                        required
                        className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sc-cy"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sc-dark mb-1">Sujet</label>
                    <select
                      value={form.sujet}
                      onChange={e => setForm(f => ({ ...f, sujet: e.target.value }))}
                      required
                      className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm text-sc-dark outline-none focus:border-sc-cy bg-white"
                    >
                      <option value="">Choisir un sujet...</option>
                      <option>Question sur une annonce</option>
                      <option>Signalement d'un probleme</option>
                      <option>Partenariat</option>
                      <option>Support technique</option>
                      <option>Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sc-dark mb-1">Message</label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Decrivez votre demande en detail..."
                      required
                      rows={5}
                      className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sc-cy resize-none"
                    />
                  </div>
                  {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-sc-cy text-white border-none rounded-xl py-3 text-sm font-bold cursor-pointer hover:bg-sc-cy-d transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <i className="ti ti-send text-sm" />
                    {loading ? 'Envoi...' : 'Envoyer le message'}
                  </button>
                </form>
              </div>
            )}

            <div className="mt-5 bg-white rounded-2xl p-5 border border-sc-bd">
              <h2 className="font-bebas text-xl text-sc-dark mb-3 flex items-center gap-2">
                <i className="ti ti-help-circle text-sc-cy" />
                Questions frequentes
              </h2>
              <div className="space-y-3">
                {FAQ.map((item, i) => (
                  <details key={i} className="group">
                    <summary className="flex items-center justify-between cursor-pointer py-2.5 border-b border-sc-bd text-sm font-bold text-sc-dark list-none">
                      {item.q}
                      <i className="ti ti-chevron-down text-sc-gr2 text-sm group-open:rotate-180 transition-transform" />
                    </summary>
                    <p className="text-xs text-sc-gr1 leading-relaxed pt-2.5 pb-1">{item.r}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {CONTACTS.map(c => (
              <div key={c.label} className="bg-white rounded-2xl p-4 border border-sc-bd flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-sc-bg flex items-center justify-center flex-shrink-0">
                  <i className={`ti ${c.icon} text-xl ${c.color}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-sc-gr2 mb-0.5">{c.label}</p>
                  <p className="text-sm text-sc-dark whitespace-pre-line">{c.val}</p>
                </div>
              </div>
            ))}

            <div className="bg-white rounded-2xl p-4 border border-sc-bd">
              <p className="text-xs font-bold text-sc-dark mb-3">Suivez-nous</p>
              <div className="flex gap-2">
                {[
                  { icon: 'ti-brand-facebook', color: '#1877F2', label: 'Facebook' },
                  { icon: 'ti-brand-instagram', color: '#E4405F', label: 'Instagram' },
                  { icon: 'ti-brand-whatsapp', color: '#25D366', label: 'WhatsApp' },
                ].map(s => (
                  <button
                    key={s.label}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-sc-bd text-xs font-bold cursor-pointer hover:bg-gray-50 transition-colors bg-white"
                    style={{ color: s.color }}
                  >
                    <i className={`ti ${s.icon} text-sm`} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

