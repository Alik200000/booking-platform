import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import DeleteTenantButton from "@/components/DeleteTenantButton";
import ImpersonateButton from "@/components/ImpersonateButton";
import ShadowModeModal from "@/components/ShadowModeModal";
import SuperadminTenantActions from "@/components/SuperadminTenantActions";

export default async function SuperadminDashboard() {
  const session = await auth();
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Metrics
  const totalTenants = await prisma.tenant.count();
  const totalBookings = await prisma.booking.count();
  
  // Unique Clients by phone number (combine User and Booking)
  const uniqueUserPhones = await prisma.user.findMany({
    where: { role: 'CLIENT', NOT: { phoneNumber: null } },
    select: { phoneNumber: true }
  });
  const uniqueBookingPhones = await prisma.booking.findMany({
    select: { clientPhone: true }
  });
  
  const allPhones = new Set([
    ...uniqueUserPhones.map(u => u.phoneNumber),
    ...uniqueBookingPhones.map(b => b.clientPhone)
  ]);
  const totalClients = allPhones.size;
  
  const prevMonthBookings = await prisma.booking.count({
    where: { createdAt: { gte: startOfPrevMonth, lt: startOfMonth } }
  });
  const currentMonthBookings = await prisma.booking.count({
    where: { createdAt: { gte: startOfMonth } }
  });

  const bookingTrend = prevMonthBookings === 0 ? (currentMonthBookings > 0 ? 100 : 0) : Math.round(((currentMonthBookings - prevMonthBookings) / prevMonthBookings) * 100);
  
  const subscriptions = await prisma.subscription.findMany({
     include: { tenant: true }
  });
  
  let mrr = 0;
  subscriptions.forEach((sub: any) => {
     if (sub.plan === "STARTER") mrr += 25000;
     if (sub.plan === "PRO") mrr += 45000;
     if (sub.plan === "PREMIUM") mrr += 95000;
  });

  const settings = await prisma.globalSettings.findUnique({ where: { id: "global" } }) 
    || { platformCommission: 5 };

  const allBookings = await prisma.booking.findMany({
    where: { status: { in: ["PENDING", "CONFIRMED"] } },
    include: { service: true }
  });

  const totalCommissionRevenue = allBookings.reduce((sum, b) => 
    sum + (b.service.price * settings.platformCommission / 100), 0
  );

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
      take: 5
  });

  const systemMessages = await prisma.systemMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3
  });

  async function updateCommission(formData: FormData) {
     "use server";
     const percentage = parseFloat(formData.get("percentage") as string);
     await prisma.globalSettings.upsert({
        where: { id: "global" },
        update: { platformCommission: percentage },
        create: { id: "global", platformCommission: percentage }
     });
     revalidatePath("/superadmin");
  }

  async function createBroadcast(formData: FormData) {
     "use server";
     const content = formData.get("content") as string;
     await prisma.systemMessage.create({
        data: { content, type: "INFO" }
     });
     revalidatePath("/superadmin");
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Info */}
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-black tracking-tight text-[#1C1C1C]">Главная</h1>
           <p className="text-gray-400 font-medium text-sm mt-1">Добро пожаловать в центр управления платформой</p>
        </div>
        <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm">
           <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
           <span className="text-sm font-bold text-gray-600">
             {startOfMonth.toLocaleDateString('ru-RU')} — {now.toLocaleDateString('ru-RU')}
           </span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard 
          label="Всего бизнесов" 
          value={totalTenants.toLocaleString()} 
          trend="Активные" 
          color="indigo"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>}
        />
        <MetricCard 
          label="Общий доход (MRR)" 
          value={`${mrr.toLocaleString()} ₸`} 
          trend="+0%" 
          color="emerald"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
        />
        <MetricCard 
          label="Заказы (Платформа)" 
          value={totalBookings.toLocaleString()} 
          trend={`${bookingTrend >= 0 ? '+' : ''}${bookingTrend}%`} 
          color="blue"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>}
        />
        <MetricCard 
          label="Всего клиентов" 
          value={totalClients.toLocaleString()} 
          trend="Уникальные" 
          color="purple"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
        />
        <MetricCard 
          label="Комиссия (≈)" 
          value={`${Math.round(totalCommissionRevenue).toLocaleString()} ₸`} 
          trend={`${settings.platformCommission}%`}
          color="amber"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Business Management Table */}
        <section className="lg:col-span-2 bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-sm">
           <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-[#1C1C1C]">Управление бизнесами</h2>
              <ShadowModeModal tenants={recentTenants} />
           </div>
           <div className="overflow-x-auto">
              <table className="w-full">
                 <thead>
                    <tr className="text-left border-b border-gray-100">
                       <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Салон</th>
                       <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Активность</th>
                       <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Действия</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {recentTenants.map((t: any) => (
                       <tr key={t.id} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="py-5">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center font-bold text-indigo-600">
                                   {t.name[0]}
                                </div>
                                <div>
                                   <p className="font-bold text-[#1C1C1C] text-sm">{t.name}</p>
                                   <p className="text-[10px] text-gray-400 font-medium">/{t.slug}</p>
                                </div>
                             </div>
                          </td>
                          <td className="py-5">
                             <div className="flex items-center gap-6">
                                <div>
                                   <p className="text-xs font-black text-[#1C1C1C]">{t._count.bookings}</p>
                                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Записей</p>
                                </div>
                                <SuperadminTenantActions 
                                   tenantId={t.id} 
                                   isSuspended={t.isSuspended} 
                                   currentPlan={t.subscription?.plan || "FREE"} 
                                   currentSlug={t.slug}
                                />
                             </div>
                          </td>
                          <td className="py-5 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <ImpersonateButton tenantId={t.id} tenantName={t.name} />
                                <DeleteTenantButton tenantId={t.id} tenantName={t.name} />
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </section>

        {/* Side Panels */}
        <div className="space-y-8">
           {/* Platform Commission Settings */}
           <section className="bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-sm">
              <h2 className="text-lg font-black text-[#1C1C1C] mb-6 flex items-center gap-2">
                 <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs">⚙️</span>
                 Настройки платформы
              </h2>
              <form action={updateCommission} className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Глобальная комиссия (%)</label>
                    <div className="flex gap-2">
                       <input 
                          type="number" 
                          name="percentage"
                          defaultValue={settings.platformCommission}
                          step="0.1"
                          className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-all font-bold"
                       />
                       <button type="submit" className="bg-[#1C1C1C] text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-gray-800 transition-all">
                          Обновить
                       </button>
                    </div>
                 </div>
              </form>
           </section>

           {/* System Messages */}
           <section className="bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-sm">
              <h2 className="text-lg font-black text-[#1C1C1C] mb-6 flex items-center gap-2">
                 <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">📢</span>
                 Оповещения
              </h2>
              <form action={createBroadcast} className="space-y-4 mb-8">
                 <textarea 
                    name="content"
                    placeholder="Текст сообщения..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm outline-none focus:border-indigo-500 transition-all resize-none h-20"
                 />
                 <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl text-xs font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                    Разослать всем
                 </button>
              </form>
              <div className="space-y-3">
                 {systemMessages.map((msg: any) => (
                    <div key={msg.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                       <p className="text-xs font-medium text-gray-600 leading-relaxed">{msg.content}</p>
                    </div>
                 ))}
              </div>
           </section>

           {/* Activity Log */}
           <section className="bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-sm">
              <h2 className="text-lg font-black text-[#1C1C1C] mb-6 flex items-center gap-2">
                 <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">⚡</span>
                 Активность
              </h2>
              <div className="space-y-5">
                 {activityLogs.map((log: any) => (
                    <div key={log.id} className="flex gap-4 items-start group">
                       <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <span className="text-[10px]">✨</span>
                       </div>
                       <div>
                          <p className="text-xs font-black text-[#1C1C1C]">{log.tenantName || 'Система'}</p>
                          <p className="text-[10px] text-gray-400 font-medium mt-0.5">{log.details || log.action}</p>
                          <p className="text-[9px] text-gray-300 font-bold uppercase mt-1">{new Date(log.createdAt).toLocaleTimeString()}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, trend, color, icon }: any) {
  const colorMap: any = {
    emerald: 'bg-emerald-50 text-emerald-600 shadow-emerald-100/50',
    blue: 'bg-blue-50 text-blue-600 shadow-blue-100/50',
    purple: 'bg-purple-50 text-purple-600 shadow-purple-100/50',
    amber: 'bg-amber-50 text-amber-600 shadow-amber-100/50',
    indigo: 'bg-indigo-50 text-indigo-600 shadow-indigo-100/50',
  };

  const trendColorMap: any = {
    emerald: 'text-emerald-600 bg-emerald-50',
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    amber: 'text-amber-600 bg-amber-50',
    indigo: 'text-indigo-600 bg-indigo-50',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-[2rem] p-7 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${colorMap[color]}`}>
          {icon}
        </div>
        <span className={`text-[10px] font-black px-2 py-1 rounded-full ${trendColorMap[color]}`}>
          {trend}
        </span>
      </div>
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black tracking-tight text-[#1C1C1C]">{value}</p>
    </div>
  );
}
