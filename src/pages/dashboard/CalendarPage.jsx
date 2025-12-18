// src/pages/dashboard/CalendarPage.jsx
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Book, Clock, TrendingUp } from 'lucide-react'
import { dashboardService } from '../../services/dashboardService'

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => {
    loadCalendarData()
  }, [year, month])

  const loadCalendarData = async () => {
    try {
      setLoading(true)
      const data = await dashboardService.getCalendar(year, month + 1)
      setCalendarData(data)
    } catch (error) {
      console.error('Failed to load calendar:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1))
  }

  const getReadingDataForDay = (day) => {
    if (!calendarData?.days) return null
    return calendarData.days.find(d => d.day === day)
  }

  const getIntensityClass = (minutesRead) => {
    if (!minutesRead) return 'bg-gray-100 dark:bg-gray-800'
    if (minutesRead < 30) return 'bg-green-200 dark:bg-green-900'
    if (minutesRead < 60) return 'bg-green-400 dark:bg-green-700'
    if (minutesRead < 120) return 'bg-green-600 dark:bg-green-600'
    return 'bg-green-800 dark:bg-green-500'
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Kalender Membaca</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold min-w-[200px] text-center">
              {monthName}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day names */}
          {dayNames.map(day => (
            <div key={day} className="text-center font-semibold text-sm py-2">
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Calendar days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const readingData = getReadingDataForDay(day)
            const isToday = new Date().getDate() === day && 
                           new Date().getMonth() === month && 
                           new Date().getFullYear() === year

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(readingData)}
                className={`aspect-square rounded-lg p-2 transition-all relative group ${
                  getIntensityClass(readingData?.minutes_read)
                } ${isToday ? 'ring-2 ring-primary' : ''} hover:scale-105`}
              >
                <div className="text-sm font-semibold">{day}</div>
                {readingData && (
                  <div className="text-xs mt-1">{readingData.minutes_read}m</div>
                )}
                
                {/* Tooltip on hover */}
                {readingData && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
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
        <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">Kurang</span>
          <div className="flex gap-1">
            <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-800"></div>
            <div className="w-6 h-6 rounded bg-green-200 dark:bg-green-900"></div>
            <div className="w-6 h-6 rounded bg-green-400 dark:bg-green-700"></div>
            <div className="w-6 h-6 rounded bg-green-600 dark:bg-green-600"></div>
            <div className="w-6 h-6 rounded bg-green-800 dark:bg-green-500"></div>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Banyak</span>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Waktu</p>
              <p className="text-2xl font-bold">{calendarData?.total_minutes || 0} menit</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Book className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Halaman</p>
              <p className="text-2xl font-bold">{calendarData?.total_pages || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hari Aktif</p>
              <p className="text-2xl font-bold">{calendarData?.active_days || 0} hari</p>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="font-bold text-xl mb-4">
            Detail {selectedDay.day} {monthName}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Waktu Membaca</p>
              <p className="text-lg font-semibold">{selectedDay.minutes_read} menit</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Halaman Dibaca</p>
              <p className="text-lg font-semibold">{selectedDay.pages_read} halaman</p>
            </div>
          </div>
          {selectedDay.books && selectedDay.books.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Buku yang Dibaca:</p>
              <ul className="space-y-2">
                {selectedDay.books.map((book, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Book className="w-4 h-4 text-primary" />
                    <span>{book.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CalendarPage