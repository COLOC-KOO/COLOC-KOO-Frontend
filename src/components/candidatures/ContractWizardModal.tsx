import React from "react";
import { Sparkles, X } from "lucide-react";

type Props = {
  activeBail: any[];
  activeBody: { titre: string; intro: string; corps: string };
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
  onSetContractStep: (step: "offer" | "bail" | "contenu" | "paiement" | "done") => void;
  onSetMoyenPaiement: (value: string) => void;
  onShowCelebrateAfterPayment: () => void;
};

export function ContractWizardModal({
  activeBail,
  activeBody,
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
  onSetContractStep,
  onSetMoyenPaiement,
  onShowCelebrateAfterPayment,
}: Props) {
  const orderTotal = createdContracts.reduce((sum, contract) => sum + Number(contract.montant_total || 0), 0);
  const previewTotal = previewAmount(contractMode);
  const isEdlOnly = contractMode === "edl";
  const priceLabel = isEdlOnly ? "Document d'état des lieux (forfait)" : "Création du contrat (forfait)";
  const coName = ownerRetained.map((candidate) => candidate.name).join(", ") || "—";
  const coAddr = [annonceData?.quartier, annonceData?.ville].filter(Boolean).join(", ") || "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        {contractStep !== "offer" && (
          <div className="relative text-center">
            <button type="button" className="absolute right-0 top-0 rounded-full bg-muted p-2 text-muted-foreground hover:bg-muted/80" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
            <h2 className="bebas text-3xl text-brand-cyan-dark">Ton contrat de colocation</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Ton contrat comprend tous les éléments nécessaires pour établir un contrat légal entre les colocataires et le propriétaire.
            </p>
          </div>
        )}

        {contractError && (
          <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {contractError}
          </div>
        )}

        {contractStep === "offer" && (
          <div className="relative text-center">
            <button type="button" className="absolute right-0 top-0 rounded-full bg-muted p-2 text-muted-foreground hover:bg-muted/80" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-brand-green to-brand-cyan" />
            <h2 className="bebas text-3xl">Toutes nos félicitations !</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Tu as permis à plusieurs colocataires de se rencontrer à travers ton logement pour un mieux vivre ensemble.
            </p>
            <div className="mt-6 rounded-2xl border border-brand-cyan/30 bg-gradient-to-br from-brand-green-light to-brand-cyan-light p-5 pt-10">
              <div className="mx-auto -mt-16 mb-3 grid h-[94px] w-[94px] place-items-center rounded-full bg-white shadow-md">
                <span className="bebas text-lg leading-none text-brand-cyan-dark">COLOC'KOO</span>
              </div>
              <h3 className="bebas mx-auto max-w-md text-2xl text-brand-cyan-dark">{activeOffer.titre}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-foreground/80">{activeOffer.texte}</p>
              <div className="relative mt-3 max-h-40 overflow-hidden rounded-xl border border-border bg-white p-4 text-left text-xs leading-relaxed text-foreground">
                <div className="bebas mb-1.5 text-base">{activeBody.titre}</div>
                {renderTemplate(activeBody.intro, { names: coName, address: coAddr, date: moveInLabel })}
                <br />
                <br />
                {activeBody.corps}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white to-transparent" />
              </div>
              <button type="button" onClick={() => onChooseOffer("contrat")} className="mt-3 w-full rounded-xl bg-brand-cyan px-4 py-3 text-sm font-bold text-white hover:bg-brand-cyan-dark">
                Aide au contrat
              </button>
              <button type="button" onClick={() => onChooseOffer("edl")} className="mt-2.5 w-full rounded-xl bg-brand-cyan px-4 py-3 text-sm font-bold text-white hover:bg-brand-cyan-dark">
                Aide à l'état des lieux
              </button>
              <button type="button" onClick={() => onChooseOffer("both")} className="mt-2.5 w-full rounded-xl bg-brand-cyan px-4 py-3 text-sm font-bold text-white hover:bg-brand-cyan-dark">
                Les deux Monsieur !
              </button>
              <button type="button" onClick={onIgnoreOffer} className="mt-2.5 text-xs text-muted-foreground hover:text-foreground">
                Ignorer l'offre et continuer ›
              </button>
            </div>
          </div>
        )}

        {contractStep === "contenu" && (
          <div className="mt-6 space-y-3">
            <div className="text-sm font-semibold">{isEdlOnly ? "Ta prestation — état des lieux" : "Ce que comprend ta commande"}</div>
            {!isEdlOnly && (
              <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm">
                <div className="font-semibold text-brand-cyan-dark">
                  {activeBail.find((b) => b.cle === bailType)?.titre || "Bail"} · {activeSolidarite.find((s) => s.cle === solidarite)?.titre || ""}
                </div>
                <div className="text-xs text-muted-foreground">Défini sur l'annonce.</div>
              </div>
            )}
            {!isEdlOnly &&
              activeContratOffers.map((offer) => (
                <OfferLine key={`c-${offer.id}`} offer={offer} fmtAr={fmtAr} />
              ))}
            {(isEdlOnly || contractMode === "both") &&
              activeEdlOffers.map((offer) => (
                <OfferLine key={`e-${offer.id}`} offer={offer} fmtAr={fmtAr} edl />
              ))}
            <div className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3 text-sm">
              <span className="text-muted-foreground">
                {isEdlOnly ? "État des lieux (forfait)" : contractMode === "both" ? "Total (contrat + état des lieux)" : "Création du contrat (forfait)"}
              </span>
              <span className="bebas text-xl text-brand-cyan-dark">{fmtAr(previewTotal)} Ar</span>
            </div>
            <p className="rounded-2xl border border-border bg-brand-cyan-light/40 px-4 py-3 text-xs text-muted-foreground">
              {renderTemplate(isEdlOnly ? activeMailNote.edl : activeMailNote.contrat, { email: userEmail })}
            </p>
            <p className="text-center text-xs text-muted-foreground">
              Le forfait sera <b>réparti entre les colocataires</b> — chacun règlera sa part. Toi (déposant), tu ne paies rien.
            </p>
            <button type="button" onClick={() => onSetContractStep("done")} className="w-full rounded-xl bg-brand-cyan px-5 py-3.5 text-sm font-bold text-white hover:bg-brand-cyan-dark">
              Continuer
            </button>
            <div className="flex items-center justify-between text-xs">
              <button type="button" onClick={() => onSetContractStep("offer")} className="text-muted-foreground hover:text-foreground">
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
            <div className="text-sm font-semibold">Choix du mode de règlement</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {mobileMoneyList.map((option) => (
                <button
                  key={option.nom}
                  type="button"
                  onClick={() => onSetMoyenPaiement(option.nom)}
                  className={`rounded-2xl border px-4 py-4 text-left ${moyenPaiement === option.nom ? "border-brand-cyan bg-brand-cyan-light" : "border-border bg-card hover:border-brand-cyan"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold" style={{ color: option.couleur }}>{option.nom}</span>
                    <span className="grid h-16 w-16 place-items-center rounded-lg border border-border bg-white text-[9px] text-muted-foreground">QR</span>
                  </div>
                  <div className="mt-2 font-mono text-sm">{option.numero}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{option.hint}</div>
                </button>
              ))}
            </div>
            <div>
              <label className="mb-1 block text-center text-sm font-medium">Référence de paiement Mobile money *</label>
              <div className="mb-2 text-center text-xs text-muted-foreground">Les frais de l'opérateur sont à la charge de l'acheteur.</div>
              <input className="input" value={payRef} onChange={(event) => onPayRefChange(event.target.value)} placeholder="Ex : MP240607.1234.A56789" />
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3 text-sm">
              <span className="text-muted-foreground">{myShare != null ? "Ta part à régler" : priceLabel}</span>
              <span className="bebas text-xl text-brand-cyan-dark">{fmtAr(myShare ?? (orderTotal || previewTotal))} Ar</span>
            </div>
            <button type="button" onClick={onConfirmPayment} disabled={contractSubmitting} className="w-full rounded-xl bg-brand-cyan px-5 py-3.5 text-sm font-bold text-white hover:bg-brand-cyan-dark disabled:opacity-60">
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
            <div className="bebas text-2xl">{paymentInfo ? "Paiement enregistré" : "Récapitulatif du contrat"}</div>
            <p className="text-sm text-muted-foreground">
              {paymentInfo ? (
                <>
                  Ta part <b>{paymentInfo.reference}</b> de <b>{fmtAr(paymentInfo.montant || 0)} Ar</b> a bien été enregistrée.
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

function OfferLine({ offer, fmtAr, edl = false }: { offer: any; fmtAr: (value: number) => string; edl?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 ${edl ? "border-brand-olive/40 bg-brand-olive/10" : "border-border bg-card"}`}>
      <span className="flex items-start gap-3">
        <input type="checkbox" checked disabled className="mt-1" />
        <span>
          <span className="block text-sm font-medium">
            {offer.nom} {edl && <span className="text-xs font-normal text-muted-foreground">(état des lieux)</span>}
          </span>
          {offer.description && <span className="block text-xs text-muted-foreground">{offer.description}</span>}
        </span>
      </span>
      <span className="bebas whitespace-nowrap text-brand-cyan-dark">{fmtAr(offer.prix)} Ar</span>
    </div>
  );
}
