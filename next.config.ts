import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  // 1. Транспиляция (Оставляем)
  transpilePackages: ['@supabase/supabase-js', '@supabase/ssr'],

  // 2. Игнорируем ошибки при сборке (для экономии ресурсов Vercel)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 3. ГЛАВНЫЙ ФИКС: Правильная обработка MJS файлов
  webpack: (config: any) => {
    // Убираем alias, так как он запрещен авторами Supabase
    
    // Добавляем правило: "Не пытайся быть слишком умным с .mjs, просто грузи их"
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    return config;
  },
};

const withPWAConfig = withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: false, 
  workboxOptions: {
    disableDevLogs: true,
  },
});

export default isDev ? nextConfig : withPWAConfig(nextConfig);