// src/pages/dashboard/BlogEditorPage.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Save, Eye, EyeOff, ArrowLeft, ImagePlus, Tag, Folder,
  Calendar, Info, Loader2, X, Plus, Globe, FileText, Clock
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import toast from 'react-hot-toast'

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'DRAFT',     label: 'Draft',     desc: 'Belum dipublikasikan',      icon: FileText, cls: 'text-gray-500'  },
  { value: 'PUBLISHED', label: 'Terbitkan', desc: 'Langsung publik',            icon: Globe,    cls: 'text-green-500' },
  { value: 'SCHEDULED', label: 'Jadwalkan', desc: 'Terbit pada waktu tertentu', icon: Calendar, cls: 'text-blue-500'  },
]

const QUILL_CSS = `
  .ql-toolbar.ql-snow { border:1px solid #e5e7eb!important; border-bottom:none!important; border-radius:.5rem .5rem 0 0!important; background:#f9fafb!important; padding:8px 10px!important; flex-wrap:wrap!important; }
  .dark .ql-toolbar.ql-snow { background:#1e293b!important; border-color:#334155!important; }
  .dark .ql-toolbar.ql-snow .ql-stroke { stroke:#94a3b8!important; }
  .dark .ql-toolbar.ql-snow .ql-fill   { fill:#94a3b8!important; }
  .dark .ql-toolbar.ql-snow .ql-picker-label { color:#94a3b8!important; }
  .dark .ql-toolbar.ql-snow .ql-picker-label .ql-stroke { stroke:#94a3b8!important; }
  .dark .ql-toolbar.ql-snow .ql-picker-options { background:#1e293b!important; border-color:#334155!important; color:#e2e8f0!important; }
  .ql-toolbar.ql-snow button:hover .ql-stroke,
  .ql-toolbar.ql-snow .ql-active  .ql-stroke { stroke:var(--color-primary,#10b981)!important; }
  .ql-toolbar.ql-snow button:hover .ql-fill,
  .ql-toolbar.ql-snow .ql-active  .ql-fill   { fill:var(--color-primary,#10b981)!important; }
  .dark .ql-toolbar.ql-snow button:hover .ql-stroke,
  .dark .ql-toolbar.ql-snow .ql-active  .ql-stroke { stroke:var(--color-primary,#10b981)!important; }
  .dark .ql-toolbar.ql-snow button:hover .ql-fill,
  .dark .ql-toolbar.ql-snow .ql-active  .ql-fill   { fill:var(--color-primary,#10b981)!important; }
  .ql-container.ql-snow { border:1px solid #e5e7eb!important; border-radius:0 0 .5rem .5rem!important; font-family:inherit!important; }
  .dark .ql-container.ql-snow { border-color:#334155!important; background:#0f172a!important; color:#e2e8f0!important; }
  .ql-editor { min-height:500px!important; line-height:1.9!important; padding:1.5rem 1.75rem!important; }
  .ql-editor.ql-blank::before { font-style:normal!important; color:#9ca3af!important; }
  .dark .ql-editor.ql-blank::before { color:#64748b!important; }
  .ql-editor h1 { font-size:2em; font-weight:800; margin:1.25rem 0 .5rem; }
  .ql-editor h2 { font-size:1.6em; font-weight:700; margin:1.1rem 0 .4rem; }
  .ql-editor h3 { font-size:1.3em; font-weight:600; margin:.9rem 0 .3rem; }
  .ql-editor p  { margin-bottom:.75em; }
  .ql-editor a  { color:var(--color-primary,#10b981); text-decoration:underline; }
  .ql-editor img { max-width:100%; border-radius:.5rem; margin:.75rem auto; display:block; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,.15); }
  .ql-editor img:hover { opacity:.9; outline:2px solid var(--color-primary,#10b981); }
  .ql-editor blockquote { border-left:4px solid var(--color-primary,#10b981)!important; padding:.75rem 1.25rem!important; margin:1rem 0!important; background:rgba(16,185,129,.06)!important; border-radius:0 .375rem .375rem 0!important; font-style:italic!important; }
  .ql-editor pre.ql-syntax { background:#1e293b!important; color:#e2e8f0!important; padding:1rem 1.25rem!important; border-radius:.5rem!important; overflow-x:auto!important; font-size:.875em!important; }
  .ql-editor ol, .ql-editor ul { padding-left:1.5em; margin-bottom:.75em; }
  .ql-tooltip { z-index:9999!important; background:white; box-shadow:0 4px 12px rgba(0,0,0,.15); border-radius:6px; border:1px solid #e5e7eb; }
  .dark .ql-tooltip { background:#1e293b; border-color:#334155; color:#e2e8f0; }
  .dark .ql-tooltip input { background:#0f172a; color:#e2e8f0; border-color:#334155; }
  .ql-picker-options { z-index:9999!important; }
`

