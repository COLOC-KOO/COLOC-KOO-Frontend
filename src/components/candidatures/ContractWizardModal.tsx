import React from "react";
import { Check, ChevronLeft, Info, Mail, Sparkles, X } from "lucide-react";
import { LogoMark } from "../Logo";

type Props = {
  activeBail: any[];
  activeBody: { titre: string; intro: string; corps: string };
  activeClauses: any[];
  activeContratOffers: any[];
  activeEdlOffers: any[];
  activeMailNote: { contrat: string; edl: string };
  activeOffer: { titre: string; texte: string };
  activeSolidarite: any[];
  annonceData: any;
  bailType: "individuel" | "collectif" | null;
  contractError: string | null;
  contractMode: "contrat" | "edl" | "both";
  contractStep: "offer" | "bail" | "contenu" | "paiement" | "done";
  contractSubmitting: boolean;
  createdContracts: any[];
  mobileMoneyList: Array<{ nom: string; numero: string; couleur: string; hint: string }>;
  moyenPaiement: string | null;
  myShare: number | null;
  ownerRetained: Array<{ name: string }>;
  paymentInfo: { reference: string; montant: number; paidCount?: number; total?: number; allPaid?: boolean } | null;
  payRef: string;
  moveInLabel: string;
  solidarite: "avec" | "sans";
  userEmail: string;
  fmtAr: (value: number) => string;
  previewAmount: (mode: "contrat" | "edl" | "both") => number;
  renderTemplate: (tpl: string, vars: Record<string, string>) => React.ReactNode;
  onChooseOffer: (mode: "contrat" | "edl" | "both") => void;
  onClose: () => void;
  onConfirmPayment: () => void;
  onFinalizeContract: () => void;
  onIgnoreOffer: () => void;
  onOpenContractDocument: (contractId: number) => void;
  onPayRefChange: (value: string) => void;
  onQrScan: (operator: string) => void;
  onSetContractStep: (step: "offer" | "bail" | "contenu" | "paiement" | "done") => void;
  onSetBailType: (value: "individuel" | "collectif") => void;
  onSetSolidarite: (value: "avec" | "sans") => void;
  onToggleEdl: () => void;
  onSetMoyenPaiement: (value: string) => void;
  onShowCelebrateAfterPayment: () => void;
};

function repairUtf8Text(value: string) {
  if (!/[ÃÂâ€™œžŸ]/.test(value)) return value;
  const cp1252: Record<string, number> = {
    "€": 0x80, "‚": 0x82, "ƒ": 0x83, "„": 0x84, "…": 0x85, "†": 0x86, "‡": 0x87,
    "ˆ": 0x88, "‰": 0x89, "Š": 0x8a, "‹": 0x8b, "Œ": 0x8c, "Ž": 0x8e, "‘": 0x91,
    "’": 0x92, "“": 0x93, "”": 0x94, "•": 0x95, "–": 0x96, "—": 0x97, "˜": 0x98,
    "™": 0x99, "š": 0x9a, "›": 0x9b, "œ": 0x9c, "ž": 0x9e, "Ÿ": 0x9f,
  };
  try {
    const bytes = Uint8Array.from([...value].map((char) => cp1252[char] ?? char.charCodeAt(0)));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return value;
  }
}

