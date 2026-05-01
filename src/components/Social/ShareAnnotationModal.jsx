// src/components/Social/ShareAnnotationModal.jsx
// Modal untuk mempublikasikan kutipan/highlight dari EPUB reader ke sosial
// Dipanggil saat user highlight teks lalu klik "Bagikan Kutipan"

import { useState } from 'react'
import { X, Quote, Loader2, Globe, Users, Lock } from 'lucide-react'
import { annotationService } from '../../services/socialService'

const HIGHLIGHT_COLORS = [
  { name: 'Kuning', value: '#FDE68A' },
  { name: 'Hijau',  value: '#A7F3D0' },
  { name: 'Biru',   value: '#BFDBFE' },
  { name: 'Pink',   value: '#FBCFE8' },
  { name: 'Ungu',   value: '#DDD6FE' },
]

const VISIBILITY_OPTS = [
  { value: 'public',    label: 'Publik',   icon: Globe,  desc: 'Semua orang' },
  { value: 'followers', label: 'Pengikut', icon: Users,  desc: 'Pengikutmu' },
  { value: 'private',   label: 'Pribadi',  icon: Lock,   desc: 'Hanya kamu' },
]

const ShareAnnotationModal = ({
  selectedText,
  entityType,
  entityId,
  entityTitle = '',
  entitySlug  = '',
  chapterLabel = '',
  existingColor = '#FDE68A',
  onClose,
  onPublished,
}) => {
  const [color,      setColor]      = useState(existingColor || '#FDE68A')
  const [note,       setNote]       = useState('')
  const [visibility, setVisibility] = useState('public')
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState(null)

  const handlePublish = async () => {
    if (!selectedText?.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await annotationService.publish({
        entityType,
        entityId:     Number(entityId),
        entityTitle,
        entitySlug,
        selectedText: selectedText.trim(),
        note:         note.trim(),
        color,
        chapterLabel,
        visibility,
      })
      onPublished?.(res.data?.data)
      onClose()
    } catch (e) {
      setError(e?.response?.data?.detail || 'Gagal mempublikasikan kutipan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl
                      border border-stone-200 dark:border-slate-700">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 dark:border-slate-800">
          <h2 className="font-bold text-stone-900 dark:text-slate-50 flex items-center gap-2">
            <Quote className="w-4 h-4 text-rose-500" />
            Bagikan Kutipan
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-lg transition-colors
                       text-stone-400 dark:text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* Quote preview */}
          <div className="relative pl-4 py-2 rounded-lg"
            style={{ backgroundColor: `${color}30`, borderLeft: `3px solid ${color}` }}>
            <p className="text-sm text-stone-800 dark:text-slate-200 italic leading-relaxed line-clamp-4">
              "{selectedText}"
            </p>
            {entityTitle && (
              <p className="text-[10px] text-stone-500 dark:text-slate-400 mt-1.5 not-italic">
                — {entityTitle}{chapterLabel ? ` · ${chapterLabel}` : ''}
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-slate-400 mb-1.5">
              Refleksi / Catatan (opsional)
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="Apa yang membuatmu tertarik dengan kutipan ini?"
              className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none resize-none
                         bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400
                         focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400
                         dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-slate-400 mb-2">
              Warna Sorotan
            </label>
            <div className="flex gap-2">
              {HIGHLIGHT_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  title={c.name}
                  className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110
                              ${color === c.value
                                ? 'border-stone-600 dark:border-white scale-110'
                                : 'border-transparent'
                              }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-slate-400 mb-2">
              Siapa yang bisa melihat?
            </label>
            <div className="flex gap-2">
              {VISIBILITY_OPTS.map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  onClick={() => setVisibility(value)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs transition-all
                              ${visibility === value
                                ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                                : 'border-stone-200 dark:border-slate-700 text-stone-500 dark:text-slate-400 hover:border-stone-300 dark:hover:border-slate-600'
                              }`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="font-semibold">{label}</span>
                  <span className="text-[9px] opacity-70">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20
                          px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-stone-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm border border-stone-200 dark:border-slate-700 rounded-xl
                       hover:bg-stone-50 dark:hover:bg-slate-800 transition-all
                       text-stone-600 dark:text-slate-400">
            Batal
          </button>
          <button
            onClick={handlePublish}
            disabled={saving || !selectedText?.trim()}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all
                       disabled:opacity-50 flex items-center justify-center gap-2
                       bg-rose-500 hover:bg-rose-400 text-white">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Publikasikan
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShareAnnotationModal