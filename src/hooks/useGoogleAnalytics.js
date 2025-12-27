// src/hooks/useGoogleAnalytics.js
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4'

const GA_MEASUREMENT_ID = 'G-Z6VFRV9H6G'

export const useGoogleAnalytics = () => {
  const location = useLocation()

  useEffect(() => {
    // Initialize GA4 hanya sekali
    if (!window.GA_INITIALIZED) {
      ReactGA.initialize(GA_MEASUREMENT_ID, {
        gaOptions: {
          siteSpeedSampleRate: 100,
        },
      })
      window.GA_INITIALIZED = true
    }
  }, [])

  useEffect(() => {
    // Track page views setiap route berubah
    const currentPath = location.pathname + location.search
    ReactGA.send({
      hitType: 'pageview',
      page: currentPath,
      title: document.title
    })
  }, [location])
}