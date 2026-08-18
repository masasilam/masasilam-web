import api from './api'

const getPerCategory = async () => {
    try {
        const response = await api.get('/trending/categories')
        return response.data?.data || {}
    } catch (error) {
        console.error('trendingService.getPerCategory error:', error)
        return { BOOK: [], ZINE: [], FILM: [], NEWSPAPER: [] }
    }
}

const getOverall = async (limit = 15) => {
    try {
        const response = await api.get('/trending/overall', { params: { limit } })
        return response.data?.data || []
    } catch (error) {
        console.error('trendingService.getOverall error:', error)
        return []
    }
}

const getByType = async (type, limit = 10) => {
    try {
        const response = await api.get('/trending', { params: { type, limit } })
        return response.data?.data || []
    } catch (error) {
        console.error(`trendingService.getByType(${type}) error:`, error)
        return []
    }
}

export const trendingService = { getPerCategory, getOverall, getByType }
export default trendingService