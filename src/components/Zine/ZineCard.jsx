import { Link } from 'react-router-dom'
import {
  Clock, Eye, Download, BookOpen, Star, Award, Layers,
  Hash, Zap, Lock,
} from 'lucide-react'

// ── Copyright icon ────────────────────────────────────────────────────────────
const CopyrightIcon = ({ status }) => {
  if (!status) return null
  const isDomainPublic =
    status === 'Domain Publik' ||
    status?.toLowerCase().includes('public domain') ||
    status?.toLowerCase().includes('uncopyright')
  const isCC0 = status?.toLowerCase().includes('cc0') || status?.toLowerCase().includes('cc 0')
  const isCC = !isCC0 && status?.toLowerCase().includes('creative commons')

  return (
    <span title={status} className="inline-flex items-center justify-center rounded-full px-1
                 bg-black/15 backdrop-blur-sm text-[9px] font-bold leading-none select-none
                 min-w-[20px] h-5">
      {isDomainPublic ? (
        <span style={{ position:'relative',display:'inline-block',color:'rgba(0,0,0,0.35)',fontSize:'11px',lineHeight:1 }}>
          ©
          <span style={{position:'absolute',top:'45%',left:'-5%',width:'110%',height:0,borderTop:'0.09em solid #ff4444',transform:'rotate(-45deg)'}} />
        </span>
      ) : isCC0 ? (
        <span className="text-emerald-300 tracking-tight" style={{ fontSize:'8px',whiteSpace:'nowrap' }}>CC0</span>
      ) : isCC ? (
        <span className="text-blue-300" style={{ fontSize:'9px' }}>CC</span>
      ) : (
        <Lock className="w-3 h-3 text-gray-300" />
      )}
    </span>
  )
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
const Stat = ({ icon: Icon, value, className = '' }) => (
  <span className={`inline-flex items-center gap-1 text-[11px] leading-none ${className}`}>
    <Icon className="w-3 h-3 flex-shrink-0" />
    {value}
  </span>
)

// ── ZineCard ──────────────────────────────────────────────────────────────────
const ZineCard = ({ zine }) => {
  const hasRating  = zine.averageRating != null && Number(zine.averageRating) > 0
  const rating     = hasRating ? Number(zine.averageRating) : 0
  const ratingStr  = hasRating ? rating.toFixed(1) : null
  const ratingCount = zine.totalRatings || 0
  const readTime   = zine.estimatedReadTime
    ? zine.estimatedReadTime >= 60
      ? `${Math.round(zine.estimatedReadTime / 60)}j`
      : `${zine.estimatedReadTime}m`
    : null

  return (
    <Link
      to={`/zine/${zine.slug}`}
      className="group relative flex flex-col rounded-xl overflow-hidden
                 transition-all duration-300 ease-out
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
                 border shadow-sm hover:shadow-xl hover:-translate-y-1
                 bg-white border-stone-200 shadow-stone-100/80
                 hover:border-emerald-300 hover:shadow-emerald-100/60
                 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none
                 dark:hover:border-emerald-700/60 dark:hover:shadow-emerald-900/30 dark:hover:shadow-xl"
    >
      {/* ── Cover area ──────────────────────────────────────────────────── */}
      <div className="relative aspect-[2/3] overflow-hidden flex-shrink-0
                      bg-stone-100 dark:bg-slate-800">
        <img
          src={zine.coverImageUrl || 'https://via.placeholder.com/300x450?text=No+Cover'}
          alt={`Cover ${zine.title}`}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Vignette */}
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

        {/* Top-left badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {zine.isFeatured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                             bg-emerald-500 text-white text-[10px] font-bold tracking-wide shadow-sm">
              <Award className="w-2.5 h-2.5" />Pilihan
            </span>
          )}
          {zine.volume && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                             bg-black/50 text-white text-[10px] font-bold backdrop-blur-sm">
              <Layers className="w-2.5 h-2.5" />Vol.{zine.volume}
            </span>
          )}
        </div>

        {/* Copyright top-right */}
        {zine.copyrightStatus && (
          <div className="absolute top-0 right-0 z-10 p-1">
            <CopyrightIcon status={zine.copyrightStatus} />
          </div>
        )}

        {/* Bottom: rating + read time */}
        <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between">
          {hasRating ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/20 backdrop-blur-[2px]">
              <Star className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400 flex-shrink-0" />
              <span className="text-white/90 text-[10px] font-semibold tabular-nums">{ratingStr}</span>
              {ratingCount > 0 && (
                <span className="text-white/50 text-[9px] tabular-nums">({ratingCount})</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/15 backdrop-blur-[2px]">
              <Star className="w-2.5 h-2.5 text-white/40" />
              <span className="text-white/40 text-[9px]">—</span>
            </div>
          )}
          {readTime && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/20 backdrop-blur-[2px]">
              <Clock className="w-2.5 h-2.5 text-white/60 flex-shrink-0" />
              <span className="text-white/80 text-[9px] font-medium">{readTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Info panel ──────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-3 gap-1.5">
        {/* Issue / category badges */}
        <div className="flex flex-wrap gap-1">
          {zine.issueNumber && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold
                             bg-emerald-50 border border-emerald-200 text-emerald-700
                             dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400">
              <Hash className="w-2 h-2" />{zine.issueNumber}
            </span>
          )}
          {zine.category && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium truncate max-w-[100px]
                             bg-teal-50 border border-teal-200 text-teal-700
                             dark:bg-teal-900/20 dark:border-teal-700/50 dark:text-teal-400">
              {zine.category}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 hyphens-auto
                       transition-colors duration-200
                       text-stone-900 group-hover:text-emerald-700
                       dark:text-slate-100 dark:group-hover:text-emerald-400">
          {zine.title}
        </h3>

        {/* Author */}
        {(zine.authorNames || zine.author) && (
          <p className="text-xs truncate leading-none text-stone-500 dark:text-slate-500">
            {zine.authorNames || zine.author}
          </p>
        )}

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-auto pt-1.5
                        border-t border-stone-100 dark:border-slate-800">
          <Stat icon={Eye}      value={zine.viewCount     || 0} className="text-stone-400 dark:text-slate-600" />
          <Stat icon={BookOpen} value={zine.readCount     || 0} className="text-stone-400 dark:text-slate-600" />
          <Stat icon={Download} value={zine.downloadCount || 0} className="text-stone-400 dark:text-slate-600" />
        </div>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent pointer-events-none
                      transition-colors duration-300
                      group-hover:border-emerald-300/40
                      dark:group-hover:border-emerald-500/20" />
    </Link>
  )
}

export default ZineCard