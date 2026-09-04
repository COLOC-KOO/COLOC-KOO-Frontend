import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Check,
  Clock,
  Eye,
  MapPin,
  MessageCircle,
  Scale,
  Trash2,
  Shield,
  Sparkles,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { SiteLayout } from "../components/site/SiteLayout";
import { useAuth } from "../lib/auth";
import { api, ApiAnnonce, ApiBackofficeContratDetails } from "../lib/api";
import { BasicCandidatureModals } from "../components/candidatures/BasicCandidatureModals";
import { CandidateAvatarStack } from "../components/candidatures/CandidateAvatarStack";
import { CandidaturesHeader, CandidaturesViewButtons } from "../components/candidatures/CandidaturesHeader";
import { ContractWizardModal } from "../components/candidatures/ContractWizardModal";
import { JoinTeamView } from "../components/candidatures/JoinTeamView";
import { OwnerCandidaturesDashboard, RealCandidaturesPanel } from "../components/candidatures/RealCandidaturesPanel";


type OwnerCandidate = {
  id: string;
  initials: string;
  name: string;
  subtitle: string;
  status: "pending" | "retained" | "refused";
  id_candidature?: number;
  id_utilisateur?: number;
  message?: string;
  date_creation?: string;
  email?: string;
  telephone?: string;
};

type Team = {
  id: string;
  title: string;
  mood: string;
  members: string[];
  chat: { who: string; txt: string }[];
};

type NotificationMode = "indiv" | "group";

// ===== NOUVEAU TYPE POUR LES ÉQUIPES RÉELLES =====
type EquipeReelle = {
  id_equipe: number;
  id_annonce: number;
  nom: string;
  ambiance: string | null;
  statut: "forming" | "selected" | "rejected" | "complete";
  date_creation: string;
  membres: {
    id_utilisateur: number;
    nom: string;
    prenom: string;
    email: string;
    statut: "pending" | "accepted" | "refused" | "owner";
    initials: string;
  }[];
};

const MOVEIN = "1er juillet 2026";
const FEE_TOTAL = 350000;
const JOIN_DEFAULT = "t2";

function fmtAr(value: number) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Bareme + options de paiement : la source de verite est la DB
// (configuration_backoffice, via GET /meta/contract-pricing). Ces valeurs ne
// servent QUE de repli si l'API n'a pas encore repondu.
type ContractTier = { maxLoyer: number | null; prix: number };
type MobileMoneyOption = {
  nom: string;
  numero: string;
  couleur: string;
  hint: string;
};
type ContractOption = { cle: string; titre: string; description: string };
type ContractClause = { titre: string; description: string };
type ContractOffer = {
  id: number;
  nom: string;
  description: string | null;
  prix: number;
};
type ContractConfig = {
  tiers: ContractTier[];
  edlPrix: number;
  mobileMoney: MobileMoneyOption[];
  clauses: ContractClause[];
  offer: { titre: string; texte: string };
  body: { titre: string; intro: string; corps: string };
  bail: ContractOption[];
  solidarite: ContractOption[];
  mailNote: { contrat: string; edl: string };
  contratOffers: ContractOffer[];
  edlOffers: ContractOffer[];
};

