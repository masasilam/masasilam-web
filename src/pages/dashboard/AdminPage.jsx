import { useState, useCallback, useEffect } from 'react'
import {
  Upload, AlertCircle, CheckCircle, Loader, Film, Book,
  Plus, Trash2, ChevronDown, ChevronUp, Eye,
  EyeOff, Save, X, Search, Edit2, User, Building2, MapPin, Video,
  Image as ImageIcon, Hash, Info, Play
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inputCls = `
  w-full px-3 py-2.5 rounded-xl text-sm transition-all focus:outline-none
  border bg-white text-slate-800 placeholder-slate-400
  border-slate-200 focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400
  dark:bg-slate-800/60 dark:text-slate-200 dark:placeholder-slate-500
  dark:border-slate-600/80 dark:focus:ring-blue-500/30 dark:focus:border-blue-500/60
  disabled:opacity-50
`
const labelCls = `block text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-500 dark:text-slate-400`

// Pill input — array of strings
const PillInput = ({ value = [], onChange, placeholder, disabled }) => {
  const [input, setInput] = useState('')
  const add = () => {
    const v = input.trim()
    if (v && !value.includes(v)) { onChange([...value, v]); setInput('') }
  }
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i))
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder}
          disabled={disabled}
          className={inputCls}
        />
        <button type="button" onClick={add} disabled={disabled || !input.trim()}
          className="flex-shrink-0 px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-400
                     disabled:opacity-40 text-white transition-all">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v, i) => (
            <span key={i}
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium
                         bg-blue-50 border border-blue-200 text-blue-700
                         dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-300">
              {v}
              <button type="button" onClick={() => remove(i)} disabled={disabled}
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center
                           hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// Person list editor
const PersonListEditor = ({ value = [], onChange, disabled }) => {
  const add = () => onChange([...value, { name: '', photoUrl: '', description: '' }])
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i))
  const update = (i, field, val) => {
    const next = [...value]
    next[i] = { ...next[i], [field]: val }
    onChange(next)
  }
  return (
    <div className="space-y-2">
      {value.map((p, i) => (
        <div key={i}
          className="p-3 rounded-xl border border-slate-200 dark:border-slate-700
                     bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30
                            flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex-1">
              #{i + 1}
            </span>
            <button type="button" onClick={() => remove(i)} disabled={disabled}
              className="p-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50
                         dark:hover:bg-red-900/20 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <input value={p.name} onChange={e => update(i, 'name', e.target.value)}
            placeholder="Nama *" disabled={disabled} className={inputCls} />
          <input value={p.photoUrl || ''} onChange={e => update(i, 'photoUrl', e.target.value)}
            placeholder="URL Foto (opsional)" disabled={disabled} className={inputCls} />
          <textarea value={p.description || ''} onChange={e => update(i, 'description', e.target.value)}
            placeholder="Deskripsi singkat (opsional)" disabled={disabled} rows={2}
            className={inputCls + ' resize-none'} />
        </div>
      ))}
      <button type="button" onClick={add} disabled={disabled}
        className="w-full py-2 rounded-xl border-2 border-dashed text-xs font-semibold
                   border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-500
                   dark:border-slate-600 dark:text-slate-500 dark:hover:border-blue-500 dark:hover:text-blue-400
                   transition-all">
        <Plus className="w-3.5 h-3.5 inline mr-1" />
        Tambah Orang
      </button>
    </div>
  )
}

