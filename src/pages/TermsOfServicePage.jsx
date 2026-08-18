import { Shield, FileText, AlertCircle, Heart, BookOpen, Users, CheckCircle2, Zap, Lock, Globe } from 'lucide-react'
import SEO from '../components/Common/SEO'

// ─── Section card ─────────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, accent, children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-stone-200 dark:border-slate-800 overflow-hidden">
    <div className={`flex items-center gap-4 px-7 sm:px-8 py-5 sm:py-6 ${accent.header}`}>
      <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-white" aria-hidden="true" />
      </div>
      <h2 className="font-serif text-lg sm:text-xl font-bold text-white">{title}</h2>
    </div>
    <div className="p-7 sm:p-8">{children}</div>
  </div>
)

const ItemList = ({ items, variant = 'check' }) => (
  <ul className="space-y-2.5">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-stone-600 dark:text-slate-400">
        {variant === 'check'
          ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
          : <span className="text-amber-500 font-bold flex-shrink-0 mt-0.5" aria-hidden="true">•</span>
        }
        <span>{item}</span>
      </li>
    ))}
  </ul>
)

const SubHead = ({ children }) => (
  <h3 className="font-semibold text-stone-800 dark:text-slate-200 text-sm mb-3 mt-5 first:mt-0">{children}</h3>
)

