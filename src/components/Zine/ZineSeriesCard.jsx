import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Download, Layers, Star, ChevronRight, Award, Clock } from 'lucide-react'

// ── helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (n == null) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}rb`
  return String(n)
}

const fmtTime = (mins) => {
  if (!mins) return null
  return mins >= 60 ? `${Math.round(mins / 60)}j` : `${mins}m`
}

// ── Cover stack ───────────────────────────────────────────────────────────────
// Tampilkan tumpukan cover: paling depan = issue aktif dalam volume aktif
const CoverStack = ({ volumes, activeVolIdx, activeIssueIdx }) => {
  const activeVol   = volumes[activeVolIdx]   || volumes[0]
  const activeIssue = activeVol?.issues?.[activeIssueIdx] || activeVol?.issues?.[0]

  // Kumpulkan beberapa cover berbeda untuk efek tumpukan
  const coversForStack = []
  volumes.forEach((vol) => {
    vol.issues?.forEach((issue) => {
      if (issue.coverImageUrl && !coversForStack.includes(issue.coverImageUrl))
        coversForStack.push(issue.coverImageUrl)
    })
  })

  return (
    <div className="relative w-[82px] h-[112px] flex-shrink-0">
      {/* Layer paling belakang */}
      {coversForStack.length >= 3 && (
        <div className="absolute rounded-lg border border-stone-200 dark:border-slate-700 overflow-hidden"
          style={{ width: 62, height: 90, bottom: 0, left: 2, zIndex: 1 }}>
          <img src={coversForStack[2]} alt="" className="w-full h-full object-cover" style={{ opacity: 0.35 }} />
        </div>
      )}
      {/* Layer tengah */}
      {coversForStack.length >= 2 && (
        <div className="absolute rounded-lg border border-stone-200 dark:border-slate-700 overflow-hidden"
          style={{ width: 68, height: 98, bottom: 0, left: 7, zIndex: 2 }}>
          {coversForStack[1]
            ? <img src={coversForStack[1]} alt="" className="w-full h-full object-cover" style={{ opacity: 0.6 }} />
            : <div className="w-full h-full bg-stone-300 dark:bg-slate-600" style={{ opacity: 0.6 }} />}
        </div>
      )}
      {/* Cover aktif — paling depan */}
      <div className="absolute rounded-lg border border-stone-200 dark:border-slate-700 overflow-hidden shadow-md"
        style={{ width: 74, height: 108, bottom: 0, left: 8, zIndex: 3 }}>
        {activeIssue?.coverImageUrl
          ? <img src={activeIssue.coverImageUrl} alt={activeIssue.issueLabel}
              className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 dark:from-slate-700 dark:to-slate-600 flex items-end p-2">
              <span className="text-[9px] font-semibold text-stone-500 dark:text-slate-400 leading-tight">
                {activeIssue?.issueLabel}
              </span>
            </div>}
      </div>
    </div>
  )
}

