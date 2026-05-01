// src/pages/social/ReadingListDetailPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Heart, Bell, BellOff, GitFork, BookOpen, Layers, Film, Newspaper,
  Plus, Trash2, GripVertical, Lock, Globe, Tag, Eye, Edit2, X, Loader2, ListChecks
} from 'lucide-react'
import { readingListService } from '../../services/socialService'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import feedEvents, { FEED_EVENTS } from '../../services/feedEvents'

const ENTITY_ICON = { BOOK: BookOpen, ZINE: Layers, FILM: Film, NEWSPAPER: Newspaper }
const ENTITY_LINK = { BOOK: s => `/buku/${s}`, ZINE: s => `/zine/${s}`, FILM: s => `/film/${s}` }

const AddItemModal = ({ listId, onClose, onAdded }) => {
  const [form, setForm] = useState({ entityType: 'BOOK', entityId: '', note: '' })
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!form.entityId) { toast.error('ID entitas tidak boleh kosong'); return }
    setSaving(true)
    try {
      const res = await readingListService.addItem(listId, {
        entityType: form.entityType,
        entityId: Number(form.entityId),
        note: form.note,
      })
      onAdded(res.data?.data)
      onClose()
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Gagal menambahkan item')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white">Tambah Item</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Tipe</label>
            <select value={form.entityType} onChange={e => setForm(f => ({ ...f, entityType: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-gray-100">
              {['BOOK','ZINE','FILM','NEWSPAPER'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">ID Entitas *</label>
            <input type="number" value={form.entityId} onChange={e => setForm(f => ({ ...f, entityId: e.target.value }))}
              placeholder="Masukkan ID..."
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Catatan</label>
            <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Catatan opsional..." rows={2}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 text-gray-900 dark:text-gray-100 resize-none" />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Batal</button>
          <button onClick={submit} disabled={saving}
            className="flex-1 py-2.5 text-sm bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Tambah
          </button>
        </div>
      </div>
    </div>
  )
}

const ReadingListDetailPage = () => {
  const { listId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [list, setList] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [followed, setFollowed] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleting, setDeleting] = useState(false)  // ← TAMBAHAN

  const numericListId = list?.id
  const isMine = user && list && list.userId === user.id

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const isNumeric = /^\d+$/.test(listId)
      const listRes = isNumeric
        ? await readingListService.getById(listId)
        : await readingListService.getBySlugOnly(listId)

      const l = listRes.data?.data
      setList(l)
      setLiked(l?.isLiked || false)
      setLikeCount(l?.likeCount || 0)
      setFollowed(l?.isFollowed || false)

      const itemsRes = await readingListService.getItems(l.id)
      setItems(itemsRes.data?.data?.list || itemsRes.data?.data || [])
    } catch {
      toast.error('Gagal memuat daftar baca')
    } finally {
      setLoading(false)
    }
  }, [listId])

  useEffect(() => { load() }, [load])

  const toggleLike = async () => {
    if (!numericListId) return
    try {
      if (liked) {
        await readingListService.unlike(numericListId)
        setLiked(false)
        setLikeCount(p => Math.max(0, p - 1))
      } else {
        await readingListService.like(numericListId)
        setLiked(true)
        setLikeCount(p => p + 1)
      }
    } catch {}
  }

  const toggleFollow = async () => {
    if (!numericListId) return
    try {
      if (followed) {
        await readingListService.unfollow(numericListId)
        setFollowed(false)
        toast.success('Berhenti mengikuti')
      } else {
        await readingListService.follow(numericListId)
        setFollowed(true)
        toast.success('Mengikuti daftar')
      }
    } catch {}
  }

  const removeItem = async (entityType, entityId) => {
    if (!numericListId) return
    if (!confirm('Hapus item dari daftar?')) return
    try {
      await readingListService.removeItem(numericListId, entityType, entityId)
      setItems(prev => prev.filter(i => !(i.entityType === entityType && i.entityId === entityId)))
      toast.success('Item dihapus')
      feedEvents.emit(FEED_EVENTS.REFRESH) // ← TAMBAH
    } catch {
      toast.error('Gagal menghapus item')
    }
  }

  // ← TAMBAHAN: hapus seluruh daftar baca
  const deleteList = async () => {
    if (!confirm('Hapus daftar baca ini?...')) return
    setDeleting(true)
    try {
      await readingListService.delete(numericListId)
      toast.success('Daftar baca dihapus')
      feedEvents.emit(FEED_EVENTS.REFRESH) // ← TAMBAH
      navigate(-1)
    } catch {
      toast.error('Gagal menghapus daftar')
    } finally { setDeleting(false) }
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
      <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl" />)}
    </div>
  )

  if (!list) return <div className="text-center py-20 text-gray-400">Daftar tidak ditemukan</div>

  const tags = list.tags
    ? (Array.isArray(list.tags) ? list.tags : list.tags.split(',').map(t => t.trim()).filter(Boolean))
    : []

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      {/* Header Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {list.visibility === 'private'
                ? <Lock className="w-3.5 h-3.5 text-gray-400" />
                : <Globe className="w-3.5 h-3.5 text-gray-400" />}
              <span className="text-xs text-gray-400">oleh {list.username || list.owner?.username}</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">{list.title}</h1>
          </div>

          {/* ← TAMBAHAN: tombol hapus di kanan atas, hanya untuk owner */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isMine && (
              <button
                onClick={deleteList}
                disabled={deleting}
                title="Hapus daftar baca"
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-400 hover:text-red-600 transition-all disabled:opacity-50">
                {deleting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Trash2 className="w-4 h-4" />}
              </button>
            )}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-amber-400 flex items-center justify-center">
              <ListChecks className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {list.description && <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{list.description}</p>}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.map(t => (
              <span key={t} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full">
                <Tag className="w-2.5 h-2.5" /> {t}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
          <span><strong className="text-gray-600 dark:text-gray-200">{items.length}</strong> item</span>
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {list.viewCount || 0}</span>
          <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5" /> {list.forkedCount || 0}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {isAuthenticated && (
            <>
              <button onClick={toggleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                  liked
                    ? 'border-rose-300 bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-rose-300 hover:text-rose-500'
                }`}>
                <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} /> {likeCount} Suka
              </button>

              {!isMine && (
                <>
                  <button onClick={toggleFollow}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      followed
                        ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300'
                    }`}>
                    {followed ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    {followed ? 'Berhenti Ikuti' : 'Ikuti Daftar'}
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        await readingListService.fork(numericListId)
                        toast.success('Berhasil di-fork!')
                      } catch {
                        toast.error('Gagal fork')
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:border-teal-400 hover:text-teal-600 transition-all">
                    <GitFork className="w-4 h-4" /> Fork
                  </button>
                </>
              )}

              {isMine && (
                <button onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold transition-all ml-auto">
                  <Plus className="w-4 h-4" /> Tambah Item
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400">Belum ada item dalam daftar ini</p>
            {isMine && (
              <button onClick={() => setShowAddModal(true)} className="mt-3 text-sm text-amber-600 hover:underline">
                Tambah sekarang
              </button>
            )}
          </div>
        ) : (
          items.map((item, idx) => {
            const Icon = ENTITY_ICON[item.entityType] || BookOpen
            const link = ENTITY_LINK[item.entityType]?.(item.entitySlug || item.entityId)
            return (
              <div key={item.id || idx}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 flex items-center gap-3 hover:border-gray-200 dark:hover:border-gray-700 transition-all group">
                <div className="flex-shrink-0 w-6 text-center text-xs text-gray-300 font-mono">{idx + 1}</div>
                {item.entityCover ? (
                  <img src={item.entityCover} alt={item.entityTitle} className="w-10 h-14 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-10 h-14 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">{item.entityType}</span>
                  </div>
                  {link ? (
                    <Link to={link} className="font-medium text-sm text-gray-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 line-clamp-1 transition-colors">
                      {item.entityTitle || `#${item.entityId}`}
                    </Link>
                  ) : (
                    <p className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">
                      {item.entityTitle || `#${item.entityId}`}
                    </p>
                  )}
                  {item.note && <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.note}</p>}
                </div>
                {isMine && (
                  <button onClick={() => removeItem(item.entityType, item.entityId)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      {showAddModal && (
        <AddItemModal
          listId={numericListId}
          onClose={() => setShowAddModal(false)}
          onAdded={item => {
            setItems(prev => [...prev, item])
            feedEvents.emit(FEED_EVENTS.REFRESH) // ← TAMBAH
          }}
        />
      )}
    </div>
  )
}

export default ReadingListDetailPage