const sections = [
  {
    icon: Heart,
    title: '1. Filosofi Platform',
    accent: { header: 'bg-gradient-to-r from-rose-600 to-rose-700 dark:from-rose-700 dark:to-rose-800' },
    content: (
      <ItemList items={[
        'Semua konten di platform ini adalah karya domain publik atau berlisensi terbuka (Creative Commons, dll.)',
        'Platform ini bebas diakses dan digunakan untuk tujuan apapun — pribadi maupun komersial',
        'Setiap pengguna dapat berkontribusi dalam pelestarian dan distribusi pengetahuan',
      ]} />
    ),
  },
  {
    icon: Users,
    title: '2. Akun & Kontribusi',
    accent: { header: 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800' },
    content: (
      <>
        <ItemList items={[
          'Pendaftaran terbuka untuk semua usia (anak di bawah 13 tahun disarankan dengan pengawasan orang tua)',
          'Anda dapat menggunakan nama asli atau pseudonim sesuai preferensi',
        ]} />
        <SubHead>Setiap akun dapat:</SubHead>
        <ItemList variant="dot" items={[
          'Membaca seluruh koleksi tanpa batas',
          'Mengunduh buku untuk keperluan pribadi maupun distribusi',
          'Berkontribusi dengan menambahkan buku domain publik',
          'Melakukan koreksi dan perbaikan teks buku',
          'Membuat anotasi dan terjemahan',
        ]} />
      </>
    ),
  },
  {
    icon: BookOpen,
    title: '3. Penggunaan Platform',
    accent: { header: 'bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800' },
    content: (
      <>
        <SubHead>Anda BEBAS untuk:</SubHead>
        <ItemList items={[
          'Mengakses, membaca, dan mengunduh semua konten tanpa batasan',
          'Membagikan, menyalin, dan mendistribusikan kembali konten',
          'Memodifikasi, menerjemahkan, atau membuat turunan dari karya domain publik',
          'Menggunakan platform untuk tujuan komersial maupun non-komersial',
          'Mengotomatisasi akses melalui API (tersedia untuk umum)',
        ]} />
        <SubHead>Dengan semangat komunitas, kami harap Anda:</SubHead>
        <ItemList variant="dot" items={[
          'Menghormati kontribusi pengguna lain',
          'Melaporkan kesalahan atau masalah teknis yang ditemukan',
          'Berkontribusi kembali ke komunitas jika memungkinkan',
        ]} />
      </>
    ),
  },
  {
    icon: Zap,
    title: '4. Kontribusi Pengguna',
    accent: { header: 'bg-gradient-to-r from-violet-600 to-violet-700 dark:from-violet-700 dark:to-violet-800' },
    content: (
      <ItemList items={[
        'Dengan berkontribusi, Anda setuju melepaskan kontribusi ke domain publik (kecuali ditentukan lain)',
        'Pastikan kontribusi Anda bebas hak cipta atau Anda memiliki hak untuk membagikannya',
        'Konten yang dilarang: materi ilegal (sesuai hukum setempat), konten kebencian, spam berlebihan',
        'Platform mengadopsi prinsip "asumsi baik" — kami percaya setiap kontribusi diberikan dengan niat baik',
      ]} />
    ),
  },
  {
    icon: Shield,
    title: '5. Hak Kekayaan Intelektual',
    accent: { header: 'bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700' },
    content: (
      <ItemList items={[
        'TIDAK ADA klaim hak kekayaan intelektual atas karya domain publik di platform ini',
        'Platform hanya menyediakan akses dan infrastruktur, bukan mengklaim kepemilikan karya',
        'Kode platform tersedia sebagai open source di bawah lisensi MIT',
        'Logo dan merek MasasilaM dilindungi untuk menjaga identitas komunitas',
      ]} />
    ),
  },
  {
    icon: Lock,
    title: '6. Privasi & Data',
    accent: { header: 'bg-gradient-to-r from-cyan-600 to-cyan-700 dark:from-cyan-700 dark:to-cyan-800' },
    content: (
      <>
        <SubHead>Kami mengumpulkan minimal data:</SubHead>
        <ItemList variant="dot" items={[
          'Informasi akun yang Anda berikan secara sukarela',
          'Data membaca untuk rekomendasi dan progress tracking',
          'Kontribusi Anda untuk dokumentasi dan arsip komunitas',
        ]} />
        <SubHead>Prinsip kami:</SubHead>
        <ItemList items={[
          'Data tidak dijual kepada pihak ketiga dalam bentuk apapun',
          'Anda dapat menghapus akun kapan saja dengan mudah',
          'Data kontribusi tetap menjadi bagian arsip publik komunitas',
          'Enkripsi digunakan untuk keamanan, bukan pembatasan akses',
        ]} />
      </>
    ),
  },
  {
    icon: AlertCircle,
    title: '7. Batas Tanggung Jawab',
    accent: { header: 'bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700' },
    content: (
      <ItemList items={[
        'Platform disediakan "sebagaimana adanya" tanpa jaminan tertulis',
        'Tidak ada jaminan ketersediaan layanan 100% sepanjang waktu',
        'Komunitas bertanggung jawab bersama untuk menjaga kualitas platform',
        'Kontributor bertanggung jawab penuh atas kontribusinya sendiri',
      ]} />
    ),
  },
  {
    icon: Globe,
    title: '8. Penyelesaian Sengketa',
    accent: { header: 'bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800' },
    content: (
      <ItemList items={[
        'Penyelesaian berdasarkan prinsip gotong royong dan musyawarah',
        'Konflik diselesaikan melalui diskusi komunitas yang terbuka',
        'Jika diperlukan, hukum Republik Indonesia berlaku sebagai acuan',
      ]} />
    ),
  },
  {
    icon: BookOpen,
    title: '9. Kelangsungan Platform',
    accent: { header: 'bg-gradient-to-r from-pink-600 to-pink-700 dark:from-pink-700 dark:to-pink-800' },
    content: (
      <ItemList items={[
        'Anda dapat menghapus akun kapan saja tanpa alasan',
        'Kontribusi Anda tetap menjadi bagian arsip publik komunitas yang berharga',
        'Platform dapat berkembang atau berubah sesuai kebutuhan dan masukan komunitas',
      ]} />
    ),
  },
]

const TermsOfServicePage = () => (
  <>
    <SEO
      title="Syarat & Ketentuan — MasasilaM"
      description="Baca syarat dan ketentuan penggunaan MasasilaM. Platform perpustakaan digital untuk karya domain publik dengan prinsip kebebasan dan komunitas."
      url="/syarat-ketentuan"
      type="website"
      keywords="syarat ketentuan, terms of service, aturan, kebijakan, masasilam"
    />

    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 transition-colors duration-300 motion-reduce:transition-none flex flex-col">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-950 border-b border-stone-200 dark:border-slate-800 py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden">
          <div className="w-[600px] h-[400px] rounded-full bg-amber-100/50 dark:bg-amber-900/10 blur-3xl -translate-y-1/2" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-400 opacity-60 dark:opacity-80" />

        <div className="relative container mx-auto px-4 sm:px-6 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-full mb-6 border border-amber-200 dark:border-amber-800/40">
            <FileText className="w-3.5 h-3.5" aria-hidden="true" /> Legal
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-stone-900 dark:text-white mb-5">
            Syarat & Ketentuan
          </h1>
          <p className="text-base sm:text-xl text-stone-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Dengan menggunakan MasasilaM, Anda bergabung dalam komunitas yang mendedikasikan diri untuk kebebasan pengetahuan.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">

        {/* ── PRINSIP DASAR ─────────────────────────────────────── */}
        <section className="mt-10 sm:mt-14">
          <div className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900 border border-amber-200 dark:border-amber-800/40 rounded-3xl p-7 sm:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
                Prinsip Dasar MasasilaM
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: BookOpen, title: 'Kebebasan Akses',        desc: 'Semua konten bersifat domain publik atau berlisensi terbuka', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' },
                { icon: Users,    title: 'Kebebasan Berkontribusi', desc: 'Platform terbuka untuk semua kalangan tanpa diskriminasi',     color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' },
                { icon: Globe,    title: 'Kebebasan Berbagi',       desc: 'Pengetahuan adalah milik bersama — bebas disebarluaskan',    color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' },
              ].map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className="flex flex-col items-center text-center gap-3 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-800">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className={`font-semibold text-sm mb-1 ${color.split(' ').slice(0, 2).join(' ')}`}>{title}</p>
                    <p className="text-xs text-stone-400 dark:text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTIONS ─────────────────────────────────────────── */}
        <section className="mt-6 space-y-4 sm:space-y-5">
          {sections.map((s, i) => (
            <Section key={i} icon={s.icon} title={s.title} accent={s.accent}>
              {s.content}
            </Section>
          ))}
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section className="mt-8 mb-16">
          <div className="bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden text-center">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <Heart className="w-12 h-12 text-rose-500 dark:text-rose-400 fill-rose-500/30 dark:fill-rose-400/30 mx-auto mb-5" aria-hidden="true" />
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 dark:text-white mb-4">
                Bergabunglah dalam Gerakan
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed mb-6 max-w-lg mx-auto">
                MasasilaM bukan sekadar platform — ini adalah gerakan untuk menyelamatkan karya terdegradasi, mendemokratisasikan akses pengetahuan, dan membangun warisan digital bersama.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/buku"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-stone-900 rounded-full font-semibold text-sm transition-all motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-amber-400/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100 dark:focus-visible:ring-offset-slate-900"
                >
                  <BookOpen className="w-4 h-4" aria-hidden="true" /> Mulai Membaca
                </a>
                <a
                  href="mailto:info@masa-silam.com"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-stone-900/5 hover:bg-stone-900/10 dark:bg-white/10 dark:hover:bg-white/15 border border-stone-300 dark:border-white/20 text-stone-900 dark:text-white rounded-full font-semibold text-sm transition-all motion-reduce:transition-none hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 dark:focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100 dark:focus-visible:ring-offset-slate-900"
                >
                  Hubungi Kami
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </>
)

export default TermsOfServicePage