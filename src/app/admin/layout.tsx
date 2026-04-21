import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { dict } from "@/lib/i18n";
import { toggleLocale } from "@/app/actions/locale";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tenantId = session?.user?.tenantId as string;
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "ru";
  const t = dict[locale as keyof typeof dict];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#E0E5EC] font-sans text-[#1F2532]">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-[#3B414F] text-gray-300 flex-col z-10 rounded-r-[2.5rem] overflow-hidden shadow-2xl py-6 flex-shrink-0">
        <div className="h-24 flex flex-col items-center justify-center px-8 mb-4">
           <svg className="w-12 h-12 text-white mb-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.2 14.8l-1.3-1.3c-.3.3-.6.5-1 .7v-1.4c0-.3-.2-.5-.5-.5H11v-2h2.5c.3 0 .5-.2.5-.5v-1.5c0-.3-.2-.5-.5-.5H11v-2h1.5c.3 0 .5-.2.5-.5v-1h-3v1c-.3 0-.5.2-.5.5v1.5c0 .3.2.5.5.5H12v2H9.5c-.3 0-.5.2-.5.5v1.5c0 .3.2.5.5.5H12v2h1c.4-.1.7-.3 1-.6l1.3 1.3c.5-.5.9-1.1 1.2-1.7l-1.8-1.8z" />
           </svg>
           <span className="text-white font-semibold text-lg tracking-wide">{t.nav_dashboard}</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <Link href="/admin" className="flex items-center px-4 py-3.5 rounded-2xl hover:bg-[#475061] hover:text-white font-medium transition-colors">
            <svg className="w-5 h-5 mr-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            {t.nav_dashboard}
          </Link>
          <Link href="/admin/calendar" className="flex items-center px-4 py-3.5 rounded-2xl hover:bg-[#475061] hover:text-white font-medium transition-colors">
            <svg className="w-5 h-5 mr-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            {t.nav_calendar}
          </Link>
          <Link href="/admin/clients" className="flex items-center px-4 py-3.5 rounded-2xl hover:bg-[#475061] hover:text-white font-medium transition-colors">
            <svg className="w-5 h-5 mr-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            {t.nav_clients}
          </Link>
          <Link href="/admin/services" className="flex items-center px-4 py-3.5 rounded-2xl hover:bg-[#475061] hover:text-white font-medium transition-colors">
            <svg className="w-5 h-5 mr-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            {t.nav_services}
          </Link>
          <Link href="/admin/staff" className="flex items-center px-4 py-3.5 rounded-2xl hover:bg-[#475061] hover:text-white font-medium transition-colors">
            <svg className="w-5 h-5 mr-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            {t.nav_staff}
          </Link>
          <Link href="/admin/billing" className="flex items-center px-4 py-3.5 rounded-2xl hover:bg-[#475061] hover:text-white font-medium transition-colors">
            <svg className="w-5 h-5 mr-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            {t.nav_billing}
          </Link>
          <Link href="/admin/appearance" className="flex items-center px-4 py-3.5 rounded-2xl hover:bg-[#475061] hover:text-white font-medium transition-colors">
            <svg className="w-5 h-5 mr-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
            Внешний вид
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
            <button type="submit" className="flex flex-col items-center justify-center w-full p-4 rounded-3xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all font-semibold">
              <svg className="w-6 h-6 mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              <span className="text-[11px] uppercase tracking-wider">Выйти</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative pb-32 md:pb-0 h-screen md:h-auto">
        <header className="h-16 md:h-24 flex items-center justify-between px-6 md:px-10 pt-2 md:pt-6 flex-shrink-0 bg-[#E0E5EC]/80 backdrop-blur-lg sticky top-0 z-40">
          
          {/* Logo / Title for mobile */}
          <div className="md:hidden flex items-center">
            <div className="w-9 h-9 bg-[#3B414F] text-white rounded-xl flex items-center justify-center mr-3 shadow-lg font-black text-lg">S</div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-black opacity-40 leading-none">Salon Admin</p>
              <h2 className="font-bold text-sm text-[#1F2532] leading-tight">{tenant?.name || "Dashboard"}</h2>
            </div>
          </div>

          {/* Top Search bar - Desktop only */}
          <div className="hidden md:flex w-80 bg-[#D0D6DE] rounded-full px-5 py-3 items-center shadow-inner">
            <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" placeholder={t.search} className="bg-transparent outline-none text-[#1F2532] w-full placeholder-gray-500 font-medium" />
          </div>

          {/* Profile & Language */}
          <div className="flex items-center gap-2 md:gap-4">
             <form action={toggleLocale}>
               <button type="submit" className="w-10 h-10 md:w-auto md:px-4 md:py-2 bg-[#D0D6DE] text-[#1F2532] rounded-full font-bold shadow-sm hover:bg-[#c3c9d2] transition-colors flex items-center justify-center gap-2 text-sm">
                 🌍 <span className="hidden md:inline">{t.language}</span>
               </button>
             </form>
             <div className="w-10 h-10 md:w-12 md:h-12 bg-[#D0D6DE] rounded-full flex items-center justify-center relative shadow-sm cursor-pointer border border-white/20">
               <svg className="w-5 h-5 md:w-6 md:h-6 text-[#1F2532]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
               <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#E0E5EC]"></span>
             </div>
             <div className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#59667B] items-center justify-center text-white font-bold shadow-md border-2 border-white/30">
                {session.user.name?.[0] || "U"}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-10 scrollbar-hide">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom Navigation - Mobile (God Mode) */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-[#1D1D1F]/90 backdrop-blur-2xl text-white flex justify-between items-center px-4 py-3 z-50 rounded-[2.2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 animate-in slide-in-from-bottom-10 duration-700">
          <Link href="/admin" className="flex flex-col items-center justify-center p-2 min-w-[60px] transition-all active:scale-90">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 hover:bg-white/10 mb-1">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            </div>
            <span className="text-[10px] font-bold tracking-tight opacity-70">Главная</span>
          </Link>
          <Link href="/admin/calendar" className="flex flex-col items-center justify-center p-2 min-w-[60px] transition-all active:scale-90">
            <div className="w-12 h-12 -mt-8 rounded-full flex items-center justify-center bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] border-4 border-[#1D1D1F] text-white">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-1">Календарь</span>
          </Link>
          <Link href="/admin/clients" className="flex flex-col items-center justify-center p-2 min-w-[60px] transition-all active:scale-90">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 hover:bg-white/10 mb-1">
              <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <span className="text-[10px] font-bold tracking-tight opacity-70">Клиенты</span>
          </Link>
          <Link href="/admin/appearance" className="flex flex-col items-center justify-center p-2 min-w-[60px] transition-all active:scale-90">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 hover:bg-white/10 mb-1">
              <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
            </div>
            <span className="text-[10px] font-bold tracking-tight opacity-70">Дизайн</span>
          </Link>
      </nav>
    </div>
  );
}
