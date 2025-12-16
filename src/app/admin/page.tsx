'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShieldAlert, Users, Activity, Ban, CheckCircle, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchAdminData = async () => {
    const { data, error } = await supabase.rpc('get_admin_dashboard_data')
    if (error) {
      toast.error('Access Denied', { description: error.message })
    } else {
      setData(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAdminData()
  }, [])

  const toggleBan = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'verified' : 'suspended'
    const { error } = await supabase.rpc('toggle_user_status', { 
      target_user_id: userId, 
      new_status: newStatus 
    })
    
    if (error) toast.error('Error updating status')
    else {
      toast.success(`User ${newStatus === 'suspended' ? 'Suspended' : 'Activated'}`)
      fetchAdminData() // Обновляем таблицу
    }
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-red-500">Authenticating Level 5 Access...</div>

  if (!data) return <div className="min-h-screen bg-black flex items-center justify-center">Access Denied</div>

  return (
    <main className="min-h-screen bg-[#050505] text-white p-8 selection:bg-red-900">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center text-red-500">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest uppercase">NovaFi Compliance</h1>
            <p className="text-xs text-gray-500 font-mono">System Admin Protocol v.1.0</p>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="px-4 py-2 bg-white/5 rounded border border-white/10 text-xs font-mono">
              USERS: <span className="text-white font-bold">{data.stats.users}</span>
           </div>
           <div className="px-4 py-2 bg-white/5 rounded border border-white/10 text-xs font-mono">
              VOL: <span className="text-success font-bold">${Number(data.stats.volume).toLocaleString()}</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* User Management */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6 rounded-2xl border border-white/5">
           <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-200">
             <Users size={18} className="text-primary"/> User Database
           </h2>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
               <thead>
                 <tr className="text-gray-500 border-b border-white/10">
                   <th className="pb-3 pl-2">Identity</th>
                   <th className="pb-3">Risk Profile</th>
                   <th className="pb-3">Status</th>
                   <th className="pb-3 text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="font-mono">
                 {data.users.map((u: any) => (
                   <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                     <td className="py-4 pl-2">
                       <div className="font-bold text-white">{u.full_name}</div>
                       <div className="text-xs text-gray-500">{u.email}</div>
                     </td>
                     <td className="py-4">
                       <span className={`px-2 py-1 rounded text-[10px] uppercase border ${u.risk_profile === 'aggressive' ? 'border-red-500/30 text-red-500' : 'border-green-500/30 text-green-500'}`}>
                         {u.risk_profile || 'Normal'}
                       </span>
                     </td>
                     <td className="py-4">
                        {u.kyc_status === 'suspended' ? (
                          <span className="flex items-center gap-1 text-red-500"><Lock size={12}/> Suspended</span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-500"><CheckCircle size={12}/> Active</span>
                        )}
                     </td>
                     <td className="py-4 text-right">
                       <button 
                         onClick={() => toggleBan(u.id, u.kyc_status)}
                         className={`p-2 rounded hover:bg-white/10 transition-colors ${u.kyc_status === 'suspended' ? 'text-green-400' : 'text-red-400'}`}
                         title={u.kyc_status === 'suspended' ? "Unban" : "Ban User"}
                       >
                         {u.kyc_status === 'suspended' ? <CheckCircle size={16}/> : <Ban size={16}/>}
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </motion.div>

        {/* Global Transactions Log */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6 rounded-2xl border border-white/5">
           <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-200">
             <Activity size={18} className="text-secondary"/> Global Activity Log
           </h2>
           <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
             {data.transactions.map((tx: any) => (
               <div key={tx.id} className="p-3 bg-white/5 rounded border border-white/5 flex justify-between items-center">
                 <div>
                   <div className="flex items-center gap-2 mb-1">
                     <span className="text-xs font-mono text-gray-500">{new Date(tx.created_at).toLocaleString()}</span>
                     <span className="text-xs uppercase bg-white/10 px-1.5 py-0.5 rounded text-gray-300">{tx.type}</span>
                   </div>
                   <div className="text-sm text-gray-300">{tx.user_email}</div>
                 </div>
                 <div className="font-mono font-bold text-white">
                   ${Number(tx.amount).toFixed(2)}
                 </div>
               </div>
             ))}
           </div>
        </motion.div>

      </div>
    </main>
  )
}