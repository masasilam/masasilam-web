// ============================================
// src/components/Zine/ZineSeriesCard.jsx
// Kartu per seri/judul — emerald accent
// LIGHT: bg-white, border-stone-200, hover emerald
// DARK:  bg-slate-900, border-slate-800, hover emerald
// ============================================
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Download, Layers, Star, ChevronRight, Award } from 'lucide-react'

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (n == null) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}rb`
  return String(n)
}

// ── Cover stack — 3 sampul ditumpuk ──────────────────────────────────────────
const CoverStack = ({ volumes, activeIdx }) => {
  // tampilkan maks 3 sampul; yang paling atas = volume aktif
  const displayVols = volumes.slice(0, 3)
  // urutkan: belakang dulu (index 2), lalu 1, lalu activeVol paling depan
  const activeVol   = volumes[activeIdx] || volumes[0]

  return (
    <div className="relative w-[82px] h-[112px] flex-shrink-0">
      {/* Bayangan tumpukan paling belakang */}
      {displayVols.length >= 3 && (
        <div
          className="absolute rounded-lg border overflow-hidden"
          style={{ width: 62, height: 90, bottom: 0, left: 2, zIndex: 1 }}
        >
          <div
            className="w-full h-full bg-stone-200 dark:bg-slate-700"
            style={{ opacity: 0.45 }}
          />
        </div>
      )}
      {/* Tumpukan tengah */}
      {displayVols.length >= 2 && (
        <div
          className="absolute rounded-lg border border-stone-200 dark:border-slate-700 overflow-hidden"
          style={{ width: 68, height: 98, bottom: 0, left: 7, zIndex: 2 }}
        >
          {displayVols[1]?.coverImageUrl ? (
            <img
              src={displayVols[1].coverImageUrl}
              alt=""
              className="w-full h-full object-cover"
              style={{ opacity: 0.65 }}
            />
          ) : (
            <div
              className="w-full h-full bg-stone-300 dark:bg-slate-600"
              style={{ opacity: 0.65 }}
            />
          )}
        </div>
      )}
      {/* Sampul depan — volume aktif */}
      <div
        className="absolute rounded-lg border border-stone-200 dark:border-slate-700 overflow-hidden shadow-md"
        style={{ width: 74, height: 108, bottom: 0, left: 8, zIndex: 3 }}
      >
        {activeVol?.coverImageUrl ? (
          <img
            src={activeVol.coverImageUrl}
            alt={activeVol.title || activeVol.volumeLabel}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 dark:from-slate-700 dark:to-slate-600 flex items-end p-2">
            <span className="text-[9px] font-semibold text-stone-500 dark:text-slate-400 leading-tight">
              {activeVol?.volumeLabel || `Vol.${activeVol?.volume}`}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── ZineSeriesCard ─────────────────────────────────────────────────────────────
const ZineSeriesCard = ({ series }) => {
  // series shape:
  // { id, slug, title, publisher, category, isFeatured,
  //   volumes: [{ slug, volumeLabel, volume, publicationYear, coverImageUrl,
  //               viewCount, downloadCount, issueCount, averageRating }],
  //   totalViews, totalDownloads }
  const [activeIdx, setActiveIdx] = useState(0)
  const activeVol = series.volumes?.[activeIdx] || series.volumes?.[0]

  if (!series.volumes?.length) return null

  return (
    <div
      className="group flex flex-col rounded-xl overflow-hidden border transition-all duration-200
                 bg-white border-stone-200
                 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100/50
                 dark:bg-slate-900 dark:border-slate-800
                 dark:hover:border-emerald-700/60 dark:hover:shadow-emerald-900/30 dark:hover:shadow-xl"
    >
      {/* ── Cover + info ───────────────────────────────────────────── */}
      <div className="relative flex gap-3 px-3 pt-3 pb-2 bg-stone-50 dark:bg-slate-800/60">
        <CoverStack volumes={series.volumes} activeIdx={activeIdx} />

        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {/* Kategori badge + featured */}
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
          <h3
            className="font-semibold text-sm leading-snug line-clamp-2
                       text-stone-900 group-hover:text-emerald-700
                       dark:text-slate-100 dark:group-hover:text-emerald-400
                       transition-colors duration-150"
          >
            {series.title}
          </h3>

          {/* Penerbit */}
          {series.publisher && (
            <p className="text-[11px] line-clamp-1 text-stone-400 dark:text-slate-500">
              {series.publisher}
            </p>
          )}

          {/* Jumlah volume */}
          <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-auto">
            <span className="text-base font-bold text-stone-800 dark:text-slate-200">
              {series.volumes.length}
            </span>{' '}
            volume
            {series.volumes.reduce((a, v) => a + (v.issueCount || 0), 0) > 0 && (
              <>
                {' '}·{' '}
                <span className="font-semibold text-stone-700 dark:text-slate-300">
                  {series.volumes.reduce((a, v) => a + (v.issueCount || 0), 0)}
                </span>{' '}
                edisi
              </>
            )}
          </p>
        </div>
      </div>

      {/* ── Volume selector strip ──────────────────────────────────── */}
      <div className="px-3 pt-2.5 pb-1">
        <p className="text-[9px] uppercase tracking-widest font-semibold mb-1.5
                      text-stone-400 dark:text-slate-500">
          Pilih Volume
        </p>
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {series.volumes.map((vol, idx) => (
            <button
              key={vol.slug || vol.volume || idx}
              onClick={() => setActiveIdx(idx)}
              className={`
                flex-shrink-0 flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg
                text-[11px] font-medium border transition-all duration-150
                ${idx === activeIdx
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100 dark:border-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300 dark:shadow-none'
                  : 'border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600'
                }
              `}
            >
              <span className="whitespace-nowrap">
                {vol.volumeLabel || `Vol.${vol.volume}`}
              </span>
              {idx === 0 ? (
                <span className="text-[9px] font-semibold text-emerald-500 dark:text-emerald-400 leading-none">
                  Terbaru
                </span>
              ) : (
                <span className="text-[9px] text-stone-400 dark:text-slate-600 leading-none">
                  {vol.publicationYear || '—'}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats + CTA ────────────────────────────────────────────── */}
      <div className="px-3 pt-1.5 pb-3 mt-auto">
        {/* Stats */}
        <div className="flex items-center gap-2.5 text-[11px] text-stone-400 dark:text-slate-500 mb-2.5">
          <span className="inline-flex items-center gap-1">
            <Eye className="w-3 h-3 flex-shrink-0" />
            {fmt(activeVol?.viewCount ?? series.totalViews ?? 0)}
          </span>
          <span className="text-stone-200 dark:text-slate-700 select-none">·</span>
          <span className="inline-flex items-center gap-1">
            <Download className="w-3 h-3 flex-shrink-0" />
            {fmt(activeVol?.downloadCount ?? series.totalDownloads ?? 0)}
          </span>
          {activeVol?.issueCount > 0 && (
            <>
              <span className="text-stone-200 dark:text-slate-700 select-none">·</span>
              <span className="inline-flex items-center gap-1">
                <Layers className="w-3 h-3 flex-shrink-0" />
                {activeVol.issueCount} edisi
              </span>
            </>
          )}
          {activeVol?.averageRating > 0 && (
            <span className="inline-flex items-center gap-1 ml-auto">
              <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
              {Number(activeVol.averageRating).toFixed(1)}
            </span>
          )}
        </div>

        {/* CTA buttons */}
        <div className="flex gap-1.5">
          <Link
            to={`/zine/${activeVol?.slug || ''}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
                       text-xs font-semibold transition-all duration-150 active:scale-[0.98]
                       bg-emerald-500 hover:bg-emerald-400 text-white
                       shadow-sm shadow-emerald-200/60 hover:shadow-md hover:shadow-emerald-200/80
                       dark:shadow-emerald-900/30"
          >
            Baca {activeVol?.volumeLabel || `Vol.${activeVol?.volume}`}
          </Link>
          <Link
            to={`/zine/${series.slug}`}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium border
                       transition-all duration-150 active:scale-[0.98]
                       bg-white border-stone-200 text-stone-600
                       hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/60
                       dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400
                       dark:hover:border-emerald-600/70 dark:hover:text-emerald-400"
          >
            Semua <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ZineSeriesCard