const FALLBACK_TIERS: ContractTier[] = [
  { maxLoyer: 450000, prix: 27000 },
  { maxLoyer: 1350000, prix: 47000 },
  { maxLoyer: null, prix: 60000 },
];
const FALLBACK_EDL_PRIX = 10000;
const FALLBACK_MOBILE_MONEY: MobileMoneyOption[] = [
  {
    nom: "Orange Money",
    numero: "0320000000",
    couleur: "#ff7900",
    hint: "Scanne ce QR code avec l'appli Orange Money, ou compose le numéro.",
  },
  {
    nom: "MVOLA",
    numero: "0340000000",
    couleur: "#e2001a",
    hint: "Scanne ce QR code avec l'appli MVOLA, ou compose le numéro.",
  },
];
const FALLBACK_CLAUSES: ContractClause[] = [
  {
    titre: "Identités & logement",
    description: "Colocataires, adresse du bien, date d'entrée (inclus).",
  },
  {
    titre: "Répartition du loyer et des charges",
    description: "Quote-part de chacun, modalités de paiement.",
  },
  {
    titre: "Dépôt de garantie / caution solidaire",
    description: "Montant, conditions de restitution.",
  },
  {
    titre: "État des lieux d'entrée",
    description: "Annexe descriptive des parties privatives et communes.",
  },
  {
    titre: "Clause de départ anticipé",
    description: "Préavis, remplacement du colocataire sortant.",
  },
];
const FALLBACK_OFFER = {
  titre: "Aide à la création de contrats avec les colocataires",
  texte:
    "Coloc'KOO peut rédiger pour toi un contrat de colocation conforme, signé entre les colocataires et/ou te proposer un document d'état des lieux. Voici un aperçu pré-rempli avec leurs noms et l'adresse du bien :",
};
const FALLBACK_BODY = {
  titre: "Contrat de colocation — Sarintany'COLOC",
  intro:
    "Entre les soussigné·e·s : {names}, ci-après dénommé·e·s « les colocataires »,\nPour le logement situé : {address},\nDate d'entrée dans les lieux : {date}.",
  corps:
    "Il a été convenu et arrêté ce qui suit. Article 1 — Objet : le présent contrat a pour objet de définir les règles de la vie commune et la répartition…",
};
const FALLBACK_BAIL: ContractOption[] = [
  {
    cle: "individuel",
    titre: "Bail individuel",
    description:
      "Chaque colocataire signe son propre contrat avec le propriétaire.",
  },
  {
    cle: "collectif",
    titre: "Bail collectif",
    description: "Un seul document signé par l'ensemble des parties.",
  },
];
const FALLBACK_SOLIDARITE: ContractOption[] = [
  {
    cle: "avec",
    titre: "AVEC clause de solidarité",
    description:
      "Tous les colocataires sont solidaires : si l'un manque, les autres sont redevables de l'ensemble du loyer.",
  },
  {
    cle: "sans",
    titre: "SANS clause de solidarité",
    description: "Chaque colocataire reste responsable de sa part seulement.",
  },
];
const FALLBACK_MAIL_NOTE = {
  contrat:
    "Le contrat finalisé te sera envoyé par e-mail à {email}. Tu n'auras plus qu'à le faire signer par l'ensemble des parties lors de la remise des clés. Pour compléter les informations nécessaires à la rédaction du contrat, rendez-vous dans ta messagerie.",
  edl: "Le document te sera envoyé par e-mail à {email}. Tu n'auras plus qu'à le faire signer par l'ensemble des parties lors de la remise des clés.",
};
function priceFromTiers(tiers: ContractTier[], loyer: number) {
  const list = tiers.length ? tiers : FALLBACK_TIERS;
  for (const tier of list) {
    if (tier.maxLoyer == null || loyer <= tier.maxLoyer) return tier.prix;
  }
  return list[list.length - 1].prix;
}
// Rend un gabarit DB : remplace {names}/{address}/{date}/{email} (valeurs en gras) et \n en <br/>.
function renderTemplate(tpl: string, vars: Record<string, string>) {
  return tpl.split(/(\{[a-z]+\}|\n)/g).map((part, i) => {
    if (part === "\n") return <br key={i} />;
    const m = part.match(/^\{([a-z]+)\}$/);
    if (m) return <b key={i}>{vars[m[1]] ?? part}</b>;
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function formatCountdown(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${days > 0 ? `${days}j ` : ""}${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
}

export default function Candidatures() {
  const { user, loading: authLoading } = useAuth();
  const { t, i18n } = useTranslation('candidatures');
  const { annonceId: paramsAnnonceId } = useParams<{ annonceId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const userName = useMemo(
    () => (user ? `${user.prenom || user.name || user.nom || t('common.you')}` : t('common.you')),
    [user, t],
  );

  //Extraire annonceId de l'URL si useParams ne fonctionne pas
  const getAnnonceIdFromUrl = () => {
    if (paramsAnnonceId) return paramsAnnonceId;

    const pathParts = location.pathname.split("/");
    const lastPart = pathParts[pathParts.length - 1];
    if (!isNaN(Number(lastPart)) && lastPart !== "") {
      return lastPart;
    }
    return undefined;
  };

  const queryAnnonceId = new URLSearchParams(location.search).get("annonceId");
  const annonceId = getAnnonceIdFromUrl() || queryAnnonceId || undefined;

  // États pour les données réelles
  const [realCandidatures, setRealCandidatures] = useState<any[]>([]);
  const [ownerCandidates, setOwnerCandidates] = useState<OwnerCandidate[]>([]);
  const [loadingCandidatures, setLoadingCandidatures] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [myCandidature, setMyCandidature] = useState<any>(null);
  const [showNotAppliedMessage, setShowNotAppliedMessage] = useState(false);
  const [isAnnonceOwner, setIsAnnonceOwner] = useState(false);
  const [candidateActionLoading, setCandidateActionLoading] = useState<
    number | null
  >(null);
  const [candidateActionFeedback, setCandidateActionFeedback] = useState("");
  const [completedMembers, setCompletedMembers] = useState<
    Array<{ nom: string; initiales?: string; statut?: string }>
  >([]);
  const [annonceData, setAnnonceData] = useState<ApiAnnonce | null>(null);
  const TARGET = annonceData?.total_colocataires ?? 3;

  // ===== NOUVEAUX ÉTATS POUR LES ÉQUIPES =====
  const [equipesReelles, setEquipesReelles] = useState<EquipeReelle[]>([]);
  const [loadingEquipes, setLoadingEquipes] = useState(false);
  const [showCreateEquipe, setShowCreateEquipe] = useState(false);
  const [newEquipeNom, setNewEquipeNom] = useState("");
  const [newEquipeAmbiance, setNewEquipeAmbiance] = useState("");

  // États UI existants
  const [activeView, setActiveView] = useState<
    "flux" | "track" | "cand" | "join" | "won" | "lost"
  >("flux");
  const [agentView, setAgentView] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [refusedOpen, setRefusedOpen] = useState(false);
  const [myTeam, setMyTeam] = useState<string | null>(null);
  const [joinTarget, setJoinTarget] = useState<string>(JOIN_DEFAULT);
  const [decision, setDecision] = useState<"validated" | null>(null);
  const [validatedTeamId, setValidatedTeamId] = useState<string | null>(null);
  const [waitDeadline, setWaitDeadline] = useState<number | null>(null);
  const [countdown, setCountdown] = useState("03h 00m 00s");
  const [wonMode, setWonMode] = useState<NotificationMode>("indiv");
  const [lostMode, setLostMode] = useState<NotificationMode>("indiv");
  const [createTitle, setCreateTitle] = useState("");
  const [createMood, setCreateMood] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [contractMode, setContractMode] = useState<"contrat" | "edl" | "both">(
    "contrat",
  );
  const [createdContractIds, setCreatedContractIds] = useState<number[]>([]);
  const [createdContracts, setCreatedContracts] = useState<
    ApiBackofficeContratDetails[]
  >([]);
  // Assistant contrat (maquette 3 etapes)
  const [contractStep, setContractStep] = useState<
    "offer" | "bail" | "contenu" | "paiement" | "done"
  >("offer");
  const [bailType, setBailType] = useState<"individuel" | "collectif" | null>(
    null,
  );
  const [solidarite, setSolidarite] = useState<"avec" | "sans">("avec");
  const [wantEdl, setWantEdl] = useState(false);
  const [moyenPaiement, setMoyenPaiement] = useState<string | null>(null);
  const [payRef, setPayRef] = useState("");
  const [contractSubmitting, setContractSubmitting] = useState(false);
  const [contractError, setContractError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<{
    reference: string;
    montant: number;
    paidCount?: number;
    total?: number;
    allPaid?: boolean;
  } | null>(null);
  const [pricing, setPricing] = useState<ContractConfig | null>(null);
  const [selectedContratOffer, setSelectedContratOffer] = useState<
    number | null
  >(null);
  const [selectedEdlOffer, setSelectedEdlOffer] = useState<number | null>(null);
  const [payContractId, setPayContractId] = useState<number | null>(null);
  const [myShare, setMyShare] = useState<number | null>(null);
  const [myContracts, setMyContracts] = useState<
    Awaited<ReturnType<typeof api.myContractsForAnnonce>>
  >([]);
  const [launchingOfficial, setLaunchingOfficial] = useState(false);
  const [officialFeedback, setOfficialFeedback] = useState<string | null>(null);
  const [officialLaunched, setOfficialLaunched] = useState(false);
  const [celebrateOpen, setCelebrateOpen] = useState(false);

  // États pour la discussion
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] =
    useState<OwnerCandidate | null>(null);
  const [chatMessages, setChatMessages] = useState<
    { who: string; txt: string }[]
  >([
    {
      who: t('common.you'),
      txt: t('chat.defaultMessage'),
    },
    {
      who: t('common.participant'),
      txt: t('chat.defaultReply'),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  // États pour la postulation
  const [showPostulerModal, setShowPostulerModal] = useState(false);
  const [candidatureMessage, setCandidatureMessage] = useState("");

  // États dérivés
  const ownerRetained = ownerCandidates.filter(
    (cand) => cand.status === "retained",
  );
  const ownerPending = ownerCandidates.filter(
    (cand) => cand.status === "pending",
  );
  const ownerRefused = ownerCandidates.filter(
    (cand) => cand.status === "refused",
  );
  const ownerFilled = ownerRetained.length;
  const winnerTeam =
    teams.find((team) => team.members.length >= TARGET) || null;
  const myTeamData = myTeam ? teams.find((team) => team.id === myTeam) : null;
  const validatedTeam = validatedTeamId
    ? teams.find((team) => team.id === validatedTeamId)
    : null;
  const activeWinner = decision === "validated" ? validatedTeam : winnerTeam;
  const isCourseFinished = Boolean(activeWinner || decision);
  const currentUserCandidature = useMemo(() => {
    if (!user?.id) return myCandidature;
    return (
      realCandidatures.find(
        (cand: any) => Number(cand.id_utilisateur) === Number(user.id),
      ) || myCandidature
    );
  }, [myCandidature, realCandidatures, user?.id]);
  const currentUserStatus = currentUserCandidature?.statut;
  const isCurrentUserRetained =
    currentUserStatus === "acceptee" || currentUserStatus === "signature";
  const isCurrentUserRefused = currentUserStatus === "refusee";
  const isOfficiallyLaunched =
    officialLaunched || annonceData?.statut === "terminee";
  const officialNotification =
    isOfficiallyLaunched && !isAnnonceOwner
      ? isCurrentUserRetained
        ? "won"
        : isCurrentUserRefused
          ? "lost"
          : null
      : null;

  // ===== CHARGEMENT DES DONNÉES RÉELLES =====
  const loadRealCandidatures = async () => {
    if (!annonceId) return;
    try {
      setLoadingCandidatures(true);
      console.log("🔍 Chargement des candidatures pour l'annonce:", annonceId);

      const data = await api.getCandidaturesByAnnonce(parseInt(annonceId));
      console.log("📊 Données reçues:", data.length, "candidatures");
      setRealCandidatures(data);

      try {
        const annonce = await api.annonce(annonceId);
        setAnnonceData(annonce);
        const currentUserId = Number(user?.id);
        setIsAnnonceOwner(Number(annonce.id_utilisateur) === currentUserId);
      } catch {
        setIsAnnonceOwner(false);
      }

      // 🔥 Transformer les données avec typage correct
      const formattedCandidates: OwnerCandidate[] = data.map((cand: any) => {
        let status: "pending" | "retained" | "refused" = "pending";

        if (cand.statut === "acceptee" || cand.statut === "signature") {
          status = "retained";
        } else if (cand.statut === "refusee") {
          status = "refused";
        } else {
          status = "pending";
        }

        return {
          id: String(cand.id_candidature),
          initials: (cand.prenom?.[0] || "") + (cand.nom?.[0] || ""),
          name: `${cand.prenom || ""} ${cand.nom || ""}`.trim() || t('realPanel.candidate'),
          subtitle: cand.email || t('realPanel.candidate'),
          status: status,
          id_candidature: cand.id_candidature,
          id_utilisateur: cand.id_utilisateur,
          message: cand.message,
          date_creation: cand.date_creation,
          email: cand.email,
          telephone: cand.telephone,
        };
      });

      setOwnerCandidates(formattedCandidates);

      if (user?.id) {
        const myCand = data.find(
          (c: any) => Number(c.id_utilisateur) === Number(user.id),
        );
        const hasAppliedNow = !!myCand;
        console.log(
          "🔍 Ma candidature trouvée:",
          hasAppliedNow ? "✅ OUI" : "❌ NON",
        );
        setHasApplied(hasAppliedNow);
        setMyCandidature(myCand || null);
        if (hasAppliedNow) {
          setShowNotAppliedMessage(false);
        }
      }
    } catch (error) {
      console.error("❌ Erreur chargement candidatures:", error);
    } finally {
      setLoadingCandidatures(false);
    }
  };

  // ===== CHARGEMENT DES ÉQUIPES =====
  const loadEquipes = async () => {
    if (!annonceId) return;
    try {
      setLoadingEquipes(true);
      console.log("🔍 Chargement des équipes pour l'annonce:", annonceId);

      const data = await api.getEquipesByAnnonce(parseInt(annonceId));
      console.log("📊 Équipes reçues:", data);
      setEquipesReelles(data);

      // Mettre à jour le state teams pour l'UI existante
      if (data.length > 0) {
        const formattedTeams: Team[] = data.map((equipe: EquipeReelle) => ({
          id: String(equipe.id_equipe),
          title: equipe.nom,
          mood: equipe.ambiance || t('cand.vibePlaceholder'),
          members: equipe.membres.map((m) => {
            const fullName =
              `${m.prenom} ${m.nom}`.trim() || m.email || t('cand.member');
            return fullName;
          }),
          chat: equipe.membres.map((m) => ({
            who: `${m.prenom} ${m.nom}`.trim() || m.email || t('cand.member'),
            txt: `${m.statut === "owner" ? t('cand.creatorBadge') : m.statut === "accepted" ? "✅ " + t('cand.member') : "⏳ " + t('statuts.enAttente')}`,
          })),
        }));
        setTeams(formattedTeams);
      }
    } catch (error) {
      console.error("❌ Erreur chargement équipes:", error);
    } finally {
      setLoadingEquipes(false);
    }
  };

  // ===== GESTION DES ÉQUIPES =====
  const handleCreateEquipe = async () => {
    if (!annonceId || !newEquipeNom.trim()) {
      alert(t('cand.teamNameRequired'));
      return;
    }

    try {
      const data = await api.createEquipe({
        id_annonce: parseInt(annonceId),
        id_depot_annonce: parseInt(annonceId),
        nom: newEquipeNom.trim(),
        ambiance: newEquipeAmbiance.trim() || null,
        statut: "forming",
      });

      console.log("✅ Équipe créée:", data);
      setShowCreateEquipe(false);
      setNewEquipeNom("");
      setNewEquipeAmbiance("");
      await loadEquipes();
      alert(t('cand.teamCreated'));
    } catch (error: any) {
      console.error("❌ Erreur création équipe:", error);
      alert(error?.message || t('cand.teamCreationError'));
    }
  };

  const handleJoinEquipe = async (equipeId: number) => {
    if (!user) {
      alert(t('cand.loginToJoin'));
      return;
    }

    try {
      await api.addMemberToEquipe(equipeId, user.id);
      await loadEquipes();
      alert(t('cand.joinedTeam'));
    } catch (error: any) {
      console.error("❌ Erreur:", error);
      alert(error?.message || t('cand.joinError'));
    }
  };

  const handleLeaveEquipe = async (equipeId: number) => {
    if (!user) {
      alert(t('common.loading'));
      return;
    }

    if (!confirm(t('cand.leaveTeamConfirm'))) return;

    try {
      await api.removeMemberFromEquipe(equipeId, user.id);
      await loadEquipes();
      alert(t('cand.leftTeam'));
    } catch (error: any) {
      console.error("❌ Erreur:", error);
      alert(error?.message || t('cand.leaveError'));
    }
  };

  // ===== VÉRIFIER SI L'UTILISATEUR A POSTULÉ =====
  const checkIfUserApplied = async () => {
    if (!annonceId || !user?.id) {
      console.log("❌ checkIfUserApplied: annonceId ou user manquant");
      return;
    }

    try {
      console.log("🔍 Vérification via API pour:", {
        annonceId,
        userId: user.id,
      });

      const result = await api.checkUserApplied(parseInt(annonceId), user.id);
      console.log("✅ Résultat checkUserApplied:", result);

      const hasAppliedNow = result.hasApplied === true;
      setHasApplied(hasAppliedNow);
      console.log("🔍 hasApplied mis à jour:", hasAppliedNow);

      if (hasAppliedNow) {
        setShowNotAppliedMessage(false);
      }
    } catch (error) {
      console.error("❌ Erreur vérification:", error);
      if (user?.id && realCandidatures.length > 0) {
        const myCand = realCandidatures.find(
          (c: any) => Number(c.id_utilisateur) === Number(user.id),
        );
        setHasApplied(!!myCand);
        console.log("🔍 hasApplied défini depuis realCandidatures:", !!myCand);
      }
    }
  };

  // ===== POSTULER =====
  const handlePostuler = async () => {
    console.log("🔵 === DÉBUT handlePostuler ===");
    console.log("🔵 user:", user);
    console.log("🔵 annonceId:", annonceId);

    if (!user) {
      alert(t('common.loading'));
      return;
    }

    if (!annonceId) {
      alert(t('realPanel.empty'));
      return;
    }

    try {
      const payload = {
        id_annonce: parseInt(annonceId),
        id_depot_annonce: parseInt(annonceId),
        message:
          candidatureMessage || t('modals.applyPlaceholder'),
        statut: "envoyee",
      };

      console.log("📤 PAYLOAD COMPLET:", JSON.stringify(payload, null, 2));

      const result = await api.createCandidature(payload);
      console.log("✅ SUCCÈS:", result);

      // 🔥 Le bouton change immédiatement en "Voir ma candidature"
      setHasApplied(true);
      setShowNotAppliedMessage(false);
      setShowPostulerModal(false);
      setCandidatureMessage("");
      alert(t('realPanel.alreadyApplied'));
      await loadRealCandidatures();
    } catch (error: any) {
      console.error("❌ ERREUR DÉTAILLÉE:", error);
      console.error("❌ Response:", error.response);
      console.error("❌ Data:", error.response?.data);
      console.error("❌ Status:", error.response?.status);

      if (error.response?.data?.message) {
        alert(`❌ ${error.response.data.message}`);
      } else {
        alert(t('common.loading'));
      }
    }
    console.log("🔵 === FIN handlePostuler ===");
  };

  const handleCandidateDecision = async (
    candidateId: number,
    action: "accept" | "refuse" | "discuss",
    message?: string,
  ) => {
    if (!candidateId) return;
    setCandidateActionLoading(candidateId);
    setCandidateActionFeedback("");
    try {
      await api.decideCandidature(candidateId, action, message);

      setOwnerCandidates((prev) =>
        prev.map((candidate) => {
          if (candidate.id_candidature !== candidateId) return candidate;
          if (action === "accept") {
            return { ...candidate, status: "retained" };
          }
          if (action === "refuse") {
            return { ...candidate, status: "refused" };
          }
          return candidate;
        }),
      );

      setRealCandidatures((prev) =>
        prev.map((candidate) => {
          if (candidate.id_candidature !== candidateId) return candidate;
          return {
            ...candidate,
            statut:
              action === "accept"
                ? "signature"
                : action === "refuse"
                  ? "refusee"
                  : candidate.statut,
          };
        }),
      );

      setCandidateActionFeedback(
        action === "accept"
          ? t('realPanel.accepted')
          : action === "refuse"
            ? t('realPanel.refused')
            : t('realPanel.discuss'),
      );
      await loadRealCandidatures();
    } catch (error: any) {
      console.error("❌ Erreur action candidature:", error);
      setCandidateActionFeedback(
        error?.message || t('common.loading'),
      );
    } finally {
      setCandidateActionLoading(null);
    }
  };

  const handleDeleteCandidature = async (candidateId: number) => {
    if (!candidateId) return;
    const confirmed = window.confirm(t('realPanel.deleteTitle'));
    if (!confirmed) return;

    setCandidateActionLoading(candidateId);
    setCandidateActionFeedback("");
    try {
      await api.deleteCandidature(candidateId);
      setRealCandidatures((prev) =>
        prev.filter((candidate) => candidate.id_candidature !== candidateId),
      );
      setOwnerCandidates((prev) =>
        prev.filter((candidate) => candidate.id_candidature !== candidateId),
      );
      setCandidateActionFeedback(t('realPanel.deleteTitle'));
    } catch (error: any) {
      setCandidateActionFeedback(
        error?.message || t('common.loading'),
      );
    } finally {
      setCandidateActionLoading(null);
    }
  };

  const handleLaunchColocationFromPage = async () => {
    if (!annonceId) return false;
    try {
      const result = await api.launchColocation(annonceId);
      const members = Array.isArray((result as any).membres)
        ? (result as any).membres.map((member: any) => ({
            nom: member.nom || member.prenom || member.email || t('cand.member'),
            initiales:
              member.initiales ||
              [member.prenom, member.nom]
                .filter(Boolean)
                .map((value: string) => value.charAt(0))
                .join("")
                .slice(0, 2)
                .toUpperCase(),
            statut: member.statut || "active",
          }))
        : [];
      setCompletedMembers(members);
      setCandidateActionFeedback(t('track.membersValidatedTitle'));
      await loadRealCandidatures();
      return true;
    } catch (error: any) {
      setCandidateActionFeedback(
        error?.message || t('common.loading'),
      );
      return false;
    }
  };

  // ===== VOIR MA CANDIDATURE =====
  const handleViewMyCandidature = () => {
    if (!user) {
      alert(t('common.loading'));
      return;
    }

    if (hasApplied) {
      // 🔥 Rediriger vers la page des candidatures
      navigate(`/candidatures?annonceId=${annonceId}`);
    } else {
      // Afficher le message "Vous n'avez pas encore postulé"
      setShowNotAppliedMessage(true);
      setTimeout(() => {
        setShowNotAppliedMessage(false);
      }, 5000);
    }
  };

  // ===== EFFETS =====
  useEffect(() => {
    if (winnerTeam && !decision && !waitDeadline) {
      setWaitDeadline(Date.now() + 3 * 864e5);
    }
  }, [winnerTeam, decision, waitDeadline]);

  useEffect(() => {
    if (!waitDeadline || decision) return;
    const timer = window.setInterval(() => {
      const left = waitDeadline - Date.now();
      setCountdown(formatCountdown(left));
      if (left <= 0) {
        window.clearInterval(timer);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [waitDeadline, decision]);

  useEffect(() => {
    setCountdown(
      waitDeadline ? formatCountdown(waitDeadline - Date.now()) : "03h 00m 00s",
    );
  }, [waitDeadline]);

  // ===== CHARGER LES DONNÉES AU MONTAGE =====
  useEffect(() => {
    console.log(
      "🔄 [1] useEffect chargement - annonceId:",
      annonceId,
      "userId:",
      user?.id,
      "authLoading:",
      authLoading,
    );
    console.log("🔄 [1] URL actuelle:", location.pathname);

    if (!annonceId || authLoading) return;

    const loadAllData = async () => {
      await Promise.all([loadRealCandidatures(), loadEquipes()]);
    };

    loadAllData();
  }, [annonceId, user?.id, authLoading]);

  // 🔥 VÉRIFIER SI L'UTILISATEUR A POSTULÉ
  useEffect(() => {
    console.log(
      "🔄 [2] useEffect vérification - user:",
      user?.id,
      "realCandidatures:",
      realCandidatures.length,
    );

    if (user?.id && realCandidatures.length > 0) {
      const myCand = realCandidatures.find(
        (c: any) => Number(c.id_utilisateur) === Number(user.id),
      );
      const hasAppliedNow = !!myCand;
      console.log(
        "🔍 Ma candidature trouvée:",
        hasAppliedNow ? "✅ OUI" : "❌ NON",
      );

      if (hasApplied !== hasAppliedNow) {
        setHasApplied(hasAppliedNow);
        setMyCandidature(myCand || null);
        if (hasAppliedNow) {
          setShowNotAppliedMessage(false);
        }
      }
    } else if (user?.id && realCandidatures.length === 0) {
      console.log("🔍 Aucune candidature trouvée pour cette annonce");
      setHasApplied(false);
    }
  }, [realCandidatures, user?.id]);

  // 🔥 APPEL DE VÉRIFICATION AU CHARGEMENT INITIAL (pour les reconnexions)
  useEffect(() => {
    console.log("🔄 [3] useEffect vérification initiale - user:", user?.id);
    console.log("🔄 [3] annonceId:", annonceId);

    if (annonceId && user?.id) {
      checkIfUserApplied();
    }
  }, []);

  // ===== FONCTIONS UI =====
  const ownerModeClass = "rounded-2xl border border-border bg-card";
  const activeButtonClass = "bg-brand-cyan text-white border border-brand-cyan";
  const inactiveButtonClass =
    "bg-card text-muted-foreground border border-border hover:border-brand-cyan";

  function changeView(view: typeof activeView) {
    if (officialNotification === "won" && view === "lost") return;
    if (officialNotification === "lost" && view === "won") return;
    setActiveView(view);
    if (view === "join" && !joinTarget) setJoinTarget(JOIN_DEFAULT);
  }

  useEffect(() => {
    if (!officialNotification) return;
    if (activeView !== officialNotification) {
      setActiveView(officialNotification);
    }
  }, [activeView, officialNotification]);

  async function acceptCandidate(id: string) {
    const candidate = ownerCandidates.find((cand) => cand.id === id);
    if (!candidate?.id_candidature) return;
    if (ownerFilled >= TARGET) {
      alert(t('track.teamCompleteTitle'));
      return;
    }
    await handleCandidateDecision(candidate.id_candidature, "accept");
  }

  async function refuseCandidate(id: string) {
    const candidate = ownerCandidates.find((cand) => cand.id === id);
    if (!candidate?.id_candidature) return;
    await handleCandidateDecision(candidate.id_candidature, "refuse");
  }

  function restoreCandidate(id: string) {
    setOwnerCandidates((prev) =>
      prev.map((cand) =>
        cand.id === id ? { ...cand, status: "pending" } : cand,
      ),
    );
  }

  async function launchColoc() {
    if (!user) {
      setCandidateActionFeedback(
        t('common.loading'),
      );
      return;
    }

    if (ownerFilled < TARGET) return;
    const launched = await handleLaunchColocationFromPage();
    if (!launched) return;
    openContractWizard();
  }

  const monthlyRent = Number(annonceData?.chambre?.prix_loyer) || 450000;

  // Contenu du contrat : valeurs DB si chargees, sinon repli.
  const activeTiers = pricing?.tiers?.length ? pricing.tiers : FALLBACK_TIERS;
  const activeEdlPrix = pricing?.edlPrix ?? FALLBACK_EDL_PRIX;
  const mobileMoneyList = pricing?.mobileMoney?.length
    ? pricing.mobileMoney
    : FALLBACK_MOBILE_MONEY;
  // Offres de contrat / EDL (services_ckoo). Le deposant choisit seulement le TYPE
  // (contrat / EDL / les deux) ; TOUTES les offres du type sont incluses, total = leur SOMME.
  const activeContratOffers = pricing?.contratOffers ?? [];
  const activeEdlOffers = pricing?.edlOffers ?? [];
  const contractPrice = activeContratOffers.reduce(
    (s, o) => s + (o.prix || 0),
    0,
  );
  const edlPrice = activeEdlOffers.reduce((s, o) => s + (o.prix || 0), 0);
  const activeClauses = pricing?.clauses?.length
    ? pricing.clauses
    : FALLBACK_CLAUSES;
  const activeOffer = pricing?.offer ?? FALLBACK_OFFER;
  const activeBody = pricing?.body ?? FALLBACK_BODY;
  const activeBail = pricing?.bail?.length ? pricing.bail : FALLBACK_BAIL;
  const activeSolidarite = pricing?.solidarite?.length
    ? pricing.solidarite
    : FALLBACK_SOLIDARITE;
  const activeMailNote = pricing?.mailNote ?? FALLBACK_MAIL_NOTE;

  // Logement reel (annonce) — remplace les valeurs demo codees en dur.
  const logementTitre = annonceData?.titre || t('common.emptyDash');
  const logementResume = [
    annonceData?.type_propriete,
    annonceData?.surface_totale ? `${annonceData.surface_totale} m²` : null,
    `${TARGET} colocataire${TARGET > 1 ? "s" : ""}`,
  ]
    .filter(Boolean)
    .join(" · ");
  const moveInLabel = annonceData?.chambre?.date_disponibilite
    ? new Date(annonceData.chambre.date_disponibilite).toLocaleDateString(
        "fr-FR",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        },
      )
    : MOVEIN;
  const currentCandidateName =
    [currentUserCandidature?.prenom, currentUserCandidature?.nom]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    currentUserCandidature?.email ||
    userName;
  const retainedCandidateNames = ownerRetained
    .map((cand) => cand.name)
    .filter(Boolean);
  const retainedTeamLabel =
    retainedCandidateNames.length > 0
      ? retainedCandidateNames.join(", ")
      : activeWinner?.members.join(", ") || t('contract.parties');
  const retainedTeamTitle = activeWinner?.title || t('contract.parties');
  const wonIndividualMessage = t('notifications.congratsName', { name: currentCandidateName }) + " " + t('notifications.moveIn') + " " + moveInLabel + ".";
  const wonGroupMessage = t('notifications.congratsTeam', { team: retainedTeamTitle }) + " " + t('notifications.moveIn') + " " + moveInLabel + ".";
  const lostIndividualMessage = t('notifications.notThisTime') + " " + logementTitre + ".";
  const lostGroupMessage = t('notifications.thanksApplication') + " " + logementTitre + ".";

  useEffect(() => {
    api
      .contractConfig()
      .then((cfg) => {
        setPricing(cfg);
        if (cfg.contratOffers?.[0])
          setSelectedContratOffer(cfg.contratOffers[0].id);
        if (cfg.edlOffers?.[0]) setSelectedEdlOffer(cfg.edlOffers[0].id);
      })
      .catch(() => {});
  }, []);

  // Contrats visibles par le colocataire (sa part + s'il a paye).
  function refreshMyContracts() {
    if (!user || !annonceId) {
      setMyContracts([]);
      return;
    }
    api
      .myContractsForAnnonce(annonceId)
      .then(setMyContracts)
      .catch(() => setMyContracts([]));
  }
  useEffect(() => {
    refreshMyContracts();
  }, [user, annonceId]);

  // Le deposant lance OFFICIELLEMENT la colocation (backend verifie que tous ont paye).
  async function launchOfficial() {
    if (!annonceId) return;
    setLaunchingOfficial(true);
    setOfficialFeedback(null);
    try {
      const res = await api.lancerColocationOfficielle(annonceId);
      setOfficialFeedback(res.message);
      setOfficialLaunched(true);
      setAnnonceData((prev) => (prev ? { ...prev, statut: "terminee" } : prev));
      refreshMyContracts();
    } catch (error: any) {
      setOfficialFeedback(
        error?.message || t('common.loading'),
      );
    } finally {
      setLaunchingOfficial(false);
    }
  }

  // Le colocataire ouvre directement l'etape paiement pour regler SA part.
  function payMyShare(c: {
    id_contrat: number;
    ma_part: number;
    type: "contrat" | "edl";
  }) {
    setContractMode(c.type === "edl" ? "edl" : "contrat");
    setPayContractId(c.id_contrat);
    setMyShare(c.ma_part);
    setCreatedContracts([]);
    setMoyenPaiement(null);
    setPayRef("");
    setContractError(null);
    setPaymentInfo(null);
    setContractStep("paiement");
    setContractModalOpen(true);
  }

  // Montant apercu = somme des offres services_ckoo du type (le backend recalcule et fait foi).
  function previewAmount(mode: "contrat" | "edl" | "both") {
    if (mode === "edl") return edlPrice;
    return contractPrice + (mode === "both" ? edlPrice : 0);
  }

  function openContractWizard() {
    setContractMode("contrat");
    setBailType(null);
    setSolidarite("avec");
    setWantEdl(false);
    setMoyenPaiement(null);
    setPayRef("");
    setContractError(null);
    setPaymentInfo(null);
    setCreatedContractIds([]);
    setCreatedContracts([]);
    setPayContractId(null);
    setMyShare(null);
    setContractStep("offer");
    setContractModalOpen(true);
  }

  function closeContractModal() {
    setContractModalOpen(false);
  }

  // Etape 0 : choix de l'offre (contrat / EDL / les deux).
  // Le type de bail + la solidarite sont HERITES de l'annonce (cahier des charges) :
  // on ne les redemande plus, on les reprend tels quels.
  function chooseOffer(mode: "contrat" | "edl" | "both") {
    setContractMode(mode);
    setContractError(null);
    setWantEdl(mode === "both");
    setBailType(
      (annonceData?.type_bail as "individuel" | "collectif") || "collectif",
    );
    setSolidarite(
      (annonceData?.clause_solidarite as "avec" | "sans") || "sans",
    );
    setContractStep("contenu");
  }

  // Etape 2 -> recap : NE SAUVEGARDE PAS. L'enregistrement se fait au clic sur "Terminer".
  function goPaiement() {
    setContractError(null);
    setPayContractId(null);
    setMyShare(null);
    setPaymentInfo(null);
    setCreatedContracts([]);
    setContractStep("done");
  }

  // "Terminer" (deposant) : enregistre reellement le contrat, puis affiche la synthese.
  async function finalizeContract() {
    if (!annonceId) return;
    // Le mode = le TYPE choisi par le deposant (le prix = somme des offres du type, calcule backend).
    const effectiveMode = contractMode;
    setContractSubmitting(true);
    setContractError(null);
    try {
      const options =
        effectiveMode === "edl"
          ? {}
          : { type_bail: bailType, clause_solidarite: solidarite };
      const result = await api.createContracts(
        annonceId,
        effectiveMode,
        options,
      );
      const contracts = Array.isArray(result.contracts) ? result.contracts : [];
      setCreatedContractIds(
        Array.isArray(result.contratIds) ? result.contratIds : [],
      );
      setCreatedContracts(contracts);
      refreshMyContracts();
      setContractModalOpen(false);
      setCelebrateOpen(true);
    } catch (error: any) {
      setContractError(
        error?.message || t('common.loading'),
      );
    } finally {
      setContractSubmitting(false);
    }
  }

  // Etape 3 : enregistre le paiement Mobile Money manuel
  async function confirmPayment() {
    if (!moyenPaiement) {
      setContractError(t('contract.paymentMethod'));
      return;
    }
    if (payRef.trim().length < 4) {
      setContractError(t('contract.paymentRef'));
      return;
    }
    const contractId = payContractId ?? createdContracts[0]?.id_contrat;
    if (!contractId) {
      setContractError(t('common.emptyDash'));
      return;
    }
    const total = createdContracts.reduce(
      (sum, c) => sum + Number(c.montant_total || 0),
      0,
    );
    setContractSubmitting(true);
    setContractError(null);
    try {
      // Le backend recalcule la part cote serveur (pas besoin d'envoyer le montant).
      const res = await api.submitContractPayment(contractId, {
        moyen_paiement: moyenPaiement as "MVOLA" | "Orange Money",
        reference_operateur: payRef.trim(),
      });
      setPaymentInfo({
        reference: res.reference,
        montant: res.montant ?? myShare ?? total,
        paidCount: res.paidCount,
        total: res.total,
        allPaid: res.allPaid,
      });
      setContractStep("done");
      refreshMyContracts();
    } catch (error: any) {
      setContractError(
        error?.message || t('common.loading'),
      );
    } finally {
      setContractSubmitting(false);
    }
  }

  // Ignorer l'offre : ferme l'assistant et affiche la synthese
  function ignoreOffer() {
    setContractModalOpen(false);
    setCelebrateOpen(true);
  }

  // Ouvre le vrai document (HTML imprimable) genere par le backend depuis le gabarit DB.
  async function openContractDocument(contratId: number) {
    try {
      const html = await api.getContractDocument(contratId);
      const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error: any) {
      setContractError(error?.message || t('common.loading'));
    }
  }

  function toggleAgentView() {
    setAgentView((prev) => !prev);
  }

  function validateTeam(id: string) {
    setDecision("validated");
    setValidatedTeamId(id);
    setCelebrateOpen(true);
  }

  function simulateComplete() {
    setTeams((prev) => {
      const current = [...prev];
      const targetTeam =
        current.find((team) => team.members.length < TARGET) || current[0];
      const pool = [
        "Hery A.",
        "Naina R.",
        "Lova V.",
        "Sitraka R.",
        "Miora H.",
        "Rado A.",
      ];
      let index = 0;
      while (targetTeam.members.length < TARGET) {
        const candidate = pool[index++ % pool.length];
        if (!targetTeam.members.includes(candidate)) {
          targetTeam.members = [...targetTeam.members, candidate];
        }
      }
      return current;
    });
  }

function openChat(candidate: any) {
  // Normalise : accepte soit un OwnerCandidate (name/initials/subtitle),
  // soit un candidat brut venant de l'API (prenom/nom/email/id_candidature)
  const normalized: OwnerCandidate = candidate.name
    ? candidate
    : {
        id: String(candidate.id_candidature ?? candidate.id ?? ""),
        id_candidature: candidate.id_candidature,
        id_utilisateur: candidate.id_utilisateur,
        initials: (candidate.prenom?.[0] || "") + (candidate.nom?.[0] || ""),
        name: `${candidate.prenom || ""} ${candidate.nom || ""}`.trim() || t('realPanel.candidate'),
        subtitle: candidate.email || t('realPanel.candidate'),
        status: "pending",
        email: candidate.email,
        telephone: candidate.telephone,
        message: candidate.message,
        date_creation: candidate.date_creation,
      };

  setSelectedCandidate(normalized);
  setChatMessages([
    {
      who: t('common.you'),
      txt: t('chat.defaultMessage'),
    },
    {
      who: normalized.name,
      txt: t('chat.defaultReply'),
    },
  ]);
  setChatModalOpen(true);
}

  function closeChat() {
    setChatModalOpen(false);
    setSelectedCandidate(null);
    setNewMessage("");
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedCandidate?.id_candidature) return;
    const message = newMessage.trim();
    setNewMessage("");
    try {
      await handleCandidateDecision(
        selectedCandidate.id_candidature,
        "discuss",
        message,
      );
      setChatMessages((prev) => [...prev, { who: t('common.you'), txt: message }]);
      setChatModalOpen(false);
      setSelectedCandidate(null);
      navigate("/compte?tab=messages"); // ✅ redirige vers la section messages
    } catch {
      setChatMessages((prev) => [...prev, { who: t('common.you'), txt: message }]);
    }
  }

  function joinTeam(id: string) {
    setTeams((prev) =>
      prev.map((team) =>
        team.id === id
          ? { ...team, members: [...team.members, userName] }
          : team,
      ),
    );
    setMyTeam(id);
  }

  function switchTeam(id: string) {
    if (!myTeam) return;
    setTeams((prev) =>
      prev.map((team) => {
        if (team.id === myTeam) {
          return {
            ...team,
            members: team.members.filter((member) => member !== userName),
          };
        }
        if (team.id === id) {
          return { ...team, members: [...team.members, userName] };
        }
        return team;
      }),
    );
    setMyTeam(id);
  }

  function leaveTeam(id: string) {
    setTeams((prev) =>
      prev.map((team) =>
        team.id === id
          ? {
              ...team,
              members: team.members.filter((member) => member !== userName),
            }
          : team,
      ),
    );
    setMyTeam(null);
  }

  function createTeam() {
    const title = createTitle.trim() || t('cand.teamNamePlaceholder');
    const mood = createMood.trim() || t('cand.vibePlaceholder');
    const newTeam: Team = {
      id: `t${Date.now()}`,
      title,
      mood,
      members: [userName],
      chat: [
        {
          who: userName,
          txt: t('cand.teamCreated'),
        },
      ],
    };
    setTeams((prev) => [...prev, newTeam]);
    setMyTeam(newTeam.id);
    setCreateTitle("");
    setCreateMood("");
    setCreateOpen(false);
  }

  function openCelebrate() {
    setCelebrateOpen(true);
  }

  function closeCelebrate() {
    setCelebrateOpen(false);
  }

  function renderAvStack(members: string[]) {
    return <CandidateAvatarStack members={members} target={TARGET} />;
  }

  function renderJoinTeam() {
    return (
      <JoinTeamView
        teams={teams}
        joinTarget={joinTarget}
        target={TARGET}
        onJoinTeam={(teamId) => {
          joinTeam(teamId);
          setActiveView("cand");
        }}
        onBackToTeams={() => setActiveView("cand")}
      />
    );
  }
  function renderRealCandidatures() {
    if (loadingCandidatures) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-cyan"></div>
        </div>
      );
    }

    if (realCandidatures.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          🏠 {t('realPanel.empty')}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-lg font-semibold">
            👥 {realCandidatures.length} {t('realPanel.candidate', { count: realCandidatures.length })}
          </h3>
        </div>

        {candidateActionFeedback ? (
          <div className="rounded-2xl border border-brand-cyan/20 bg-brand-cyan-light/30 px-4 py-3 text-sm text-brand-cyan-dark">
            {candidateActionFeedback}
          </div>
        ) : null}

        {realCandidatures.map((candidat) => {
          const isCurrentUser = candidat.id_utilisateur === user?.id;
          const canManageCandidate = Boolean(
            user &&
            !isCurrentUser &&
            (user.poste === "proprietaire" ||
              user.poste === "superadmin" ||
              user.poste === "admin" ||
              user.poste === "moderateur") &&
            isAnnonceOwner,
          );
          const canDiscuss = Boolean(user);
          const canDeleteCandidate = Boolean(
            user &&
            (user.poste === "proprietaire" ||
              user.poste === "superadmin" ||
              user.poste === "admin" ||
              user.poste === "moderateur") &&
            (isAnnonceOwner || isCurrentUser),
          );
          return (
            <div
              key={candidat.id_candidature}
              className={`rounded-3xl border p-4 hover:shadow-md transition-shadow ${
                isCurrentUser
                  ? "border-brand-cyan bg-brand-cyan-light/10"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-brand-cyan text-white flex items-center justify-center font-semibold text-lg flex-shrink-0">
                  {(candidat.prenom?.[0] || "?") + (candidat.nom?.[0] || "")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold flex items-center gap-2 flex-wrap">
                    {candidat.prenom} {candidat.nom}
                    {isCurrentUser && (
                      <span className="text-xs bg-brand-cyan-light text-brand-cyan-dark px-2 py-0.5 rounded-full">
                        {t('realPanel.me')}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {candidat.email}
                  </div>
                  {candidat.message && (
                    <div className="mt-2 text-sm bg-gray-50 p-2 rounded-xl border border-gray-100">
                      💬 "{candidat.message}"
                    </div>
                  )}
                  <div className="mt-1 flex items-center gap-4 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      📅{" "}
                      {new Date(candidat.date_creation).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        candidat.statut === "acceptee" ||
                        candidat.statut === "signature"
                          ? "bg-green-100 text-green-700"
                          : candidat.statut === "refusee"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {candidat.statut === "acceptee" ||
                      candidat.statut === "signature"
                        ? "✅ " + t('statuts.accepte')
                        : candidat.statut === "refusee"
                          ? "❌ " + t('statuts.refuse')
                          : "⏳ " + t('statuts.enAttente')}
                    </span>
                  </div>
                  {canDiscuss || canManageCandidate ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openChat(candidat as OwnerCandidate)}
                        disabled={
                          candidateActionLoading === candidat.id_candidature
                        }
                        className="rounded-2xl border border-border bg-card px-3 py-2 text-sm font-semibold text-brand-cyan-dark hover:bg-brand-cyan-light disabled:opacity-60"
                      >
                        {candidateActionLoading === candidat.id_candidature
                          ? t('common.loading')
                          : t('realPanel.discuss')}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleCandidateDecision(
                            candidat.id_candidature,
                            "accept",
                          )
                        }
                        disabled={
                          !canManageCandidate ||
                          candidateActionLoading === candidat.id_candidature
                        }
                        className="rounded-2xl bg-brand-green px-3 py-2 text-sm font-semibold text-white hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
                      >
                        {t('realPanel.accept')}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleCandidateDecision(
                            candidat.id_candidature,
                            "refuse",
                          )
                        }
                        disabled={
                          !canManageCandidate ||
                          candidateActionLoading === candidat.id_candidature
                        }
                        className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        {t('realPanel.refuse')}
                      </button>
                      {canDeleteCandidate ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteCandidature(candidat.id_candidature)
                          }
                          disabled={
                            candidateActionLoading === candidat.id_candidature
                          }
                          className="rounded-2xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          title={t('realPanel.deleteTitle')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto min-h-[calc(100vh-120px)] max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-3 border-b border-border pb-3">
          <CandidaturesViewButtons
            activeView={activeView}
            onChangeView={changeView}
            activeButtonClass={activeButtonClass}
            inactiveButtonClass={inactiveButtonClass}
            officialNotification={officialNotification}
          />
        </div>
        
        {!(activeView === "flux" && isAnnonceOwner) && (
          <CandidaturesHeader
            activeView={activeView}
            onChangeView={changeView}
            activeButtonClass={activeButtonClass}
            inactiveButtonClass={inactiveButtonClass}
            officialNotification={officialNotification}
          />
        )}
        
        {!authLoading && !user ? (
          <div className="mt-8 rounded-3xl border border-border bg-card p-8 text-center">
            <p className="text-lg font-semibold">
              {t('common.loading')}
            </p>
            <p className="mt-2 text-muted-foreground">
              {t('common.loading')}
            </p>
            <Link
              to="/auth?mode=signin&redirect=/candidatures"
              className="mt-6 inline-flex rounded-2xl bg-brand-cyan px-6 py-3 text-sm font-semibold text-white hover:bg-brand-cyan-dark"
            >
              {t('common.loading')}
            </Link>
          </div>
        ) : authLoading ? (
          <div className="mt-8 rounded-3xl border border-border bg-card p-8 text-center text-muted-foreground">
            {t('common.loading')}
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {activeView === "flux" && !isAnnonceOwner && (
              <RealCandidaturesPanel
                annonceId={annonceId}
                candidateActionFeedback={candidateActionFeedback}
                candidateActionLoading={candidateActionLoading}
                hasApplied={hasApplied}
                isAnnonceOwner={isAnnonceOwner}
                loadingCandidatures={loadingCandidatures}
                realCandidatures={realCandidatures}
                showNotAppliedMessage={showNotAppliedMessage}
                user={user}
                onCandidateDecision={handleCandidateDecision}
                onDeleteCandidature={handleDeleteCandidature}
                onOpenChat={openChat}
                onPostuler={() => setShowPostulerModal(true)}
                onViewMyCandidature={handleViewMyCandidature}
              />
            )}
            {/* ===== SECTION ÉQUIPES RÉELLES ===== */}
            {activeView === "cand" && (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                  <h2 className="bebas text-2xl">{t('cand.title')}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCreateEquipe(!showCreateEquipe)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-brand-cyan px-4 py-2 text-sm font-semibold text-white hover:bg-brand-cyan-dark transition-colors"
                    >
                      <UserPlus className="h-4 w-4" />
                      {t('cand.createTeam')}
                    </button>
                  </div>
                </div>

                {loadingEquipes ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-cyan"></div>
                  </div>
                ) : equipesReelles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    🏠 {t('empty.equipes')}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {equipesReelles.map((equipe) => {
                      const membres = equipe.membres || [];
                      const totalPlaces = annonceData?.total_colocataires || 3;
                      const isFull = membres.length >= totalPlaces;
                      const isCurrentUserInTeam = membres.some(
                        (m) => m.id_utilisateur === user?.id,
                      );
                      const isOwner = membres.some(
                        (m) =>
                          m.id_utilisateur === user?.id && m.statut === "owner",
                      );

                      return (
                        <div
                          key={equipe.id_equipe}
                          className={`rounded-3xl border p-5 ${
                            isCurrentUserInTeam
                              ? "border-brand-green bg-brand-green-light/20"
                              : "border-border bg-card"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h3 className="bebas text-xl">{equipe.nom}</h3>
                              <div className="text-sm text-muted-foreground">
                                {t('cand.membersCount', { count: membres.length, total: totalPlaces })}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                  equipe.statut === "complete"
                                    ? "bg-green-100 text-green-700"
                                    : equipe.statut === "selected"
                                      ? "bg-blue-100 text-blue-700"
                                      : equipe.statut === "rejected"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {equipe.statut === "complete"
                                  ? t('statuts.complete')
                                  : equipe.statut === "selected"
                                    ? t('statuts.selectionnee')
                                    : equipe.statut === "rejected"
                                      ? t('statuts.rejetee')
                                      : t('statuts.enFormation')}
                              </span>
                              {isOwner && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                  {t('statuts.createur')}
                                </span>
                              )}
                            </div>
                          </div>

                          {equipe.ambiance && (
                            <div className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                              {equipe.ambiance}
                            </div>
                          )}

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            {membres.map((membre, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold ring-2 ring-white ${
                                    membre.statut === "owner"
                                      ? "bg-amber-500 text-white"
                                      : membre.statut === "accepted"
                                        ? "bg-brand-green text-white"
                                        : "bg-brand-cyan text-white"
                                  }`}
                                >
                                  {membre.initials || "?"}
                                </div>
                                <span className="text-xs truncate max-w-[80px]">
                                  {membre.prenom ||
                                    membre.nom ||
                                    membre.email?.split("@")[0] ||
                                    t('cand.member')}
                                  {membre.statut === "owner" && " 👑"}
                                </span>
                              </div>
                            ))}
                            {Array.from({
                              length: Math.max(0, totalPlaces - membres.length),
                            }).map((_, idx) => (
                              <div
                                key={`empty-${idx}`}
                                className="h-10 w-10 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground text-sm ring-2 ring-white"
                              >
                                +
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {!isCurrentUserInTeam &&
                              equipe.statut !== "complete" &&
                              equipe.statut !== "selected" && (
                                <button
                                  onClick={() =>
                                    handleJoinEquipe(equipe.id_equipe)
                                  }
                                  className="rounded-2xl bg-brand-green px-3 py-2 text-sm font-semibold text-white hover:bg-brand-green-dark transition-colors"
                                >
                                  {t('cand.joinTeam')}
                                </button>
                              )}
                            {isCurrentUserInTeam && !isOwner && (
                              <button
                                onClick={() =>
                                  handleLeaveEquipe(equipe.id_equipe)
                                }
                                className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                              >
                                {t('cand.leaveTeam')}
                              </button>
                            )}
                            {isOwner && (
                              <button
                                onClick={() => {
                                  if (
                                    confirm(t('cand.deleteTeamConfirm'))
                                  ) {
                                    api
                                      .deleteEquipe(equipe.id_equipe)
                                      .then(() => loadEquipes())
                                      .catch((error) => {
                                        console.error("❌ Erreur:", error);
                                        alert(t('cand.teamCreationError'));
                                      });
                                  }
                                }}
                                className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                            {equipe.statut === "complete" && (
                              <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                                <Check className="h-4 w-4" />
                                {t('cand.teamCompleteMsg')}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Modal de création d'équipe */}
                {showCreateEquipe && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">
                          {t('cand.createModalTitle')}
                        </h3>
                        <button
                          onClick={() => {
                            setShowCreateEquipe(false);
                            setNewEquipeNom("");
                            setNewEquipeAmbiance("");
                          }}
                          className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-semibold block mb-1">
                            {t('cand.teamNameLabel')}
                          </label>
                          <input
                            type="text"
                            value={newEquipeNom}
                            onChange={(e) => setNewEquipeNom(e.target.value)}
                            placeholder={t('cand.teamNamePlaceholder')}
                            className="w-full rounded-2xl border border-border px-4 py-2.5 text-sm outline-none focus:border-brand-cyan transition-colors"
                            maxLength={255}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-semibold block mb-1">
                            {t('cand.vibeLabel')}
                          </label>
                          <textarea
                            value={newEquipeAmbiance}
                            onChange={(e) =>
                              setNewEquipeAmbiance(e.target.value)
                            }
                            placeholder={t('cand.vibePlaceholder')}
                            className="w-full rounded-2xl border border-border px-4 py-2.5 text-sm outline-none focus:border-brand-cyan min-h-[100px] resize-none transition-colors"
                            maxLength={500}
                          />
                        </div>

                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => {
                              setShowCreateEquipe(false);
                              setNewEquipeNom("");
                              setNewEquipeAmbiance("");
                            }}
                            className="flex-1 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
                          >
                            {t('common.cancel')}
                          </button>
                          <button
                            onClick={handleCreateEquipe}
                            disabled={!newEquipeNom.trim()}
                            className="flex-1 rounded-2xl bg-brand-cyan px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-cyan-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {t('cand.createSubmit')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* ===== PANNEAU DÉPOSANT : avancement des paiements + lancement officiel ===== */}
            {activeView === "track" &&
              isAnnonceOwner &&
              myContracts.length > 0 &&
              (() => {
                const allPaid = myContracts.every(
                  (c) => c.paidCount >= c.total,
                );
                const isFinalized = annonceData?.statut === "terminee";
                return (
                  <div className="mb-6 rounded-3xl border border-brand-cyan/30 bg-white p-6 shadow-sm">
                    <div className="bebas text-2xl text-brand-cyan-dark">
                      {t('contract.title')}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t('contract.splitFee')}
                    </p>
                    <div className="mt-4 space-y-2">
                      {myContracts.map((c) => {
                        const done = c.paidCount >= c.total;
                        return (
                          <div
                            key={c.id_contrat}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border p-3 text-sm"
                          >
                            <span>
                              {c.type === "edl"
                                ? t('contract.edlFlat')
                                : t('contract.contractFlat')}{" "}
                              · réf {c.reference}
                            </span>
                            <div className="flex items-center gap-3">
                              <span
                                className={
                                  done
                                    ? "font-semibold text-brand-green-dark"
                                    : "text-muted-foreground"
                                }
                              >
                                {c.paidCount}/{c.total} {t('contract.paidCount', { paid: c.paidCount, total: c.total })} {done ? "✓" : ""}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  openContractDocument(c.id_contrat)
                                }
                                className="rounded-lg border border-brand-cyan px-3 py-1.5 text-xs font-bold text-brand-cyan-dark hover:bg-brand-cyan/10"
                              >
                                {t('common.downloadDocument')}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={launchOfficial}
                      disabled={!allPaid || launchingOfficial || isFinalized}
                      className="mt-4 w-full rounded-3xl bg-brand-green px-5 py-3 text-sm font-semibold text-white hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                    >
                      {isFinalized
                        ? t('common.loading')
                        : launchingOfficial
                          ? t('common.loading')
                          : allPaid
                            ? t('actions.lancerOfficiellement')
                            : t('common.loading')}
                    </button>
                    {officialFeedback && (
                      <div className="mt-3 rounded-2xl bg-brand-green-light/50 px-4 py-3 text-sm font-semibold text-brand-green-dark">
                        {officialFeedback}
                      </div>
                    )}
                  </div>
                );
              })()}

            {/* ===== CARTE COLOCATAIRE : payer ma part ===== */}
            {activeView === "cand" &&
              !isAnnonceOwner &&
              myContracts.filter((c) => c.peut_payer).length > 0 && (
                <div className="mb-6 rounded-3xl border border-brand-cyan/40 bg-white p-6 shadow-sm">
                  <div className="bebas text-2xl text-brand-cyan-dark">
                    {t('cand.yourContractTitle')}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('cand.yourContractDesc')}
                  </p>
                  <div className="mt-4 space-y-3">
                    {myContracts
                      .filter((c) => c.peut_payer)
                      .map((c) => (
                        <div
                          key={c.id_contrat}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4"
                        >
                          <div>
                            <div className="font-semibold">
                              {c.type === "edl"
                                ? t('contract.edlFlat')
                                : t('contract.contractFlat')}{" "}
                              · réf. {c.reference}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {t('cand.yourShare', { amount: fmtAr(c.ma_part) })} — {t('cand.roommatesPaidCount', { paidCount: c.paidCount, total: c.total })}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openContractDocument(c.id_contrat)}
                              className="rounded-xl border border-brand-cyan px-4 py-2 text-sm font-bold text-brand-cyan-dark hover:bg-brand-cyan/10"
                            >
                              {c.type === "edl"
                                ? t('cand.readEdl')
                                : t('cand.readContract')}
                            </button>
                            {c.deja_paye ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-brand-green-light px-3 py-1.5 text-sm font-semibold text-brand-green-dark">
                                {t('cand.sharePaid')}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => payMyShare(c)}
                                className="rounded-xl bg-brand-cyan px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-cyan-dark"
                              >
                                {t('cand.payShare', { amount: fmtAr(c.ma_part) })}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* ===== VUE FLUX (gestion — réservée au déposant) ===== */}
            {activeView === "flux" && isAnnonceOwner && (() => {
              const contractExists = myContracts.length > 0;
              const isFinalized = annonceData?.statut === "terminee";
              const launchDisabled = ownerFilled < TARGET || contractExists || isFinalized;
              const launchLabel = isFinalized
                ? t('actions.colocationLancee')
                : contractExists
                  ? t('actions.contratsCrees')
                  : ownerFilled < TARGET
                    ? `${t('actions.lancerColocation')} (${ownerFilled}/${TARGET})`
                    : t('actions.lancerColocation');
              return <OwnerCandidaturesDashboard
                title={logementTitre}
                resume={logementResume}
                monthlyRent={`${fmtAr(monthlyRent)} Ar`}
                target={TARGET}
                retained={ownerRetained}
                pending={ownerPending}
                refused={ownerRefused}
                refusedOpen={refusedOpen}
                launchDisabled={launchDisabled}
                launchLabel={launchLabel}
                onAccept={acceptCandidate}
                onDiscuss={openChat}
                onRefuse={refuseCandidate}
                onRestore={restoreCandidate}
                onLaunch={launchColoc}
                onToggleRefused={() => setRefusedOpen((prev) => !prev)}
              />;
            })()}

            {false && activeView === "flux" && isAnnonceOwner && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-cyan-light text-brand-cyan-dark">
                        <UserCheck className="h-8 w-8" />
                      </div>
                      <div>
                        <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                          {logementTitre} · {logementResume}
                        </div>
                        <div className="bebas text-3xl text-brand-cyan-dark mt-2">
                          {fmtAr(monthlyRent)} Ar{" "}
                          <span className="text-base font-medium text-muted-foreground">
                            / mois · loyer global
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="rounded-3xl bg-brand-cyan-light/70 p-4 text-brand-cyan-dark md:flex-1">
                      <div className="flex items-center gap-3 text-lg font-semibold">
                        <UserCheck className="h-5 w-5" />
                        Mode : Validation individuelle
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        En tant que membre de la colocation, tu valides les
                        colocataires un par un et peux échanger avec chacun·e
                        avant d'accepter. La coloc se lance quand les {TARGET}{" "}
                        places sont pourvues.
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 md:w-1/3">
                      {Array.from({ length: TARGET }).map((_, index) => (
                        <div
                          key={index}
                          className={`h-3 rounded-full ${index < ownerFilled ? "bg-brand-green" : "bg-muted/30"}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className={ownerModeClass + " p-5"}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-lg font-semibold text-brand-green-dark">
                          <Check className="h-4 w-4" /> Colocataires retenus
                        </div>
                        <span className="inline-flex rounded-full bg-brand-green-light px-3 py-1 text-xs font-semibold text-brand-green-dark">
                          {ownerRetained.length}
                        </span>
                      </div>
                      <div className="mt-5 space-y-4">
                        {ownerRetained.map((cand) => (
                          <div
                            key={cand.id}
                            className="flex flex-col gap-3 rounded-3xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-3xl bg-brand-cyan text-white flex items-center justify-center text-lg font-semibold">
                                {cand.initials}
                              </div>
                              <div>
                                <div className="font-semibold">{cand.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {cand.subtitle}
                                </div>
                              </div>
                            </div>
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                              Retenu
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={ownerModeClass + " p-5"}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-lg font-semibold text-brand-cyan-dark">
                          <UserPlus className="h-4 w-4" /> Candidatures en
                          attente
                        </div>
                        <span className="inline-flex rounded-full bg-brand-cyan-light px-3 py-1 text-xs font-semibold text-brand-cyan-dark">
                          {ownerPending.length}
                        </span>
                      </div>
                      <div className="mt-5 space-y-4">
                        {ownerPending.map((cand) => (
                          <div
                            key={cand.id}
                            className="flex flex-col gap-4 rounded-3xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-3xl bg-brand-cyan text-white flex items-center justify-center text-lg font-semibold">
                                {cand.initials}
                              </div>
                              <div>
                                <div className="font-semibold">{cand.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {cand.subtitle}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                className="inline-flex items-center justify-center rounded-2xl border border-border bg-brand-cyan-light px-3 py-2 text-sm font-semibold text-brand-cyan-dark hover:bg-brand-cyan"
                                onClick={() => acceptCandidate(cand.id)}
                              >
                                Accepter
                              </button>
                              <button
                                className="inline-flex items-center justify-center rounded-2xl border border-border bg-brand-cyan-light/50 px-3 py-2 text-sm font-semibold text-brand-cyan-dark hover:bg-brand-cyan-light"
                                onClick={() => openChat(cand)}
                              >
                                <MessageCircle className="h-4 w-4" />
                              </button>
                              <button
                                className="inline-flex items-center justify-center rounded-2xl border border-border bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                                onClick={() => refuseCandidate(cand.id)}
                              >
                                Refuser
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-3xl border border-border bg-background px-5 py-4 text-left text-sm font-semibold text-brand-cyan-dark"
                      onClick={() => setRefusedOpen((prev) => !prev)}
                    >
                      <span>Personnes refusées</span>
                      <span
                        className={`transition-transform ${refusedOpen ? "rotate-180" : ""}`}
                      >
                        ▾
                      </span>
                    </button>
                    {refusedOpen && (
                      <div className="space-y-3">
                        {ownerRefused.length > 0 ? (
                          ownerRefused.map((cand) => (
                            <div
                              key={cand.id}
                              className="flex flex-col gap-4 rounded-3xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-3xl bg-muted text-white flex items-center justify-center text-lg font-semibold">
                                  {cand.initials}
                                </div>
                                <div>
                                  <div className="font-semibold">
                                    {cand.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {cand.subtitle}
                                  </div>
                                </div>
                              </div>
                              <button
                                className="inline-flex items-center justify-center rounded-2xl border border-brand-cyan bg-card px-3 py-2 text-sm font-semibold text-brand-cyan-dark"
                                onClick={() => restoreCandidate(cand.id)}
                              >
                                Rétablir
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-3xl border border-border bg-background p-4 text-sm text-muted-foreground">
                            Aucun refus pour l'instant.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {(() => {
                    const contractExists = myContracts.length > 0;
                    const isFinalized = annonceData?.statut === "terminee";
                    return (
                      <button
                        className="w-full rounded-3xl bg-brand-green px-5 py-4 text-base font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                        disabled={
                          ownerFilled < TARGET || contractExists || isFinalized
                        }
                        onClick={launchColoc}
                      >
                        {isFinalized
                          ? "Colocation déjà lancée ✓"
                          : contractExists
                            ? "Contrat déjà créé — voir les paiements ci-dessus"
                            : ownerFilled < TARGET
                              ? `Lancer la colocation (${ownerFilled}/${TARGET})`
                              : "Lancer la colocation 🎉"}
                      </button>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* ===== VUE TRACK ===== */}
            {activeView === "track" && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-cyan-light text-brand-cyan-dark">
                        <Scale className="h-8 w-8" />
                      </div>
                      <div>
                        <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                          {logementTitre} · {logementResume}
                        </div>
                        <div className="bebas text-3xl text-brand-cyan-dark mt-2">
                          {fmtAr(monthlyRent)} Ar{" "}
                          <span className="text-base font-medium text-muted-foreground">
                            / mois · loyer global
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
                  <div className="rounded-3xl bg-brand-green-light/40 p-4 text-brand-green-dark">
                    <div className="flex items-center gap-3 text-lg font-semibold">
                      <Scale className="h-5 w-5" />
                      {t('track.modeTitle')}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {t('track.modeDesc')}
                    </p>
                  </div>

                  {completedMembers.length > 0 ? (
                    <div className="rounded-3xl border border-border bg-background p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-lg font-semibold text-brand-cyan-dark">
                          {t('track.membersValidatedTitle')}
                        </div>
                        <span className="rounded-full bg-brand-cyan-light px-3 py-1 text-xs font-semibold text-brand-cyan-dark">
                          {completedMembers.length}
                        </span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {completedMembers.map((member, index) => (
                          <div
                            key={`${member.nom}-${index}`}
                            className="flex items-center justify-between rounded-2xl border border-border px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-cyan text-sm font-semibold text-white">
                                {member.initiales ||
                                  member.nom.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-foreground">
                                  {member.nom}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {member.statut || "active"}
                                </div>
                              </div>
                            </div>
                            <span className="rounded-full bg-brand-green-light px-2.5 py-1 text-[11px] font-semibold text-brand-green-dark">
                              {t('statuts.membre')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-3xl border px-4 py-3 text-sm font-semibold ${
                      agentView
                        ? "border-brand-cyan bg-brand-cyan text-white"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                    onClick={toggleAgentView}
                  >
                    <Sparkles className="h-4 w-4" />
                    {t('track.simulateAgentView')}
                  </button>

                  {agentView && (
                    <div className="rounded-3xl border border-brand-cyan-light bg-brand-cyan-light/40 p-5">
                      <div className="flex items-center justify-between text-sm text-brand-cyan-dark">
                        <span>{t('track.agencyFeesTotal')}</span>
                        <span className="font-semibold">
                          {fmtAr(FEE_TOTAL)} Ar
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                        <span>{t('track.splitAcross')}</span>
                        <span>{t('track.nRoommates', { count: TARGET })}</span>
                      </div>
                      <div className="mt-3 border-t border-brand-cyan/20 pt-3 text-sm font-semibold text-brand-cyan-dark">
                        <span>{t('track.sharePerRoommate')}</span>
                        <span className="float-right">
                          {fmtAr(Math.round(FEE_TOTAL / TARGET))} Ar
                        </span>
                      </div>
                    </div>
                  )}

                  {isCourseFinished && validatedTeam ? (
                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                      <div className="flex items-center gap-3 text-lg font-semibold text-emerald-700">
                        <Check className="h-5 w-5" />
                        {t('track.attributedTitle')}
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {t('track.attributedDesc', { team: validatedTeam.title })}
                      </p>
                      <div className="mt-4">
                        {renderAvStack(validatedTeam.members)}
                      </div>
                    </div>
                  ) : winnerTeam ? (
                    <div className="rounded-3xl border border-border bg-background p-5">
                      <div className="flex items-center gap-3 text-lg font-semibold text-brand-cyan-dark">
                        <Trophy className="h-5 w-5" />
                        {t('track.teamCompleteTitle')}
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {t('track.teamCompleteDesc', { team: winnerTeam.title, target: TARGET })}
                      </p>
                      <div className="mt-4">
                        {renderAvStack(winnerTeam.members)}
                      </div>
                      <div className="mt-4 rounded-3xl border border-border bg-card p-4">
                        <div className="flex items-center justify-between text-sm font-semibold">
                          <span>{t('track.deadlineIn')}</span>
                          <span>{countdown}</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {t('track.deadlineDesc')}
                        </p>
                      </div>
                      <button
                        className="mt-4 inline-flex w-full items-center justify-center rounded-3xl bg-brand-green px-4 py-3 text-sm font-semibold text-white hover:bg-brand-green-dark"
                        onClick={() => validateTeam(winnerTeam.id)}
                      >
                        {t('track.validateTeam')}
                      </button>
                    </div>
                  ) : null}

                  <div className="grid gap-4 md:grid-cols-2">
                    {teams.map((team) => {
                      const isWinner = Boolean(
                        activeWinner && activeWinner.id === team.id,
                      );
                      const isLocked = Boolean(isCourseFinished && !isWinner);
                      return (
                        <div
                          key={team.id}
                          className={`rounded-3xl border p-5 ${isWinner ? "border-brand-green bg-brand-green-light/30" : "border-border bg-card"}`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h3 className="bebas text-xl">{team.title}</h3>
                              <div className="text-sm text-muted-foreground">
                                {team.members.length}/{TARGET}
                              </div>
                            </div>
                            {isWinner ? (
                              <span className="rounded-full bg-brand-green px-3 py-1 text-xs font-semibold text-white">
                                {t('track.teamValidatedBadge')}
                              </span>
                            ) : isLocked ? (
                              <span className="text-xs font-semibold text-muted-foreground">
                                {t('track.outOfRace')}
                              </span>
                            ) : team.members.length >= TARGET ? (
                              <span className="rounded-full bg-brand-cyan-light px-3 py-1 text-xs font-semibold text-brand-cyan-dark">
                                {t('track.completeBadge')}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {t('track.spotsRemaining', { count: TARGET - team.members.length })}
                              </span>
                            )}
                          </div>
                          <div className="mt-4 whitespace-pre-line text-sm text-muted-foreground">
                            {team.mood}
                          </div>
                          <div className="mt-5 flex flex-wrap items-center gap-3">
                            {renderAvStack(team.members)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!isCourseFinished && (
                    <button
                      className="inline-flex w-full items-center justify-center rounded-3xl bg-brand-cyan px-4 py-3 text-sm font-semibold text-white hover:bg-brand-cyan-dark"
                      onClick={simulateComplete}
                    >
                      {t('track.simulateComplete')}
                    </button>
                  )}

                  <p className="text-sm text-muted-foreground">
                    {t('track.roleDesc')}
                  </p>
                </div>
              </div>
            )}

            {/* ===== VUE CAND ===== */}
            {activeView === "cand" && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${isCourseFinished ? "bg-brand-green-light text-brand-green-dark" : "bg-brand-cyan-light text-brand-cyan-dark"}`}
                      >
                        <Users className="h-4 w-4" />
                        {decision === "validated"
                          ? myTeamData?.members.includes(userName)
                            ? t('cand.teamCreated')
                            : t('cand.title')
                          : winnerTeam
                            ? winnerTeam.members.includes(userName)
                              ? t('cand.teamCompleteMsg')
                              : t('cand.title')
                            : myTeamData
                              ? t('cand.title')
                              : t('cand.title')}
                      </div>
                      <h2 className="bebas mt-4 text-3xl">
                        {TARGET} {t('realPanel.candidate', { count: TARGET })}
                      </h2>
                      <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
                        {t('cand.title')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 rounded-3xl bg-brand-cyan-light/50 px-4 py-3 text-sm font-semibold text-brand-cyan-dark">
                      <Sparkles className="h-5 w-5" />
                      {isCourseFinished
                        ? t('track.outOfRace')
                        : myTeamData
                          ? t('cand.title')
                          : t('cand.title')}
                    </div>
                  </div>
                </div>

                {agentView && (
                  <div className="rounded-3xl border border-brand-cyan-light bg-brand-cyan-light/40 p-5 text-sm text-brand-cyan-dark">
                    <div className="font-semibold">{t('track.agencyFeesTotal')}</div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-3xl bg-card p-4 text-center">
                        <div className="text-xs uppercase text-muted-foreground">
                          {t('track.agencyFeesTotal')}
                        </div>
                        <div className="bebas text-2xl mt-2">
                          {fmtAr(FEE_TOTAL)} Ar
                        </div>
                      </div>
                      <div className="rounded-3xl bg-card p-4 text-center">
                        <div className="text-xs uppercase text-muted-foreground">
                          {t('track.sharePerRoommate')}
                        </div>
                        <div className="bebas text-2xl mt-2">
                          {fmtAr(Math.round(FEE_TOTAL / TARGET))} Ar
                        </div>
                      </div>
                      <div className="rounded-3xl bg-card p-4 text-center text-muted-foreground">
                        {t('track.splitAcross')}
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold">
                        {t('cand.title')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {teams.length} {t('cand.title')}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {teams.reduce(
                        (sum, team) => sum + team.members.length,
                        0,
                      )}{" "}
                      {t('cand.member')}
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {teams.map((team) => {
                      const mine = team.members.includes(userName);
                      const full = team.members.length >= TARGET;
                      return (
                        <div
                          key={team.id}
                          className={`rounded-3xl border p-5 ${mine ? "border-brand-green bg-brand-green-light/30" : "border-border bg-card"}`}
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="flex items-center gap-2 text-lg font-semibold text-brand-cyan-dark">
                                {team.title}
                                {mine && (
                                  <span className="rounded-full bg-brand-cyan-light px-2 py-1 text-xs font-semibold text-brand-cyan-dark">
                                    {t('statuts.vous')}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {team.members.length}/{TARGET}
                              </div>
                            </div>
                            <div>
                              {mine ? (
                                <button
                                  className="rounded-2xl border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground hover:border-brand-cyan"
                                  onClick={() => leaveTeam(team.id)}
                                >
                                  {t('cand.leaveTeam')}
                                </button>
                              ) : isCourseFinished ? (
                                <button
                                  className="rounded-2xl bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground"
                                  disabled
                                >
                                  {t('track.outOfRace')}
                                </button>
                              ) : full ? (
                                <button
                                  className="rounded-2xl bg-brand-cyan-light px-4 py-2 text-sm font-semibold text-brand-cyan-dark"
                                  disabled
                                >
                                  {t('track.completeBadge')}
                                </button>
                              ) : myTeam ? (
                                <button
                                  className="rounded-2xl border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground hover:border-brand-cyan"
                                  onClick={() => switchTeam(team.id)}
                                >
                                  {t('cand.joinTeam')}
                                </button>
                              ) : (
                                <button
                                  className="rounded-2xl bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-brand-green-dark"
                                  onClick={() => joinTeam(team.id)}
                                >
                                  {t('cand.joinTeam')}
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="mt-4 whitespace-pre-line text-sm text-muted-foreground">
                            {team.mood}
                          </div>
                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            {renderAvStack(team.members)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!myTeam && !isCourseFinished && (
                    <div className="mt-6 rounded-3xl border border-border bg-background p-5 text-sm text-muted-foreground">
                      <p className="font-semibold text-brand-cyan-dark">
                        {t('cand.createTeam')}
                      </p>
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <button
                          className="rounded-2xl bg-brand-cyan px-4 py-3 text-sm font-semibold text-white hover:bg-brand-cyan-dark"
                          onClick={() => setCreateOpen(true)}
                        >
                          {t('cand.createTeam')}
                        </button>
                        <span>
                          {t('cand.createTeam')}
                        </span>
                      </div>
                    </div>
                  )}

                  {createOpen && (
                    <div className="mt-5 rounded-3xl border border-border bg-card p-5">
                      <div className="grid gap-4">
                        <label className="text-sm font-semibold">
                          {t('cand.teamNameLabel')}
                          <input
                            type="text"
                            value={createTitle}
                            onChange={(e) => setCreateTitle(e.target.value)}
                            maxLength={40}
                            placeholder={t('cand.teamNamePlaceholder')}
                            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-cyan"
                          />
                        </label>
                        <label className="text-sm font-semibold">
                          {t('cand.vibeLabel')}{" "}
                          <span className="text-muted-foreground">
                            (3 lignes max)
                          </span>
                          <textarea
                            value={createMood}
                            onChange={(e) => setCreateMood(e.target.value)}
                            maxLength={180}
                            placeholder={t('cand.vibePlaceholder')}
                            className="mt-2 h-32 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-cyan"
                          />
                        </label>
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            className="rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-brand-cyan"
                            onClick={() => setCreateOpen(false)}
                          >
                            {t('common.cancel')}
                          </button>
                          <button
                            className="rounded-2xl bg-brand-green px-4 py-3 text-sm font-semibold text-white hover:bg-brand-green-dark"
                            onClick={createTeam}
                          >
                            {t('cand.createSubmit')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {myTeamData && (
                  <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-lg font-semibold">
                          {t('cand.title')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {myTeamData.title}
                        </div>
                      </div>
                      <div className="rounded-3xl bg-brand-cyan-light px-3 py-2 text-sm font-semibold text-brand-cyan-dark">
                        {myTeamData.members.length}/{TARGET}
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {myTeamData.chat.map((message, index) => (
                        <div
                          key={index}
                          className={`rounded-3xl p-4 text-sm ${message.who === userName ? "bg-brand-green text-white self-end" : "border border-border bg-background"}`}
                        >
                          <div className="font-semibold">{message.who}</div>
                          <p className="mt-2 whitespace-pre-line">
                            {message.txt}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 flex gap-3">
                      <input
                        type="text"
                        className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-cyan"
                        placeholder={t('modals.chatPlaceholder')}
                        value={""}
                        onChange={() => undefined}
                        disabled
                      />
                      <button className="inline-flex items-center justify-center rounded-2xl bg-brand-cyan px-4 py-3 text-sm font-semibold text-white">
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeView === "join" && renderJoinTeam()}

            {activeView === "won" && officialNotification === "won" && (
              <div className="rounded-3xl border border-brand-green-light bg-card p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3 text-lg font-semibold text-brand-green-dark">
                    <Sparkles className="h-5 w-5" /> {t('notifications.title')}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["indiv", "group"] as NotificationMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setWonMode(mode)}
                        className={`rounded-2xl px-4 py-2 text-sm font-semibold ${wonMode === mode ? "bg-brand-green text-white" : "border border-border bg-card text-muted-foreground"}`}
                      >
                        {mode === "indiv"
                          ? t('notifications.individual')
                          : t('notifications.group')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-6 rounded-3xl border border-brand-green-light bg-brand-green-light/40 p-6 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-green text-white mx-auto">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <h2 className="bebas text-3xl">
                    {wonMode === "indiv"
                      ? t('notifications.congratsName', { name: currentCandidateName })
                      : t('notifications.congratsTeam', { team: retainedTeamTitle })}
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {wonMode === "indiv"
                      ? wonIndividualMessage
                      : wonGroupMessage}
                  </p>
                  <div className="mt-6 rounded-3xl border border-border bg-card p-5 text-left text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-brand-cyan-dark" />
                      <div>
                        <div className="font-semibold">{t('notifications.moveIn')}</div>
                        <div>{moveInLabel}</div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-start gap-3">
                      <MessageCircle className="h-4 w-4 text-brand-cyan-dark" />
                      <div>
                        {t('notifications.groupChatOpen')}
                      </div>
                    </div>
                  </div>
                  <button className="mt-6 w-full rounded-3xl bg-brand-green px-5 py-3 text-sm font-semibold text-white hover:bg-brand-green-dark">
                    {t('notifications.openGroupChat')}
                  </button>
                </div>
              </div>
            )}

            {activeView === "won" && !officialNotification && (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3 text-lg font-semibold text-brand-cyan-dark">
                  <Sparkles className="h-5 w-5" /> {t('notifications.title')}
                </div>
                <div className="mt-6 rounded-3xl border border-border bg-background p-8 text-center">
                  <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <h2 className="bebas text-3xl">
                    {t('notifications.none')}
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                    {t('notifications.noneWon')}
                  </p>
                </div>
              </div>
            )}

            {false && activeView === "won" && !officialNotification && (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3 text-lg font-semibold text-brand-green-dark">
                    <Sparkles className="h-5 w-5" /> Notification
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["indiv", "group"] as NotificationMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setWonMode(mode)}
                        className={`rounded-2xl px-4 py-2 text-sm font-semibold ${wonMode === mode ? "bg-brand-cyan text-white" : "border border-border bg-card text-muted-foreground"}`}
                      >
                        {mode === "indiv"
                          ? "Message individuel"
                          : "Message au groupe"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-6 rounded-3xl border border-brand-green-light bg-brand-green-light/40 p-6 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-green text-white mx-auto">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <h2 className="bebas text-3xl">
                    {wonMode === "indiv"
                      ? "Félicitations, Rado !"
                      : "Félicitations à toute l’équipe !"}
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {wonMode === "indiv"
                      ? `Ta candidature est retenue : tu fais partie de la colocation ${logementTitre}. Bienvenue ! Emménagement prévu le ${moveInLabel}.`
                      : "Votre équipe « Les lève-tôt studieux » remporte la colocation " +
                        logementTitre +
                        " ! Vous allez vivre ensemble dès le " +
                        moveInLabel +
                        "."}
                  </p>
                  <div className="mt-6 rounded-3xl border border-border bg-card p-5 text-left text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-brand-cyan-dark" />
                      <div>
                        <div className="font-semibold">Emménagement</div>
                        <div>{moveInLabel}</div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-start gap-3">
                      <MessageCircle className="h-4 w-4 text-brand-cyan-dark" />
                      <div>
                        Ta conversation de groupe reste ouverte pour
                        t'organiser.
                      </div>
                    </div>
                  </div>
                  <button className="mt-6 w-full rounded-3xl bg-brand-green px-5 py-3 text-sm font-semibold text-white hover:bg-brand-green-dark">
                    Ouvrir la conversation de groupe
                  </button>
                </div>
              </div>
            )}

            {activeView === "lost" && officialNotification === "lost" && (
              <div className="rounded-3xl border border-red-200 bg-card p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3 text-lg font-semibold text-red-700">
                    <Shield className="h-5 w-5" /> {t('notifications.title')}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["indiv", "group"] as NotificationMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setLostMode(mode)}
                        className={`rounded-2xl px-4 py-2 text-sm font-semibold ${lostMode === mode ? "bg-red-500 text-white" : "border border-border bg-card text-muted-foreground"}`}
                      >
                        {mode === "indiv"
                          ? t('notifications.individual')
                          : t('notifications.group')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-6 rounded-3xl border border-red-100 bg-red-50 p-6 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white mx-auto">
                    <Shield className="h-8 w-8" />
                  </div>
                  <h2 className="bebas text-3xl">
                    {lostMode === "indiv"
                      ? t('notifications.notThisTime')
                      : t('notifications.thanksApplication')}
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {lostMode === "indiv"
                      ? lostIndividualMessage
                      : lostGroupMessage}
                  </p>
                  <div className="mt-6 rounded-3xl border border-border bg-card p-5 text-left text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-brand-cyan-dark" />
                      <div>
                        {t('notifications.mapHint')}
                      </div>
                    </div>
                    <div className="mt-4 flex items-start gap-3">
                      <Clock className="h-4 w-4 text-brand-cyan-dark" />
                      <div>
                        {t('notifications.alertHint')}
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/annonces"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-3xl bg-red-500 px-5 py-3 text-sm font-semibold text-white hover:bg-red-600"
                  >
                    {t('notifications.backToMap')}
                  </Link>
                </div>
              </div>
            )}

            {activeView === "lost" && !officialNotification && (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3 text-lg font-semibold text-brand-cyan-dark">
                  <Shield className="h-5 w-5" /> {t('notifications.title')}
                </div>
                <div className="mt-6 rounded-3xl border border-border bg-background p-8 text-center">
                  <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Shield className="h-8 w-8" />
                  </div>
                  <h2 className="bebas text-3xl">
                    {t('notifications.none')}
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                    {t('notifications.noneLost')}
                  </p>
                </div>
              </div>
            )}

            {false && activeView === "lost" && !officialNotification && (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3 text-lg font-semibold text-brand-cyan-dark">
                    <Shield className="h-5 w-5" /> Notification
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["indiv", "group"] as NotificationMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setLostMode(mode)}
                        className={`rounded-2xl px-4 py-2 text-sm font-semibold ${lostMode === mode ? "bg-brand-cyan text-white" : "border border-border bg-card text-muted-foreground"}`}
                      >
                        {mode === "indiv"
                          ? "Message individuel"
                          : "Message au groupe"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-6 rounded-3xl border border-border bg-background p-6 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-cyan-light text-brand-cyan-dark mx-auto">
                    <Shield className="h-8 w-8" />
                  </div>
                  <h2 className="bebas text-3xl">
                    {lostMode === "indiv"
                      ? "Ce ne sera pas cette fois"
                      : "Merci à votre équipe !"}
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {lostMode === "indiv"
                      ? `Une autre équipe s'est complétée en premier pour ${logementTitre}. Ça arrive vite ! De nombreuses colocations cherchent encore des profils comme le tien.`
                      : "Une autre équipe s'est complétée en premier sur cette annonce. Votre dynamique de groupe est précieuse — restez ensemble et retentez sur une autre colocation !"}
                  </p>
                  <div className="mt-6 rounded-3xl border border-border bg-card p-5 text-left text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-brand-cyan-dark" />
                      <div>
                        Reviens sur la carte pour trouver un logement qui te
                        correspond encore mieux.
                      </div>
                    </div>
                    <div className="mt-4 flex items-start gap-3">
                      <Clock className="h-4 w-4 text-brand-cyan-dark" />
                      <div>
                        Active une alerte : tu seras prévenu·e des nouvelles
                        colocations qui matchent avec tes critères.
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/annonces"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-3xl bg-brand-cyan px-5 py-3 text-sm font-semibold text-white hover:bg-brand-cyan-dark"
                  >
                    Revenir à la carte des colocations
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <BasicCandidatureModals
        candidatureMessage={candidatureMessage}
        celebrateOpen={celebrateOpen}
        chatModalOpen={chatModalOpen}
        chatMessages={chatMessages}
        createdContractIds={createdContractIds}
        createdContracts={createdContracts}
        fmtAr={fmtAr}
        logementResume={logementResume}
        logementTitre={logementTitre}
        monthlyRent={monthlyRent}
        moveInLabel={moveInLabel}
        newMessage={newMessage}
        ownerRetained={ownerRetained}
        selectedCandidate={selectedCandidate}
        showPostulerModal={showPostulerModal}
        onChangeCandidatureMessage={setCandidatureMessage}
        onChangeNewMessage={setNewMessage}
        onCloseCelebrate={closeCelebrate}
        onCloseChat={closeChat}
        onClosePostuler={() => setShowPostulerModal(false)}
        onOpenContractDocument={openContractDocument}
        onPostuler={handlePostuler}
        onSendMessage={sendMessage}
      />

      {contractModalOpen && (
        <ContractWizardModal
          activeBail={activeBail}
          activeBody={activeBody}
          activeContratOffers={activeContratOffers}
          activeEdlOffers={activeEdlOffers}
          activeMailNote={activeMailNote}
          activeOffer={activeOffer}
          activeSolidarite={activeSolidarite}
          annonceData={annonceData}
          bailType={bailType}
          contractError={contractError}
          contractMode={contractMode}
          contractStep={contractStep}
          contractSubmitting={contractSubmitting}
          createdContracts={createdContracts}
          fmtAr={fmtAr}
          mobileMoneyList={mobileMoneyList}
          moyenPaiement={moyenPaiement}
          moveInLabel={moveInLabel}
          myShare={myShare}
          ownerRetained={ownerRetained}
          paymentInfo={paymentInfo}
          payRef={payRef}
          previewAmount={previewAmount}
          renderTemplate={renderTemplate}
          solidarite={solidarite}
          userEmail={user?.email || "ton adresse e-mail"}
          onChooseOffer={chooseOffer}
          onClose={closeContractModal}
          onConfirmPayment={confirmPayment}
          onFinalizeContract={finalizeContract}
          onIgnoreOffer={ignoreOffer}
          onOpenContractDocument={openContractDocument}
          onPayRefChange={setPayRef}
          onSetContractStep={(step) =>
            step === "done" ? goPaiement() : setContractStep(step)
          }
          onSetMoyenPaiement={setMoyenPaiement}
          onShowCelebrateAfterPayment={() => {
            setContractModalOpen(false);
            setCelebrateOpen(true);
          }}
        />
      )}
    </SiteLayout>
  );
}