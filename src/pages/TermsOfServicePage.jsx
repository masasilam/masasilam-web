// ============================================
// src/pages/TermsOfServicePage.jsx
// ============================================

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-5xl font-bold mb-6">Syarat & Ketentuan</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Terakhir diperbarui: 1 Desember 2024
        </p>

        <div className="prose dark:prose-invert max-w-none">
          <h2>1. Penerimaan Syarat</h2>
          <p>
            Dengan menggunakan MasasilaM, Anda setuju untuk terikat dengan syarat dan ketentuan ini.
          </p>

          <h2>2. Penggunaan Layanan</h2>
          <p>
            Layanan MasasilaM disediakan gratis untuk penggunaan personal dan non-komersial.
          </p>

          <h2>3. Hak Cipta</h2>
          <p>
            Semua buku di MasasilaM  telah melewati masa berlaku hak cipta atau memiliki lisensi distribusi gratis.
          </p>

          <h2>4. Akun Pengguna</h2>
          <p>
            Anda bertanggung jawab untuk menjaga keamanan akun dan password Anda.
          </p>

          <h2>5. Larangan</h2>
          <p>
            Dilarang menggunakan layanan untuk tujuan ilegal atau melanggar hak orang lain.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TermsOfServicePage