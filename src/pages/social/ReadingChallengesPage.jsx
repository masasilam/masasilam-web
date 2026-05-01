// src/pages/social/ReadingChallengesPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Trophy, Plus, Search, X, Loader2, ChevronRight, ChevronLeft,
  Target, Calendar, Users, Zap, BookOpen, CheckCircle, Medal,
  BarChart2, Star, Flag, Clock
} from 'lucide-react'
import { challengeService } from '../../services/socialService'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

// ── Create Challenge Modal ────────────────────────────────────────────────────
const CreateChallengeModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: '', description: '', challengeType: 'count',
    targetCount: 10, startDate: '', endDate: '',
    entityTypes: ['BOOK'], xpReward: 100,
    badgeName: '', requiredGenres: '',
  })
  const [saving, setSaving] = useState(false)

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = async () => {
    if (!form.title.trim()) { toast.error('Judul wajib diisi'); return }
    if (!form.startDate || !form.endDate) { toast.error('Tanggal mulai dan selesai wajib diisi'); return }
    setSaving(true)
    try {
      const res = await challengeService.create({
        ...form,
        targetCount: Number(form.targetCount),
        xpReward: Number(form.xpReward),
        requiredGenres: form.requiredGenres ? form.requiredGenres.split(',').map(g => g.trim()).filter(Boolean) : [],
      })
      onCreated(res.data?.data)
      onClose()
      toast.success('Tantangan berhasil dibuat!')
    } catch (e) { toast.error(e?.response?.data?.detail || 'Gagal membuat tantangan') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 z-10">
          <h2 className="font-bold text-gray-900 dark:text-white">Buat Tantangan Baru</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Judul Tantangan *</label>
            <input value={form.title} onChange={e => f('title', e.target.value)}
              placeholder="Misal: Baca 12 Buku dalam 2025"
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/30 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Deskripsi</label>
            <textarea value={form.description} onChange={e => f('description', e.target.value)}
              rows={3} placeholder="Jelaskan tantangan ini..."
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/30 text-gray-900 dark:text-gray-100 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Target Jumlah</label>
              <input type="number" min={1} value={form.targetCount} onChange={e => f('targetCount', e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/30 text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">XP Reward</label>
              <input type="number" min={0} value={form.xpReward} onChange={e => f('xpReward', e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/30 text-gray-900 dark:text-gray-100" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Tanggal Mulai *</label>
              <input type="date" value={form.startDate} onChange={e => f('startDate', e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/30 text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Tanggal Selesai *</label>
              <input type="date" value={form.endDate} onChange={e => f('endDate', e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/30 text-gray-900 dark:text-gray-100" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Tipe Entitas</label>
            <div className="flex flex-wrap gap-2">
              {['BOOK','ZINE','FILM','NEWSPAPER'].map(t => {
                const active = form.entityTypes.includes(t)
                return (
                  <button key={t} onClick={() => f('entityTypes', active ? form.entityTypes.filter(x => x !== t) : [...form.entityTypes, t])}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-all ${active ? 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-400 text-yellow-700 dark:text-yellow-300' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'}`}>
                    {t}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Nama Lencana (opsional)</label>
            <input value={form.badgeName} onChange={e => f('badgeName', e.target.value)}
              placeholder="Nama lencana hadiah..."
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/30 text-gray-900 dark:text-gray-100" />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Batal</button>
          <button onClick={submit} disabled={saving}
            className="flex-1 py-2.5 text-sm bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Buat Tantangan
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Leaderboard Modal ─────────────────────────────────────────────────────────
const LeaderboardModal = ({ challenge, onClose }) => {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await challengeService.getLeaderboard(challenge.id)
        setEntries(res.data?.data?.entries || [])
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [challenge.id])

  const MEDAL = { 0: '🥇', 1: '🥈', 2: '🥉' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" /> Leaderboard
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <p className="px-5 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">{challenge.title}</p>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
          ) : entries.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">Belum ada peserta</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {entries.map((e, i) => (
                <div key={e.userId || i} className={`flex items-center gap-3 px-5 py-3 ${i < 3 ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}`}>
                  <span className="w-6 text-center text-sm font-bold text-gray-400">{MEDAL[i] || i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(e.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/sosial/profil/${e.username}`} className="font-medium text-sm text-gray-900 dark:text-white hover:text-yellow-600 transition-colors">
                      {e.displayName || e.username}
                    </Link>
                    {e.completedAt && <p className="text-[10px] text-green-500">Selesai</p>}
                  </div>
                  <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{e.progressCount} <span className="text-xs font-normal text-gray-400">/ {challenge.targetCount}</span></span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Challenge Card ────────────────────────────────────────────────────────────
const ChallengeCard = ({ ch, onJoined, onViewLeaderboard }) => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [joining, setJoining] = useState(false)
  const [abandoning, setAbandoning] = useState(false)

  const isJoined = ch.isJoined || ch.myStatus
  const progress = ch.myProgressPercent || 0
  const progressCount = ch.myProgressCount || 0

  const now = new Date()
  const end = ch.endDate ? new Date(ch.endDate) : null
  const daysLeft = end ? Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24))) : null
  const isExpired = end && end < now

  const handleJoin = async () => {
    if (!isAuthenticated) { navigate('/masuk'); return }
    setJoining(true)
    try {
      await challengeService.join(ch.id)
      toast.success('Bergabung ke tantangan!')
      onJoined && onJoined(ch.id)
    } catch (e) { toast.error(e?.response?.data?.detail || 'Gagal bergabung') }
    finally { setJoining(false) }
  }

  const handleAbandon = async () => {
    if (!confirm('Keluar dari tantangan ini?')) return
    setAbandoning(true)
    try {
      await challengeService.abandon(ch.id)
      toast.success('Keluar dari tantangan')
      onJoined && onJoined(ch.id)
    } catch { toast.error('Gagal') }
    finally { setAbandoning(false) }
  }

  const STATUS_COLOR = {
    completed:   'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    in_progress: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    abandoned:   'bg-gray-100 dark:bg-gray-800 text-gray-500',
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:border-yellow-200 dark:hover:border-yellow-800 transition-all">
      {/* Top accent */}
      <div className="h-1.5 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400" />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              {ch.isOfficial && (
                <span className="text-[10px] px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-full font-semibold flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5" /> Resmi
                </span>
              )}
              {isExpired && <span className="text-[10px] px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full">Berakhir</span>}
              {isJoined && ch.myStatus && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[ch.myStatus] || STATUS_COLOR.in_progress}`}>
                  {ch.myStatus === 'completed' ? '✓ Selesai' : ch.myStatus === 'in_progress' ? 'Berjalan' : 'Ditinggalkan'}
                </span>
              )}
            </div>
            <Link to={`/sosial/tantangan/${ch.slug || ch.id}`}
              className="font-semibold text-gray-900 dark:text-white hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors line-clamp-1">
              {ch.title}
            </Link>
          </div>
        </div>

        {ch.description && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{ch.description}</p>}

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-3 flex-wrap">
          <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> Target: {ch.targetCount}</span>
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {ch.participantCount || 0} peserta</span>
          {daysLeft !== null && !isExpired && <span className="flex items-center gap-1 text-orange-500"><Clock className="w-3.5 h-3.5" /> {daysLeft} hari lagi</span>}
          {ch.xpReward > 0 && <span className="flex items-center gap-1 text-yellow-500"><Zap className="w-3.5 h-3.5" /> {ch.xpReward} XP</span>}
        </div>

        {/* My progress bar */}
        {isJoined && ch.myStatus === 'in_progress' && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progres saya</span>
              <span className="font-medium text-yellow-600 dark:text-yellow-400">{progressCount}/{ch.targetCount}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, progress)}%` }} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-50 dark:border-gray-800">
          {!isJoined ? (
            <button onClick={handleJoin} disabled={joining || isExpired}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-xl transition-all disabled:opacity-50">
              {joining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Flag className="w-3.5 h-3.5" />}
              {isExpired ? 'Berakhir' : 'Ikut Tantangan'}
            </button>
          ) : (
            <>
              <Link to={`/sosial/tantangan/${ch.slug || ch.id}`}
                className="flex-1 text-center py-2 text-sm font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-all">
                Lihat Detail
              </Link>
              {ch.myStatus === 'in_progress' && (
                <button onClick={handleAbandon} disabled={abandoning}
                  className="px-3 py-2 text-xs text-red-400 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                  Keluar
                </button>
              )}
            </>
          )}
          <button onClick={() => onViewLeaderboard(ch)}
            className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-yellow-300 transition-all" title="Leaderboard">
            <BarChart2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const ReadingChallengesPage = () => {
  const { isAuthenticated } = useAuth()
  const [tab, setTab] = useState(isAuthenticated ? 'mine' : 'active')
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [createModal, setCreateModal] = useState(false)
  const [leaderboardChallenge, setLeaderboardChallenge] = useState(null)
  const [mineStatus, setMineStatus] = useState('')
  const LIMIT = 12

  const load = useCallback(async () => {
    setLoading(true)
    try {
      let res
      if (tab === 'mine') {
        res = await challengeService.getMine(mineStatus || undefined, page, LIMIT)
      } else {
        res = await challengeService.getActive(page, LIMIT)
      }
      const d = res.data?.data
      setChallenges(d?.list || d?.data || [])
      setTotal(d?.total || 0)
    } catch { toast.error('Gagal memuat tantangan') }
    finally { setLoading(false) }
  }, [tab, page, mineStatus])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" /> Tantangan Baca
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Uji kemampuan membacamu</p>
        </div>
        {isAuthenticated && (
          <button onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 text-sm font-semibold rounded-xl transition-all hover:scale-105">
            <Plus className="w-4 h-4" /> Buat Tantangan
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <button onClick={() => { setTab('active'); setPage(1) }}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === 'active' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}>
            Semua Aktif
          </button>
          {isAuthenticated && (
            <button onClick={() => { setTab('mine'); setPage(1) }}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === 'mine' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              Tantanganku
            </button>
          )}
        </div>
        {tab === 'mine' && (
          <select value={mineStatus} onChange={e => { setMineStatus(e.target.value); setPage(1) }}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300">
            <option value="">Semua Status</option>
            <option value="in_progress">Berjalan</option>
            <option value="completed">Selesai</option>
            <option value="abandoned">Ditinggalkan</option>
          </select>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {tab === 'mine' ? 'Belum ikut tantangan apapun' : 'Tidak ada tantangan aktif'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map(ch => (
            <ChallengeCard key={ch.id} ch={ch} onJoined={load} onViewLeaderboard={setLeaderboardChallenge} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-40 hover:border-yellow-400 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-40 hover:border-yellow-400 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {createModal && (
        <CreateChallengeModal onClose={() => setCreateModal(false)} onCreated={c => { setChallenges(p => [c, ...p]); load() }} />
      )}
      {leaderboardChallenge && (
        <LeaderboardModal challenge={leaderboardChallenge} onClose={() => setLeaderboardChallenge(null)} />
      )}
    </div>
  )
}

export default ReadingChallengesPage