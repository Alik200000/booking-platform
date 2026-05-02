import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPERADMIN") redirect("/login");

  return (
    <div className="min-h-screen flex bg-[#F8F9FD] font-sans text-[#1C1C1C]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-[#E5E7EB] flex-col sticky top-0 h-screen">
        <div className="p-8 mb-4">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#4F46E5] text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-200">Z</div>
             <span className="font-black text-2xl tracking-tighter text-[#1C1C1C]">ZENO</span>
           </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <NavItem href="/superadmin" label="Главная" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>} active />
          
          <div className="pt-6 pb-2 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Управление</div>
          <NavItem href="/superadmin/tenants" label="Салоны (Tenants)" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>} />
          <NavItem href="/superadmin/users" label="Пользователи" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>} />
          
          <div className="pt-6 pb-2 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Финансы</div>
          <NavItem href="/superadmin/billing" label="Выплаты и MRR" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>} />
        </nav>
        
        <div className="p-6 mt-auto">
           <form action="/api/auth/signout" method="POST">
             <button type="submit" className="flex items-center w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-bold transition-colors gap-3">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
               Выйти из God Mode
             </button>
           </form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-20 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-10 sticky top-0 z-40">
           <div className="flex items-center bg-[#F3F4F6] rounded-2xl px-5 py-2.5 w-96">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" placeholder="Поиск по платформе..." className="bg-transparent outline-none text-sm w-full placeholder-gray-400 font-medium" />
           </div>

           <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-200 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
              </div>
              
              <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                 <div className="text-right hidden md:block">
                   <p className="text-sm font-bold text-[#1C1C1C]">Admin Aura</p>
                   <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Platform Owner</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-indigo-200 shadow-sm">A</div>
              </div>
           </div>
        </header>

        {/* Content */}
        <main className="p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, label, icon, active = false }: any) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 ${active ? 'bg-[#4F46E5] text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-[#F3F4F6] hover:text-[#1C1C1C]'}`}
    >
      {icon}
      {label}
    </Link>
  );
}
