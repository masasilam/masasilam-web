// ============================================
// FILE 1: src/components/Reader/LoginPromptModal.jsx
// ============================================
import { X } from 'lucide-react'

const LoginPromptModal = ({ icon: Icon, title, description, onClose, onLogin, onRegister }) => (
  <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in duration-200">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        <X className="w-5 h-5" />
      </button>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      <div className="space-y-3">
        <button onClick={onLogin} className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
          <Icon className="w-5 h-5" />
          Masuk untuk Menggunakan Fitur
        </button>
        <button onClick={onClose} className="w-full py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Nanti Saja
        </button>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Belum punya akun?{' '}
          <button onClick={onRegister} className="text-primary hover:underline font-semibold">
            Daftar gratis
          </button>
        </p>
      </div>
    </div>
  </div>
)

export default LoginPromptModal