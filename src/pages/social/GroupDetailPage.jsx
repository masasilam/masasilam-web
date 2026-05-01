// src/pages/social/GroupDetailPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Users, MessageCircle, BarChart2, Calendar, Settings,
  Crown, Shield, UserMinus, Heart, Send, Plus, X, Loader2, Lock,
  Globe, BookOpen, CheckCircle, XCircle, Check, ChevronDown, Trash2, Edit2
} from 'lucide-react'
import { groupService } from '../../services/socialService'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import feedEvents, { FEED_EVENTS } from '../../services/feedEvents'

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'discussions', label: 'Diskusi', icon: MessageCircle },
  { key: 'schedules',   label: 'Jadwal',  icon: Calendar },
  { key: 'polls',       label: 'Poll',    icon: BarChart2 },
  { key: 'members',     label: 'Anggota', icon: Users },
]

// ── Discussion Thread ─────────────────────────────────────────────────────────
const DiscussionThread = ({ disc, groupId, myRole, onDelete }) => {
  const { user } = useAuth()
  const [liked, setLiked] = useState(disc.isLiked || false)
  const [likeCount, setLikeCount] = useState(disc.likeCount || 0)
  const [showReplies, setShowReplies] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replies, setReplies] = useState(disc.replies || [])

  const toggleLike = async () => {
    try {
      if (liked) { await groupService.unlikeDiscussion(groupId, disc.id); setLiked(false); setLikeCount(p => Math.max(0, p-1)) }
      else        { await groupService.likeDiscussion(groupId, disc.id);  setLiked(true);  setLikeCount(p => p+1) }
    } catch {}
  }

  const submitReply = async () => {
    if (!replyText.trim()) return
    setSubmitting(true)
    try {
      const res = await groupService.createDiscussion(groupId, { content: replyText, parentId: disc.id })
      setReplies(prev => [...prev, res.data?.data])
      setReplyText('')
      setShowReplies(true)
    } catch { toast.error('Gagal mengirim balasan') }
    finally { setSubmitting(false) }
  }

  const isMod = myRole === 'owner' || myRole === 'moderator'
  const isOwner = user?.id === disc.userId

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {(disc.username || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-900 dark:text-white">{disc.username}</span>
            <span className="text-xs text-gray-400">{disc.timeAgo || disc.createdAt}</span>
          </div>
          {disc.title && <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 mt-0.5">{disc.title}</p>}
        </div>
        {(isOwner || isMod) && (
          <button onClick={() => onDelete(disc.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{disc.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 mb-3">
        <button onClick={toggleLike}
          className={`flex items-center gap-1.5 text-xs transition-all hover:scale-110 ${liked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-400'}`}>
          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-500' : ''}`} /> {likeCount || ''}
        </button>
        <button onClick={() => setShowReplies(v => !v)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-500 transition-all">
          <MessageCircle className="w-3.5 h-3.5" /> {disc.replyCount || replies.length || ''} Balas
        </button>
      </div>

      {/* Replies */}
      {showReplies && (
        <div className="pl-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-3 mb-3">
          {replies.map((r, i) => (
            <div key={r.id || i} className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-300 to-purple-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                {(r.username || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mr-2">{r.username}</span>
                <span className="text-xs text-gray-700 dark:text-gray-300">{r.content}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply input */}
      <div className="flex gap-2 mt-2">
        <input value={replyText} onChange={e => setReplyText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submitReply()}
          placeholder="Tulis balasan..."
          className="flex-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/30 text-gray-900 dark:text-gray-100 placeholder-gray-400" />
        <button onClick={submitReply} disabled={submitting || !replyText.trim()}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-full text-white">
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

// ── Poll Card ─────────────────────────────────────────────────────────────────
const PollCard = ({ poll, groupId, myRole }) => {
  const [voted, setVoted] = useState(poll.myVote || null)
  const [options, setOptions] = useState(() => {
    try { return typeof poll.options === 'string' ? JSON.parse(poll.options) : (poll.options || []) }
    catch { return [] }
  })
  const [voting, setVoting] = useState(false)

  const totalVotes = options.reduce((s, o) => s + (o.vote_count || 0), 0)

  const vote = async (optionId) => {
    if (voted || poll.isClosed) return
    setVoting(true)
    try {
      const res = await groupService.vote(groupId, poll.id, { optionId })
      const updated = res.data?.data
      if (updated?.options) {
        try { setOptions(typeof updated.options === 'string' ? JSON.parse(updated.options) : updated.options) }
        catch {}
      }
      setVoted(optionId)
    } catch { toast.error('Gagal vote') }
    finally { setVoting(false) }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug flex-1">{poll.question}</h3>
        {poll.isClosed && <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full ml-2 flex-shrink-0">Selesai</span>}
      </div>
      <div className="space-y-2">
        {options.map(opt => {
          const pct = totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0
          const isVoted = voted === opt.id
          return (
            <button key={opt.id} onClick={() => vote(opt.id)} disabled={!!voted || poll.isClosed || voting}
              className={`w-full relative overflow-hidden rounded-xl border text-left px-3 py-2.5 transition-all ${
                isVoted ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
              } disabled:cursor-default`}>
              {(voted || poll.isClosed) && (
                <div className="absolute inset-0 left-0 top-0 h-full bg-indigo-100/60 dark:bg-indigo-900/20 transition-all" style={{ width: `${pct}%` }} />
              )}
              <div className="relative flex items-center justify-between">
                <span className={`text-sm ${isVoted ? 'text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                  {opt.text}
                </span>
                {(voted || poll.isClosed) && (
                  <span className="text-xs text-gray-500 font-semibold">{pct}%</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
      <p className="text-xs text-gray-400 mt-3">{totalVotes} suara total</p>
    </div>
  )
}

// ── Create Discussion Modal ───────────────────────────────────────────────────
const CreateDiscussionModal = ({ groupId, onClose, onCreated }) => {
  const [form, setForm] = useState({ title: '', content: '' })
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!form.content.trim()) { toast.error('Konten tidak boleh kosong'); return }
    setSaving(true)
    try {
      const res = await groupService.createDiscussion(groupId, form)
      onCreated(res.data?.data)
      onClose()
    } catch { toast.error('Gagal membuat diskusi') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white">Diskusi Baru</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Judul diskusi (opsional)" className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-gray-900 dark:text-gray-100" />
          <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={5} placeholder="Tulis diskusimu..." className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-gray-900 dark:text-gray-100 resize-none" />
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Batal</button>
          <button onClick={submit} disabled={saving}
            className="flex-1 py-2.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Posting
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Create Poll Modal ─────────────────────────────────────────────────────────
const CreatePollModal = ({ groupId, onClose, onCreated }) => {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    const validOpts = options.filter(o => o.trim())
    if (!question.trim() || validOpts.length < 2) { toast.error('Isi pertanyaan dan minimal 2 pilihan'); return }
    setSaving(true)
    try {
      const res = await groupService.createPoll(groupId, { question, options: validOpts })
      onCreated(res.data?.data)
      onClose()
    } catch { toast.error('Gagal membuat poll') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white">Buat Poll</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <input value={question} onChange={e => setQuestion(e.target.value)}
            placeholder="Pertanyaan poll..." className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-gray-900 dark:text-gray-100" />
          <div className="space-y-2">
            {options.map((o, i) => (
              <div key={i} className="flex gap-2">
                <input value={o} onChange={e => setOptions(prev => prev.map((p, j) => j === i ? e.target.value : p))}
                  placeholder={`Pilihan ${i+1}`} className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-gray-900 dark:text-gray-100" />
                {options.length > 2 && <button onClick={() => setOptions(prev => prev.filter((_, j) => j !== i))} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><X className="w-3.5 h-3.5" /></button>}
              </div>
            ))}
            {options.length < 6 && (
              <button onClick={() => setOptions(prev => [...prev, ''])} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" /> Tambah pilihan
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Batal</button>
          <button onClick={submit} disabled={saving}
            className="flex-1 py-2.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Buat Poll
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Detail Page ──────────────────────────────────────────────────────────
const GroupDetailPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('discussions')
  const [discussions, setDiscussions] = useState([])
  const [polls, setPolls] = useState([])
  const [members, setMembers] = useState([])
  const [schedules, setSchedules] = useState([])
  const [joinRequests, setJoinRequests] = useState([])
  const [tabLoading, setTabLoading] = useState(false)
  const [modal, setModal] = useState(null) // 'discussion' | 'poll'

  const myRole = group?.myRole

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await groupService.getBySlug(slug)
        setGroup(res.data?.data)
      } catch { toast.error('Grup tidak ditemukan') }
      finally { setLoading(false) }
    }
    load()
  }, [slug])

  const loadTab = useCallback(async () => {
    if (!group) return
    setTabLoading(true)
    try {
      if (tab === 'discussions') {
        const res = await groupService.getDiscussions(group.id, { page: 1, limit: 20 })
        setDiscussions(res.data?.data?.list || [])
      } else if (tab === 'polls') {
        const res = await groupService.getPolls(group.id)
        setPolls(res.data?.data?.list || [])
      } else if (tab === 'members') {
        const [memRes, reqRes] = await Promise.all([
          groupService.getMembers(group.id),
          (myRole === 'owner' || myRole === 'moderator') ? groupService.getJoinRequests(group.id) : Promise.resolve(null),
        ])
        setMembers(memRes.data?.data?.list || [])
        if (reqRes) setJoinRequests(reqRes.data?.data?.list || [])
      } else if (tab === 'schedules') {
        const res = await groupService.getSchedules(group.id)
        setSchedules(res.data?.data?.list || [])
      }
    } catch {} finally { setTabLoading(false) }
  }, [group, tab, myRole])

  useEffect(() => { loadTab() }, [loadTab])

  // handleJoin
  const handleJoin = async () => {
    if (!isAuthenticated) { navigate('/masuk'); return }
    try {
      await groupService.join(group.id, {})
      toast.success(group.groupType === 'private' ? 'Permintaan terkirim' : 'Bergabung!')
      feedEvents.emit(FEED_EVENTS.REFRESH) // ← TAMBAH
      const res = await groupService.getBySlug(slug)
      setGroup(res.data?.data)
    } catch (e) { toast.error(e?.response?.data?.detail || 'Gagal') }
  }

  // handleLeave
  const handleLeave = async () => {
    if (!confirm('Keluar dari grup?')) return
    try {
      await groupService.leave(group.id)
      toast.success('Keluar dari grup')
      feedEvents.emit(FEED_EVENTS.REFRESH) // ← TAMBAH
      navigate('/sosial/grup')
    } catch (e) { toast.error(e?.response?.data?.detail || 'Gagal') }
  }

  const deleteDiscussion = async (discId) => {
    if (!confirm('Hapus diskusi?')) return
    try {
      await groupService.deleteDiscussion(group.id, discId)
      setDiscussions(prev => prev.filter(d => d.id !== discId))
    } catch { toast.error('Gagal menghapus') }
  }

  const reviewRequest = async (reqId, action) => {
    try {
      await groupService.reviewJoinRequest(group.id, reqId, { action })
      setJoinRequests(prev => prev.filter(r => r.id !== reqId))
      toast.success(action === 'approve' ? 'Disetujui' : 'Ditolak')
    } catch { toast.error('Gagal') }
  }

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
    </div>
  )

  if (!group) return <div className="text-center py-20 text-gray-400">Grup tidak ditemukan</div>

  const isMember = !!myRole
  const isMod = myRole === 'owner' || myRole === 'moderator'

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      {/* Group Header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-4">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            {group.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {group.groupType === 'private' ? <Lock className="w-3.5 h-3.5 text-gray-400" /> : <Globe className="w-3.5 h-3.5 text-gray-400" />}
              <span className="text-xs text-gray-400">{group.focusType} · {group.memberCount} anggota</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{group.name}</h1>
            {myRole && (
              <span className={`inline-flex items-center gap-1 mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                myRole === 'owner' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                myRole === 'moderator' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' :
                'bg-gray-100 dark:bg-gray-800 text-gray-500'
              }`}>
                {myRole === 'owner' ? <Crown className="w-2.5 h-2.5" /> : myRole === 'moderator' ? <Shield className="w-2.5 h-2.5" /> : null}
                {myRole}
              </span>
            )}
          </div>
        </div>

        {group.description && <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{group.description}</p>}
        {group.activeSchedule && (
          <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl mb-4 text-sm">
            <BookOpen className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <div>
              <span className="text-indigo-700 dark:text-indigo-300 font-medium">Sedang dibaca: </span>
              <span className="text-indigo-600 dark:text-indigo-400">{group.activeSchedule.entityTitle || group.activeSchedule.entityType}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {!isMember ? (
            <button onClick={handleJoin}
              className="flex-1 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all">
              {group.groupType === 'private' ? 'Minta Bergabung' : 'Bergabung'}
            </button>
          ) : myRole !== 'owner' ? (
            <button onClick={handleLeave}
              className="px-4 py-2 text-sm text-red-500 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
              Keluar Grup
            </button>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === key ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tabLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Discussions */}
          {tab === 'discussions' && (
            <div className="space-y-3">
              {isMember && (
                <button onClick={() => setModal('discussion')}
                  className="w-full flex items-center gap-2 p-3 bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-all">
                  <MessageCircle className="w-4 h-4" /> Mulai diskusi baru...
                </button>
              )}
              {discussions.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">Belum ada diskusi</div>
              ) : (
                discussions.map(d => <DiscussionThread key={d.id} disc={d} groupId={group.id} myRole={myRole} onDelete={deleteDiscussion} />)
              )}
            </div>
          )}

          {/* Polls */}
          {tab === 'polls' && (
            <div className="space-y-3">
              {isMod && (
                <button onClick={() => setModal('poll')}
                  className="w-full flex items-center gap-2 p-3 bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-all">
                  <BarChart2 className="w-4 h-4" /> Buat poll baru...
                </button>
              )}
              {polls.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">Belum ada poll</div>
              ) : (
                polls.map(p => <PollCard key={p.id} poll={p} groupId={group.id} myRole={myRole} />)
              )}
            </div>
          )}

          {/* Members */}
          {tab === 'members' && (
            <div className="space-y-2">
              {/* Join Requests (mod only) */}
              {joinRequests.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800 p-4 mb-4">
                  <h3 className="font-semibold text-amber-700 dark:text-amber-300 text-sm mb-3">Permintaan Bergabung ({joinRequests.length})</h3>
                  <div className="space-y-2">
                    {joinRequests.map(req => (
                      <div key={req.id} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-300 text-xs font-bold flex-shrink-0">
                          {(req.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{req.username}</span>
                        <button onClick={() => reviewRequest(req.id, 'approve')} className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg"><CheckCircle className="w-4 h-4" /></button>
                        <button onClick={() => reviewRequest(req.id, 'reject')} className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"><XCircle className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {members.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">Belum ada anggota</div>
              ) : (
                members.map(m => (
                  <div key={m.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-300 to-purple-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {(m.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/sosial/profil/${m.username}`} className="font-medium text-sm text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {m.displayName || m.username}
                      </Link>
                    </div>
                    <div className="flex items-center gap-1">
                      {m.role === 'owner' && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                      {m.role === 'moderator' && <Shield className="w-3.5 h-3.5 text-indigo-500" />}
                      <span className="text-[10px] text-gray-400">{m.role}</span>
                    </div>
                    {isMod && m.role !== 'owner' && m.userId !== user?.id && (
                      <button onClick={async () => {
                        if (!confirm('Kick anggota ini?')) return
                        try { await groupService.kickMember(group.id, m.userId); setMembers(prev => prev.filter(x => x.id !== m.id)); toast.success('Anggota dikeluarkan') }
                        catch { toast.error('Gagal') }
                      }} className="p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Schedules */}
          {tab === 'schedules' && (
            <div className="space-y-3">
              {schedules.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">Belum ada jadwal baca</div>
              ) : (
                schedules.map(s => (
                  <div key={s.id} className={`bg-white dark:bg-gray-900 rounded-2xl border p-4 ${s.isCompleted ? 'border-gray-100 dark:border-gray-800 opacity-70' : 'border-indigo-200 dark:border-indigo-800'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.isCompleted ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'}`}>
                          {s.isCompleted ? '✓ Selesai' : 'Aktif'}
                        </span>
                        <p className="font-medium text-gray-900 dark:text-white mt-1.5">{s.entityType} #{s.entityId}</p>
                        {s.chapterLabel && <p className="text-xs text-gray-500 mt-0.5">{s.chapterLabel}</p>}
                        {s.discussionPrompt && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 italic">"{s.discussionPrompt}"</p>}
                      </div>
                      {isMod && !s.isCompleted && (
                        <button onClick={async () => {
                          try { await groupService.completeSchedule(group.id, s.id); loadTab(); toast.success('Jadwal ditandai selesai') }
                          catch { toast.error('Gagal') }
                        }} className="text-xs text-green-600 hover:underline flex items-center gap-1">
                          <Check className="w-3 h-3" /> Selesai
                        </button>
                      )}
                    </div>
                    {(s.startDate || s.endDate) && (
                      <p className="text-xs text-gray-400 mt-2">{s.startDate} → {s.endDate}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {modal === 'discussion' && (
        <CreateDiscussionModal groupId={group.id} onClose={() => setModal(null)}
          onCreated={d => { setDiscussions(prev => [d, ...prev]); setModal(null) }} />
      )}
      {modal === 'poll' && (
        <CreatePollModal groupId={group.id} onClose={() => setModal(null)}
          onCreated={p => { setPolls(prev => [p, ...prev]); setModal(null) }} />
      )}
    </div>
  )
}

export default GroupDetailPage