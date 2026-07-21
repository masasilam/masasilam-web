import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardService } from '../../services/dashboardService'
import DashboardShell from '../../components/Dashboard/DashboardShell'
import { ChevronLeft, ChevronRight, BookOpen, Clock, Calendar, Flame } from 'lucide-react'

const MONTH_NAMES = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
]
const DAY_NAMES = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']

// ── Intensity helpers ──────────────────────────────────────────────────────
const getIntensity = (minutes) => {
  if (!minutes || minutes === 0) return 0
  if (minutes >= 120) return 4
  if (minutes >= 60)  return 3
  if (minutes >= 30)  return 2
  return 1
}

const INTENSITY_STYLES = [
  '',
  'bg-amber-100 dark:bg-amber-900/30 ring-1 ring-amber-200 dark:ring-amber-700/40',
  'bg-amber-200 dark:bg-amber-800/50 ring-1 ring-amber-300 dark:ring-amber-600/40',
  'bg-amber-300 dark:bg-amber-600/60 ring-1 ring-amber-400 dark:ring-amber-500/50',
  'bg-amber-400 dark:bg-amber-500/80 ring-1 ring-amber-500 dark:ring-amber-400/50',
]

// ── Day Cell ──────────────────────────────────────────────────────────────
const CalendarDayCell = ({ dayNum, dayData, isToday, isCurrentMonth }) => {
  const [showDetail, setShowDetail] = useState(false)

  if (!dayNum) return <div className="aspect-square" />

  const hasData   = dayData && (dayData.minutesRead > 0 || (dayData.books?.length > 0))
  const books     = dayData?.books ?? []
  const intensity = getIntensity(dayData?.minutesRead)

  return (
    <div className="relative">
      <button
        onClick={() => hasData && setShowDetail(v => !v)}
        className={[
          'w-full aspect-square flex flex-col items-center justify-center gap-0.5 rounded-xl text-xs transition-all duration-150',
          isToday ? 'ring-2 ring-amber-500 ring-offset-1 ring-offset-white dark:ring-offset-slate-950' : '',
          !isCurrentMonth ? 'opacity-25' : '',
          hasData
            ? `${INTENSITY_STYLES[intensity]} cursor-pointer hover:brightness-95`
            : 'hover:bg-stone-100 dark:hover:bg-slate-800/60 cursor-default',
        ].join(' ')}
        aria-label={hasData ? `${dayNum}: ${dayData.minutesRead} menit` : `${dayNum}`}
      >
        <span className={`font-semibold leading-none text-xs sm:text-sm ${
          isToday
            ? 'text-amber-600 dark:text-amber-400'
            : intensity > 0
              ? 'text-amber-800 dark:text-amber-100'
              : 'text-stone-700 dark:text-slate-300'
        }`}>
          {dayNum}
        </span>
        {hasData && (
          <span className={`text-[9px] font-medium leading-none ${
            intensity > 0 ? 'text-amber-700 dark:text-amber-200' : 'text-stone-400 dark:text-slate-500'
          }`}>
            {dayData.minutesRead}m
          </span>
        )}
      </button>

      {/* Detail tooltip */}
      {showDetail && hasData && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDetail(false)}
          />
          <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-slate-700 p-4"
            onClick={e => e.stopPropagation()}>
            {/* Arrow */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 overflow-hidden">
              <div className="w-3 h-3 bg-white dark:bg-slate-900 border-l border-t border-stone-200 dark:border-slate-700 rotate-45 translate-y-1 mx-auto" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-900 dark:text-slate-100">{dayData.minutesRead} menit</p>
                {dayData.pagesRead > 0 && <p className="text-xs text-stone-400 dark:text-slate-500">~{dayData.pagesRead} hal</p>}
              </div>
            </div>
            {books.length > 0 && (
              <ul className="space-y-2">
                {books.map((book, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {book.coverImageUrl
                      ? <img src={book.coverImageUrl} alt="" className="w-7 h-9 object-cover rounded-md flex-shrink-0 shadow-sm" />
                      : <div className="w-7 h-9 bg-stone-100 dark:bg-slate-800 rounded-md flex items-center justify-center flex-shrink-0"><BookOpen className="w-3 h-3 text-stone-400" /></div>
                    }
                    <span className="text-xs text-stone-700 dark:text-slate-300 line-clamp-2 leading-tight">{book.title}</span>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setShowDetail(false)} className="mt-3 w-full text-center text-xs text-stone-400 hover:text-stone-600 dark:hover:text-slate-300 transition-colors">
              Tutup
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── Month Summary Cards ────────────────────────────────────────────────────
const MonthSummary = ({ calData }) => {
  if (!calData) return null
  const { totalMinutes = 0, totalPages = 0, activeDays = 0 } = calData

  const stats = [
    { label: 'Hari Aktif',   value: activeDays, unit: 'hari', icon: Flame,    color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
    { label: 'Total Baca',   value: totalMinutes >= 60 ? (totalMinutes / 60).toFixed(1) : totalMinutes, unit: totalMinutes >= 60 ? 'jam' : 'mnt', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Est. Halaman', value: totalPages,  unit: 'hal',  icon: BookOpen, color: 'text-emerald-500',bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(s => {
        const Icon = s.icon
        return (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 p-4 text-center">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}>
              <Icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-stone-400 dark:text-slate-500">{s.unit}</p>
            <p className="text-xs font-medium text-stone-600 dark:text-slate-400 mt-0.5">{s.label}</p>
          </div>
        )
      })}
    </div>
  )
}

// ── Legend ─────────────────────────────────────────────────────────────────
const IntensityLegend = () => (
  <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-slate-500">
    <span>Sedikit</span>
    {[0,1,2,3,4].map(i => (
      <div key={i} className={`w-4 h-4 rounded-md ${
        i === 0 ? 'bg-stone-100 dark:bg-slate-800' : INTENSITY_STYLES[i]
      }`} />
    ))}
    <span>Banyak</span>
  </div>
)

// ── Main Page ──────────────────────────────────────────────────────────────
const CalendarPage = () => {
  const navigate = useNavigate()
  const today    = new Date()
  const [year,    setYear]    = useState(today.getFullYear())
  const [month,   setMonth]   = useState(today.getMonth() + 1)
  const [calData, setCalData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    document.title = 'Kalender Membaca - Dashboard'
  }, [])

  const loadCalendar = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const res = await dashboardService.getCalendar(year, month)
      setCalData(res?.data ?? null)
    } catch (err) {
      setError(err?.response?.status === 401 ? 'auth' : 'network')
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => { loadCalendar() }, [loadCalendar])

  const prevMonth = () => { if (month === 1) { setYear(y => y - 1); setMonth(12) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 12) { setYear(y => y + 1); setMonth(1) } else setMonth(m => m + 1) }
  const goToday   = () => { setYear(today.getFullYear()); setMonth(today.getMonth() + 1) }

  const { calGrid, dayDataMap } = useMemo(() => {
    const firstDay    = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const map = {}
    calData?.days?.forEach(d => { map[d.day] = d })
    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)
    return { calGrid: cells, dayDataMap: map }
  }, [year, month, calData])

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear()

  const isFutureMonth = year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth() + 1)

  return (
    <DashboardShell
      loading={loading}
      error={error}
      onRetry={loadCalendar}
      onLogin={() => navigate('/masuk', { state: { from: '/dasbor/kalender' } })}
    >
      <div className="space-y-5">

        {/* ── Page Header ─────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-slate-50 mb-1">Kalender Membaca</h1>
          <p className="text-sm text-stone-500 dark:text-slate-400">Aktivitas membaca harian Anda</p>
        </div>

        {/* ── Summary Stats ───────────────────────────────────── */}
        <MonthSummary calData={calData} />

        {/* ── Calendar Card ───────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 overflow-hidden">

          {/* Month Nav Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-slate-800">
            <button
              onClick={prevMonth}
              className="w-9 h-9 rounded-xl border border-stone-200 dark:border-slate-700 flex items-center justify-center text-stone-500 dark:text-slate-400 hover:border-amber-400 hover:text-amber-500 dark:hover:border-amber-500 dark:hover:text-amber-400 transition-all"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center">
              <h2 className="text-lg font-bold text-stone-900 dark:text-slate-100">
                {MONTH_NAMES[month - 1]} {year}
              </h2>
              <button
                onClick={goToday}
                className="text-xs text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors"
              >
                Hari ini
              </button>
            </div>

            <button
              onClick={nextMonth}
              disabled={isFutureMonth}
              className="w-9 h-9 rounded-xl border border-stone-200 dark:border-slate-700 flex items-center justify-center text-stone-500 dark:text-slate-400 hover:border-amber-400 hover:text-amber-500 dark:hover:border-amber-500 dark:hover:text-amber-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 px-4 pt-4 pb-2">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-slate-500 pb-2">
                {d}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 px-4 pb-4">
            {calGrid.map((dayNum, i) => (
              <CalendarDayCell
                key={i}
                dayNum={dayNum}
                dayData={dayNum ? dayDataMap[dayNum] : null}
                isToday={!!dayNum && isToday(dayNum)}
                isCurrentMonth={!!dayNum}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-end px-5 pb-4">
            <IntensityLegend />
          </div>
        </div>

        {/* ── Daily Activity List ─────────────────────────────── */}
        {calData?.days && calData.days.some(d => d.minutesRead > 0 || d.books?.length > 0) && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100 dark:border-slate-800">
              <h2 className="font-bold text-stone-900 dark:text-slate-100">Aktivitas Bulan Ini</h2>
            </div>
            <div className="divide-y divide-stone-100 dark:divide-slate-800">
              {calData.days.filter(day => day.minutesRead > 0 || day.books?.length > 0).map(day => {
                const books   = day?.books ?? []
                const dayDate = new Date(year, month - 1, day.day)
                const dayName = DAY_NAMES[dayDate.getDay()]
                return (
                  <div key={day.day} className="flex gap-4 p-4 hover:bg-stone-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Day badge */}
                    <div className="flex-shrink-0 w-12 text-center">
                      <div className="text-xs text-stone-400 dark:text-slate-500 font-medium">{dayName}</div>
                      <div className="text-xl font-bold text-amber-500">{day.day}</div>
                    </div>
                    {/* Stats */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 dark:text-slate-300 bg-stone-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> {day.minutesRead} menit
                        </span>
                        {day.pagesRead > 0 && (
                          <span className="text-xs text-stone-400 dark:text-slate-500">~{day.pagesRead} hal</span>
                        )}
                      </div>
                      {books.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {books.map((book, i) => (
                            <div key={i} className="flex items-center gap-1.5 bg-stone-50 dark:bg-slate-800 rounded-lg px-2.5 py-1.5 border border-stone-200 dark:border-slate-700">
                              {book.coverImageUrl
                                ? <img src={book.coverImageUrl} alt="" className="w-4 h-6 object-cover rounded flex-shrink-0" />
                                : <BookOpen className="w-3 h-3 text-stone-400 flex-shrink-0" />
                              }
                              <span className="text-xs text-stone-700 dark:text-slate-300 max-w-[120px] truncate">{book.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

export default CalendarPage