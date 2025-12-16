'use client'

import { useState } from 'react'
import { login, signup } from '../auth/actions'
import { motion } from 'framer-motion'
import { Fingerprint, ArrowRight, Lock, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('') // <--- Состояние для ошибок

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setErrorMsg('') // Очищаем старые ошибки
    
    try {
      let result;
      if (isLogin) {
        result = await login(formData)
      } else {
        result = await signup(formData)
      }

      // Если сервер вернул объект с ошибкой, показываем её
      if (result?.error) {
        setErrorMsg(result.error)
      }
      // Если успеха (редирект), Next.js сам перекинет нас, ничего делать не надо
    } catch (e) {
      setErrorMsg('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    // Добавили CSS паттерн, который мы чинили ранее
    <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
      
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-panel p-8 rounded-3xl relative z-10"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tighter">
            NovaFi<span className="text-primary">.ID</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">Secure Gateway Access</p>
        </div>

        {/* Блок вывода ошибки */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="group relative">
               <input name="fullName" type="text" placeholder=" " required 
                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-all peer text-white" />
               <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs pointer-events-none">Full Name</label>
            </div>
          )}
          
          <div className="group relative">
            <input name="email" type="email" placeholder=" " required 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-all peer text-white" />
            <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs pointer-events-none">Email Identity</label>
          </div>

          <div className="group relative">
            <input name="password" type="password" placeholder=" " required minLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-all peer text-white" />
             <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs pointer-events-none">Passkey</label>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-3.5 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Authenticate' : 'Initialize Account')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-xs text-gray-500 uppercase">Or via Biometrics</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        <button className="w-full py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-gray-300">
           <Fingerprint size={20} className="text-primary" />
           <span>Use Passkey / FaceID</span>
        </button>

        <p className="mt-8 text-center text-sm text-gray-500">
          {isLogin ? "New to NovaFi? " : "Already verified? "}
          <button onClick={() => { setIsLogin(!isLogin); setErrorMsg('') }} className="text-white hover:underline ml-1">
            {isLogin ? "Create Protocol" : "Access System"}
          </button>
        </p>

        <div className="mt-6 flex justify-center text-xs text-gray-600 gap-4">
           <span className="flex items-center gap-1"><Lock size={10}/> E2E Encrypted</span>
           <span>PCI DSS Compliant</span>
        </div>
      </motion.div>
    </div>
  )
}