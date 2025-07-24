import { Link } from 'react-router-dom'

export default function BookCard({ ebook }) {
  return (
    <Link
      to={`/books/${ebook.id}`}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 overflow-hidden book-card block"
    >
      <div className="p-6">
        <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2">
          {ebook.title}
        </h3>
        <p className="text-gray-600 italic text-sm mb-1">
          by {ebook.author}
        </p>
        <p className="text-gray-500 text-xs">
          {ebook.year}
        </p>
      </div>
    </Link>
  )
}