import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // Транспиляция нужна для Supabase в любом случае
  transpilePackages: ['@supabase/supabase-js', '@supabase/ssr'],
};

// Настройка PWA
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

// ГЛАВНЫЙ ФИКС:
// В dev-режиме не используем плагин PWA вообще -> работает Turbopack -> работает Supabase.
// В prod-режиме (build) используем плагин -> работает PWA.
export default isDev ? nextConfig : withPWAConfig(nextConfig);