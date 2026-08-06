import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Bell, Users, Home, Heart, Trash } from 'lucide-react'
import { api } from '../../lib/api'
import { Button } from '../../components/ui/Button'

export default function TabNotif() {
  const { t } = useTranslation('compte')
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const refreshNotifications = () => {
      api.notifications()
        .then((data) => setNotifications(data))
        .catch(() => setNotifications([]))
        .finally(() => setLoading(false))
    }
    refreshNotifications()
    window.addEventListener('colockoo:counters-refresh', refreshNotifications)
    return () => window.removeEventListener('colockoo:counters-refresh', refreshNotifications)
  }, [])

  const handleNotificationClick = async (notification: any) => {
    try {
      await api.markNotificationRead(notification.id_notification)
      let redirectUrl = '/compte?tab=notif'
      if (notification.lien) {
        redirectUrl = notification.lien.startsWith('/messages/')
          ? `/compte?tab=messages&user=${notification.lien.split('/').filter(Boolean).pop()}`
          : notification.lien
      } else if (notification.type_notification === 'message' && notification.id_message) {
        redirectUrl = '/compte?tab=paiements'
      } else if (notification.type_notification === 'candidature' && notification.id_candidature) {
        redirectUrl = '/compte?tab=dossier'
      } else if (notification.type_notification === 'annonce' && notification.id_annonce) {
        redirectUrl = `/annonces/${notification.id_annonce}`
      } else if (notification.type_notification === 'favori') {
        redirectUrl = '/compte?tab=favoris'
      }
      setNotifications((prev) => prev.filter((n) => n.id_notification !== notification.id_notification))
      navigate(redirectUrl)
    } catch {
      if (notification.lien) {
        navigate(notification.lien.startsWith('/messages/')
          ? `/compte?tab=messages&user=${notification.lien.split('/').filter(Boolean).pop()}`
          : notification.lien)
      }
    }
  }

  const handleDeleteNotification = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation()
    if (!window.confirm(t('deleteConversationConfirm'))) return
    try {
      await api.deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id_notification !== id))
    } catch {
      // ignore
    }
  }

  const handleReadAll = async () => {
    setSaving(true)
    try {
      await api.markNotificationsRead()
      setNotifications([])
    } finally {
      setSaving(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-4 h-4 text-brand-cyan" />
      case 'candidature': return <Users className="w-4 h-4 text-brand-green" />
      case 'annonce': return <Home className="w-4 h-4 text-brand-cyan-dark" />
      case 'favori': return <Heart className="w-4 h-4 text-red-500" />
      default: return <Bell className="w-4 h-4 text-muted-foreground" />
    }
  }

  return (
    <div>
      <h2 className="bebas text-2xl">{t('notifications')}</h2>
      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10">
            <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{t('noNotifications')}</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id_notification}
              onClick={() => handleNotificationClick(item)}
              className={`w-full text-left rounded-xl border p-4 transition-all cursor-pointer ${
                item.est_lue 
                  ? 'border-border bg-white hover:border-brand-cyan/30 hover:shadow-sm' 
                  : 'border-brand-cyan/20 bg-brand-cyan-light/10 hover:border-brand-cyan/40 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getNotificationIcon(item.type_notification)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-foreground">
                      {item.titre}
                    </div>
                    {!item.est_lue && (
                      <span className="inline-block w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></span>
                    )}
                  </div>
                  <div className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                    {item.texte}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-2.5 py-1 font-medium">
                      {item.type_notification === 'message' ? t('messageContact') : 
                       item.type_notification === 'candidature' ? 'Candidature' :
                       item.type_notification === 'annonce' ? 'Annonce' :
                       item.type_notification === 'favori' ? 'Favori' : t('notification')}
                    </span>
                    <span>{new Date(item.date_creation).toLocaleString('fr-FR')}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDeleteNotification(item.id_notification, e)}
                  title={t('delete')}
                  className="p-1.5 hover:bg-red-50 rounded text-red-500 transition-colors"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {notifications.length > 0 && (
        <Button className="mt-6 bg-brand-cyan text-white hover:bg-brand-cyan-dark" onClick={handleReadAll} disabled={saving}>
          {saving ? t('updating') : t('markAllAsRead')}
        </Button>
      )}
    </div>
  )
}
