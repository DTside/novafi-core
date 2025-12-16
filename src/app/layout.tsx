import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

// 1. Настройка области просмотра для мобилок (запрет зума, как в нативных апп)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050505", // Черный статус бар
};

export const metadata: Metadata = {
  title: "NovaFi Core",
  description: "Next Gen Banking Protocol",
  manifest: "/manifest.webmanifest", // Подключение манифеста
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NovaFi",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" richColors theme="dark" />
      </body>
    </html>
  );
}