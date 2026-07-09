import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  Check,
  Clock,
  Eye,
  MapPin,
  MessageCircle,
  Scale,
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
import { api } from "../lib/api";

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

const TARGET = 3;
const MOVEIN = "1er juillet 2026";
const PROP_ADDR = "Analakely, Antananarivo (T4 · 95 m²)";
const FEE_TOTAL = 350000;
const JOIN_DEFAULT = "t2";

function fmtAr(value: number) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
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
  const { annonceId: paramsAnnonceId } = useParams<{ annonceId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const userName = useMemo(
    () => (user ? `${user.prenom || user.name || user.nom || "Toi"}` : "Toi"),
    [user],
  );

  // 🔥 Extraire annonceId de l'URL si useParams ne fonctionne pas
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
  const [candidateActionLoading, setCandidateActionLoading] = useState<number | null>(null);
  const [candidateActionFeedback, setCandidateActionFeedback] = useState("");

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
  const [celebrateOpen, setCelebrateOpen] = useState(false);

  // États pour la discussion
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] =
    useState<OwnerCandidate | null>(null);
  const [chatMessages, setChatMessages] = useState<
    { who: string; txt: string }[]
  >([
    {
      who: "Toi",
      txt: "Bonjour ! J'aimerais discuter un peu avant de me décider.",
    },
    {
      who: "Candidat",
      txt: "Bien sûr ! N'hésite pas à poser toutes tes questions.",
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
          name: `${cand.prenom || ""} ${cand.nom || ""}`.trim() || "Candidat",
          subtitle: cand.email || "Candidat",
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
        const myCand = data.find((c: any) => c.id_utilisateur === user.id);
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
          (c: any) => c.id_utilisateur === user.id,
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
      alert("Veuillez vous connecter pour postuler");
      return;
    }

    if (!annonceId) {
      alert("Annonce non trouvée");
      return;
    }

    try {
      const payload = {
        id_annonce: parseInt(annonceId),
        message:
          candidatureMessage || "Je souhaite postuler à cette colocation",
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
      alert("✅ Candidature envoyée avec succès !");
      await loadRealCandidatures();
    } catch (error: any) {
      console.error("❌ ERREUR DÉTAILLÉE:", error);
      console.error("❌ Response:", error.response);
      console.error("❌ Data:", error.response?.data);
      console.error("❌ Status:", error.response?.status);

      if (error.response?.data?.message) {
        alert(`❌ ${error.response.data.message}`);
      } else {
        alert("❌ Erreur lors de l'envoi de la candidature");
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
            statut: action === "accept" ? "signature" : action === "refuse" ? "refusee" : candidate.statut,
          };
        }),
      );

      setCandidateActionFeedback(
        action === "accept"
          ? "Candidature acceptée et enregistrée en base."
          : action === "refuse"
            ? "Candidature refusée et enregistrée en base."
            : "Discussion ouverte et enregistrée en base.",
      );
      await loadRealCandidatures();
    } catch (error: any) {
      console.error("❌ Erreur action candidature:", error);
      setCandidateActionFeedback(error?.message || "Impossible de traiter cette candidature.");
    } finally {
      setCandidateActionLoading(null);
    }
  };

  // ===== VOIR MA CANDIDATURE =====
  const handleViewMyCandidature = () => {
    if (!user) {
      alert("Veuillez vous connecter pour voir votre candidature");
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

  // 🔥 CHARGER LES DONNÉES AU MONTAGE
  useEffect(() => {
    console.log("🔄 [1] useEffect chargement - annonceId:", annonceId, "userId:", user?.id, "authLoading:", authLoading);
    console.log("🔄 [1] URL actuelle:", location.pathname);

    if (!annonceId || authLoading) return;
    loadRealCandidatures();
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
        (c: any) => c.id_utilisateur === user.id,
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
    setActiveView(view);
    if (view === "join" && !joinTarget) setJoinTarget(JOIN_DEFAULT);
  }

  async function acceptCandidate(id: string) {
    const candidate = ownerCandidates.find((cand) => cand.id === id);
    if (!candidate?.id_candidature) return;
    if (ownerFilled >= TARGET) {
      alert("Toutes les places sont pourvues.");
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

  function launchColoc() {
    if (ownerFilled < TARGET) return;
    setContractMode("contrat");
    setContractModalOpen(true);
  }

  function closeContractModal() {
    setContractModalOpen(false);
  }

  function confirmContractChoice(mode: "contrat" | "edl" | "both") {
    setContractMode(mode);
    setContractModalOpen(false);
    setCelebrateOpen(true);
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

  function openChat(candidate: OwnerCandidate) {
    setSelectedCandidate(candidate);
    setChatMessages([
      {
        who: "Toi",
        txt: `Bonjour ${candidate.name.split(" ")[0]} ! J'aimerais discuter un peu avant de me décider.`,
      },
      {
        who: candidate.name,
        txt: "Bien sûr ! N'hésite pas à poser toutes tes questions.",
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
      await handleCandidateDecision(selectedCandidate.id_candidature, "discuss", message);
      setChatMessages((prev) => [
        ...prev,
        { who: "Toi", txt: message },
      ]);
      setChatModalOpen(false);
      setSelectedCandidate(null);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { who: "Toi", txt: message },
      ]);
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
    const title = createTitle.trim() || "Mon équipe";
    const mood = createMood.trim() || "(Ambiance à préciser)";
    const newTeam: Team = {
      id: `t${Date.now()}`,
      title,
      mood,
      members: [userName],
      chat: [
        {
          who: userName,
          txt: "J'ai créé l'équipe, à vous de me rejoindre ! 🚀",
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
    return (
      <div className="flex items-center -space-x-3">
        {members.map((member, index) => (
          <div
            key={index}
            className="h-10 w-10 rounded-full bg-brand-cyan text-white flex items-center justify-center text-sm font-semibold ring-2 ring-white"
          >
            {member
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
        ))}
        {Array.from({ length: TARGET - members.length }).map((_, idx) => (
          <div
            key={idx}
            className="h-10 w-10 rounded-full border border-border bg-muted/50 text-muted-foreground flex items-center justify-center text-sm font-semibold ring-2 ring-white"
          >
            +
          </div>
        ))}
      </div>
    );
  }

  function renderJoinTeam() {
    const target = teams.find((team) => team.id === joinTarget) || teams[0];
    const available = TARGET - target.members.length;
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Équipe sélectionnée
              </div>
              <h2 className="bebas text-2xl mt-3">{target.title}</h2>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                {target.members.length}/{TARGET} membres
              </div>
              <div className="text-base font-semibold text-brand-cyan-dark">
                {available > 0
                  ? `${available} place${available > 1 ? "s" : ""} restante${available > 1 ? "s" : ""}`
                  : "Complète"}
              </div>
            </div>
          </div>
          <div className="mt-4 whitespace-pre-line text-sm text-muted-foreground">
            {target.mood}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {renderAvStack(target.members)}
          </div>
          <div className="mt-5">
            {available > 0 ? (
              <button
                className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-green px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-green-dark"
                onClick={() => {
                  joinTeam(target.id);
                  setActiveView("cand");
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" /> Rejoindre cette équipe
              </button>
            ) : (
              <button
                className="inline-flex w-full items-center justify-center rounded-2xl bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground"
                disabled
              >
                Équipe complète
              </button>
            )}
            <button
              className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-brand-cyan"
              onClick={() => setActiveView("cand")}
            >
              Voir toutes les équipes
            </button>
          </div>
        </div>
      </div>
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
          🏠 Aucune candidature pour le moment. Soyez le premier à postuler !
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-lg font-semibold">
            👥 {realCandidatures.length} candidat
            {realCandidatures.length > 1 ? "s" : ""}
          </h3>
        </div>

        {candidateActionFeedback ? (
          <div className="rounded-2xl border border-brand-cyan/20 bg-brand-cyan-light/30 px-4 py-3 text-sm text-brand-cyan-dark">
            {candidateActionFeedback}
          </div>
        ) : null}

        {realCandidatures.map((candidat) => {
          const isCurrentUser = candidat.id_utilisateur === user?.id;
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
                        Vous
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
                        ? "✅ Accepté"
                        : candidat.statut === "refusee"
                          ? "❌ Refusé"
                          : "⏳ En attente"}
                    </span>
                  </div>
                  {isAnnonceOwner && !isCurrentUser ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleCandidateDecision(candidat.id_candidature, "discuss")}
                        disabled={candidateActionLoading === candidat.id_candidature}
                        className="rounded-2xl border border-border bg-card px-3 py-2 text-sm font-semibold text-brand-cyan-dark hover:bg-brand-cyan-light disabled:opacity-60"
                      >
                        {candidateActionLoading === candidat.id_candidature ? "Traitement..." : "Discuter"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCandidateDecision(candidat.id_candidature, "accept")}
                        disabled={candidateActionLoading === candidat.id_candidature}
                        className="rounded-2xl bg-brand-green px-3 py-2 text-sm font-semibold text-white hover:bg-brand-green-dark disabled:opacity-60"
                      >
                        Accepter
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCandidateDecision(candidat.id_candidature, "refuse")}
                        disabled={candidateActionLoading === candidat.id_candidature}
                        className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                      >
                        Refuser
                      </button>
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
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-cyan-light px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-cyan-dark">
                Aperçu maquette
              </span>
              <h1 className="bebas mt-4 text-4xl leading-tight">
                Candidatures & constitution de la colocation
              </h1>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Une simulation inspirée du parcours Sarintany'COLOC pour suivre
                les candidatures, organiser les équipes et valider la
                colocation.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "flux", label: "Validation individuelle · Membre" },
                { id: "track", label: "Colocation complète · Déposant" },
                { id: "cand", label: "Colocation complète · Candidat" },
                { id: "join", label: "Rejoindre une équipe · Candidat" },
                { id: "won", label: "Notif · Colocataire validé" },
                { id: "lost", label: "Notif · Colocataire non retenu" },
              ].map((button) => (
                <button
                  key={button.id}
                  type="button"
                  onClick={() => changeView(button.id as typeof activeView)}
                  className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                    activeView === button.id
                      ? activeButtonClass
                      : inactiveButtonClass
                  }`}
                >
                  {button.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {!authLoading && !user ? (
          <div className="mt-8 rounded-3xl border border-border bg-card p-8 text-center">
            <p className="text-lg font-semibold">
              Connecte-toi pour accéder à ce simulateur amélioré.
            </p>
            <p className="mt-2 text-muted-foreground">
              La maquette est accessible pour les membres connectés.
            </p>
            <Link
              to="/auth?mode=signin&redirect=/candidatures"
              className="mt-6 inline-flex rounded-2xl bg-brand-cyan px-6 py-3 text-sm font-semibold text-white hover:bg-brand-cyan-dark"
            >
              Se connecter
            </Link>
          </div>
        ) : authLoading ? (
          <div className="mt-8 rounded-3xl border border-border bg-card p-8 text-center text-muted-foreground">
            Chargement de votre session...
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {/* ===== SECTION CANDIDATURES RÉELLES ===== */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                <h2 className="bebas text-2xl">📋 Candidatures reçues</h2>

                {/* 🔥 BOUTON POSTULER - S'AFFICHE SI L'UTILISATEUR N'A PAS POSTULÉ */}
                {!hasApplied && user && annonceId && (
                  <button
                    onClick={() => setShowPostulerModal(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-brand-cyan px-4 py-2 text-sm font-semibold text-white hover:bg-brand-cyan-dark transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    Postuler à cette coloc
                  </button>
                )}

                {/* 🔥 BOUTON VOIR MA CANDIDATURE - S'AFFICHE SI L'UTILISATEUR A POSTULÉ */}
                {hasApplied && user && (
                  <Link
                    to={`/candidatures?annonceId=${annonceId}`}
                    className="inline-flex items-center gap-2 rounded-2xl border border-brand-cyan bg-brand-cyan-light/30 px-4 py-2 text-sm font-semibold text-brand-cyan-dark hover:bg-brand-cyan-light transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Voir ma candidature
                  </Link>
                )}
              </div>

              {/* 🔥 BOUTON VOIR MA CANDIDATURE - TOUJOURS AFFICHÉ EN DESSOUS */}
              <div className="mt-4 border-t border-border pt-4">
                <button
                  onClick={handleViewMyCandidature}
                  className="inline-flex items-center gap-2 rounded-2xl border border-brand-cyan bg-brand-cyan-light/30 px-4 py-2 text-sm font-semibold text-brand-cyan-dark hover:bg-brand-cyan-light transition-colors w-full sm:w-auto justify-center"
                >
                  <Eye className="h-4 w-4" />
                  Voir ma candidature
                </button>

                {/* 🔥 MESSAGE SI NON POSTULÉ */}
                {showNotAppliedMessage && (
                  <div className="mt-3 p-3 rounded-2xl bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                    ⚠️ Vous n'avez pas encore postulé à cette annonce.
                    <br />
                    <span className="text-xs text-yellow-600">
                      Postulez en cliquant sur le bouton "Postuler à cette
                      coloc" ci-dessus.
                    </span>
                  </div>
                )}

                {/* 🔥 MESSAGE SI DÉJÀ POSTULÉ */}
                {hasApplied && (
                  <div className="mt-3 p-3 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />✅ Vous avez
                    déjà postulé à cette annonce.
                    <span className="text-xs text-green-600 ml-2">
                      Cliquez sur "Voir ma candidature" pour voir toutes les
                      candidatures.
                    </span>
                  </div>
                )}
              </div>

              {/* AFFICHER LES CANDIDATURES SEULEMENT SI annonceId EXISTE */}
              {annonceId && renderRealCandidatures()}
            </div>

            {/* ===== VUE FLUX ===== */}
            {activeView === "flux" && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-cyan-light text-brand-cyan-dark">
                        <UserCheck className="h-8 w-8" />
                      </div>
                      <div>
                        <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                          Analakely · T4 · 95 m² · 3 colocataires
                        </div>
                        <div className="bebas text-3xl text-brand-cyan-dark mt-2">
                          450 000 Ar{" "}
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
                        avant d'accepter. La coloc se lance quand les 3 places
                        sont pourvues.
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

                  <button
                    className="w-full rounded-3xl bg-brand-green px-5 py-4 text-base font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-muted"
                    disabled={ownerFilled < TARGET}
                    onClick={launchColoc}
                  >
                    {ownerFilled < TARGET
                      ? `Lancer la colocation (${ownerFilled}/${TARGET})`
                      : "Lancer la colocation 🎉"}
                  </button>
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
                          Analakely · T4 · 95 m² · 3 colocataires
                        </div>
                        <div className="bebas text-3xl text-brand-cyan-dark mt-2">
                          450 000 Ar{" "}
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
                      Mode : Colocation complète
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Les candidat·e·s forment des équipes. La première équipe
                      au complet l'emporte, mais c'est toi qui valides l'équipe
                      complète ou attends encore un peu.
                    </p>
                  </div>

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
                    Simuler la vue « Agent immobilier » (frais d'agence)
                  </button>

                  {agentView && (
                    <div className="rounded-3xl border border-brand-cyan-light bg-brand-cyan-light/40 p-5">
                      <div className="flex items-center justify-between text-sm text-brand-cyan-dark">
                        <span>Frais d'agence (total)</span>
                        <span className="font-semibold">
                          {fmtAr(FEE_TOTAL)} Ar
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                        <span>Répartis sur</span>
                        <span>{TARGET} colocataires</span>
                      </div>
                      <div className="mt-3 border-t border-brand-cyan/20 pt-3 text-sm font-semibold text-brand-cyan-dark">
                        <span>Part par colocataire</span>
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
                        Colocation attribuée
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        L'équipe <b>{validatedTeam.title}</b> a été validée. La
                        colocation peut démarrer.
                      </p>
                      <div className="mt-4">
                        {renderAvStack(validatedTeam.members)}
                      </div>
                    </div>
                  ) : winnerTeam ? (
                    <div className="rounded-3xl border border-border bg-background p-5">
                      <div className="flex items-center gap-3 text-lg font-semibold text-brand-cyan-dark">
                        <Trophy className="h-5 w-5" />
                        Une équipe est complète !
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        L'équipe <b>{winnerTeam.title}</b> a réuni {TARGET}{" "}
                        colocataires.
                      </p>
                      <div className="mt-4">
                        {renderAvStack(winnerTeam.members)}
                      </div>
                      <div className="mt-4 rounded-3xl border border-border bg-card p-4">
                        <div className="flex items-center justify-between text-sm font-semibold">
                          <span>Échéance dans</span>
                          <span>{countdown}</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Max 3 jours. Sans validation de ta part, l'attribution
                          deviendra automatique.
                        </p>
                      </div>
                      <button
                        className="mt-4 inline-flex w-full items-center justify-center rounded-3xl bg-brand-green px-4 py-3 text-sm font-semibold text-white hover:bg-brand-green-dark"
                        onClick={() => validateTeam(winnerTeam.id)}
                      >
                        Valider cette équipe
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
                                Équipe validée
                              </span>
                            ) : isLocked ? (
                              <span className="text-xs font-semibold text-muted-foreground">
                                Hors course
                              </span>
                            ) : team.members.length >= TARGET ? (
                              <span className="rounded-full bg-brand-cyan-light px-3 py-1 text-xs font-semibold text-brand-cyan-dark">
                                Complète
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {TARGET - team.members.length} place(s)
                                restante(s)
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
                      Simuler : une équipe se complète
                    </button>
                  )}

                  <p className="text-sm text-muted-foreground">
                    Tu ne choisis pas qui rejoint quelle équipe : les
                    candidat·e·s s'organisent entre eux. Ton rôle est de valider
                    l'équipe complète — ou d'attendre jusqu'à l'échéance, après
                    quoi l'attribution devient automatique.
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
                            ? "Ton équipe a remporté la coloc !"
                            : "La coloc a été attribuée à une autre équipe"
                          : winnerTeam
                            ? winnerTeam.members.includes(userName)
                              ? "Équipe complète — en attente de validation du propriétaire"
                              : "Une équipe est complète — validation en cours"
                            : myTeamData
                              ? "Tu es dans une équipe"
                              : "Forme ton équipe pour remporter la coloc"}
                      </div>
                      <h2 className="bebas mt-4 text-3xl">
                        3 places à pourvoir
                      </h2>
                      <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
                        Rejoins une équipe qui te ressemble, ou crée la tienne.
                        La première équipe complète remporte le logement.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 rounded-3xl bg-brand-cyan-light/50 px-4 py-3 text-sm font-semibold text-brand-cyan-dark">
                      <Sparkles className="h-5 w-5" />
                      {isCourseFinished
                        ? "Course terminée"
                        : myTeamData
                          ? "Tu as déjà une équipe"
                          : "Choisis ta stratégie"}
                    </div>
                  </div>
                </div>

                {agentView && (
                  <div className="rounded-3xl border border-brand-cyan-light bg-brand-cyan-light/40 p-5 text-sm text-brand-cyan-dark">
                    <div className="font-semibold">Frais d'agence</div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-3xl bg-card p-4 text-center">
                        <div className="text-xs uppercase text-muted-foreground">
                          Total
                        </div>
                        <div className="bebas text-2xl mt-2">
                          {fmtAr(FEE_TOTAL)} Ar
                        </div>
                      </div>
                      <div className="rounded-3xl bg-card p-4 text-center">
                        <div className="text-xs uppercase text-muted-foreground">
                          Par coloc
                        </div>
                        <div className="bebas text-2xl mt-2">
                          {fmtAr(Math.round(FEE_TOTAL / TARGET))} Ar
                        </div>
                      </div>
                      <div className="rounded-3xl bg-card p-4 text-center text-muted-foreground">
                        Chaque candidat voit sa part exacte avant de rejoindre
                        une équipe.
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold">
                        Équipes en formation
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {teams.length} équipes
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {teams.reduce(
                        (sum, team) => sum + team.members.length,
                        0,
                      )}{" "}
                      candidats au total
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
                                    Mon équipe
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
                                  Quitter
                                </button>
                              ) : isCourseFinished ? (
                                <button
                                  className="rounded-2xl bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground"
                                  disabled
                                >
                                  Course terminée
                                </button>
                              ) : full ? (
                                <button
                                  className="rounded-2xl bg-brand-cyan-light px-4 py-2 text-sm font-semibold text-brand-cyan-dark"
                                  disabled
                                >
                                  Complète
                                </button>
                              ) : myTeam ? (
                                <button
                                  className="rounded-2xl border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground hover:border-brand-cyan"
                                  onClick={() => switchTeam(team.id)}
                                >
                                  Rejoindre plutôt
                                </button>
                              ) : (
                                <button
                                  className="rounded-2xl bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-brand-green-dark"
                                  onClick={() => joinTeam(team.id)}
                                >
                                  Rejoindre
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
                        Crée ta propre équipe
                      </p>
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <button
                          className="rounded-2xl bg-brand-cyan px-4 py-3 text-sm font-semibold text-white hover:bg-brand-cyan-dark"
                          onClick={() => setCreateOpen(true)}
                        >
                          Créer et rejoindre
                        </button>
                        <span>
                          ou choisis une équipe existante parmi la liste.
                        </span>
                      </div>
                    </div>
                  )}

                  {createOpen && (
                    <div className="mt-5 rounded-3xl border border-border bg-card p-5">
                      <div className="grid gap-4">
                        <label className="text-sm font-semibold">
                          Titre de l'équipe
                          <input
                            type="text"
                            value={createTitle}
                            onChange={(e) => setCreateTitle(e.target.value)}
                            maxLength={40}
                            placeholder="Ex : Les lève-tôt studieux"
                            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-cyan"
                          />
                        </label>
                        <label className="text-sm font-semibold">
                          Ambiance souhaitée{" "}
                          <span className="text-muted-foreground">
                            (3 lignes max)
                          </span>
                          <textarea
                            value={createMood}
                            onChange={(e) => setCreateMood(e.target.value)}
                            maxLength={180}
                            placeholder="Décris l'esprit de la coloc : rythme, valeurs, vie commune..."
                            className="mt-2 h-32 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-cyan"
                          />
                        </label>
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            className="rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-brand-cyan"
                            onClick={() => setCreateOpen(false)}
                          >
                            Annuler
                          </button>
                          <button
                            className="rounded-2xl bg-brand-green px-4 py-3 text-sm font-semibold text-white hover:bg-brand-green-dark"
                            onClick={createTeam}
                          >
                            Créer et rejoindre
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
                          Conversation de l'équipe
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
                        placeholder="Écris un message au groupe..."
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

            {activeView === "won" && (
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
                      ? `Ta candidature est retenue : tu fais partie de la colocation Analakely · T4. Bienvenue ! Emménagement prévu le ${MOVEIN}.`
                      : "Votre équipe « Les lève-tôt studieux » remporte la colocation Analakely · T4 ! Vous allez vivre ensemble dès le " +
                        MOVEIN +
                        "."}
                  </p>
                  <div className="mt-6 rounded-3xl border border-border bg-card p-5 text-left text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-brand-cyan-dark" />
                      <div>
                        <div className="font-semibold">Emménagement</div>
                        <div>{MOVEIN}</div>
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

            {activeView === "lost" && (
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
                      ? "Une autre équipe s'est complétée en premier pour Analakely · T4. Ça arrive vite ! De nombreuses colocations cherchent encore des profils comme le tien."
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

      {/* ===== MODAL DE POSTULATION ===== */}
      {showPostulerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                📝 Postuler à la colocation
              </h3>
              <button
                onClick={() => setShowPostulerModal(false)}
                className="rounded-full p-2 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Envoyez un message personnalisé pour augmenter vos chances d'être
              retenu.
            </p>

            <textarea
              value={candidatureMessage}
              onChange={(e) => setCandidatureMessage(e.target.value)}
              placeholder="Présentez-vous brièvement et expliquez pourquoi vous êtes intéressé..."
              className="w-full rounded-2xl border border-border p-3 text-sm outline-none focus:border-brand-cyan min-h-[120px] resize-none transition-colors"
            />

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowPostulerModal(false)}
                className="flex-1 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handlePostuler}
                className="flex-1 rounded-2xl bg-brand-cyan px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-cyan-dark transition-colors"
              >
                Envoyer ma candidature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL DE CÉLÉBRATION ===== */}
      {celebrateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-cyan-light px-3 py-1.5 text-sm font-semibold text-brand-cyan-dark">
                  <Sparkles className="h-4 w-4" /> Célébration
                </div>
                <h2 className="bebas mt-4 text-3xl">
                  Toutes nos félicitations !
                </h2>
              </div>
              <button
                type="button"
                className="rounded-full bg-muted p-3 text-muted-foreground hover:bg-muted/80"
                onClick={closeCelebrate}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Tu as permis à plusieurs colocataires de se rencontrer à travers
              ton logement pour un mieux vivre ensemble.
            </p>
            <div className="mt-6 rounded-3xl border border-border bg-brand-cyan-light/30 p-6">
              <div className="text-sm text-muted-foreground">Logement</div>
              <div className="bebas text-2xl text-brand-cyan-dark mt-2">
                Analakely · T4 · 95 m² · 450 000 Ar / mois
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Colocataires —{" "}
                {ownerRetained.map((c) => c.name).join(" · ") || "—"}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Début d'emménagement — {MOVEIN}
              </div>
            </div>
            <button
              type="button"
              className="mt-6 w-full rounded-3xl bg-brand-green px-5 py-3 text-sm font-semibold text-white hover:bg-brand-green-dark"
              onClick={closeCelebrate}
            >
              Terminer
            </button>
          </div>
        </div>
      )}

      {/* ===== MODAL CONTRAT ===== */}
      {contractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-cyan-light px-3 py-1.5 text-sm font-semibold text-brand-cyan-dark">
                  <Sparkles className="h-4 w-4" /> Assistance Coloc'KOO
                </div>
                <h2 className="bebas mt-4 text-3xl">
                  Choisis ton aide pour finaliser la colocation
                </h2>
              </div>
              <button
                type="button"
                className="rounded-full bg-muted p-3 text-muted-foreground hover:bg-muted/80"
                onClick={closeContractModal}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Avant de lancer la colocation, choisis si tu veux une aide pour le
              contrat, l'état des lieux, ou les deux.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <button
                type="button"
                className="rounded-3xl border border-border bg-card px-4 py-5 text-left text-sm font-semibold text-brand-cyan-dark hover:border-brand-cyan"
                onClick={() => confirmContractChoice("contrat")}
              >
                <div className="text-lg font-semibold">Aide au contrat</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Contrat de colocation conforme, rédigé avec les noms et
                  l'adresse.
                </div>
              </button>
              <button
                type="button"
                className="rounded-3xl border border-border bg-card px-4 py-5 text-left text-sm font-semibold text-brand-cyan-dark hover:border-brand-cyan"
                onClick={() => confirmContractChoice("edl")}
              >
                <div className="text-lg font-semibold">
                  Aide à l'état des lieux
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Document d'état des lieux pré-rempli pour l'entrée et la
                  sortie.
                </div>
              </button>
              <button
                type="button"
                className="rounded-3xl border border-border bg-card px-4 py-5 text-left text-sm font-semibold text-brand-cyan-dark hover:border-brand-cyan"
                onClick={() => confirmContractChoice("both")}
              >
                <div className="text-lg font-semibold">Les deux Monsieur !</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Contrat + état des lieux ensemble, prêt à être envoyé.
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL DE DISCUSSION ===== */}
      {chatModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center gap-3 border-b border-border p-4">
              <button
                type="button"
                onClick={closeChat}
                className="rounded-full p-2 hover:bg-muted transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-cyan text-white flex items-center justify-center font-semibold">
                  {selectedCandidate.initials}
                </div>
                <div>
                  <div className="font-semibold">{selectedCandidate.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedCandidate.subtitle}
                  </div>
                </div>
              </div>
              <div className="ml-auto">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
                <span className="ml-2 text-xs text-muted-foreground">
                  En ligne
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.who === "Toi" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      msg.who === "Toi"
                        ? "bg-brand-cyan text-white rounded-tr-none"
                        : "bg-white border border-border text-foreground rounded-tl-none"
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1 opacity-70">
                      {msg.who === "Toi" ? "Vous" : msg.who}
                    </div>
                    <p className="text-sm whitespace-pre-line">{msg.txt}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-4 bg-white rounded-b-3xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Écris ton message..."
                  className="flex-1 rounded-2xl border border-border bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-brand-cyan focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  className="rounded-2xl bg-brand-cyan px-4 py-2.5 text-white hover:bg-brand-cyan-dark transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
