import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Check, CheckCircle2, HelpCircle, Info, X, XCircle } from 'lucide-react'
import { cn } from '../../lib/utils'

/* ==========================================================================
 * Dialogues de l'application (alerte / confirmation / saisie / notification).
 * Remplace les fenêtres natives du navigateur (alert, confirm, prompt), qui
 * affichaient « localhost:3000 indique… » et cassaient la charte graphique.
 *
 *   const dialog = useDialog()
 *   dialog.toast('Enregistré')                        // notification brève
 *   dialog.alert({ message: '…', tone: 'danger' })    // accusé de réception
 *   if (!(await dialog.confirm({ … }))) return        // confirmation
 *   const valeur = await dialog.prompt({ … })         // saisie
 * ========================================================================== */

export type DialogTone = 'info' | 'success' | 'warning' | 'danger' | 'question'

type CommonOptions = {
  title?: string
  message?: React.ReactNode
  tone?: DialogTone
  confirmLabel?: string
}

export type AlertOptions = CommonOptions
export type ConfirmOptions = CommonOptions & { cancelLabel?: string }
export type PromptOptions = CommonOptions & {
  label?: string
  placeholder?: string
  defaultValue?: string
  multiline?: boolean
  required?: boolean
  inputMode?: 'text' | 'numeric'
  cancelLabel?: string
}

type ActiveDialog =
  | { kind: 'alert'; options: AlertOptions; resolve: (value: void) => void }
  | { kind: 'confirm'; options: ConfirmOptions; resolve: (value: boolean) => void }
  | { kind: 'prompt'; options: PromptOptions; resolve: (value: string | null) => void }

type Toast = { id: number; message: React.ReactNode; tone: DialogTone }

interface DialogContextValue {
  alert: (options: AlertOptions | string) => Promise<void>
  confirm: (options: ConfirmOptions | string) => Promise<boolean>
  prompt: (options: PromptOptions | string) => Promise<string | null>
  toast: (message: React.ReactNode, tone?: DialogTone) => void
}

const DialogContext = createContext<DialogContextValue | null>(null)

const TONE_STYLES: Record<DialogTone, { icon: React.ElementType; badge: string; confirm: string }> = {
  info: {
    icon: Info,
    badge: 'bg-brand-cyan-light text-brand-cyan-dark',
    confirm: 'bg-brand-cyan hover:bg-brand-cyan-dark focus-visible:outline-brand-cyan',
  },
  success: {
    icon: CheckCircle2,
    badge: 'bg-brand-green-light text-brand-green-dark',
    confirm: 'bg-brand-green hover:bg-brand-green-dark focus-visible:outline-brand-green',
  },
  warning: {
    icon: AlertTriangle,
    badge: 'bg-amber-100 text-amber-700',
    confirm: 'bg-amber-500 hover:bg-amber-600 focus-visible:outline-amber-500',
  },
  danger: {
    icon: XCircle,
    badge: 'bg-red-100 text-red-600',
    confirm: 'bg-red-600 hover:bg-red-700 focus-visible:outline-red-600',
  },
  question: {
    icon: HelpCircle,
    badge: 'bg-brand-cyan-light text-brand-cyan-dark',
    confirm: 'bg-brand-cyan hover:bg-brand-cyan-dark focus-visible:outline-brand-cyan',
  },
}

const DEFAULT_TITLES: Record<DialogTone, string> = {
  info: 'Information',
  success: 'C’est fait',
  warning: 'Attention',
  danger: 'Une erreur est survenue',
  question: 'Confirmation',
}

function normalize<T extends CommonOptions>(options: T | string, fallbackTone: DialogTone): T {
  if (typeof options === 'string') return { message: options, tone: fallbackTone } as T
  return { tone: fallbackTone, ...options }
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<ActiveDialog | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)

  const close = useCallback(() => setDialog(null), [])

  const value = useMemo<DialogContextValue>(
    () => ({
      alert: (options) =>
        new Promise<void>((resolve) => {
          setDialog({ kind: 'alert', options: normalize<AlertOptions>(options, 'info'), resolve })
        }),
      confirm: (options) =>
        new Promise<boolean>((resolve) => {
          setDialog({ kind: 'confirm', options: normalize<ConfirmOptions>(options, 'question'), resolve })
        }),
      prompt: (options) =>
        new Promise<string | null>((resolve) => {
          setDialog({ kind: 'prompt', options: normalize<PromptOptions>(options, 'question'), resolve })
        }),
      toast: (message, tone = 'success') => {
        const id = ++toastId.current
        setToasts((current) => [...current, { id, message, tone }])
        window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 4000)
      },
    }),
    [],
  )

  return (
    <DialogContext.Provider value={value}>
      {children}
      {dialog && <DialogCard dialog={dialog} onClose={close} />}
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((c) => c.filter((item) => item.id !== id))} />
    </DialogContext.Provider>
  )
}

export function useDialog() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useDialog doit être utilisé à l’intérieur de <DialogProvider>')
  }
  return context
}

