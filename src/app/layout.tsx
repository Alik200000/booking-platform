import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Booking SaaS - Управление салоном",
  description: "Production-ready SaaS платформа для онлайн-записи",
};

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ImpersonationBar from "@/components/ImpersonationBar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const impersonatedTenant = session?.user?.tenantId 
    ? await prisma.tenant.findUnique({ where: { id: session.user.tenantId } })
    : null;

  return (
    <html lang="ru">
      <body className={`${inter.className} min-h-screen bg-gray-50 text-gray-900 dark:bg-zinc-950 dark:text-zinc-50 antialiased`}>
        {impersonatedTenant && <ImpersonationBar tenantName={impersonatedTenant.name} />}
        <div className={impersonatedTenant ? "pt-12" : ""}>
          {children}
        </div>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
