import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import DeleteTenantButton from "@/components/DeleteTenantButton";
import ImpersonateButton from "@/components/ImpersonateButton";
import ShadowModeModal from "@/components/ShadowModeModal";

export default async function SuperadminDashboard() {
  const session = await auth();
  
  // Metrics
  const totalTenants = await prisma.tenant.count();
  const activeTenants = await prisma.tenant.count({ where: { isActive: true } });
  
  const totalBookings = await prisma.booking.count();
  const totalClients = await prisma.client.count();
  
  const subscriptions = await prisma.subscription.findMany({
     include: { tenant: true }
  });
  
  let mrr = 0;
  subscriptions.forEach((sub: any) => {
     if (sub.plan === "STARTER") mrr += 25000;
     if (sub.plan === "PRO") mrr += 45000;
     if (sub.plan === "PREMIUM") mrr += 95000;
  });

  const recentTenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { 
        subscription: true,
        _count: {
          select: { bookings: true, clients: true }
        }
      }
  });

  const activityLogs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8
  });

  // ... previous promo and message fetches ...
  const promoCodes = await prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
  });

  const systemMessages = await prisma.systemMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3
  });

  async function createBroadcast(formData: FormData) {
     "use server";
     const content = formData.get("content") as string;
     const type = formData.get("type") as string;
     await prisma.systemMessage.create({
        data: { content, type }
     });
     revalidatePath("/superadmin");
  }

  async function createPromo(formData: FormData) {
     "use server";
     const code = formData.get("code") as string;
     const discount = parseInt(formData.get("discount") as string);
     const days = parseInt(formData.get("days") as string);
     
     await prisma.promoCode.create({
        data: { 
          code, 
          discountPercentage: discount,
          expirationDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
        }
     });
     revalidatePath("/superadmin");
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-12 text-white flex justify-between items-end">
        <div>
          <h1 className="text-[3rem] font-black tracking-tight mb-2">Platform Radar</h1>
          <p className="text-white/50 text-lg">God Mode Active. Managing {totalTenants} businesses.</p>
        </div>
        <div className="flex items-center gap-4">
          <ShadowModeModal tenants={recentTenants} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
         {/* Metrics */}
         <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/20 blur-2xl rounded-full group-hover:bg-emerald-500/30 transition-colors"></div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-4">Total MRR</p>
            <p className="text-4xl lg:text-5xl font-black text-emerald-400 tracking-tighter">{mrr.toLocaleString('ru-RU')} ₸</p>
         </div>
         
         <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group text-white">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/20 blur-2xl rounded-full group-hover:bg-blue-500/30 transition-colors"></div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-4">Salons</p>
            <p className="text-4xl lg:text-5xl font-black tracking-tighter">{activeTenants} <span className="text-2xl text-white/20">/ {totalTenants}</span></p>
         </div>
         
         <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group text-white">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/20 blur-2xl rounded-full group-hover:bg-purple-500/30 transition-colors"></div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-4">Bookings</p>
            <p className="text-4xl lg:text-5xl font-black text-purple-400 tracking-tighter">{totalBookings}</p>
         </div>
         
         <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group text-white">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/20 blur-2xl rounded-full group-hover:bg-rose-500/30 transition-colors"></div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-4">Total Clients</p>
            <p className="text-4xl lg:text-5xl font-black text-rose-400 tracking-tighter">{totalClients}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
         {/* System Broadcast Card */}
         <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-2xl text-white">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
               <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs">📢</span>
               System Broadcast
            </h2>
            <form action={createBroadcast} className="space-y-4">
               <textarea 
                  name="content"
                  placeholder="Важное сообщение для всех владельцев..."
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all resize-none h-24"
               />
               <div className="flex gap-2">
                  <select name="type" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none">
                     <option value="INFO">INFO</option>
                     <option value="WARNING">WARNING</option>
                     <option value="SUCCESS">SUCCESS</option>
                  </select>
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-xs font-bold transition-all">
                     Отправить
                  </button>
               </div>
            </form>

            <div className="mt-8 space-y-3">
               <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">Последние:</p>
               {systemMessages.map((msg: any) => (
                  <div key={msg.id} className="p-3 bg-white/5 rounded-xl border border-white/5">
                     <p className="text-xs text-white/80">{msg.content}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* Promo Code Card */}
         <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-2xl text-white">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
               <span className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs">🎟</span>
               Promo Codes
            </h2>
            <form action={createPromo} className="space-y-4">
               <input 
                  type="text" 
                  name="code"
                  placeholder="SUMMER2026"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-all"
               />
               <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl text-xs font-bold transition-all">
                  Создать
               </button>
            </form>

            <div className="mt-8 space-y-3">
               <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">Активные:</p>
               {promoCodes.map((pc: any) => (
                  <div key={pc.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
                     <p className="text-xs font-bold">{pc.code}</p>
                     <span className="text-[10px] font-black text-purple-400">{pc.discountPercentage}%</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Activity Log (NEW) */}
         <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-2xl text-white">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
               <span className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">⚡</span>
               Live Activity
            </h2>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
               {activityLogs.map((log: any) => (
                  <div key={log.id} className="relative pl-6 border-l border-white/10 py-1">
                     <div className="absolute left-[-5px] top-3 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                     <p className="text-xs font-bold text-white/90">{log.tenantName || 'System'}</p>
                     <p className="text-[10px] text-white/40 mb-1">{log.details || log.action}</p>
                     <p className="text-[8px] text-white/20 uppercase">{new Date(log.createdAt).toLocaleTimeString()}</p>
                  </div>
               ))}
               {activityLogs.length === 0 && (
                  <p className="text-white/20 text-xs italic">No activity yet...</p>
               )}
            </div>
         </div>
      </div>

      {/* Global Salon Management Table */}
      <div className="bg-[#121212] border border-white/5 rounded-3xl p-10 shadow-2xl text-white mb-12">
         <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Global Business Management</h2>
            <div className="flex gap-4">
               <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Total MRR: {mrr.toLocaleString()} ₸</span>
            </div>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="border-b border-white/5">
                  <tr>
                     <th className="pb-4 text-xs font-bold uppercase tracking-wider text-white/30">Business</th>
                     <th className="pb-4 text-xs font-bold uppercase tracking-wider text-white/30">Usage</th>
                     <th className="pb-4 text-xs font-bold uppercase tracking-wider text-white/30">Status & Plan</th>
                     <th className="pb-4 text-xs font-bold uppercase tracking-wider text-white/30">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {recentTenants.map((t: any) => (
                     <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-blue-400 border border-white/5">
                                 {t.name[0]}
                              </div>
                              <div>
                                 <p className="font-bold text-white/90">{t.name}</p>
                                 <a 
                                   href={`/${t.slug}`} 
                                   target="_blank" 
                                   className="text-[10px] text-white/20 hover:text-amber-500 transition-colors flex items-center gap-1"
                                 >
                                   <span>/{t.slug}</span>
                                   <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                   <span className="text-[9px] opacity-50 ml-1">• Joined {new Date(t.createdAt).toLocaleDateString()}</span>
                                 </a>
                              </div>
                           </div>
                        </td>
                        <td className="py-6">
                           <div className="flex flex-col gap-1">
                              <p className="text-xs font-bold text-white/70">{t._count.bookings} <span className="text-[10px] text-white/20 font-medium">Bookings</span></p>
                              <p className="text-xs font-bold text-white/70">{t._count.clients} <span className="text-[10px] text-white/20 font-medium">Clients</span></p>
                           </div>
                        </td>
                        <td className="py-6">
                           <SuperadminTenantActions 
                              tenantId={t.id} 
                              isSuspended={t.isSuspended} 
                              currentPlan={t.subscription?.plan || "FREE"} 
                              currentSlug={t.slug}
                           />
                        </td>
                        <td className="py-6">
                           <div className="flex items-center gap-3">
                              <ImpersonateButton tenantId={t.id} tenantName={t.name} />
                              <DeleteTenantButton tenantId={t.id} tenantName={t.name} />
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

import SuperadminTenantActions from "@/components/SuperadminTenantActions";
