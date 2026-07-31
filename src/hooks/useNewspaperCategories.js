import { useState, useEffect } from 'react'
import api from '../services/api'
import { getGenreIcon } from '../utils/genreIcons'

let cachedCategories = null

const useNewspaperCategories = () => {
    const [categories, setCategories] = useState(cachedCategories || [])
    const [loading, setLoading] = useState(!cachedCategories)

    useEffect(() => {
        if (cachedCategories) return
        api.get('/newspapers/categories')
            .then(r => { cachedCategories = r.data?.data || []; setCategories(cachedCategories) })
            .catch(() => setCategories([]))
            .finally(() => setLoading(false))
    }, [])

    const map = Object.fromEntries(categories.map(c => [c.slug, c]))
    const getLabel = slug => map[slug]?.name || slug || ''
    const getIcon = slug => getGenreIcon(slug)

    return { categories, map, getLabel, getIcon, loading }
}

export default useNewspaperCategories