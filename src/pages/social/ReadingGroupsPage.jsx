// src/pages/social/ReadingGroupsPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users, Plus, Search, Lock, Globe, Crown, Shield, UserMinus,
  MessageCircle, Heart, BarChart2, Calendar, BookOpen, ChevronRight,
  X, Loader2, Filter, Tag, UserPlus, CheckCircle, XCircle
} from 'lucide-react'
import { groupService } from '../../services/socialService'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import feedEvents, { FEED_EVENTS } from '../../services/feedEvents'

// ── Create Group Modal ────────────────────────────────────────────────────────
const CreateGroupModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    name: '', description: '', groupType: 'public',
    focusType: 'mixed', maxMembers: 100, tags: '', rules: ''
  })
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!form.name.trim()) { toast.error('Nama grup tidak boleh kosong'); return }
    setSaving(true)
    try {
      const res = await groupService.create({
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        maxMembers: Number(form.maxMembers),
      })
      onCreated(res.data?.data)
      onClose()
    } catch { toast.error('Gagal membuat grup') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="font-bold text-gray-900 dark:text-white">Buat Grup Baca</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Nama Grup *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nama grup baca..." className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Deskripsi</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} placeholder="Ceritakan tentang grup ini..."
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-gray-900 dark:text-gray-100 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Tipe</label>
              <select value={form.groupType} onChange={e => setForm(f => ({ ...f, groupType: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-gray-100">
                <option value="public">Publik</option>
                <option value="private">Privat</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Fokus</label>
              <select value={form.focusType} onChange={e => setForm(f => ({ ...f, focusType: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-gray-100">
                <option value="mixed">Campuran</option>
                <option value="book">Buku</option>
                <option value="zine">Zine</option>
                <option value="film">Film</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Maks. Anggota</label>
            <input type="number" min={2} max={1000} value={form.maxMembers}
              onChange={e => setForm(f => ({ ...f, maxMembers: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Tag</label>
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="fiksi, sejarah, sastra..." className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Peraturan Grup</label>
            <textarea value={form.rules} onChange={e => setForm(f => ({ ...f, rules: e.target.value }))}
              rows={2} placeholder="Aturan komunitas..."
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-gray-900 dark:text-gray-100 resize-none" />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Batal</button>
          <button onClick={submit} disabled={saving}
            className="flex-1 py-2.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Buat Grup
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Group Card ────────────────────────────────────────────────────────────────
const GroupCard = ({ group, onJoined }) => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [joining, setJoining] = useState(false)

  const isMember = group.isMember || group.myRole
  const tags = group.tags ? (Array.isArray(group.tags) ? group.tags : group.tags.split(',').map(t => t.trim()).filter(Boolean)) : []

  const handleJoin = async () => {
    if (!isAuthenticated) { navigate('/masuk'); return }
    setJoining(true)
    try {
      await groupService.join(group.id, {})
      toast.success(group.groupType === 'private' ? 'Permintaan bergabung terkirim' : 'Berhasil bergabung!')
      feedEvents.emit(FEED_EVENTS.REFRESH) // ← TAMBAH
      onJoined && onJoined(group.id)
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Gagal bergabung')
    } finally { setJoining(false) }
  }

  const FOCUS_COLOR = {
    book:  'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
    zine:  'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
    film:  'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    mixed: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300',
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all p-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
          {group.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {group.groupType === 'private' ? <Lock className="w-3 h-3 text-gray-400" /> : <Globe className="w-3 h-3 text-gray-400" />}
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${FOCUS_COLOR[group.focusType] || FOCUS_COLOR.mixed}`}>
              {group.focusType || 'mixed'}
            </span>
          </div>
          <Link to={`/sosial/grup/${group.slug}`} className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1">
            {group.name}
          </Link>
        </div>
      </div>

      {group.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{group.description}</p>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.slice(0, 4).map(t => (
            <span key={t} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full">{t}</span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {group.memberCount || 0}/{group.maxMembers || '∞'}</span>
        {group.activeSchedule && <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Sedang membaca</span>}
      </div>

      {/* Action */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-50 dark:border-gray-800">
        {isMember ? (
          <Link to={`/sosial/grup/${group.slug}`}
            className="flex-1 text-center py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all">
            Buka Grup
          </Link>
        ) : (
          <button onClick={handleJoin} disabled={joining}
            className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all disabled:opacity-50">
            {joining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
            {group.groupType === 'private' ? 'Minta Bergabung' : 'Bergabung'}
          </button>
        )}
        <Link to={`/sosial/grup/${group.slug}`}
          className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-300 transition-all">
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const ReadingGroupsPage = () => {
  const { isAuthenticated } = useAuth()
  const [tab, setTab] = useState(isAuthenticated ? 'mine' : 'public')
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [focusFilter, setFocusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [createModal, setCreateModal] = useState(false)
  const LIMIT = 12

  const load = useCallback(async () => {
    setLoading(true)
    try {
      let res
      if (tab === 'mine') {
        res = await groupService.getMine(page, LIMIT)
        const d = res.data?.data
        setGroups(d?.list || d?.data || [])
        setTotal(d?.total || 0)
      } else {
        res = await groupService.getPublic({ search, focusType: focusFilter, page, limit: LIMIT })
        const d = res.data?.data
        setGroups(d?.list || d?.data || [])
        setTotal(d?.total || 0)
      }
    } catch { toast.error('Gagal memuat grup') }
    finally { setLoading(false) }
  }, [tab, page, search, focusFilter])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" /> Grup Baca
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Baca bersama, diskusi lebih seru</p>
        </div>
        {isAuthenticated && (
          <button onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all hover:scale-105">
            <Plus className="w-4 h-4" /> Buat Grup
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          {isAuthenticated && (
            <button onClick={() => { setTab('mine'); setPage(1) }}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === 'mine' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              Grupku
            </button>
          )}
          <button onClick={() => { setTab('public'); setPage(1) }}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === 'public' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}>
            Semua Grup
          </button>
        </div>

        {tab === 'public' && (
          <>
            <div className="flex-1 min-w-48 flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3">
              <Search className="w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Cari grup..." className="flex-1 py-2 text-sm bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400" />
              {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-gray-400" /></button>}
            </div>
            <select value={focusFilter} onChange={e => { setFocusFilter(e.target.value); setPage(1) }}
              className="px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300">
              <option value="">Semua Fokus</option>
              <option value="book">Buku</option>
              <option value="zine">Zine</option>
              <option value="film">Film</option>
              <option value="mixed">Campuran</option>
            </select>
          </>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-52 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">{tab === 'mine' ? 'Belum bergabung ke grup manapun' : 'Tidak ada grup yang ditemukan'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(g => <GroupCard key={g.id} group={g} onJoined={load} />)}
        </div>
      )}

      {createModal && (
        <CreateGroupModal
          onClose={() => setCreateModal(false)}
          onCreated={g => { setGroups(prev => [g, ...prev]); load() }}
        />
      )}
    </div>
  )
}

export default ReadingGroupsPage