function DialogCard({ dialog, onClose }: { dialog: ActiveDialog; onClose: () => void }) {
  const { options } = dialog
  const tone = options.tone ?? 'info'
  const styles = TONE_STYLES[tone]
  const Icon = styles.icon
  const [value, setValue] = useState(dialog.kind === 'prompt' ? dialog.options.defaultValue ?? '' : '')
  const [touched, setTouched] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
  const confirmRef = useRef<HTMLButtonElement | null>(null)

  const isPrompt = dialog.kind === 'prompt'
  const requiredMissing = isPrompt && dialog.options.required && !value.trim()

  const cancel = useCallback(() => {
    onClose()
    if (dialog.kind === 'confirm') dialog.resolve(false)
    else if (dialog.kind === 'prompt') dialog.resolve(null)
    else dialog.resolve()
  }, [dialog, onClose])

  const validate = useCallback(() => {
    if (requiredMissing) {
      setTouched(true)
      inputRef.current?.focus()
      return
    }
    onClose()
    if (dialog.kind === 'confirm') dialog.resolve(true)
    else if (dialog.kind === 'prompt') dialog.resolve(value)
    else dialog.resolve()
  }, [dialog, onClose, requiredMissing, value])

  // Raccourcis clavier : Échap annule, Entrée valide (hors champ multiligne).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        cancel()
        return
      }
      if (event.key === 'Enter' && !(isPrompt && dialog.options.multiline)) {
        event.preventDefault()
        validate()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [cancel, validate, isPrompt, dialog])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (isPrompt) inputRef.current?.focus()
      else confirmRef.current?.focus()
    }, 30)
    return () => window.clearTimeout(timer)
  }, [isPrompt])

  // Titre par défaut : selon le ton pour une alerte, générique sinon.
  const title =
    options.title ??
    (dialog.kind === 'alert' ? DEFAULT_TITLES[tone] : dialog.kind === 'confirm' ? 'Confirmation' : 'Saisie')

  return (
    <div
      className="ck-dialog-backdrop fixed inset-0 z-[100050] flex items-end justify-center bg-slate-950/55 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) cancel()
      }}
    >
      <div
        role={dialog.kind === 'alert' ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby="ck-dialog-title"
        className="ck-dialog-card relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-12px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5"
      >
        <button
          type="button"
          onClick={cancel}
          aria-label="Fermer"
          className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pb-6 pt-7">
          <div className={cn('mx-auto flex h-14 w-14 items-center justify-center rounded-2xl', styles.badge)}>
            <Icon className="h-7 w-7" />
          </div>

          <h2 id="ck-dialog-title" className="bebas mt-4 text-center text-2xl leading-tight text-slate-900">
            {title}
          </h2>

          {options.message ? (
            <div className="mt-2 whitespace-pre-line text-center text-sm leading-relaxed text-slate-600">
              {options.message}
            </div>
          ) : null}

          {isPrompt && (
            <div className="mt-5 text-left">
              {dialog.options.label && (
                <label htmlFor="ck-dialog-input" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  {dialog.options.label}
                </label>
              )}
              {dialog.options.multiline ? (
                <textarea
                  id="ck-dialog-input"
                  ref={(node) => (inputRef.current = node)}
                  rows={4}
                  value={value}
                  placeholder={dialog.options.placeholder}
                  onChange={(event) => setValue(event.target.value)}
                  className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
                />
              ) : (
                <input
                  id="ck-dialog-input"
                  ref={(node) => (inputRef.current = node)}
                  type="text"
                  inputMode={dialog.options.inputMode === 'numeric' ? 'numeric' : undefined}
                  value={value}
                  placeholder={dialog.options.placeholder}
                  onChange={(event) => setValue(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
                />
              )}
              {touched && requiredMissing && (
                <p className="mt-1.5 text-xs font-medium text-red-600">Ce champ est obligatoire.</p>
              )}
            </div>
          )}

          <div className={cn('mt-6 flex flex-col-reverse gap-2.5 sm:flex-row', dialog.kind === 'alert' ? 'sm:justify-center' : 'sm:justify-end')}>
            {dialog.kind !== 'alert' && (
              <button
                type="button"
                onClick={cancel}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                {(dialog.options as ConfirmOptions).cancelLabel ?? 'Annuler'}
              </button>
            )}
            <button
              type="button"
              ref={confirmRef}
              onClick={validate}
              className={cn(
                'rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:min-w-[7rem]',
                styles.confirm,
              )}
            >
              {options.confirmLabel ?? (dialog.kind === 'alert' ? 'J’ai compris' : 'Confirmer')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-5 z-[100040] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-6 sm:items-end"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const styles = TONE_STYLES[toast.tone]
        const Icon = toast.tone === 'success' ? Check : styles.icon
        return (
          <div
            key={toast.id}
            className="ck-toast pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5"
          >
            <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', styles.badge)}>
              <Icon className="h-4 w-4" />
            </span>
            <span className="flex-1 pt-0.5 text-sm font-medium text-slate-700">{toast.message}</span>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Fermer"
              className="shrink-0 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