// Company list editor
const CompanyListEditor = ({ value = [], onChange, disabled }) => {
  const add = () => onChange([...value, { name: '', logoUrl: '', description: '' }])
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i))
  const update = (i, field, val) => {
    const next = [...value]
    next[i] = { ...next[i], [field]: val }
    onChange(next)
  }
  return (
    <div className="space-y-2">
      {value.map((c, i) => (
        <div key={i}
          className="p-3 rounded-xl border border-slate-200 dark:border-slate-700
                     bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/30
                            flex items-center justify-center flex-shrink-0">
              <Building2 className="w-3.5 h-3.5 text-violet-500" />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex-1">#{i + 1}</span>
            <button type="button" onClick={() => remove(i)} disabled={disabled}
              className="p-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50
                         dark:hover:bg-red-900/20 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <input value={c.name} onChange={e => update(i, 'name', e.target.value)}
            placeholder="Nama Perusahaan *" disabled={disabled} className={inputCls} />
          <input value={c.logoUrl || ''} onChange={e => update(i, 'logoUrl', e.target.value)}
            placeholder="URL Logo (opsional)" disabled={disabled} className={inputCls} />
          <textarea value={c.description || ''} onChange={e => update(i, 'description', e.target.value)}
            placeholder="Deskripsi singkat (opsional)" disabled={disabled} rows={2}
            className={inputCls + ' resize-none'} />
        </div>
      ))}
      <button type="button" onClick={add} disabled={disabled}
        className="w-full py-2 rounded-xl border-2 border-dashed text-xs font-semibold
                   border-slate-300 text-slate-400 hover:border-violet-400 hover:text-violet-500
                   dark:border-slate-600 dark:text-slate-500 dark:hover:border-violet-500 dark:hover:text-violet-400
                   transition-all">
        <Plus className="w-3.5 h-3.5 inline mr-1" />
        Tambah Perusahaan
      </button>
    </div>
  )
}

