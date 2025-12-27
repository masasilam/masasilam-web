// src/pages/dashboard/CalendarPage.jsx
import { useState, useEffect, useCallback, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Book, Clock, TrendingUp, X } from 'lucide-react'
import { dashboardService } from '../../services/dashboardService'

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => {
    document.title = 'Kalender Membaca - Dashboard MasasilaM'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Lacak aktivitas membaca harian Anda dengan kalender interaktif')
    }
    loadCalendarData()
  }, [year, month])

  const loadCalendarData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await dashboardService.getCalendar(year, month + 1)
      setCalendarData(data)
    } catch (error) {
      console.error('Failed to load calendar:', error)
      setError('Gagal memuat kalender')
    } finally {
      setLoading(false)
    }
  }, [year, month])

  const { daysInMonth, startingDayOfWeek, monthName } = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    return {
      daysInMonth: lastDay.getDate(),
      startingDayOfWeek: firstDay.getDay(),
      monthName: currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    }
  }, [year, month, currentDate])

  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(new Date(year, month - 1))
    setSelectedDay(null)
  }, [year, month])

  const goToNextMonth = useCallback(() => {
    setCurrentDate(new Date(year, month + 1))
    setSelectedDay(null)
  }, [year, month])

  const getReadingDataForDay = useCallback((day) => {
    if (!calendarData?.days) return null
    return calendarData.days.find(d => d.day === day)
  }, [calendarData?.days])

  const getIntensityClass = useCallback((minutesRead) => {
    if (!minutesRead) return 'bg-gray-100 dark:bg-gray-800'
    if (minutesRead < 30) return 'bg-green-200 dark:bg-green-900'
    if (minutesRead < 60) return 'bg-green-400 dark:bg-green-700'
    if (minutesRead < 120) return 'bg-green-600 dark:bg-green-600'
    return 'bg-green-800 dark:bg-green-500'
  }, [])

  const isToday = useCallback((day) => {
    const today = new Date()
    return today.getDate() === day &&
           today.getMonth() === month &&
           today.getFullYear() === year
  }, [month, year])

  const dayNames = useMemo(() => ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'], [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" aria-hidden="true"></div>
        <span className="sr-only">Memuat kalender...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center" role="alert">
        <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={loadCalendarData}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold">Kalender Membaca</h1>
            <nav className="flex items-center gap-2 sm:gap-4" aria-label="Navigasi bulan">
              <button
                onClick={goToPreviousMonth}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <h2 className="text-base sm:text-lg font-semibold min-w-[160px] sm:min-w-[200px] text-center">
                {monthName}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Bulan selanjutnya"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </nav>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2" role="grid">
            {/* Day names */}
            {dayNames.map(day => (
              <div key={day} className="text-center font-semibold text-xs sm:text-sm py-2" role="columnheader">
                {day}
              </div>
            ))}

            {/* Empty cells */}
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" role="gridcell" aria-label="Tanggal kosong" />
            ))}

            {/* Calendar days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const readingData = getReadingDataForDay(day)
              const todayClass = isToday(day)

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(readingData)}
                  className={`aspect-square rounded-lg p-1 sm:p-2 transition-all relative group touch-manipulation ${
                    getIntensityClass(readingData?.minutes_read)
                  } ${todayClass ? 'ring-2 ring-primary' : ''} hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1`}
                  role="gridcell"
                  aria-label={`${day} ${monthName}${readingData ? `, ${readingData.minutes_read} menit membaca` : ''}`}
                  aria-current={todayClass ? 'date' : undefined}
                >
                  <div className="text-xs sm:text-sm font-semibold">{day}</div>
                  {readingData && (
                    <div className="text-[10px] sm:text-xs mt-0.5">{readingData.minutes_read}m</div>
                  )}

                  {/* Tooltip */}
                  {readingData && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block group-focus:block z-10 pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        {readingData.minutes_read} menit • {readingData.pages_read} halaman
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t dark:border-gray-700">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Kurang</span>
            <div className="flex gap-1" role="img" aria-label="Legenda intensitas membaca">
              <div className="w-4 h-4 sm:w-6 sm:h-6 rounded bg-gray-100 dark:bg-gray-800"></div>
              <div className="w-4 h-4 sm:w-6 sm:h-6 rounded bg-green-200 dark:bg-green-900"></div>
              <div className="w-4 h-4 sm:w-6 sm:h-6 rounded bg-green-400 dark:bg-green-700"></div>
              <div className="w-4 h-4 sm:w-6 sm:h-6 rounded bg-green-600 dark:bg-green-600"></div>
              <div className="w-4 h-4 sm:w-6 sm:h-6 rounded bg-green-800 dark:bg-green-500"></div>
            </div>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Banyak</span>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-lg" aria-hidden="true">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Waktu</p>
                <p className="text-xl sm:text-2xl font-bold">{calendarData?.total_minutes || 0} menit</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-lg" aria-hidden="true">
                <Book className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Halaman</p>
                <p className="text-xl sm:text-2xl font-bold">{calendarData?.total_pages || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900 rounded-lg" aria-hidden="true">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Hari Aktif</p>
                <p className="text-xl sm:text-2xl font-bold">{calendarData?.active_days || 0} hari</p>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Day Details */}
        {selectedDay && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 relative" role="dialog" aria-labelledby="selected-day-title">
            <button
              onClick={() => setSelectedDay(null)}
              className="absolute top-3 right-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Tutup detail"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 id="selected-day-title" className="font-bold text-lg sm:text-xl mb-4">
              Detail {selectedDay.day} {monthName}
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Waktu Membaca</p>
                <p className="text-base sm:text-lg font-semibold">{selectedDay.minutes_read} menit</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Halaman Dibaca</p>
                <p className="text-base sm:text-lg font-semibold">{selectedDay.pages_read} halaman</p>
              </div>
            </div>

            {selectedDay.books && selectedDay.books.length > 0 && (
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">Buku yang Dibaca:</p>
                <ul className="space-y-2">
                  {selectedDay.books.map((book, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm sm:text-base">
                      <Book className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
                      <span className="break-words">{book.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default CalendarPage