import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Booking SaaS - Управление салоном",
  description: "Production-ready SaaS платформа для онлайн-записи",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.className} min-h-screen bg-gray-50 text-gray-900 dark:bg-zinc-950 dark:text-zinc-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
