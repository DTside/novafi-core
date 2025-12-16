'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function TransferModal({ isOpen, onClose, onSuccess }: TransferModalProps) {
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const supabase = createClient()

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Убрали локальные стейты status/message, будем юзать toast

    try {
      const { error } = await supabase.rpc('p2p_transfer', {
        recipient_email: email,
        amount: Number(amount),
        currency_type: 'USD'
      })

      if (error) throw error

      // УСПЕХ
      toast.success('Transfer Successful', {
        description: `$${amount} sent to ${email}`
      })

      onSuccess()
      onClose()
      setEmail('')
      setAmount('')

    } catch (err: any) {
      // ОШИБКА (включая Anti-Fraud)
      toast.error('Transaction Failed', {
        description: err.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-md h-fit z-50"
          >
            <div className="glass-panel p-6 rounded-3xl m-4 relative border border-white/10 bg-[#0a0a0a]">
              <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                <Send size={18} className="text-primary" /> P2P Transfer
              </h2>
              <p className="text-gray-400 text-sm mb-6">Instant transfer to any NovaFi user.</p>

              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center py-8 text-success animate-pulse">
                  <CheckCircle size={48} className="mb-4" />
                  <p className="font-semibold">{message}</p>
                </div>
              ) : (
                <form onSubmit={handleTransfer} className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 ml-1">Recipient Email</label>
                    <input 
                      type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="user@novafi.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 outline-none focus:border-primary/50 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 ml-1">Amount (USD)</label>
                    <input 
                      type="number" required min="1" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 outline-none focus:border-primary/50 text-white text-lg font-mono"
                    />
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-2 text-danger text-sm bg-danger/10 p-3 rounded-lg border border-danger/20">
                      <AlertCircle size={16} /> {message}
                    </div>
                  )}

                  <button 
                    disabled={loading}
                    className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:bg-primary/90 transition-all mt-4 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Send Funds'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}