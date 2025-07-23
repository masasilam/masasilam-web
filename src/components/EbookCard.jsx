import { Link } from 'react-router-dom'

export default function EbookCard({ ebook }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/ebook/${ebook.id}`} className="block">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{ebook.title}</h3>
          <p className="text-sm text-gray-600 italic">{ebook.author}</p>
        </div>
      </Link>
    </div>
  )
}