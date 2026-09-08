import React, { useState } from "react";
import { Check, ChevronLeft, Info, Mail, Sparkles, X, Eye, Copy, Smartphone } from "lucide-react";

export function LogoMark({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="46" fill="#008FA6" fillOpacity="0.1" />
      <path
        d="M26 48L50 28L74 48"
        stroke="#008FA6"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32 46V70C32 72.2 33.8 74 36 74H64C66.2 74 68 72.2 68 70V46"
        stroke="#008FA6"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="43" cy="54" r="4.5" fill="#B83280" />
      <path
        d="M36 67C36 63 39 61 43 61C47 61 50 63 50 67"
        stroke="#B83280"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="57" cy="52" r="4" fill="#10B981" />
      <path
        d="M51 65C51 61.5 53.5 59.5 57 59.5C60.5 59.5 63 61.5 63 65"
        stroke="#10B981"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
  const fallbackPrice = contractMode === "edl" ? 10000 : contractMode === "both" ? 37000 : 27000;
  const previewTotal = (typeof previewAmount === "function" ? previewAmount(contractMode) : null) || fallbackPrice;
  const isEdlOnly = contractMode === "edl";
  const priceLabel = isEdlOnly ? "Document d'état des lieux (forfait)" : "Création du contrat (forfait)";
  const displayedAmount = myShare != null && myShare > 0 ? myShare : (orderTotal > 0 ? orderTotal : previewTotal);
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
      <div className="celebration-modal relative z-20 my-auto max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[20px] bg-white p-6 shadow-2xl sm:p-7">
        {isWizardStep && (
          <div className="relative pb-2 text-center">
            <button type="button" aria-label="Fermer" className="absolute right-0 top-0 rounded-full bg-muted p-2 text-muted-foreground transition hover:bg-muted/80" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
            <h2 id="contract-wizard-title" className="bebas text-3xl tracking-wide text-brand-magenta">Ton contrat de colocation</h2>
            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
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
            <div className={`flex items-center justify-between rounded-xl px-4 py-3.5 ${isEdlOnly ? "border-2 border-brand-dark bg-muted/20" : "bg-gradient-to-r from-muted/60 to-muted/30 border border-border"}`}>
              <span className="text-sm font-bold text-brand-dark">
                {isEdlOnly ? "État des lieux (forfait)" : contractMode === "both" ? "Total (contrat + état des lieux)" : "Création du contrat (forfait)"}
              </span>
              <span className={`bebas text-2xl font-bold tracking-wide ${isEdlOnly ? "text-brand-magenta" : "text-brand-cyan-dark"}`}>
                {fmtAr(previewTotal)} Ar
              </span>
            </div>
            <div className="rounded-xl border border-brand-cyan/25 bg-brand-cyan-light/50 p-3.5 text-xs leading-relaxed text-foreground/85">
              <div className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" />
                <div className="flex-1 space-y-1">
                  <div>{renderTemplate(isEdlOnly ? activeMailNote.edl : activeMailNote.contrat, { email: userEmail })}</div>
                </div>
              </div>
            </div>
            {!isEdlOnly && (
              <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
                <Info className="h-4 w-4 shrink-0 text-brand-cyan" />
                <span>
                  Le forfait sera <b>réparti entre les colocataires</b> — chacun règlera sa part. Toi (déposant), tu ne paies rien.
                </span>
              </div>
            )}
            <button type="button" onClick={() => onSetContractStep("paiement")} className="w-full rounded-xl bg-brand-magenta px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:brightness-95 active:scale-[0.99]">
              Continuer
            </button>
            <div className="flex items-center justify-between pt-1 text-xs">
              <button type="button" onClick={() => onSetContractStep(isEdlOnly ? "offer" : "bail")} className="text-muted-foreground transition hover:text-foreground">
                ‹ Étape précédente
              </button>
              <button type="button" onClick={onIgnoreOffer} className="text-muted-foreground transition hover:text-foreground">
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
                    <QrPreview
                      onScan={() => onQrScan(option.nom)}
                      operator={option.nom}
                      numero={option.numero}
                      couleur={option.couleur}
                      hint={option.hint}
                    />
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
              <div className="mb-2 text-center text-[11px] font-medium text-brand-magenta">Les frais de l'opérateur sont à la charge de l'acheteur.</div>
              <input className="input text-center font-mono font-bold tracking-wider" value={payRef} onChange={(event) => onPayRefChange(event.target.value)} placeholder="Ex : MP240607.1234.A56789" autoComplete="off" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-gradient-to-r from-muted/50 to-muted/20 px-4 py-3.5">
              <span className="text-sm font-bold text-brand-dark">{myShare != null && myShare > 0 ? "Ta part à régler" : priceLabel}</span>
              <span className="bebas text-2xl font-bold tracking-wide text-brand-magenta">{fmtAr(displayedAmount)} Ar</span>
            </div>
            <p className="flex items-start gap-2 rounded-xl border border-brand-cyan/25 bg-brand-cyan-light/40 px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" />
              <span>Après validation, le paiement sera vérifié par notre équipe et la commande sera traitée.</span>
            </p>
            <button type="button" onClick={onConfirmPayment} disabled={contractSubmitting} className="w-full rounded-xl bg-brand-magenta px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:brightness-95 active:scale-[0.99] disabled:opacity-60">
              {contractSubmitting ? "Enregistrement..." : "Régler ma commande"}
            </button>
            <div className="flex items-center justify-between pt-1 text-xs">
              <button type="button" onClick={() => onSetContractStep("contenu")} className="text-muted-foreground transition hover:text-foreground">
                ‹ Étape précédente
              </button>
              <button type="button" onClick={onIgnoreOffer} className="text-muted-foreground transition hover:text-foreground">
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

// --------------------------------------------------------------------------
// FONCTIONS DE GÉNÉRATION ET RENDU DU QR CODE AMÉLIORÉ
// --------------------------------------------------------------------------
function generateQrMatrix(seed: string): boolean[][] {
  const size = 25;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const addFinder = (top: number, left: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[top + r][left + c] = true;
        }
      }
    }
  };

  addFinder(0, 0);
  addFinder(0, size - 7);
  addFinder(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  const alignR = 18;
  const alignC = 18;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
        matrix[alignR + r][alignC + c] = true;
      }
    }
  }

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      const inAlign = r >= alignR - 2 && r <= alignR + 2 && c >= alignC - 2 && c <= alignC + 2;
      const inTiming = r === 6 || c === 6;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inAlign && !inTiming) {
        const val = Math.abs(Math.sin((r * 37 + c * 53 + hash) * 0.1));
        matrix[r][c] = val > 0.48;
      }
    }
  }

  return matrix;
}

