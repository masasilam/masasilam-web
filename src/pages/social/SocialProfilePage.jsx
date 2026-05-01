// src/pages/social/SocialProfilePage.jsx
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  UserPlus, UserMinus, BookOpen, Layers, Film, PenLine,
  ListChecks, Quote, BarChart2, MapPin, Link2, Twitter,
  Instagram, Globe, ArrowLeft, Loader2, Heart, Eye
} from 'lucide-react'
import { profileService } from '../../services/socialService'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

// ── Follow / Followers Modal ──────────────────────────────────────────────────
const FollowModal = ({ userId, type, onClose }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = type === 'followers'
          ? await profileService.getFollowers(userId)
          : await profileService.getFollowing(userId)
        const d = res.data?.data
        setUsers(d?.followers || d?.following || [])
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [userId, type])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white capitalize">{type === 'followers' ? 'Pengikut' : 'Mengikuti'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">Tidak ada pengguna</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.map(u => (
                <Link key={u.userId} to={`/sosial/profil/${u.username}`} onClick={onClose}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  {u.profilePictureUrl ? (
                    <img src={u.profilePictureUrl} alt={u.username} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {(u.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{u.displayName || u.username}</p>
                    <p className="text-xs text-gray-400">@{u.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Activity mini-card ────────────────────────────────────────────────────────
const ActivityMini = ({ item }) => {
  const ICONS = {
    finished_book: BookOpen, started_reading: BookOpen, reviewed: PenLine,
    shared_annotation: Quote, added_to_list: ListChecks, created_reading_list: ListChecks,
    joined_challenge: '🏆', completed_challenge: '🏆', joined_group: Globe, followed_user: UserPlus,
  }
  const Icon = ICONS[item.activityType] || BookOpen
  return (
    <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <div className="w-7 h-7 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
        {typeof Icon === 'string' ? <span className="text-xs">{Icon}</span> : <Icon className="w-3.5 h-3.5 text-amber-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-1">
          {item.activityType?.replace(/_/g, ' ')}
          {item.entityTitle && <span className="font-medium"> · {item.entityTitle}</span>}
        </p>
        <p className="text-[10px] text-gray-400">{item.timeAgo}</p>
      </div>
    </div>
  )
}

// ── Stats Card ────────────────────────────────────────────────────────────────
const StatBox = ({ label, value, onClick }) => (
  <button onClick={onClick}
    className={`text-center py-3 flex-1 ${onClick ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer rounded-xl transition-colors' : ''}`}>
    <p className="font-bold text-gray-900 dark:text-white text-lg leading-none">{value ?? '-'}</p>
    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
  </button>
)

// ── Reading List Mini ─────────────────────────────────────────────────────────
const ListMini = ({ list }) => (
  <Link to={`/sosial/daftar/${list.id}`}
    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-amber-400 flex items-center justify-center flex-shrink-0">
      <ListChecks className="w-4 h-4 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{list.title}</p>
      <p className="text-[10px] text-gray-400">{list.itemCount || 0} item · {list.likeCount || 0} suka</p>
    </div>
  </Link>
)

// ── Annotation Mini ───────────────────────────────────────────────────────────
const AnnotationMini = ({ ann }) => (
  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-l-2" style={{ borderColor: ann.color || '#FDE68A' }}>
    <p className="text-xs text-gray-700 dark:text-gray-300 italic line-clamp-3">"{ann.selectedText}"</p>
    {ann.entityTitle && <p className="text-[10px] text-gray-400 mt-1">— {ann.entityTitle}</p>}
  </div>
)

// ── Main Page ─────────────────────────────────────────────────────────────────
const SocialProfilePage = () => {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user: me, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [followPending, setFollowPending] = useState(false)
  const [followModal, setFollowModal] = useState(null) // 'followers' | 'following'
  const [activeTab, setActiveTab] = useState('activity')

  const isMe = me?.username === username

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [pRes, sRes] = await Promise.all([
          profileService.getByUsername(username),
          isAuthenticated && isMe ? profileService.getMyStats() : Promise.resolve(null),
        ])
        const p = pRes.data?.data
        setProfile(p)
        setFollowing(p?.isFollowing || false)
        if (sRes) setStats(sRes.data?.data)
      } catch { toast.error('Profil tidak ditemukan') }
      finally { setLoading(false) }
    }
    load()
  }, [username, isAuthenticated, isMe])

  const toggleFollow = async () => {
    if (!isAuthenticated) { navigate('/masuk'); return }
    setFollowPending(true)
    try {
      if (following) {
        await profileService.unfollow(profile.userId)
        setFollowing(false)
        setProfile(p => ({ ...p, followerCount: Math.max(0, (p.followerCount || 1) - 1) }))
        toast.success('Berhenti mengikuti')
      } else {
        await profileService.follow(profile.userId)
        setFollowing(true)
        setProfile(p => ({ ...p, followerCount: (p.followerCount || 0) + 1 }))
        toast.success(`Mengikuti ${profile.displayName || username}`)
      }
    } catch (e) { toast.error(e?.response?.data?.detail || 'Gagal') }
    finally { setFollowPending(false) }
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto animate-pulse space-y-4">
      <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
    </div>
  )

  if (!profile) return <div className="text-center py-20 text-gray-400">Profil tidak ditemukan</div>

  const socialLinks = (() => {
    try { return typeof profile.socialLinks === 'string' ? JSON.parse(profile.socialLinks) : (profile.socialLinks || {}) }
    catch { return {} }
  })()

  const TABS = ['activity', 'lists', 'annotations']
  const TAB_LABEL = { activity: 'Aktivitas', lists: 'Daftar Baca', annotations: 'Kutipan' }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-4">
        {/* Cover */}
        <div className="h-24 bg-gradient-to-br from-amber-400 via-orange-300 to-rose-400" />

        <div className="px-5 pb-5">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-8 mb-3">
            <div className="relative">
              {profile.profilePictureUrl ? (
                <img src={profile.profilePictureUrl} alt={username}
                  className="w-16 h-16 rounded-2xl border-4 border-white dark:border-gray-900 object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-2xl border-4 border-white dark:border-gray-900 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-2xl">
                  {(username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {!isMe && isAuthenticated && (
              <button onClick={toggleFollow} disabled={followPending}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  following
                    ? 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-red-300 hover:text-red-500'
                    : 'bg-amber-500 hover:bg-amber-400 text-white'
                } disabled:opacity-50`}>
                {followPending ? <Loader2 className="w-4 h-4 animate-spin" /> : following ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {following ? 'Berhenti Ikuti' : 'Ikuti'}
              </button>
            )}
            {isMe && (
              <Link to="/dasbor/pengaturan"
                className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-gray-600 dark:text-gray-300">
                Edit Profil
              </Link>
            )}
          </div>

          {/* Name & bio */}
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{profile.displayName || username}</h1>
          <p className="text-sm text-gray-400">@{profile.username}</p>
          {profile.tagline && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{profile.tagline}</p>}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
            {profile.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span>}
            {profile.websiteUrl && (
              <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-amber-500 transition-colors">
                <Link2 className="w-3 h-3" />{profile.websiteUrl.replace(/^https?:\/\//, '')}
              </a>
            )}
            {socialLinks.twitter && <a href={`https://twitter.com/${socialLinks.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-sky-500"><Twitter className="w-3 h-3" />@{socialLinks.twitter}</a>}
            {socialLinks.instagram && <a href={`https://instagram.com/${socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-pink-500"><Instagram className="w-3 h-3" />@{socialLinks.instagram}</a>}
          </div>

          {/* Stats */}
          <div className="flex items-stretch gap-0 mt-4 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden divide-x divide-gray-100 dark:divide-gray-800">
            <StatBox label="Mengikuti" value={profile.followingCount ?? profile.totalFollowing} onClick={() => setFollowModal('following')} />
            <StatBox label="Pengikut"  value={profile.followerCount  ?? profile.totalFollowers} onClick={() => setFollowModal('followers')} />
            {<>
              <StatBox label="Aktivitas" value={stats?.totalActivities ?? profile.totalActivities} />
              <StatBox label="Daftar"    value={stats?.totalReadingLists ?? profile.totalReadingLists} />
            </>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === t ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'activity' && (
        <div className="space-y-2">
          {(profile.recentActivities || []).length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">Belum ada aktivitas publik</div>
          ) : (
            (profile.recentActivities || []).map((item, i) => <ActivityMini key={item.id || i} item={item} />)
          )}
        </div>
      )}

      {activeTab === 'lists' && (
        <div className="space-y-2">
          {(profile.publicLists || []).length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">Belum ada daftar baca publik</div>
          ) : (
            <>
              {(profile.publicLists || []).map(l => <ListMini key={l.id} list={l} />)}
              <Link to={`/sosial/daftar?userId=${profile.userId}`}
                className="block text-center text-sm text-amber-600 dark:text-amber-400 hover:underline py-2">
                Lihat semua daftar →
              </Link>
            </>
          )}
        </div>
      )}

      {activeTab === 'annotations' && (
        <div className="space-y-2">
          {(profile.publicAnnotations || []).length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">Belum ada kutipan publik</div>
          ) : (
            <>
              {(profile.publicAnnotations || []).map(a => <AnnotationMini key={a.id} ann={a} />)}
              <Link to={`/sosial/anotasi?userId=${profile.userId}`}
                className="block text-center text-sm text-rose-600 dark:text-rose-400 hover:underline py-2">
                Lihat semua kutipan →
              </Link>
            </>
          )}
        </div>
      )}

      {followModal && (
        <FollowModal userId={profile.userId} type={followModal} onClose={() => setFollowModal(null)} />
      )}
    </div>
  )
}

export default SocialProfilePage