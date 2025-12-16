import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { prompt, context } = await req.json()
    const { wallets, transactions } = context

    // Имитация задержки "мышления" (чтобы выглядело реалистично)
    await new Promise(resolve => setTimeout(resolve, 800))

    // 1. АНАЛИЗ ДАННЫХ
    const totalBalance = wallets.reduce((acc: number, w: any) => acc + Number(w.balance), 0)
    const cryptoWallets = wallets.filter((w: any) => w.type === 'crypto' && w.balance > 0)
    const fiatWallets = wallets.filter((w: any) => w.type === 'fiat')
    const hasCrypto = cryptoWallets.length > 0
    const lastTx = transactions.length > 0 ? transactions[0] : null
    
    // Приводим вопрос к нижнему регистру для поиска ключевых слов
    const text = prompt.toLowerCase()
    let reply = ""

    // 2. ЛОГИЧЕСКОЕ ЯДРО (RULE-BASED ENGINE)

    // --- Сценарий: Баланс / Состояние ---
    if (text.includes('balance') || text.includes('status') || text.includes('how much') || text.includes('состояние') || text.includes('баланс')) {
      reply = `Analysis Complete. Your total liquidity is $${totalBalance.toFixed(2)}. `
      
      if (hasCrypto) {
        const cryptoNames = cryptoWallets.map((w: any) => w.currency).join(', ')
        reply += `You have active positions in: ${cryptoNames}. `
      } else {
        reply += `Your portfolio is currently 100% Fiat based. `
      }

      if (totalBalance > 10000) {
        reply += "You are in the top 5% of users. Consider staking your excess liquidity."
      } else if (totalBalance === 0) {
        reply += "Your vault is empty. Try depositing funds via the Operations menu."
      }
    }

    // --- Сценарий: Советы / Инвестиции ---
    else if (text.includes('advice') || text.includes('invest') || text.includes('buy') || text.includes('sell') || text.includes('совет')) {
      if (!hasCrypto) {
        reply = "Strategic Advice: Your portfolio lacks exposure to digital assets. Consider allocating 5-10% to Bitcoin (BTC) or Ethereum (ETH) to hedge against fiat inflation."
      } else if (cryptoWallets.length === 1 && cryptoWallets[0].currency === 'BTC') {
        reply = "Diversification Alert: You are heavily exposed to Bitcoin. Consider diversifying into ETH or SOL to balance your risk profile."
      } else {
        reply = "Market Outlook: Current volatility suggests a 'Hold' strategy. If you have excess USDT, staking it in the Vault offers a stable 12% APY."
      }
    }

    // --- Сценарий: История / Транзакции ---
    else if (text.includes('transaction') || text.includes('history') || text.includes('last') || text.includes('spent') || text.includes('история')) {
      if (lastTx) {
        reply = `Last recorded activity: ${lastTx.type.toUpperCase()} of $${lastTx.amount} on ${new Date(lastTx.created_at).toLocaleDateString()}. `
        if (lastTx.amount > 1000) {
          reply += "This was a significant movement. Ensure this was authorized."
        }
      } else {
        reply = "No transaction history found on the blockchain ledger."
      }
    }

    // --- Сценарий: Приветствие / Кто ты ---
    else if (text.includes('hello') || text.includes('hi') || text.includes('who are you') || text.includes('привет')) {
      reply = "Greetings. I am FinBrain v1.0, your personal automated financial analyst. I monitor your assets and market trends securely."
    }

    // --- Дефолтный ответ (если не понял) ---
    else {
      reply = `I processed your query, but my neural context is limited to financial data. 
      Try asking about:
      - "Check my balance status"
      - "Give me investment advice"
      - "Show last transaction"`
    }

    return NextResponse.json({ reply })

  } catch (error) {
    return NextResponse.json({ reply: "System Error: Neural link interrupted." })
  }
}