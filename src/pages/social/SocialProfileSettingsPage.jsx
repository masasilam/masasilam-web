// src/pages/social/SocialProfileSettingsPage.jsx
// Embedded inside /dasbor/pengaturan or accessible at /sosial/pengaturan-profil
import { useState, useEffect } from 'react'
import { profileService } from '../../services/socialService'
import { useAuth } from '../../hooks/useAuth'
import { Loader2, Save, User2, Globe, Lock, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const VISIBILITY_OPTS = [
  { value: 'public',    label: 'Publik',    icon: Globe, desc: 'Semua orang bisa melihat' },
  { value: 'followers', label: 'Pengikut',  icon: Users, desc: 'Hanya pengikutmu' },
  { value: 'private',   label: 'Pribadi',   icon: Lock,  desc: 'Hanya kamu sendiri' },
]

const THEMES = ['default', 'dark', 'warm', 'cool', 'forest', 'ocean']

const SocialProfileSettingsPage = () => {
  const { user } = useAuth()
  const [form, setForm] = useState({
    displayName:          '',
    tagline:              '',
    location:             '',
    websiteUrl:           '',
    readingVisibility:    'public',
    annotationVisibility: 'public',
    profileTheme:         'default',
    socialLinks: { twitter: '', instagram: '', goodreads: '' },
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const fSocial = (k, v) => setForm(p => ({ ...p, socialLinks: { ...p.socialLinks, [k]: v } }))

  useEffect(() => {
    const load = async () => {
      if (!user?.username) return
      try {
        const res = await profileService.getByUsername(user.username)
        const p = res.data?.data
        if (!p) return
        const links = (() => {
          try { return typeof p.socialLinks === 'string' ? JSON.parse(p.socialLinks) : (p.socialLinks || {}) }
          catch { return {} }
        })()
        setForm({
          displayName:          p.displayName || '',
          tagline:              p.tagline || '',
          location:             p.location || '',
          websiteUrl:           p.websiteUrl || '',
          readingVisibility:    p.readingVisibility || 'public',
          annotationVisibility: p.annotationVisibility || 'public',
          profileTheme:         p.profileTheme || 'default',
          socialLinks: {
            twitter:   links.twitter   || '',
            instagram: links.instagram || '',
            goodreads: links.goodreads || '',
          },
        })
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [user?.username])

  const handleSave = async () => {
    setSaving(true)
    try {
      await profileService.updateMine(form)
      toast.success('Profil sosial berhasil diperbarui!')
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Gagal menyimpan')
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
  )

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
          <User2 className="w-5 h-5 text-amber-500" /> Pengaturan Profil Sosial
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Kelola tampilan profilmu di komunitas</p>
      </div>

      {/* Basic info */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Informasi Dasar</h3>
        {[
          { key: 'displayName', label: 'Nama Tampilan', placeholder: 'Nama yang terlihat publik' },
          { key: 'tagline',     label: 'Tagline',        placeholder: 'Deskripsi singkat tentangmu' },
          { key: 'location',    label: 'Lokasi',         placeholder: 'Kota, Negara' },
          { key: 'websiteUrl',  label: 'Website',        placeholder: 'https://namawebsite.com' },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
            <input
              value={form[key]}
              onChange={e => f(key, e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>
        ))}
      </div>

      {/* Social links */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Tautan Sosial</h3>
        {[
          { key: 'twitter',   label: 'Twitter / X',  placeholder: 'username (tanpa @)' },
          { key: 'instagram', label: 'Instagram',    placeholder: 'username (tanpa @)' },
          { key: 'goodreads', label: 'Goodreads',    placeholder: 'username' },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
            <input
              value={form.socialLinks[key]}
              onChange={e => fSocial(key, e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>
        ))}
      </div>

      {/* Visibility */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Privasi</h3>
        {[
          { key: 'readingVisibility',    label: 'Visibilitas Aktivitas Baca' },
          { key: 'annotationVisibility', label: 'Visibilitas Kutipan' },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">{label}</label>
            <div className="grid grid-cols-3 gap-2">
              {VISIBILITY_OPTS.map(({ value, label: optLabel, icon: Icon, desc }) => (
                <button
                  key={value}
                  onClick={() => f(key, value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    form[key] === value
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1.5 ${form[key] === value ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}`} />
                  <p className={`text-xs font-semibold ${form[key] === value ? 'text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300'}`}>{optLabel}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Theme */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">Tema Profil</h3>
        <div className="flex flex-wrap gap-2">
          {THEMES.map(t => (
            <button
              key={t}
              onClick={() => f('profileTheme', t)}
              className={`px-4 py-2 text-sm rounded-xl border capitalize transition-all ${
                form.profileTheme === t
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 font-semibold'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-2xl transition-all disabled:opacity-50 hover:scale-[1.01]"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </div>
  )
}

export default SocialProfileSettingsPage