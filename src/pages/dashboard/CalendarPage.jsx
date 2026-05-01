// src/pages/dashboard/CalendarPage.jsx
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardService } from '../../services/dashboardService'
import DashboardShell from '../../components/Dashboard/DashboardShell'
import { ChevronLeft, ChevronRight, BookOpen, Clock } from 'lucide-react'

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]
const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const CalendarDayCell = ({ dayNum, dayData, isToday, isCurrentMonth }) => {
  const [showDetail, setShowDetail] = useState(false)

  if (!dayNum) return <div className="aspect-square" />

  const hasData = dayData && (dayData.minutesRead > 0 || (dayData.books && dayData.books.length > 0))
  const books   = dayData?.books ?? []

  const intensity =
    !hasData ? 0 :
    dayData.minutesRead >= 120 ? 4 :
    dayData.minutesRead >= 60  ? 3 :
    dayData.minutesRead >= 30  ? 2 : 1

  const bgClass = [
    '',
    'bg-blue-50 dark:bg-blue-900/20',
    'bg-blue-100 dark:bg-blue-900/30',
    'bg-blue-200 dark:bg-blue-800/50',
    'bg-blue-300 dark:bg-blue-700/70',
  ][intensity]

  return (
    <div className="relative">
      <button
        onClick={() => hasData && setShowDetail(v => !v)}
        className={`
          w-full aspect-square flex flex-col items-center justify-start pt-1 rounded-lg text-xs
          transition-all border
          ${isToday ? 'border-primary ring-2 ring-primary ring-offset-1' : 'border-transparent'}
          ${!isCurrentMonth ? 'opacity-30' : ''}
          ${hasData
            ? `${bgClass} hover:brightness-95 cursor-pointer`
            : 'hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-default'
          }
        `}
        aria-label={hasData ? `${dayNum}: ${dayData.minutesRead} menit` : `${dayNum}`}
      >
        <span className={`font-semibold leading-none mb-1 ${isToday ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
          {dayNum}
        </span>
        {hasData && (
          <>
            <div className="flex gap-0.5 flex-wrap justify-center px-0.5">
              {books.slice(0, 3).map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-primary opacity-70" />
              ))}
              {books.length > 3 && <div className="w-1 h-1 rounded-full bg-gray-400" />}
            </div>
            <span className="text-blue-600 dark:text-blue-400 font-medium leading-none mt-0.5" style={{ fontSize: 9 }}>
              {dayData.minutesRead}m
            </span>
          </>
        )}
      </button>

      {showDetail && hasData && (
        <div
          className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => setShowDetail(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
          >✕</button>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3 h-3 text-primary flex-shrink-0" />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {dayData.minutesRead} menit
            </span>
            {dayData.pagesRead > 0 && (
              <span className="text-xs text-gray-400">· ~{dayData.pagesRead} hal</span>
            )}
          </div>
          {books.length > 0 && (
            <ul className="space-y-1.5">
              {books.map((book, i) => (
                <li key={i} className="flex items-center gap-2">
                  {book.coverImageUrl ? (
                    <img src={book.coverImageUrl} alt="" className="w-6 h-8 object-cover rounded flex-shrink-0" />
                  ) : (
                    <div className="w-6 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-3 h-3 text-gray-400" />
                    </div>
                  )}
                  <span className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 leading-tight">
                    {book.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

const MonthSummary = ({ calData }) => {
  if (!calData) return null
  const { totalMinutes, totalPages, activeDays } = calData
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {[
        { label: 'Hari Aktif', value: activeDays, unit: 'hari', color: 'text-primary' },
        { label: 'Total Baca', value: totalMinutes >= 60 ? `${(totalMinutes / 60).toFixed(1)}` : totalMinutes, unit: totalMinutes >= 60 ? 'jam' : 'menit', color: 'text-blue-500' },
        { label: 'Estimasi Hal', value: totalPages, unit: 'hal', color: 'text-green-500' },
      ].map(s => (
        <div key={s.label} className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4 text-center">
          <p className={`text-xl sm:text-2xl font-bold ${s.color}`}>{s.value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{s.unit}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

const IntensityLegend = () => (
  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
    <span>Kurang</span>
    {[0,1,2,3,4].map(i => (
      <div key={i} className={`w-4 h-4 rounded ${[
        'bg-gray-100 dark:bg-gray-700',
        'bg-blue-50 dark:bg-blue-900/20',
        'bg-blue-100 dark:bg-blue-900/30',
        'bg-blue-200 dark:bg-blue-800/50',
        'bg-blue-300 dark:bg-blue-700/70',
      ][i]}`} />
    ))}
    <span>Banyak</span>
  </div>
)

const CalendarPage = () => {
  const navigate = useNavigate()
  const today    = new Date()
  const [year,    setYear]    = useState(today.getFullYear())
  const [month,   setMonth]   = useState(today.getMonth() + 1)
  const [calData, setCalData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    document.title = 'Kalender Membaca - Dashboard MasasilaM'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', 'Lihat aktivitas membaca harian Anda')
  }, [])

  const loadCalendar = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await dashboardService.getCalendar(year, month)
      setCalData(res?.data ?? null)
    } catch (err) {
      setError(err?.response?.status === 401 ? 'auth' : 'network')
      console.error('Calendar error:', err)
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

  return (
    <DashboardShell
      loading={loading}
      error={error}
      onRetry={loadCalendar}
      onLogin={() => navigate('/masuk', { state: { from: '/dasbor/kalender' } })}
    >
      <div className="space-y-4 sm:space-y-6">

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Bulan sebelumnya">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                {MONTH_NAMES[month - 1]} {year}
              </h1>
              <button onClick={goToday} className="text-xs text-primary hover:underline mt-0.5">
                Hari ini
              </button>
            </div>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Bulan berikutnya">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <MonthSummary calData={calData} />

        {/* Kalender grid */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
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
          <div className="flex justify-end mt-4">
            <IntensityLegend />
          </div>
        </div>

        {/* Aktivitas detail per hari */}
        {calData?.days && calData.days.length > 0 && (
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="font-bold text-base sm:text-lg mb-4 text-gray-900 dark:text-gray-100">
              Aktivitas Bulan Ini
            </h2>
            <div className="space-y-3">
              {calData.days.map(day => {
                const books = day?.books ?? []
                if (day.minutesRead === 0 && books.length === 0) return null
                return (
                  <div key={day.day} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{day.day}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {day.minutesRead} menit baca
                        </span>
                        {day.pagesRead > 0 && (
                          <span className="text-xs text-gray-400">· ~{day.pagesRead} halaman</span>
                        )}
                      </div>
                      {books.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {books.map((book, i) => (
                            <div key={i} className="flex items-center gap-1.5 bg-white dark:bg-gray-800 rounded px-2 py-1 border border-gray-100 dark:border-gray-600">
                              {book.coverImageUrl ? (
                                <img src={book.coverImageUrl} alt="" className="w-4 h-6 object-cover rounded flex-shrink-0" />
                              ) : (
                                <BookOpen className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              )}
                              <span className="text-xs text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                                {book.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 dark:text-gray-500 italic">Data buku tidak tersedia</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </DashboardShell>
  )
}

export default CalendarPage