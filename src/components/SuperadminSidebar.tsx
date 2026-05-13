"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SuperadminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-72 bg-white border-r border-[#E5E7EB] flex-col sticky top-0 h-screen">
      <div className="p-8 mb-4">
         <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-[#1C1C1C] text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-gray-200">Z</div>
           <span className="font-black text-2xl tracking-tighter text-[#1C1C1C]">ZENO</span>
         </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        <NavItem 
          href="/superadmin" 
          label="Главная" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>} 
          active={pathname === "/superadmin"} 
        />
        
        <div className="pt-6 pb-2 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Управление</div>
        <NavItem 
          href="/superadmin/tenants" 
          label="Салоны (Tenants)" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>} 
          active={pathname === "/superadmin/tenants"} 
        />
        <NavItem 
          href="/superadmin/plans" 
          label="Тарифы" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>} 
          active={pathname === "/superadmin/plans"} 
        />
        <NavItem 
          href="/superadmin/users" 
          label="Пользователи" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>} 
          active={pathname === "/superadmin/users"} 
        />
        <NavItem 
          href="/superadmin/complaints" 
          label="Жалобы" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>} 
          active={pathname === "/superadmin/complaints"} 
        />
        <NavItem 
          href="/superadmin/notifications" 
          label="Оповещения" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.297A2.453 2.453 0 019.209 21H8.791A2.453 2.453 0 017 18.706V6.444m4.2-1.895l1.86-1.034a2.453 2.453 0 013.147.78l3.712 5.059a2.453 2.453 0 01-.78 3.347l-1.86 1.034m-6.079-9.206a2.453 2.453 0 013.347.78L14.58 12.82a2.453 2.453 0 01-.78 3.347l-6.079 3.382m0 0l-1.86 1.034a2.453 2.453 0 01-3.147-.78L.002 14.803a2.453 2.453 0 01.78-3.347l1.86-1.034"></path></svg>} 
          active={pathname === "/superadmin/notifications"} 
        />
        
        <div className="pt-6 pb-2 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Финансы</div>
        <NavItem 
          href="/superadmin/billing" 
          label="Заявки на тариф" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>} 
          active={pathname === "/superadmin/billing"} 
        />
      </nav>
      
      <div className="p-6 mt-auto">
         <form action="/api/auth/signout" method="POST">
           <button type="submit" className="flex items-center w-full px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-50 font-bold transition-all gap-3 group">
             <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
             </div>
             Выход
           </button>
         </form>
      </div>
    </aside>
  );
}

function NavItem({ href, label, icon, active = false }: any) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 ${active ? 'bg-[#1C1C1C] text-white shadow-xl shadow-gray-200 translate-x-1' : 'text-gray-500 hover:bg-gray-50 hover:text-[#1C1C1C]'}`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${active ? 'bg-white/10' : 'bg-gray-50'}`}>
        {icon}
      </div>
      {label}
    </Link>
  );
}
