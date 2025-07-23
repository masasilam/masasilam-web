import { useState, useEffect } from 'react'
import { useEbooks } from '../hooks/useEbooks'
import FilterPanel from '../components/FilterPanel'
import EbookCard from '../components/EbookCard'
import SearchBar from '../components/SearchBar'

export default function Home() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortField: 'title',
    sortOrder: 'DESC',
    search: '',
    subject: 'All'
  })

  const { ebooks, loading, error } = useEbooks(filters)

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handleSearch = (query) => {
    setFilters(prev => ({
      ...prev,
      search: query,
      page: 1
    }))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1">
        <FilterPanel onFilterChange={handleFilterChange} />
      </div>
      <div className="md:col-span-3">
        <SearchBar onSearch={handleSearch} />

        {loading && <div className="text-center py-8">Loading ebooks...</div>}
        {error && <div className="text-center py-8 text-red-500">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ebooks?.data?.map(ebook => (
            <EbookCard key={ebook.id} ebook={ebook} />
          ))}
        </div>
      </div>
    </div>
  )
}