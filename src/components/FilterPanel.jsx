import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

export default function FilterPanel({ onFilterChange }) {
  const [openSection, setOpenSection] = useState(null)

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section)
  }

  const subjects = [
    'All',
    'Adventure',
    'Autobiography',
    'Biography',
    'Children\'s',
    'Country',
    'Drama'
  ]

  const keywords = [
    'Q1',
    'Start',
    'View',
    'Put page',
    'S.R. release date (now → old)',
    'Grid',
    'D2'
  ]

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="mb-4">
        <button
          onClick={() => toggleSection('subjects')}
          className="flex justify-between items-center w-full text-left font-medium text-gray-700"
        >
          <span>Subjects</span>
          <ChevronDownIcon
            className={`h-5 w-5 transition-transform ${
              openSection === 'subjects' ? 'transform rotate-180' : ''
            }`}
          />
        </button>
        {openSection === 'subjects' && (
          <ul className="mt-2 space-y-2 pl-2">
            {subjects.map((subject) => (
              <li key={subject}>
                <button
                  onClick={() => onFilterChange('subject', subject)}
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  {subject}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <button
          onClick={() => toggleSection('keywords')}
          className="flex justify-between items-center w-full text-left font-medium text-gray-700"
        >
          <span>Keywords</span>
          <ChevronDownIcon
            className={`h-5 w-5 transition-transform ${
              openSection === 'keywords' ? 'transform rotate-180' : ''
            }`}
          />
        </button>
        {openSection === 'keywords' && (
          <ul className="mt-2 space-y-2 pl-2">
            {keywords.map((keyword) => (
              <li key={keyword}>
                <button
                  onClick={() => onFilterChange('keyword', keyword)}
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  {keyword}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}