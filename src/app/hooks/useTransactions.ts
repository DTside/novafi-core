import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ... (тип Transaction оставь как был)
export type Transaction = {
  id: string
  // 👇 Добавляем 'staking_deposit' в этот список
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'exchange' | 'staking_deposit'
  amount: number
  status: string
  created_at: string
  recipient_address?: string
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTransactions = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) setTransactions(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchTransactions()

    const channel = supabase
      .channel('realtime-transactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => fetchTransactions() // Перезапрашиваем список при любых изменениях
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTransactions, supabase])

  return { transactions, loading, refetch: fetchTransactions }
}