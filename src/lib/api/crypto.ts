// src/lib/api/crypto.ts

export async function getCryptoPrice(coinId: string): Promise<number> {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`, {
      next: { revalidate: 60 }
    })
    
    if (!res.ok) throw new Error('API Error')
    
    const data = await res.json()
    return data[coinId].usd
  } catch (error) {
    console.error('Failed to fetch price')
    return 0
  }
}