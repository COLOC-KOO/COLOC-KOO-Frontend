import React, { useEffect, useMemo, useState } from 'react'
import emailjs from '@emailjs/browser'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import { Icon, LatLngExpression } from 'leaflet'
import {
  Accessibility,
  AirVent,
  Armchair,
  Bath,
  Bed,
  Car,
  Check,
  Home,
  Info,
  Loader2,
  Mail,
  MapPin,
  ParkingCircle,
  Pencil,
  Plus,
  Refrigerator,
  Scale,
  Snowflake,
  Upload,
  WashingMachine,
  Wifi,
  Waves,
  X,
} from 'lucide-react'
import 'leaflet/dist/leaflet.css'

import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import { SiteLayout } from '../components/site/SiteLayout'
import { Button } from '../components/ui/Button'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { geocodeAddress } from '../lib/geocoding'
import { cn } from '../lib/utils'

const markerIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const defaultPosition: [number, number] = [-18.8792, 47.5079]
const fieldClass =
  'h-11 rounded-xl border border-[var(--brand-cyan-dark)]/25 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[var(--brand-cyan-dark)] focus:ring-4 focus:ring-[var(--brand-cyan-dark)]/15 placeholder:text-slate-400'
const selectClass =
  'h-11 rounded-xl border border-[var(--brand-cyan-dark)]/25 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[var(--brand-green-dark)] focus:ring-4 focus:ring-[var(--brand-green-dark)]/15'

const typeAnnonceOptions = ['Colocation', 'Location', 'Appart-hôtel', 'Résidence étudiante', 'Chambre pour étudiant']
const logementOptions = ['Appartement', 'Maison', 'Villa', 'Cabane', 'Studio', 'Chalet', 'Autre']
const piecesOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '10+']
const meubleOptions = ['Oui', 'Partiellement', 'Non', 'Rachat']
const MAX_IMAGE_WIDTH = 1600
const MAX_IMAGE_HEIGHT = 1200
const INITIAL_IMAGE_QUALITY = 0.82
const MIN_IMAGE_QUALITY = 0.58
const TARGET_IMAGE_BYTES = 1.2 * 1024 * 1024

const amenities = [
  ['accessibilite_handicape', 'Accessibilité handicapé', Accessibility],
  ['air_conditionne', 'Air conditionné', Snowflake],
  ['ascenseur', 'Ascenseur', Bath],
  ['balcon', 'Balcon', Home],
  ['garage', 'Garage', Car],
  ['jardin', 'Jardin', Refrigerator],
  ['lave_vaisselle', 'Lave-vaisselle', Bath],
  ['machine_laver', 'Machine à laver', WashingMachine],
  ['meuble', 'Meublé', Armchair],
  ['parking', 'Parking', ParkingCircle],
  ['piscine', 'Piscine', Waves],
  ['wifi', 'Wifi', Wifi],
] as const

const rules = [
  ['filles_uniquement', 'Filles uniquement'],
  ['garcons_uniquement', 'Garçons uniquement'],
  ['fumeurs_acceptes', 'Fumeurs acceptés'],
  ['animaux_acceptes', 'Animaux acceptés'],
] as const

interface RoomForm {
  disponible_a_partir: string
  loyer: string
  charges: string
  caution: string
  surface: string
  meublee: string
}

interface FormState {
  adresse: string
  ville: string
  quartier: string
  type_annonce: string
  logement: string
  nombre_pieces: string
  surface: string
  email: string
  telephone_code: string
  telephone: string
  message: string
  visite_3d: string
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error("Impossible de compresser l'image."))
      }
    }, type, quality)
  })
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Impossible de lire l'image ${file.name}.`))
    }
    image.src = url
  })
}

