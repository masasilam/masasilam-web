import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Rss, ListChecks, Users, Trophy, Quote,
  User2, Users2, History, ChevronLeft,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import NotificationBell from '../../components/Social/NotificationBell'

const NAV_ITEMS = [
  { to: '/sosial/feed',      label: 'Feed',         icon: Rss,        public: true  },
  { to: '/sosial/anotasi',   label: 'Kutipan',      icon: Quote,      public: true  },
  { to: '/sosial/daftar',    label: 'Daftar Baca',  icon: ListChecks, public: true  },
  { to: '/sosial/grup',      label: 'Grup Baca',    icon: Users,      public: true  },
  { to: '/sosial/tantangan', label: 'Tantangan',    icon: Trophy,     public: true  },
  { to: '/sosial/kapsul',    label: 'Kapsul Waktu', icon: History,    public: true  },
  { to: '/sosial/twin',      label: 'Reading Twin', icon: Users2,     public: false },
]

const SocialLayout = () => {
  const location                  = useLocation()
  const navigate                  = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const isActive = (to) => location.pathname.startsWith(to)

  const visibleNav = NAV_ITEMS.filter(item => item.public || isAuthenticated)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex gap-6">

        {/* ── Sidebar Desktop ── */}
        <aside className="hidden lg:flex flex-col gap-1 w-52 flex-shrink-0 self-start sticky top-24">
          {/* Back to main site */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-xl hover:bg-white dark:hover:bg-gray-900 transition-all mb-2"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali ke Beranda
          </button>

          <div className="flex items-center gap-2 px-3 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center">
              <Rss className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-gray-900 dark:text-white">Sosial</span>
          </div>

          {visibleNav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(to)
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-200 dark:shadow-amber-900/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}

          {/* Profile shortcut */}
          {isAuthenticated && (
            <>
              <div className="my-2 border-t border-gray-200 dark:border-gray-800" />
              <Link
                to={`/sosial/profil/${user?.username}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  location.pathname.startsWith('/sosial/profil/' + user?.username)
                    ? 'bg-amber-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {user?.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <User2 className="w-4 h-4 flex-shrink-0" />
                )}
                Profil Saya
              </Link>
            </>
          )}

          {!isAuthenticated && (
            <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Masuk untuk menikmati fitur sosial lengkap
              </p>
              <Link
                to="/masuk"
                className="block w-full text-center py-2 bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold rounded-xl transition-all"
              >
                Masuk Sekarang
              </Link>
            </div>
          )}

          {/* Desktop notification bell */}
          {isAuthenticated && (
            <div className="mt-4 px-3">
              <NotificationBell />
            </div>
          )}
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0">

          {/* Mobile: horizontal scrollable tab bar */}
          {/* Header utama sudah ditampilkan oleh PublicLayout di atas.  */}
          {/* Tab bar ini hanya untuk sub-navigasi sosial di mobile.     */}
          <div className="lg:hidden mb-4 -mx-4 px-4">
            <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
              {visibleNav.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                    isActive(to)
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  to={`/sosial/profil/${user?.username}`}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                    location.pathname.startsWith('/sosial/profil/' + user?.username)
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <User2 className="w-3.5 h-3.5" />
                  Profil
                </Link>
              )}
            </div>
          </div>

          <Outlet />
        </main>

      </div>
    </div>
  )
}

export default SocialLayout