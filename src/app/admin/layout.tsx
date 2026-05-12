import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { dict } from "@/lib/i18n";
import { toggleLocale } from "@/app/actions/locale";
import { prisma } from "@/lib/prisma";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import NotificationBell from "@/components/NotificationBell";
import MobileNav from "@/components/MobileNav";
import SystemNotificationPopup from "@/components/SystemNotificationPopup";

import { getActiveTenantId } from "@/lib/auth-utils";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tenantId = await getActiveTenantId();
  
  if (!tenantId) {
    if (session.user.role === "SUPERADMIN") {
      redirect("/superadmin");
    } else {
      redirect("/login");
    }
  }

  let tenant = null;
  let upcomingBookings: any[] = [];
  let systemMessages: any[] = [];
  
  try {
    tenant = await prisma.tenant.findUnique({ where: { id: tenantId as string } });
  } catch (error) {
    console.error("AdminLayout tenant fetch error:", error);
  }

  if (!tenant) redirect("/superadmin");


  // --- SUSPENSION CHECK ---
  if (tenant?.isSuspended && session.user.role !== "SUPERADMIN") {
    return (
      <div className="min-h-screen bg-[#1F2532] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-8 animate-pulse">
           <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h1 className="text-3xl font-black text-white mb-4 tracking-tight">Ваш доступ временно приостановлен</h1>
        <p className="text-white/40 max-w-md mb-8">Этот салон был заморожен администратором платформы.</p>
        <form action="/api/auth/signout" method="POST">
           <button type="submit" className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all uppercase tracking-widest text-xs">Выйти из аккаунта</button>
        </form>
      </div>
    );
  }

  const cookieStore = await cookies();
  const locale = (await cookieStore).get("NEXT_LOCALE")?.value || "ru";
  const t = dict[locale as keyof typeof dict];
  const isSuperadmin = session.user.role === "SUPERADMIN";

  try {
    upcomingBookings = await prisma.booking.findMany({
      where: {
        tenantId,
        startTime: {
          gte: new Date(),
          lte: new Date(Date.now() + 24 * 60 * 60 * 1000)
        },
        status: 'CONFIRMED'
      },
      include: {
        service: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    systemMessages = await prisma.systemMessage.findMany({
      where: {
        isActive: true,
        OR: [
          { targetTenantId: null },
          { targetTenantId: tenantId as string }
        ]
      },
      select: {
        id: true,
        title: true,
        content: true,
        type: true
      }
    });
  } catch (error) {

    console.error("AdminLayout upcomingBookings fetch error:", error);
  }



  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-main-bg font-sans text-main-text transition-colors duration-300">
      <SystemNotificationPopup messages={systemMessages} />
      {/* Sidebar - Desktop */}

      <aside className="hidden md:flex w-64 bg-sidebar text-gray-300 flex-col z-10 rounded-r-[2.5rem] overflow-hidden shadow-2xl py-6 flex-shrink-0 transition-colors duration-300">
        <div className="h-24 flex flex-col items-center justify-center px-8 mb-4">
           <svg className="w-12 h-12 text-white mb-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.2 14.8l-1.3-1.3c-.3.3-.6.5-1 .7v-1.4c0-.3-.2-.5-.5-.5H11v-2h2.5c.3 0 .5-.2.5-.5v-1.5c0-.3-.2-.5-.5-.5H11v-2h1.5c.3 0 .5-.2.5-.5v-1h-3v1c-.3 0-.5.2-.5.5v1.5c0 .3.2.5.5.5H12v2H9.5c-.3 0-.5.2-.5.5v1.5c0 .3.2.5.5.5H12v2h1c.4-.1.7-.3 1-.6l1.3 1.3c.5-.5.9-1.1 1.2-1.7l-1.8-1.8z" />
           </svg>
           <span className="text-white font-semibold text-lg tracking-wide">{t.nav_dashboard}</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <Link href="/admin" className="flex items-center px-4 py-3.5 rounded-2xl hover:bg-white/10 hover:text-white font-medium transition-colors">
            <svg className="w-5 h-5 mr-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            {t.nav_dashboard}
          </Link>
          <Link href="/admin/analytics" className="flex items-center px-4 py-3.5 rounded-2xl hover:bg-white/10 hover:text-white font-medium transition-colors">
            <svg className="w-5 h-5 mr-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            {t.nav_analytics}
          </Link>
          <Link href="/admin/calendar" className="flex items-center px-4 py-3.5 rounded-2xl hover:bg-white/10 hover:text-white font-medium transition-colors">
            <svg className="w-5 h-5 mr-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            {t.nav_calendar}
          </Link>
          <Link href="/admin/clients" className="flex items-center px-4 py-3.5 rounded-2xl hover:bg-white/10 hover:text-white font-medium transition-colors">
            <svg className="w-5 h-5 mr-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            {t.nav_clients}
          </Link>
          <Link href="/admin/services" className="flex items-center px-4 py-3.5 rounded-2xl hover:bg-white/10 hover:text-white font-medium transition-colors">
            <svg className="w-5 h-5 mr-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            {t.nav_services}
          </Link>
          <Link href="/admin/staff" className="flex items-center px-4 py-3.5 rounded-2xl hover:bg-white/10 hover:text-white font-medium transition-colors">
            <svg className="w-5 h-5 mr-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            {t.nav_staff}
          </Link>
          <Link href="/admin/billing" className="flex items-center px-4 py-3.5 rounded-2xl hover:bg-white/10 hover:text-white font-medium transition-colors">
            <svg className="w-5 h-5 mr-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            {t.nav_billing}
          </Link>
          <Link href="/admin/appearance" className="flex items-center px-4 py-3.5 rounded-2xl hover:bg-white/10 hover:text-white font-medium transition-colors">
            <svg className="w-5 h-5 mr-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
            Внешний вид
          </Link>
          <Link href="/admin/messages" className="flex items-center px-4 py-3.5 rounded-2xl bg-white/5 text-white shadow-inner font-bold border border-white/5 group transition-all hover:bg-white/10 mt-4">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
               <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            </div>
            Сообщения
            <div className="ml-auto w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          </Link>
          
          <div className="pt-6 pb-2 px-4 text-[10px] font-black text-white/20 uppercase tracking-widest leading-none">Поддержка</div>
          <Link href="/admin/integrations" className="flex items-center px-4 py-3.5 rounded-2xl hover:bg-white/10 hover:text-white font-medium transition-colors">
            <svg className="w-5 h-5 mr-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path></svg>
            Интеграции
            <span className="ml-auto text-[8px] font-black bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase">Pro</span>
          </Link>
          <Link href="/admin/complaints" className="flex items-center px-4 py-3.5 rounded-2xl hover:bg-white/10 hover:text-white font-medium transition-colors">
            <svg className="w-5 h-5 mr-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            Жалобы
          </Link>
        </nav>

        
        {session?.user?.role === 'SUPERADMIN' && (
          <div className="px-4 mt-2">
            <Link href="/superadmin" className="flex items-center px-4 py-3 rounded-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              Суперадминка
            </Link>
          </div>
        )}

        <div className="px-4 mt-auto">
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="flex flex-col items-center justify-center w-full p-4 rounded-3xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all font-semibold">
              <svg className="w-6 h-6 mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              <span className="text-[11px] uppercase tracking-wider">Выйти</span>
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative pb-32 md:pb-0 h-screen md:h-auto">
        <header className="h-16 md:h-24 flex items-center justify-between px-4 md:px-10 pt-1 md:pt-6 flex-shrink-0 bg-main-bg/80 backdrop-blur-lg sticky top-0 z-40 transition-colors duration-300">

          
          {/* Logo / Title for mobile */}
          <div className="md:hidden flex items-center">
            <div className="w-8 h-8 bg-sidebar text-white rounded-lg flex items-center justify-center mr-2.5 shadow-md font-black text-base">S</div>
            <div className="max-w-[120px]">
              <p className="text-[8px] uppercase tracking-widest font-black opacity-30 leading-none mb-0.5">Admin</p>
              <h2 className="font-bold text-xs text-main-text leading-tight truncate">{tenant?.name || "Panel"}</h2>
            </div>
          </div>

          {/* Top Search bar - Desktop only */}
          <div className="hidden md:flex w-80 bg-sec-bg rounded-full px-5 py-3 items-center shadow-inner transition-colors duration-300">
            <svg className="w-5 h-5 text-sec-text mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" placeholder={t.search} className="bg-transparent outline-none text-main-text w-full placeholder-sec-text font-medium" />
          </div>

          {/* Profile & Theme Switcher */}
          <div className="flex items-center gap-1.5 md:gap-4">
             <form action={toggleLocale}>
               <button type="submit" className="w-9 h-9 md:w-auto md:px-4 md:py-2 bg-sec-bg text-main-text rounded-full font-bold shadow-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-xs">
                 🌍 <span className="hidden md:inline">{t.language}</span>
               </button>
             </form>
             
             <ThemeSwitcher />

             <NotificationBell upcomingBookings={upcomingBookings} />

             <div className="hidden sm:flex w-9 h-9 md:w-12 md:h-12 rounded-full bg-sidebar items-center justify-center text-white font-bold shadow-md border-2 border-white/20 transition-colors duration-300 overflow-hidden">
                {tenant?.logoUrl ? (
                  <img src={tenant.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  session.user.name?.[0] || "U"
                )}
             </div>
          </div>
        </header>


        <div className="flex-1 overflow-auto p-4 md:p-10 scrollbar-hide">
            {tenant.isSuspended && isSuperadmin && (
               <div className="mb-6 bg-red-600/20 border border-red-500/50 p-4 rounded-3xl flex items-center justify-between">
                  <div className="flex items-center gap-3 text-red-500">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                     <span className="text-sm font-bold">ВНИМАНИЕ: Этот салон заморожен. Клиенты не могут войти в админку.</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-500/50">GOD MODE BYPASS</span>
               </div>
            )}
            {children}
        </div>
      </main>

      <MobileNav t={t} isSuperadmin={isSuperadmin} />
    </div>
  );
}
