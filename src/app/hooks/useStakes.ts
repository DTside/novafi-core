import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Stake = {
  id: string
  currency: string
  amount: number
  apy: number
  started_at: string
}

export function useStakes() {
  const [stakes, setStakes] = useState<Stake[]>([])
  const supabase = createClient()

  const fetchStakes = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('stakes')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active') // Показываем только активные

    if (data) setStakes(data)
  }, [supabase])

  useEffect(() => {
    fetchStakes()
    // Подписка на обновления
    const channel = supabase.channel('stakes_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stakes' }, fetchStakes)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchStakes, supabase])

  return { stakes, refetchStakes: fetchStakes }
}