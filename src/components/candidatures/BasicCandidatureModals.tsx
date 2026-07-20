import { Sparkles, X } from "lucide-react";

type Props = {
  candidatureMessage: string;
  celebrateOpen: boolean;
  chatMessages: Array<{ who: string; txt: string }>;
  createdContractIds: number[];
  createdContracts: any[];
  logementResume: string;
  logementTitre: string;
  monthlyRent: number;
  moveInLabel: string;
  newMessage: string;
  ownerRetained: Array<{ name: string }>;
  selectedCandidate: any;
  showPostulerModal: boolean;
  chatModalOpen: boolean;
  fmtAr: (value: number) => string;
  onChangeCandidatureMessage: (value: string) => void;
  onChangeNewMessage: (value: string) => void;
  onCloseCelebrate: () => void;
  onCloseChat: () => void;
  onClosePostuler: () => void;
  onOpenContractDocument: (contractId: number) => void;
  onPostuler: () => void;
  onSendMessage: () => void;
};

export function BasicCandidatureModals({
  candidatureMessage,
  celebrateOpen,
  chatMessages,
  chatModalOpen,
  createdContractIds,
  createdContracts,
  fmtAr,
  logementResume,
  logementTitre,
  monthlyRent,
  moveInLabel,
  newMessage,
  ownerRetained,
  selectedCandidate,
  showPostulerModal,
  onChangeCandidatureMessage,
  onChangeNewMessage,
  onCloseCelebrate,
  onCloseChat,
  onClosePostuler,
  onOpenContractDocument,
  onPostuler,
  onSendMessage,
}: Props) {
  return (
    <>
      {showPostulerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Postuler à la colocation</h3>
              <button onClick={onClosePostuler} className="rounded-full p-2 transition-colors hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Envoyez un message personnalisé pour augmenter vos chances d'être retenu.
            </p>
            <textarea
              value={candidatureMessage}
              onChange={(event) => onChangeCandidatureMessage(event.target.value)}
              placeholder="Présentez-vous brièvement et expliquez pourquoi vous êtes intéressé..."
              className="min-h-[120px] w-full resize-none rounded-2xl border border-border p-3 text-sm outline-none transition-colors focus:border-brand-cyan"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={onClosePostuler}
                className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={onPostuler}
                className="flex-1 rounded-xl bg-brand-cyan px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-cyan-dark"
              >
                Envoyer ma candidature
              </button>
            </div>
          </div>
        </div>
      )}

      {celebrateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-cyan-light px-3 py-1.5 text-sm font-semibold text-brand-cyan-dark">
                  <Sparkles className="h-4 w-4" /> Célébration
                </div>
                <h2 className="bebas mt-4 text-3xl">Toutes nos félicitations !</h2>
              </div>
              <button
                type="button"
                className="rounded-full bg-muted p-3 text-muted-foreground hover:bg-muted/80"
                onClick={onCloseCelebrate}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Tu as permis à plusieurs colocataires de se rencontrer à travers ton logement pour un mieux vivre ensemble.
            </p>
            {createdContractIds.length > 0 && (
              <div className="mt-4 space-y-4 rounded-2xl border border-brand-cyan/30 bg-white p-4 text-sm text-brand-cyan-dark">
                <div className="font-semibold">
                  Contrat{createdContractIds.length > 1 ? "s" : ""} créé{createdContractIds.length > 1 ? "s" : ""}
                </div>
                {createdContracts.map((contract) => (
                  <div key={contract.id_contrat} className="rounded-2xl border border-border p-4">
                    <div className="text-sm font-semibold">
                      #{contract.id_contrat} · {contract.type === "contrat" ? "Contrat de colocation" : "État des lieux"}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">Parties :</div>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {contract.parties.map((partie: any, index: number) => (
                        <li key={`${contract.id_contrat}-${index}`}>
                          <span className="font-medium text-brand-cyan-dark">{partie.nom_complet || "Participant"}</span> — {partie.role || "Participant"}
                          {partie.email ? ` · ${partie.email}` : ""}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => onOpenContractDocument(contract.id_contrat)}
                      className="mt-3 w-full rounded-xl border border-brand-cyan px-4 py-2 text-xs font-bold text-brand-cyan-dark hover:bg-brand-cyan/10"
                    >
                      Voir / télécharger le document
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 rounded-2xl border border-border bg-brand-cyan-light/30 p-6">
              <div className="text-sm text-muted-foreground">Logement</div>
              <div className="bebas mt-2 text-2xl text-brand-cyan-dark">
                {logementTitre} · {logementResume} · {fmtAr(monthlyRent)} Ar / mois
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Colocataires — {ownerRetained.map((candidate) => candidate.name).join(" · ") || "—"}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Début d'emménagement — {moveInLabel}
              </div>
            </div>
            <button
              type="button"
              className="mt-6 w-full rounded-xl bg-brand-green px-5 py-3 text-sm font-semibold text-white hover:bg-brand-green-dark"
              onClick={onCloseCelebrate}
            >
              Terminer
            </button>
          </div>
        </div>
      )}

      {chatModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-border p-4">
              <button type="button" onClick={onCloseChat} className="rounded-full p-2 transition-colors hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-cyan font-semibold text-white">
                  {selectedCandidate.initials}
                </div>
                <div>
                  <div className="font-semibold">{selectedCandidate.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedCandidate.subtitle}</div>
                </div>
              </div>
              <div className="ml-auto">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-muted-foreground">En ligne</span>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50/50 p-4">
              {chatMessages.map((message, index) => (
                <div key={`${message.who}-${index}`} className={`flex ${message.who === "Toi" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      message.who === "Toi"
                        ? "rounded-tr-none bg-brand-cyan text-white"
                        : "rounded-tl-none border border-border bg-white text-foreground"
                    }`}
                  >
                    <div className="mb-1 text-xs font-semibold opacity-70">{message.who === "Toi" ? "Vous" : message.who}</div>
                    <p className="whitespace-pre-line text-sm">{message.txt}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-b-2xl border-t border-border bg-white p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(event) => onChangeNewMessage(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && onSendMessage()}
                  placeholder="Écris ton message..."
                  className="flex-1 rounded-2xl border border-border bg-gray-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-cyan focus:bg-white"
                />
                <button
                  type="button"
                  onClick={onSendMessage}
                  className="rounded-2xl bg-brand-cyan px-4 py-2.5 text-white transition-colors hover:bg-brand-cyan-dark"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
