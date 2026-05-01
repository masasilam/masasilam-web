// src/components/Social/NotificationBell.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, Check, CheckCheck, User, Heart, MessageCircle, UserPlus, Trophy, BookOpen, Layers, X } from 'lucide-react'
import { notificationService } from '../../services/socialService'
import { Link } from 'react-router-dom'

const TYPE_ICON = {
  new_follower:        UserPlus,
  list_like:           Heart,
  annotation_like:     Heart,
  annotation_comment:  MessageCircle,
  group_join_request:  User,
  group_discussion:    MessageCircle,
  challenge_completed: Trophy,
  default:             Bell,
}

const NotificationItem = ({ notif, onRead }) => {
  const Icon = TYPE_ICON[notif.type] || TYPE_ICON.default
  return (
    <div
      className={`flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors ${
        !notif.isRead ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''
      }`}
      onClick={() => !notif.isRead && onRead(notif.id)}
    >
      <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        !notif.isRead ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-gray-100 dark:bg-gray-800'
      }`}>
        <Icon className={`w-4 h-4 ${!notif.isRead ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${!notif.isRead ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
          {notif.message}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{notif.timeAgo || 'baru saja'}</p>
      </div>
      {!notif.isRead && (
        <div className="mt-2 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
      )}
    </div>
  )
}

const NotificationBell = () => {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef(null)

  const fetchUnread = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount()
      setUnread(res.data?.data ?? 0)
    } catch {}
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const res = await notificationService.getAll(1, 20)
      setNotifications(res.data?.data?.items || [])
      setUnread(res.data?.data?.unreadCount || 0)
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchUnread()
    const interval = setInterval(fetchUnread, 60000)
    return () => clearInterval(interval)
  }, [fetchUnread])

  useEffect(() => {
    if (open) fetchAll()
  }, [open, fetchAll])

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleRead = async (id) => {
    try {
      await notificationService.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnread(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const handleReadAll = async () => {
    try {
      await notificationService.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnread(0)
    } catch {}
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        aria-label="Notifikasi"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl dark:shadow-black/50 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifikasi</h3>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={handleReadAll}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Baca semua
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
                    <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-400">Tidak ada notifikasi</p>
              </div>
            ) : (
              notifications.map(n => (
                <NotificationItem key={n.id} notif={n} onRead={handleRead} />
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2.5 text-center">
              <Link
                to="/dasbor/sosial/notifikasi"
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
                onClick={() => setOpen(false)}
              >
                Lihat semua notifikasi
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell