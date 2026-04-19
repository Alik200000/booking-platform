import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SuperadminDashboard() {
  const session = await auth();
  
  // Metrics
  const totalTenants = await prisma.tenant.count();
  const activeTenants = await prisma.tenant.count({ where: { isActive: true } });
  
  const totalBookings = await prisma.booking.count();
  const totalClients = await prisma.client.count();
  
  const subscriptions = await prisma.subscription.findMany();
  let mrr = 0;
  subscriptions.forEach((sub: any) => {
     if (sub.plan === "STARTER") mrr += 25000;
     if (sub.plan === "PRO") mrr += 45000;
  });

  const recentTenants = await prisma.tenant.findMany({
     orderBy: { createdAt: 'desc' },
     take: 5,
     include: { subscription: true }
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-12">
        <h1 className="text-[3rem] font-black tracking-tight mb-2">Platform Radar</h1>
        <p className="text-white/50 text-lg">Welcome back, {session?.user?.name}. Here is your global SaaS status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
         <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/20 blur-2xl rounded-full group-hover:bg-emerald-500/30 transition-colors"></div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-4">Total MRR</p>
            <p className="text-5xl font-black text-emerald-400 tracking-tighter">{mrr.toLocaleString('ru-RU')} ₸</p>
         </div>
         
         <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/20 blur-2xl rounded-full group-hover:bg-blue-500/30 transition-colors"></div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-4">Active Salons</p>
            <p className="text-5xl font-black tracking-tighter">{activeTenants} <span className="text-2xl text-white/20">/ {totalTenants}</span></p>
         </div>
         
         <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/20 blur-2xl rounded-full group-hover:bg-purple-500/30 transition-colors"></div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-4">Booking Volume</p>
            <p className="text-5xl font-black text-purple-400 tracking-tighter">{totalBookings}</p>
         </div>
         
         <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/20 blur-2xl rounded-full group-hover:bg-rose-500/30 transition-colors"></div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-4">Total Clients</p>
            <p className="text-5xl font-black text-rose-400 tracking-tighter">{totalClients}</p>
         </div>
      </div>

      <div className="bg-[#121212] border border-white/5 rounded-3xl p-10 shadow-2xl">
         <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Recent Registrations</h2>
            <Link href="/superadmin/tenants" className="text-sm font-bold text-white/30 hover:text-white transition-colors">View All →</Link>
         </div>
         
         <table className="w-full text-left">
            <thead className="border-b border-white/5">
               <tr>
                  <th className="pb-4 text-xs font-bold uppercase tracking-wider text-white/30">Salon Name</th>
                  <th className="pb-4 text-xs font-bold uppercase tracking-wider text-white/30">Registered</th>
                  <th className="pb-4 text-xs font-bold uppercase tracking-wider text-white/30">Plan</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {recentTenants.map((t: any) => (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors">
                     <td className="py-5 font-bold">{t.name}</td>
                     <td className="py-5 text-white/50">{t.createdAt.toLocaleDateString()}</td>
                     <td className="py-5">
                        <span className="bg-purple-500/10 text-purple-400 px-3 py-1.5 rounded-md text-xs font-bold uppercase">{t.subscription?.plan || "FREE"}</span>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}
