// src/hooks/useGoogleAnalytics.js
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4'

const GA_MEASUREMENT_ID = 'G-Z6VFRV9H6G'

// ============================================
// HELPER FUNCTIONS - Export untuk digunakan di components
// ============================================

/**
 * Track custom events
 * @param {string} category - Event category (e.g., 'Book', 'User', 'Search')
 * @param {string} action - Event action (e.g., 'View', 'Click', 'Download')
 * @param {string} label - Event label (e.g., book title, button name)
 * @param {number} value - Optional numeric value
 */
export const trackEvent = (category, action, label, value) => {
  ReactGA.event({
    category,
    action,
    label,
    value
  })
}

/**
 * Track timing/performance metrics
 * @param {string} category - Timing category (e.g., 'Page Load', 'API Call')
 * @param {string} variable - Timing variable
 * @param {number} value - Time in milliseconds
 * @param {string} label - Optional label
 */
export const trackTiming = (category, variable, value, label) => {
  ReactGA.event({
    category: 'timing',
    action: category,
    label: label || variable,
    value: Math.round(value)
  })
}

/**
 * Track book view event
 * @param {string} bookId - Book ID
 * @param {string} bookTitle - Book title
 * @param {string} author - Author name
 * @param {string} genre - Book genre
 */
export const trackBookView = (bookId, bookTitle, author, genre) => {
  ReactGA.event({
    category: 'Book',
    action: 'View',
    label: bookTitle,
    book_title: bookTitle,
    author_name: author,
    genre: genre
  })
}

/**
 * Track book reading progress
 * @param {string} bookId - Book ID
 * @param {string} bookTitle - Book title
 * @param {number} progress - Reading progress percentage (0-100)
 * @param {number} timeSpent - Time spent reading in seconds
 */
export const trackBookRead = (bookId, bookTitle, progress, timeSpent) => {
  ReactGA.event({
    category: 'Book',
    action: 'Read',
    label: bookTitle,
    value: Math.round(progress),
    reading_progress: Math.round(progress),
    reading_time: Math.round(timeSpent)
  })
}

/**
 * Track book completion
 * @param {string} bookId - Book ID
 * @param {string} bookTitle - Book title
 * @param {number} totalTime - Total time to complete in seconds
 */
export const trackBookComplete = (bookId, bookTitle, totalTime) => {
  ReactGA.event({
    category: 'Book',
    action: 'Complete',
    label: bookTitle,
    reading_time: Math.round(totalTime)
  })
}

/**
 * Track search queries
 * @param {string} searchQuery - Search term
 * @param {number} resultsCount - Number of results returned
 */
export const trackSearch = (searchQuery, resultsCount) => {
  ReactGA.event({
    category: 'Search',
    action: 'Query',
    label: searchQuery,
    value: resultsCount
  })
}

/**
 * Track downloads
 * @param {string} bookId - Book ID
 * @param {string} bookTitle - Book title
 * @param {string} format - Download format (e.g., 'PDF', 'EPUB')
 */
export const trackDownload = (bookId, bookTitle, format) => {
  ReactGA.event({
    category: 'Download',
    action: format,
    label: bookTitle
  })
}

/**
 * Track social shares
 * @param {string} bookId - Book ID
 * @param {string} bookTitle - Book title
 * @param {string} platform - Social platform (e.g., 'Facebook', 'Twitter', 'WhatsApp')
 */
export const trackShare = (bookId, bookTitle, platform) => {
  ReactGA.event({
    category: 'Share',
    action: platform,
    label: bookTitle
  })
}

/**
 * Track user actions (generic)
 * @param {string} action - Action name
 * @param {string} label - Action label
 * @param {number} value - Optional numeric value
 */
export const trackUserAction = (action, label, value) => {
  ReactGA.event({
    category: 'User',
    action,
    label,
    value
  })
}

/**
 * Track bookmark actions
 * @param {string} action - 'Add' or 'Remove'
 * @param {string} bookTitle - Book title
 */
export const trackBookmark = (action, bookTitle) => {
  ReactGA.event({
    category: 'Bookmark',
    action,
    label: bookTitle
  })
}

/**
 * Track highlight/annotation actions
 * @param {string} action - 'Add', 'Edit', 'Delete'
 * @param {string} bookTitle - Book title
 */