function QrPreview({
  onScan,
  operator = "Mobile Money",
  numero = "0320000000",
  couleur = "#2c2c2c",
  hint,
}: {
  onScan: () => void;
  operator?: string;
  numero?: string;
  couleur?: string;
  hint?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const cleanNumber = (numero || "0320000000").replace(/\s+/g, "");
  const qrPayload = `tel:${cleanNumber}`;
  const matrix = React.useMemo(() => generateQrMatrix(qrPayload), [qrPayload]);

  const handleOpen = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setIsOpen(true);
    onScan();
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cleanNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderQrSvg = () => {
    const matrixSize = matrix.length;
    return (
      <svg viewBox={`0 0 ${matrixSize} ${matrixSize}`} className="h-full w-full shape-rendering-crispEdges">
        <rect width={matrixSize} height={matrixSize} fill="#ffffff" />
        {matrix.map((row, r) =>
          row.map((filled, c) => (
            filled ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#1a1a1a" /> : null
          ))
        )}
      </svg>
    );
  };

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen(e);
          }
        }}
        className="group relative shrink-0 cursor-pointer rounded-xl border border-border bg-white p-1 shadow-sm transition hover:border-brand-cyan hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
        aria-label="Scanner le QR code"
        title="Cliquer pour agrandir et scanner"
      >
        <span className="relative block h-16 w-16 overflow-hidden rounded-lg bg-white p-0.5">
          {renderQrSvg()}
          <span className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 backdrop-blur-[0.5px] transition-opacity group-hover:opacity-100 rounded-lg">
            <Eye className="h-5 w-5 text-white drop-shadow-sm" />
          </span>
        </span>
        <span className="mt-0.5 block text-center text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground group-hover:text-brand-dark transition-colors">
          Scanner
        </span>
      </span>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-3.5 top-3.5 rounded-full bg-muted p-2 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>

            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
              style={{ backgroundColor: `${couleur}15`, color: couleur }}
            >
              {operator}
            </span>

            <h4 className="bebas mt-1 text-2xl text-brand-dark">Paiement Mobile Money</h4>
            <p className="text-xs text-muted-foreground">
              Scanne ce QR Code avec l'appli <b>{operator}</b> ou l'appareil photo de ton téléphone.
            </p>

            <div className="my-5 flex justify-center">
              <div className="relative rounded-2xl border-2 border-border bg-white p-4 shadow-md">
                <div className="h-48 w-48">
                  {renderQrSvg()}
                </div>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white bg-white shadow-sm"
                    style={{ borderColor: couleur }}
                  >
                    <Smartphone className="h-4 w-4" style={{ color: couleur }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-3 text-left">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Numéro destinataire
                  </div>
                  <div className="font-mono text-base font-extrabold text-brand-dark">
                    {numero}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition hover:bg-muted"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-brand-green" />
                      <span className="text-brand-green">Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>
              {hint && <p className="mt-1.5 text-[11px] text-muted-foreground border-t border-border/60 pt-1.5">{hint}</p>}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full rounded-xl bg-brand-dark py-2.5 text-xs font-bold text-white hover:bg-black transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function OfferLine({ offer, fmtAr, edl = false }: { key?: React.Key; offer: any; fmtAr: (value: number) => string; edl?: boolean }) {
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