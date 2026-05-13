import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import SuperadminSidebar from "@/components/SuperadminSidebar";
import MobileSuperadminNav from "@/components/MobileSuperadminNav";

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPERADMIN") redirect("/login");

  return (
    <div className="min-h-screen flex bg-[#F8F9FD] font-sans text-[#1C1C1C]">
      <SuperadminSidebar />
      <MobileSuperadminNav />

      <div className="flex-1 flex flex-col min-h-screen w-full overflow-x-hidden">
        {/* Header */}
        <header className="h-20 md:h-24 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] flex items-center justify-between px-4 md:px-12 sticky top-0 z-40">
           <div className="hidden md:flex items-center bg-[#F3F4F6] rounded-2xl px-6 py-3 w-[450px] transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-gray-200">
              <svg className="w-5 h-5 text-gray-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" placeholder="Поиск по платформе..." className="bg-transparent outline-none text-sm w-full placeholder-gray-400 font-bold" />
           </div>

           {/* Mobile Logo */}
           <div className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-black text-sm shadow-lg">Z</div>
              <span className="font-black text-lg tracking-tighter">ZENO BOSS</span>
           </div>

           <div className="flex items-center gap-3 md:gap-8">
              <div className="relative hidden sm:block">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[#F3F4F6] flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-200 transition-all hover:scale-105 active:scale-95">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                </div>
                <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></div>
              </div>
              
              <div className="flex items-center gap-3 md:gap-4 md:pl-8 md:border-l border-gray-200">
                 <div className="text-right hidden xl:block">
                   <p className="text-sm font-black text-[#1C1C1C]">Admin Aura</p>
                   <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-0.5">Platform Owner</p>
                 </div>
                 <Link href="/superadmin/profile" className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black border border-indigo-100 shadow-sm text-base md:text-lg transition-all hover:scale-110 active:scale-95">A</Link>
              </div>
           </div>
        </header>

        {/* Content */}
        <main className="p-6 md:p-12 pb-32 md:pb-12">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
