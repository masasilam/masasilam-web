import { useParams } from 'react-router-dom'
import { useEbook } from '../hooks/useEbooks'
import { ArrowDownTrayIcon, BookOpenIcon } from '@heroicons/react/20/solid'

export default function EbookDetail() {
  const { id } = useParams()
  const { ebook, loading, error } = useEbook(id)

  if (loading) return <div className="text-center py-8">Loading ebook details...</div>
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{ebook?.title}</h1>
        <p className="text-lg text-gray-600 italic mb-6">{ebook?.author}</p>

        <div className="flex space-x-4 mt-6">
          <a
            href={`/api/ebooks/download?id=${id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5" />
            Download
          </a>
          <a
            href={`/api/ebooks/read?id=${id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <BookOpenIcon className="-ml-1 mr-2 h-5 w-5" />
            Read Online
          </a>
        </div>
      </div>
    </div>
  )
}