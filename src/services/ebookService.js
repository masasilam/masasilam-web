import axios from 'axios';

const API_BASE = '/api/ebooks';

export const getEbooks = async (params = {}) => {
  try {
    const response = await axios.get(API_BASE, {
      params: {
        page: 1,
        limit: 12,
        ...params
      }
    });

    console.log('Raw API Response:', response.data); // Debug log

    // Pastikan kita mengembalikan struktur data yang benar
    return {
      data: {
        ...response.data.data, // Mengambil data dari response backend
        list: response.data.data.list || []
      }
    };
  } catch (error) {
    console.error('Error fetching ebooks:', error);
    throw error;
  }
};