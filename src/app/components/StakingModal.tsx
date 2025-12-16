'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, TrendingUp, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface StakingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  currency: string // Какую валюту стейкаем
}

export default function StakingModal({ isOpen, onClose, onSuccess, currency }: StakingModalProps) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Динамический APY в зависимости от валюты (хардкод логики)
  const apy = currency === 'USD' ? 12 : currency === 'ETH' ? 4.5 : currency === 'BTC' ? 3.2 : 5
  
  // Расчет годового дохода
  const estimatedYearly = amount ? (Number(amount) * (apy / 100)).toFixed(4) : '0.00'

  const handleStake = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.rpc('create_stake', {
        currency_code: currency,
        stake_amount: Number(amount),
        apy_rate: apy
      })
      if (error) throw error
      onSuccess()
      onClose()
      setAmount('')
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div onClick={onClose} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
          <motion.div initial={{scale:0.9, y: 20}} animate={{scale:1, y: 0}} exit={{scale:0.9, y: 20}} className="fixed inset-0 m-auto w-full max-w-sm h-fit z-50 glass-panel p-0 rounded-3xl bg-[#0a0a0a] overflow-hidden border border-white/10 shadow-2xl shadow-primary/10">
            
            {/* Header с градиентом */}
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-6 pb-8 text-center relative">
               <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white"><X size={20}/></button>
               <div className="w-16 h-16 bg-black/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 backdrop-blur-md">
                 <Lock size={32} className="text-primary" />
               </div>
               <h2 className="text-xl font-bold text-white">Stake {currency}</h2>
               <p className="text-primary font-mono font-medium mt-1">Earn up to {apy}% APY</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><ShieldCheck size={12}/> Security</div>
                    <div className="text-sm font-semibold text-green-400">Audited</div>
                 </div>
                 <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><TrendingUp size={12}/> Yield</div>
                    <div className="text-sm font-semibold text-white">Daily Payout</div>
                 </div>
              </div>

              {/* Input */}
              <div>
                <label className="text-xs text-gray-500 ml-1 mb-1 block">Amount to lock</label>
                <div className="relative">
                   <input 
  type="number" 
  value={amount}
  onChange={e => setAmount(e.target.value)}
  // 👇 Добавили классы в начало строки
  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-primary/50 text-white font-mono text-lg"
  placeholder="0.00"
/>
                   <span className="absolute right-4 top-4 text-gray-400 font-bold text-sm">{currency}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-right">
                  Est. Yearly Return: <span className="text-success">+{estimatedYearly} {currency}</span>
                </p>
              </div>

              <button 
                onClick={handleStake} 
                disabled={loading || !amount}
                className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {loading ? 'Locking Assets...' : 'Confirm Staking'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}