export const trackHighlight = (action, bookTitle) => {
  ReactGA.event({
    category: 'Highlight',
    action,
    label: bookTitle
  })
}

/**
 * Track user authentication
 * @param {string} action - 'Login', 'Register', 'Logout'
 * @param {string} method - Auth method (e.g., 'Email', 'Google')
 */
export const trackAuth = (action, method) => {
  ReactGA.event({
    category: 'Auth',
    action,
    label: method
  })
}

/**
 * Track errors
 * @param {string} errorType - Type of error
 * @param {string} errorMessage - Error message
 * @param {boolean} fatal - Is error fatal?
 */
export const trackError = (errorType, errorMessage, fatal = false) => {
  ReactGA.event({
    category: 'Error',
    action: errorType,
    label: errorMessage,
    fatal: fatal ? 1 : 0
  })
}

// ============================================
// MAIN HOOK
// ============================================

export const useGoogleAnalytics = () => {
  const location = useLocation()

  // Initialize GA4 once
  useEffect(() => {
    if (!window.GA_INITIALIZED) {
      ReactGA.initialize(GA_MEASUREMENT_ID, {
        gaOptions: {
          siteSpeedSampleRate: 100,
          anonymizeIp: true,
          cookieFlags: 'SameSite=None;Secure'
        },
        gtagOptions: {
          send_page_view: false // Handled manually below
        }
      })
      window.GA_INITIALIZED = true

      // Track initial page load performance
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing
        const loadTime = timing.loadEventEnd - timing.navigationStart

        if (loadTime > 0) {
          trackTiming('Page Load', 'Initial Load', loadTime, 'milliseconds')
        }
      }

      // Track performance metrics with PerformanceObserver (modern browsers)
      if ('PerformanceObserver' in window) {
        try {
          // First Contentful Paint
          const fcpObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.name === 'first-contentful-paint') {
                trackTiming('Web Vitals', 'FCP', entry.startTime, 'milliseconds')
              }
            }
          })
          fcpObserver.observe({ entryTypes: ['paint'] })

          // Largest Contentful Paint
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1]
            trackTiming('Web Vitals', 'LCP', lastEntry.startTime, 'milliseconds')
          })
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        } catch (err) {
          console.warn('Performance observer not supported:', err)
        }
      }
    }
  }, [])

  // Track page views on route change
  useEffect(() => {
    const currentPath = location.pathname + location.search
    const pageTitle = document.title

    // Send pageview
    ReactGA.send({
      hitType: 'pageview',
      page: currentPath,
      title: pageTitle
    })

    // Track scroll depth
    let maxScroll = 0
    const scrollMilestones = [25, 50, 75, 100]
    const trackedMilestones = new Set()

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight <= 0) return

      const scrollPercentage = Math.round((window.scrollY / scrollHeight) * 100)

      if (scrollPercentage > maxScroll) {
        maxScroll = scrollPercentage

        // Track milestone only once
        scrollMilestones.forEach(milestone => {
          if (scrollPercentage >= milestone && !trackedMilestones.has(milestone)) {
            trackedMilestones.add(milestone)
            trackEvent('Scroll', 'Depth', currentPath, milestone)
          }
        })
      }
    }

    // Debounce scroll handler
    let scrollTimeout
    const debouncedScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(handleScroll, 100)
    }

    window.addEventListener('scroll', debouncedScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', debouncedScroll)
      clearTimeout(scrollTimeout)
    }
  }, [location])

  // Track time spent on page
  useEffect(() => {
    const startTime = Date.now()

    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000)

      // Only track if user spent more than 5 seconds
      if (timeSpent > 5) {
        const pagePath = location.pathname
        trackTiming('Time on Page', pagePath, timeSpent, 'seconds')
      }
    }
  }, [location])

  // Track visibility changes (tab switches)
  useEffect(() => {
    let visibilityStartTime = Date.now()

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User left the tab
        const visibleTime = Math.round((Date.now() - visibilityStartTime) / 1000)
        if (visibleTime > 3) {
          trackEvent('Engagement', 'Tab Visible Time', location.pathname, visibleTime)
        }
      } else {
        // User returned to tab
        visibilityStartTime = Date.now()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [location])
}

// Export default
export default useGoogleAnalytics