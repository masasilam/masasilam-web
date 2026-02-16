// ============================================
// src/pages/dashboard/SettingsPage.jsx - FIXED VERSION
// ============================================

import { useState, useEffect, useContext } from 'react'
import {
  User, Mail, Lock, Bell, Eye, Globe, Palette,
  Download, Trash2, Shield, Moon, Sun, Monitor,
  Save, X, Camera, Loader2, AlertCircle
} from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { AuthContext } from '../../context/AuthContext'
import { userService } from '../../services/userService'
import { toast } from 'react-hot-toast'

const SettingsPage = () => {
  const { theme, setTheme } = useTheme()
  const { user, updateUser, logout } = useContext(AuthContext)

  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Profile settings
  const [profileData, setProfileData] = useState({
    fullName: '',
    bio: '',
    profilePictureUrl: '',
    emailNotifications: true
  })

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Reading preferences (stored in localStorage for now)
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

  // Load user data on mount
  useEffect(() => {
    console.log('🔵 SettingsPage: User from context:', user)

    if (user) {
      setProfileData({
        fullName: user.fullName || user.name || '',
        bio: user.bio || '',
        profilePictureUrl: user.profilePictureUrl || '',
        emailNotifications: user.emailNotifications ?? true
      })
    }

    // Load reading preferences from localStorage
    const savedPrefs = localStorage.getItem('readingPreferences')
    if (savedPrefs) {
      try {
        setReadingPrefs(JSON.parse(savedPrefs))
      } catch (e) {
        console.error('Error parsing reading preferences:', e)
      }
    }

    // Load notification settings from localStorage
    const savedNotifications = localStorage.getItem('notificationSettings')
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch (e) {
        console.error('Error parsing notification settings:', e)
      }
    }

    // Load privacy settings from localStorage
    const savedPrivacy = localStorage.getItem('privacySettings')
    if (savedPrivacy) {
      try {
        setPrivacy(JSON.parse(savedPrivacy))
      } catch (e) {
        console.error('Error parsing privacy settings:', e)
      }
    }
  }, [user])

  // ✅ FIXED: Handle profile update
  const handleUpdateProfile = async () => {
    if (!user?.id) {
      toast.error('User ID tidak ditemukan')
      console.error('❌ User ID not found:', user)
      return
    }

    try {
      setSaving(true)
      setError(null)

      console.log('🔵 Updating profile for user ID:', user.id)
      console.log('🔵 Profile data:', profileData)

      const response = await userService.updateProfile(user.id, {
        fullName: profileData.fullName,
        bio: profileData.bio,
        profilePictureUrl: profileData.profilePictureUrl,
        emailNotifications: profileData.emailNotifications
      })

      console.log('✅ Update response:', response)
      console.log('✅ Response data:', response.data)

      if (response.result === 'success' || response.result === 'Success' || response.statusCode === 200 || response.code === 200) {
        // 🔥 CRITICAL: Update dengan seluruh data dari response
        console.log('🔥 Updating user context with:', response.data)

        updateUser(response.data)

        // Update juga local state agar form tetap sinkron
        setProfileData({
          fullName: response.data.fullName || '',
          bio: response.data.bio || '',
          profilePictureUrl: response.data.profilePictureUrl || '',
          emailNotifications: response.data.emailNotifications ?? true
        })

        toast.success('Profil berhasil diperbarui')

        // 🔥 DEBUG: Cek localStorage setelah update
        setTimeout(() => {
          const updatedUser = JSON.parse(localStorage.getItem('user'))
          console.log('🔍 User in localStorage after update:', updatedUser)
          console.log('🔍 ProfilePictureUrl:', updatedUser?.profilePictureUrl)
        }, 500)
      } else {
        throw new Error(response.message || response.detail || 'Update failed')
      }
    } catch (err) {
      console.error('❌ Update profile error:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Gagal memperbarui profil'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  // ✅ FIXED: Handle password change
  const handleChangePassword = async () => {
    if (!user?.id) {
      toast.error('User ID tidak ditemukan')
      return
    }

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Semua field password harus diisi')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password baru minimal 8 karakter')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Konfirmasi password tidak cocok')
      return
    }

    try {
      setSaving(true)
      setError(null)

      console.log('🔵 Changing password for user ID:', user.id)

      const response = await userService.changePassword(user.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      console.log('✅ Change password response:', response)

      if (response.result === 'success' || response.result === 'Success' || response.statusCode === 200 || response.code === 200) {
        toast.success('Password berhasil diubah')
        // Reset password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        throw new Error(response.message || response.detail || 'Change password failed')
      }
    } catch (err) {
      console.error('❌ Change password error:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Gagal mengubah password'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  // ✅ FIXED: Handle profile picture upload
  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate user ID
    if (!user?.id) {
      toast.error('User ID tidak ditemukan')
      console.error('❌ User ID not found:', user)
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar')
      return
    }

    try {
      setSaving(true)
      console.log('🔵 Uploading profile picture:', file.name)
      console.log('🔵 User ID:', user.id)

      const response = await userService.uploadProfilePicture(file, user.id)

      console.log('✅ Upload response:', response)
      console.log('✅ Upload response data:', response.data)

      if (response.result === 'success' || response.result === 'Success' || response.statusCode === 200 || response.code === 200) {
        // 🔥 PENTING: Ambil URL dari response - bisa di response.data.url atau response.data.profilePictureUrl
        const newProfilePictureUrl = response.data?.url || response.data?.profilePictureUrl

        console.log('🔥 New profile picture URL:', newProfilePictureUrl)

        if (!newProfilePictureUrl) {
          console.error('❌ No profile picture URL in response:', response.data)
          throw new Error('URL foto profil tidak ditemukan dalam response')
        }

        // Update local state
        setProfileData({
          ...profileData,
          profilePictureUrl: newProfilePictureUrl
        })

        // 🔥 CRITICAL: Update AuthContext
        updateUser({
          profilePictureUrl: newProfilePictureUrl
        })

        toast.success('Foto profil berhasil diupload')

        // 🔥 DEBUG: Cek localStorage setelah update
        setTimeout(() => {
          const updatedUser = JSON.parse(localStorage.getItem('user'))
          console.log('🔍 User in localStorage after upload:', updatedUser)
          console.log('🔍 ProfilePictureUrl:', updatedUser?.profilePictureUrl)
        }, 500)
      } else {
        throw new Error(response.message || response.detail || 'Upload failed')
      }
    } catch (err) {
      console.error('❌ Upload error:', err)
      toast.error(err.response?.data?.message || err.message || 'Gagal mengupload foto profil')
    } finally {
      setSaving(false)
    }
  }

  // Save reading preferences to localStorage
  const handleSaveReadingPrefs = () => {
    localStorage.setItem('readingPreferences', JSON.stringify(readingPrefs))
    toast.success('Preferensi membaca disimpan')
  }

  // Save notification settings to localStorage
  const handleSaveNotifications = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(notifications))
    toast.success('Pengaturan notifikasi disimpan')
  }

  // Save privacy settings to localStorage
  const handleSavePrivacy = () => {
    localStorage.setItem('privacySettings', JSON.stringify(privacy))
    toast.success('Pengaturan privasi disimpan')
  }

  // ✅ FIXED: Handle delete account
  const handleDeleteAccount = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan!')) {
      return
    }

    const hardDelete = window.confirm('Hapus permanen? (Pilih Cancel untuk hanya menonaktifkan)')

    try {
      setSaving(true)
      console.log('🔵 Deleting account for user ID:', user.id, 'Hard delete:', hardDelete)

      const response = await userService.deleteAccount(user.id, hardDelete)

      console.log('✅ Delete response:', response)

      if (response.result === 'success' || response.result === 'Success' || response.statusCode === 200 || response.code === 200) {
        toast.success('Akun berhasil dihapus')
        // Logout and redirect
        setTimeout(() => {
          logout()
          window.location.href = '/masuk'
        }, 2000)
      } else {
        throw new Error(response.message || response.detail || 'Delete failed')
      }
    } catch (err) {
      console.error('❌ Delete account error:', err)
      toast.error(err.response?.data?.message || err.message || 'Gagal menghapus akun')
    } finally {
      setSaving(false)
    }
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

      {/* Error Alert */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)}>
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
                    <div className="relative">
                      {profileData.profilePictureUrl ? (
                        <img
                          src={profileData.profilePictureUrl}
                          alt="Profile"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-2xl font-bold">
                          {profileData.fullName?.charAt(0) || user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                        </div>
                      )}
                      <label className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer hover:bg-primary-dark transition-colors">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureUpload}
                          className="hidden"
                          disabled={saving}
                        />
                      </label>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>Format: JPG, PNG, GIF</p>
                      <p>Ukuran maksimal: 2MB</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Username</label>
                  <input
                    type="text"
                    value={user?.username || ''}
                    className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Username tidak dapat diubah</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-900"
                    disabled={saving}
                    maxLength={255}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-900"
                    placeholder="Ceritakan sedikit tentang Anda..."
                    disabled={saving}
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {profileData.bio.length}/1000 karakter
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={profileData.emailNotifications}
                      onChange={(e) => setProfileData({...profileData, emailNotifications: e.target.checked})}
                      className="w-5 h-5"
                      disabled={saving}
                    />
                    <span>Aktifkan notifikasi email</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-gray-700">
                  <button
                    onClick={() => {
                      // Reset to original user data
                      setProfileData({
                        fullName: user?.fullName || user?.name || '',
                        bio: user?.bio || '',
                        profilePictureUrl: user?.profilePictureUrl || '',
                        emailNotifications: user?.emailNotifications ?? true
                      })
                    }}
                    className="px-6 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    disabled={saving}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
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

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-gray-700">
                  <button
                    onClick={handleSaveReadingPrefs}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    Simpan Preferensi
                  </button>
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

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-gray-700">
                  <button
                    onClick={handleSaveNotifications}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    Simpan Pengaturan
                  </button>
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

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-gray-700">
                  <button
                    onClick={handleSavePrivacy}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    Simpan Pengaturan
                  </button>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <h2 className="font-bold text-xl mb-4">Pengaturan Akun</h2>

                {/* Account Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Informasi Akun</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">ID:</span> {user?.id}</p>
                    <p><span className="font-medium">Username:</span> {user?.username}</p>
                    <p><span className="font-medium">Email:</span> {user?.email}</p>
                    <p><span className="font-medium">Level:</span> {user?.level || 'BEGINNER'}</p>
                  </div>
                </div>

                {/* Change Password Section */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Ubah Kata Sandi
                  </h3>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Password Saat Ini</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Password Baru</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                      disabled={saving}
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimal 8 karakter</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                      disabled={saving}
                    />
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Mengubah...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Ubah Password
                      </>
                    )}
                  </button>
                </div>

                {/* Download Data */}
                <button
                  onClick={() => toast.info('Fitur download data segera hadir')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5" />
                    <span>Unduh Data Saya</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">→</span>
                </button>

                {/* Delete Account */}
                <div className="border-t dark:border-gray-600 pt-6 mt-6">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={saving}
                    className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Trash2 className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-semibold">Hapus Akun</div>
                        <div className="text-xs">Tindakan ini tidak dapat dibatalkan</div>
                      </div>
                    </div>
                    <span className="text-sm">→</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default SettingsPage