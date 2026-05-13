import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Zapis Online - Удобная запись на услуги",
  description: "Единая платформа для онлайн-записи в лучшие заведения города",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Zapis Online",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ImpersonationBar from "@/components/ImpersonationBar";
import { Providers } from "@/components/Providers";

import { getActiveTenantId } from "@/lib/auth-utils";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session = null;
  let impersonatedTenant = null;
  let isSuperadmin = false;

  try {
    session = await auth();
    const tenantId = await getActiveTenantId();
      
    if (tenantId) {
      impersonatedTenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    }
    
    isSuperadmin = session?.user?.role === "SUPERADMIN";
  } catch (error) {
    console.error("CRITICAL_RENDER_ERROR (RootLayout):", error);
    // Continue rendering with null values to avoid crashing the whole site
  }


  return (
    <html lang="ru">
      <body className={`${inter.className} min-h-screen bg-[#F5F5F7] text-gray-900 antialiased`}>
        <Providers>
          {impersonatedTenant && isSuperadmin && <ImpersonationBar tenantName={impersonatedTenant.name} />}
          <div className={(impersonatedTenant && isSuperadmin) ? "pt-12" : ""}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
