import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Home, Mail } from "lucide-react";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/Button";
import { AuthUser, Poste } from "../lib/api";
import { roleLevel, useAuth } from "../lib/auth";

const MIN_SIGNUP_AGE = 17;

function maxBirthDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - MIN_SIGNUP_AGE);
  return d.toISOString().slice(0, 10);
}

function isOldEnough(birthDate: string): boolean {
  if (!birthDate) return false;
  const birth = new Date(birthDate);
  const limit = new Date();
  limit.setFullYear(limit.getFullYear() - MIN_SIGNUP_AGE);
  return birth <= limit;
}

const postes: { value: Poste; label: string }[] = [
  { value: "colocataire", label: "colocataire" },
  { value: "proprietaire", label: "proprietaire" },
  { value: "agent", label: "agent" },
  /*{ value: 'moderateur', label: 'moderateur' },
  { value: 'admin', label: 'admin' },
  { value: 'superadmin', label: 'superadmin' },*/
];

type AuthForm = {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  mot_de_passe: string;
  poste: Poste | "";
  date_naissance: string;
};

// Destination après connexion : un compte non staff ne doit jamais être
// renvoyé vers /admin (AdminRoute le renverrait ici → boucle = page blanche).
function destinationFor(connected: AuthUser, redirect: string | null) {
  const isStaff = roleLevel(connected.poste) > 0;
  if (redirect && (isStaff || !redirect.startsWith("/admin"))) return redirect;
  return isStaff ? "/admin" : "/compte";
}

