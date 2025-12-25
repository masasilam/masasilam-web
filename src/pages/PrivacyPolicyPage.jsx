import { Lock, Eye, Database, UserCheck, Shield } from 'lucide-react'

const PrivacyPolicyPage = () => {
  const sections = [
    {
      icon: Database,
      title: "1. Informasi yang Kami Kumpulkan",
      subsections: [
        {
          subtitle: "Informasi yang Anda Berikan",
          content: ["Username, alamat email, password (di-hash dengan bcrypt), nama lengkap, bio (optional)", "Anotasi (bookmark, highlight, notes), review dan komentar, rating buku, preferensi dan settings, profile picture (optional)"]
        },
        {
          subtitle: "Informasi yang Dikumpulkan Otomatis",
          content: ["Reading Data: Progress membaca, waktu mulai dan selesai, durasi sesi, kecepatan membaca (WPM), scroll depth, pattern membaca", "Usage Data: Halaman yang dikunjungi, fitur yang digunakan, waktu yang dihabiskan, click patterns, search queries", "Device & Technical Data: IP address, browser type, OS, device identifier, screen resolution, location data (approximate)"]
        }
      ]
    },
    {
      icon: Eye,
      title: "2. Bagaimana Kami Menggunakan Informasi",
      subsections: [
        {
          subtitle: "Penyediaan Layanan",
          content: ["Authentication dan manage session", "Progress tracking dan sync", "Personalisasi experience berdasarkan preferensi", "Menyimpan anotasi Anda (bookmark, highlight, notes)", "Menampilkan review, komentar, dan rating Anda"]
        },
        {
          subtitle: "Analytics & Improvement",
          content: ["Platform analytics untuk memahami usage patterns", "Reading analytics untuk memberikan insights", "A/B testing untuk optimize experience", "Bug detection dan performance monitoring"]
        },
        {
          subtitle: "Personalization & Recommendations",
          content: ["Book recommendations berdasarkan reading history", "Identify genre favorit untuk better recommendations", "Analyze waktu favorit, pace, dll untuk insights", "Personalize homepage dan notifications"]
        }
      ]
    },
    {
      icon: UserCheck,
      title: "3. Bagaimana Kami Berbagi Informasi",
      subsections: [
        {
          subtitle: "Kami TIDAK Menjual Data Anda",
          content: ["Kami TIDAK PERNAH menjual data pribadi Anda ke pihak ketiga untuk tujuan marketing atau advertising."]
        },
        {
          subtitle: "Service Providers",
          content: ["Kami share data dengan service providers yang membantu operate platform: Cloudinary (image storage), Email Service (transactional emails), Analytics Tools (anonymous), Hosting Provider (infrastructure)", "Service providers ini hanya akses data yang necessary, terikat contractual obligations untuk protect data, dan tidak boleh use data untuk purposes lain."]
        },
        {
          subtitle: "Analytics untuk Penulis",
          content: ["Aggregated Data: Provide anonymous analytics ke authors", "PENTING: Individual reader data TIDAK PERNAH dibagikan ke authors. Semua analytics bersifat aggregated dan anonymous."]
        }
      ]
    },
    {
      icon: Lock,
      title: "4. Keamanan Data",
      subsections: [
        {
          subtitle: "Measures Keamanan",
          content: ["Encryption: SSL/TLS untuk data in transit, Bcrypt hashing untuk passwords", "Access Controls: Role-based access control (RBAC), Principle of least privilege, Multi-factor authentication untuk admin", "Infrastructure Security: Regular security audits, Penetration testing, Vulnerability scanning, Firewall dan intrusion detection"]
        },
        {
          subtitle: "Data Retention",
          content: ["Active Accounts: Data retained selama akun aktif", "Inactive Accounts: Accounts inactive >2 tahun dapat di-archive dengan notice", "Deleted Accounts: Data dihapus dalam 30 hari, backup data dihapus dalam 90 hari"]
        },
        {
          subtitle: "Data Breaches",
          content: ["Jika terjadi data breach: notify affected users dalam 72 jam, notify authorities jika required by law, provide information tentang breach dan remediation steps"]
        }
      ]
    },
    {
      icon: Shield,
      title: "5. Hak Anda",
      subsections: [
        {
          subtitle: "Right to Access",
          content: ["Anda berhak request copy dari data pribadi. Email ke privacy@masasilam.com dengan subject 'Data Access Request'. Response dalam 30 hari."]
        },
        {
          subtitle: "Right to Rectification",
          content: ["Anda berhak correct data yang inaccurate atau incomplete. Update via settings di Profile atau email ke privacy@masasilam.com"]
        },
        {
          subtitle: "Right to Erasure (Right to be Forgotten)",
          content: ["Anda berhak request deletion data pribadi. Email ke privacy@masasilam.com dengan subject 'Account Deletion Request'. Some data retained untuk legal compliance."]
        },
        {
          subtitle: "Right to Data Portability",
          content: ["Anda berhak receive data dalam machine-readable format. Gunakan 'Export My Data' di Settings atau email ke privacy@masasilam.com"]
        },
        {
          subtitle: "Right to Object",
          content: ["Anda berhak object to processing untuk direct marketing. Unsubscribe via link di emails atau toggle di Settings > Notifications."]
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full mb-4 sm:mb-6">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
            Kebijakan Privasi
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
            Terakhir diperbarui: 1 Desember 2024
          </p>
          <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg px-4 sm:px-6 py-3 sm:py-4">
            <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-left">
              Privasi dan keamanan Anda adalah prioritas tertinggi kami
            </p>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="bg-gradient-to-r from-primary to-amber-600 p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-2xl font-bold text-white">
                    {section.title}
                  </h2>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {section.subsections.map((subsection, subIndex) => (
                    <div key={subIndex}>
                      <h3 className="text-base sm:text-lg font-bold mb-3 text-gray-900 dark:text-white">
                        {subsection.subtitle}
                      </h3>
                      <ul className="space-y-2">
                        {subsection.content.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-base text-gray-700 dark:text-gray-300">
                            <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-12 sm:mt-16 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 sm:p-10 border-2 border-green-200 dark:border-green-700 shadow-2xl">
          <div className="text-center">
            <Lock className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 dark:text-green-400 mx-auto mb-4 sm:mb-6" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
              Kontak Privacy Officer
            </h2>
            <p className="text-sm sm:text-lg text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Untuk pertanyaan tentang Kebijakan Privasi atau exercise rights Anda
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a
                href="mailto:privacy@masasilam.com"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all hover:shadow-lg text-sm sm:text-base"
              >
                🔒 privacy@masasilam.com
              </a>
              <a
                href="mailto:support@masasilam.com"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-all hover:shadow-lg text-sm sm:text-base"
              >
                💬 support@masasilam.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4 sm:p-6">
          <h3 className="font-bold text-base sm:text-lg mb-3 text-gray-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            Consent
          </h3>
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Dengan menggunakan Platform, Anda consent to: Collection, use, dan processing data sesuai Kebijakan ini, Transfer data sesuai ketentuan, Use cookies. Anda dapat withdraw consent kapan saja dengan contact kami atau delete akun.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage