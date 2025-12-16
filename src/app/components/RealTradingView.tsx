'use client'

import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

// 1. Описываем, что компонент ждет на вход символ (строку)
interface Props {
  symbol: string;
}

export default function RealTradingView({ symbol }: Props) {
  return (
    <div className="w-full h-full absolute inset-0 z-0 opacity-90 mix-blend-lighten">
      <AdvancedRealTimeChart 
        theme="dark" 
        autosize
        // 2. Вставляем переменную symbol внутрь строки
        symbol={`BINANCE:${symbol}USDT`} 
        interval="D" 
        timezone="Etc/UTC" 
        style="1" 
        locale="en" 
        toolbar_bg="#000000" 
        enable_publishing={false} 
        hide_top_toolbar={false} 
        hide_legend={false} 
        save_image={false}
        container_id="tradingview_widget"
        backgroundColor="rgba(0, 0, 0, 1)" 
      />
    </div>
  )
}