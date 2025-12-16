'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useWallets } from './hooks/useWallets'
import { LogOut, Wallet, Activity, ArrowRight, Plus, Lock, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { ethers } from 'ethers'

// Компоненты
import TransferModal from './components/TransferModal'
import ExchangeModal from './components/ExchangeModal'
import StakingModal from './components/StakingModal'
import FinBrainPanel from './components/FinBrainPanel'
import RealTradingView from './components/RealTradingView'
import DepositModal from './components/DepositModal'

// Хуки и API
import { useTransactions } from './hooks/useTransactions'
import { useStakes } from './hooks/useStakes'
import { getCryptoPrice } from '@/lib/api/crypto'

// --- КОНФИГУРАЦИЯ МОНЕТ ---
const COINS = [
  { symbol: 'BTC', name: 'Bitcoin', id: 'bitcoin', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { symbol: 'ETH', name: 'Ethereum', id: 'ethereum', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { symbol: 'SOL', name: 'Solana', id: 'solana', color: 'text-green-500', bg: 'bg-green-500/10' },
  { symbol: 'XRP', name: 'Ripple', id: 'ripple', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { symbol: 'BNB', name: 'BNB', id: 'binancecoin', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { symbol: 'ADA', name: 'Cardano', id: 'cardano', color: 'text-teal-500', bg: 'bg-teal-500/10' },
  { symbol: 'AVAX', name: 'Avalanche', id: 'avalanche-2', color: 'text-red-500', bg: 'bg-red-500/10' },
  { symbol: 'DOGE', name: 'Dogecoin', id: 'dogecoin', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { symbol: 'DOT', name: 'Polkadot', id: 'polkadot', color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { symbol: 'LINK', name: 'Chainlink', id: 'chainlink', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
]

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  
  const { wallets, loading, refetch: refetchWallets } = useWallets()
  const { transactions, refetch: refetchTransactions } = useTransactions()
  const { stakes, refetchStakes } = useStakes()

  const [userName, setUserName] = useState('')
  const [activeTab, setActiveTab] = useState<'assets' | 'activity' | 'stakes'>('assets')
  
  // --- СОСТОЯНИЯ ДЛЯ ГРАФИКА ---
  const [selectedCoin, setSelectedCoin] = useState(COINS[0])
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [isCoinSelectorOpen, setIsCoinSelectorOpen] = useState(false)
  const coinSelectorRef = useRef<HTMLDivElement>(null)

  const [walletAddress, setWalletAddress] = useState('')
  const [isAiOpen, setIsAiOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [isExchangeOpen, setIsExchangeOpen] = useState(false)
  const [stakingCurrency, setStakingCurrency] = useState<string | null>(null)
  const [isDepositOpen, setIsDepositOpen] = useState(false)

  // Закрытие дропдауна при клике вне его
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (coinSelectorRef.current && !coinSelectorRef.current.contains(event.target as Node)) {
        setIsCoinSelectorOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [coinSelectorRef]);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
      else setUserName(user.user_metadata.full_name || 'User')
    }
    checkUser()
  }, [router, supabase])

  // Обновление цены
  useEffect(() => {
    // Устанавливаем предыдущую цену, чтобы не мигало нулем
    getCryptoPrice(selectedCoin.id).then(price => setCurrentPrice(price))
    const interval = setInterval(() => {
        getCryptoPrice(selectedCoin.id).then(price => setCurrentPrice(price))
    }, 10000) // Обновляем каждые 10 сек
    return () => clearInterval(interval)
  }, [selectedCoin])

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        setWalletAddress(address)
        toast.success('Wallet Connected', { description: `Connected: ${address.slice(0,6)}...${address.slice(-4)}` })
      } catch (err) {
        toast.error('Connection Failed', { description: 'User rejected request' })
      }
    } else {
      toast.error('Wallet not found', { description: 'Redirecting to MetaMask...', duration: 2000 })
      setTimeout(() => window.open('https://metamask.io/download/', '_blank'), 1500)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleRefreshData = () => {
    refetchWallets()
    refetchTransactions()
    refetchStakes()
  }

  const totalBalance = wallets.reduce((acc, curr) => acc + Number(curr.balance), 0)
  const formatMoney = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  // Форматирование цены крипты (с копейками)
  const formatCryptoPrice = (price: number) => price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary">Loading Core...</div>

  return (
    <main className="min-h-screen p-4 md:p-8 bg-background text-white selection:bg-primary selection:text-black">
      
      <FinBrainPanel isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} wallets={wallets} transactions={transactions} />
      <TransferModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} onSuccess={handleRefreshData} />
      <ExchangeModal isOpen={isExchangeOpen} onClose={() => setIsExchangeOpen(false)} onSuccess={handleRefreshData} />
      <StakingModal isOpen={!!stakingCurrency} onClose={() => setStakingCurrency(null)} onSuccess={handleRefreshData} currency={stakingCurrency || 'USD'} />
<DepositModal 
  isOpen={isDepositOpen} 
  onClose={() => setIsDepositOpen(false)} 
  onSuccess={handleRefreshData} 
/>
      {/* --- HEADER --- */}
      <header className="mb-8 flex justify-between items-center glass-panel p-4 rounded-2xl sticky top-4 z-40 bg-[#050505]/80 backdrop-blur-md">
        
        {/* ЛЕВАЯ ЧАСТЬ: АВАТАР И ИМЯ (ТЕПЕРЬ КЛИКАБЕЛЬНЫЕ) */}
        <div className="flex items-center gap-3">
          
          {/* Аватарка-кнопка */}
          <button 
            onClick={() => router.push('/settings')} 
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-black shadow-lg shadow-primary/20 hover:scale-110 transition-transform cursor-pointer"
          >
            {userName.charAt(0)}
          </button>
          
          {/* Текст с именем */}
          <button 
            onClick={() => router.push('/settings')} 
            className="text-left group"
          >
            <h1 className="text-xs text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">NovaFi Protocol</h1>
            <p className="font-semibold text-sm group-hover:text-primary transition-colors">{userName}</p>
          </button>
        </div>
        
        {/* ПРАВАЯ ЧАСТЬ: КОШЕЛЕК И ВЫХОД (ОСТАВЛЯЕМ БЕЗ ИЗМЕНЕНИЙ) */}
        <div className="flex items-center gap-3">
            <button onClick={connectWallet} className={`px-4 py-2 rounded-full text-xs font-bold border transition-all hidden md:block ${walletAddress ? 'bg-success/10 text-success border-success/20' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'}`}>
                {walletAddress ? `0x...${walletAddress.slice(-4)}` : 'Connect Wallet'}
            </button>
            <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <LogOut size={20} className="text-gray-400 hover:text-white" />
            </button>
        </div>
      </header>

      {/* --- GRID LAYOUT --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-4 gap-4 md:h-[800px]">
        
        {/* 1. INTERACTIVE CHART CARD (Mobile Fixed) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-1 md:col-span-3 row-span-2 glass-panel rounded-3xl relative overflow-hidden flex flex-col border-t border-white/10"
        >
           {/* График */}
           <div className="absolute inset-0 z-0">
              <RealTradingView key={selectedCoin.symbol} symbol={selectedCoin.symbol} />
           </div>
           
           {/* Градиент (Увеличили h-48 для мобилок, чтобы текст читался) */}
           <div className="absolute top-0 left-0 w-full h-56 md:h-40 bg-gradient-to-b from-[#050505] via-[#050505]/90 to-transparent z-10 pointer-events-none" />

           {/* --- ШАПКА --- */}
           <div className="relative z-20 flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-6 gap-4 md:gap-6">
             
             {/* Левая часть: Баланс */}
             {/* ml-10 на мобилках, чтобы не перекрывать тулбар графика слева */}
             <div className="ml-10 md:ml-16 mt-1 md:mt-2"> 
                <h3 className="text-xs md:text-sm text-gray-400 font-medium flex items-center gap-2 mb-1 md:mb-2 bg-black/40 w-fit px-3 py-1 rounded-full backdrop-blur-md border border-white/5">
                  <Wallet size={14} className="text-primary"/> Total Liquidity
                </h3>
                {/* Уменьшили шрифт для мобилок (text-3xl) */}
                <p className="text-3xl md:text-5xl font-bold tracking-tighter text-white drop-shadow-2xl">
                  {formatMoney(totalBalance)}
                </p>
             </div>

             {/* Правая часть: Селектор */}
             {/* ДОБАВИЛ: w-full (чтобы растянуть блок) и -mt-2 (чуть поднять) */}
             <div className="flex flex-col items-end gap-2 w-full md:w-auto -mt-2 md:mt-0" ref={coinSelectorRef}>
               
               <div className="relative z-30">
                 <button 
                   onClick={() => setIsCoinSelectorOpen(!isCoinSelectorOpen)}
                   className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 pl-3 pr-2 py-1.5 rounded-xl hover:bg-white/10 transition-all shadow-lg"
                 >
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${selectedCoin.bg} ${selectedCoin.color}`}>
                      {selectedCoin.symbol[0]}
                   </div>
                   <span className="font-bold text-lg">{selectedCoin.symbol}</span>
                   <span className="text-sm text-gray-400 hidden md:block">/ USD</span>
                   <ChevronDown size={16} className={`text-gray-500 transition-transform ${isCoinSelectorOpen ? 'rotate-180' : ''}`} />
                 </button>

                 <AnimatePresence>
                   {isCoinSelectorOpen && (
                     <motion.div 
                       initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
                       className="absolute top-full right-0 mt-2 w-56 max-h-64 overflow-y-auto custom-scrollbar bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1 z-40"
                     >
                       {COINS.map(coin => (
                         <button 
                           key={coin.symbol}
                           onClick={() => { setSelectedCoin(coin); setIsCoinSelectorOpen(false); }}
                           className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${selectedCoin.symbol === coin.symbol ? 'bg-white/10' : 'hover:bg-white/5'}`}
                         >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${coin.bg} ${coin.color}`}>
                              {coin.symbol[0]}
                            </div>
                           <div>
                             <div className="font-bold text-sm">{coin.symbol}</div>
                             <div className="text-xs text-gray-400">{coin.name}</div>
                           </div>
                         </button>
                       ))}
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
               
               <div className="flex items-center gap-2 text-xs md:text-sm font-medium bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 shadow-lg">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                  <span className="text-gray-300">Live:</span>
                  <span className={`font-bold font-mono ${currentPrice > 0 ? 'text-white' : 'text-gray-500'}`}>
                     {currentPrice > 0 ? `$${currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : 'Loading...'}
                  </span>
               </div>
             </div>

           </div>
        </motion.div>

        {/* 2. OPERATIONS SIDEBAR (Без изменений) */}
        <motion.div className="col-span-1 row-span-4 glass-panel rounded-3xl p-6 flex flex-col gap-4 bg-[#0a0a0a]">
           <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Operations</h3>
           <button 
  onClick={() => setIsDepositOpen(true)} // <--- ДОБАВЛЕНО
  className="w-full py-4 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,224,255,0.2)] flex items-center justify-center gap-2"
>
  <Plus size={18} /> Deposit
</button>
           <div className="h-px bg-white/5 my-2" />
           <button onClick={() => setIsTransferOpen(true)} className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left px-4 border border-white/5 text-gray-200 flex justify-between items-center group">
             Send Funds <ArrowRight size={16} className="text-gray-500 group-hover:text-primary transition-colors" />
           </button>
           <button onClick={() => setIsExchangeOpen(true)} className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left px-4 border border-white/5 text-gray-200 flex justify-between items-center group">
             Exchange <ArrowRight size={16} className="text-gray-500 group-hover:text-primary transition-colors" />
           </button>
           <button onClick={() => setIsAiOpen(true)} className="w-full py-4 rounded-xl bg-gradient-to-r from-secondary/10 to-transparent hover:from-secondary/20 transition-all text-left px-4 border border-secondary/20 text-secondary flex justify-between items-center group mt-auto">
             FinBrain AI <Activity size={16} />
           </button>
        </motion.div>

        {/* 3. AI INSIGHT CARD (Без изменений) */}
        <motion.div onClick={() => setIsAiOpen(true)} className="col-span-1 md:col-span-2 row-span-2 glass-panel rounded-3xl p-6 border border-white/5 relative overflow-hidden group cursor-pointer hover:border-secondary/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="text-lg text-white mb-2 flex items-center gap-2 font-medium"><Activity className="text-secondary" size={18}/> Market Insight</h3>
          <p className="text-gray-400 text-sm leading-relaxed relative z-10">Based on current volatility, holding <span className="text-white font-medium">USD</span> exposes you to 2.4% inflation risk. AI suggests allocating 15% to <span className="text-primary font-medium">Stablecoins</span>.</p>
          <div className="absolute bottom-4 right-4 text-xs text-secondary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Ask FinBrain <ArrowRight size={12}/></div>
        </motion.div>

        {/* 4. TABS (Без изменений) */}
        <motion.div className="col-span-1 row-span-2 glass-panel rounded-3xl p-6 overflow-hidden flex flex-col">
           <div className="flex items-center gap-4 mb-4 border-b border-white/10 overflow-x-auto no-scrollbar">
             {['assets', 'stakes', 'activity'].map((tab) => (
               <button key={tab} onClick={() => setActiveTab(tab as any)} className={`text-sm font-medium transition-colors pb-3 -mb-[1px] border-b-2 whitespace-nowrap capitalize ${activeTab === tab ? 'text-primary border-primary' : 'text-gray-400 border-transparent hover:text-white'}`}>
                 {tab === 'stakes' ? 'My Vault' : tab === 'assets' ? 'My Assets' : 'Activity'}
               </button>
             ))}
           </div>
           <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
             {activeTab === 'assets' && (
                wallets.length === 0 ? <p className="text-gray-500 text-sm text-center mt-10">No assets found.</p> : wallets.map((wallet) => (
                    <div key={wallet.id} onClick={() => setStakingCurrency(wallet.currency)} className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-inner ${wallet.currency === 'BTC' ? 'bg-orange-500/20 text-orange-400' : wallet.currency === 'ETH' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                          {wallet.currency === 'BTC' ? '₿' : wallet.currency === 'ETH' ? 'Ξ' : '$'}
                        </div>
                        <div><div className="font-bold text-sm text-gray-200">{wallet.currency}</div><div className="text-xs text-gray-500 flex items-center gap-1 group-hover:text-primary transition-colors">Tap to Stake <ArrowRight size={10}/></div></div>
                      </div>
                      <div className="text-right"><div className="font-mono text-sm text-white font-medium">{wallet.type === 'crypto' ? wallet.balance.toFixed(6) : `$${wallet.balance.toFixed(2)}`}</div></div>
                    </div>
                  ))
             )}
             {activeTab === 'stakes' && (
                stakes.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm opacity-60"><Lock size={32} className="mb-2 opacity-50"/><p>Vault is empty.</p><span className="text-xs">Stake assets to earn APY</span></div> : stakes.map((stake) => (
                    <div key={stake.id} className="flex justify-between items-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Lock size={14}/></div><div><div className="font-bold text-sm text-white">{stake.currency} Vault</div><div className="text-xs text-success font-medium">+{stake.apy}% APY</div></div></div>
                      <div className="text-right"><div className="font-mono text-sm text-white">{Number(stake.amount).toFixed(4)}</div><div className="text-[10px] text-gray-500">Locked</div></div>
                    </div>
                  ))
             )}
             {activeTab === 'activity' && (
               transactions.length === 0 ? <p className="text-gray-500 text-sm text-center mt-10">No transactions.</p> : transactions.map((tx) => (
                   <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                     <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${tx.type === 'staking_deposit' ? 'bg-primary/20 text-primary' : tx.type.includes('in') || tx.type === 'deposit' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{tx.type === 'staking_deposit' ? 'L' : tx.type.includes('in') || tx.type === 'deposit' ? '↓' : '↑'}</div><div><div className="font-medium text-sm text-gray-200 capitalize">{tx.type.replace('_', ' ')}</div><div className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div></div></div>
                     <span className={`font-mono text-sm ${tx.type === 'staking_deposit' ? 'text-primary' : tx.type.includes('in') ? 'text-green-400' : 'text-white'}`}>{tx.type.includes('out') || tx.type === 'staking_deposit' ? '-' : '+'}${Number(tx.amount).toFixed(2)}</span>
                   </div>
                 ))
             )}
           </div>
        </motion.div>
      </div>
    </main>
  );
}