export default function Auth() {
  const { t } = useTranslation("auth");
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(
    params.get("mode") === "signup" ? "signup" : "signin",
  );
  const [form, setForm] = useState<AuthForm>({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    mot_de_passe: "",
    // Aucun profil présélectionné : l'utilisateur doit choisir explicitement.
    poste: "",
    date_naissance: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Compte tout juste créé : on affiche la confirmation avant de rediriger.
  const [createdAccount, setCreatedAccount] = useState<AuthUser | null>(null);
  const justRegistered = useRef(false);
  // "Quitter" doit ramener là où l'utilisateur venait (ex: son brouillon
  // d'annonce en cours) plutôt que toujours à l'accueil.
  const backTo = params.get("redirect") || "/";
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || justRegistered.current) return;
    navigate(destinationFor(user, params.get("redirect")), { replace: true });
  }, [navigate, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const continueAfterSignup = () => {
    if (!createdAccount) return;
    navigate(destinationFor(createdAccount, params.get("redirect")), { replace: true });
  };

  useEffect(() => {
    if (!createdAccount) return;
    const timer = window.setTimeout(continueAfterSignup, 5000);
    return () => window.clearTimeout(timer);
  }, [createdAccount]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    // Les gestionnaires de mots de passe (générateur Google, Bitwarden…)
    // remplissent parfois les champs sans déclencher onChange : on relit donc
    // les valeurs réellement présentes dans le formulaire.
    const formData = new FormData(e.currentTarget);
    const read = (name: keyof AuthForm) => {
      const value = formData.get(name);
      return typeof value === "string" && value !== "" ? value : form[name];
    };
    const values: AuthForm = {
      prenom: read("prenom"),
      nom: read("nom"),
      email: read("email"),
      telephone: read("telephone"),
      mot_de_passe: read("mot_de_passe"),
      poste: read("poste") as AuthForm["poste"],
      date_naissance: read("date_naissance"),
    };
    setForm(values);

    if (mode === "signup" && !values.poste) {
      setError(t("roleRequired"));
      return;
    }
    if (mode === "signup" && !isOldEnough(values.date_naissance)) {
      setError(`Tu dois avoir au moins ${MIN_SIGNUP_AGE} ans pour créer un compte.`);
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "signin") {
        const connected = await login(values.email, values.mot_de_passe);
        navigate(destinationFor(connected, params.get("redirect")), { replace: true });
        return;
      }
      justRegistered.current = true;
      const connected = await register({
        email: values.email,
        mot_de_passe: values.mot_de_passe,
        nom: values.nom,
        prenom: values.prenom,
        telephone: values.telephone || undefined,
        poste: values.poste as Poste,
        date_naissance: values.date_naissance,
      });
      setCreatedAccount(connected);
    } catch (err) {
      justRegistered.current = false;
      setError(err instanceof Error ? err.message : t("loginError"));
    } finally {
      setSubmitting(false);
    }
  }

  // Fonction pour obtenir le label traduit d'un poste
  const getPosteLabel = (posteValue: string): string => {
    const translationMap: Record<string, string> = {
      colocataire: t("colocataire"),
      proprietaire: t("proprietaire"),
      agent: t("agent"),
      moderateur: t("moderateur"),
      admin: t("admin"),
      superadmin: t("superadmin"),
    };
    return translationMap[posteValue] || posteValue;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.18),_transparent_35%),linear-gradient(135deg,_#f8fcff_0%,_#eef7f4_100%)] grid md:grid-cols-[1.05fr_0.95fr] relative overflow-hidden">
      <div className="hidden md:flex bg-gradient-to-br from-brand-cyan via-brand-cyan-dark to-brand-green p-12 text-white flex-col justify-between relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_35%)]" />
        {/* Bouton retour (desktop) aligné à côté du logo, et non plus superposé à lui */}
        <div className="relative z-10 flex items-center gap-4">
          <Link
            to={backTo}
            aria-label={t("back")}
            className="flex shrink-0 items-center justify-center rounded-full bg-black/20 p-2.5 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/30 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="rounded-2xl bg-white/90 px-3 py-2">
            <Logo />
          </div>
        </div>
        <div className="relative z-10">
          <div className="bebas text-5xl leading-none">{t("welcome")}</div>
          <p className="mt-4 text-white/85 max-w-sm">
            {t("verifiedAnnouncements")}
          </p>
        </div>
        <div className="relative z-10 text-xs text-white/60">2026 {t("copyright")}</div>
      </div>

      <div className="flex items-center justify-center p-4 sm:p-8 relative">
        {/* Bouton retour - Version mobile */}
        <Link
          to={backTo}
          className="md:hidden absolute top-4 left-4 z-10 flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium bg-white/80 hover:bg-white backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-200/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden xs:inline">{t(" ")}</span>
        </Link>

        <div className="w-full max-w-md rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_20px_80px_-20px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-8">
          <div className="md:hidden mb-6 flex justify-center">
            <Logo />
          </div>
          {createdAccount ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-green-light text-brand-green-dark">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="bebas text-3xl text-slate-900">{t("accountCreatedTitle")}</h1>
              <p className="mt-3 text-sm text-slate-600">
                {t("accountCreatedWelcome", { name: createdAccount.prenom || createdAccount.name || "" })}
              </p>
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-brand-cyan/20 bg-brand-cyan-light/60 p-3 text-left text-sm text-slate-700">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan-dark" />
                <span>{t("confirmationEmailSent", { email: createdAccount.email })}</span>
              </div>
              <Button
                type="button"
                onClick={continueAfterSignup}
                className="mt-6 w-full bg-gradient-to-r from-brand-cyan to-brand-green hover:opacity-90 text-white shadow-lg shadow-brand-cyan/20"
              >
                {t("continue")}
              </Button>
            </div>
          ) : (
          <>
          <div className="flex gap-1 p-1 bg-muted rounded-xl text-sm mb-6">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 py-2 rounded-md font-semibold ${
                mode === "signin"
                  ? "bg-white shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {t("signin")}
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-md font-semibold ${
                mode === "signup"
                  ? "bg-white shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {t("signup")}
            </button>
          </div>

          <h1 className="bebas text-3xl text-slate-900">
            {mode === "signin" ? t("welcomeBack") : t("createAccount")}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {mode === "signin"
              ? t("signinDescription")
              : t("signupDescription")}
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                      {t("firstName")}
                    </label>
                    <input
                      required
                      name="prenom"
                      autoComplete="given-name"
                      className="input"
                      value={form.prenom}
                      onChange={(e) =>
                        setForm({ ...form, prenom: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                      {t("lastName")}
                    </label>
                    <input
                      required
                      name="nom"
                      autoComplete="family-name"
                      className="input"
                      value={form.nom}
                      onChange={(e) =>
                        setForm({ ...form, nom: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                    {t("birthDate")}
                  </label>
                  <input
                    required
                    type="date"
                    name="date_naissance"
                    autoComplete="bday"
                    max={maxBirthDate()}
                    className="input"
                    value={form.date_naissance}
                    onChange={(e) =>
                      setForm({ ...form, date_naissance: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                    {t("role")}
                  </label>
                  <select
                    required
                    name="poste"
                    className={`input ${form.poste ? "" : "text-muted-foreground"}`}
                    value={form.poste}
                    onChange={(e) =>
                      setForm({ ...form, poste: e.target.value as Poste })
                    }
                  >
                    <option value="" disabled>
                      {t("selectRole")}
                    </option>
                    {postes.map((poste) => (
                      <option key={poste.value} value={poste.value} className="text-foreground">
                        {getPosteLabel(poste.value)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                    {t("phone")}
                  </label>
                  <input
                    required
                    type="tel"
                    name="telephone"
                    autoComplete="tel"
                    className="input"
                    placeholder="+261 34 00 000 00"
                    value={form.telephone}
                    onChange={(e) =>
                      setForm({ ...form, telephone: e.target.value })
                    }
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                {t("email")}
              </label>
              <input
                required
                type="email"
                name="email"
                autoComplete={mode === "signup" ? "email" : "username"}
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                {t("password")}
              </label>
              <div className="relative">
                <input
                  required
                  minLength={6}
                  type={showPassword ? "text" : "password"}
                  name="mot_de_passe"
                  // "new-password" active la suggestion de mot de passe fort
                  // (Google / gestionnaires) à l'inscription.
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  className="input pr-12"
                  value={form.mot_de_passe}
                  onChange={(e) =>
                    setForm({ ...form, mot_de_passe: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 transition hover:text-slate-700"
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === "signup" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("passwordMinLength")}
                </p>
              )}
            </div>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <Button
              disabled={submitting}
              type="submit"
              className="w-full bg-gradient-to-r from-brand-cyan to-brand-green hover:opacity-90 text-white shadow-lg shadow-brand-cyan/20"
            >
              {submitting
                ? t("processing")
                : mode === "signin"
                  ? t("signinBtn")
                  : t("signupBtn")}
            </Button>
          </form>

          <div className="mt-6 text-xs text-center text-muted-foreground space-y-2">
            <Link
              to="/admin"
              className="text-brand-cyan-dark font-semibold block"
            >
              {t("backOfficeAccess")}
            </Link>

            {/* Bouton retour vers le site - Version texte en bas */}
            <Link
              to={backTo}
              className="inline-flex items-center gap-1.5 text-muted-foreground/70 hover:text-brand-cyan-dark transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t("")}</span>
            </Link>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
