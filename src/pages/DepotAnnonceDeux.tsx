import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bed,
  Bell,
  Briefcase,
  Calculator,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Gift,
  Hand,
  HeartHandshake,
  Home,
  Info,
  KeyRound,
  ListChecks,
  Loader2,
  Lock,
  MapPin,
  MessageCircle,
  Plus,
  Receipt,
  Save,
  Scale,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
  UsersRound,
  Wallet,
  Wrench,
  X,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, ZoomControl, useMap, useMapEvents } from 'react-leaflet'
import { Icon as LeafletIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png'
import { SiteLayout } from '../components/site/SiteLayout'
import { api, type ApiAnnonce } from '../lib/api'
import { useAuth } from '../lib/auth'
import { geocodeAddress } from '../lib/geocoding'
import { cn } from '../lib/utils'

/* ============================================================================
 * DepotAnnonceDeux.tsx
 * ----------------------------------------------------------------------------
 * Port fidèle de la maquette client sarintany_coloc_depot_v39_1.html
 * (parcours de dépôt d'annonce) + corrections du PDF
 * "Suite réunion 20260804 - DEPOT".
 *
 * AMÉLIORATION CARTE : la fausse carte CSS a été remplacée par une VRAIE carte
 * Leaflet (tuiles OpenStreetMap). Quand on tape un lieu dans
 * « Localisation du bien », la carte se recentre automatiquement dessus et le
 * repère y est placé. Le repère reste déplaçable / plaçable au clic.
 * ==========================================================================*/

type Lang = 'FR' | 'MG' | 'ENG'
type Role = 'membre' | 'proprio' | 'pro' | null

const LAUNCH_FREE = true // offre partenaire offerte pendant le lancement (cf. PDF étape 4/7)

/* ---------------------------------------------------------------------- */
/*  Brouillon "publier après connexion"                                    */
/* ---------------------------------------------------------------------- */
// Quand un visiteur non connecté clique sur « Publier », on enregistre tout
// son formulaire ici avant de l'envoyer se connecter. Une fois connecté et
// redirigé vers cette page, le formulaire est restauré et la publication se
// termine automatiquement, sans que la personne ait à tout ressaisir.
const DEPOT_DRAFT_KEY = 'colockoo_depot_annonce_draft_v1'
const DEPOT_DRAFT_MAX_AGE_MS = 2 * 60 * 60 * 1000 // 2h

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function dataUrlToFile(dataUrl: string, filename: string, mime: string): File {
  const [, base64 = ''] = dataUrl.split(',')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new File([bytes], filename, { type: mime })
}

/* ---------------------------------------------------------------------- */
/*  i18n minimal                                                           */
/* ---------------------------------------------------------------------- */
const STR = {
  nav_register: { FR: "S'inscrire", MG: 'Misoratra', ENG: 'Sign up' },
  step_word: { FR: 'Étape', MG: 'Dingana', ENG: 'Step' },
  progress: { FR: 'Progression', MG: 'Fandrosoana', ENG: 'Progress' },
  intro_h: { FR: 'Dépose ton', MG: 'Apetraho ny', ENG: 'Post your' },
  intro_h2: { FR: 'annonce', MG: 'tatitra', ENG: 'listing' },
  intro_p: {
    FR: "Gratuit et en moins de 5 minutes · Tu peux t'arrêter quand tu veux, ton brouillon sera conservé",
    MG: "Maimaim-poana, latsaky ny 5 minitra · Afaka mijanona ianao na oviana na oviana, hotehirizina ny brouillon-nao",
    ENG: 'Free and in under 5 minutes · Stop whenever you like, your draft will be saved',
  },
  draft_save: { FR: 'Enregistrer le brouillon', MG: 'Tehirizo ny brouillon', ENG: 'Save draft' },
  draft_saved: { FR: 'Brouillon enregistré', MG: 'Voatahiry ny brouillon', ENG: 'Draft saved' },
  back: { FR: 'Retour', MG: 'Hiverina', ENG: 'Back' },
  next: { FR: 'Continuer', MG: 'Hanohy', ENG: 'Continue' },
  publish: { FR: 'Publier mon annonce', MG: 'Avoaka ny tatitro', ENG: 'Publish my listing' },
} as const

function useLang() {
  const [lang, setLang] = useState<Lang>('FR')
  const t = (key: keyof typeof STR) => STR[key][lang]
  return { lang, setLang, t }
}

/* ---------------------------------------------------------------------- */
/*  Données "services mutualisés Coloc'KOO"                               */
/* ---------------------------------------------------------------------- */
type CkooServiceType = 'hour' | 'forfait' | 'annual' | 'stere'
interface CkooService {
  id: string
  type: CkooServiceType
  price: number
  star?: boolean
  note?: string
  name: string
}
const CKOO_SERVICES: CkooService[] = [
  { id: 'menage', type: 'hour', price: 5800, name: 'Propreté (ménage, linge, etc.)' },
  { id: 'jardin', type: 'hour', price: 4500, name: 'Jardinage' },
  { id: 'gardien', type: 'hour', price: 10800, name: 'Gardiennage' },
  { id: 'jirama', type: 'forfait', price: 9000, name: 'Relevés Jirama et traçabilité' },
  {
    id: 'travaux',
    type: 'forfait',
    price: 46400,
    star: true,
    note: "Les achats et matériaux restent à la charge des colocataires. ≈ 3 jours/mois d'interventions comptabilisées en moyenne.",
    name: 'Entretien et réalisation petits travaux',
  },
  { id: 'ramonage', type: 'annual', price: 84000, name: 'Ramonage annuel' },
  { id: 'bois', type: 'stere', price: 14000, name: 'Livraison annuelle de bois de chauffe' },
]
const HOUR_DAY_OPTIONS = [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const MGMT_FEE_TABLE: Record<number, number> = { 0.5: 4400, 1: 8800, 2: 17600, 3: 26300, 4: 35100, 5: 43900, 6: 43900, 7: 43900 }
function mgmtFee(days: number) {
  if (days <= 0) return 0
  return MGMT_FEE_TABLE[days] ?? 43900
}
function groupThousands(n: number) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
function fmtAr(x: number) {
  return groupThousands(x)
}

interface SimSelection {
  checked: boolean
  days?: number
  qty?: number
}

/* ---------------------------------------------------------------------- */
/*  Dérivation du quartier à partir d'une adresse saisie librement.        */
/* ---------------------------------------------------------------------- */
function deriveQuartierFromAddress(addr: string): string {
  const trimmed = addr.trim()
  if (!trimmed) return ''
  const firstSegment = trimmed.split(',')[0]?.trim()
  return firstSegment || trimmed
}

// Géocodage de secours via OpenStreetMap (couvre Madagascar, contrairement
// à certaines API qui ne couvrent que la France).
async function geocodeMadagascar(query: string): Promise<[number, number] | null> {
  try {
    const base = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1'
    const urls = [
      `${base}&countrycodes=mg&q=${encodeURIComponent(query)}`,
      `${base}&q=${encodeURIComponent(`${query}, Madagascar`)}`,
    ]
    for (const url of urls) {
      const res = await fetch(url, { headers: { 'Accept-Language': 'fr' } })
      if (!res.ok) continue
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lon = parseFloat(data[0].lon)
        if (Number.isFinite(lat) && Number.isFinite(lon)) return [lat, lon]
      }
    }
    return null
  } catch {
    return null
  }
}

/* ---------------------------------------------------------------------- */
/*  VRAIE carte Leaflet — tuiles OSM, repère déplaçable, recentrage auto   */
/* ---------------------------------------------------------------------- */
const markerIcon = new LeafletIcon({
  iconUrl: iconUrl,
  shadowUrl: iconShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const DEFAULT_CENTER: [number, number] = [-18.8792, 47.5079]

// Recentre la carte en douceur vers le lieu trouvé (sans recharger la carte).
function MapController({ target }: { target: [number, number] | null }) {
  const map = useMap()
  const key = target ? target.join(',') : ''
  useEffect(() => {
    if (!target) return
    map.flyTo(target, Math.max(map.getZoom(), 15), { duration: 0.9 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return null
}

// Place le repère quand on clique sur la carte.
function MapClickCatcher({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function InteractiveMap({
  pin,
  onPlacePin,
  focus,
}: {
  pin: { x: number; y: number } | null
  onPlacePin: (pin: { x: number; y: number }) => void
  focus: [number, number] | null
}) {
  return (
    <div className="realmap">
      <MapContainer
        center={pin ? [pin.x, pin.y] : DEFAULT_CENTER}
        zoom={14}
        zoomControl={false}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · précision quartier'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <MapController target={focus} />
        <MapClickCatcher onPick={(lat, lng) => onPlacePin({ x: lat, y: lng })} />
        {pin && (
          <Marker
            position={[pin.x, pin.y]}
            icon={markerIcon}
            draggable
            eventHandlers={{
              dragend(e) {
                const next = (e.target as any).getLatLng()
                onPlacePin({ x: next.lat, y: next.lng })
              },
            }}
          />
        )}
      </MapContainer>
      <div className="dmap-hint">
        <Hand size={12} style={{ color: 'var(--cy)' }} /> Glisse pour te déplacer · molette pour zoomer · clique pour placer ton bien
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Petits composants utilitaires                                         */
/* ---------------------------------------------------------------------- */
function OptCard({
  icon: Icon,
  title,
  desc,
  on,
  onClick,
}: {
  icon: React.ElementType
  title: string
  desc: string
  on: boolean
  onClick: () => void
}) {
  return (
    <div className={cn('opt-card', on && 'on')} onClick={onClick}>
      <div className="oc-ico"><Icon size={18} /></div>
      <div>
        <div className="oc-t">{title}</div>
        <div className="oc-d">{desc}</div>
      </div>
    </div>
  )
}

function Pill({ label, on, onClick }: { label: React.ReactNode; on: boolean; onClick: () => void }) {
  return (
    <div className={cn('pill-opt', on && 'on')} onClick={onClick}>
      {label}
    </div>
  )
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={onChange} /> {label}
    </label>
  )
}

function MoneyInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  function step(delta: number) {
    let n = parseInt(value.replace(/\D/g, ''), 10)
    if (isNaN(n)) n = 0
    n = Math.max(0, n + delta)
    onChange(groupThousands(n))
  }
  return (
    <div className="money">
      <button type="button" className="money-step" onClick={() => step(-1000)}>−</button>
      <input
        className="money-inp"
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(groupThousands(parseInt(e.target.value.replace(/\D/g, ''), 10) || 0).replace(/^0$/, ''))}
      />
      <span className="money-suf">Ar</span>
      <button type="button" className="money-step" onClick={() => step(1000)}>+</button>
    </div>
  )
}

function ErrBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="err show">
      <AlertCircle size={13} /> {children}
    </div>
  )
}

/* ======================================================================
 *  COMPOSANT PRINCIPAL
 * ====================================================================*/
export default function DepotAnnonceDeux() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { lang, setLang, t } = useLang()

  /* ---- Mode renouvellement -------------------------------------------
     Si la page est montée sur /annonces/:id/renouveler (lien envoyé par
     l'email et la notification push dans cronExpired.js), `id` est défini.
     On réutilise alors tout le formulaire, préchargé avec les données de
     l'annonce, en affichant directement la dernière étape avec un bouton
     "Renouveler" à la place du bouton "Publier". Pas de stockage de
     données côté client : on relit l'annonce existante via l'API. ---- */
  const { id: annonceId } = useParams<{ id?: string }>()
  const isRenewal = !!annonceId

  const [loadingAnnonce, setLoadingAnnonce] = useState(isRenewal)
  const [renewing, setRenewing] = useState(false)
  const [renewSuccess, setRenewSuccess] = useState('')
  const [renewError, setRenewError] = useState('')

  /* ---- Navigation du wizard ---- */
  const [role, setRole] = useState<Role>(null)
  const [cur, setCur] = useState(0)
  const [maxStep, setMaxStep] = useState(0)
  const [stepErr, setStepErr] = useState<string | null>(null)

  const allStepDefs = [
    { key: 'statut', title: 'Ton statut', part: 1 },
    { key: 'esprit', title: "L'Esprit Coloc'", part: 2 },
    { key: 'logement', title: 'Le logement', part: 3 },
    { key: 'services', title: 'Les services', part: 4 },
    { key: 'chambre', title: 'La chambre', part: 5 },
    { key: 'regles', title: 'Les règles', part: 6 },
    { key: 'photos', title: 'Les photos', part: 7 },
    { key: 'publier', title: 'Publier', part: null },
  ] as const
  const stepsForRole = (r: Role) => allStepDefs.filter((s) => !(s.key === 'regles' && r === 'proprio'))
  const steps = useMemo(() => stepsForRole(role), [role])
  useEffect(() => {
    if (cur > steps.length - 1) setCur(steps.length - 1)
    if (maxStep > steps.length - 1) setMaxStep(steps.length - 1)
  }, [steps.length]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- Étape 1 : statut ---- */
  const isPaidRole = role === 'proprio' || role === 'pro'
  const mode: 'flux' | 'complete' = role === 'membre' ? 'flux' : 'complete'

  const [checkingExistingListing, setCheckingExistingListing] = useState(false)
  const [blockedExistingListing, setBlockedExistingListing] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function checkExistingListing() {
      if (role !== 'membre' || !user) {
        setBlockedExistingListing(false)
        return
      }
      setCheckingExistingListing(true)
      try {
        // TODO API : adapter à votre client API réel.
        const result = await (api as any).checkAnnonceExistante?.(role)
        if (!cancelled) {
          setBlockedExistingListing(Boolean(result?.hasActiveListing))
        }
      } catch {
        if (!cancelled) setBlockedExistingListing(false)
      } finally {
        if (!cancelled) setCheckingExistingListing(false)
      }
    }
    checkExistingListing()
    return () => {
      cancelled = true
    }
  }, [role, user])

  /* ---- Étape 2 : esprit coloc ---- */
  const [typeAnnonce, setTypeAnnonce] = useState<'existante' | 'creation' | ''>('')
  useEffect(() => {
    if (role && role !== 'membre' && !typeAnnonce) setTypeAnnonce('creation')
  }, [role]) // eslint-disable-line react-hooks/exhaustive-deps
  const [ambianceAge, setAmbianceAge] = useState('')
  const [ambiance, setAmbiance] = useState<string[]>([])
  const [presentation, setPresentation] = useState('')

  /* ---- Étape 3 : logement ---- */
  const [typeLogement, setTypeLogement] = useState('')
  const [nbColoc, setNbColoc] = useState('')
  const [surfaceTotale, setSurfaceTotale] = useState('')
  const [locAddr, setLocAddr] = useState('')
  const [pin, setPin] = useState<{ x: number; y: number } | null>(null)
  const [focus, setFocus] = useState<[number, number] | null>(null)
  const ckooEligible = /antananarivo|tananarive|\btana\b/i.test(locAddr)

  /* AMÉLIORATION CARTE : quand on tape un lieu, la carte se recentre dessus
     et le repère y est placé automatiquement (délai anti-spam de 700 ms).
     Essaie d'abord geocodeAddress, puis le géocodeur OSM en secours. */
  useEffect(() => {
    const query = locAddr.trim()
    if (!query) return
    const timer = window.setTimeout(() => {
      ;(async () => {
        let coords: [number, number] | null = null
        try {
          const geo = await geocodeAddress(query)
          if (geo && Number.isFinite(geo.latitude) && Number.isFinite(geo.longitude)) {
            coords = [geo.latitude, geo.longitude]
          }
        } catch {
          coords = null
        }
        if (!coords) coords = await geocodeMadagascar(query)
        if (coords) {
          setFocus(coords)
          setPin({ x: coords[0], y: coords[1] })
        }
      })()
    }, 700)
    return () => window.clearTimeout(timer)
  }, [locAddr])

  /* ---- Étape 4 : services & commodités ---- */
  const EQUIPEMENTS = [
    'Eau courante', 'Surpresseur', 'Balcon', 'Jardin', 'Piscine', 'BBQ',
    'Gazinière / Plaques électriques', 'Four', 'Machine à laver', 'Abri vélo / moto',
  ]
  const [equipements, setEquipements] = useState<string[]>([])
  const [internet, setInternet] = useState('')
  const [parkingCars, setParkingCars] = useState('')
  const [parkingCarsCouvert, setParkingCarsCouvert] = useState('')
  const [parkingMoto, setParkingMoto] = useState('')
  const [parkingMotoCouvert, setParkingMotoCouvert] = useState('')
  const SERVICES_PERSONNEL = ['Gardien', 'Femme de ménage', 'Jardinier', "Porteurs d'eau", 'Intendance et petits travaux']
  const [servicesPersonnel, setServicesPersonnel] = useState<string[]>([])
  const [servAutre, setServAutre] = useState<string[]>([])
  const [servAutreOn, setServAutreOn] = useState(false)

  /* ---- Simulation Coloc'KOO ---- */
  const [simOpen, setSimOpen] = useState(false)
  const [sim, setSim] = useState<Record<string, SimSelection>>({})
  const [ckooIntegrated, setCkooIntegrated] = useState(false)
  const [ckooTotal, setCkooTotal] = useState(0)
  const [ckooChosenNames, setCkooChosenNames] = useState<string[]>([])

  const simTotals = useMemo(() => {
    let monthly = 0
    let maxDays = 0
    CKOO_SERVICES.forEach((s) => {
      const sel = sim[s.id]
      if (!sel?.checked) return
      if (s.type === 'hour') {
        const d = sel.days ?? 1
        const hrs = d === 0.5 ? 4 : 8 * d
        monthly += s.price * hrs
        if (d > maxDays) maxDays = d
      } else if (s.type === 'forfait') {
        monthly += s.price
      } else if (s.type === 'annual') {
        monthly += s.price / 12
      } else if (s.type === 'stere') {
        monthly += (s.price * (sel.qty ?? 0)) / 12
      }
    })
    const mgmt = mgmtFee(maxDays)
    return { monthly: Math.round((monthly + mgmt) / 100) * 100, mgmt, maxDays }
  }, [sim])

  function integrateSim() {
    const chosen = CKOO_SERVICES.filter((s) => sim[s.id]?.checked).map((s) => s.name)
    setCkooIntegrated(chosen.length > 0)
    setCkooTotal(simTotals.monthly)
    setCkooChosenNames(chosen)
    setSimOpen(false)
  }
  function deleteSim() {
    setSim({})
    setCkooIntegrated(false)
    setCkooTotal(0)
    setCkooChosenNames([])
    setSimOpen(false)
  }

  /* ---- Étape 5 : chambre ---- */
  const [dispoDate, setDispoDate] = useState('')
  const [chambreSurface, setChambreSurface] = useState('')
  const [loyer, setLoyer] = useState('')
  const [charges, setCharges] = useState('')
  const [cautionType, setCautionType] = useState<'' | '1mois' | 'autre'>('')
  const [cautionAutre, setCautionAutre] = useState('')
  const MEUBLEE_OPTIONS = ['Oui', 'Partiellement', 'Non', 'Rachat des meubles']
  const [meublee, setMeublee] = useState<string[]>([])
  const [rachatPrix, setRachatPrix] = useState('')
  const [rachatDescriptif, setRachatDescriptif] = useState('')

  /* ---- Étape 6 : règles ---- */
  const REGLES = ['Filles uniquement', 'Garçons uniquement', 'Animaux acceptés', 'Famille / Enfant(s) accepté(s)']
  const [regles, setRegles] = useState<string[]>([])

  /* ---- Étape 7 : photos ---- */
  const [photos, setPhotos] = useState<(File | null)[]>([null, null, null])
  const [photoPreviews, setPhotoPreviews] = useState<(string | null)[]>([null, null, null])
  function onPhotoPick(i: number, file: File | null) {
    setPhotos((prev) => {
      const next = [...prev]
      next[i] = file
      return next
    })
    setPhotoPreviews((prev) => {
      const next = [...prev]
      if (prev[i]) URL.revokeObjectURL(prev[i]!)
      next[i] = file ? URL.createObjectURL(file) : null
      return next
    })
  }

  /* ---- Étape 8 : publier ---- */
  const [proEngageChecked, setProEngageChecked] = useState(false)
  const [offer, setOffer] = useState<'annonce' | 'immo'>('annonce')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    if (!toastMessage) return
    const timer = window.setTimeout(() => setToastMessage(''), 3200)
    return () => window.clearTimeout(timer)
  }, [toastMessage])

  /* ---------------------------------------------------------------- */
  /*  Reprise automatique après connexion                              */
  /* ---------------------------------------------------------------- */
  const [pendingAutoPublish, setPendingAutoPublish] = useState(false)
  const autoPublishTriggered = useRef(false)

  function restoreDraft(draft: any) {
    if (draft.role !== undefined) setRole(draft.role)
    if (draft.typeAnnonce !== undefined) setTypeAnnonce(draft.typeAnnonce)
    if (draft.ambianceAge !== undefined) setAmbianceAge(draft.ambianceAge)
    if (draft.ambiance !== undefined) setAmbiance(draft.ambiance)
    if (draft.presentation !== undefined) setPresentation(draft.presentation)
    if (draft.typeLogement !== undefined) setTypeLogement(draft.typeLogement)
    if (draft.nbColoc !== undefined) setNbColoc(draft.nbColoc)
    if (draft.surfaceTotale !== undefined) setSurfaceTotale(draft.surfaceTotale)
    if (draft.locAddr !== undefined) setLocAddr(draft.locAddr)
    if (draft.pin !== undefined) setPin(draft.pin)
    if (draft.equipements !== undefined) setEquipements(draft.equipements)
    if (draft.internet !== undefined) setInternet(draft.internet)
    if (draft.parkingCars !== undefined) setParkingCars(draft.parkingCars)
    if (draft.parkingCarsCouvert !== undefined) setParkingCarsCouvert(draft.parkingCarsCouvert)
    if (draft.parkingMoto !== undefined) setParkingMoto(draft.parkingMoto)
    if (draft.parkingMotoCouvert !== undefined) setParkingMotoCouvert(draft.parkingMotoCouvert)
    if (draft.servicesPersonnel !== undefined) setServicesPersonnel(draft.servicesPersonnel)
    if (draft.servAutre !== undefined) setServAutre(draft.servAutre)
    if (draft.servAutreOn !== undefined) setServAutreOn(draft.servAutreOn)
    if (draft.sim !== undefined) setSim(draft.sim)
    if (draft.ckooIntegrated !== undefined) setCkooIntegrated(draft.ckooIntegrated)
    if (draft.ckooTotal !== undefined) setCkooTotal(draft.ckooTotal)
    if (draft.ckooChosenNames !== undefined) setCkooChosenNames(draft.ckooChosenNames)
    if (draft.dispoDate !== undefined) setDispoDate(draft.dispoDate)
    if (draft.chambreSurface !== undefined) setChambreSurface(draft.chambreSurface)
    if (draft.loyer !== undefined) setLoyer(draft.loyer)
    if (draft.charges !== undefined) setCharges(draft.charges)
    if (draft.cautionType !== undefined) setCautionType(draft.cautionType)
    if (draft.cautionAutre !== undefined) setCautionAutre(draft.cautionAutre)
    if (draft.meublee !== undefined) setMeublee(draft.meublee)
    if (draft.rachatPrix !== undefined) setRachatPrix(draft.rachatPrix)
    if (draft.rachatDescriptif !== undefined) setRachatDescriptif(draft.rachatDescriptif)
    if (draft.regles !== undefined) setRegles(draft.regles)
    if (draft.proEngageChecked !== undefined) setProEngageChecked(draft.proEngageChecked)
    if (draft.offer !== undefined) setOffer(draft.offer)

    if (Array.isArray(draft.photosData)) {
      const restoredPhotos: (File | null)[] = draft.photosData.map((p: any) =>
        p ? dataUrlToFile(p.dataUrl, p.name, p.type) : null,
      )
      setPhotos(restoredPhotos)
      setPhotoPreviews(restoredPhotos.map((f) => (f ? URL.createObjectURL(f) : null)))
    }

    const restoredSteps = stepsForRole(draft.role ?? null)
    setCur(restoredSteps.length - 1)
    setMaxStep(restoredSteps.length - 1)
  }

  /* ---------------------------------------------------------------- */
  /*  Mode renouvellement : chargement d'une annonce existante          */
  /* ---------------------------------------------------------------- */
  // Traduit la réponse API (ApiAnnonce) vers la forme attendue par
  // restoreDraft(). Ne stocke rien : on relit simplement l'annonce en base
  // à chaque ouverture de la page de renouvellement.
  function mapAnnonceToDraft(a: ApiAnnonce & Record<string, any>) {
    const chambre = a.chambre ?? a.chambres?.[0] ?? a.rooms?.[0] ?? null
    const meubleeRaw = String(chambre?.est_meuble ?? chambre?.meublee ?? '').trim()

    return {
      // ⚠️ À confirmer côté backend : le champ réel qui porte le rôle
      // (membre / proprio / pro) pour cette annonce.
      role: (a.type_bailleur as any) ?? a.extra?.role ?? null,
      typeAnnonce: a.type_annonce === 'existante' ? 'existante' : 'creation',
      ambianceAge: a.extra?.ambiance_age ?? '',
      ambiance: a.extra?.ambiance ?? [],
      presentation: a.description ?? a.message ?? '',
      typeLogement:
        a.type_propriete === 'maison' ? 'Maison' : a.type_propriete === 'appartement' ? 'Appartement' : 'Autre',
      nbColoc: String(a.total_colocataires ?? a.nombre_pieces ?? ''),
      surfaceTotale: String(a.surface_totale ?? a.surface ?? ''),
      locAddr: a.adresse_exacte ?? a.adresse ?? a.quartier ?? '',
      pin: a.latitude && a.longitude ? { x: Number(a.latitude), y: Number(a.longitude) } : null,
      equipements: a.amenities ?? a.commodites ?? [],
      internet: a.internet ?? '',
      parkingCars: String(a.parking_voitures ?? ''),
      parkingCarsCouvert: a.parking_couvert ? 'Couvert' : '',
      parkingMoto: String(a.parking_motos ?? ''),
      servicesPersonnel: a.services ?? a.extra?.services_personnel ?? [],
      servAutre: a.extra?.services_autre ?? [],
      servAutreOn: (a.extra?.services_autre ?? []).length > 0,
      dispoDate: (chambre?.date_disponibilite ?? chambre?.disponible_a_partir ?? '').slice(0, 10),
      chambreSurface: chambre?.surface != null ? String(chambre.surface) : '',
      loyer: chambre?.prix_loyer != null ? String(chambre.prix_loyer) : '',
      charges: chambre?.prix_charges != null ? String(chambre.prix_charges) : '',
      meublee: meubleeRaw ? meubleeRaw.split(', ').filter(Boolean) : [],
      regles: a.regles ?? [],
      offer: a.extra?.offre ?? 'annonce',
      proEngageChecked: a.extra?.engagement_pro ?? false,
    }
  }

  // Si la page est montée sur /annonces/:id/renouveler, on charge l'annonce
  // (statut 'expired') et on préremplit tout le formulaire, directement à
  // la dernière étape (récap + bouton Renouveler).
  useEffect(() => {
    if (!isRenewal || !annonceId) return
    let cancelled = false
    ;(async () => {
      setLoadingAnnonce(true)
      setRenewError('')
      try {
        const data = await api.annonce(annonceId)
        if (cancelled) return
        const draft = mapAnnonceToDraft(data)
        restoreDraft(draft)
        const s = stepsForRole(draft.role ?? null)
        setCur(s.length - 1)
        setMaxStep(s.length - 1)
      } catch (err) {
        if (!cancelled) setRenewError(err instanceof Error ? err.message : "Impossible de charger l'annonce.")
      } finally {
        if (!cancelled) setLoadingAnnonce(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isRenewal, annonceId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Dès qu'on a un utilisateur connecté, on regarde si un brouillon en
  // attente existe (déposé juste avant un envoi vers /auth). Si oui, on
  // restaure tout le formulaire et on relance automatiquement la publication.
  useEffect(() => {
    if (!user || autoPublishTriggered.current) return
    const raw = sessionStorage.getItem(DEPOT_DRAFT_KEY)
    if (!raw) return
    autoPublishTriggered.current = true
    try {
      const draft = JSON.parse(raw)
      if (!draft || Date.now() - (draft.savedAt || 0) > DEPOT_DRAFT_MAX_AGE_MS) {
        sessionStorage.removeItem(DEPOT_DRAFT_KEY)
        return
      }
      restoreDraft(draft)
      setToastMessage('Bon retour ! On finalise la publication de ton annonce…')
      setPendingAutoPublish(true)
    } catch {
      sessionStorage.removeItem(DEPOT_DRAFT_KEY)
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!pendingAutoPublish || !user) return
    setPendingAutoPublish(false)
    sessionStorage.removeItem(DEPOT_DRAFT_KEY)
    handlePublish()
  }, [pendingAutoPublish]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------------------------------------------------------------- */
  /*  Validation par étape                                             */
  /* ---------------------------------------------------------------- */
  function validateCurrentStep(): boolean {
    setStepErr(null)
    const key = steps[cur]?.key
    if (key === 'statut') {
      if (!role) {
        setStepErr('Merci de sélectionner ton statut.')
        return false
      }
      if (role === 'membre' && blockedExistingListing) {
        setStepErr('Tu as déjà une annonce active : un seul dépôt est possible par compte colocataire.')
        return false
      }
    }
    if (key === 'logement') {
      const locOk = pin !== null
      const ok =
        (role === 'membre' || typeAnnonce !== '') &&
        typeLogement !== '' &&
        nbColoc !== '' &&
        surfaceTotale.trim() !== '' &&
        locOk
      if (!ok) {
        setStepErr(
          !locOk
            ? 'Merci de placer ton logement sur la carte (obligatoire).'
            : 'Merci de compléter tous les champs obligatoires (*) avant de continuer.',
        )
        return false
      }
    }
    if (key === 'services' && !internet) {
      setStepErr("Merci d'indiquer la connexion internet disponible.")
      return false
    }
    if (key === 'chambre') {
      const loyerDigits = loyer.replace(/\D/g, '')
      if (!dispoDate || !loyerDigits || meublee.length === 0) {
        setStepErr('Merci de renseigner la date de disponibilité, le loyer et si la chambre est meublée.')
        return false
      }
    }
    if (key === 'publier' && role === 'pro' && !proEngageChecked) {
      setStepErr('Tu dois confirmer cet engagement pour continuer.')
      return false
    }
    return true
  }

  function nextStep() {
    if (!validateCurrentStep()) return
    if (cur < steps.length - 1) {
      const n = cur + 1
      setCur(n)
      setMaxStep((m) => Math.max(m, n))
    }
  }
  function prevStep() {
    if (cur > 0) setCur(cur - 1)
  }
  function goStep(i: number) {
    if (i <= maxStep) setCur(i)
  }

  function toggleMeublee(option: string) {
    setMeublee((prev) => (prev.includes(option) ? prev.filter((x) => x !== option) : [...prev, option]))
  }

  /* ---------------------------------------------------------------- */
  /*  Soumission                                                       */
  /* ---------------------------------------------------------------- */
  async function persistDraftAndRedirect() {
    const photosData = await Promise.all(
      photos.map(async (file) => (file ? { name: file.name, type: file.type, dataUrl: await fileToDataUrl(file) } : null)),
    )
    const draft = {
      savedAt: Date.now(),
      role, typeAnnonce, ambianceAge, ambiance, presentation,
      typeLogement, nbColoc, surfaceTotale, locAddr, pin,
      equipements, internet, parkingCars, parkingCarsCouvert, parkingMoto, parkingMotoCouvert,
      servicesPersonnel, servAutre, servAutreOn,
      sim, ckooIntegrated, ckooTotal, ckooChosenNames,
      dispoDate, chambreSurface, loyer, charges, cautionType, cautionAutre,
      meublee, rachatPrix, rachatDescriptif,
      regles,
      photosData,
      proEngageChecked, offer,
    }
    try {
      sessionStorage.setItem(DEPOT_DRAFT_KEY, JSON.stringify(draft))
    } catch {
      // Stockage indisponible ou plein : la personne devra ressaisir son
      // formulaire après connexion, mais la redirection reste correcte.
    }
    navigate('/auth?mode=signin&redirect=/depot_annonce')
  }

  async function handlePublish() {
    if (!validateCurrentStep()) return
    if (!user) {
      await persistDraftAndRedirect()
      return
    }
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      let uploadedPhotos: string[] = []
      const filesToUpload = photos.filter((p): p is File => !!p)
      if (filesToUpload.length > 0) {
        const formData = new FormData()
        filesToUpload.forEach((photo) => formData.append('photos', photo))
        uploadedPhotos = (await api.uploadDepotAnnoncePhotos(formData)).photos
      }

      let latitude = -18.8792
      let longitude = 47.5079
      let quartier = deriveQuartierFromAddress(locAddr)
      // Le repère placé sur la vraie carte est prioritaire s'il existe.
      if (pin) {
        latitude = pin.x
        longitude = pin.y
      }
      if (locAddr.trim()) {
        try {
          const geo = await geocodeAddress(locAddr)
          if (geo) {
            if (!pin) {
              latitude = geo.latitude
              longitude = geo.longitude
            }
            const geoQuartier = (geo as any).quartier || (geo as any).district || (geo as any).neighbourhood
            if (geoQuartier) quartier = geoQuartier
          }
        } catch {
          // le repère placé par l'utilisateur reste l'indicateur principal
        }
      }

      const response = await api.createDepotAnnonce({
        adresse: locAddr,
        ville: '',
        quartier,
        latitude,
        longitude,
        type_annonce: typeAnnonce || (role === 'membre' ? 'existante' : 'creation'),
        logement: typeLogement,
        nombre_pieces: nbColoc,
        surface: surfaceTotale,
        commodites: equipements,
        regles,
        internet: internet,
        parking_voitures: parkingCars,
        parking_motos: parkingMoto,
        parking_couvert: parkingCarsCouvert ? 1 : 0,
        chambres: [
          {
            loyer: loyer.replace(/\D/g, ''),
            charges: charges.replace(/\D/g, ''),
            caution: cautionType === 'autre' ? cautionAutre : cautionType === '1mois' ? '1 mois de loyer' : '',
            surface: chambreSurface,
            meublee: meublee.join(', '),
            disponible_a_partir: dispoDate,
          },
        ],
        email: user.email || '',
        telephone_code: '+261',
        telephone: user.telephone || '',
        message: presentation,
        visite_3d: '',
        photos: uploadedPhotos,
        boost_service_id: null,
        extra: {
          role,
          mode,
          nombre_colocataires_recherches: role === 'membre' ? nbColoc : undefined,
          ambiance_age: ambianceAge,
          ambiance,
          equipements,
          internet,
          parking: { cars: parkingCars, cars_couvert: parkingCarsCouvert, moto: parkingMoto, moto_couvert: parkingMotoCouvert },
          services_personnel: servicesPersonnel,
          services_autre: servAutre,
          services_ckoo: ckooIntegrated ? { services: ckooChosenNames, total_mensuel: ckooTotal } : null,
          rachat_meubles: meublee.includes('Rachat des meubles') ? { prix: rachatPrix, descriptif: rachatDescriptif } : null,
          offre: isPaidRole ? offer : null,
          engagement_pro: role === 'pro' ? proEngageChecked : null,
        },
      } as any)

      const successMessage = "Annonce ajoutée avec succès, en attente de validation par l'admin"
      setSuccess(`${successMessage}. Référence : ${response.reference}`)
      setToastMessage(successMessage)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de publier l'annonce.")
    } finally {
      setSubmitting(false)
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Renouvellement                                                    */
  /* ---------------------------------------------------------------- */
  async function handleRenouveler() {
    if (!annonceId) return
    setRenewing(true)
    setRenewError('')
    setRenewSuccess('')
    try {
      const res = await api.renouvelerAnnonce(annonceId)
      setRenewSuccess(
        `Ton annonce a été renouvelée. Nouvelle échéance : ${new Date(res.date_expiration).toLocaleDateString('fr-FR')}.`,
      )
      setToastMessage('Annonce renouvelée avec succès')
    } catch (err) {
      setRenewError(err instanceof Error ? err.message : 'Impossible de renouveler cette annonce.')
    } finally {
      setRenewing(false)
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Rendu                                                             */
  /* ---------------------------------------------------------------- */
  const stepKey = steps[cur]?.key
  const isLast = cur === steps.length - 1
  const recapDuration = isPaidRole ? '4 mois' : '2 mois'
  const currentAmountLabel = role === 'pro' && offer === 'immo' ? '50 000 Ar' : '20 000 Ar'

  return (
    <SiteLayout>
      <style>{depotAnnonceDeuxCss}</style>

      {toastMessage && (
        <div className="dad-toast">
          <Check size={16} /> {toastMessage}
        </div>
      )}

      {/* PROGRESSION */}
      <div className="phead">
        <div className="phead-top">
          <div className="phead-step">
            {t('step_word')} <b>{cur + 1}</b> / <b>{steps.length}</b>
          </div>
          <div className="phead-title bb">{t('progress')}</div>
        </div>
        <div className="pbar">
          <div className="pbar-fill" style={{ width: `${((cur + 1) / steps.length) * 100}%` }} />
        </div>
        <div className="pdots">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className={cn('pdot', i === cur && 'on', i < cur && 'done', i > maxStep && 'locked')}
              onClick={() => goStep(i)}
            >
              <div className="pdot-c" />
              <div className="pdot-l">{s.title}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="wrap">
        <div className="intro">
          <div className="intro-h bb">
            {t('intro_h')} <span>{t('intro_h2')}</span>
          </div>
          <div className="intro-p">{t('intro_p')}</div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>
        )}

        <div className="card">
          {isRenewal && loadingAnnonce && (
            <div className="hint"><Loader2 size={14} className="animate-spin" /> Chargement de ton annonce...</div>
          )}

          <div className="draft-bar">
            <button
              className="btn-draft"
              style={{ marginLeft: 'auto' }}
              onClick={() => setToastMessage(t('draft_saved'))}
            >
              <Save size={14} /> {t('draft_save')}
            </button>
          </div>

          {/* ÉTAPE 1 — STATUT */}
          {stepKey === 'statut' && (
            <section className="step on">
              <div className="s-title bb"><UserCheck size={22} /> <span className="s-part">Partie 1</span> — Ton statut</div>
              <div className="s-sub">Qui es-tu par rapport à ce logement ? Cela adapte la suite du formulaire.</div>
              <div className="grp">
                <label className="lbl">Tu es...<span className="req">*</span></label>
                <div className="opts" style={{ flexDirection: 'column' }}>
                  <OptCard
                    icon={Users}
                    title="Membre de la colocation"
                    desc="Tu vis (ou vas vivre) dans le logement et cherches un·e coloc. 1 seule annonce active possible par compte."
                    on={role === 'membre'}
                    onClick={() => setRole('membre')}
                  />
                  <OptCard
                    icon={KeyRound}
                    title="Propriétaire du logement"
                    desc="Tu n'y vis pas mais tu possèdes le bien et le proposes en colocation."
                    on={role === 'proprio'}
                    onClick={() => setRole('proprio')}
                  />
                  <OptCard
                    icon={Briefcase}
                    title="Professionnel de l'immobilier"
                    desc="Agent ou gestionnaire indépendant qui publie pour le compte d'un propriétaire."
                    on={role === 'pro'}
                    onClick={() => setRole('pro')}
                  />
                </div>
                {role === 'membre' && checkingExistingListing && (
                  <div className="hint"><Loader2 size={12} className="animate-spin" /> Vérification de tes annonces en cours...</div>
                )}
                {role === 'membre' && !checkingExistingListing && blockedExistingListing && (
                  <ErrBox>
                    Tu as déjà une annonce active en tant que colocataire. Un seul dépôt est possible par compte pour
                    ce profil — retire ou attends l'expiration de ton annonce en cours pour en publier une nouvelle.
                  </ErrBox>
                )}
                {stepErr && <ErrBox>{stepErr}</ErrBox>}
                {isPaidRole && (
                  <div className="callout">
                    <HeartHandshake size={20} />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--dark)', marginBottom: 3 }}>
                        Tu deviens partenaire solidaire du projet
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--gr1)', lineHeight: 1.55 }}>
                        En tant que {role === 'pro' ? "professionnel de l'immobilier" : 'propriétaire'}, tu es considéré·e
                        comme un partenaire solidaire de Sarintany'COLOC. Ta participation aide à rendre le service
                        soutenable et permet à la communauté de colocataires d'accéder à un meilleur logement.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ÉTAPE 2 — ESPRIT COLOC */}
          {stepKey === 'esprit' && (
            <section className="step on">
              <div className="s-title bb"><UsersRound size={22} /> <span className="s-part">Partie 2</span> — L'Esprit Coloc'</div>
              <div className="s-sub">
                {role === 'membre'
                  ? "Tu habites dans cette maison avec d'autres colocataires. Quelle ambiance recherches-tu ?"
                  : 'Tu connais les caractéristiques de ton bien, son quartier et ses voisins. Quelle ambiance te paraît être la plus appropriée ?'}
              </div>

              <div className="grp">
                <label className="lbl">Mode de constitution</label>
                {mode === 'flux' ? (
                  <div className="mc on">
                    <div className="oc-ico"><UserCheck size={18} /></div>
                    <div>
                      <div className="oc-t">Au fil de l'eau</div>
                      <div className="oc-d">
                        Validation individuelle : tu valides les colocataires un par un. Tu peux échanger avec chaque
                        candidat·e avant de l'accepter.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mc on">
                    <div className="oc-ico"><UsersRound size={18} /></div>
                    <div>
                      <div className="oc-t">Colocation complète</div>
                      <div className="oc-d">
                        Le logement démarre une fois le groupe complet : les candidat·e·s forment des équipes en lien
                        avec les critères que tu as renseignés ci-après. La première équipe au complet l'emporte.
                        Tu ne valides ou ne refuses que des équipes complètes.
                      </div>
                    </div>
                  </div>
                )}
                {mode === 'flux' && (
                  <div className="cond show">
                    <div style={{ fontSize: 12, color: 'var(--gr1)', lineHeight: 1.55, textAlign: 'center' }}>
                      <MessageCircle size={14} style={{ color: 'var(--cy)' }} /> Tu gardes la main sur chaque
                      validation et peux discuter avec les candidat·e·s depuis ta messagerie avant de les accepter.
                    </div>
                  </div>
                )}
                {mode === 'complete' && (
                  <div className="cond show">
                    <div style={{ fontSize: 12, color: 'var(--gr1)', lineHeight: 1.55, textAlign: 'center' }}>
                      <HeartHandshake size={14} style={{ color: 'var(--cy)' }} /> En tant que{' '}
                      {role === 'pro' ? "professionnel de l'immobilier" : 'propriétaire'}, tu es considéré·e comme un
                      partenaire solidaire de Sarintany'COLOC.
                    </div>
                  </div>
                )}
              </div>

              {role === 'membre' && (
                <div className="grp">
                  <label className="lbl">Nombre de colocataires recherchés<span className="req">*</span></label>
                  <div className="pills">
                    {['1', '2', '3', '4+'].map((n) => (
                      <Pill key={n} label={n} on={nbColoc === n} onClick={() => setNbColoc(n)} />
                    ))}
                  </div>
                </div>
              )}

              {role !== 'membre' && (
                <div className="grp">
                  <label className="lbl">Type d'annonce<span className="req">*</span></label>
                  <div className="pills">
                    <Pill label="Colocation existante" on={typeAnnonce === 'existante'} onClick={() => setTypeAnnonce('existante')} />
                    <Pill label="Création d'une colocation" on={typeAnnonce === 'creation'} onClick={() => setTypeAnnonce('creation')} />
                  </div>
                </div>
              )}

              <div className="grp">
                <label className="lbl">
                  Ambiance de la colocation souhaitée <span className="opt">(recommandé)</span>
                </label>
                <div style={{ fontSize: 12, color: 'var(--gr1)', fontWeight: 700, margin: '2px 0 6px' }}>Tranche d'âge</div>
                <div className="pills">
                  {['18–25 ans', '25–35 ans', '35 ans et +', 'Tous âges'].map((a) => (
                    <Pill key={a} label={a} on={ambianceAge === a} onClick={() => setAmbianceAge(a)} />
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gr1)', fontWeight: 700, margin: '14px 0 6px' }}>
                  Ambiance <span style={{ fontWeight: 400, color: 'var(--gr2)' }}>(plusieurs choix possibles)</span>
                </div>
                <div className="pills">
                  {['Calme / studieuse', 'Conviviale', 'Festive', 'Familiale', 'Pro / actifs', 'Étudiante', 'Éco / nature', 'Inclusive', 'Bienveillante'].map(
                    (a) => (
                      <Pill
                        key={a}
                        label={a}
                        on={ambiance.includes(a)}
                        onClick={() => setAmbiance((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))}
                      />
                    ),
                  )}
                </div>
              </div>

              <div className="grp">
                <label className="lbl">
                  Encart de présentation <span className="opt">— à destination des futurs colocataires</span>
                </label>
                <textarea
                  className="ta"
                  maxLength={1000}
                  value={presentation}
                  onChange={(e) => setPresentation(e.target.value)}
                  placeholder="Décris l'ambiance de la coloc, le quartier, le profil recherché..."
                />
                <div className={cn('charcount', presentation.length >= 1000 && 'over')}>{presentation.length} / 1000 caractères</div>
              </div>
            </section>
          )}

          {/* ÉTAPE 3 — LOGEMENT */}
          {stepKey === 'logement' && (
            <section className="step on">
              <div className="s-title bb"><Home size={22} /> <span className="s-part">Partie 3</span> — Le logement</div>
              <div className="s-sub">Décris le bien qui accueille la colocation.</div>

              <div className="grp">
                <label className="lbl">Type de logement<span className="req">*</span></label>
                <div className="pills">
                  {['Appartement', 'Maison', 'Autre'].map((v) => (
                    <Pill key={v} label={v} on={typeLogement === v} onClick={() => setTypeLogement(v)} />
                  ))}
                </div>
              </div>

              <div className="grp">
                <label className="lbl">Nombre de colocataires en tout<span className="req">*</span></label>
                <div className="pills">
                  {['2', '3', '4', '5', '6+'].map((v) => (
                    <Pill key={v} label={v} on={nbColoc === v} onClick={() => setNbColoc(v)} />
                  ))}
                </div>
                <div className="hint"><Info size={11} /> Une colocation compte au moins 2 colocataires.</div>
              </div>

              <div className="grp">
                <label className="lbl">Surface totale<span className="req">*</span></label>
                <div className="inp-suffix" style={{ maxWidth: 200 }}>
                  <input
                    className="inp"
                    type="number"
                    min={0}
                    placeholder="ex : 120"
                    value={surfaceTotale}
                    onChange={(e) => setSurfaceTotale(e.target.value)}
                  />
                  <span className="suf">m²</span>
                </div>
              </div>

              <div className="grp">
                <label className="lbl">Localisation du bien<span className="req">*</span></label>
                <input
                  className="inp"
                  type="text"
                  placeholder="Adresse ou quartier — ex : Ankadifotsy, Antananarivo"
                  style={{ marginBottom: 10 }}
                  value={locAddr}
                  onChange={(e) => setLocAddr(e.target.value)}
                />
                <InteractiveMap pin={pin} onPlacePin={setPin} focus={focus} />
                <div className="note">
                  <Lock size={13} /> Pour des raisons de confidentialité, si tu renseignes ton adresse
                  exacte, celle-ci n'apparaîtra jamais sur ton annonce — seul le quartier sera visible.
                </div>
                <div className="hint">
                  <Info size={11} /> Le placement sur la carte est obligatoire, même si tu as saisi une adresse.
                </div>
              </div>

              {stepErr && <ErrBox>{stepErr}</ErrBox>}
            </section>
          )}

          {/* ÉTAPE 4 — SERVICES & COMMODITÉS */}
          {stepKey === 'services' && (
            <section className="step on">
              <div className="s-title bb"><Wrench size={22} /> <span className="s-part">Partie 4</span> — Les services & commodités</div>
              <div className="s-sub">Coche tout ce qui est disponible dans le logement.</div>

              <div className="grp">
                <div className="grp-t">Équipements</div>
                <div className="checks-grid">
                  {EQUIPEMENTS.map((eq) => (
                    <CheckRow
                      key={eq}
                      label={eq}
                      checked={equipements.includes(eq)}
                      onChange={() => setEquipements((prev) => (prev.includes(eq) ? prev.filter((x) => x !== eq) : [...prev, eq]))}
                    />
                  ))}
                </div>
              </div>

              <div className="grp">
                <div className="grp-t">Connexion internet<span className="req">*</span></div>
                <div className="pills">
                  {['ADSL', 'Fibre', 'Box', 'Aucune'].map((v) => (
                    <Pill key={v} label={v} on={internet === v} onClick={() => setInternet(v)} />
                  ))}
                </div>
                {stepErr && <ErrBox>{stepErr}</ErrBox>}
              </div>

              <div className="grp">
                <div className="grp-t">Parking</div>
                <div className="row2">
                  <div>
                    <label className="lbl">Capacité — nombre de voitures</label>
                    <input className="inp" type="number" min={0} placeholder="ex : 2" value={parkingCars} onChange={(e) => setParkingCars(e.target.value)} />
                  </div>
                  <div>
                    <label className="lbl">Couvert ?</label>
                    <select className="sel" value={parkingCarsCouvert} onChange={(e) => setParkingCarsCouvert(e.target.value)}>
                      <option value="">- Sélectionner -</option>
                      <option>Couvert</option>
                      <option>Non couvert</option>
                    </select>
                  </div>
                </div>
                <div className="row2" style={{ marginTop: 9 }}>
                  <div>
                    <label className="lbl">Capacité — nombre de 2 roues</label>
                    <input className="inp" type="number" min={0} placeholder="ex : 3" value={parkingMoto} onChange={(e) => setParkingMoto(e.target.value)} />
                  </div>
                  <div>
                    <label className="lbl">Couvert ?</label>
                    <select className="sel" value={parkingMotoCouvert} onChange={(e) => setParkingMotoCouvert(e.target.value)}>
                      <option value="">- Sélectionner -</option>
                      <option>Couvert</option>
                      <option>Non couvert</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grp">
                <div className="grp-t">Services proposés</div>
                {ckooEligible && (
                  <div className="ckoo-teaser">
                    <div className="ckoo-teaser-head bb">
                      {role === 'membre' ? 'Plus de simplicité au quotidien ?' : 'Simplifie la gestion de ta colocation ?'}
                    </div>
                    <div className="ckoo-teaser-txt">
                      Avec Coloc'KOO, profite de services mutualisés selon tes besoins (offre disponible à
                      Antananarivo pour le moment).
                    </div>
                    <button type="button" className="ckoo-teaser-btn" onClick={() => setSimOpen(true)}>
                      {ckooIntegrated ? <CheckCircle2 size={16} /> : <Calculator size={16} />}
                      {ckooIntegrated ? 'Services intégrés — modifier' : 'Faire une simulation'}
                    </button>
                    {ckooIntegrated && (
                      <div className="ckoo-teaser-confirm" style={{ display: 'flex' }}>
                        <HeartHandshake size={14} />
                        <span>Merci pour ta confiance ! Les services sélectionnés seront intégrés à ton annonce.</span>
                      </div>
                    )}
                  </div>
                )}
                <div style={{ fontSize: 12, color: 'var(--gr1)', fontWeight: 700, margin: '16px 0 8px' }}>
                  Les services déjà en place :
                </div>
                <div className="checks-grid">
                  {SERVICES_PERSONNEL.map((sv) => (
                    <CheckRow
                      key={sv}
                      label={sv}
                      checked={servicesPersonnel.includes(sv)}
                      onChange={() =>
                        setServicesPersonnel((prev) => (prev.includes(sv) ? prev.filter((x) => x !== sv) : [...prev, sv]))
                      }
                    />
                  ))}
                </div>
                <div style={{ marginTop: 8 }}>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={servAutreOn}
                      onChange={(e) => {
                        setServAutreOn(e.target.checked)
                        if (!e.target.checked) setServAutre([])
                        else if (servAutre.length === 0) setServAutre([''])
                      }}
                    />{' '}
                    Autre (préciser – 3 Max)
                  </label>
                  {servAutreOn && (
                    <div style={{ marginTop: 6 }}>
                      {servAutre.map((v, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                          <input
                            className="inp"
                            style={{ flex: 1 }}
                            placeholder="Précise le service..."
                            value={v}
                            onChange={(e) =>
                              setServAutre((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))
                            }
                          />
                          <button
                            type="button"
                            onClick={() => setServAutre((prev) => prev.filter((_, idx) => idx !== i))}
                            style={{ background: 'none', border: 'none', color: 'var(--gr2)', cursor: 'pointer' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {servAutre.length < 3 && (
                        <button
                          type="button"
                          onClick={() => setServAutre((prev) => [...prev, ''])}
                          style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: 'var(--g2)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                        >
                          <Plus size={14} /> Ajouter un autre élément
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ÉTAPE 5 — CHAMBRE */}
          {stepKey === 'chambre' && (
            <section className="step on">
              <div className="s-title bb"><Bed size={22} /> <span className="s-part">Partie 5</span> — La chambre proposée</div>
              <div className="s-sub">Les conditions de la chambre disponible.</div>

              <div className="row2">
                <div className="grp">
                  <label className="lbl">Disponible à partir du<span className="req">*</span></label>
                  <input className="inp" type="date" value={dispoDate} onChange={(e) => setDispoDate(e.target.value)} />
                </div>
                <div className="grp">
                  <label className="lbl">Surface de la chambre</label>
                  <div className="inp-suffix">
                    <input className="inp" type="number" min={0} placeholder="ex : 14" value={chambreSurface} onChange={(e) => setChambreSurface(e.target.value)} />
                    <span className="suf">m²</span>
                  </div>
                </div>
              </div>

              <div className="row2">
                <div className="grp">
                  <label className="lbl">Loyer <span className="opt">(hors charges)</span><span className="req">*</span></label>
                  <MoneyInput value={loyer} onChange={setLoyer} placeholder="350 000" />
                </div>
                <div className="grp">
                  <label className="lbl">Charges <span className="opt">(moyenne / mois)</span></label>
                  <MoneyInput value={charges} onChange={setCharges} placeholder="40 000" />
                  {ckooIntegrated && (
                    <div style={{ fontSize: 12, color: 'var(--g2)', fontWeight: 700, marginTop: 6 }}>
                      <Sparkles size={12} /> + services Coloc'KOO {fmtAr(ckooTotal)} Ar
                    </div>
                  )}
                </div>
              </div>
              <div className="note" style={{ background: 'var(--cy-lt)', borderColor: 'rgba(70,189,214,.3)', display: 'block', textAlign: 'center' }}>
                <Info size={13} style={{ color: 'var(--cy)' }} /> <b>Conseil :</b> dissocie le loyer des charges (internet,
                services, etc.) — ton annonce sera plus attractive.
              </div>

              <div className="grp">
                <label className="lbl">Caution</label>
                <div className="pills">
                  <Pill label="1 mois de loyer" on={cautionType === '1mois'} onClick={() => setCautionType('1mois')} />
                  <Pill label="Autre" on={cautionType === 'autre'} onClick={() => setCautionType('autre')} />
                </div>
                {cautionType === 'autre' && (
                  <div style={{ marginTop: 9, maxWidth: 260 }}>
                    <MoneyInput value={cautionAutre} onChange={setCautionAutre} placeholder="Montant de la caution" />
                  </div>
                )}
              </div>

              <div className="grp">
                <label className="lbl">
                  La chambre est meublée<span className="req">*</span>{' '}
                  <span className="opt">(plusieurs réponses possibles)</span>
                </label>
                <div className="checks-grid">
                  {MEUBLEE_OPTIONS.map((opt) => (
                    <CheckRow key={opt} label={opt} checked={meublee.includes(opt)} onChange={() => toggleMeublee(opt)} />
                  ))}
                </div>
                {meublee.includes('Rachat des meubles') && (
                  <div className="cond show" style={{ marginTop: 10 }}>
                    <label className="lbl">Prix de rachat des meubles</label>
                    <div style={{ maxWidth: 260 }}>
                      <MoneyInput value={rachatPrix} onChange={setRachatPrix} placeholder="ex : 50 000" />
                    </div>
                    <label className="lbl" style={{ marginTop: 11 }}>Descriptif des meubles à racheter</label>
                    <textarea
                      className="ta"
                      style={{ minHeight: 70 }}
                      placeholder="Décris en quelques lignes les meubles concernés (lit, armoire, électroménager...)."
                      value={rachatDescriptif}
                      onChange={(e) => setRachatDescriptif(e.target.value)}
                    />
                  </div>
                )}
              </div>
              {stepErr && <ErrBox>{stepErr}</ErrBox>}
            </section>
          )}

          {/* ÉTAPE 6 — RÈGLES */}
          {stepKey === 'regles' && (
            <section className="step on">
              <div className="s-title bb"><Scale size={22} /> <span className="s-part">Partie 6</span> — Les règles de la coloc</div>
              <div className="s-sub">Précise les conditions de vie commune.</div>
              <div className="grp">
                <div className="checks-grid">
                  {REGLES.map((r) => (
                    <CheckRow
                      key={r}
                      label={r}
                      checked={regles.includes(r)}
                      onChange={() => setRegles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]))}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ÉTAPE 7 — PHOTOS */}
          {stepKey === 'photos' && (
            <section className="step on">
              <div className="s-title bb"><Camera size={22} /> <span className="s-part">Partie 7</span> — Les photos</div>
              <div className="s-sub">Ajoute des photos : les annonces avec photos sont bien plus consultées.</div>
              <div className="grp">
                <label className="lbl">Photos du logement</label>
                <div className="photos-info">
                  <Camera size={16} /> <div>Les annonces avec photos sont en moyenne <b>7× plus consultées</b>.</div>
                </div>
                <div className="photo-grid">
                  {[0, 1, 2].map((i) => (
                    <label key={i} className={cn('photo-slot', i === 0 && 'cover', photoPreviews[i] && 'filled')}>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => onPhotoPick(i, e.target.files?.[0] ?? null)}
                      />
                      {!photoPreviews[i] && (
                        <span className="ps-ph" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                          <Camera size={22} />
                          <span className="ps-t">{i === 0 ? 'Couverture' : `Photo ${i + 1}`}</span>
                        </span>
                      )}
                      {photoPreviews[i] && <img src={photoPreviews[i]!} alt={`Photo ${i + 1}`} />}
                      <button
                        type="button"
                        className="ps-del"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onPhotoPick(i, null)
                        }}
                      >
                        <X size={13} />
                      </button>
                    </label>
                  ))}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--gr2)', lineHeight: 1.5, marginTop: 9 }}>
                  Dimensions recommandées : 1200 × 900 px. 3 photos maximum en version gratuite (max 3 Mo / photo).
                </div>
              </div>
            </section>
          )}

          {/* ÉTAPE 8 — PUBLIER */}
          {stepKey === 'publier' && (
            <section className="step on">
              <div className="s-title bb"><Send size={22} /> Étape finale — Publie ton annonce</div>
              <div className="s-sub">Vérifie le récapitulatif ci-dessous avant de publier.</div>

              {isRenewal && (
                <div className="note" style={{ marginBottom: 14 }}>
                  <Clock size={13} /> Cette annonce a expiré. Renouvelle-la pour qu'elle redevienne visible
                  {' '}pendant {recapDuration} de plus, sans avoir à ressaisir tes informations.
                </div>
              )}

              {isRenewal && renewError && <ErrBox>{renewError}</ErrBox>}
              {isRenewal && renewSuccess && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {renewSuccess}
                </div>
              )}

              {role === 'pro' && (
                <div className="cond show" style={{ marginBottom: 16 }}>
                  <div className="callout" style={{ background: 'linear-gradient(135deg,#fff4f1,#fff9ec)', borderColor: 'rgba(216,84,63,.28)' }}>
                    <ShieldCheck size={20} style={{ color: '#c0492f' }} />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--dark)', marginBottom: 3 }}>
                        Engagement du professionnel<span className="req">*</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--gr1)', lineHeight: 1.55 }}>
                        En publiant cette annonce, tu attestes que le propriétaire que tu représentes est d'accord
                        pour accueillir une colocation. Cette responsabilité t'engage.
                      </div>
                    </div>
                  </div>
                  <label className="check" style={{ marginTop: 10 }}>
                    <input type="checkbox" checked={proEngageChecked} onChange={(e) => setProEngageChecked(e.target.checked)} />{' '}
                    J'atteste que le propriétaire représenté est d'accord pour une colocation et j'en assume la responsabilité.
                  </label>
                  {stepErr && <ErrBox>{stepErr}</ErrBox>}
                </div>
              )}

              <div className="recap">
                <div className="recap-t">Conditions de publication</div>
                <div className="recap-row"><Clock size={14} /> Ton annonce sera visible pendant <b style={{ color: 'var(--dark)' }}>&nbsp;{recapDuration}</b>.</div>
                <div className="recap-row"><Bell size={14} /> Tu recevras une relance 7 jours avant l'échéance pour renouveler ou retirer ton annonce.</div>
                <div className="recap-row"><ShieldCheck size={14} /> Chaque annonce est vérifiée (modération) avant sa mise en ligne.</div>
                {loyer && (
                  <div className="recap-row">
                    <Receipt size={14} /> Charges actuelles : <b style={{ color: 'var(--dark)' }}>{charges ? `${charges} Ar` : 'non communiquées'}</b>
                  </div>
                )}
                {!isPaidRole && (
                  <div className="recap-row"><HeartHandshake size={14} /> Publication 100% gratuite — aucune commission.</div>
                )}
                {isPaidRole && (
                  <div className="recap-row">
                    <HeartHandshake size={14} /> Offre partenaire : <b style={{ color: 'var(--dark)' }}>&nbsp;
                      {LAUNCH_FREE ? <><s style={{ color: 'var(--gr2)' }}>{currentAmountLabel}</s> <span style={{ color: 'var(--g2)' }}>Offert</span></> : currentAmountLabel}
                    </b> — ta contribution soutient la gratuité côté colocataires.
                  </div>
                )}
              </div>

              {ckooIntegrated && (
                <div className="recap" style={{ background: 'linear-gradient(135deg,var(--g-lt),var(--cy-lt))', borderColor: 'rgba(153,204,51,.3)' }}>
                  <div className="recap-t" style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Sparkles size={16} style={{ color: 'var(--g2)' }} /> Services Coloc'KOO demandés</div>
                  <div className="recap-row" style={{ alignItems: 'flex-start' }}><ListChecks size={14} /> <span style={{ color: 'var(--dark)' }}>{ckooChosenNames.join(' · ')}</span></div>
                  <div className="recap-row"><Wallet size={14} /> Estimation : <b style={{ color: 'var(--dark)' }}>&nbsp;{fmtAr(ckooTotal)} Ar / mois</b> (à confirmer)</div>
                </div>
              )}

              {isPaidRole && (
                <div className="recap" style={{ background: 'linear-gradient(135deg,var(--cy-lt),var(--g-lt))', borderColor: 'rgba(70,189,214,.25)' }}>
                  <div className="recap-t" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Wallet size={16} style={{ color: 'var(--cy)' }} /> Ton paiement — {currentAmountLabel}
                  </div>
                  {role === 'pro' && (
                    <div style={{ margin: '9px 0 12px' }}>
                      <label className="lbl" style={{ marginBottom: 8 }}>Choisis ton offre<span className="req">*</span></label>
                      <div className="offer-opts">
                        <div className={cn('offer-card', offer === 'annonce' && 'on')} onClick={() => setOffer('annonce')}>
                          <div className="of-top"><span className="of-name">Offre unique — à l'annonce</span><span className="of-price"><span className="nominal">20 000 Ar</span> <span className="of-offert" style={{ display: 'inline' }}>Offert</span></span></div>
                          <div className="of-d">1 annonce à but commercial · validité 4 mois.</div>
                        </div>
                        <div className={cn('offer-card', offer === 'immo' && 'on')} onClick={() => setOffer('immo')}>
                          <div className="of-top"><span className="of-name">Indépendant IMMO</span><span className="of-price"><span className="nominal">50 000 Ar</span> <span className="of-offert" style={{ display: 'inline' }}>Offert</span></span></div>
                          <div className="of-d">Même offre, jusqu'à 4 annonces commerciales · validité 4 mois.</div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="pay-free">
                    <Gift size={20} />
                    <div><b>Publication offerte — offre de lancement.</b> Aucun paiement n'est requis pour le moment ;
                      la valeur de l'offre reste affichée à titre indicatif.</div>
                  </div>
                </div>
              )}

              <div className="note" style={{ marginTop: 14 }}>
                <Info size={13} /> Tu es connecté·e en tant que <b>{user?.email || user?.telephone || 'utilisateur'}</b>. La
                publication utilise ce compte.
              </div>
            </section>
          )}

          {/* NAV BUTTONS */}
          <div className="formnav">
            {cur > 0 && !isRenewal && (
              <button className="btn-back" onClick={prevStep}>
                <ArrowLeft size={16} /> {t('back')}
              </button>
            )}
            {!isLast && !isRenewal && (
              <button className="btn-next" onClick={nextStep}>
                {t('next')} <ArrowRight size={16} />
              </button>
            )}
            {isLast && !isRenewal && (
              <button className="btn-publish" onClick={handlePublish} disabled={submitting}>
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} {t('publish')}
              </button>
            )}
            {isRenewal && !renewSuccess && (
              <button className="btn-publish" onClick={handleRenouveler} disabled={renewing || loadingAnnonce}>
                {renewing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Renouveler mon annonce
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODALE SIMULATION SERVICES COLOC'KOO */}
      {simOpen && (
        <div className="modal-overlay open" onClick={() => setSimOpen(false)}>
          <div className="modal modal-doc" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSimOpen(false)}><X size={16} /></button>
            <div className="modal-h bb" style={{ textAlign: 'center' }}>Simule tes services mutualisés</div>
            <div className="modal-p" style={{ textAlign: 'center', marginBottom: 6, fontSize: 11 }}>
              Les montants sont indicatifs. Notre équipe te contactera pour confirmer ta demande.
            </div>
            <div className="modal-doc-body" style={{ paddingTop: 4 }}>
              <div className="sim-scroll">
                {CKOO_SERVICES.map((s) => {
                  const sel = sim[s.id] ?? { checked: false, days: 1, qty: 1 }
                  return (
                    <div key={s.id} className="sim-svc-block">
                      <label className="sim-svc">
                        <input
                          type="checkbox"
                          checked={sel.checked}
                          onChange={(e) => setSim((prev) => ({ ...prev, [s.id]: { ...sel, checked: e.target.checked } }))}
                        />
                        <span className="sim-svc-name">{s.name}{s.star ? <span className="req">*</span> : ''}</span>
                        <span className="sim-svc-price">
                          {s.type === 'hour' && `${groupThousands(s.price)} Ar / heure`}
                          {s.type === 'forfait' && `Forfait : ${groupThousands(s.price)} Ar`}
                          {s.type === 'annual' && `${groupThousands(s.price)} Ar / an`}
                          {s.type === 'stere' && `${groupThousands(s.price)} Ar / stère`}
                        </span>
                      </label>
                      {sel.checked && s.type === 'hour' && (
                        <div className="sim-ctrl">
                          <select
                            className="sim-days"
                            value={sel.days}
                            onChange={(e) => setSim((prev) => ({ ...prev, [s.id]: { ...sel, days: parseFloat(e.target.value) } }))}
                          >
                            {HOUR_DAY_OPTIONS.map((d) => (
                              <option key={d} value={d}>{d === 0.5 ? '½ journée' : `${d} jour${d > 1 ? 's' : ''}`}</option>
                            ))}
                          </select>{' '}
                          <span className="sim-week">/ mois</span>
                        </div>
                      )}
                      {sel.checked && s.type === 'stere' && (
                        <div className="sim-ctrl">
                          <input
                            type="number"
                            min={1}
                            className="sim-qty"
                            value={sel.qty}
                            onChange={(e) => setSim((prev) => ({ ...prev, [s.id]: { ...sel, qty: parseFloat(e.target.value) || 0 } }))}
                            style={{ width: 70 }}
                          />
                        </div>
                      )}
                      {sel.checked && s.note && (
                        <div className="sim-note-legend"><Info size={12} /> {s.note}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            {simTotals.maxDays > 0 && (
              <div className="sim-sub">
                <span>Frais de gestion (CNAPS / OSTIE / Mobile Money / Comptabilité)</span>
                <span>{fmtAr(simTotals.mgmt)} Ar</span>
              </div>
            )}
            <div className="sim-total">
              <span className="sim-total-l">Total mensuel cumulé</span>
              <span className="sim-total-v">{fmtAr(simTotals.monthly)} Ar</span>
            </div>
            <div className="sim-legal">
              <ShieldCheck size={14} />
              <div>Inscription systématique à la <b>CNAPS</b> et à l'<b>OSTIE</b>, congés payés inclus.</div>
            </div>
            <button className="modal-btn" onClick={integrateSim}><Plus size={16} /> Intégrer aux charges des colocs</button>
            <button
              type="button"
              onClick={deleteSim}
              style={{ display: 'block', width: '100%', marginTop: 8, background: 'none', border: 'none', color: 'var(--gr2)', fontSize: 12, textDecoration: 'underline', cursor: 'pointer' }}
            >
              <Trash2 size={13} /> Supprimer
            </button>
          </div>
        </div>
      )}
    </SiteLayout>
  )
}

/* ======================================================================
 *  CSS
 * ====================================================================*/
const depotAnnonceDeuxCss = `
:root{--g1:#CCCC33;--g2:#99CC33;--cy:#46BDD6;--gr1:#666;--gr2:#999;--dark:#2C2C2C;--cy-lt:#E8F7FA;--g-lt:#F4F8E8;--bd:#e8e8e8;}
.bb{font-family:'Bebas Neue',Arial,sans-serif;letter-spacing:0.03em;}
.phead{background:#fff;border-bottom:1px solid var(--bd);position:sticky;top:0;z-index:150;padding:11px 20px 12px;}
.phead-top{display:flex;align-items:center;justify-content:space-between;gap:12px;max-width:760px;margin:0 auto 8px;}
.phead-step{font-size:12px;color:var(--gr2);font-weight:700;white-space:nowrap;}
.phead-step b{color:var(--cy);}
.phead-title{font-family:'Bebas Neue',Arial,sans-serif;font-size:20px;letter-spacing:.03em;color:var(--dark);text-align:right;line-height:1;}
.pbar{max-width:760px;margin:0 auto;height:6px;background:#eef0ea;border-radius:6px;overflow:hidden;}
.pbar-fill{height:100%;background:linear-gradient(90deg,var(--cy),var(--g2));border-radius:6px;transition:width .3s;}
.pdots{max-width:760px;margin:9px auto 0;display:flex;gap:4px;justify-content:space-between;}
.pdot{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;}
.pdot-c{width:13px;height:13px;border-radius:50%;background:#e2e6dc;transition:all .2s;}
.pdot.done .pdot-c{background:var(--g2);}
.pdot.on .pdot-c{background:var(--cy);box-shadow:0 0 0 4px var(--cy-lt);}
.pdot-l{font-size:9px;color:var(--gr2);text-align:center;line-height:1.1;}
.pdot.on .pdot-l{color:var(--cy);font-weight:700;}
.pdot.locked{opacity:.4;cursor:not-allowed;}
@media(max-width:680px){.pdot-l{display:none;}}
.wrap{max-width:760px;width:100%;margin:0 auto;padding:20px 16px 30px;}
.intro{text-align:center;margin-bottom:16px;}
.intro-h{font-family:'Bebas Neue',Arial,sans-serif;font-size:26px;letter-spacing:.03em;color:var(--dark);}
.intro-h span{color:var(--g2);}
.intro-p{font-size:12px;color:var(--gr2);margin-top:2px;}
.card{background:#fff;border:1px solid var(--bd);border-radius:16px;padding:22px;}
.step{display:block;animation:dad-fade .25s;}
@keyframes dad-fade{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
.s-title{font-family:'Bebas Neue',Arial,sans-serif;font-size:22px;letter-spacing:.03em;color:var(--dark);margin-bottom:3px;display:flex;align-items:center;gap:9px;}
.s-title svg{color:var(--cy);}
.s-sub{font-size:12px;color:var(--gr2);margin-bottom:18px;line-height:1.5;}
.grp{margin-bottom:18px;}
.grp-t{font-size:11px;font-weight:700;color:var(--gr2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:9px;padding-bottom:5px;border-bottom:1px solid #f0f0f0;}
.lbl{font-size:13px;font-weight:700;color:var(--dark);margin-bottom:7px;display:block;}
.lbl .opt{font-weight:400;color:var(--gr2);font-size:11px;}
.req{color:#cc3333;margin-left:2px;}
.inp,.sel,.ta{width:100%;border:1px solid #ddd;border-radius:8px;padding:10px 11px;font-size:13px;font-family:Arial,sans-serif;color:var(--dark);outline:none;background:#fff;}
.inp:focus,.sel:focus,.ta:focus{border-color:var(--cy);}
.ta{resize:vertical;min-height:90px;line-height:1.5;}
.sel{appearance:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2.5'><path d='M6 9l6 6 6-6'/></svg>");background-repeat:no-repeat;background-position:right 11px center;padding-right:34px;cursor:pointer;}
.inp-suffix{position:relative;}
.inp-suffix .suf{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:12px;color:var(--gr2);pointer-events:none;}
.inp-suffix .inp{padding-right:42px;}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
@media(max-width:520px){.row2{grid-template-columns:1fr;}}
.opts{display:flex;flex-wrap:wrap;gap:9px;}
.opt-card{flex:1;min-width:120px;border:1.5px solid #e2e2e2;border-radius:11px;padding:12px;cursor:pointer;transition:all .15s;background:#fff;display:flex;align-items:center;gap:10px;}
.opt-card:hover{border-color:var(--cy);}
.opt-card.on{border-color:var(--cy);background:var(--cy-lt);}
.opt-card .oc-ico{width:34px;height:34px;border-radius:9px;background:#f3f5ee;display:flex;align-items:center;justify-content:center;color:var(--gr1);flex-shrink:0;}
.opt-card.on .oc-ico{background:var(--cy);color:#fff;}
.opt-card .oc-t{font-size:13px;font-weight:700;color:var(--dark);}
.opt-card .oc-d{font-size:11px;color:var(--gr2);margin-top:1px;line-height:1.35;}
.pills{display:flex;flex-wrap:wrap;gap:8px;}
.pill-opt{border:1.5px solid #e2e2e2;border-radius:22px;padding:8px 16px;font-size:13px;font-weight:700;color:var(--gr1);cursor:pointer;background:#fff;transition:all .15s;}
.pill-opt:hover{border-color:var(--cy);color:var(--cy);}
.pill-opt.on{border-color:var(--cy);background:var(--cy);color:#fff;}
.check{display:flex;align-items:flex-start;gap:9px;padding:8px 0;cursor:pointer;font-size:13px;color:var(--dark);line-height:1.45;}
.check input{accent-color:var(--cy);width:16px;height:16px;cursor:pointer;flex-shrink:0;margin-top:1px;}
.check:hover{color:var(--cy);}
.checks-grid{display:grid;grid-template-columns:1fr 1fr;gap:2px 18px;}
@media(max-width:520px){.checks-grid{grid-template-columns:1fr;}}
.cond{margin-top:10px;padding:14px;border-radius:11px;background:#f8faf5;border:1px solid #eef0e8;}
.mc{border:1.5px solid #e2e2e2;border-radius:11px;padding:12px;background:#fff;display:flex;align-items:center;gap:10px;}
.mc.on{border-color:var(--cy);background:var(--cy-lt);}
.mc .oc-ico{width:34px;height:34px;border-radius:9px;background:var(--cy);color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.mc .oc-t{font-size:13px;font-weight:700;color:var(--dark);}
.mc .oc-d{font-size:11px;color:var(--gr2);margin-top:1px;line-height:1.35;}
.callout{display:flex;gap:11px;padding:14px;border-radius:11px;background:linear-gradient(135deg,var(--cy-lt),var(--g-lt));border:1px solid rgba(70,189,214,.25);margin-top:12px;}
.callout svg{color:var(--cy);flex-shrink:0;margin-top:1px;}
.note{font-size:11px;color:var(--gr2);display:flex;align-items:flex-start;gap:6px;line-height:1.5;margin-top:7px;}
.note svg{color:var(--g2);flex-shrink:0;margin-top:1px;}
.hint{font-size:11px;color:var(--gr2);margin-top:5px;display:flex;align-items:center;gap:5px;}
.err{font-size:11px;color:#cc3333;margin-top:6px;align-items:center;gap:5px;}
.err.show{display:flex;}
.realmap{position:relative;height:260px;border-radius:11px;overflow:hidden;border:1px solid var(--bd);background:#dce8d0;}
.realmap .leaflet-container{height:100%;width:100%;}
.dmap{position:relative;height:210px;border-radius:11px;overflow:hidden;border:1px solid var(--bd);background:#dce8d0;cursor:grab;touch-action:none;}
.dmap-canvas{position:absolute;top:0;left:0;width:1000px;height:800px;transform-origin:0 0;will-change:transform;background:repeating-linear-gradient(0deg,#e6efdd,#e6efdd 38px,#dde9d0 38px,#dde9d0 40px),repeating-linear-gradient(90deg,#e6efdd,#e6efdd 38px,#dde9d0 38px,#dde9d0 40px);}
.droad{position:absolute;background:#cdd9c0;border-radius:2px;}
.dwater{position:absolute;background:#bfe0e8;opacity:.65;}
.dmap-pin{color:var(--cy);z-index:5;}
.dmap-zoom{position:absolute;bottom:12px;right:10px;display:flex;flex-direction:column;gap:4px;z-index:10;}
.dmap-zoom button{width:30px;height:30px;border-radius:7px;border:1px solid var(--bd);background:#fff;font-size:18px;font-weight:700;color:var(--dark);cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center;}
.dmap-zoom button:hover{background:#f3f3f3;}
.dmap-credit{position:absolute;bottom:9px;left:10px;font-size:9px;color:var(--gr1);background:rgba(255,255,255,.82);padding:2px 6px;border-radius:4px;z-index:10;}
.dmap-hint{position:absolute;top:8px;left:10px;right:50px;font-size:10px;color:var(--gr1);background:rgba(255,255,255,.9);padding:5px 8px;border-radius:6px;display:flex;align-items:center;gap:5px;z-index:10;line-height:1.3;}
.tgl{position:relative;width:42px;height:24px;flex-shrink:0;}
.photos-info{display:flex;gap:9px;background:var(--cy-lt);border:1px solid rgba(70,189,214,.25);border-radius:10px;padding:11px;margin-bottom:14px;font-size:12px;color:var(--gr1);line-height:1.5;}
.photos-info svg{color:var(--cy);flex-shrink:0;margin-top:1px;}
.photo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
@media(max-width:520px){.photo-grid{grid-template-columns:1fr 1fr;}}
.photo-slot{aspect-ratio:4/3;border:2px dashed #cdd3c6;border-radius:11px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;cursor:pointer;color:var(--gr2);background:#fafbf8;transition:all .15s;position:relative;overflow:hidden;}
.photo-slot:hover{border-color:var(--cy);color:var(--cy);background:var(--cy-lt);}
.photo-slot .ps-t{font-size:11px;font-weight:700;}
.photo-slot.cover:after{content:"Couverture";position:absolute;top:6px;left:6px;background:var(--cy);color:#fff;font-size:9px;font-weight:700;padding:2px 7px;border-radius:5px;}
.photo-slot img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.photo-slot .ps-del{position:absolute;top:6px;right:6px;width:24px;height:24px;border-radius:50%;background:rgba(0,0,0,.55);color:#fff;border:none;display:none;align-items:center;justify-content:center;cursor:pointer;font-size:13px;z-index:2;}
.photo-slot.filled .ps-del{display:flex;}
.charcount{font-size:11px;color:var(--gr2);text-align:right;margin-top:5px;}
.charcount.over{color:#cc3333;}
.ckoo-teaser{position:relative;text-align:center;background:linear-gradient(135deg,var(--g-lt),var(--cy-lt));border:1px solid rgba(70,189,214,.3);border-radius:12px;padding:20px 18px;margin-top:20px;}
.ckoo-teaser-head{font-size:22px;line-height:1.1;color:var(--dark);letter-spacing:.5px;margin:0 auto 8px;max-width:440px;}
.ckoo-teaser-txt{font-size:13px;color:var(--dark);line-height:1.55;margin:0 auto 14px;max-width:440px;}
.ckoo-teaser-btn{background:#CD6CA8;color:#fff;border:none;border-radius:9px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;margin:0 auto;}
.ckoo-teaser-btn:hover{background:#bb5b96;}
.ckoo-teaser-confirm{justify-content:center;align-items:flex-start;gap:6px;margin-top:12px;font-size:12px;color:var(--g2);font-weight:600;line-height:1.45;max-width:420px;margin-left:auto;margin-right:auto;text-align:center;}
.money{display:flex;align-items:center;border:1px solid #ddd;border-radius:8px;overflow:hidden;}
.money-step{width:34px;height:38px;border:none;background:#f5f5f5;font-size:17px;font-weight:700;color:var(--dark);cursor:pointer;flex-shrink:0;}
.money-step:hover{background:#eee;}
.money-inp{flex:1;border:none;outline:none;padding:0 8px;font-size:13px;text-align:right;min-width:0;}
.money-suf{padding:0 10px;font-size:12px;color:var(--gr2);flex-shrink:0;}
.recap{background:#f7f7f4;border:1px solid var(--bd);border-radius:12px;padding:14px 16px;margin-top:16px;}
.recap-t{font-weight:700;color:var(--dark);font-size:13px;margin-bottom:8px;}
.recap-row{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--gr1);line-height:1.5;padding:4px 0;}
.recap-row svg{color:var(--cy);flex-shrink:0;}
.pay-free{display:flex;gap:10px;align-items:flex-start;background:#fff;border:1px solid rgba(153,204,51,.45);border-radius:10px;padding:12px;font-size:12px;color:var(--gr1);line-height:1.5;margin-top:8px;}
.pay-free svg{color:var(--g2);flex-shrink:0;margin-top:1px;}
.offer-opts{display:flex;flex-direction:column;gap:9px;}
@media(min-width:560px){.offer-opts{flex-direction:row;}}
.offer-card{flex:1;border:1.5px solid #d8e0d0;border-radius:11px;padding:11px 12px;cursor:pointer;background:#fff;transition:all .15s;}
.offer-card:hover{border-color:var(--g2);}
.offer-card.on{border-color:var(--g2);background:#fff;box-shadow:0 0 0 3px rgba(153,204,51,.18);}
.offer-card .of-top{display:flex;align-items:center;justify-content:space-between;gap:8px;}
.offer-card .of-name{font-size:13px;font-weight:700;color:var(--dark);}
.offer-card .of-price{font-size:13px;font-weight:700;color:var(--g2);white-space:nowrap;}
.offer-card .of-price .nominal{text-decoration:line-through;color:var(--gr2);font-weight:600;}
.offer-card .of-d{font-size:11px;color:var(--gr2);line-height:1.45;margin-top:4px;}
.formnav{display:flex;gap:10px;margin-top:22px;padding-top:18px;border-top:1px solid var(--bd);}
.btn-back,.btn-next,.btn-publish{display:inline-flex;align-items:center;gap:7px;border-radius:10px;padding:11px 20px;font-size:13px;font-weight:700;cursor:pointer;border:none;font-family:Arial,sans-serif;}
.btn-back{background:#f5f5f5;color:var(--dark);}
.btn-back:hover{background:#eee;}
.btn-next,.btn-publish{background:var(--cy);color:#fff;margin-left:auto;}
.btn-next:hover,.btn-publish:hover{background:#3aadca;}
.btn-publish{background:var(--g2);}
.btn-publish:hover{background:#89bb2c;}
.btn-publish:disabled{opacity:.6;cursor:not-allowed;}
.btn-draft{display:inline-flex;align-items:center;gap:6px;background:none;border:1px solid var(--bd);border-radius:8px;padding:6px 12px;font-size:12px;color:var(--gr1);cursor:pointer;}
.draft-bar{display:flex;margin-bottom:14px;}
.dad-toast{position:fixed;bottom:20px;right:20px;z-index:300;max-width:340px;border-radius:12px;background:#fff;border:1px solid var(--bd);box-shadow:0 10px 30px rgba(0,0,0,.15);padding:12px 16px;font-size:13px;font-weight:600;color:var(--dark);display:flex;align-items:center;gap:8px;}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:400;padding:20px;}
.modal{background:#fff;border-radius:16px;padding:24px;max-width:440px;width:100%;position:relative;max-height:90vh;overflow-y:auto;}
.modal-doc{max-width:520px;}
.modal-close{position:absolute;top:14px;right:14px;width:28px;height:28px;border-radius:50%;background:#f5f5f5;border:none;cursor:pointer;color:var(--dark);display:flex;align-items:center;justify-content:center;}
.modal-h{font-size:20px;margin-bottom:10px;}
.modal-p{font-size:13px;color:var(--gr1);line-height:1.5;}
.modal-btn{width:100%;background:var(--cy);color:#fff;border:none;border-radius:9px;padding:12px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:14px;}
.modal-btn:hover{background:#3aadca;}
.sim-scroll{max-height:280px;overflow-y:auto;margin:4px 0;padding-right:6px;}
.sim-svc-block{padding:10px 0;border-bottom:1px solid var(--bd);}
.sim-svc-block:last-child{border-bottom:none;}
.sim-svc{display:flex;align-items:center;gap:10px;cursor:pointer;}
.sim-svc input{width:17px;height:17px;flex-shrink:0;accent-color:var(--g2);cursor:pointer;}
.sim-svc-name{flex:1;font-size:13px;color:var(--dark);}
.sim-svc-price{font-size:13px;font-weight:700;color:var(--gr1);white-space:nowrap;}
.sim-ctrl{margin:8px 0 0 27px;font-size:12px;}
.sim-ctrl select,.sim-ctrl input{border:1px solid #ddd;border-radius:6px;padding:5px 8px;font-size:12px;}
.sim-note-legend{margin:8px 0 0 27px;font-size:11px;color:var(--gr2);display:flex;align-items:flex-start;gap:5px;line-height:1.4;}
.sim-sub{display:flex;justify-content:space-between;font-size:12px;color:var(--gr1);padding:8px 0;border-top:1px dashed var(--bd);}
.sim-total{display:flex;justify-content:space-between;align-items:center;margin-top:0;padding:13px 0 4px;border-top:2px solid var(--dark);}
.sim-total-l{font-size:14px;font-weight:700;color:var(--dark);}
.sim-total-v{font-size:16px;font-weight:700;color:var(--g2);}
.sim-legal{display:flex;gap:8px;font-size:11px;color:var(--gr2);line-height:1.4;margin-top:10px;}
.sim-legal svg{color:var(--g2);flex-shrink:0;margin-top:1px;}
`
