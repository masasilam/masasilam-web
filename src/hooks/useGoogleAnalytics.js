// src/hooks/useGoogleAnalytics.js
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { useAuth } from './useAuth'

const GA_MEASUREMENT_ID = 'G-Z6VFRV9H6G'

const EXCLUDED_USERNAMES = ['masasilam']

const isTrackingDisabled = (username) => {
  const isDev =
    import.meta.env.DEV ||                              // Vite flag
    import.meta.env.MODE === 'development' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') || // LAN dev
    window.location.hostname.endsWith('.local')

  if (isDev) return true

  if (username && EXCLUDED_USERNAMES.includes(username.toLowerCase())) return true

  return false
}

export const trackEvent = (category, action, label, value) => {
  ReactGA.event({ category, action, label, value })
}

export const trackTiming = (category, variable, value, label) => {
  ReactGA.event({
    category: 'timing',
    action: category,
    label: label || variable,
    value: Math.round(value),
  })
}

export const trackBookView    = (bookId, bookTitle, author, genre) =>
  ReactGA.event({ category: 'Book', action: 'View', label: bookTitle, author_name: author, genre })

export const trackBookRead    = (bookId, bookTitle, progress, timeSpent) =>
  ReactGA.event({ category: 'Book', action: 'Read', label: bookTitle, value: Math.round(progress), reading_progress: Math.round(progress), reading_time: Math.round(timeSpent) })

export const trackBookComplete = (bookId, bookTitle, totalTime) =>
  ReactGA.event({ category: 'Book', action: 'Complete', label: bookTitle, reading_time: Math.round(totalTime) })

export const trackSearch      = (searchQuery, resultsCount) =>
  ReactGA.event({ category: 'Search', action: 'Query', label: searchQuery, value: resultsCount })

export const trackDownload    = (bookId, bookTitle, format) =>
  ReactGA.event({ category: 'Download', action: format, label: bookTitle })

export const trackShare       = (bookId, bookTitle, platform) =>
  ReactGA.event({ category: 'Share', action: platform, label: bookTitle })

export const trackUserAction  = (action, label, value) =>
  ReactGA.event({ category: 'User', action, label, value })

export const trackBookmark    = (action, bookTitle) =>
  ReactGA.event({ category: 'Bookmark', action, label: bookTitle })

export const trackHighlight   = (action, bookTitle) =>
  ReactGA.event({ category: 'Highlight', action, label: bookTitle })

export const trackAuth        = (action, method) =>
  ReactGA.event({ category: 'Auth', action, label: method })

export const trackError       = (errorType, errorMessage, fatal = false) =>
  ReactGA.event({ category: 'Error', action: errorType, label: errorMessage, fatal: fatal ? 1 : 0 })


