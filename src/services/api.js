import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/ebooks'

export const getEbooks = async (filters) => {
  const params = new URLSearchParams()
  for (const key in filters) {
    if (filters[key]) {
      params.append(key, filters[key])
    }
  }

  const response = await axios.get(`${API_BASE_URL}?${params.toString()}`)
  return response.data
}

export const getEbook = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/find?id=${id}`)
  return response.data.data
}