export function ContractWizardModal({
  activeBail,
  activeBody,
  activeClauses,
  activeContratOffers,
  activeEdlOffers,
  activeMailNote,
  activeOffer,
  activeSolidarite,
  annonceData,
  bailType,
  contractError,
  contractMode,
  contractStep,
  contractSubmitting,
  createdContracts,
  fmtAr,
  mobileMoneyList,
  moyenPaiement,
  moveInLabel,
  myShare,
  ownerRetained,
  paymentInfo,
  payRef,
  previewAmount,
  renderTemplate,
  solidarite,
  userEmail,
  onChooseOffer,
  onClose,
  onConfirmPayment,
  onFinalizeContract,
  onIgnoreOffer,
  onOpenContractDocument,
  onPayRefChange,
  onQrScan,
  onSetContractStep,
  onSetBailType,
  onSetSolidarite,
  onToggleEdl,
  onSetMoyenPaiement,
  onShowCelebrateAfterPayment,
}: Props) {
  const orderTotal = createdContracts.reduce((sum, contract) => sum + Number(contract.montant_total || 0), 0);
  const previewTotal = previewAmount(contractMode);
  const isEdlOnly = contractMode === "edl";
  const priceLabel = isEdlOnly ? "Document d'état des lieux (forfait)" : "Création du contrat (forfait)";
  const coName = repairUtf8Text(ownerRetained.map((candidate) => candidate.name).join(", ")) || "—";
  const coAddr = repairUtf8Text([annonceData?.adresse_exacte, annonceData?.quartier, annonceData?.ville, annonceData?.region].filter(Boolean).join(", ")) || "—";
  const announcementDetails = [
    annonceData?.titre ? repairUtf8Text(annonceData.titre) : null,
    annonceData?.reference ? `Réf. ${annonceData.reference}` : null,
    annonceData?.type_propriete ? repairUtf8Text(annonceData.type_propriete) : null,
    annonceData?.surface_totale ? `${annonceData.surface_totale} m²` : null,
    annonceData?.bedrooms_count ? `${annonceData.bedrooms_count} chambre${annonceData.bedrooms_count > 1 ? "s" : ""}` : null,
    annonceData?.total_colocataires ? `${annonceData.total_colocataires} colocataires` : null,
    annonceData?.chambre?.prix_loyer ? `${fmtAr(Number(annonceData.chambre.prix_loyer))} Ar / mois` : null,
    annonceData?.chambre?.prix_charges ? `${fmtAr(Number(annonceData.chambre.prix_charges))} Ar de charges` : null,
    annonceData?.chambre?.est_meuble ? "Logement meublé" : null,
    annonceData?.internet ? `Internet : ${annonceData.internet}` : null,
    ...(Array.isArray(annonceData?.services) ? annonceData.services.map((service: string) => `Service : ${repairUtf8Text(service)}`) : []),
    ...(Array.isArray(annonceData?.amenities) ? annonceData.amenities.map((amenity: string) => `Équipement : ${repairUtf8Text(amenity)}`) : []),
    ...(Array.isArray(annonceData?.regles) ? annonceData.regles.map((rule: string) => `Règle : ${repairUtf8Text(rule)}`) : []),
  ].filter(Boolean) as string[];
  const isWizardStep = contractStep === "bail" || contractStep === "contenu" || contractStep === "paiement";
  const fallbackClauses = [
    ["Identités & logement", "Colocataires, adresse du bien, date d'entrée (inclus)."],
    ["Répartition du loyer et des charges", "Quote-part de chacun, modalités de paiement."],
    ["Dépôt de garantie / caution solidaire", "Montant et conditions de restitution."],
    ["État des lieux d'entrée", "Annexe descriptive des parties privatives et communes."],
    ["Clause de départ anticipé", "Préavis et remplacement du colocataire sortant."],
  ];
  const clauses = activeClauses.length ? activeClauses.map((clause) => [clause.titre || clause.nom, clause.description || clause.texte || "Clause incluse dans le contrat."]) : fallbackClauses;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brand-dark/70 p-4 backdrop-blur-[2px] sm:p-6" role="dialog" aria-modal="true" aria-labelledby="contract-wizard-title">
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
        {Array.from({ length: 55 }).map((_, index) => (
          <span
            key={index}
            className={`celebration-confetti celebration-confetti-${index % 5}`}
            style={{
              left: `${(index * 41) % 101}%`,
              animationDelay: `${(index % 12) * 0.08}s`,
              animationDuration: `${4.6 + (index % 5) * 0.35}s`,
            }}
          />
        ))}
      </div>
      <div className="celebration-modal relative z-20 my-auto max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[18px] bg-white p-5 shadow-2xl sm:p-7">
        {isWizardStep && (
          <div className="relative text-center">
            <button type="button" aria-label="Fermer" className="absolute right-0 top-0 rounded-full bg-muted p-2 text-muted-foreground transition hover:bg-muted/80" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
            <h2 id="contract-wizard-title" className="bebas text-3xl text-brand-magenta">Ton contrat de colocation</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Ton contrat comprend tous les éléments nécessaires pour établir un contrat légal entre les colocataires et le propriétaire.
            </p>
          </div>
        )}

        {contractError && (
          <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {repairUtf8Text(contractError)}
          </div>
        )}

        {contractStep === "offer" && (
          <div className="relative text-center">
            <button type="button" className="absolute right-0 top-0 rounded-full bg-muted p-2 text-muted-foreground hover:bg-muted/80" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-brand-green to-brand-cyan" />
            <h2 className="bebas text-2xl">TOUTES NOS FÉLICITATIONS !</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Tu as permis à plusieurs colocataires de se rencontrer à travers ton logement pour un mieux vivre ensemble.
            </p>
            <div className="mt-6 rounded-2xl border border-brand-cyan/30 bg-gradient-to-br from-brand-green-light to-brand-cyan-light p-5 pt-10">
              <div className="mx-auto -mt-16 mb-3 grid h-[94px] w-[94px] place-items-center rounded-full bg-white shadow-md">
                <LogoMark className="h-[72px] w-[72px]" />
              </div>
              <h3 className="bebas mx-auto max-w-md text-xl text-brand-magenta">{repairUtf8Text(activeOffer.titre)}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-foreground/80">{repairUtf8Text(activeOffer.texte)}</p>
              <div className="relative mt-3 max-h-40 overflow-hidden rounded-xl border border-border bg-white p-4 text-left text-xs leading-relaxed text-foreground">
                <div className="bebas mb-1.5 text-base">{repairUtf8Text(activeBody.titre)}</div>
                {renderTemplate(activeBody.intro, { names: coName, address: coAddr, date: moveInLabel })}
                <br />
                <br />
                {repairUtf8Text(activeBody.corps)}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white to-transparent" />
              </div>
              <div className="mt-3 rounded-xl border border-border/80 bg-white/70 p-3 text-left">
                <div className="bebas mb-2 text-sm text-brand-dark">DÉTAILS DE L'ANNONCE</div>
                <div className="flex flex-wrap gap-1.5">
                  {announcementDetails.map((detail) => <span key={detail} className="rounded-full bg-brand-cyan-light px-2.5 py-1 text-[11px] text-brand-cyan-dark">{detail}</span>)}
                </div>
              </div>
              <button type="button" onClick={() => onChooseOffer("contrat")} className="mt-3 w-full rounded-xl bg-brand-magenta px-4 py-3 text-sm font-bold text-white hover:brightness-95">
                Aide au contrat
              </button>
              <button type="button" onClick={() => onChooseOffer("edl")} className="mt-2.5 w-full rounded-xl bg-brand-magenta px-4 py-3 text-sm font-bold text-white hover:brightness-95">
                Aide à l'état des lieux
              </button>
              <button type="button" onClick={() => onChooseOffer("both")} className="mt-2.5 w-full rounded-xl bg-brand-magenta px-4 py-3 text-sm font-bold text-white hover:brightness-95">
                Les deux Monsieur !
              </button>
              <button type="button" onClick={onIgnoreOffer} className="mt-2.5 text-xs text-muted-foreground hover:text-foreground">
                Ignorer l'offre et continuer ›
              </button>
            </div>
          </div>
        )}

        {contractStep === "bail" && (
          <div className="mt-6 space-y-4">
            <h3 className="bebas text-2xl text-brand-dark">TYPE DE CONTRAT SOUHAITÉ</h3>
            <div className="grid gap-3">
              {activeBail.map((option, index) => {
                const selected = bailType === option.cle;
                return <React.Fragment key={option.cle}>
                  {index === 1 && <div className="text-center text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">OU</div>}
                  <button type="button" onClick={() => onSetBailType(option.cle)} className={`rounded-xl border-2 px-4 py-3 text-center transition ${selected ? "border-brand-cyan bg-brand-cyan text-white" : "border-brand-cyan/30 bg-[#bfe7ef] text-white hover:border-brand-cyan"}`}>
                    <span className="block text-sm font-bold">{repairUtf8Text(option.titre)}</span><span className="mt-1 block text-xs leading-relaxed opacity-90">{repairUtf8Text(option.description || option.texte || "Choisis la forme de contrat adaptée à ta colocation.")}</span>
                  </button>
                </React.Fragment>;
              })}
            </div>
            <div className="grid gap-2">
              {activeSolidarite.map((option) => <label key={option.cle} className="flex cursor-pointer items-start gap-3 rounded-lg p-1 text-left hover:bg-muted/30"><input type="radio" name="solidarite" checked={solidarite === option.cle} onChange={() => onSetSolidarite(option.cle)} className="mt-1 h-5 w-5 shrink-0 accent-brand-cyan" /><span><span className="block text-sm font-bold text-brand-dark">{repairUtf8Text(option.titre)}</span><span className="block text-xs leading-relaxed text-muted-foreground">{repairUtf8Text(option.description || option.texte || "Responsabilités entre colocataires.")}</span></span></label>)}
            </div>
            <button type="button" disabled={!bailType} onClick={() => onSetContractStep("contenu")} className="w-full rounded-xl bg-brand-magenta px-5 py-3.5 text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50">Prochaine étape</button>
            <div className="flex items-center justify-between text-xs"><button type="button" onClick={() => onSetContractStep("offer")} className="text-muted-foreground hover:text-foreground"><ChevronLeft className="mr-1 inline h-4 w-4" />Étape précédente</button><button type="button" onClick={onIgnoreOffer} className="text-muted-foreground hover:text-foreground">Ignorer l'offre</button></div>
          </div>
        )}

        {contractStep === "contenu" && (
          <div className="mt-6 space-y-3">
            <h3 className="bebas text-2xl text-brand-dark">{isEdlOnly ? "TA PRESTATION" : "CE QUE COMPREND TON CONTRAT"}</h3>
            {!isEdlOnly && <div className="space-y-2">{clauses.map(([title, description]) => <div key={title} className="flex items-start gap-3 rounded-xl border border-border px-4 py-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-dark" /><div><div className="text-sm font-semibold">{repairUtf8Text(title)}</div><div className="text-xs text-muted-foreground">{repairUtf8Text(description)}</div></div></div>)}</div>}
            {!isEdlOnly &&
              activeContratOffers.map((offer) => (
                <OfferLine key={`c-${offer.id}`} offer={offer} fmtAr={fmtAr} />
              ))}
            {isEdlOnly &&
              activeEdlOffers.map((offer) => (
                <OfferLine key={`e-${offer.id}`} offer={offer} fmtAr={fmtAr} edl />
              ))}
            {!isEdlOnly && (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border px-4 py-3 transition hover:border-brand-magenta/50">
                <input type="checkbox" checked={contractMode === "both"} onChange={onToggleEdl} className="mt-1 h-4 w-4 accent-brand-magenta" />
                <span>
                  <span className="block text-sm font-semibold">Document d'état des lieux (entrée/sortie) <strong className="ml-1 rounded bg-brand-magenta/10 px-1.5 py-0.5 text-xs text-brand-magenta">+ 10 000 Ar</strong></span>
                  <span className="block text-xs text-muted-foreground">Constat contradictoire à l'entrée et à la sortie du logement.</span>
                </span>
              </label>
            )}
            <div className={`flex items-center justify-between px-1 pt-3 text-sm ${isEdlOnly ? "border-t-2 border-brand-dark" : "rounded-2xl bg-muted/40"}`}>
              <span className="font-bold text-brand-dark">
                {isEdlOnly ? "État des lieux (forfait)" : contractMode === "both" ? "Total (contrat + état des lieux)" : "Création du contrat (forfait)"}
              </span>
              <span className={`bebas text-2xl ${isEdlOnly ? "text-brand-magenta" : "text-brand-cyan-dark"}`}>{fmtAr(previewTotal)} Ar</span>
            </div>
            <p className="flex gap-2 rounded-xl border border-brand-cyan/30 bg-brand-cyan-light/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" />
              {renderTemplate(isEdlOnly ? activeMailNote.edl : activeMailNote.contrat, { email: userEmail })}
            </p>
            {!isEdlOnly && <p className="flex gap-2 text-center text-xs text-muted-foreground"><Info className="mx-auto mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" />
              Le forfait sera <b>réparti entre les colocataires</b> — chacun règlera sa part. Toi (déposant), tu ne paies rien.
            </p>}
            <button type="button" onClick={() => onSetContractStep("paiement")} className="w-full rounded-xl bg-brand-magenta px-5 py-3.5 text-sm font-bold text-white hover:brightness-95">
              Continuer
            </button>
            <div className="flex items-center justify-between text-xs">
              <button type="button" onClick={() => onSetContractStep(isEdlOnly ? "offer" : "bail")} className="text-muted-foreground hover:text-foreground">
                ‹ Étape précédente
              </button>
              <button type="button" onClick={onIgnoreOffer} className="text-muted-foreground hover:text-foreground">
                Ignorer l'offre
              </button>
            </div>
          </div>
        )}

        {contractStep === "paiement" && (
          <div className="mt-6 space-y-4">
            <h3 className="bebas text-2xl text-brand-dark">Choix du mode de règlement</h3>
            <p className="text-center text-xs text-muted-foreground">Scanne le QR code ou utilise le numéro indiqué, puis renseigne la référence de ton transfert.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {mobileMoneyList.map((option) => (
                <button
                  key={option.nom}
                  type="button"
                  onClick={() => onSetMoyenPaiement(option.nom)}
                  aria-pressed={moyenPaiement === option.nom}
                  className={`rounded-xl border px-3 py-3 text-left transition ${moyenPaiement === option.nom ? "border-brand-cyan bg-brand-cyan-light shadow-sm" : "border-border bg-card hover:border-brand-cyan"}`}
                >
                  <div className="flex items-start gap-3">
                    <QrPreview onScan={() => onQrScan(option.nom)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold" style={{ color: option.couleur }}>{repairUtf8Text(option.nom)}</span>
                        {moyenPaiement === option.nom && <Check className="h-4 w-4 shrink-0 text-brand-green-dark" />}
                      </div>
                      <div className="mt-2 font-mono text-sm font-bold text-brand-dark">{option.numero}</div>
                      <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{repairUtf8Text(option.hint)}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div>
              <label className="mb-1 block text-center text-xs font-bold uppercase tracking-[0.08em] text-brand-dark">Référence de paiement Mobile money *</label>
              <div className="mb-2 text-center text-xs text-brand-magenta">Les frais de l'opérateur sont à la charge de l'acheteur.</div>
              <input className="input text-center font-mono" value={payRef} onChange={(event) => onPayRefChange(event.target.value)} placeholder="Ex : MP240607.1234.A56789" autoComplete="off" />
            </div>
            <div className="flex items-center justify-between border-t-2 border-brand-dark px-1 pt-3 text-sm">
              <span className="font-bold text-brand-dark">{myShare != null ? "Ta part à régler" : priceLabel}</span>
              <span className="bebas text-2xl text-brand-magenta">{fmtAr(myShare ?? (orderTotal || previewTotal))} Ar</span>
            </div>
            <p className="flex gap-2 rounded-xl border border-brand-cyan/30 bg-brand-cyan-light/50 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground"><Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" />Après validation, le paiement sera vérifié par notre équipe et la commande sera traitée.</p>
            <button type="button" onClick={onConfirmPayment} disabled={contractSubmitting} className="w-full rounded-xl bg-brand-magenta px-5 py-3.5 text-sm font-bold text-white hover:brightness-95 disabled:opacity-60">
              {contractSubmitting ? "Enregistrement..." : "Valider ma commande"}
            </button>
            <div className="flex items-center justify-between text-xs">
              <button type="button" onClick={() => onSetContractStep("contenu")} className="text-muted-foreground hover:text-foreground">
                ‹ Étape précédente
              </button>
              <button type="button" onClick={onIgnoreOffer} className="text-muted-foreground hover:text-foreground">
                Ignorer l'offre
              </button>
            </div>
          </div>
        )}

        {contractStep === "done" && (
          <div className="mt-6 space-y-4 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-green/15 text-brand-green">
              <Sparkles className="h-7 w-7" />
            </div>
            <div className="bebas text-xl">{paymentInfo ? "Paiement enregistré" : "Récapitulatif du contrat"}</div>
            <p className="text-sm text-muted-foreground">
              {paymentInfo ? (
                <>
                  Ta part <b>{repairUtf8Text(paymentInfo.reference)}</b> de <b>{fmtAr(paymentInfo.montant || 0)} Ar</b> a bien été enregistrée.
                  {paymentInfo.total ? <> {paymentInfo.paidCount}/{paymentInfo.total} colocataire(s) ont réglé.</> : null}
                  {paymentInfo.allPaid ? <> <b>Toutes les parts sont réglées : le contrat est validé.</b></> : <> Le paiement sera <b>vérifié par notre équipe</b>.</>}
                </>
              ) : (
                <>
                  {isEdlOnly ? "Document d'état des lieux" : "Contrat de colocation"}
                  {!isEdlOnly && <> — {bailType === "collectif" ? "bail collectif" : "bail individuel"} {solidarite === "avec" ? "avec" : "sans"} clause de solidarité</>}. Forfait <b>{fmtAr(previewTotal)} Ar</b>, réparti entre les colocataires.
                  <br />
                  <br />
                  En cliquant sur <b>Terminer</b>, le contrat sera <b>enregistré</b>. Chaque colocataire règlera ensuite <b>sa part</b> ; toi, tu ne paies rien.
                </>
              )}
            </p>
            {createdContracts.map((contract) => (
              <button key={contract.id_contrat} type="button" onClick={() => onOpenContractDocument(contract.id_contrat)} className="w-full rounded-xl border border-brand-cyan px-5 py-3 text-sm font-bold text-brand-cyan-dark hover:bg-brand-cyan/10">
                Voir / télécharger le {contract.type === "edl" ? "document d'état des lieux" : "contrat"}
              </button>
            ))}
            {contractError && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">{contractError}</div>}
            <button
              type="button"
              disabled={contractSubmitting}
              onClick={paymentInfo ? onShowCelebrateAfterPayment : onFinalizeContract}
              className="w-full rounded-xl bg-brand-green px-5 py-3 text-sm font-semibold text-white hover:bg-brand-green-dark disabled:opacity-60"
            >
              {contractSubmitting ? "Enregistrement..." : "Terminer"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function QrPreview({ onScan }: { onScan: () => void }) {
  const cells = Array.from({ length: 81 }, (_, index) => {
    const x = index % 9;
    const y = Math.floor(index / 9);
    const finder = (originX: number, originY: number) => {
      const dx = x - originX;
      const dy = y - originY;
      return dx >= 0 && dx < 3 && dy >= 0 && dy < 3 && (dx === 0 || dx === 2 || dy === 0 || dy === 2 || (dx === 1 && dy === 1));
    };
    return finder(0, 0) || finder(6, 0) || finder(0, 6) || ((x * 7 + y * 11 + x * y) % 5 === 0);
  });

  return <span role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); onScan(); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); onScan(); } }} className="shrink-0 cursor-pointer rounded-lg border border-border bg-white p-1.5" aria-label="Scanner le QR code"><span className="grid h-16 w-16 grid-cols-9 gap-px" aria-hidden="true">{cells.map((filled, index) => <span key={index} className={filled ? "rounded-[1px] bg-[#2c2c2c]" : "bg-white"} />)}</span><span className="mt-1 block text-center text-[8px] uppercase tracking-[0.08em] text-muted-foreground">Scanner</span></span>;
}

function OfferLine({ offer, fmtAr, edl = false }: { offer: any; fmtAr: (value: number) => string; edl?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-3 px-1 py-3 ${edl ? "border-b border-border" : "rounded-xl border border-border bg-card"}`}>
      <span className="flex items-start gap-3">
        <input type="checkbox" checked disabled className="mt-1" />
        <span>
          <span className="block text-sm font-medium">
            {repairUtf8Text(offer.nom)} {edl && <span className="text-xs font-normal text-muted-foreground">(état des lieux)</span>}
          </span>
          {offer.description && <span className="block text-xs text-muted-foreground">{repairUtf8Text(offer.description)}</span>}
        </span>
      </span>
      <span className="bebas whitespace-nowrap text-brand-cyan-dark">{fmtAr(offer.prix)} Ar</span>
    </div>
  );
}