// ── ZineSeriesCard ────────────────────────────────────────────────────────────
const ZineSeriesCard = ({ series }) => {
  const [activeVolIdx,   setActiveVolIdx]   = useState(0)
  const [activeIssueIdx, setActiveIssueIdx] = useState(0)

  const { volumes = [] } = series
  if (!volumes.length) return null

  const activeVol   = volumes[activeVolIdx]   || volumes[0]
  const activeIssue = activeVol?.issues?.[activeIssueIdx] || activeVol?.issues?.[0]

  // Hitung total edisi lintas semua volume
  const totalIssues = volumes.reduce((sum, v) => sum + (v.issues?.length || 0), 0)

  const handleVolChange = (idx) => {
    setActiveVolIdx(idx)
    setActiveIssueIdx(0) // reset ke issue pertama saat ganti volume
  }

  return (
    <div className="group flex flex-col rounded-xl overflow-hidden border transition-all duration-200
                    bg-white border-stone-200
                    hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100/50
                    dark:bg-slate-900 dark:border-slate-800
                    dark:hover:border-emerald-700/60 dark:hover:shadow-emerald-900/30 dark:hover:shadow-xl">

      {/* ── Cover + info header ──────────────────────────────────────── */}
      <div className="flex gap-3 px-3 pt-3 pb-2 bg-stone-50 dark:bg-slate-800/60">
        <CoverStack volumes={volumes} activeVolIdx={activeVolIdx} activeIssueIdx={activeIssueIdx} />

        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {/* Kategori + pilihan editor */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {series.category && (
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold leading-none
                               bg-emerald-100 text-emerald-700 border border-emerald-200
                               dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700/50">
                {series.category}
              </span>
            )}
            {series.isFeatured && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold leading-none
                               bg-amber-100 text-amber-700 border border-amber-200
                               dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700/50">
                <Award className="w-2.5 h-2.5" />Pilihan
              </span>
            )}
          </div>

          {/* Judul seri */}
          <h3 className="font-semibold text-sm leading-snug line-clamp-2
                         text-stone-900 group-hover:text-emerald-700
                         dark:text-slate-100 dark:group-hover:text-emerald-400
                         transition-colors duration-150">
            {series.title}
          </h3>

          {/* Penerbit asli */}
          {series.publisher && (
            <p className="text-[11px] line-clamp-1 text-stone-400 dark:text-slate-500">
              {series.publisher}
            </p>
          )}

          {/* Ringkasan koleksi */}
          <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-auto leading-relaxed">
            <span className="text-sm font-bold text-stone-800 dark:text-slate-200">
              {volumes.length}
            </span>{' '}vol
            {totalIssues > volumes.length && (
              <>
                {' '}·{' '}
                <span className="font-semibold text-stone-700 dark:text-slate-300">
                  {totalIssues}
                </span>{' '}nomor
              </>
            )}
          </p>
        </div>
      </div>

      {/* ── Selector volume (jika ada lebih dari 1 volume) ───────────── */}
      {volumes.length > 1 && (
        <div className="px-3 pt-2 pb-1 border-t border-stone-100 dark:border-slate-800/60">
          <p className="text-[9px] uppercase tracking-widest font-semibold mb-1.5
                        text-stone-400 dark:text-slate-500">Volume</p>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
            {volumes.map((vol, idx) => (
              <button key={vol.volume ?? idx} onClick={() => handleVolChange(idx)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium border
                            transition-all duration-150
                            ${idx === activeVolIdx
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300'
                              : 'border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                {vol.volumeLabel || `Vol.${vol.volume}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Selector nomor edisi (issue) ─────────────────────────────── */}
      <div className="px-3 pt-2.5 pb-1">
        <p className="text-[9px] uppercase tracking-widest font-semibold mb-1.5
                      text-stone-400 dark:text-slate-500">
          {activeVol?.issues?.length > 1 ? 'Pilih Nomor' : 'Edisi'}
        </p>
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {activeVol?.issues?.map((issue, idx) => (
            <button key={issue.slug || idx} onClick={() => setActiveIssueIdx(idx)}
              className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-2.5 py-1.5
                          rounded-lg text-[11px] font-medium border transition-all duration-150
                          ${idx === activeIssueIdx
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100 dark:border-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300 dark:shadow-none'
                            : 'border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600'
                          }`}>
              <span className="whitespace-nowrap">{issue.issueLabel}</span>
              <span className="text-[9px] leading-none text-stone-400 dark:text-slate-600">
                {issue.publicationYear || '—'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats + CTA ──────────────────────────────────────────────── */}
      <div className="px-3 pt-1.5 pb-3 mt-auto">
        {/* Stats edisi aktif */}
        <div className="flex items-center gap-2.5 text-[11px] text-stone-400 dark:text-slate-500 mb-2.5">
          <span className="inline-flex items-center gap-1">
            <Eye className="w-3 h-3 flex-shrink-0" />
            {fmt(activeIssue?.viewCount ?? 0)}
          </span>
          <span className="text-stone-200 dark:text-slate-700 select-none">·</span>
          <span className="inline-flex items-center gap-1">
            <Download className="w-3 h-3 flex-shrink-0" />
            {fmt(activeIssue?.downloadCount ?? 0)}
          </span>
          {activeIssue?.estimatedReadTime && (
            <>
              <span className="text-stone-200 dark:text-slate-700 select-none">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3 flex-shrink-0" />
                {fmtTime(activeIssue.estimatedReadTime)}
              </span>
            </>
          )}
          {activeIssue?.averageRating > 0 && (
            <span className="inline-flex items-center gap-1 ml-auto">
              <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
              {Number(activeIssue.averageRating).toFixed(1)}
            </span>
          )}
        </div>

        {/* CTA buttons */}
        <div className="flex gap-1.5">
          {/* Baca → slug edisi yang dipilih */}
          <Link
            to={`/zine/${activeIssue?.slug || ''}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
                       text-xs font-semibold transition-all duration-150 active:scale-[0.98]
                       bg-emerald-500 hover:bg-emerald-400 text-white
                       shadow-sm shadow-emerald-200/60 hover:shadow-md hover:shadow-emerald-200/80
                       dark:shadow-emerald-900/30">
            Baca {activeIssue?.issueLabel || activeVol?.volumeLabel}
          </Link>
          {/* Semua → halaman seri, bukan slug volume */}
          <Link
            to={`/zine/seri/${series.seriesSlug}`}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium border
                       transition-all duration-150 active:scale-[0.98]
                       bg-white border-stone-200 text-stone-600
                       hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/60
                       dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400
                       dark:hover:border-emerald-600/70 dark:hover:text-emerald-400">
            Semua <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ZineSeriesCard