import React, { useState, useMemo, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { api, ApiPaiement, ContractDocumentRequest } from "../../lib/api";
import AdminContractDocumentRequests from "./AdminContractDocumentRequests";
import { useDialog } from "../../components/ui/Dialog";
import {
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  RefreshCw,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Info,
  FileSignature,
  Home,
  User,
  Mail,
  Phone,
  MapPin,
  Plus,
  Save,
  X,
  Printer,
  Send,
  Calendar as CalendarIcon,
  UserCheck,
  UserX,
  FileCheck,
  FileX,
  ClipboardCheck,
  ClipboardX,
  Tag,
  Package,
  Trash2,
  CreditCard,
  Receipt,
} from "lucide-react";

// ===== TYPES =====
interface DocumentDemande {
  id: string;
  type: "contrat" | "edl";
  sousType: string;
  bien: string;
  dateCreation: string;
  dateDemande: string;
  statut:
    | "a-emettre"
    | "a-planifier"
    | "brouillon"
    | "emis"
    | "envoye"
    | "signe"
    | "en-attente"
    | "annule";
  montant: number;
  parties: Partie[];
  partiesCount?: number;
  note?: string;
  dateEmission?: string;
  dateSignature?: string;
}

interface Partie {
  nom: string;
  role: string;
  cin?: string;
  telephone?: string;
  email?: string;
  comment?: string;
}

interface OffreCommerciale {
  id: string;
  nom: string;
  prix: number;
  type: "contrat" | "edl";
  description?: string;
}

interface Versement {
  id: string;
  paymentId: number;
  emetteur: string;
  associe: string;
  ref: string;
  canal: string;
  date: string;
  du: number;
  recu: number;
  statut: "a-verifier" | "conforme" | "non-conforme" | "en-attente" | "valide" | "echoue";
}

interface ApiBackofficeContratRow {
  id_contrat: number;
  reference?: string | null;
  type: "contrat" | "edl";
  statut:
    | "a-emettre"
    | "a-planifier"
    | "brouillon"
    | "emis"
    | "envoye"
    | "signe"
    | "annule";
  montant_total: number | null;
  date_creation: string;
  date_emission?: string | null;
  date_signature?: string | null;
  titre?: string | null;
  quartier?: string | null;
  nom_ville?: string | null;
  parties_count?: number;
}

interface ApiBackofficeContratDetails extends ApiBackofficeContratRow {
  parties: Array<{
    id: number;
    id_utilisateur?: number | null;
    nom_complet?: string | null;
    role?: string | null;
    cin?: string | null;
    telephone?: string | null;
    email?: string | null;
    commentaire?: string | null;
  }>;
}

// ===== FONCTIONS DE MAPPING =====
function mapApiContratRow(row: ApiBackofficeContratRow): DocumentDemande {
  const bien = [row.titre, row.quartier, row.nom_ville]
    .filter(Boolean)
    .join(" — ");
  return {
    id: String(row.id_contrat),
    type: row.type,
    sousType:
      row.type === "contrat" ? "Contrat de colocation" : "État des lieux",
    bien: bien || `Contrat #${row.id_contrat}`,
    dateCreation: row.date_creation
      ? new Date(row.date_creation).toLocaleDateString("fr-FR")
      : "",
    dateDemande: row.date_creation
      ? new Date(row.date_creation).toLocaleDateString("fr-FR")
      : "",
    statut: row.statut,
    montant: Number(row.montant_total || 0),
    parties: [],
    partiesCount: row.parties_count || 0,
    note: "",
  };
}

function mapApiContratDetails(
  row: ApiBackofficeContratDetails,
): DocumentDemande {
  const base = mapApiContratRow(row);
  return {
    ...base,
    parties: row.parties.map((p) => ({
      nom: p.nom_complet || "Inconnu",
      role: p.role || "Participant",
      cin: p.cin || "",
      telephone: p.telephone || "",
      email: p.email || "",
      comment: p.commentaire || undefined,
    })),
    note: "",
    dateEmission: row.date_emission
      ? new Date(row.date_emission).toLocaleDateString("fr-FR")
      : undefined,
    dateSignature: row.date_signature
      ? new Date(row.date_signature).toLocaleDateString("fr-FR")
      : undefined,
  };
}

function mapVersement(row: ApiPaiement): Versement {
  return {
    id: row.reference || `VST-${row.id_paiement}`,
    paymentId: row.id_paiement,
    emetteur: [row.prenom, row.nom].filter(Boolean).join(" ") || "Client",
    associe: row.annonce_titre || (row.id_contrat ? `Contrat #${row.id_contrat}` : `Annonce #${row.id_annonce || "—"}`),
    ref: String(row.id_contrat || row.id_annonce || ''),
    canal: row.moyen_paiement || "MVOLA",
    date: row.date_paiement || row.date_creation,
    du: row.montant_du || 0,
    recu: row.montant_recu || 0,
    statut: row.statut === "en_attente" ? "en-attente" : row.statut || "a-verifier",
  };
}

// ===== COMPOSANTS =====

// Badge de statut
const StatusBadge = ({ statut }: { statut: DocumentDemande["statut"] }) => {
  const config: Record<
    DocumentDemande["statut"],
    { label: string; className: string; icon: typeof FileX }
  > = {
    "a-emettre": {
      label: "À émettre",
      className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      icon: FileX,
    },
    "a-planifier": {
      label: "À planifier",
      className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      icon: CalendarIcon,
    },
    emis: {
      label: "Émis",
      className: "bg-purple-500/15 text-purple-400 border-purple-500/30",
      icon: FileCheck,
    },
    signe: {
      label: "Signé",
      className: "bg-green-500/15 text-green-400 border-green-500/30",
      icon: UserCheck,
    },
    "en-attente": {
      label: "En attente",
      className: "bg-red-500/15 text-red-400 border-red-500/30",
      icon: Clock,
    },
    brouillon: {
      label: "Brouillon",
      className: "bg-white/10 text-white/80 border-white/20",
      icon: FileText,
    },
    envoye: {
      label: "Envoyé",
      className: "bg-sky-500/15 text-sky-300 border-sky-500/30",
      icon: Mail,
    },
    annule: {
      label: "Annulé",
      className: "bg-red-500/15 text-red-300 border-red-500/30",
      icon: XCircle,
    },
  };
  const { label, className, icon: Icon } = config[statut];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${className}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

// Badge de statut pour les versements
const VersementStatusBadge = ({ statut }: { statut: Versement["statut"] }) => {
  const config: Record<Versement["statut"], { label: string; className: string }> = {
    "a-verifier": { label: "À vérifier", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    "conforme": { label: "Conforme", className: "bg-green-500/15 text-green-400 border-green-500/30" },
    "non-conforme": { label: "Non conforme", className: "bg-red-500/15 text-red-400 border-red-500/30" },
    "en-attente": { label: "En attente", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    "valide": { label: "Validé", className: "bg-green-500/15 text-green-400 border-green-500/30" },
    "echoue": { label: "Échoué", className: "bg-red-500/15 text-red-400 border-red-500/30" },
  };
  const { label, className } = config[statut] || config["a-verifier"];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${className}`}
    >
      {label}
    </span>
  );
};

// Badge de type
const TypeBadge = ({ type }: { type: DocumentDemande["type"] }) => {
  const config = {
    contrat: {
      label: "Contrat",
      className: "bg-purple-500/15 text-purple-400 border-purple-500/30",
      icon: FileSignature,
    },
    edl: {
      label: "État des lieux",
      className: "bg-green-500/15 text-green-400 border-green-500/30",
      icon: ClipboardCheck,
    },
  };
  const { label, className, icon: Icon } = config[type];

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${className}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

// ===== MODALE DE DÉTAILS AVEC ENVOI D'EMAIL =====
const DocumentDetailsModal = ({
  document,
  versements,
  onClose,
  onUpdate,
  onRefresh,
}: {
  document: DocumentDemande;
  versements: Versement[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<DocumentDemande>) => Promise<void>;
  onRefresh: () => Promise<void>;
}) => {
  const dialog = useDialog();
  const [note, setNote] = useState(document.note || "");
  const [updating, setUpdating] = useState(false);
  const [versementsLoading, setVersementsLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    sent: boolean;
    count: number;
    pdfCount?: number;
    message?: string;
    destinataires?: string[];
  } | null>(null);

  const getCoordonneesManquantes = () => {
    const manquantes: { nom: string; champ: string }[] = [];
    document.parties.forEach((p) => {
      if (!p.cin) manquantes.push({ nom: p.nom, champ: "CIN" });
      if (!p.telephone) manquantes.push({ nom: p.nom, champ: "Téléphone" });
      if (!p.email) manquantes.push({ nom: p.nom, champ: "Email" });
    });
    return manquantes;
  };

  const manquantes = getCoordonneesManquantes();
  const estComplet = manquantes.length === 0;

  // Calcul des totaux des versements
  const versementsDuTotal = versements.reduce((sum, v) => sum + v.du, 0);
  const versementsRecuTotal = versements.reduce((sum, v) => sum + v.recu, 0);

  const handleSave = async () => {
    await onUpdate(document.id, { note });
    onClose();
  };

  const handleMarkAsEmitted = async () => {
    setUpdating(true);
    await onUpdate(document.id, {
      statut: document.type === "contrat" ? "emis" : "a-planifier",
      dateEmission: new Date().toISOString().split("T")[0],
    });
    setUpdating(false);
    onClose();
  };

  const handleMarkAsSigned = async () => {
    setUpdating(true);
    await onUpdate(document.id, {
      statut: "signe",
      dateSignature: new Date().toISOString().split("T")[0],
    });
    setUpdating(false);
    onClose();
  };

  // ============================================================
  // FONCTION D'ENVOI D'EMAIL - VERSION CORRIGÉE
  // ============================================================

  const handleSendToAll = async () => {
    const emails = [...new Set(document.parties
      .map((party) => party.email?.trim().toLowerCase())
      .filter((email): email is string => Boolean(email)))];

    if (emails.length === 0) {
      void dialog.alert({
        tone: "warning",
        title: "Envoi impossible",
        message: "Aucune adresse e-mail n'est renseignée pour les parties de ce document.",
      });
      return;
    }

    // Confirmation avant envoi
    const confirmerEnvoi = await dialog.confirm({
      title: "Envoyer le document",
      message: `Le document ${document.id} et son mot de passe seront envoyés par e-mail à ${emails.length} destinataire(s). Une archive PDF/A et les empreintes des copies seront conservées.`,
      confirmLabel: "Envoyer",
    });
    if (!confirmerEnvoi) return;

    setSendingEmail(true);
    setEmailStatus(null);

    try {
      const response = await api.envoyerEmailContrat(document.id, {
        type: document.type,
      });

      setEmailStatus({
        sent: response.success,
        count: response.count || emails.length,
        pdfCount: response.pdfCount,
        message: response.message,
        destinataires: response.destinataires,
      });

      dialog.toast(`E-mail envoyé à ${response.count || emails.length} destinataire(s)`);

    } catch (error) {
      console.error('Erreur envoi email:', error);
      setEmailStatus({
        sent: false,
        count: 0,
        message: error instanceof Error ? error.message : 'Erreur lors de l\'envoi',
      });
      void dialog.alert({
        tone: "danger",
        title: "Envoi impossible",
        message: error instanceof Error
          ? error.message
          : "L'e-mail n'a pas pu être envoyé. Merci de réessayer dans quelques instants.",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleUpdateVersement = async (paymentId: number, newStatut: Versement["statut"]) => {
    setVersementsLoading(true);
    try {
      await api.updatePaiementStatus(paymentId, { statut: newStatut });
      await onRefresh();
    } catch (err) {
      void dialog.alert({
        tone: "danger",
        title: "Mise à jour impossible",
        message: err instanceof Error
          ? err.message
          : "Le statut du versement n'a pas pu être enregistré. Merci de réessayer.",
      });
    } finally {
      setVersementsLoading(false);
    }
  };

  const getEmailsCount = () => {
    return new Set(document.parties
      .map((party) => party.email?.trim().toLowerCase())
      .filter(Boolean)).size;
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex items-start justify-between sticky top-0 bg-[oklch(0.22_0.005_260)] z-10">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-bold">{document.id}</h3>
              <StatusBadge statut={document.statut} />
              <TypeBadge type={document.type} />
            </div>
            <p className="text-white/50 text-sm mt-1">
              {document.sousType} · {document.bien}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white/5 rounded-lg p-3">
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">
                Création
              </div>
              <div className="font-medium">{document.dateCreation}</div>
            </div>
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">
                Demande
              </div>
              <div className="font-medium">{document.dateDemande}</div>
            </div>
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">
                Montant
              </div>
              <div className="font-bold text-brand-cyan">
                {document.montant.toLocaleString("fr-FR")} MGA
              </div>
            </div>
          </div>

          {document.dateEmission && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <div className="text-white/40 text-xs uppercase tracking-wider">
                Date d'émission
              </div>
              <div className="font-medium">{document.dateEmission}</div>
            </div>
          )}

          {document.dateSignature && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="text-white/40 text-xs uppercase tracking-wider">
                Date de signature
              </div>
              <div className="font-medium">{document.dateSignature}</div>
            </div>
          )}

          {/* Parties */}
          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-2">
              Parties
            </div>
            <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain touch-pan-x" role="region" aria-label="Parties au contrat" tabIndex={0}>
              <table className="w-full min-w-[700px] text-sm break-words">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-2 text-white/40 font-medium text-xs">
                      Nom
                    </th>
                    <th className="text-left p-2 text-white/40 font-medium text-xs">
                      Rôle
                    </th>
                    <th className="text-left p-2 text-white/40 font-medium text-xs">
                      N° CIN
                    </th>
                    <th className="text-left p-2 text-white/40 font-medium text-xs">
                      Téléphone
                    </th>
                    <th className="text-left p-2 text-white/40 font-medium text-xs">
                      Email
                    </th>
                    <th className="text-left p-2 text-white/40 font-medium text-xs">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {document.parties.map((p, idx) => {
                    const manque = [];
                    if (!p.cin) manque.push("CIN");
                    if (!p.telephone) manque.push("Tél.");
                    if (!p.email) manque.push("Email");

                    return (
                      <tr key={idx}>
                        <td className="p-2 font-medium">{p.nom}</td>
                        <td className="p-2 text-white/60">{p.role}</td>
                        <td className="p-2">
                          {p.cin || <span className="text-red-400">—</span>}
                        </td>
                        <td className="p-2">
                          {p.telephone || (
                            <span className="text-red-400">—</span>
                          )}
                        </td>
                        <td className="p-2">
                          {p.email || <span className="text-red-400">—</span>}
                        </td>
                        <td className="p-2">
                          {manque.length === 0 ? (
                            <span className="text-[10px] text-green-400 font-medium">
                              ✓ Complet
                            </span>
                          ) : (
                            <span className="text-[10px] text-red-400 font-medium">
                              Manque: {manque.join(", ")}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="pt-2 text-xs text-white/40 lg:hidden">Faites défiler horizontalement pour afficher toutes les colonnes.</p>

            {estComplet ? (
              <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Toutes les coordonnées sont renseignées
              </div>
            ) : (
              <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                {manquantes.length} donnée(s) manquante(s) — à récupérer en
                messagerie
              </div>
            )}
          </div>

          {/* ===== ÉTAT FINANCIER (VERSEMENTS ASSOCIÉS) ===== */}
          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
              <CreditCard className="w-3 h-3" />
              État financier (versements associés)
            </div>

            {versements.length === 0 ? (
              <div className="text-xs text-amber-400 flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                <AlertCircle className="w-3 h-3" />
                Aucun versement enregistré pour cette demande
              </div>
            ) : (
              <>
                <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain touch-pan-x" role="region" aria-label="Versements associés au contrat" tabIndex={0}>
                  <table className="w-full min-w-[820px] text-sm break-words">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left p-2 text-white/40 font-medium text-xs">
                        Réf.
                      </th>
                      <th className="text-left p-2 text-white/40 font-medium text-xs">
                        Émetteur
                      </th>
                      <th className="text-left p-2 text-white/40 font-medium text-xs">
                        Canal
                      </th>
                      <th className="text-left p-2 text-white/40 font-medium text-xs">
                        Date paiement
                      </th>
                      <th className="text-right p-2 text-white/40 font-medium text-xs">
                        À payer (MGA)
                      </th>
                      <th className="text-right p-2 text-white/40 font-medium text-xs">
                        Reçu (MGA)
                      </th>
                      <th className="text-left p-2 text-white/40 font-medium text-xs">
                        Statut
                      </th>
                      <th className="text-center p-2 text-white/40 font-medium text-xs">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {versements.map((v) => {
                      const estPartiel = v.recu < v.du;
                      const estDepasse = v.recu > v.du;

                      return (
                        <tr key={v.paymentId} className="hover:bg-white/5 transition">
                          <td className="p-2 font-mono text-xs">{v.id}</td>
                          <td className="p-2">{v.emetteur}</td>
                          <td className="p-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                              {v.canal}
                            </span>
                          </td>
                          <td className="p-2 text-white/60">{v.date}</td>
                          <td className="p-2 text-right">{v.du.toLocaleString("fr-FR")}</td>
                          <td className={`p-2 text-right ${estPartiel ? 'text-red-400' : estDepasse ? 'text-amber-400' : 'text-green-400'}`}>
                            {v.recu.toLocaleString("fr-FR")}
                            {estPartiel && <span className="text-[10px] text-red-400 block">(partiel)</span>}
                          </td>
                          <td className="p-2">
                            <VersementStatusBadge statut={v.statut} />
                          </td>
                          <td className="p-2 text-center whitespace-nowrap">
                            {v.statut === "a-verifier" && (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleUpdateVersement(v.paymentId, "conforme")}
                                  disabled={versementsLoading}
                                  className="p-1 rounded hover:bg-green-500/20 text-green-400 transition"
                                  title="Marquer conforme"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleUpdateVersement(v.paymentId, "non-conforme")}
                                  disabled={versementsLoading}
                                  className="p-1 rounded hover:bg-red-500/20 text-red-400 transition"
                                  title="Marquer non conforme"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                            {v.statut === "conforme" && (
                              <span className="text-[10px] text-green-400">✓ Validé</span>
                            )}
                            {v.statut === "non-conforme" && (
                              <span className="text-[10px] text-red-400">✗ Rejeté</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-white/5 border-t border-white/10">
                    <tr>
                      <td colSpan={4} className="p-2 text-right font-semibold">
                        Totaux
                      </td>
                      <td className="p-2 text-right font-semibold text-amber-400">
                        {versementsDuTotal.toLocaleString("fr-FR")}
                      </td>
                      <td className="p-2 text-right font-semibold text-brand-cyan">
                        {versementsRecuTotal.toLocaleString("fr-FR")}
                      </td>
                      <td colSpan={2} className="p-2"></td>
                    </tr>
                  </tfoot>
                  </table>
                </div>
                <p className="pt-2 text-xs text-white/40 lg:hidden">Faites défiler horizontalement pour afficher toutes les colonnes et les actions.</p>
              </>
            )}
          </div>

          {/* ===== STATUT DE L'EMAIL ===== */}
          {emailStatus && (
            <div className={`text-xs ${emailStatus.sent ? 'text-green-400' : 'text-red-400'} bg-white/5 rounded-lg p-2 flex items-center gap-2 border ${emailStatus.sent ? 'border-green-500/30' : 'border-red-500/30'}`}>
              {emailStatus.sent ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  ✅ {emailStatus.pdfCount || 1} PDF envoyé(s) à {emailStatus.count} destinataire(s)
                  {emailStatus.destinataires && emailStatus.destinataires.length > 0 && (
                    <span className="text-white/40 text-[10px] ml-2">
                      ({emailStatus.destinataires.join(', ')})
                    </span>
                  )}
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3" />
                  ❌ {emailStatus.message || 'Erreur lors de l\'envoi'}
                </>
              )}
            </div>
          )}

          {/* Note de suivi */}
          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-1">
              Note de suivi
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ajouter une note..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50 resize-none"
              rows={2}
            />
          </div>
        </div>

        {/* ===== FOOTER AVEC TOUS LES BOUTONS ===== */}
        <div className="p-4 border-t border-white/10 flex flex-wrap gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-brand-cyan text-[oklch(0.15_0_0)] font-bold rounded-lg hover:opacity-80 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Enregistrer
          </button>

          {document.statut !== "emis" &&
            document.statut !== "signe" &&
            estComplet && (
              <button
                onClick={handleMarkAsEmitted}
                disabled={updating}
                className="px-4 py-2 bg-brand-green/15 text-brand-green border border-brand-green/30 rounded-lg hover:bg-brand-green/25 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {document.type === "contrat"
                  ? "Émettre le contrat"
                  : "Planifier EDL"}
              </button>
            )}

          {document.statut === "emis" && (
            <button
              onClick={handleMarkAsSigned}
              disabled={updating}
              className="px-4 py-2 bg-brand-green/15 text-brand-green border border-brand-green/30 rounded-lg hover:bg-brand-green/25 transition flex items-center gap-2 disabled:opacity-50"
            >
              <FileCheck className="w-4 h-4" />
              Marquer comme signé
            </button>
          )}

          {/* ============================================================ */}
          {/* BOUTON ENVOYER À TOUS - VERSION CORRIGÉE */}
          {/* ============================================================ */}
          <button
            onClick={handleSendToAll}
            disabled={sendingEmail || getEmailsCount() === 0}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              getEmailsCount() === 0
                ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
            }`}
            title={
              getEmailsCount() === 0
                ? 'Aucun email disponible'
                : 'Envoyer les PDF protégés aux parties après validation de tous les paiements'
            }
          >
            {sendingEmail ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Envoyer les PDF à tous
                {getEmailsCount() > 0 && (
                  <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">
                    {getEmailsCount()}
                  </span>
                )}
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition text-white/60 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== COMPOSANT PRINCIPAL =====
export default function AdminContratsEDL() {
  const dialog = useDialog();
  const [activeTab, setActiveTab] = useState<"demandes" | "nouvelles-demandes" | "offres">("demandes");
  const [documents, setDocuments] = useState<DocumentDemande[]>([]);
  const [newDocumentRequests, setNewDocumentRequests] = useState<ContractDocumentRequest[]>([]);
  const [offres, setOffres] = useState<OffreCommerciale[]>([]);
  const [versements, setVersements] = useState<Versement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("tous");
  const [filterStatut, setFilterStatut] = useState<string>("tous");
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentDemande | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<"dateCreation" | "id" | "montant">(
    "dateCreation",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // État pour l'ajout et la modification d'offre
  const [showAddOffre, setShowAddOffre] = useState(false);
  const [editingOffre, setEditingOffre] = useState<OffreCommerciale | null>(
    null,
  );
  const [newOffreNom, setNewOffreNom] = useState("");
  const [newOffrePrix, setNewOffrePrix] = useState("");
  const [newOffreType, setNewOffreType] = useState<"contrat" | "edl">(
    "contrat",
  );
  const [newOffreDescription, setNewOffreDescription] = useState("");

  const closeOffreModal = () => {
    setShowAddOffre(false);
    setEditingOffre(null);
    setNewOffreNom("");
    setNewOffrePrix("");
    setNewOffreType("contrat");
    setNewOffreDescription("");
  };

  // Types et statuts pour les filtres
  const types = useMemo(() => {
    const unique = new Set(documents.map((d) => d.type));
    return ["tous", ...Array.from(unique)];
  }, [documents]);

  const statuts = useMemo(() => {
    const unique = new Set(documents.map((d) => d.statut));
    return ["tous", ...Array.from(unique)];
  }, [documents]);

  // Filtrer et trier les documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.id.toLowerCase().includes(query) ||
          d.bien.toLowerCase().includes(query) ||
          d.sousType.toLowerCase().includes(query) ||
          d.parties.some((p) => p.nom.toLowerCase().includes(query)),
      );
    }

    if (filterType !== "tous") {
      filtered = filtered.filter((d) => d.type === filterType);
    }

    if (filterStatut !== "tous") {
      filtered = filtered.filter((d) => d.statut === filterStatut);
    }

    filtered = filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "dateCreation") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (typeof aVal === "string") {
        return sortOrder === "desc"
          ? bVal.localeCompare(aVal)
          : aVal.localeCompare(bVal);
      }

      return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
    });

    return filtered;
  }, [documents, searchQuery, filterType, filterStatut, sortField, sortOrder]);

  useEffect(() => {
    loadDocuments();
    loadNewDocumentRequests();
    loadOffres();
    loadVersements();
  }, []);

  // Statistiques
  const stats = useMemo(() => {
    const total = documents.length;
    const submittedNewRequests = newDocumentRequests.filter((request) => request.statut !== "brouillon");
    const contrats = documents.filter((d) => d.type === "contrat").length +
      submittedNewRequests.filter((request) => request.type_document === "contrat").length;
    const edl = documents.filter((d) => d.type === "edl").length +
      submittedNewRequests.filter((request) => request.type_document === "edl").length;
    const aEmettre = documents.filter((d) => d.statut === "a-emettre").length;
    const aPlanifier = documents.filter(
      (d) => d.statut === "a-planifier",
    ).length;
    const emis = documents.filter((d) => d.statut === "emis").length;
    const signe = documents.filter((d) => d.statut === "signe").length;
    const enAttente = documents.filter((d) => d.statut === "en-attente").length;

    const newRequestsToProcess = submittedNewRequests.filter((request) =>
      request.statut === "a-verifier" || request.statut === "en-cours"
    ).length;
    const totalMontant = documents.reduce((sum, d) => sum + d.montant, 0) +
      submittedNewRequests.reduce((sum, request) => sum + Number(request.montant || 0), 0);

    return {
      total: total + submittedNewRequests.length,
      contrats,
      edl,
      aEmettre,
      aPlanifier,
      newRequestsToProcess,
      emis,
      signe,
      enAttente,
      totalMontant,
    };
  }, [documents, newDocumentRequests]);

  const submittedNewRequests = useMemo(
    () => newDocumentRequests.filter((request) => request.statut !== "brouillon"),
    [newDocumentRequests],
  );

  const loadNewDocumentRequests = async () => {
    try {
      setNewDocumentRequests(await api.backofficeContractDocumentRequests());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les nouvelles demandes",
      );
    }
  };

  // Charger les documents
  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await api.backofficeContrats();
      setDocuments(rows.map(mapApiContratRow));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les contrats",
      );
    } finally {
      setLoading(false);
    }
  };

  // Charger les offres
  const loadOffres = async () => {
    try {
      const services = await api.backofficeServicesCkoo();
      const offresData = services
        .flatMap((service) => {
          const cleService = service.cle_service?.trim() || "";
          const cleServiceNormalisee = cleService.toLowerCase();
          if (
            !cleServiceNormalisee.startsWith("contrat") &&
            !cleServiceNormalisee.startsWith("edl")
          ) {
            return [];
          }
          return [{
            id: String(service.id_service),
            nom: service.nom,
            prix: Number(service.prix),
            type: cleServiceNormalisee.startsWith("contrat") ? "contrat" as const : "edl" as const,
            description: service.description || undefined,
          }];
        });

      const typedOffres: OffreCommerciale[] = offresData.map((item) => ({
        id: item.id,
        nom: item.nom,
        prix: item.prix,
        type: item.type,
        description: item.description,
      }));

      setOffres(typedOffres);
    } catch (err) {
      setOffres([]);
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les offres commerciales",
      );
    }
  };

  // Charger les versements
  const loadVersements = async () => {
    try {
      const rows = await api.backofficePaiements();
      setVersements(rows.map(mapVersement));
    } catch (err) {
      setVersements([]);
      setError(err instanceof Error ? err.message : "Impossible de charger les paiements.");
    }
  };

  // Ouvrir les détails d'un document avec ses versements
  const openDocumentDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const [detail, paiements] = await Promise.all([
        api.backofficeContratDetails(id),
        api.backofficePaiements()
      ]);
      
      // Filtrer les paiements liés à ce contrat
      const contratPaiements = paiements
        .filter((p) => p.service_type === "contrat" && String(p.id_contrat) === id)
        .map(mapVersement);
      
      setSelectedDocument(mapApiContratDetails(detail));
      setVersements(contratPaiements);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger le document",
      );
      // The payment history is unavailable when the contract details request fails.
      setSelectedDocument(null);
      setVersements([]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle de tri
  const handleSort = (field: "dateCreation" | "id" | "montant") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Obtenir l'icône de tri
  const getSortIcon = (field: "dateCreation" | "id" | "montant") => {
    if (sortField !== field)
      return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortOrder === "desc" ? (
      <ChevronDown className="w-3 h-3" />
    ) : (
      <ChevronUp className="w-3 h-3" />
    );
  };

  // Mettre à jour un document
  const handleUpdateDocument = async (
    id: string,
    updates: Partial<DocumentDemande>,
  ) => {
    const index = documents.findIndex((d) => d.id === id);
    if (index === -1) return;

    const action =
      updates.statut === "emis"
        ? "emettre"
        : updates.statut === "signe"
          ? "signer"
          : updates.statut === "envoye"
            ? "envoyer"
            : undefined;

    if (action) {
      try {
        setLoading(true);
        setError(null);
        await api.contratAction(id, action);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de mettre à jour le statut",
        );
        setLoading(false);
        return;
      }
    }

    const updatedDocuments = [...documents];
    const updatedDocument = {
      ...updatedDocuments[index],
      ...updates,
    };
    updatedDocuments[index] = updatedDocument;
    setDocuments(updatedDocuments);
    if (selectedDocument?.id === id) {
      setSelectedDocument(updatedDocument);
    }

    const statutLabels = {
      "a-emettre": "À émettre",
      "a-planifier": "À planifier",
      brouillon: "Brouillon",
      emis: "Émis",
      envoye: "Envoyé",
      signe: "Signé",
      "en-attente": "En attente",
    };

    if (updates.statut) {
      setSuccessMessage(
        `Document ${id} mis à jour : ${statutLabels[updates.statut as keyof typeof statutLabels]}`,
      );
    } else {
      setSuccessMessage(`Document ${id} mis à jour avec succès`);
    }
    setTimeout(() => setSuccessMessage(null), 3000);
    setLoading(false);
  };

  // Rafraîchir toutes les données
  const handleRefresh = async () => {
    await Promise.all([
      loadDocuments(),
      loadNewDocumentRequests(),
      loadOffres(),
      loadVersements()
    ]);
    setSuccessMessage("Données actualisées");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Gérer l'ajout d'une offre
  const handleAddOffre = async () => {
    if (!newOffreNom.trim() || !newOffrePrix) {
      void dialog.alert({
        tone: "warning",
        title: "Champs manquants",
        message: "Merci de renseigner le nom de l'offre et son prix.",
      });
      return;
    }

    const prix = parseInt(newOffrePrix);
    if (isNaN(prix) || prix <= 0) {
      void dialog.alert({
        tone: "warning",
        title: "Prix invalide",
        message: "Le prix doit être un nombre supérieur à 0.",
      });
      return;
    }

    try {
      await api.createServiceCkoo({
        cle_service: `${newOffreType}_${Date.now()}`,
        nom: newOffreNom.trim(),
        description: newOffreDescription.trim() || undefined,
        prix: prix,
        unite: "forfait",
        est_actif: 1,
      });

      await loadOffres();
      setShowAddOffre(false);
      setNewOffreNom("");
      setNewOffrePrix("");
      setNewOffreType("contrat");
      setNewOffreDescription("");
      setSuccessMessage("Offre ajoutée avec succès");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible d'ajouter l'offre",
      );
    }
  };

  // Supprimer une offre
  const handleDeleteOffre = async (id: string) => {
    const confirmerSuppression = await dialog.confirm({
      tone: "danger",
      title: "Supprimer cette offre ?",
      message: "Cette offre commerciale sera définitivement supprimée.",
      confirmLabel: "Supprimer",
    });
    if (!confirmerSuppression) return;

    try {
      await api.deleteServiceCkoo(id);
      await loadOffres();
      setSuccessMessage("Offre supprimée avec succès");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible de supprimer l'offre",
      );
    }
  };

  const handleEditOffre = async () => {
    if (!editingOffre) return;

    if (!newOffreNom.trim() || !newOffrePrix) {
      void dialog.alert({
        tone: "warning",
        title: "Champs manquants",
        message: "Merci de renseigner le nom de l'offre et son prix.",
      });
      return;
    }

    const prix = parseInt(newOffrePrix);
    if (isNaN(prix) || prix <= 0) {
      void dialog.alert({
        tone: "warning",
        title: "Prix invalide",
        message: "Le prix doit être un nombre supérieur à 0.",
      });
      return;
    }

    setError(null);
    try {
      await api.updateServiceCkoo(editingOffre.id, {
        nom: newOffreNom.trim(),
        description: newOffreDescription.trim(),
        prix,
      });
      await loadOffres();
      closeOffreModal();
      setSuccessMessage("Offre modifiée avec succès");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible de modifier l'offre",
      );
    }
  };

  const handleSaveOffre = () => {
    if (editingOffre) {
      void handleEditOffre();
      return;
    }
    void handleAddOffre();
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="bebas text-3xl text-white">
              Contrats &amp; états des lieux
            </h1>
            <p className="break-words text-white/50 text-sm">
              {stats.total} demandes au total · {stats.contrats} contrats · {stats.edl}{" "}
              EDL · {stats.newRequestsToProcess + stats.aEmettre + stats.aPlanifier} à traiter
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition text-white/60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>

        <div className="rounded-xl border border-brand-cyan/25 bg-brand-cyan/10 p-4">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" />
            <div>
              <h2 className="text-sm font-semibold text-brand-cyan">
                Parcours Contrats &amp; EDL disponible
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-white/60">
                Les clients peuvent maintenant compléter un parcours guidé, sélectionner les clauses du catalogue, consulter les deux premières pages et soumettre leur paiement Mobile Money. Le PDF final est débloqué après validation du paiement.
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="bg-brand-green/20 border border-brand-green/30 text-brand-green px-4 py-2 rounded-lg text-sm animate-in slide-in-from-top-2">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Onglets */}
        <div className="border-b border-white/10">
          <div className="grid grid-cols-2 gap-1 sm:flex sm:flex-wrap">
            <button
              onClick={() => setActiveTab("demandes")}
              className={`min-w-0 px-3 py-2 text-center text-xs font-medium leading-tight transition sm:px-4 sm:text-sm ${
                activeTab === "demandes"
                  ? "text-brand-cyan border-b-2 border-brand-cyan"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              Demandes
            </button>
            <button
              onClick={() => setActiveTab("offres")}
              className={`min-w-0 px-3 py-2 text-center text-xs font-medium leading-tight transition sm:px-4 sm:text-sm ${
                activeTab === "offres"
                  ? "text-brand-cyan border-b-2 border-brand-cyan"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              Offres commerciales
            </button>
            <button
              onClick={() => setActiveTab("nouvelles-demandes")}
              className={`min-w-0 px-3 py-2 text-center text-xs font-medium leading-tight transition sm:px-4 sm:text-sm ${
                activeTab === "nouvelles-demandes"
                  ? "text-brand-cyan border-b-2 border-brand-cyan"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              Nouvelles demandes
              {newDocumentRequests.filter((request) => request.statut !== "brouillon").length > 0 && (
                <span className="ml-2 rounded-full bg-brand-cyan/20 px-2 py-0.5 text-xs text-brand-cyan">
                  {newDocumentRequests.filter((request) => request.statut !== "brouillon").length}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === "nouvelles-demandes" && (
          <AdminContractDocumentRequests onRequestsChanged={() => void loadNewDocumentRequests()} />
        )}

        {/* ===== ONGLET DEMANDES ===== */}
        {activeTab === "demandes" && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-brand-cyan">
                  {stats.total}
                </div>
                <div className="text-xs text-white/40">Total</div>
              </div>
              <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {stats.contrats}
                </div>
                <div className="text-xs text-white/40">Contrats</div>
              </div>
              <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {stats.edl}
                </div>
                <div className="text-xs text-white/40">EDL</div>
              </div>
              <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-amber-400">
                  {stats.aEmettre + stats.aPlanifier + stats.newRequestsToProcess}
                </div>
                <div className="text-xs text-white/40">À traiter</div>
              </div>
              <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-brand-green">
                  {stats.signe}
                </div>
                <div className="text-xs text-white/40">Signés</div>
              </div>
              <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-brand-cyan break-words">
                  {stats.totalMontant.toLocaleString("fr-FR")}
                </div>
                <div className="text-xs text-white/40">Montant total</div>
              </div>
            </div>

            {submittedNewRequests.length > 0 && (
              <section className="overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.22_0.005_260)]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
                  <div>
                    <h2 className="font-semibold text-white">Demandes du parcours guidé</h2>
                    <p className="mt-0.5 text-xs text-white/40">
                      Contrats et états des lieux créés depuis le nouveau parcours.
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-cyan/15 px-2.5 py-1 text-xs font-semibold text-brand-cyan">
                    {submittedNewRequests.length} demande(s)
                  </span>
                </div>
                <div className="divide-y divide-white/5">
                  {submittedNewRequests.map((request) => (
                    <article key={request.id_demande} className="flex min-w-0 flex-col items-stretch justify-between gap-3 px-3 py-3 sm:flex-row sm:items-center sm:px-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="break-all font-semibold text-white">{request.reference}</span>
                          <span className="text-xs text-white/50">
                            {request.type_document === "edl" ? "État des lieux" : "Contrat"}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            request.statut === "valide"
                              ? "bg-green-500/15 text-green-300"
                              : request.statut === "refuse"
                                ? "bg-red-500/15 text-red-300"
                                : "bg-amber-500/15 text-amber-300"
                          }`}>
                            {request.statut === "valide"
                              ? "Validée"
                              : request.statut === "refuse"
                                ? "Refusée"
                                : request.statut === "en-cours"
                                  ? "En traitement"
                                  : "Paiement à vérifier"}
                          </span>
                        </div>
                        <p className="mt-1 break-words text-xs text-white/50">
                          {request.donnees.nom_demandeur || request.email || "Demandeur"} · {request.profil_demandeur}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                        <div className="text-left sm:text-right">
                          <div className="text-sm font-semibold text-brand-cyan">
                            {Number(request.montant || 0).toLocaleString("fr-FR")} MGA
                          </div>
                          <div className="text-[10px] text-white/40">
                            Paiement : {request.statut_paiement.replace(/-/g, " ")}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab("nouvelles-demandes")}
                          className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/5"
                        >
                          Ouvrir
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Filtres et recherche */}
            <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1 max-w-xs min-w-0">
                    <Search className="w-4 h-4 text-white/40" />
                    <input
                      placeholder="Rechercher un document..."
                      className="flex-1 bg-transparent outline-none text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-white/40 hover:text-white/70 text-xs p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap ml-auto">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                    >
                      <option
                        value="tous"
                        className="bg-[oklch(0.22_0.005_260)]"
                      >
                        Tous les types
                      </option>
                      <option
                        value="contrat"
                        className="bg-[oklch(0.22_0.005_260)]"
                      >
                        Contrats
                      </option>
                      <option
                        value="edl"
                        className="bg-[oklch(0.22_0.005_260)]"
                      >
                        États des lieux
                      </option>
                    </select>

                    <select
                      value={filterStatut}
                      onChange={(e) => setFilterStatut(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                    >
                      <option
                        value="tous"
                        className="bg-[oklch(0.22_0.005_260)]"
                      >
                        Tous les statuts
                      </option>
                      <option
                        value="a-emettre"
                        className="bg-[oklch(0.22_0.005_260)]"
                      >
                        À émettre
                      </option>
                      <option
                        value="a-planifier"
                        className="bg-[oklch(0.22_0.005_260)]"
                      >
                        À planifier
                      </option>
                      <option
                        value="emis"
                        className="bg-[oklch(0.22_0.005_260)]"
                      >
                        Émis
                      </option>
                      <option
                        value="signe"
                        className="bg-[oklch(0.22_0.005_260)]"
                      >
                        Signé
                      </option>
                      <option
                        value="en-attente"
                        className="bg-[oklch(0.22_0.005_260)]"
                      >
                        En attente
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Liste des documents */}
              <div className="divide-y divide-white/5">
                {loading ? (
                  <div className="text-center py-12 text-white/40">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Chargement des documents...</p>
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="text-center py-12 text-white/40">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Aucun document de l’ancien parcours trouvé</p>
                  </div>
                ) : (
                  filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 hover:bg-white/5 transition cursor-pointer"
                      onClick={() => openDocumentDetails(doc.id)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        {/* Icône */}
                        <div
                          className={`w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0 ${
                            doc.type === "contrat"
                              ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                              : "bg-green-500/10 border-green-500/20 text-green-400"
                          }`}
                        >
                          {doc.type === "contrat" ? (
                            <FileSignature className="w-4 h-4" />
                          ) : (
                            <ClipboardCheck className="w-4 h-4" />
                          )}
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-semibold">{doc.id}</h3>
                            <span className="text-white/30 text-xs">·</span>
                            <span className="text-white/50 text-sm">
                              {doc.sousType}
                            </span>
                            <TypeBadge type={doc.type} />
                            <StatusBadge statut={doc.statut} />
                          </div>
                          <p className="text-sm text-white/60 mt-1">
                            {doc.bien}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-white/40 flex-wrap">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {doc.dateCreation}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {doc.partiesCount ??
                                doc.parties?.length ??
                                0}{" "}
                              partie(s)
                            </span>
                            <span className="flex items-center gap-1 text-brand-cyan">
                              <DollarSign className="w-3 h-3" />
                              {doc.montant.toLocaleString("fr-FR")} MGA
                            </span>
                            {doc.dateEmission && (
                              <span className="flex items-center gap-1 text-purple-400">
                                <Send className="w-3 h-3" />
                                Émis le {doc.dateEmission}
                              </span>
                            )}
                            {doc.dateSignature && (
                              <span className="flex items-center gap-1 text-green-400">
                                <UserCheck className="w-3 h-3" />
                                Signé le {doc.dateSignature}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Badge coordonnées */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {doc.parties.some(
                            (p) => !p.cin || !p.telephone || !p.email,
                          ) ? (
                            <span className="text-[10px] text-red-400 font-medium px-2 py-1 rounded-full border border-red-500/30 bg-red-500/10">
                              <AlertCircle className="w-3 h-3 inline mr-1" />
                              Données manquantes
                            </span>
                          ) : (
                            <span className="text-[10px] text-green-400 font-medium px-2 py-1 rounded-full border border-green-500/30 bg-green-500/10">
                              <CheckCircle className="w-3 h-3 inline mr-1" />
                              Complet
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>

            {/* Note */}
            <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-white/40">
                  Certaines données (noms, N° CIN, coordonnées) sont à récupérer
                  dans la messagerie échangée avec les parties. Une coordonnée
                  manquante bloque l'émission du document. Cliquez sur un
                  document pour voir les détails.
                </div>
              </div>
            </div>
          </>
        )}

        {/* ===== ONGLET OFFRES COMMERCIALES ===== */}
        {activeTab === "offres" && (
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="font-semibold flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-cyan" />
                  Offres commerciales — contrats &amp; états des lieux
                </h2>
                <p className="text-white/40 text-xs mt-1">
                  Catalogue piloté par le super admin. Ces tarifs alimentent le
                  montant des demandes de contrats et d'états des lieux.
                </p>
              </div>
              <button
                onClick={() => {
                  closeOffreModal();
                  setShowAddOffre(true);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-brand-cyan text-[oklch(0.15_0_0)] font-bold rounded-lg hover:opacity-80 transition"
              >
                <Plus className="w-4 h-4" />
                Ajouter une offre
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                      Offre
                    </th>
                    <th className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                      Description
                    </th>
                    <th className="text-right p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                      Prix (MGA)
                    </th>
                    <th className="text-center p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {offres.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-sm text-white/40">
                        Aucune offre commerciale enregistrée.
                      </td>
                    </tr>
                  ) : (
                    offres.map((offre) => (
                      <tr key={offre.id} className="hover:bg-white/5 transition">
                        <td className="p-3 font-medium">{offre.nom}</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${
                              offre.type === "contrat"
                                ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                                : "bg-green-500/15 text-green-400 border-green-500/30"
                            }`}
                          >
                            {offre.type === "contrat" ? (
                              <FileSignature className="w-3 h-3" />
                            ) : (
                              <ClipboardCheck className="w-3 h-3" />
                            )}
                            {offre.type === "contrat" ? "Contrat" : "EDL"}
                          </span>
                        </td>
                        <td className="p-3 text-white/60 text-sm">
                          {offre.description || "—"}
                        </td>
                        <td className="p-3 text-right font-bold text-brand-cyan">
                          {offre.prix.toLocaleString("fr-FR")} MGA
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setEditingOffre(offre);
                                setNewOffreNom(offre.nom);
                                setNewOffrePrix(String(offre.prix));
                                setNewOffreType(offre.type);
                                setNewOffreDescription(offre.description || "");
                                setShowAddOffre(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-brand-cyan/20 text-brand-cyan transition"
                              title="Modifier"
                              aria-label={`Modifier l'offre ${offre.nom}`}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOffre(offre.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="text-xs text-white/40">
                <Info className="w-3 h-3 inline mr-1" />
                Catalogue des offres commerciales. Modifications enregistrées
                automatiquement.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== MODALE D'AJOUT D'OFFRE ===== */}
      {showAddOffre && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={closeOffreModal}
        >
          <div
            className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                {editingOffre ? "Modifier une offre" : "Ajouter une offre"}
              </h3>
              <button
                onClick={closeOffreModal}
                className="p-1 hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60 block mb-1">
                  Nom de l'offre *
                </label>
                <input
                  type="text"
                  value={newOffreNom}
                  onChange={(e) => setNewOffreNom(e.target.value)}
                  placeholder="Ex: Contrat de colocation"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50"
                />
              </div>

              <div>
                <label className="text-sm text-white/60 block mb-1">
                  Type *
                </label>
                <select
                  value={newOffreType}
                  onChange={(e) =>
                    setNewOffreType(e.target.value as "contrat" | "edl")
                  }
                  disabled={Boolean(editingOffre)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50 disabled:opacity-60"
                >
                  <option
                    value="contrat"
                    className="bg-[oklch(0.22_0.005_260)]"
                  >
                    Contrat
                  </option>
                  <option value="edl" className="bg-[oklch(0.22_0.005_260)]">
                    État des lieux
                  </option>
                </select>
              </div>

              <div>
                <label className="text-sm text-white/60 block mb-1">
                  Prix (MGA) *
                </label>
                <input
                  type="number"
                  value={newOffrePrix}
                  onChange={(e) => setNewOffrePrix(e.target.value)}
                  placeholder="Ex: 120000"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50"
                />
              </div>

              <div>
                <label className="text-sm text-white/60 block mb-1">
                  Description (optionnel)
                </label>
                <textarea
                  value={newOffreDescription}
                  onChange={(e) => setNewOffreDescription(e.target.value)}
                  placeholder="Description de l'offre..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50 resize-none"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeOffreModal}
                  className="flex-1 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition text-white/60"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveOffre}
                  className="flex-1 px-4 py-2 bg-brand-cyan text-[oklch(0.15_0_0)] font-bold rounded-lg hover:opacity-80 transition"
                >
                  {editingOffre ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale de détails */}
      {selectedDocument && (
        <DocumentDetailsModal
          document={selectedDocument}
          versements={versements}
          onClose={() => {
            setSelectedDocument(null);
            loadVersements();
          }}
          onUpdate={handleUpdateDocument}
          onRefresh={loadVersements}
        />
      )}
    </AdminLayout>
  );
}