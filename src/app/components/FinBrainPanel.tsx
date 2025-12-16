'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles, Bot, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface FinBrainPanelProps {
  isOpen: boolean
  onClose: () => void
  wallets: any[]
  transactions: any[]
}

export default function FinBrainPanel({ isOpen, onClose, wallets, transactions }: FinBrainPanelProps) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Привет! Я FinBrain. Я проанализировал ваши кошельки. Чем могу помочь?',
      timestamp: new Date()
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Автоскролл к последнему сообщению
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      // Отправляем контекст (данные кошельков) на наш API
      const response = await fetch('/api/finbrain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: input,
          context: { wallets, transactions } // <-- САМОЕ ВАЖНОЕ: Передаем финансовые данные
        })
      })

      const data = await response.json()

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply, // Ответ от AI
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, {
        id: 'err', role: 'assistant', content: 'Ошибка соединения с нейросетью.', timestamp: new Date()
      }])
    } finally {
      setIsTyping(false)
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
          
          {/* Side Panel */}
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-[450px] glass-panel border-l border-white/10 z-50 flex flex-col bg-[#0a0a0a]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary to-purple-900 flex items-center justify-center">
                   <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">FinBrain AI</h2>
                  <p className="text-xs text-secondary animate-pulse">Online & Analyzing</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" ref={scrollRef}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 
                    ${msg.role === 'user' ? 'bg-white/10' : 'bg-secondary/20'}`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={16} className="text-secondary" />}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed 
                    ${msg.role === 'user' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-white/5 border border-white/5 text-gray-200'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                     <Bot size={16} className="text-secondary" />
                   </div>
                   <div className="flex gap-1 items-center h-10 px-4 bg-white/5 rounded-2xl">
                     <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                     <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                     <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                   </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about your finances..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-4 outline-none focus:border-secondary/50 transition-all text-white placeholder:text-gray-600"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="absolute right-2 top-2 p-2 bg-secondary text-white rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}