// ============================================
// src/pages/ContactPage.jsx
// ============================================

import { useState } from 'react'
import Button from '../components/Common/Button'
import Input from '../components/Common/Input'
import Alert from '../components/Common/Alert'
import { Mail, MapPin, Phone } from 'lucide-react'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Implement contact form submission
    setSuccess(true)
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 sm:py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4 sm:mb-6 text-center text-gray-900 dark:text-white">
          Hubungi Kami
        </h1>
        <p className="text-lg sm:text-xl text-center text-gray-700 dark:text-gray-300 mb-8 sm:mb-12">
          Ada pertanyaan? Kami siap membantu!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Contact Info */}
          <div className="space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Informasi Kontak</h2>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Mail className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">Email</h3>
                    <p className="text-gray-600 dark:text-gray-400">support@masasilam.id</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Phone className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">Telepon</h3>
                    <p className="text-gray-600 dark:text-gray-400">+62 21 1234 5678</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <MapPin className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">Alamat</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Jakarta, Indonesia
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Kirim Pesan</h2>
            
            {success && (
              <Alert 
                type="success" 
                message="Pesan berhasil dikirim! Kami akan segera menghubungi Anda."
                onClose={() => setSuccess(false)}
              />
            )}

            <div className="space-y-4">
              <Input
                label="Nama"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />

              <Input
                label="Subjek"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                required
              />

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  Pesan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows="5"
                  required
                  className="input resize-none"
                />
              </div>

              <Button onClick={handleSubmit} fullWidth>
                Kirim Pesan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage