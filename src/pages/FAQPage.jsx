// ============================================
// src/pages/FAQPage.jsx
// ============================================

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: 'Apakah MasasilaM benar-benar gratis?',
      answer: 'Ya, MasasilaM 100% gratis tanpa biaya langganan. Semua buku dapat diakses dan diunduh tanpa batasan.'
    },
    {
      question: 'Apakah saya perlu membuat akun?',
      answer: 'Tidak wajib, tetapi dengan membuat akun Anda bisa menyimpan progress membaca, membuat catatan, dan menyimpan buku favorit.'
    },
    {
      question: 'Format buku apa yang tersedia?',
      answer: 'Semua buku tersedia dalam format EPUB yang kompatibel dengan hampir semua aplikasi pembaca ebook.'
    },
    {
      question: 'Bisakah saya membaca offline?',
      answer: 'Ya, Anda bisa mengunduh buku dalam format EPUB dan membacanya offline menggunakan aplikasi pembaca favorit.'
    },
    {
      question: 'Bagaimana cara mencari buku?',
      answer: 'Gunakan search bar di header atau jelajahi berdasarkan kategori, penulis, atau popularitas.'
    },
    {
      question: 'Apakah buku-bukunya legal?',
      answer: 'Ya, semua buku di MasasilaM adalah buku dengan hak cipta yang sudah habis masa berlakunya atau memiliki lisensi distribusi gratis.'
    },
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-5xl font-bold mb-6 text-center">FAQ</h1>
        <p className="text-xl text-center text-gray-600 dark:text-gray-400 mb-12">
          Pertanyaan yang Sering Diajukan
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <span className="font-semibold pr-4">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 flex-shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FAQPage