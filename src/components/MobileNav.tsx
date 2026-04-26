"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav({ t, isSuperadmin }: { t: any, isSuperadmin: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navItems = [
    { href: "/admin", label: "Главная", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
    )},
    { href: "/admin/calendar", label: "Календарь", isCenter: true, icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    )},
    { href: "/admin/clients", label: "Клиенты", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
    )},
  ];

  const menuItems = [
    { href: "/admin/services", label: "Услуги", color: "bg-blue-500", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
    )},
    { href: "/admin/staff", label: "Сотрудники", color: "bg-emerald-500", icon: (
       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
    )},
    { href: "/admin/billing", label: "Тариф", color: "bg-amber-500", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
    )},
    { href: "/admin/analytics", label: "Аналитика", color: "bg-indigo-500", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
    )},
    { href: "/admin/appearance", label: "Дизайн", color: "bg-purple-500", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 01  return (
    <>
      {/* Expanded Menu Overlay */}
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-xl z-[60] transition-opacity duration-300 flex items-end ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={toggleMenu}>
        <div className={`w-full bg-[#1C1C1E] rounded-t-[3rem] p-8 pb-12 border-t border-white/10 shadow-2xl transition-all duration-500 transform ${isOpen ? 'translate-y-0' : 'translate-y-full'}`} onClick={e => e.stopPropagation()}>
          
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-white tracking-tight">Меню</h2>
            <button onClick={toggleMenu} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
             {menuItems.map(item => (
               <Link key={item.href} href={item.href} onClick={toggleMenu} className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-3xl active:scale-95 transition-all border border-white/5">
                 <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center mb-2 shadow-lg`}>
                   <div className="text-white">
                    {item.icon}
                   </div>
                 </div>
                 <span className="text-[10px] font-bold text-white/60 text-center leading-tight">{item.label}</span>
               </Link>
             ))}
          </div>
          
          <div className="space-y-3">
             {isSuperadmin && (
               <Link href="/superadmin" onClick={toggleMenu} className="flex items-center justify-center p-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2rem] active:scale-95 transition-all shadow-lg">
                  <svg className="w-5 h-5 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  <span className="text-xs font-black text-white uppercase tracking-widest">Суперадминка</span>
               </Link>
             )}

             <form action="/api/auth/signout" method="POST">
                <button type="submit" className="w-full p-5 bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">
                  Выйти из системы
                </button>
             </form>
          </div>
        </div>
      </div>

      {/* Main Tab Bar */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-[#1C1C1E]/80 backdrop-blur-2xl text-white flex justify-between items-center px-2 py-2 z-50 rounded-[2.5rem] shadow-2xl border border-white/10">
          <Link href="/admin" className={`flex flex-col items-center justify-center p-2 flex-1 transition-all active:scale-90 ${pathname === '/admin' ? 'text-blue-400' : 'opacity-40'}`}>
            <div className="w-7 h-7 flex items-center justify-center mb-1">
              {navItems[0].icon}
            </div>
            <span className="text-[9px] font-bold tracking-tight">Главная</span>
          </Link>

          <Link href="/admin/calendar" className={`flex flex-col items-center justify-center p-2 flex-1 transition-all active:scale-90 ${pathname === '/admin/calendar' ? 'text-blue-400' : ''}`}>
            <div className="w-12 h-12 -mt-10 rounded-full flex items-center justify-center bg-blue-500 shadow-[0_8px_20px_rgba(59,130,246,0.4)] border-[6px] border-[#1C1C1E] text-white">
               {navItems[1].icon}
            </div>
            <span className="text-[9px] font-bold tracking-tight mt-1">Календарь</span>
          </Link>

          <Link href="/admin/clients" className={`flex flex-col items-center justify-center p-2 flex-1 transition-all active:scale-90 ${pathname === '/admin/clients' ? 'text-blue-400' : 'opacity-40'}`}>
            <div className="w-7 h-7 flex items-center justify-center mb-1">
              {navItems[2].icon}
            </div>
            <span className="text-[9px] font-bold tracking-tight">Клиенты</span>
          </Link>

          <button onClick={toggleMenu} className={`flex flex-col items-center justify-center p-2 flex-1 transition-all active:scale-90 ${isOpen ? 'text-blue-400' : 'opacity-40'}`}>
            <div className="w-7 h-7 flex items-center justify-center mb-1">
               <svg className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </div>
            <span className="text-[9px] font-bold tracking-tight">Меню</span>
          </button>
      </nav>
    </>
  );
}
