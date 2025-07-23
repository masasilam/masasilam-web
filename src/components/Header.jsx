import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-bold text-indigo-600">STANDARD EBOOKS</h1>
          <span className="ml-4 text-sm text-gray-500">Browser Ebooks</span>
        </Link>
      </div>
    </header>
  )
}