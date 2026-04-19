import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPERADMIN") redirect("/login");

  return (
    <div className="min-h-screen flex bg-[#0A0A0A] font-sans text-white selection:bg-purple-500/30">
      {/* Sidebar - Pure Black */}
      <aside className="w-72 bg-[#121212] flex flex-col z-10 border-r border-white/5 py-8">
        <div className="flex flex-col items-center justify-center px-8 mb-10">
           <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl mb-4 shadow-[0_0_30px_rgba(168,85,247,0.4)]">S</div>
           <span className="font-bold text-xs tracking-[0.2em] uppercase text-white/50">Platform Owner</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <Link href="/superadmin" className="flex items-center px-5 py-4 rounded-xl hover:bg-white/5 font-bold transition-all hover:pl-7 group">
            <span className="text-white/40 group-hover:text-purple-400 mr-3 transition-colors">/</span> Dashboard
          </Link>
          <Link href="/superadmin/tenants" className="flex items-center px-5 py-4 rounded-xl hover:bg-white/5 font-bold transition-all hover:pl-7 group">
            <span className="text-white/40 group-hover:text-purple-400 mr-3 transition-colors">/</span> Tenants
          </Link>
          <Link href="/superadmin/users" className="flex items-center px-5 py-4 rounded-xl hover:bg-white/5 font-bold transition-all hover:pl-7 group">
            <span className="text-white/40 group-hover:text-purple-400 mr-3 transition-colors">/</span> Users
          </Link>
          <Link href="/superadmin/billing" className="flex items-center px-5 py-4 rounded-xl hover:bg-white/5 font-bold transition-all hover:pl-7 group text-emerald-400">
            <span className="text-emerald-400/40 group-hover:text-emerald-400 mr-3 transition-colors">/</span> Payments
          </Link>
        </nav>
        
        <div className="px-4 mt-auto">
           <form action="/api/auth/signout" method="POST">
             <button type="submit" className="flex items-center w-full px-5 py-4 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold transition-colors">
               Exit Owner Panel
             </button>
           </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-12 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/10 via-[#0A0A0A] to-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
