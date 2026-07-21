import { useState } from 'react'
import { Shield, AlertTriangle, CheckCircle2, Mail, FileText, Clock, Globe, BookOpen, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import SEO from '../components/Common/SEO'

// ─── Accordion item ──────────────────────────────────────────────────────────
const AccordionItem = ({ question, answer, isOpen, onToggle, index }) => {
  const panelId = `dmca-faq-panel-${index}`
  const buttonId = `dmca-faq-button-${index}`
  return (
    <div className="border border-stone-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-200 motion-reduce:transition-none">
      <h3>
        <button
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="w-full flex items-center justify-between px-6 py-5 text-left bg-white dark:bg-slate-900 hover:bg-stone-50 dark:hover:bg-slate-800/60 transition-colors motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset"
        >
          <span className="font-semibold text-stone-800 dark:text-slate-200 text-sm sm:text-base pr-4">{question}</span>
          {isOpen
            ? <ChevronUp className="w-4 h-4 text-amber-500 flex-shrink-0" aria-hidden="true" />
            : <ChevronDown className="w-4 h-4 text-stone-400 dark:text-slate-500 flex-shrink-0" aria-hidden="true" />}
        </button>
      </h3>
      {isOpen && (
        <div id={panelId} role="region" aria-labelledby={buttonId} className="px-6 pb-5 bg-white dark:bg-slate-900 border-t border-stone-100 dark:border-slate-800">
          <p className="text-sm sm:text-base leading-relaxed text-stone-600 dark:text-slate-400 pt-4">{answer}</p>
        </div>
      )}
    </div>
  )
}

// ─── Step card ───────────────────────────────────────────────────────────────
const StepCard = ({ number, title, description, icon: Icon, accent }) => (
  <div className="relative flex gap-5">
    {/* Connector line */}
    {number < 4 && (
      <div className="absolute left-6 top-14 w-px h-[calc(100%+1.5rem)] bg-gradient-to-b from-stone-200 to-transparent dark:from-slate-700" aria-hidden="true" />
    )}
    <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm z-10 ${accent.bg}`}>
      <Icon className={`w-5 h-5 ${accent.text}`} aria-hidden="true" />
    </div>
    <div className="pb-8">
      <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${accent.text}`}>Langkah {number}</div>
      <h3 className="font-semibold text-stone-900 dark:text-slate-100 mb-1.5">{title}</h3>
      <p className="text-sm leading-relaxed text-stone-500 dark:text-slate-400">{description}</p>
    </div>
  </div>
)