// ─── Quill Loader (singleton) ─────────────────────────────────────────────────

let quillLoadPromise = null
const loadQuill = () => {
  if (quillLoadPromise) return quillLoadPromise
  quillLoadPromise = new Promise((resolve) => {
    if (window.Quill) { resolve(window.Quill); return }
    if (!document.getElementById('quill-css')) {
      const link = document.createElement('link')
      link.id = 'quill-css'; link.rel = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.snow.min.css'
      document.head.appendChild(link)
    }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.min.js'
    script.onload = () => resolve(window.Quill)
    script.onerror = () => { quillLoadPromise = null; resolve(null) }
    document.head.appendChild(script)
  })
  return quillLoadPromise
}

// ─── Rich Text Editor ─────────────────────────────────────────────────────────

const RichEditor = ({ value, onChange, onImageInsert }) => {
  const containerRef = useRef(null)
  const quillRef     = useRef(null)
  const imgInputRef  = useRef(null)
  const suppressRef  = useRef(false)
  const lastValue    = useRef('')

  useEffect(() => {
    let alive = true
    loadQuill().then((Quill) => {
      if (!alive || !Quill || !containerRef.current || quillRef.current) return
      quillRef.current = new Quill(containerRef.current, {
        theme: 'snow',
        placeholder: 'Mulai menulis artikel Anda di sini...',
        modules: {
          toolbar: {
            container: [
              [{ header: [1,2,3,4,5,6,false] }],
              [{ font: [] }],
              [{ size: ['small', false, 'large', 'huge'] }],
              ['bold','italic','underline','strike'],
              [{ color: [] },{ background: [] }],
              [{ script: 'sub' },{ script: 'super' }],
              [{ align: [] }],
              [{ list: 'ordered' },{ list: 'bullet' }],
              [{ indent: '-1' },{ indent: '+1' }],
              ['blockquote','code-block'],
              ['link','image','video'],
              ['clean'],
            ],
            handlers: { image: () => imgInputRef.current?.click() },
          },
          history: { delay: 1000, maxStack: 100, userOnly: true },
        },
      })

      if (value) {
        suppressRef.current = true
        quillRef.current.root.innerHTML = value
        suppressRef.current = false
        lastValue.current = value
      }

      quillRef.current.on('text-change', () => {
        if (suppressRef.current) return
        const html = quillRef.current.root.innerHTML
        onChange(html === '<p><br></p>' ? '' : html)
      })
    })
    return () => { alive = false }
  }, []) // eslint-disable-line

  // Sync value hanya saat Quill kosong tapi value ada (setelah load edit)
  useEffect(() => {
    if (!quillRef.current || value === lastValue.current) return
    const isEmpty = !quillRef.current.root.innerHTML || quillRef.current.root.innerHTML === '<p><br></p>'
    if (isEmpty && value) {
      suppressRef.current = true
      quillRef.current.root.innerHTML = value
      suppressRef.current = false
      lastValue.current = value
    }
  }, [value])

  const handleImageFile = useCallback(async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('File harus berupa gambar'); return }
    if (file.size > 10 * 1024 * 1024) { toast.error('Ukuran gambar maksimal 10MB'); return }

    const tid = toast.loading('Mengupload gambar...')
    try {
      const url = await onImageInsert(file)
      if (url && quillRef.current) {
        const range = quillRef.current.getSelection(true)
        const idx   = range ? range.index : quillRef.current.getLength()
        quillRef.current.insertEmbed(idx, 'image', url)
        quillRef.current.setSelection(idx + 1, 0)
        toast.success('Gambar berhasil disisipkan!', { id: tid })
      } else {
        toast.error('Gagal mendapatkan URL gambar', { id: tid })
      }
    } catch (err) {
      toast.error('Gagal mengupload: ' + (err?.message || ''), { id: tid })
    }
  }, [onImageInsert])

  return (
    <>
      <style>{QUILL_CSS}</style>
      <div ref={containerRef} />
      <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const BlogEditorPage = () => {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const isAdmin   = user?.roles?.includes('ADMIN')
  const isEditing = !!id

  const [loading,     setLoading]     = useState(isEditing)
  const [saving,      setSaving]      = useState(false)
  const [preview,     setPreview]     = useState(false)
  const [title,       setTitle]       = useState('')
  const [content,     setContent]     = useState('')
  const [excerpt,     setExcerpt]     = useState('')
  const [status,      setStatus]      = useState('DRAFT')
  const [scheduled,   setScheduled]   = useState('')
  const [tags,        setTags]        = useState([])
  const [tagInput,    setTagInput]    = useState('')
  const [catIds,      setCatIds]      = useState([])
  const [cats,        setCats]        = useState([])
  const [featFile,    setFeatFile]    = useState(null)
  const [featPreview, setFeatPreview] = useState(null)

  const featRef = useRef()

  const wordCount = content
    ? content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length
    : 0

  const slugPreview = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

  useEffect(() => {
    if (!isAdmin) { toast.error('Akses ditolak'); navigate('/dasbor') }
    fetchCategories()
    if (isEditing) fetchPost()
  }, [id]) // eslint-disable-line

  const fetchCategories = async () => {
    try { setCats((await api.get('/blog/categories')).data?.data || []) }
    catch { /* ignore */ }
  }

  const fetchPost = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/blog/admin/${id}`)
      applyPost(res.data?.data)
    } catch {
      try {
        const res   = await api.get('/blog/my-posts', { params: { page: 1, limit: 100 } })
        const found = (res.data?.data?.list || res.data?.data?.data || []).find(p => String(p.id) === String(id))
        if (found) {
          applyPost(found)
          if (!found.content) toast('Konten tidak termuat penuh — coba refresh', { icon: '⚠️' })
        } else {
          toast.error('Artikel tidak ditemukan'); navigate('/dasbor/blog')
        }
      } catch { toast.error('Gagal memuat artikel'); navigate('/dasbor/blog') }
    } finally { setLoading(false) }
  }

  const applyPost = (post) => {
    if (!post) return
    setTitle(post.title || '')
    setExcerpt(post.excerpt || '')
    setStatus(post.status || 'DRAFT')
    if (post.content) setContent(post.content)
    if (post.featuredImage) setFeatPreview(post.featuredImage)
    if (post.tags) {
      setTags(post.tags.includes(':')
        ? post.tags.split('|').map(t => t.split(':')[1]).filter(Boolean)
        : post.tags.split(',').map(t => t.trim()).filter(Boolean))
    }
    if (post.categories) {
      setCatIds(post.categories.split('|').map(c => Number(c.split(':')[0])).filter(Boolean))
    }
  }

  const handleFeatured = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Hanya file gambar'); return }
    setFeatFile(file)
    setFeatPreview(URL.createObjectURL(file))
  }

  const handleImageInsert = useCallback(async (file) => {
    try {
      const form = new FormData()
      form.append('image', file)
      if (id) form.append('postId', id)
      const res = await api.post('/blog/upload-image', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const url = res.data?.data?.url || res.data?.url
      if (!url) throw new Error('URL tidak ada di response')
      return url
    } catch (err) {
      console.error('Gagal upload gambar ke Cloudinary:', err?.response?.data || err?.message)
      throw err
    }
  }, [id])

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (t && !tags.includes(t) && tags.length < 20) setTags(p => [...p, t])
    setTagInput('')
  }

  // ─── ✅ FIX: Navigasi setelah save berdasarkan status ──────────────────────
  // DRAFT / SCHEDULED → /dasbor/blog (bukan /blog/{slug} yang butuh status PUBLISHED)
  // PUBLISHED         → /blog/{slug} (artikel bisa diakses publik)
  // Edit mode         → tetap di halaman edit
  const handleSave = async () => {
    if (!title.trim()) { toast.error('Judul tidak boleh kosong'); return }
    if (!content || !content.replace(/<[^>]*>/g, '').trim()) { toast.error('Konten tidak boleh kosong'); return }
    if (status === 'SCHEDULED' && !scheduled) { toast.error('Pilih waktu terbit'); return }

    if (content.includes('blob:')) {
      if (!window.confirm('⚠️ Konten mengandung gambar sementara (blob) yang bisa hilang.\nLanjutkan?')) return
    }

    setSaving(true)
    const tid = toast.loading(isEditing ? 'Menyimpan...' : 'Membuat artikel...')
    try {
      const payload = {
        title:       title.trim(),
        content,
        excerpt:     excerpt.trim() || undefined,
        status,
        tags,
        categoryIds: catIds,
        bookIds:     [],
        scheduledAt: status === 'SCHEDULED' && scheduled ? scheduled : undefined,
      }
      const form = new FormData()
      form.append('blogPost', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
      if (featFile) form.append('images', featFile)

      const opts = { headers: { 'Content-Type': 'multipart/form-data' } }

      if (isEditing) {
        // Edit mode — simpan lalu tetap di halaman ini
        await api.put(`/blog/${id}`, form, opts)
        toast.success('Artikel berhasil diperbarui!', { id: tid })

      } else {
        // Create mode — navigasi tergantung status
        const res     = await api.post('/blog', form, opts)
        const newSlug = res.data?.data?.slug

        if (status === 'PUBLISHED' && newSlug) {
          // Artikel langsung publik → bawa user ke halaman artikel
          toast.success('Artikel berhasil diterbitkan!', { id: tid })
          navigate(`/blog/${newSlug}`)
        } else {
          // Draft atau Scheduled → kembali ke daftar artikel dashboard
          toast.success(
            status === 'SCHEDULED' ? 'Artikel berhasil dijadwalkan!' : 'Draft berhasil disimpan!',
            { id: tid }
          )
          navigate('/dasbor/blog')
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.detail || 'Gagal menyimpan', { id: tid })
    } finally { setSaving(false) }
  }

  if (!isAdmin) return null
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-gray-500 dark:text-gray-400 text-sm">Memuat artikel...</p>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto pb-16">

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 py-3 -mx-4 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dasbor/blog')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              {isEditing ? 'Edit Artikel' : 'Tulis Artikel Baru'}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {wordCount > 0
                ? <span className="text-primary font-medium">{wordCount.toLocaleString()} kata · ~{Math.max(1, Math.ceil(wordCount / 200))} mnt baca</span>
                : 'Mulai menulis'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPreview(v => !v)}
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              preview ? 'bg-primary/10 border-primary text-primary'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}>
            {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {preview ? 'Editor' : 'Preview'}
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 shadow-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Menyimpan...' : status === 'PUBLISHED' ? 'Terbitkan' : 'Simpan'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── EDITOR AREA ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Title */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Judul artikel yang menarik..."
              className="w-full text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-600 leading-tight" />
            {title && (
              <p className="text-xs text-gray-400 mt-2 font-mono flex items-center gap-1">
                <Globe className="w-3 h-3" />/blog/<span className="text-primary">{slugPreview}</span>
              </p>
            )}
          </div>

          {/* Featured Image */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Gambar Cover</span>
              </div>
              <span className="text-xs text-gray-400">Rekomendasi: 1200×630 px</span>
            </div>
            {featPreview ? (
              <div className="relative group">
                <img src={featPreview} alt="Cover" className="w-full h-60 object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => featRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-100 transition">
                    <ImagePlus className="w-4 h-4" />Ganti
                  </button>
                  <button onClick={() => { setFeatFile(null); setFeatPreview(null) }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition">
                    <X className="w-4 h-4" />Hapus
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => featRef.current?.click()}
                className="w-full h-40 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-primary/10 transition">
                  <ImagePlus className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">Klik untuk upload gambar cover</span>
                <span className="text-xs text-gray-400">JPG, PNG, WebP · Maks 10MB</span>
              </button>
            )}
            <input ref={featRef} type="file" accept="image/*" className="hidden" onChange={handleFeatured} />
          </div>

          {/* Excerpt */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
              Ringkasan <span className="text-gray-400 font-normal">— tampil di kartu & SEO (opsional)</span>
            </label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)}
              placeholder="Jika kosong, otomatis diambil dari awal konten..."
              rows={3} maxLength={300}
              className="w-full text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-3 outline-none resize-none focus:ring-2 focus:ring-primary/50 placeholder-gray-300 dark:placeholder-gray-600 transition" />
            <div className="flex justify-end mt-1">
              <span className={`text-xs font-medium ${excerpt.length > 280 ? 'text-red-500' : 'text-gray-400'}`}>
                {excerpt.length}/300
              </span>
            </div>
          </div>

          {/* Editor / Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Konten Artikel</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:flex items-center gap-1 text-xs px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                  Rich Text Editor
                </span>
                <button onClick={() => setPreview(v => !v)}
                  className={`sm:hidden flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    preview ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                  {preview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {preview ? 'Editor' : 'Preview'}
                </button>
              </div>
            </div>

            {preview ? (
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-5">
                  <Eye className="w-3.5 h-3.5" />Preview
                </div>
                {content
                  ? <div className="prose prose-gray dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
                  : <div className="text-center py-16 text-gray-300 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-40" />
                      <p>Belum ada konten</p>
                    </div>
                }
              </div>
            ) : (
              <div className="p-3">
                <RichEditor value={content} onChange={setContent} onImageInsert={handleImageInsert} />
                <p className="text-xs text-gray-400 mt-2 px-1">
                  💡 Klik 🖼 di toolbar untuk sisipkan gambar · 🎥 video · 🔗 link
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <div className="space-y-4">

          {/* Status & Publish */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />Status Publikasi
            </h3>
            <div className="space-y-2">
              {STATUS_OPTIONS.map(({ value, label, desc, icon: Icon, cls }) => (
                <button key={value} onClick={() => setStatus(value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left ${
                    status === value
                      ? 'bg-primary/10 border-2 border-primary text-primary'
                      : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${status === value ? 'text-primary' : cls}`} />
                  <div>
                    <div className="font-semibold">{label}</div>
                    <div className="text-xs font-normal opacity-70">{desc}</div>
                  </div>
                  {status === value && <div className="ml-auto w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                </button>
              ))}
            </div>

            {status === 'SCHEDULED' && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <label className="block text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />Jadwal Terbit
                </label>
                <input type="datetime-local" value={scheduled} onChange={e => setScheduled(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            )}

            <button onClick={handleSave} disabled={saving}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-60 shadow-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Menyimpan...' : status === 'PUBLISHED' ? '🚀 Terbitkan Artikel' : '💾 Simpan Draft'}
            </button>
          </div>

          {/* Categories */}
          {cats.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Folder className="w-4 h-4 text-primary" />Kategori
              </h3>
              <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                {cats.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1.5 rounded-lg transition group">
                    <input type="checkbox" checked={catIds.includes(cat.id)}
                      onChange={() => setCatIds(p => p.includes(cat.id) ? p.filter(c => c !== cat.id) : [...p, cat.id])}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition">
                      {cat.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />Tags
            </h3>
            <p className="text-xs text-gray-400 mb-3">Membantu SEO & penemuan artikel · Maks 20</p>
            <div className="flex gap-2 mb-3">
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                placeholder="Ketik tag, tekan Enter..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-400 dark:placeholder-gray-500" />
              <button onClick={addTag} disabled={!tagInput.trim() || tags.length >= 20}
                className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-40">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-8">
              {tags.length === 0 && <p className="text-xs text-gray-400 italic">Belum ada tag.</p>}
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-red-50 hover:text-red-500 transition-colors">
                  #{tag}
                  <button onClick={() => setTags(p => p.filter(t => t !== tag))} className="opacity-60 hover:opacity-100 ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border border-primary/20 rounded-xl p-5">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600 dark:text-gray-300">
                <p className="font-semibold text-gray-800 dark:text-white mb-2">Tips Editor</p>
                <div className="space-y-1 text-gray-500 dark:text-gray-400">
                  <p>🖼 <strong>Gambar</strong> — klik ikon gambar di toolbar</p>
                  <p>🎥 <strong>Video</strong> — paste URL YouTube/Vimeo</p>
                  <p>🔗 <strong>Link</strong> — pilih teks lalu klik ikon link</p>
                  <p>⌨️ <strong>Ctrl+Z</strong> undo · <strong>Ctrl+Y</strong> redo</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default BlogEditorPage