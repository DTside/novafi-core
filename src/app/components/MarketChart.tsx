'use client'

import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// Генерируем случайное движение цены (Random Walk)
const generateNextPoint = (prevPrice: number) => {
  const change = (Math.random() - 0.5) * 50 // Волатильность
  return Math.max(0, prevPrice + change)
}

export default function MarketChart() {
  const [data, setData] = useState<any[]>([])

  // 1. Инициализация графика (исторические данные)
  useEffect(() => {
    let price = 124000
    const initialData = []
    for (let i = 0; i < 30; i++) {
      price = generateNextPoint(price)
      initialData.push({ time: i, value: price })
    }
    setData(initialData)

    // 2. Эмуляция Live-WebSocket (обновление данных)
    const interval = setInterval(() => {
      setData(currentData => {
        const lastPrice = currentData[currentData.length - 1].value
        const newPrice = generateNextPoint(lastPrice)
        // Удаляем старую точку, добавляем новую (эффект бегущей строки)
        return [...currentData.slice(1), { time: currentData.length, value: newPrice }]
      })
    }, 1000) // Обновление раз в секунду

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-full min-h-[200px] absolute bottom-0 left-0 right-0 z-0 opacity-50 pointer-events-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            {/* Градиент заливки под графиком */}
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E0FF" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00E0FF" stopOpacity={0}/>
            </linearGradient>
          </defs>
          {/* Скрываем оси, оставляем только линию */}
          <XAxis dataKey="time" hide />
          <YAxis domain={['auto', 'auto']} hide />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#00E0FF" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            isAnimationActive={false} // Отключаем плавную анимацию для "резкости" realtime
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}