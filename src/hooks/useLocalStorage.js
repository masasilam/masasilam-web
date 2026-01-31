// src/hooks/useLocalStorage.js - Custom hook for localStorage persistence
import { useState, useEffect } from 'react'

/**
 * Custom hook for managing state with localStorage persistence
 * @param {string} key - localStorage key
 * @param {any} initialValue - default value if localStorage is empty
 * @returns {[value, setValue]} - state value and setter function
 */
export const useLocalStorage = (key, initialValue) => {
  // Initialize state with value from localStorage or initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      // Parse stored json or return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
      return initialValue
    }
  })

  // Update localStorage when state changes
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Save state
      setStoredValue(valueToStore)

      // Save to localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  }

  return [storedValue, setValue]
}

export default useLocalStorage