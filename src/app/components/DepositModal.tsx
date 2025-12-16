'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Wallet, CheckCircle, Loader2, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ethers } from 'ethers'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function DepositModal({ isOpen, onClose, onSuccess }: DepositModalProps) {
  const [activeTab, setActiveTab] = useState<'fiat' | 'crypto'>('fiat')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Состояние для карт
  const [savedCards, setSavedCards] = useState<any[]>([])
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [cardsLoading, setCardsLoading] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  // Загружаем карты при открытии окна
  useEffect(() => {
    if (isOpen && activeTab === 'fiat') {
      fetchCards()
    }
  }, [isOpen, activeTab])

  const fetchCards = async () => {
    setCardsLoading(true)
    const { data } = await supabase.from('payment_cards').select('*').order('created_at', { ascending: false })
    if (data && data.length > 0) {
      setSavedCards(data)
      setSelectedCardId(data[0].id) // Выбираем первую карту по умолчанию
    }
    setCardsLoading(false)
  }

  // --- ЛОГИКА 1: FIAT (С использованием выбранной карты) ---
  const handleFiatDeposit = async () => {
    if (!selectedCardId && savedCards.length > 0) return
    if (savedCards.length === 0) {
      toast.error('No cards found', { description: 'Please link a card in Settings first' })
      return
    }

    setLoading(true)
    // Находим данные выбранной карты для красивого уведомления
    const card = savedCards.find(c => c.id === selectedCardId)
    
    // Имитация задержки банка
    await new Promise(r => setTimeout(r, 2000))
    
    try {
      const { error } = await supabase.rpc('deposit_funds', {
        currency_code: 'USD',
        amount: Number(amount),
        payment_method: `card_${card?.brand}_${card?.last4}`
      })
      if (error) throw error

      toast.success('Deposit Successful', { description: `$${amount} charged from ${card?.brand.toUpperCase()} •• ${card?.last4}` })
      onSuccess()
      onClose()
      setAmount('')
    } catch (e: any) {
      toast.error('Deposit Failed', { description: e.message })
    } finally {
      setLoading(false)
    }
  }

  // --- ЛОГИКА 2: CRYPTO (Real MetaMask) ---
  const handleCryptoDeposit = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask not found')
      return
    }
    setLoading(true)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      const tx = await signer.sendTransaction({
        to: await signer.getAddress(), 
        value: ethers.parseEther(amount || '0')
      })

      toast.info('Transaction Sent', { description: 'Waiting for blockchain confirmation...' })
      await tx.wait()

      const { error } = await supabase.rpc('deposit_funds', {
        currency_code: 'ETH',
        amount: Number(amount),
        payment_method: `web3_tx_${tx.hash.slice(0,6)}`
      })
      if (error) throw error

      toast.success('Crypto Deposit Confirmed', { description: `${amount} ETH received` })
      onSuccess()
      onClose()
      setAmount('')
    } catch (e: any) {
      console.error(e)
      toast.error('Transaction Failed', { description: 'User rejected or network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div onClick={onClose} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
          <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} className="fixed inset-0 m-auto w-full max-w-md h-fit z-50 glass-panel p-0 rounded-3xl bg-[#0a0a0a] border border-white/10 overflow-hidden">
            
            {/* Header Tabs */}
            <div className="flex border-b border-white/10">
              <button 
                onClick={() => setActiveTab('fiat')}
                className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'fiat' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
              >
                <CreditCard size={16}/> Fiat Card
              </button>
              <button 
                onClick={() => setActiveTab('crypto')}
                className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'crypto' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
              >
                <Wallet size={16}/> Crypto Web3
              </button>
            </div>

            <div className="p-6 relative">
               <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={20}/></button>
               
               <div className="mb-6 text-center">
                 <h2 className="text-xl font-bold mb-1">Top Up Balance</h2>
                 <p className="text-xs text-gray-400">
                   {activeTab === 'fiat' ? 'Instant processing via Stripe' : 'Deposit ETH via Ethereum Network'}
                 </p>
               </div>

               <div className="space-y-4">
                 <div>
                   <label className="text-xs text-gray-500 ml-1">Amount</label>
                   <div className="relative mt-1">
                     <input 
                       type="number" 
                       value={amount}
                       onChange={e => setAmount(e.target.value)}
                       placeholder="0.00"
                       className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-white font-mono text-lg"
                     />
                     <span className="absolute right-4 top-3.5 text-gray-400 font-bold text-sm">
                       {activeTab === 'fiat' ? 'USD' : 'ETH'}
                     </span>
                   </div>
                 </div>

                 {/* ВЫБОР КАРТЫ (FIAT) */}
                 {activeTab === 'fiat' && (
                   <div className="space-y-2">
                     <label className="text-xs text-gray-500 ml-1">Payment Method</label>
                     
                     {cardsLoading ? (
                        <div className="text-center py-4 text-xs text-gray-500">Loading cards...</div>
                     ) : savedCards.length === 0 ? (
                        <button 
                          onClick={() => { onClose(); router.push('/settings'); }}
                          className="w-full py-3 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:border-primary/50 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                          <Plus size={16} /> Link a Card in Settings
                        </button>
                     ) : (
                        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                          {savedCards.map(card => (
                            <button
                              key={card.id}
                              onClick={() => setSelectedCardId(card.id)}
                              className={`w-full p-3 border rounded-xl flex items-center gap-3 transition-all ${selectedCardId === card.id ? 'bg-primary/10 border-primary text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                            >
                               <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center text-[8px] font-bold uppercase">
                                 {card.brand}
                               </div>
                               <div className="flex-1 text-left">
                                 <div className="text-xs font-mono">•••• {card.last4}</div>
                               </div>
                               {selectedCardId === card.id && <CheckCircle size={16} className="text-primary"/>}
                            </button>
                          ))}
                          
                          <button 
                            onClick={() => { onClose(); router.push('/settings'); }}
                            className="w-full py-2 text-xs text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-1"
                          >
                            <Plus size={12}/> Link another card
                          </button>
                        </div>
                     )}
                   </div>
                 )}

                 {/* Metamask Hint */}
                 {activeTab === 'crypto' && (
                   <div className="p-3 border border-primary/20 bg-primary/5 rounded-xl text-xs text-primary/80">
                      Ensure your wallet is connected to Sepolia or Mainnet.
                   </div>
                 )}

                 <button 
                   onClick={activeTab === 'fiat' ? handleFiatDeposit : handleCryptoDeposit}
                   disabled={loading || !amount || (activeTab === 'fiat' && !selectedCardId)}
                   className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                 >
                   {loading ? <Loader2 size={20} className="animate-spin"/> : 'Confirm Deposit'}
                 </button>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}