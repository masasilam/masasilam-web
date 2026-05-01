// src/pages/social/ReadingListsPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus, Search, Heart, GitFork, Eye, BookOpen, Layers, Film,
  Tag, Lock, Globe, MoreVertical, Edit2, Trash2, Share2,
  Bookmark, Bell, BellOff, X, ChevronLeft, ChevronRight, Loader2,
  ListChecks, CheckCircle
} from 'lucide-react'
import { readingListService } from '../../services/socialService'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import feedEvents, { FEED_EVENTS } from '../../services/feedEvents'

// ── Modal: Create / Edit List ─────────────────────────────────────────────────
const ListFormModal = ({ list, onClose, onSaved }) => {
  const [form, setForm] = useState({
    title: list?.title || '',
    description: list?.description || '',
    visibility: list?.visibility || 'public',
    tags: list?.tags || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('Judul tidak boleh kosong'); return }
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        visibility: form.visibility,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      const res = list
        ? await readingListService.update(list.id, payload)
        : await readingListService.create(payload)
      onSaved(res.data?.data)
      onClose()
    } catch { toast.error('Gagal menyimpan daftar') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white">{list ? 'Edit Daftar Baca' : 'Buat Daftar Baca'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Judul *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Nama daftar baca..."
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Deskripsi</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Ceritakan tentang daftar ini..."
              rows={3}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-gray-900 dark:text-gray-100 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Visibilitas</label>
            <div className="flex gap-2">
              {[
                { value: 'public',  label: 'Publik',  icon: Globe },
                { value: 'private', label: 'Pribadi', icon: Lock  },
              ].map(({ value, label, icon: Icon }) => (
                <button key={value}
                  onClick={() => setForm(f => ({ ...f, visibility: value }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-xl border transition-all ${
                    form.visibility === value
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Tag (pisahkan dengan koma)</label>
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="fiksi, klasik, indonesia..."
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-gray-900 dark:text-gray-100" />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 py-2.5 text-sm bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {list ? 'Simpan' : 'Buat Daftar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Reading List Card ─────────────────────────────────────────────────────────
const ReadingListCard = ({ list, isMine, onEdit, onDelete, onFork }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(list.isLiked || false)
  const [likeCount, setLikeCount] = useState(list.likeCount || 0)
  const [followed, setFollowed] = useState(list.isFollowed || false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [pending, setPending] = useState(false)

  const toggleLike = async () => {
    if (pending) return
    setPending(true)
    try {
      if (liked) { await readingListService.unlike(list.id); setLiked(false); setLikeCount(p => Math.max(0, p - 1)) }
      else        { await readingListService.like(list.id);   setLiked(true);  setLikeCount(p => p + 1) }
    } catch {} finally { setPending(false) }
  }

  const toggleFollow = async () => {
    try {
      if (followed) { await readingListService.unfollow(list.id); setFollowed(false); toast.success('Berhenti mengikuti daftar') }
      else          { await readingListService.follow(list.id);   setFollowed(true);  toast.success('Mengikuti daftar') }
    } catch { toast.error('Gagal') }
  }

  const tags = list.tags ? (Array.isArray(list.tags) ? list.tags : list.tags.split(',').map(t => t.trim()).filter(Boolean)) : []

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all group">
      {/* Cover strip */}
      <div className="h-2 rounded-t-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-teal-400" />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              {list.visibility === 'private' ? (
                <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" />
              ) : (
                <Globe className="w-3 h-3 text-gray-400 flex-shrink-0" />
              )}
              <span className="text-[10px] text-gray-400">
                {list.username || list.owner?.username || 'Anonim'}
              </span>
            </div>
            <Link to={`/sosial/daftar/${list.id}`}
              className="font-semibold text-gray-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 line-clamp-1 transition-colors">
              {list.title}
            </Link>
          </div>
          {(isMine || !isMine) && (
            <div className="relative flex-shrink-0 ml-2">
              <button onClick={() => setMenuOpen(v => !v)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 py-1">
                  {isMine ? (
                    <>
                      <button onClick={() => { setMenuOpen(false); onEdit(list) }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => { setMenuOpen(false); onDelete(list.id) }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-left text-red-500">
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </>
                  ) : (
                    <button onClick={() => { setMenuOpen(false); onFork(list.id) }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
                      <GitFork className="w-3.5 h-3.5" /> Fork Daftar
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {list.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{list.description}</p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 4).map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full">
                <Tag className="w-2.5 h-2.5" /> {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {list.itemCount || 0} item</span>
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {list.viewCount || 0}</span>
          {list.forkedCount > 0 && <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5" /> {list.forkedCount}</span>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-50 dark:border-gray-800">
          <button onClick={toggleLike}
            className={`flex items-center gap-1.5 text-xs transition-all hover:scale-110 ${liked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-400'}`}>
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-500' : ''}`} />
            {likeCount > 0 ? likeCount : 'Suka'}
          </button>
          {!isMine && (
            <button onClick={toggleFollow}
              className={`flex items-center gap-1.5 text-xs transition-all ml-auto ${followed ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 hover:text-amber-500'}`}>
              {followed ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
              {followed ? 'Berhenti Ikuti' : 'Ikuti'}
            </button>
          )}
          {!isMine && (
            <button onClick={() => onFork(list.id)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-teal-500 transition-all">
              <GitFork className="w-3.5 h-3.5" /> Fork
            </button>
          )}
          <Link to={`/sosial/daftar/${list.id}`}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-all ml-auto">
            Lihat <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const ReadingListsPage = () => {
  const { isAuthenticated } = useAuth()
  const [tab, setTab] = useState(isAuthenticated ? 'mine' : 'public')
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [formModal, setFormModal] = useState(null) // null | 'create' | listObj
  const LIMIT = 12

  const load = useCallback(async () => {
    setLoading(true)
    try {
      let res
      if (tab === 'mine') {
        res = await readingListService.getMine(page, LIMIT)
        const d = res.data?.data
        setLists(d?.list || d?.data || [])
        setTotal(d?.total || 0)
      } else {
        res = await readingListService.getPublic({ search, page, limit: LIMIT })
        const d = res.data?.data
        setLists(d?.list || d?.data || [])
        setTotal(d?.total || 0)
      }
    } catch { toast.error('Gagal memuat daftar') }
    finally { setLoading(false) }
  }, [tab, page, search])

  useEffect(() => { load() }, [load])

  // handleDelete
  const handleDelete = async (listId) => {
    if (!confirm('Hapus daftar baca ini?')) return
    try {
      await readingListService.delete(listId)
      setLists(prev => prev.filter(l => l.id !== listId))
      toast.success('Daftar dihapus')
      feedEvents.emit(FEED_EVENTS.REFRESH) // ← TAMBAH
    } catch { toast.error('Gagal menghapus') }
  }

  // handleSaved
  const handleSaved = (newList) => {
    if (formModal !== 'create') {
      setLists(prev => prev.map(l => l.id === newList?.id ? newList : l))
    } else {
      setLists(prev => [newList, ...prev])
    }
    feedEvents.emit(FEED_EVENTS.REFRESH) // ← TAMBAH
    load()
  }

  // handleFork
  const handleFork = async (listId) => {
    try {
      const res = await readingListService.fork(listId)
      toast.success('Daftar berhasil di-fork!')
      feedEvents.emit(FEED_EVENTS.REFRESH) // ← TAMBAH
      if (tab === 'mine') load()
    } catch { toast.error('Gagal fork daftar') }
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-teal-500" /> Daftar Baca
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Kurasi buku, zine & film favoritmu</p>
        </div>
        {isAuthenticated && (
          <button onClick={() => setFormModal('create')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-xl transition-all hover:scale-105">
            <Plus className="w-4 h-4" /> Buat Daftar
          </button>
        )}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          {isAuthenticated && (
            <button onClick={() => { setTab('mine'); setPage(1) }}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === 'mine' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              Milikku
            </button>
          )}
          <button onClick={() => { setTab('public'); setPage(1) }}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === 'public' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}>
            Publik
          </button>
        </div>
        {tab === 'public' && (
          <div className="flex-1 flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3">
            <Search className="w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Cari daftar baca..."
              className="flex-1 py-2 text-sm bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400" />
            {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-gray-400" /></button>}
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : lists.length === 0 ? (
        <div className="text-center py-16">
          <ListChecks className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {tab === 'mine' ? 'Belum ada daftar baca. Buat yang pertama!' : 'Tidak ada daftar baca publik'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map(list => (
            <ReadingListCard
              key={list.id}
              list={list}
              isMine={tab === 'mine'}
              onEdit={setFormModal}
              onDelete={handleDelete}
              onFork={handleFork}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-40 hover:border-amber-400 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
            {page} / {totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-40 hover:border-amber-400 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal */}
      {(formModal === 'create' || (formModal && typeof formModal === 'object')) && (
        <ListFormModal
          list={formModal === 'create' ? null : formModal}
          onClose={() => setFormModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}

export default ReadingListsPage