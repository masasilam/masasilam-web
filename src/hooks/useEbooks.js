import { useState, useEffect } from 'react'
import { getEbooks, getEbook } from '../services/api'

export function useEbooks(filters) {
  const [ebooks, setEbooks] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEbooks = async () => {
      try {
        setLoading(true)
        const data = await getEbooks(filters)
        setEbooks(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEbooks()
  }, [filters])

  return { ebooks, loading, error }
}

export function useEbook(id) {
  const [ebook, setEbook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEbook = async () => {
      try {
        setLoading(true)
        const data = await getEbook(id)
        setEbook(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchEbook()
  }, [id])

  return { ebook, loading, error }
}