// Video sources editor
const VideoSourcesEditor = ({ value = [], onChange, disabled }) => {
  const add = () => onChange([...value, { url: '', isTrailer: false, priority: 0 }])
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i))
  const update = (i, field, val) => {
    const next = [...value]
    next[i] = { ...next[i], [field]: val }
    onChange(next)
  }
  return (
    <div className="space-y-2">
      {value.map((v, i) => (
        <div key={i}
          className="p-3 rounded-xl border border-slate-200 dark:border-slate-700
                     bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                            ${v.isTrailer
                              ? 'bg-blue-100 dark:bg-blue-900/30'
                              : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
              {v.isTrailer
                ? <Video className="w-3.5 h-3.5 text-blue-500" />
                : <Play className="w-3.5 h-3.5 text-emerald-500" />}
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex-1">
              {v.isTrailer ? 'Trailer' : 'Film Lengkap'} #{i + 1}
            </span>
            <button type="button" onClick={() => remove(i)} disabled={disabled}
              className="p-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50
                         dark:hover:bg-red-900/20 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <input value={v.url} onChange={e => update(i, 'url', e.target.value)}
            placeholder="URL Video (YouTube, Archive.org, dll) *" disabled={disabled}
            className={inputCls} />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => !disabled && update(i, 'isTrailer', !v.isTrailer)}
                className={`relative w-9 h-5 rounded-full transition-all cursor-pointer
                            ${v.isTrailer ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm
                                  transition-transform duration-200
                                  ${v.isTrailer ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400">Ini trailer</span>
            </label>
            <label className="flex items-center gap-2 flex-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Prioritas:</span>
              <input type="number" value={v.priority || 0}
                onChange={e => update(i, 'priority', parseInt(e.target.value) || 0)}
                disabled={disabled} min={0} max={99}
                className={inputCls + ' !py-1.5'} />
            </label>
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <button type="button" onClick={() => {
          onChange([...value, { url: '', isTrailer: false, priority: value.filter(v => !v.isTrailer).length }])
        }} disabled={disabled}
          className="flex-1 py-2 rounded-xl border-2 border-dashed text-xs font-semibold
                     border-slate-300 text-emerald-500 hover:border-emerald-400
                     dark:border-slate-600 dark:hover:border-emerald-500
                     transition-all flex items-center justify-center gap-1">
          <Play className="w-3 h-3" />Film Penuh
        </button>
        <button type="button" onClick={() => {
          onChange([...value, { url: '', isTrailer: true, priority: 0 }])
        }} disabled={disabled}
          className="flex-1 py-2 rounded-xl border-2 border-dashed text-xs font-semibold
                     border-slate-300 text-blue-500 hover:border-blue-400
                     dark:border-slate-600 dark:hover:border-blue-500
                     transition-all flex items-center justify-center gap-1">
          <Video className="w-3 h-3" />Trailer
        </button>
      </div>
    </div>
  )
}

// Section accordion
const FormSection = ({ icon: Icon, title, iconColor = 'text-blue-500', children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left
                   bg-white dark:bg-slate-900
                   hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                        bg-slate-100 dark:bg-slate-800`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
        <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-slate-400" />
          : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 bg-white dark:bg-slate-900
                        border-t border-slate-100 dark:border-slate-800">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Empty film form ───────────────────────────────────────────────────────────
const emptyFilm = () => ({
  judul: '', judulSlug: '', tahunRilis: '', jenis: '', deskripsi: '',
  durasi: '', negaraAsal: '', originalLanguage: '', color: '',
  posterUrl: '', trailerUrl: '', followedBy: '', partOfSeries: '',
  genre: [], aliasIndonesia: [], narrativeLocation: [], filmingLocation: [], imageUrls: [],
  sutradara: [], penulisSkenario: [], pemeran: [], produser: [],
  filmEditor: [], cinematographer: [], composer: [], narator: [],
  perusahaanProduksi: [], distributor: [],
  videoSources: [],
})

// ─── Status banner ─────────────────────────────────────────────────────────────
const StatusBanner = ({ status, message, onDismiss }) => {
  if (!status) return null
  const isSuccess = status === 'success'
  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl border mb-4
                    ${isSuccess
                      ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700'
                      : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'}`}>
      {isSuccess
        ? <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        : <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${isSuccess ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'}`}>
          {isSuccess ? 'Berhasil!' : 'Gagal!'}
        </p>
        <p className={`text-sm mt-0.5 ${isSuccess ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
          {message}
        </p>
      </div>
      <button onClick={onDismiss}
        className={`p-1 rounded-lg transition-colors flex-shrink-0
                    ${isSuccess ? 'text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-800/40'
                                : 'text-red-500 hover:bg-red-100 dark:hover:bg-red-800/40'}`}>
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── FILM FORM ─────────────────────────────────────────────────────────────────
const FilmForm = ({ mode = 'add', initialSlug = '', onSuccess, onCancel }) => {
  const [form, setForm]       = useState(emptyFilm())
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [status, setStatus]   = useState(null)   // 'success' | 'error'
  const [message, setMessage] = useState('')
  const [slugInput, setSlugInput] = useState(initialSlug)
  const [posterPreview, setPosterPreview] = useState(false)

  const isEdit = mode === 'edit'

  // Load film data for edit
  const loadFilm = useCallback(async (slug) => {
    if (!slug.trim()) return
    setFetching(true); setStatus(null)
    try {
      const res = await api.get(`/films/${slug.trim()}`)
      const d = res.data
      // Map FilmDetail → form fields
      setForm({
        judul:             d.judul             || '',
        judulSlug:         d.judulSlug         || '',
        tahunRilis:        d.tahunRilis        || '',
        jenis:             d.jenis             || '',
        deskripsi:         d.deskripsi         || d.sinopsis || d.description || '',
        durasi:            d.durasi            || '',
        negaraAsal:        d.negaraAsal        || '',
        originalLanguage:  d.originalLanguage  || '',
        color:             d.color             || '',
        posterUrl:         d.posterUrl         || '',
        trailerUrl:        d.trailerUrl        || '',
        followedBy:        d.followedBy        || '',
        partOfSeries:      d.partOfSeries      || '',
        genre:             Array.isArray(d.genre) ? d.genre : [],
        aliasIndonesia:    Array.isArray(d.aliasIndonesia) ? d.aliasIndonesia : [],
        narrativeLocation: Array.isArray(d.narrativeLocation) ? d.narrativeLocation : [],
        filmingLocation:   Array.isArray(d.filmingLocation) ? d.filmingLocation : [],
        imageUrls:         Array.isArray(d.imageUrls) ? d.imageUrls : [],
        sutradara:         (d.sutradara         || []).map(p => ({ name: p.name||'', photoUrl: p.photoUrl||'', description: p.description||'' })),
        penulisSkenario:   (d.penulisSkenario   || []).map(p => ({ name: p.name||'', photoUrl: p.photoUrl||'', description: p.description||'' })),
        pemeran:           (d.pemeran           || []).map(p => ({ name: p.name||'', photoUrl: p.photoUrl||'', description: p.description||'' })),
        produser:          (d.produser          || []).map(p => ({ name: p.name||'', photoUrl: p.photoUrl||'', description: p.description||'' })),
        filmEditor:        (d.filmEditor        || []).map(p => ({ name: p.name||'', photoUrl: p.photoUrl||'', description: p.description||'' })),
        cinematographer:   (d.cinematographer   || []).map(p => ({ name: p.name||'', photoUrl: p.photoUrl||'', description: p.description||'' })),
        composer:          (d.composer          || []).map(p => ({ name: p.name||'', photoUrl: p.photoUrl||'', description: p.description||'' })),
        narator:           (d.narator           || []).map(p => ({ name: p.name||'', photoUrl: p.photoUrl||'', description: p.description||'' })),
        perusahaanProduksi:(d.perusahaanProduksi|| []).map(c => ({ name: c.name||'', logoUrl: c.logoUrl||'', description: c.description||'' })),
        distributor:       (d.distributor       || []).map(c => ({ name: c.name||'', logoUrl: c.logoUrl||'', description: c.description||'' })),
        videoSources:      (d.videoSources      || []).map(v => ({ url: v.embedUrl||v.rawUrl||v.directUrl||'', isTrailer: !!v.isTrailer, priority: v.priority||0 })),
      })
      setStatus('success')
      setMessage(`Data "${d.judul}" berhasil dimuat`)
    } catch (e) {
      setStatus('error')
      setMessage(e.response?.data?.detail || e.response?.data?.message || 'Film tidak ditemukan')
    } finally { setFetching(false) }
  }, [])

  useEffect(() => {
    if (isEdit && initialSlug) loadFilm(initialSlug)
  }, [isEdit, initialSlug, loadFilm])

  const set = useCallback((field, value) => setForm(p => ({ ...p, [field]: value })), [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.judul.trim()) {
      setStatus('error'); setMessage('Judul film wajib diisi'); return
    }
    setLoading(true); setStatus(null)
    try {
      // Clean empty persons/companies
      const clean = (arr) => arr.filter(x => x.name?.trim())
      const cleanVideos = (arr) => arr.filter(x => x.url?.trim())
      const payload = {
        ...form,
        sutradara:          clean(form.sutradara),
        penulisSkenario:    clean(form.penulisSkenario),
        pemeran:            clean(form.pemeran),
        produser:           clean(form.produser),
        filmEditor:         clean(form.filmEditor),
        cinematographer:    clean(form.cinematographer),
        composer:           clean(form.composer),
        narator:            clean(form.narator),
        perusahaanProduksi: clean(form.perusahaanProduksi),
        distributor:        clean(form.distributor),
        videoSources:       cleanVideos(form.videoSources),
        // Remove empty strings → null for optional fields
        judulSlug:          form.judulSlug  || undefined,
        tahunRilis:         form.tahunRilis || undefined,
        deskripsi:          form.deskripsi  || undefined,
        durasi:             form.durasi     || undefined,
        negaraAsal:         form.negaraAsal || undefined,
        posterUrl:          form.posterUrl  || undefined,
      }

      let res
      if (isEdit) {
        res = await api.put(`/films/${slugInput.trim()}`, payload)
        setStatus('success')
        setMessage(`Film "${form.judul}" berhasil diperbarui!`)
      } else {
        res = await api.post('/films', payload)
        setStatus('success')
        setMessage(`Film "${form.judul}" berhasil ditambahkan! Slug: ${res.data?.slug}`)
        if (!isEdit) setForm(emptyFilm())
      }
      onSuccess?.()
    } catch (e) {
      setStatus('error')
      setMessage(e.response?.data?.message || e.response?.data?.detail || e.response?.data?.error || 'Terjadi kesalahan')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <StatusBanner status={status} message={message} onDismiss={() => setStatus(null)} />

      {/* Edit: slug lookup */}
      {isEdit && (
        <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/60
                        dark:border-blue-700/50 dark:bg-blue-900/10">
          <label className={labelCls}>Slug Film yang Ingin Diedit</label>
          <div className="flex gap-2">
            <input
              value={slugInput}
              onChange={e => setSlugInput(e.target.value)}
              placeholder="contoh: atas-nama-daun-2022"
              className={inputCls + ' flex-1'}
              disabled={fetching || loading}
            />
            <button type="button" onClick={() => loadFilm(slugInput)}
              disabled={fetching || loading || !slugInput.trim()}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl
                         bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold
                         disabled:opacity-50 transition-all">
              {fetching ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="hidden sm:inline">Muat</span>
            </button>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5">
            Masukkan slug film lalu klik "Muat" untuk mengisi form dengan data yang ada
          </p>
        </div>
      )}

      {/* ── SECTION 1: Info Utama ── */}
      <FormSection icon={Film} title="Informasi Utama" iconColor="text-blue-500" defaultOpen>
        <div className="space-y-3 mt-1">
          <div>
            <label className={labelCls}>Judul Film <span className="text-red-500">*</span></label>
            <input value={form.judul} onChange={e => set('judul', e.target.value)}
              placeholder="Masukkan judul film..." disabled={loading}
              className={inputCls} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Judul Internasional / Slug</label>
              <input value={form.judulSlug} onChange={e => set('judulSlug', e.target.value)}
                placeholder="Judul bahasa Inggris..." disabled={loading}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Tahun Rilis</label>
              <input value={form.tahunRilis} onChange={e => set('tahunRilis', e.target.value)}
                placeholder="2022" disabled={loading}
                className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Jenis Film</label>
              <select value={form.jenis} onChange={e => set('jenis', e.target.value)}
                disabled={loading}
                className={inputCls + ' cursor-pointer'}>
                <option value="">-- Pilih jenis --</option>
                {['Fiksi','Dokumenter','Animasi','Pendek','Serial','Eksperimental'].map(j => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Durasi</label>
              <input value={form.durasi} onChange={e => set('durasi', e.target.value)}
                placeholder="contoh: 74 menit" disabled={loading}
                className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Negara Asal</label>
              <input value={form.negaraAsal} onChange={e => set('negaraAsal', e.target.value)}
                placeholder="Indonesia" disabled={loading}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Bahasa Asli</label>
              <input value={form.originalLanguage} onChange={e => set('originalLanguage', e.target.value)}
                placeholder="Indonesian" disabled={loading}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Warna</label>
              <select value={form.color} onChange={e => set('color', e.target.value)}
                disabled={loading}
                className={inputCls + ' cursor-pointer'}>
                <option value="">-- Pilih --</option>
                <option value="color">Berwarna</option>
                <option value="black and white">Hitam Putih</option>
                <option value="colorized">Diwarnai</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Deskripsi / Sinopsis</label>
            <textarea value={form.deskripsi} onChange={e => set('deskripsi', e.target.value)}
              placeholder="Tuliskan sinopsis atau deskripsi film..." disabled={loading}
              rows={4} className={inputCls + ' resize-y'} />
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 2: Visual ── */}
      <FormSection icon={ImageIcon} title="Visual & Media" iconColor="text-rose-500">
        <div className="space-y-3 mt-1">
          <div>
            <label className={labelCls}>URL Poster / Cover Landscape</label>
            <div className="flex gap-2">
              <input value={form.posterUrl} onChange={e => set('posterUrl', e.target.value)}
                placeholder="https://..." disabled={loading}
                className={inputCls + ' flex-1'} />
              {form.posterUrl && (
                <button type="button" onClick={() => setPosterPreview(v => !v)}
                  className="flex-shrink-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600
                             text-slate-500 hover:text-blue-500 transition-all">
                  {posterPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>
            {posterPreview && form.posterUrl && (
              <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700
                              bg-slate-100 dark:bg-slate-800 aspect-video relative">
                <img src={form.posterUrl} alt="Preview poster"
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display='none' }} />
              </div>
            )}
          </div>
          <div>
            <label className={labelCls}>URL Trailer (direct, opsional)</label>
            <input value={form.trailerUrl} onChange={e => set('trailerUrl', e.target.value)}
              placeholder="https://youtube.com/..." disabled={loading}
              className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>URL Gambar Tambahan</label>
            <PillInput value={form.imageUrls} onChange={v => set('imageUrls', v)}
              placeholder="URL gambar lalu tekan Enter..." disabled={loading} />
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 3: Video Sources ── */}
      <FormSection icon={Video} title="Sumber Video" iconColor="text-emerald-500">
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-3">
          Tambahkan URL YouTube, Archive.org, atau sumber lain. Sistem akan otomatis mendeteksi provider.
        </p>
        <VideoSourcesEditor value={form.videoSources}
          onChange={v => set('videoSources', v)} disabled={loading} />
      </FormSection>

      {/* ── SECTION 4: Genre & Alias ── */}
      <FormSection icon={Hash} title="Genre & Alias" iconColor="text-amber-500">
        <div className="space-y-4 mt-1">
          <div>
            <label className={labelCls}>Genre</label>
            <PillInput value={form.genre} onChange={v => set('genre', v)}
              placeholder="Ketik genre lalu Enter (misal: Drama)..." disabled={loading} />
          </div>
          <div>
            <label className={labelCls}>Alias / Judul Alternatif (Indonesia)</label>
            <PillInput value={form.aliasIndonesia} onChange={v => set('aliasIndonesia', v)}
              placeholder="Judul alternatif lalu Enter..." disabled={loading} />
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 5: Sutradara & Kru Utama ── */}
      <FormSection icon={User} title="Sutradara & Kru Utama" iconColor="text-blue-500">
        <div className="space-y-5 mt-1">
          <div>
            <label className={labelCls + ' mb-2'}>Sutradara</label>
            <PersonListEditor value={form.sutradara} onChange={v => set('sutradara', v)} disabled={loading} />
          </div>
          <div>
            <label className={labelCls + ' mb-2'}>Penulis Skenario</label>
            <PersonListEditor value={form.penulisSkenario} onChange={v => set('penulisSkenario', v)} disabled={loading} />
          </div>
          <div>
            <label className={labelCls + ' mb-2'}>Sinematografer</label>
            <PersonListEditor value={form.cinematographer} onChange={v => set('cinematographer', v)} disabled={loading} />
          </div>
          <div>
            <label className={labelCls + ' mb-2'}>Editor Film</label>
            <PersonListEditor value={form.filmEditor} onChange={v => set('filmEditor', v)} disabled={loading} />
          </div>
          <div>
            <label className={labelCls + ' mb-2'}>Komposer Musik</label>
            <PersonListEditor value={form.composer} onChange={v => set('composer', v)} disabled={loading} />
          </div>
          <div>
            <label className={labelCls + ' mb-2'}>Narator</label>
            <PersonListEditor value={form.narator} onChange={v => set('narator', v)} disabled={loading} />
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 6: Pemeran ── */}
      <FormSection icon={User} title="Pemeran / Cast" iconColor="text-violet-500">
        <div className="mt-1">
          <PersonListEditor value={form.pemeran} onChange={v => set('pemeran', v)} disabled={loading} />
        </div>
      </FormSection>

      {/* ── SECTION 7: Produser ── */}
      <FormSection icon={User} title="Produser" iconColor="text-orange-500">
        <div className="mt-1">
          <PersonListEditor value={form.produser} onChange={v => set('produser', v)} disabled={loading} />
        </div>
      </FormSection>

      {/* ── SECTION 8: Perusahaan ── */}
      <FormSection icon={Building2} title="Perusahaan Produksi & Distributor" iconColor="text-indigo-500">
        <div className="space-y-5 mt-1">
          <div>
            <label className={labelCls + ' mb-2'}>Perusahaan Produksi</label>
            <CompanyListEditor value={form.perusahaanProduksi}
              onChange={v => set('perusahaanProduksi', v)} disabled={loading} />
          </div>
          <div>
            <label className={labelCls + ' mb-2'}>Distributor</label>
            <CompanyListEditor value={form.distributor}
              onChange={v => set('distributor', v)} disabled={loading} />
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 9: Lokasi ── */}
      <FormSection icon={MapPin} title="Lokasi" iconColor="text-rose-500">
        <div className="space-y-4 mt-1">
          <div>
            <label className={labelCls}>Lokasi Cerita (Narrative Location)</label>
            <PillInput value={form.narrativeLocation} onChange={v => set('narrativeLocation', v)}
              placeholder="Contoh: Jakarta..." disabled={loading} />
          </div>
          <div>
            <label className={labelCls}>Lokasi Syuting (Filming Location)</label>
            <PillInput value={form.filmingLocation} onChange={v => set('filmingLocation', v)}
              placeholder="Contoh: Bandung..." disabled={loading} />
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 10: Seri ── */}
      <FormSection icon={Hash} title="Informasi Seri" iconColor="text-slate-500">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          <div>
            <label className={labelCls}>Bagian dari Seri</label>
            <input value={form.partOfSeries} onChange={e => set('partOfSeries', e.target.value)}
              placeholder="Nama seri..." disabled={loading}
              className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Dilanjutkan oleh</label>
            <input value={form.followedBy} onChange={e => set('followedBy', e.target.value)}
              placeholder="Film sekuel..." disabled={loading}
              className={inputCls} />
          </div>
        </div>
      </FormSection>

      {/* ── Submit ── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2
                     px-6 py-3 rounded-2xl text-sm font-bold transition-all
                     bg-blue-500 hover:bg-blue-400 active:scale-[0.98] text-white
                     shadow-lg shadow-blue-200/80 dark:shadow-blue-900/40
                     disabled:opacity-50 disabled:cursor-not-allowed">
          {loading
            ? <><Loader className="w-4 h-4 animate-spin" />{isEdit ? 'Menyimpan...' : 'Menambahkan...'}</>
            : <><Save className="w-4 h-4" />{isEdit ? 'Simpan Perubahan' : 'Tambahkan Film'}</>}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl
                       text-sm font-semibold border border-slate-200 dark:border-slate-700
                       text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800
                       transition-all">
            <X className="w-4 h-4" />Batal
          </button>
        )}
        {!isEdit && (
          <button type="button" onClick={() => { setForm(emptyFilm()); setStatus(null) }}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl
                       text-sm font-semibold border border-slate-200 dark:border-slate-700
                       text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800
                       transition-all">
            <Trash2 className="w-4 h-4" />Reset Form
          </button>
        )}
      </div>
    </form>
  )
}

// ─── BOOKS TAB ─────────────────────────────────────────────────────────────────
const BooksTab = () => {
  const [uploading, setUploading]       = useState(false)
  const [status, setStatus]             = useState(null)
  const [message, setMessage]           = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.epub')) {
      setStatus('error'); setMessage('Hanya file EPUB yang didukung'); setSelectedFile(null); return
    }
    if (file.size > 50 * 1024 * 1024) {
      setStatus('error'); setMessage('Ukuran file maksimal 50MB'); setSelectedFile(null); return
    }
    setSelectedFile(file); setStatus(null); setMessage('')
  }, [])

  const handleUpload = useCallback(async () => {
    if (!selectedFile) { setStatus('error'); setMessage('Pilih file EPUB terlebih dahulu'); return }
    setUploading(true); setStatus(null)
    try {
      const fd = new FormData()
      fd.append('bookFile', selectedFile)
      const res = await api.post('/books', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setStatus('success')
      setMessage(`Buku "${res.data?.data?.title || 'berhasil'}" telah ditambahkan!`)
      setSelectedFile(null)
      const fi = document.getElementById('book-file')
      if (fi) fi.value = ''
    } catch (e) {
      setStatus('error')
      setMessage(e.response?.data?.detail || 'Gagal mengupload buku. Pastikan metadata EPUB lengkap.')
    } finally { setUploading(false) }
  }, [selectedFile])

  return (
    <div className="space-y-5">
      <StatusBanner status={status} message={message} onDismiss={() => setStatus(null)} />

      {/* Upload area */}
      <div className={`relative rounded-2xl border-2 border-dashed transition-all text-center p-8
                       ${selectedFile
                         ? 'border-emerald-400 bg-emerald-50/60 dark:border-emerald-600 dark:bg-emerald-900/10'
                         : 'border-slate-300 dark:border-slate-600 hover:border-amber-400 dark:hover:border-amber-500'}`}>
        <input id="book-file" type="file" accept=".epub" onChange={handleFileChange}
          disabled={uploading}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
        <div className="pointer-events-none">
          <div className={`w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center
                          ${selectedFile ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
            {selectedFile
              ? <CheckCircle className="w-7 h-7 text-emerald-500" />
              : <Upload className="w-7 h-7 text-slate-400" />}
          </div>
          {selectedFile ? (
            <div>
              <p className="font-semibold text-sm text-emerald-700 dark:text-emerald-300 mb-0.5">
                {selectedFile.name}
              </p>
              <p className="text-xs text-emerald-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB — Siap diupload
              </p>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-sm text-slate-600 dark:text-slate-300 mb-0.5">
                Klik atau seret file EPUB ke sini
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Format: .epub · Maks: 50MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/60
                      dark:border-amber-700/50 dark:bg-amber-900/10">
        <div className="flex gap-3">
          <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <p className="font-semibold mb-1">Persyaratan EPUB</p>
            <ul className="space-y-0.5 text-xs text-amber-700 dark:text-amber-400 list-disc list-inside">
              <li>Metadata lengkap: Title, Author, Publisher, Publication Year</li>
              <li>Format .epub, ukuran maks 50MB</li>
              <li>Sistem otomatis ekstrak metadata, cover, dan chapter</li>
            </ul>
          </div>
        </div>
      </div>

      <button onClick={handleUpload} disabled={!selectedFile || uploading}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl
                   text-sm font-bold bg-amber-500 hover:bg-amber-400 text-white
                   shadow-lg shadow-amber-200/80 dark:shadow-amber-900/40
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
        {uploading
          ? <><Loader className="w-4 h-4 animate-spin" />Mengupload...</>
          : <><Upload className="w-4 h-4" />Upload Buku</>}
      </button>
    </div>
  )
}

// ─── FILMS TAB ─────────────────────────────────────────────────────────────────
const FilmsTab = () => {
  const [subMode, setSubMode] = useState('add')

  const subTabs = [
    { id: 'add',  label: 'Tambah Film', icon: Plus,  color: 'text-emerald-500' },
    { id: 'edit', label: 'Edit Film',   icon: Edit2, color: 'text-amber-500'   },
  ]

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60">
        {subTabs.map(({ id, label, icon: Icon, color }) => (
          <button key={id} onClick={() => setSubMode(id)}
            className={`flex-1 flex items-center justify-center gap-1.5
                        px-3 py-2.5 rounded-xl text-sm font-semibold
                        transition-all duration-200
                        ${subMode === id
                          ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-800 dark:text-slate-200'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
            <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${subMode === id ? color : ''}`} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Add Manual ── */}
      {subMode === 'add' && (
        <div>
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Isi form di bawah untuk menambahkan film secara manual
            </p>
          </div>
          <FilmForm mode="add" onSuccess={() => {}} />
        </div>
      )}

      {/* ── Edit ── */}
      {subMode === 'edit' && (
        <div>
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Masukkan slug film, muat datanya, lalu edit dan simpan
            </p>
          </div>
          <FilmForm mode="edit" onSuccess={() => {}} />
        </div>
      )}
    </div>
  )
}

// ─── MAIN AdminPage ────────────────────────────────────────────────────────────
const AdminPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('books')
  const isAdmin = user?.roles?.includes('ADMIN')

  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto mt-8">
        <div className="flex flex-col items-center text-center p-10 rounded-3xl border
                        bg-white border-amber-200 dark:bg-slate-900 dark:border-slate-700">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20
                          flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Akses Terbatas
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Halaman ini hanya dapat diakses oleh Administrator
          </p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'books', label: 'Buku',  icon: Book,  accent: 'text-amber-500',  activeClass: 'bg-amber-500' },
    { id: 'films', label: 'Film',  icon: Film,  accent: 'text-blue-500',   activeClass: 'bg-blue-500'  },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 mb-1">
          Kelola Perpustakaan
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Tambah atau edit buku dan film dalam koleksi
        </p>
      </div>

      {/* Main tabs */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-700
                      bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        {/* Tab bar */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {tabs.map(({ id, label, icon: Icon, activeClass }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4
                          text-sm font-semibold transition-all duration-200
                          ${activeTab === id
                            ? `${activeClass} text-white`
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'books' && <BooksTab />}
          {activeTab === 'films' && <FilmsTab />}
        </div>
      </div>
    </div>
  )
}

export default AdminPage