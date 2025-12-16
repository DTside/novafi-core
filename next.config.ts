import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  // Исправление для Supabase
  transpilePackages: ['@supabase/supabase-js', '@supabase/ssr'],

  // 👇 Экономим ресурсы Vercel, отключая проверки при сборке
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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

// В dev-режиме - чистый конфиг. В prod - с PWA.
export default isDev ? nextConfig : withPWAConfig(nextConfig);