async function compressImageFile(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error(`${file.name} n'est pas une image valide.`)
  }

  const image = await loadImage(file)
  const ratio = Math.min(MAX_IMAGE_WIDTH / image.width, MAX_IMAGE_HEIGHT / image.height, 1)
  const width = Math.max(1, Math.round(image.width * ratio))
  const height = Math.max(1, Math.round(image.height * ratio))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error("Impossible de preparer la compression de l'image.")

  context.drawImage(image, 0, 0, width, height)

  let quality = INITIAL_IMAGE_QUALITY
  let blob = await canvasToBlob(canvas, 'image/jpeg', quality)
  while (blob.size > TARGET_IMAGE_BYTES && quality > MIN_IMAGE_QUALITY) {
    quality = Math.max(MIN_IMAGE_QUALITY, quality - 0.08)
    blob = await canvasToBlob(canvas, 'image/jpeg', quality)
  }

  const compressedName = file.name.replace(/\.[^.]+$/, '') || 'photo'
  if (blob.size >= file.size && file.size <= TARGET_IMAGE_BYTES) return file

  return new File([blob], `${compressedName}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  })
}

function DragMarker({
  position,
  onChange,
}: {
  position: [number, number]
  onChange: (position: [number, number]) => void
}) {
  useMapEvents({
    click(event) {
      onChange([event.latlng.lat, event.latlng.lng])
    },
  })

  return (
    <Marker
      draggable
      icon={markerIcon}
      position={position as LatLngExpression}
      eventHandlers={{
        dragend(event) {
          const marker = event.target
          const next = marker.getLatLng()
          onChange([next.lat, next.lng])
        },
      }}
    />
  )
}

export default function DepotAnnonce() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const boost = searchParams.get('boost')

  const [form, setForm] = useState<FormState>({
    adresse: '82 rue amelot, Paris',
    ville: '',
    quartier: '',
    type_annonce: '',
    logement: '',
    nombre_pieces: '',
    surface: '',
    email: user?.email || '',
    telephone_code: '+261',
    telephone: user?.telephone || '',
    message: '',
    visite_3d: '',
  })
  const [position, setPosition] = useState<[number, number]>(defaultPosition)
  const [commodites, setCommodites] = useState<string[]>([])
  const [regles, setRegles] = useState<string[]>([])
  const [rooms, setRooms] = useState<RoomForm[]>([
    { disponible_a_partir: todayIso(), loyer: '', charges: '', caution: '', surface: '', meublee: '' },
  ])
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [processingPhotos, setProcessingPhotos] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      email: prev.email || user?.email || '',
      telephone: prev.telephone || user?.telephone || '',
    }))
  }, [user])

  useEffect(() => {
    const urls = photos.map((file) => URL.createObjectURL(file))
    setPhotoPreviews(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [photos])

  useEffect(() => {
    if (!toastMessage) return
    const timer = window.setTimeout(() => setToastMessage(''), 4200)
    return () => window.clearTimeout(timer)
  }, [toastMessage])

  const canSubmit = useMemo(() => {
    return Boolean(
      form.adresse &&
        form.type_annonce &&
        form.logement &&
        form.nombre_pieces &&
        form.email &&
        rooms.every((room) => room.loyer && room.disponible_a_partir && room.meublee),
    )
  }, [form, rooms])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleValue(value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  function updateRoom(index: number, patch: Partial<RoomForm>) {
    setRooms((prev) => prev.map((room, i) => (i === index ? { ...room, ...patch } : room)))
  }

  async function handlePhotoSelection(files: File[]) {
    if (files.length === 0 || processingPhotos) return

    setProcessingPhotos(true)
    setError('')
    try {
      const compressedPhotos = await Promise.all(files.map((file) => compressImageFile(file)))
      const originalSize = files.reduce((total, file) => total + file.size, 0)
      const compressedSize = compressedPhotos.reduce((total, file) => total + file.size, 0)
      setPhotos((prev) => [...prev, ...compressedPhotos])

      if (compressedSize < originalSize) {
        setToastMessage(`Photos reduites de ${formatFileSize(originalSize)} a ${formatFileSize(compressedSize)} avant upload.`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de compresser les photos.")
    } finally {
      setProcessingPhotos(false)
    }
  }

  async function localiserAdresse() {
    if (!form.adresse.trim()) return
    setLoadingLocation(true)
    setError('')
    try {
      const result = await geocodeAddress(form.adresse)
      if (!result) {
        setError("Adresse introuvable. Vous pouvez quand même déplacer le repère sur la carte.")
        return
      }
      setPosition([result.latitude, result.longitude])
    } finally {
      setLoadingLocation(false)
    }
  }

  async function handleSubmit() {
    if (!user) {
      navigate('/auth?mode=signin&redirect=/depot_annonce')
      return
    }
    if (!canSubmit || submitting || processingPhotos) return
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      let uploadedPhotos: string[] = []
      if (photos.length > 0) {
        const formData = new FormData()
        photos.forEach((photo) => formData.append('photos', photo))
        uploadedPhotos = (await api.uploadDepotAnnoncePhotos(formData)).photos
      }

      const response = await api.createDepotAnnonce({
        adresse: form.adresse,
        ville: form.ville,
        quartier: form.quartier,
        latitude: position[0],
        longitude: position[1],
        type_annonce: form.type_annonce,
        logement: form.logement,
        nombre_pieces: form.nombre_pieces,
        surface: form.surface,
        commodites,
        regles,
        chambres: rooms.map((room) => ({
          loyer: room.loyer,
          charges: room.charges,
          caution: room.caution,
          surface: room.surface,
          meublee: room.meublee,
          disponible_a_partir: room.disponible_a_partir,
        })),
        email: form.email,
        telephone_code: form.telephone_code,
        telephone: form.telephone,
        message: form.message,
        visite_3d: form.visite_3d,
        photos: uploadedPhotos,
        boost_service_id: boost ? Number(boost) : null,
      })
      const successMessage = "Annonce ajouté avec succés, en attente de validation par l'admin"
      setSuccess(`${successMessage}. Référence: ${response.reference}`)
      setToastMessage(successMessage)
      setPhotos([])
      void sendDepotAnnonceEmails(response.reference)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de publier l'annonce.")
    } finally {
      setSubmitting(false)
    }
  }

  async function sendDepotAnnonceEmails(reference: string) {
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'contact@colockoo.com'
    if (!publicKey || !serviceId || !templateId) return

    const templateParams = {
      reference,
      to_email: form.email,
      admin_email: adminEmail,
      user_email: form.email,
      reply_to: form.email,
      telephone: `${form.telephone_code || ''} ${form.telephone || ''}`.trim(),
      annonce_titre: `${form.type_annonce || 'Annonce'} - ${form.logement || 'Logement'}`,
      adresse: form.adresse,
      ville: form.ville,
      quartier: form.quartier,
      message: "Annonce ajouté avec succés, en attente de validation par l'admin",
    }

    try {
      emailjs.init(publicKey)
      await Promise.all([
        emailjs.send(serviceId, templateId, templateParams, publicKey),
        emailjs.send(serviceId, templateId, { ...templateParams, to_email: adminEmail }, publicKey),
      ])
    } catch {
      // L'annonce est creee meme si le service email est momentanement indisponible.
    }
  }

  return (
    <SiteLayout>
      {toastMessage ? (
        <div className="fixed bottom-5 right-5 z-[90] max-w-sm rounded-xl border border-[var(--brand-cyan-dark)]/20 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-2xl">
          {toastMessage}
        </div>
      ) : null}
      <main className="min-h-screen bg-gradient-to-br from-[var(--brand-cyan-light)] via-white to-[var(--brand-green-light)] py-10">
        <div className="mx-auto w-full max-w-5xl px-4">
          <div className="mb-8 text-center">
            {/* <p className="bebas text-xl text-brand-green">VOUS RECHERCHEZ UN(E) LOCATAIRE OU COLOCATAIRE ?</p> */}
            <h1 className="text-lg text-foreground">Déposez votre annonce gratuitement et en moins de 5 minutes :</h1>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="mb-5 rounded-lg border border-brand-green/30 bg-brand-green/10 px-4 py-3 text-sm text-brand-green-dark">
              {success} <Link to="/annonces" className="font-semibold underline">Voir les annonces</Link>
            </div>
          )}

          <FormSection icon={MapPin} label="ADRESSE">
            <div className="space-y-5">
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <input
                  value={form.adresse}
                  onChange={(event) => update('adresse', event.target.value)}
                  className={fieldClass}
                  placeholder="Adresse complète"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={localiserAdresse}
                  disabled={loadingLocation}
                  className="h-11 rounded-xl border border-[var(--brand-cyan-dark)]/25 bg-white px-5 text-[var(--brand-cyan-dark)] shadow-sm hover:bg-[var(--brand-cyan-light)]"
                >
                  {loadingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4 text-pink-500" />}
                  Localiser
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input value={form.ville} onChange={(event) => update('ville', event.target.value)} className={fieldClass} placeholder="Ville" />
                <input value={form.quartier} onChange={(event) => update('quartier', event.target.value)} className={fieldClass} placeholder="Quartier" />
              </div>
              <InfoBox>
                Vous pouvez ajuster la position de votre annonce si nécessaire en déplaçant le repère sur la carte ci-dessous.
              </InfoBox>
              <div className="h-[320px] overflow-hidden rounded-2xl border border-[var(--brand-cyan-dark)]/15 shadow-sm">
                <MapContainer center={position} zoom={13} className="h-full w-full" key={position.join(',')}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <DragMarker position={position} onChange={setPosition} />
                </MapContainer>
              </div>
            </div>
          </FormSection>

          <FormSection icon={Home} label="LOGEMENT">
            <div className="grid gap-4">
              <SelectLine label="Type d'annonce :" value={form.type_annonce} onChange={(value) => update('type_annonce', value)} options={typeAnnonceOptions} />
              <SelectLine label="Logement :" value={form.logement} onChange={(value) => update('logement', value)} options={logementOptions} />
              <SelectLine label="Nombre de pièces :" value={form.nombre_pieces} onChange={(value) => update('nombre_pieces', value)} options={piecesOptions} />
              <InputLine label="Superficie" suffix="m²" value={form.surface} onChange={(value) => update('surface', value)} />
            </div>
          </FormSection>

          <FormSection icon={Plus} label="COMMODITÉS">
            <div className="grid gap-x-14 gap-y-4 md:grid-cols-2">
              {amenities.map(([value, label, IconItem]) => (
                <CheckboxRow key={value} checked={commodites.includes(value)} onChange={() => toggleValue(value, setCommodites)}>
                  <IconItem className="h-4 w-4 text-[var(--brand-cyan-dark)]" /> {label}
                </CheckboxRow>
              ))}
            </div>
          </FormSection>

          <FormSection icon={Scale} label="RÈGLES">
            <div className="grid gap-x-14 gap-y-4 md:grid-cols-2">
              {rules.map(([value, label]) => (
                <CheckboxRow key={value} checked={regles.includes(value)} onChange={() => toggleValue(value, setRegles)}>
                  {label}
                </CheckboxRow>
              ))}
            </div>
          </FormSection>

          {rooms.map((room, index) => (
            <FormSection key={index} icon={Bed} label={index === 0 ? 'CHAMBRE' : `CHAMBRE ${index + 1}`}>
              <div className="grid gap-4">
                <InputLine label="Disponible à partir du :" type="date" value={room.disponible_a_partir} onChange={(value) => updateRoom(index, { disponible_a_partir: value })} />
                <InputLine label="Loyer" hint="sans charges" suffix="Ar" value={room.loyer} onChange={(value) => updateRoom(index, { loyer: value })} />
                <InputLine label="Charges :" suffix="Ar" value={room.charges} onChange={(value) => updateRoom(index, { charges: value })} />
                <InputLine label="Caution :" suffix="Ar" value={room.caution} onChange={(value) => updateRoom(index, { caution: value })} />
                <InputLine label="Surface" hint="en m²" suffix="m²" value={room.surface} onChange={(value) => updateRoom(index, { surface: value })} />
                <SelectLine label="Meublée :" value={room.meublee} onChange={(value) => updateRoom(index, { meublee: value })} options={meubleOptions} />
                {rooms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setRooms((prev) => prev.filter((_, i) => i !== index))}
                    className="justify-self-start text-sm font-medium text-red-600 hover:underline"
                  >
                    Retirer cette chambre
                  </button>
                )}
              </div>
            </FormSection>
          ))}

          <div className="mb-6 flex justify-center">
            <button
              type="button"
              onClick={() => setRooms((prev) => [...prev, { disponible_a_partir: todayIso(), loyer: '', charges: '', caution: '', surface: '', meublee: '' }])}
              className="inline-flex h-11 w-full max-w-lg items-center justify-center gap-2 rounded-xl border border-[var(--brand-green-dark)]/30 bg-white text-sm font-semibold text-[var(--brand-green-dark)] shadow-sm hover:bg-[var(--brand-green-light)]"
            >
              <Plus className="h-4 w-4" /> Ajouter une chambre supplémentaire
            </button>
          </div>

          <FormSection icon={Mail} label="CONTACTS">
            <div className="grid gap-4">
              <InputLine label="E-mail :" value={form.email} onChange={(value) => update('email', value)} />
              <div className="grid items-center gap-3 md:grid-cols-[200px_1fr]">
                <label className="text-sm text-foreground">Téléphone <span className="italic text-[var(--brand-cyan-dark)]">(facultatif)</span> :</label>
                <div className="grid gap-2 sm:grid-cols-[96px_1fr]">
                  <select value={form.telephone_code} onChange={(event) => update('telephone_code', event.target.value)} className={selectClass}>
                    <option value="+261">🇲🇬 +261</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+262">🇷🇪 +262</option>
                  </select>
                  <input value={form.telephone} onChange={(event) => update('telephone', event.target.value)} className={fieldClass} />
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection icon={Pencil} label="MESSAGE">
            <textarea
              value={form.message}
              onChange={(event) => update('message', event.target.value)}
              rows={9}
              className="w-full resize-y rounded-2xl border border-[var(--brand-cyan-dark)]/25 bg-white p-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[var(--brand-cyan-dark)] focus:ring-4 focus:ring-[var(--brand-cyan-dark)]/15"
              placeholder="Décrivez votre annonce en quelques lignes..."
            />
          </FormSection>

          <FormSection icon={Accessibility} label="VISITE 3D">
            <div className="space-y-5">
              <InfoBox>
                Le lien renseigné ci-dessous sera injecté via un élément &lt;iframe&gt; dans la galerie de votre annonce.
                <br />
                <strong>(dimensions affichées : 320x240 et 670x500 pixels)</strong>
              </InfoBox>
              <input
                value={form.visite_3d}
                onChange={(event) => update('visite_3d', event.target.value)}
                className={fieldClass}
                placeholder="https://agence.immo/visite-3d/exemple"
              />
            </div>
          </FormSection>

          <FormSection icon={Upload} label="PHOTOS">
            <div className="space-y-5">
              <InfoBox>
                Les annonces accompagnées de photos sont en moyenne sept fois plus consultées que les autres.
                <br />
                <strong>(dimensions recommandées : 1200 par 900 pixels)</strong>
              </InfoBox>
              <label
                className={cn(
                  "mx-auto flex h-11 max-w-md cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--brand-cyan-dark)]/25 bg-white text-sm font-medium text-slate-700 shadow-sm hover:border-[var(--brand-green-dark)] hover:text-[var(--brand-green-dark)]",
                  processingPhotos && 'cursor-wait opacity-70',
                )}
              >
                {processingPhotos ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--brand-cyan-dark)]" /> Compression des photos...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 text-[var(--brand-cyan-dark)]" /> Ajouter des photos du logement
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={processingPhotos}
                  className="hidden"
                  onChange={(event) => {
                    const files = Array.from(event.target.files || [])
                    void handlePhotoSelection(files)
                    event.target.value = ''
                  }}
                />
              </label>
              {photoPreviews.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {photoPreviews.map((src, index) => (
                    <div key={`${src}-${index}`} className="group relative aspect-[4/3] overflow-hidden rounded border border-gray-200">
                      <img src={src} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-red-600 shadow"
                        aria-label="Retirer la photo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormSection>

          {!user && (
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Vous pouvez remplir le formulaire, mais vous devrez vous connecter avant la publication.
            </div>
          )}

          <div className="flex justify-center pb-10">
            <Button
              type="button"
              disabled={!canSubmit || submitting || processingPhotos}
              onClick={handleSubmit}
              className="h-14 min-w-[320px] rounded-xl bg-[var(--brand-cyan-dark)] px-8 text-base font-extrabold text-white shadow-xl shadow-cyan-900/20 ring-2 ring-white hover:bg-[var(--brand-green-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting || processingPhotos ? <Loader2 className="mr-3 h-4 w-4 animate-spin" /> : <Pencil className="mr-3 h-4 w-4" />}
              {processingPhotos ? 'Preparation des photos...' : 'Publier votre annonce'}
            </Button>
          </div>
        </div>
      </main>
    </SiteLayout>
  )
}

function FormSection({
  icon: IconItem,
  label,
  children,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-8 grid gap-6 rounded-2xl border border-white/80 bg-white/95 px-5 py-8 shadow-[0_18px_50px_rgba(14,116,144,0.08)] md:grid-cols-[120px_1fr] md:px-10">
      <div className="flex items-center gap-3 text-[var(--brand-cyan-dark)] md:flex-col md:justify-center">
        <IconItem className="h-9 w-9 text-[var(--brand-cyan-dark)]" />
        <span className="bebas text-lg">{label}</span>
      </div>
      <div>{children}</div>
    </section>
  )
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-2xl gap-4 rounded-2xl border border-[var(--brand-cyan-dark)]/10 bg-[var(--brand-cyan-light)] px-6 py-3 text-sm leading-6 text-slate-700">
      <Info className="mt-1 h-4 w-4 shrink-0 text-[var(--brand-cyan-dark)]" />
      <p>{children}</p>
    </div>
  )
}

function SelectLine({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="grid items-center gap-3 md:grid-cols-[200px_1fr]">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          selectClass,
          !value && 'text-gray-500',
        )}
      >
        <option value="">- Sélectionner -</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  )
}

function InputLine({
  label,
  hint,
  suffix,
  value,
  type = 'text',
  onChange,
}: {
  label: string
  hint?: string
  suffix?: string
  value: string
  type?: string
  onChange: (value: string) => void
}) {
  return (
    <div className="grid items-center gap-3 md:grid-cols-[200px_1fr]">
      <label className="text-sm font-medium text-slate-700">
        {label} {hint && <span className="italic text-[var(--brand-green-dark)]">({hint})</span>}:
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${fieldClass} pr-12`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-700">{suffix}</span>}
      </div>
    </div>
  )
}

function CheckboxRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: () => void
  children: React.ReactNode
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
      <span className={cn(
        'grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 transition-all duration-200',
        checked 
          ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/25' 
          : 'border-[var(--brand-cyan-dark)] bg-white hover:border-blue-400'
      )}>
        {checked && <Check className="h-4 w-4 stroke-[3]" />}
      </span>
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={onChange} 
        className="sr-only" 
      />
      <span className="inline-flex items-center gap-2">{children}</span>
    </label>
  )
}