export const useGoogleAnalytics = () => {
  const location = useLocation()
  const { user } = useAuth()

  const disabled = isTrackingDisabled(user?.username)

  const initialized = useRef(false)

  useEffect(() => {
    if (disabled) return
    if (initialized.current) return
    initialized.current = true

    ReactGA.initialize(GA_MEASUREMENT_ID, {
      gaOptions: {
        siteSpeedSampleRate: 100,
        anonymizeIp: true,
        cookieFlags: 'SameSite=None;Secure',
      },
      gtagOptions: {
        send_page_view: false,
      },
    })

    // ── Web Vitals ───────────────────────────────────────────────────────────
    if ('PerformanceObserver' in window) {
      try {
        // FCP
        const fcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              trackTiming('Web Vitals', 'FCP', entry.startTime, 'milliseconds')
              fcpObserver.disconnect() // cukup sekali
            }
          }
        })
        fcpObserver.observe({ type: 'paint', buffered: true })

        // FIX: LCP — disconnect saat halaman di-hide agar nilai sudah final
        let lcpValue = 0
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            lcpValue = entry.startTime // terus update ke nilai terbaru
          }
        })
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

        // Kirim LCP hanya sekali saat tab tidak lagi aktif (nilai sudah final)
        const sendLcp = () => {
          if (lcpValue > 0) {
            trackTiming('Web Vitals', 'LCP', lcpValue, 'milliseconds')
            lcpValue = 0 // reset agar tidak dikirim dua kali
          }
          lcpObserver.disconnect()
          document.removeEventListener('visibilitychange', sendLcp)
        }
        document.addEventListener('visibilitychange', sendLcp, { once: true })

      } catch (err) {
        console.warn('Performance observer not supported:', err)
      }
    }

    // Initial page load timing (fallback untuk browser lama)
    if (window.performance?.timing) {
      window.addEventListener('load', () => {
        const { timing } = window.performance
        const loadTime = timing.loadEventEnd - timing.navigationStart
        if (loadTime > 0) {
          trackTiming('Page Load', 'Initial Load', loadTime, 'milliseconds')
        }
      }, { once: true })
    }
  }, []) // kosong — hanya jalan sekali saat mount


  // ── 2. Pageview — dikirim sekali per navigasi ─────────────────────────────
  // FIX: tidak ada double-count karena send_page_view: false di atas.
  useEffect(() => {
    if (disabled) return
    // Pastikan GA sudah siap (mungkin belum di render pertama di Strict Mode)
    if (!initialized.current) return

    ReactGA.send({
      hitType: 'pageview',
      page: location.pathname + location.search,
      title: document.title,
    })
  }, [location.pathname, location.search])


  // ── 3. Scroll depth ───────────────────────────────────────────────────────
  useEffect(() => {
    if (disabled) return
    const currentPath = location.pathname + location.search
    const trackedMilestones = new Set()
    const MILESTONES = [25, 50, 75, 100]
    let maxScroll = 0
    let scrollTimeout

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight <= 0) return

      const pct = Math.round((window.scrollY / scrollHeight) * 100)
      if (pct <= maxScroll) return
      maxScroll = pct

      MILESTONES.forEach((m) => {
        if (pct >= m && !trackedMilestones.has(m)) {
          trackedMilestones.add(m)
          trackEvent('Scroll', 'Depth', currentPath, m)
        }
      })
    }

    const debouncedScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(handleScroll, 150)
    }

    window.addEventListener('scroll', debouncedScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', debouncedScroll)
      clearTimeout(scrollTimeout)
    }
  }, [location.pathname, location.search])


  // ── 4. Time on page ───────────────────────────────────────────────────────
  // FIX: menggunakan ref untuk startTime agar tidak terpengaruh re-render,
  // dan hanya track saat halaman benar-benar di-leave (bukan re-render).
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    if (disabled) return
    startTimeRef.current = Date.now()
    const pagePath = location.pathname

    return () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000)
      // Hanya kirim jika user benar-benar membaca (>5 detik)
      if (timeSpent > 5) {
        trackTiming('Time on Page', pagePath, timeSpent, 'seconds')
      }
    }
  }, [location.pathname]) // hanya reset saat path berubah, bukan query string


  // ── 5. Visibility change (tab switch) ────────────────────────────────────
  // FIX: dipisahkan dari location agar tidak re-register listener setiap navigasi
  const visibilityStartRef = useRef(Date.now())
  const visibilityPathRef  = useRef(location.pathname)

  // Update path ref setiap navigasi tanpa re-register listener
  useEffect(() => {
    visibilityPathRef.current = location.pathname
  }, [location.pathname])

  useEffect(() => {
    if (disabled) return
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const visibleTime = Math.round((Date.now() - visibilityStartRef.current) / 1000)
        if (visibleTime > 3) {
          trackEvent('Engagement', 'Tab Visible Time', visibilityPathRef.current, visibleTime)
        }
      } else {
        visibilityStartRef.current = Date.now()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, []) // kosong — listener cukup dipasang sekali
}

export default useGoogleAnalytics