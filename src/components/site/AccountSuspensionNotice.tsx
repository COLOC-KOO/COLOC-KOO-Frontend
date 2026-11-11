import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/auth'

export function AccountSuspensionNotice() {
  const { user } = useAuth()
  const { t } = useTranslation('common')
  const status = user?.statut?.trim().toLowerCase()

  if (!status || !['suspended', 'suspendu', 'banned', 'banni'].includes(status)) {
    return null
  }

  return (
    <section
      role="alert"
      className="mx-auto my-4 flex w-full max-w-7xl items-start gap-3 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-4 text-red-950 shadow-sm sm:px-6"
    >
      <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-red-700" aria-hidden="true" />
      <div>
        <h2 className="text-base font-bold">{t('common.accountSuspended')}</h2>
        <p className="mt-1 text-sm">{t('common.accountSuspendedReadOnly')}</p>
        <p className="mt-2 text-sm font-semibold">
          {t('common.suspensionReason')}{' '}
          <span className="font-normal">{user?.suspensionReason || t('common.suspensionReasonMissing')}</span>
        </p>
      </div>
    </section>
  )
}
