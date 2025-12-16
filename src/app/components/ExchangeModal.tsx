'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, RefreshCw, ArrowDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ExchangeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

// Хардкод курсов для MVP (в реале fetch api)
const RATES: Record<string, number> = {
  'USD_BTC': 0.000023, // 1 USD = 0.000023 BTC ($43k)
  'USD_ETH': 0.00043,  // 1 USD = 0.00043 ETH ($2.3k)
  'BTC_USD': 43478,
  'ETH_USD': 2300,
}

export default function ExchangeModal({ isOpen, onClose, onSuccess }: ExchangeModalProps) {
  const [amount, setAmount] = useState('')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('BTC')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Расчет получаемой суммы
  const rate = RATES[`${fromCurrency}_${toCurrency}`] || 0
  const estimatedOutput = amount ? (Number(amount) * rate).toFixed(6) : '0.00'

  const handleExchange = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.rpc('exchange_currency', {
        from_currency: fromCurrency,
        to_currency: toCurrency,
        amount: Number(amount),
        rate: rate
      })

      if (error) throw error

      onSuccess() // Обновляем данные
      onClose()
      setAmount('')
    } catch (e) {
      alert('Ошибка обмена: ' + (e as any).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div onClick={onClose} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
          <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} className="fixed inset-0 m-auto w-full max-w-sm h-fit z-50 glass-panel p-6 rounded-3xl bg-[#0a0a0a]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><RefreshCw size={20} className="text-primary"/> Exchange</h2>
              <button onClick={onClose}><X size={20} className="text-gray-400"/></button>
            </div>

            <div className="space-y-4">
              {/* FROM */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex justify-between mb-2">
                   <span className="text-xs text-gray-400">You pay</span>
                   <span className="text-xs text-gray-400">Balance: --</span>
                </div>
                <div className="flex justify-between items-center">
                   <input 
  type="number" 
  value={amount} 
  onChange={e => setAmount(e.target.value)} 
  placeholder="0" 
  // 👇 Те же классы
  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-transparent text-2xl font-mono w-full outline-none" 
/>
                   <span className="font-bold text-primary">USD</span>
                </div>
              </div>

              <div className="flex justify-center -my-2 relative z-10">
                <div className="bg-background border border-white/20 p-2 rounded-full">
                  <ArrowDown size={16} />
                </div>
              </div>

              {/* TO */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex justify-between mb-2">
                   <span className="text-xs text-gray-400">You receive</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-2xl font-mono text-gray-300">{estimatedOutput}</span>
                   <select 
                     value={toCurrency} 
                     onChange={e => setToCurrency(e.target.value)}
                     className="bg-black border border-white/20 rounded-lg px-2 py-1 outline-none font-bold"
                   >
                     <option value="BTC">BTC</option>
                     <option value="ETH">ETH</option>
                   </select>
                </div>
              </div>

              <button onClick={handleExchange} disabled={loading} className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:bg-primary/90 mt-4">
                {loading ? 'Swapping...' : 'Confirm Exchange'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}