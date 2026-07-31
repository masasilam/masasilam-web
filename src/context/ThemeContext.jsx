import { createContext, useState, useEffect } from 'react'
import { STORAGE_KEYS } from '../utils/constants'

export const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME)
    return savedTheme || 'dark'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  const setLightTheme = () => {
    setTheme('light')
  }

  const setDarkTheme = () => {
    setTheme('dark')
  }

  const value = {
    theme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}