// ============================================
// src/pages/PrivacyPolicyPage.jsx
// ============================================

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-5xl font-bold mb-6">Kebijakan Privasi</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Terakhir diperbarui: 1 Desember 2024
        </p>

        <div className="prose dark:prose-invert max-w-none">
          <h2>1. Informasi yang Kami Kumpulkan</h2>
          <p>
            Kami mengumpulkan informasi yang Anda berikan saat mendaftar, seperti nama, email, dan preferensi membaca.
          </p>

          <h2>2. Penggunaan Informasi</h2>
          <p>
            Informasi Anda digunakan untuk meningkatkan layanan, memberikan rekomendasi personal, dan berkomunikasi dengan Anda.
          </p>

          <h2>3. Keamanan Data</h2>
          <p>
            Kami menggunakan enkripsi dan praktik keamanan standar industri untuk melindungi data Anda.
          </p>

          <h2>4. Cookies</h2>
          <p>
            Kami menggunakan cookies untuk meningkatkan pengalaman browsing Anda dan menyimpan preferensi.
          </p>

          <h2>5. Hak Anda</h2>
          <p>
            Anda memiliki hak untuk mengakses, mengubah, atau menghapus data pribadi Anda kapan saja.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage