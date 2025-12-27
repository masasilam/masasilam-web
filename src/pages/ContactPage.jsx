import { useState } from 'react'
import { Mail, MapPin, Phone, Send, Clock, MessageCircle } from 'lucide-react'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    setSuccess(true)
    setLoading(false)
    setFormData({ name: '', email: '', subject: '', message: '' })

    setTimeout(() => setSuccess(false), 5000)
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: ["support@masasilam.com"],
      color: "text-blue-600 dark:text-blue-400"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full mb-4 sm:mb-6">
            <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
            Hubungi Kami
          </h1>
          <p className="text-base sm:text-xl text-gray-700 dark:text-gray-300">
            Ada pertanyaan? Kami siap membantu Anda!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Contact Info */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Informasi Kontak</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon
                  return (
                    <div key={index} className="flex gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 ${info.color} bg-opacity-10 dark:bg-opacity-20 rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${info.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">{info.title}</h3>
                        {info.details.map((detail, i) => (
                          <p key={i} className="text-sm text-gray-600 dark:text-gray-400">{detail}</p>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-6 sm:p-8 border-2 border-amber-200 dark:border-amber-700">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Link Cepat</h2>
              <div className="space-y-3">
                <a href="/faq" className="block p-3 bg-white/80 dark:bg-gray-900/80 rounded-lg hover:bg-white dark:hover:bg-gray-900 transition-colors">
                  <div className="font-semibold text-gray-900 dark:text-white">📚 FAQ</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Pertanyaan yang sering diajukan</div>
                </a>
                <a href="/cara-membaca" className="block p-3 bg-white/80 dark:bg-gray-900/80 rounded-lg hover:bg-white dark:hover:bg-gray-900 transition-colors">
                  <div className="font-semibold text-gray-900 dark:text-white">📖 Panduan Membaca</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Cara menggunakan platform</div>
                </a>
                <a href="/tentang" className="block p-3 bg-white/80 dark:bg-gray-900/80 rounded-lg hover:bg-white dark:hover:bg-gray-900 transition-colors">
                  <div className="font-semibold text-gray-900 dark:text-white">ℹ️ Tentang Kami</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Pelajari lebih lanjut tentang MasasilaM</div>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Kirim Pesan</h2>

            {success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Pesan berhasil dikirim!</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">Kami akan segera menghubungi Anda.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Nama lengkap Anda"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  Subjek <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Topik pesan Anda"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  Pesan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows="6"
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  placeholder="Tulis pesan Anda di sini..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-primary hover:bg-amber-600 text-white rounded-lg font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Kirim Pesan
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage