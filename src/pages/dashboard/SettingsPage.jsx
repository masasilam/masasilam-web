// src/pages/dashboard/SettingsPage.jsx
import { useState, useEffect } from 'react'
import {
  User, Mail, Lock, Bell, Eye, Globe, Palette,
  Download, Trash2, Shield, Moon, Sun, Monitor,
  Save, X
} from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'

const Header = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext)
}

const SettingsPage = () => {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)

  // Profile settings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
    avatar: ''
  })

  // Reading preferences
  const [readingPrefs, setReadingPrefs] = useState({
    fontSize: 16,
    fontFamily: 'serif',
    lineHeight: 1.6,
    textAlign: 'justify',
    autoBookmark: true,
    pageAnimation: true
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    newBooks: true,
    achievements: true,
    reminders: true,
    newsletter: false
  })

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showReadingActivity: true,
    showLibrary: false,
    allowRecommendations: true
  })

  const handleSave = () => {
    // Save settings to backend
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'reading', label: 'Preferensi Baca', icon: Eye },
    { id: 'appearance', label: 'Tampilan', icon: Palette },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'privacy', label: 'Privasi', icon: Shield },
    { id: 'account', label: 'Akun', icon: Lock },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Pengaturan</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Kelola preferensi dan pengaturan akun Anda
        </p>
      </div>

      {/* Save Notification */}
      {saved && (
        <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg p-4 flex items-center justify-between">
          <span>✓ Pengaturan berhasil disimpan</span>
          <button onClick={() => setSaved(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <aside className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sticky top-24">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="font-bold text-xl mb-4">Informasi Profil</h2>

                <div>
                  <label className="block text-sm font-semibold mb-2">Foto Profil</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-2xl font-bold">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                      Ubah Foto
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-900"
                    placeholder="Ceritakan sedikit tentang Anda..."
                  />
                </div>
              </div>
            )}

            {/* Reading Preferences Tab */}
            {activeTab === 'reading' && (
              <div className="space-y-6">
                <h2 className="font-bold text-xl mb-4">Preferensi Membaca</h2>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Ukuran Font: {readingPrefs.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={readingPrefs.fontSize}
                    onChange={(e) => setReadingPrefs({...readingPrefs, fontSize: parseInt(e.target.value)})}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Jenis Font</label>
                  <select
                    value={readingPrefs.fontFamily}
                    onChange={(e) => setReadingPrefs({...readingPrefs, fontFamily: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-900"
                  >
                    <option value="serif">Serif</option>
                    <option value="sans-serif">Sans Serif</option>
                    <option value="monospace">Monospace</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Jarak Baris: {readingPrefs.lineHeight}
                  </label>
                  <input
                    type="range"
                    min="1.2"
                    max="2.5"
                    step="0.1"
                    value={readingPrefs.lineHeight}
                    onChange={(e) => setReadingPrefs({...readingPrefs, lineHeight: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={readingPrefs.autoBookmark}
                      onChange={(e) => setReadingPrefs({...readingPrefs, autoBookmark: e.target.checked})}
                      className="w-5 h-5"
                    />
                    <span>Simpan penanda otomatis saat menutup buku</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={readingPrefs.pageAnimation}
                      onChange={(e) => setReadingPrefs({...readingPrefs, pageAnimation: e.target.checked})}
                      className="w-5 h-5"
                    />
                    <span>Animasi perpindahan halaman</span>
                  </label>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="font-bold text-xl mb-4">Tampilan</h2>

                <div>
                  <label className="block text-sm font-semibold mb-3">Tema</label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        theme === 'light'
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Sun className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm">Terang</span>
                    </button>

                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        theme === 'dark'
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Moon className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm">Gelap</span>
                    </button>

                    <button
                      onClick={() => setTheme('system')}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        theme === 'system'
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Monitor className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm">Sistem</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Bahasa</label>
                  <select className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-900">
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="font-bold text-xl mb-4">Notifikasi</h2>

                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span>Notifikasi Email</span>
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span>Notifikasi Push</span>
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span>Buku Baru</span>
                    <input
                      type="checkbox"
                      checked={notifications.newBooks}
                      onChange={(e) => setNotifications({...notifications, newBooks: e.target.checked})}
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span>Pencapaian</span>
                    <input
                      type="checkbox"
                      checked={notifications.achievements}
                      onChange={(e) => setNotifications({...notifications, achievements: e.target.checked})}
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span>Pengingat Membaca</span>
                    <input
                      type="checkbox"
                      checked={notifications.reminders}
                      onChange={(e) => setNotifications({...notifications, reminders: e.target.checked})}
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span>Newsletter</span>
                    <input
                      type="checkbox"
                      checked={notifications.newsletter}
                      onChange={(e) => setNotifications({...notifications, newsletter: e.target.checked})}
                      className="w-5 h-5"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="font-bold text-xl mb-4">Privasi & Keamanan</h2>

                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Profil Publik</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Orang lain dapat melihat profil Anda
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.profileVisible}
                      onChange={(e) => setPrivacy({...privacy, profileVisible: e.target.checked})}
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Aktivitas Membaca</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Tampilkan apa yang sedang Anda baca
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.showReadingActivity}
                      onChange={(e) => setPrivacy({...privacy, showReadingActivity: e.target.checked})}
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Perpustakaan Publik</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Orang lain dapat melihat perpustakaan Anda
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.showLibrary}
                      onChange={(e) => setPrivacy({...privacy, showLibrary: e.target.checked})}
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Rekomendasi Personal</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Gunakan data bacaan untuk rekomendasi
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.allowRecommendations}
                      onChange={(e) => setPrivacy({...privacy, allowRecommendations: e.target.checked})}
                      className="w-5 h-5"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <h2 className="font-bold text-xl mb-4">Pengaturan Akun</h2>

                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5" />
                      <span>Ubah Kata Sandi</span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">→</span>
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5" />
                      <span>Unduh Data Saya</span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">→</span>
                  </button>

                  <div className="border-t dark:border-gray-700 pt-4 mt-6">
                    <button className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">
                      <div className="flex items-center gap-3">
                        <Trash2 className="w-5 h-5" />
                        <span>Hapus Akun</span>
                      </div>
                      <span className="text-sm">→</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-gray-700">
              <button className="px-6 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                Batal
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                <Save className="w-5 h-5" />
                Simpan Perubahan
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default SettingsPage