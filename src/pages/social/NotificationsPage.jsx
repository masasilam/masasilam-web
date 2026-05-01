// src/pages/social/NotificationsPage.jsx
import { useState, useEffect, useCallback } from 'react'
import {
  Bell, CheckCheck, UserPlus, Heart, MessageCircle,
  Trophy, Users, BookOpen, Loader2, ChevronLeft, ChevronRight, Inbox
} from 'lucide-react'
import { notificationService } from '../../services/socialService'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const TYPE_CONFIG = {
  new_follower:        { icon: UserPlus,       color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20'   },
  list_like:           { icon: Heart,          color: 'text-rose-500',   bg: 'bg-rose-50 dark:bg-rose-900/20'   },
  annotation_like:     { icon: Heart,          color: 'text-rose-500',   bg: 'bg-rose-50 dark:bg-rose-900/20'   },
  annotation_comment:  { icon: MessageCircle,  color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20'},
  group_join_request:  { icon: Users,          color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20'},
  group_discussion:    { icon: MessageCircle,  color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20'},
  challenge_completed: { icon: Trophy,         color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20'},
  default:             { icon: Bell,           color: 'text-gray-400',   bg: 'bg-gray-100 dark:bg-gray-800'     },
}

const NotificationRow = ({ notif, onRead }) => {
  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.default
  const Icon = cfg.icon

  return (
    <div
      onClick={() => !notif.isRead && onRead(notif.id)}
      className={`flex gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 ${
        !notif.isRead ? 'bg-amber-50/40 dark:bg-amber-900/5' : ''
      }`}
    >
      <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
        <Icon className={`w-4 h-4 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${!notif.isRead ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
          {notif.message}
        </p>
        <p className="text-xs text-gray-400 mt-1">{notif.timeAgo || notif.createdAt}</p>
      </div>
      {!notif.isRead && (
        <div className="mt-2 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
      )}
    </div>
  )
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 20

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await notificationService.getAll(page, LIMIT)
      const d = res.data?.data
      setNotifications(d?.items || [])
      setTotal(d?.total || 0)
      setUnreadCount(d?.unreadCount || 0)
    } catch { toast.error('Gagal memuat notifikasi') }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { load() }, [load])

  const handleRead = async (id) => {
    try {
      await notificationService.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(p => Math.max(0, p - 1))
    } catch {}
  }

  const handleReadAll = async () => {
    try {
      await notificationService.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast.success('Semua notifikasi ditandai sudah dibaca')
    } catch { toast.error('Gagal') }
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" /> Notifikasi
            {unreadCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Semua aktivitas untukmu</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleReadAll}
            className="flex items-center gap-2 px-4 py-2 text-sm text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
          >
            <CheckCheck className="w-4 h-4" /> Baca Semua
          </button>
        )}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3 px-4 py-4 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Belum ada notifikasi</p>
            <p className="text-sm text-gray-400 mt-1">Mulai berinteraksi dengan komunitas</p>
          </div>
        ) : (
          <div>
            {notifications.map(n => (
              <NotificationRow key={n.id} notif={n} onRead={handleRead} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-40 hover:border-amber-400 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-40 hover:border-amber-400 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default NotificationsPage