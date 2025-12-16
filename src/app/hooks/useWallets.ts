import { useEffect, useState, useCallback } from 'react' // Добавили useCallback
import { createClient } from '@/lib/supabase/client'

type Wallet = {
  id: string
  currency: string
  balance: number
  type: string
}

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Оборачиваем в useCallback, чтобы функция была стабильной
  const fetchWallets = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)

    if (data) setWallets(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchWallets()

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallets'
        },
        () => {
          fetchWallets()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchWallets, supabase])

  // Возвращаем функцию refetch наружу
  return { wallets, loading, refetch: fetchWallets }
}