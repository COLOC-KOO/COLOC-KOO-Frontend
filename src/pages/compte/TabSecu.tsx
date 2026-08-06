import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../lib/api'
import { Button } from '../../components/ui/Button'

export default function TabSecu() {
  const { t } = useTranslation('compte')
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    if (!form.current || !form.next || form.next !== form.confirm) {
      setMessage(t('passwordValidation'))
      return
    }
    setSaving(true)
    setMessage('')
    try {
      await api.changePassword({ mot_de_passe_actuel: form.current, nouveau_mot_de_passe: form.next })
      setMessage(t('passwordUpdateSuccess'))
      setForm({ current: '', next: '', confirm: '' })
    } catch {
      setMessage(t('passwordUpdateError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="bebas text-2xl">{t('security')}</h2>
      <div className="mt-5 grid md:grid-cols-2 gap-4 max-w-lg">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{t('currentPassword')}</label>
          <input type="password" value={form.current} onChange={(e) => setForm((prev) => ({ ...prev, current: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{t('newPassword')}</label>
          <input type="password" value={form.next} onChange={(e) => setForm((prev) => ({ ...prev, next: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{t('confirmPassword')}</label>
          <input type="password" value={form.confirm} onChange={(e) => setForm((prev) => ({ ...prev, confirm: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
      </div>
      {message ? <p className="mt-4 text-sm text-brand-cyan-dark">{message}</p> : null}
      <Button className="mt-6 bg-brand-cyan text-white hover:bg-brand-cyan-dark" onClick={handleSave} disabled={saving}>
        {saving ? t('updating') : t('update')}
      </Button>
    </div>
  )
}
