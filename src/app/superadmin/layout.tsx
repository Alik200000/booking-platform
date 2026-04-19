import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPERADMIN") redirect("/login");

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0A0A0A] font-sans text-white selection:bg-purple-500/30">
      {/* Sidebar / Topbar */}
      <aside className="w-full md:w-72 bg-[#121212] flex flex-col md:flex-col z-10 border-b md:border-b-0 md:border-r border-white/5 py-6 md:py-8">
        <div className="flex md:flex-col items-center justify-between md:justify-center px-6 md:px-8 mb-6 md:mb-10">
           <div className="flex items-center gap-4 md:flex-col md:gap-0">
             <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl md:rounded-2xl flex items-center justify-center font-black text-xl md:text-2xl md:mb-4 shadow-[0_0_30px_rgba(168,85,247,0.4)]">S</div>
             <span className="font-bold text-[10px] md:text-xs tracking-[0.2em] uppercase text-white/50">Platform Owner</span>
           </div>
           {/* Mobile Exit Button */}
           <div className="md:hidden">
             <form action="/api/auth/signout" method="POST">
               <button type="submit" className="text-xs text-red-500 font-bold bg-red-500/10 px-4 py-2 rounded-lg">Exit</button>
             </form>
           </div>
        </div>
        
        <nav className="flex md:flex-col overflow-x-auto md:overflow-y-auto px-4 gap-2 md:gap-0 md:space-y-2 pb-2 md:pb-0 scrollbar-hide">
          <Link href="/superadmin" className="flex items-center whitespace-nowrap px-4 md:px-5 py-3 md:py-4 rounded-xl bg-white/5 md:bg-transparent md:hover:bg-white/5 font-bold transition-all md:hover:pl-7 group">
            <span className="hidden md:inline text-white/40 group-hover:text-purple-400 mr-3 transition-colors">/</span> Dashboard
          </Link>
          <Link href="/superadmin/tenants" className="flex items-center whitespace-nowrap px-4 md:px-5 py-3 md:py-4 rounded-xl bg-white/5 md:bg-transparent md:hover:bg-white/5 font-bold transition-all md:hover:pl-7 group">
            <span className="hidden md:inline text-white/40 group-hover:text-purple-400 mr-3 transition-colors">/</span> Tenants
          </Link>
          <Link href="/superadmin/users" className="flex items-center whitespace-nowrap px-4 md:px-5 py-3 md:py-4 rounded-xl bg-white/5 md:bg-transparent md:hover:bg-white/5 font-bold transition-all md:hover:pl-7 group">
            <span className="hidden md:inline text-white/40 group-hover:text-purple-400 mr-3 transition-colors">/</span> Users
          </Link>
          <Link href="/superadmin/billing" className="flex items-center whitespace-nowrap px-4 md:px-5 py-3 md:py-4 rounded-xl bg-white/5 md:bg-transparent md:hover:bg-white/5 font-bold transition-all md:hover:pl-7 group text-emerald-400">
            <span className="hidden md:inline text-emerald-400/40 group-hover:text-emerald-400 mr-3 transition-colors">/</span> Payments
          </Link>
        </nav>
        
        <div className="hidden md:block px-4 mt-auto">
           <form action="/api/auth/signout" method="POST">
             <button type="submit" className="flex items-center w-full px-5 py-4 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold transition-colors">
               Exit Owner Panel
             </button>
           </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6 md:p-12 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/10 via-[#0A0A0A] to-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
