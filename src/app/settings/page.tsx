'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, CreditCard, Plus, Trash2, Shield, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingCard, setIsAddingCard] = useState(false)
  
  // Данные новой карты (форма)
  const [newCard, setNewCard] = useState({ number: '', exp: '', cvc: '' })
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Загружаем карты
      const { data: cardsData } = await supabase
        .from('payment_cards')
        .select('*')
        .order('created_at', { ascending: false })
      
      setCards(cardsData || [])
      setLoading(false)
    }
    getData()
  }, [router, supabase])

  // Имитация добавления карты
  const handleAddCard = async () => {
    if (newCard.number.length < 16 || !newCard.exp) {
      toast.error('Invalid card details')
      return
    }

    // Определяем бренд по первой цифре (упрощенно)
    const brand = newCard.number.startsWith('4') ? 'visa' : 'mastercard'
    const last4 = newCard.number.slice(-4)

    const { error } = await supabase.from('payment_cards').insert({
      user_id: user.id,
      brand,
      last4,
      exp_month: Number(newCard.exp.split('/')[0]),
      exp_year: Number(newCard.exp.split('/')[1])
    })

    if (error) {
      toast.error('Failed to save card')
    } else {
      toast.success('Card Linked Successfully')
      setIsAddingCard(false)
      setNewCard({ number: '', exp: '', cvc: '' })
      // Перезагрузка списка
      const { data } = await supabase.from('payment_cards').select('*')
      setCards(data || [])
    }
  }

  const handleDeleteCard = async (id: string) => {
    const { error } = await supabase.from('payment_cards').delete().eq('id', id)
    if (!error) {
      setCards(prev => prev.filter(c => c.id !== id))
      toast.success('Card removed')
    }
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center">Loading Profile...</div>

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 text-white">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/')} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Account Settings</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Profile Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="col-span-1 glass-panel p-6 rounded-2xl h-fit">
             <div className="flex flex-col items-center text-center">
               <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-4xl font-bold text-black mb-4">
                 {user?.user_metadata?.full_name?.charAt(0) || 'U'}
               </div>
               <h2 className="text-xl font-bold">{user?.user_metadata?.full_name}</h2>
               <p className="text-sm text-gray-400 mb-6">{user?.email}</p>
               
               <div className="w-full p-3 bg-white/5 rounded-xl flex items-center gap-3 text-left border border-white/5">
                 <Shield className="text-green-500" size={20} />
                 <div>
                   <div className="text-sm font-bold text-white">Identity Verified</div>
                   <div className="text-xs text-gray-500">Tier 2 Access</div>
                 </div>
               </div>
             </div>
          </motion.div>

          {/* 2. Payment Methods */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="col-span-1 md:col-span-2 glass-panel p-6 rounded-2xl">
             <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
               <CreditCard className="text-primary" size={20}/> Payment Methods
             </h2>

             {/* Cards List */}
             <div className="space-y-4 mb-6">
               {cards.length === 0 && !isAddingCard && (
                 <p className="text-gray-500 text-sm">No cards linked yet.</p>
               )}
               
               {cards.map(card => (
                 <div key={card.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-xl group">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold uppercase tracking-wider">
                         {card.brand}
                       </div>
                       <div>
                         <div className="font-mono text-sm text-white">•••• •••• •••• {card.last4}</div>
                         <div className="text-xs text-gray-500">Expires {card.exp_month}/{card.exp_year}</div>
                       </div>
                    </div>
                    <button onClick={() => handleDeleteCard(card.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                 </div>
               ))}
             </div>

             {/* Add Card Form */}
             {isAddingCard ? (
               <div className="p-4 bg-white/5 rounded-xl border border-primary/20 animate-in fade-in slide-in-from-top-2">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-sm font-bold">New Card Details</h3>
                   <button onClick={() => setIsAddingCard(false)} className="text-xs text-gray-400 hover:text-white">Cancel</button>
                 </div>
                 <div className="space-y-3">
                   <input 
                     type="text" 
                     placeholder="Card Number" 
                     maxLength={19}
                     value={newCard.number}
                     onChange={e => setNewCard({...newCard, number: e.target.value})}
                     className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50"
                   />
                   <div className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        maxLength={5}
                        value={newCard.exp}
                        onChange={e => setNewCard({...newCard, exp: e.target.value})}
                        className="w-1/2 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50"
                      />
                      <input 
                        type="password" 
                        placeholder="CVC" 
                        maxLength={3}
                        value={newCard.cvc}
                        onChange={e => setNewCard({...newCard, cvc: e.target.value})}
                        className="w-1/2 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50"
                      />
                   </div>
                   <button onClick={handleAddCard} className="w-full bg-primary text-black font-bold py-2 rounded-lg text-sm hover:bg-primary/90 mt-2">
                     Link Card
                   </button>
                 </div>
               </div>
             ) : (
               <button 
                 onClick={() => setIsAddingCard(true)}
                 className="w-full py-3 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:border-white/40 transition-all flex items-center justify-center gap-2 text-sm"
               >
                 <Plus size={16} /> Add New Card
               </button>
             )}
          </motion.div>

        </div>
      </div>
    </main>
  )
}