const DMCAPage = () => {
  const [openFaq, setOpenFaq] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', workTitle: '', workUrl: '', infringingUrl: '', description: '', swear: false })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setSubmitted(true)
    setLoading(false)
  }

  const faqs = [
    {
      question: 'Apa itu DMCA?',
      answer: 'Digital Millennium Copyright Act (DMCA) adalah undang-undang hak cipta Amerika Serikat yang memberikan prosedur bagi pemilik hak cipta untuk meminta penghapusan konten yang melanggar hak cipta mereka dari platform online. Meskipun MasasilaM beroperasi di Indonesia, kami menghormati standar internasional perlindungan hak kekayaan intelektual.'
    },
    {
      question: 'Berapa lama proses penanganan laporan?',
      answer: 'Kami berusaha menangani setiap laporan dalam 3–5 hari kerja. Jika laporan Anda valid dan lengkap, konten akan segera diturunkan setelah verifikasi. Anda akan menerima konfirmasi via email.'
    },
    {
      question: 'Apa yang terjadi jika laporan saya terbukti tidak benar?',
      answer: 'Pengajuan DMCA yang salah atau disengaja dapat menimbulkan konsekuensi hukum. Jika Anda tidak yakin, kami sarankan berkonsultasi dengan ahli hukum terlebih dahulu. MasasilaM berhak mengabaikan laporan yang tidak memiliki dasar yang kuat.'
    },
    {
      question: 'Bagaimana jika konten saya dihapus secara keliru?',
      answer: 'Jika Anda yakin konten Anda dihapus secara tidak benar, Anda dapat mengajukan counter-notice dengan menyertakan bukti bahwa konten tersebut berada di domain publik atau Anda memiliki hak yang sah untuk menggunakannya.'
    },
    {
      question: 'Apakah semua konten di MasasilaM domain publik?',
      answer: 'MasasilaM hanya menampilkan konten yang kami yakini berada dalam domain publik atau memiliki lisensi terbuka. Namun kami menyadari kemungkinan adanya kekeliruan, dan kami berkomitmen untuk segera menangani setiap laporan yang sah.'
    }
  ]

  const steps = [
    { number: 1, icon: FileText, title: 'Siapkan Informasi', description: 'Kumpulkan informasi identitas Anda, detail karya yang dilindungi, dan URL konten yang melanggar.', accent: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' } },
    { number: 2, icon: Mail, title: 'Kirim Laporan', description: 'Isi formulir di bawah atau kirim email langsung ke info@masa-silam.com dengan semua informasi yang diperlukan.', accent: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' } },
    { number: 3, icon: Shield, title: 'Verifikasi', description: 'Tim kami akan memverifikasi laporan Anda dalam 3–5 hari kerja dan menghubungi Anda via email.', accent: { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' } },
    { number: 4, icon: CheckCircle2, title: 'Penyelesaian', description: 'Jika valid, konten akan diturunkan. Anda akan menerima konfirmasi dan informasi tindak lanjut.', accent: { text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' } }
  ]

  return (
    <>
      <SEO
        title="DMCA & Keluhan Hak Cipta — MasasilaM"
        description="Ajukan laporan pelanggaran hak cipta kepada MasasilaM. Kami menghormati hak kekayaan intelektual dan berkomitmen menangani setiap laporan dengan cepat."
        url="/dmca"
        type="website"
        keywords="DMCA, hak cipta, pelanggaran hak cipta, takedown, konten dilindungi"
      />

      <div className="min-h-screen bg-stone-50 dark:bg-slate-950 transition-colors duration-300 motion-reduce:transition-none flex flex-col">

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white dark:bg-slate-950 border-b border-stone-200 dark:border-slate-800 py-16 sm:py-24">
          {/* Ambient */}
          <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden">
            <div className="w-[600px] h-[400px] rounded-full bg-amber-100/50 dark:bg-amber-900/10 blur-3xl -translate-y-1/2" />
          </div>
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-400 opacity-60 dark:opacity-80" />

          <div className="relative container mx-auto px-4 sm:px-6 max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-full mb-6 border border-amber-200 dark:border-amber-800/40">
              <Shield className="w-3.5 h-3.5" aria-hidden="true" /> Hak Kekayaan Intelektual
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-stone-900 dark:text-white mb-5">
              DMCA & Hak Cipta
            </h1>
            <p className="text-base sm:text-xl text-stone-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
              Kami menghormati hak kekayaan intelektual dan berkomitmen untuk menangani setiap laporan pelanggaran hak cipta dengan serius dan cepat.
            </p>
            <div className="flex flex-wrap gap-3 justify-center text-xs sm:text-sm">
              {[
                { icon: Clock, label: 'Respons 3–5 hari kerja' },
                { icon: CheckCircle2, label: 'Proses transparan' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-slate-800 rounded-full text-stone-600 dark:text-slate-300">
                  <Icon className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />{label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">

          {/* ── Komitmen ──────────────────────────────────────────────── */}
          <section className="mt-14 sm:mt-20">
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: BookOpen, title: 'Domain Publik', desc: 'Seluruh koleksi diyakini berada dalam domain publik atau memiliki lisensi terbuka', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40' },
                { icon: Shield, title: 'Perlindungan Aktif', desc: 'Tim kurasi kami memverifikasi status hak cipta sebelum konten dipublikasikan', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40' },
                { icon: AlertTriangle, title: 'Penanganan Cepat', desc: 'Setiap laporan valid akan ditindaklanjuti segera dan konten bermasalah diturunkan', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40' },
              ].map(({ icon: Icon, title, desc, color, bg }) => (
                <div key={title} className={`rounded-2xl border p-6 ${bg}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${bg}`}>
                    <Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />
                  </div>
                  <h3 className={`font-bold text-sm mb-2 ${color}`}>{title}</h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-stone-600 dark:text-slate-400">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Proses ────────────────────────────────────────────────── */}
          <section className="mt-14 sm:mt-20">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3.5 py-1.5 rounded-full w-fit mb-6">
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" /> Cara Mengajukan Laporan
            </div>
            <div className="grid sm:grid-cols-2 gap-0 sm:gap-8 bg-white dark:bg-slate-900 rounded-3xl border border-stone-200 dark:border-slate-800 p-8">
              {steps.map(step => (
                <StepCard key={step.number} {...step} />
              ))}
            </div>
          </section>

          {/* ── Formulir ──────────────────────────────────────────────── */}
          <section className="mt-14 sm:mt-20" id="form-dmca">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-stone-200 dark:border-slate-800 overflow-hidden">
              {/* Header */}
              <div className="px-8 py-6 bg-stone-100 dark:bg-slate-900 border-b border-stone-200 dark:border-slate-800 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-amber-700/70 dark:text-amber-400/60 mb-0.5">Formulir Resmi</p>
                  <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">Ajukan Laporan DMCA</h2>
                </div>
              </div>

              <div className="p-8">
                {submitted ? (
                  <div className="py-12 text-center" role="status">
                    <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" aria-hidden="true" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-3">Laporan Terkirim</h3>
                    <p className="text-stone-500 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed mb-6">
                      Terima kasih telah menghubungi kami. Tim kami akan memverifikasi laporan Anda dalam <strong>3–5 hari kerja</strong> dan mengirimkan konfirmasi ke email Anda.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', workTitle: '', workUrl: '', infringingUrl: '', description: '', swear: false }) }}
                      className="text-sm text-amber-600 dark:text-amber-400 hover:underline font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
                    >
                      Kirim laporan lain
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Nama Lengkap" required>
                        <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required placeholder="Nama Anda" className={inputClass} />
                      </Field>
                      <Field label="Alamat Email" required>
                        <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required placeholder="email@example.com" className={inputClass} />
                      </Field>
                    </div>

                    <Field label="Judul Karya yang Dilindungi" required hint="Nama buku, artikel, atau karya lainnya">
                      <input type="text" value={formData.workTitle} onChange={e => setFormData(p => ({ ...p, workTitle: e.target.value }))} required placeholder="Judul karya Anda" className={inputClass} />
                    </Field>

                    <Field label="URL Karya Asli" hint="Jika tersedia — link ke karya asli Anda (opsional)">
                      <input type="url" value={formData.workUrl} onChange={e => setFormData(p => ({ ...p, workUrl: e.target.value }))} placeholder="https://..." className={inputClass} />
                    </Field>

                    <Field label="URL Konten Pelanggaran" required hint="URL halaman di MasasilaM yang Anda laporkan">
                      <input type="url" value={formData.infringingUrl} onChange={e => setFormData(p => ({ ...p, infringingUrl: e.target.value }))} required placeholder="https://masasilam.com/..." className={inputClass} />
                    </Field>

                    <Field label="Deskripsi Pelanggaran" required hint="Jelaskan mengapa konten tersebut melanggar hak cipta Anda">
                      <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} required rows={4} placeholder="Jelaskan secara rinci..." className={`${inputClass} resize-none`} />
                    </Field>

                    {/* Sumpah */}
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-5">
                      <label className="flex gap-4 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.swear}
                          onChange={e => setFormData(p => ({ ...p, swear: e.target.checked }))}
                          className="mt-1 flex-shrink-0 accent-amber-500"
                          required
                        />
                        <span className="text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-slate-300">
                          Saya dengan ini menyatakan dengan itikad baik bahwa penggunaan materi yang saya laporkan tidak diizinkan oleh pemilik hak cipta, agennya, atau hukum. Saya menyatakan bahwa informasi dalam laporan ini adalah akurat, dan saya adalah pemilik hak cipta atau berwenang untuk bertindak atas nama pemilik.
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !formData.swear}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-2xl font-semibold text-sm transition-all motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                    >
                      {loading ? (
                        <svg className="animate-spin motion-reduce:animate-none w-4 h-4" viewBox="0 0 24 24" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      ) : <Mail className="w-4 h-4" aria-hidden="true" />}
                      {loading ? 'Mengirim...' : 'Kirim Laporan DMCA'}
                    </button>

                    <p className="text-center text-xs text-stone-400 dark:text-slate-500">
                      Atau kirim langsung ke{' '}
                      <a href="mailto:info@masa-silam.com" className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
                        info@masa-silam.com
                      </a>
                    </p>
                  </form>
                )}
              </div>
            </div>
          </section>

          {/* ── FAQ ───────────────────────────────────────────────────── */}
          <section className="mt-14 sm:mt-20">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3.5 py-1.5 rounded-full w-fit mb-6">
              FAQ
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              Pertanyaan Umum tentang DMCA
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  index={i}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          </section>

          {/* ── Counter Notice ────────────────────────────────────────── */}
          <section className="mt-14 sm:mt-20 mb-16">
            <div className="bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 relative overflow-hidden">
              <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-700/70 dark:text-amber-400/70 mb-4">
                  <Shield className="w-3.5 h-3.5" aria-hidden="true" /> Counter Notice
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-4">
                  Konten Anda Dihapus Secara Keliru?
                </h2>
                <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
                  Jika Anda percaya konten Anda dihapus karena kesalahan — misalnya karena karya Anda benar-benar berada dalam domain publik atau Anda memiliki lisensi yang sah — Anda dapat mengajukan <strong className="text-amber-600 dark:text-amber-400">counter-notice</strong> dengan menyertakan bukti hak Anda atas konten tersebut.
                </p>
                <a
                  href="mailto:info@masa-silam.com?subject=Counter-Notice DMCA"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-stone-900 rounded-full font-semibold text-sm transition-all motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-400/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100 dark:focus-visible:ring-offset-slate-900"
                >
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  Ajukan Counter-Notice
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

// ─── Helper components ───────────────────────────────────────────────────────
const inputClass = `w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700
  text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500
  focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all motion-reduce:transition-none text-sm`

const Field = ({ label, required, hint, children }) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400 mb-2">
      {label}{required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
    </label>
    {children}
    {hint && <p className="text-[11px] text-stone-400 dark:text-slate-500 mt-1.5">{hint}</p>}
  </div>
)

export default DMCAPage