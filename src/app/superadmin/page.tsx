import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import DeleteTenantButton from "@/components/DeleteTenantButton";
import ImpersonateButton from "@/components/ImpersonateButton";
import ShadowModeModal from "@/components/ShadowModeModal";

export default async function SuperAdminDashboard() {
  const session = await auth();
  if (!session || session.user?.role !== "SUPERADMIN") redirect("/login");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0,0,0,0);
  
  const startOfPrevMonth = new Date(startOfMonth);
  startOfPrevMonth.setMonth(startOfPrevMonth.getMonth() - 1);

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

  const totalRevenue = subscriptions.reduce((acc, sub) => {
     if (sub.plan === 'PREMIUM') return acc + 95000;
     if (sub.plan === 'PRO') return acc + 45000;
     if (sub.plan === 'STARTER') return acc + 25000;
     return acc;
  }, 0);
  const mrr = totalRevenue;

  const settings = await prisma.globalSettings.findUnique({ where: { id: "global" } }) || { platformCommission: 5 };
  
  // Real Commission Revenue (approx from completed bookings)
  const completedBookings = await prisma.booking.findMany({
     where: { status: 'CONFIRMED' },
     include: { service: true }
  });
  const totalServiceVolume = completedBookings.reduce((acc, b) => acc + b.service.price, 0);
  const totalCommissionRevenue = (totalServiceVolume * settings.platformCommission) / 100;

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

  const allTenantsForShadow = await prisma.tenant.findMany({
    select: { id: true, name: true, slug: true }
  });

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-20">
      {/* Premium Header */}
      <div className="bg-white border-b border-black/5 px-4 sm:px-8 py-6 sm:py-10 mb-6 sm:mb-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-3xl sm:text-[42px] font-black text-[#1D1D1F] tracking-tight leading-tight">Управление</h1>
            <p className="text-sm sm:text-[17px] text-[#86868B] font-medium mt-1 sm:mt-2">Добро пожаловать в центр управления платформой ZENO</p>
          </div>
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 bg-[#F5F5F7] p-2 sm:p-3 rounded-2xl border border-black/5">
             <div className="flex items-center gap-2 px-2 sm:px-3">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#1D1D1F]">Live Status</span>
             </div>
             <div className="h-4 sm:h-6 w-px bg-black/10"></div>
             <div className="px-2 sm:px-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span className="text-xs sm:text-[13px] font-bold text-[#1D1D1F]">{new Date().toLocaleDateString('ru-RU')}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8 sm:space-y-12">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
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
            label="Заказы" 
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

        {/* Recent Tenants Table - Mobile Optimized */}
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-black/5 overflow-hidden">
          <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-black/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#1D1D1F]">Последние бизнесы</h2>
              <p className="text-sm text-[#86868B] font-medium mt-1">Список новых регистраций на платформе</p>
            </div>
            <Link href="/superadmin/tenants" className="w-full sm:w-auto text-center px-6 py-3 bg-[#F5F5F7] text-[#1D1D1F] rounded-xl font-bold text-sm hover:bg-[#E5E5EA] transition-all">
              Все бизнесы
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#F5F5F7]/50">
                  <th className="px-10 py-5 text-[11px] font-black uppercase tracking-widest text-[#86868B]">Бизнес</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-[#86868B]">Город</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-[#86868B]">Тариф</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-[#86868B]">Активность</th>
                  <th className="px-10 py-5 text-[11px] font-black uppercase tracking-widest text-[#86868B] text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {recentTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-[#F5F5F7]/30 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#F5F5F7] rounded-xl flex items-center justify-center text-lg font-bold text-[#1D1D1F] border border-black/5 overflow-hidden">
                          {tenant.logoUrl ? <img src={tenant.logoUrl} className="w-full h-full object-cover" /> : tenant.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-[#1D1D1F]">{tenant.name}</p>
                          <p className="text-[11px] text-[#86868B] font-medium">{tenant.slug}.zapis.online</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm font-bold text-[#1D1D1F]">
                       {tenant.city || "Алматы"}
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                        tenant.subscription?.plan === 'PRO' ? 'bg-indigo-50 text-indigo-600' : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {tenant.subscription?.plan || 'FREE'}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4 text-xs font-bold text-[#1D1D1F]">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          {tenant._count.bookings}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                          {tenant._count.clients}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                       <div className="flex justify-end items-center gap-2">
                          <ImpersonateButton tenantId={tenant.id} />
                          <DeleteTenantButton tenantId={tenant.id} tenantName={tenant.name} />
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Settings & Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
           <div className="lg:col-span-1 bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-black/5">
              <h3 className="text-xl sm:text-2xl font-black text-[#1D1D1F] mb-2">Комиссия</h3>
              <p className="text-sm text-[#86868B] font-medium mb-8">Управление процентом платформы</p>
              
              <form action={updateCommission} className="space-y-6">
                 <div className="relative">
                    <input 
                      name="percentage"
                      type="number" 
                      step="0.1"
                      defaultValue={settings.platformCommission}
                      className="w-full bg-[#F5F5F7] border-none rounded-2xl px-6 py-4 font-bold text-xl outline-none focus:ring-4 focus:ring-amber-500/10 transition-all" 
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-xl text-[#86868B]">%</span>
                 </div>
                 <button type="submit" className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]">
                    Обновить комиссию
                 </button>
              </form>
           </div>

           <div className="lg:col-span-2 bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-black/5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                 <div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#1D1D1F]">Активность</h3>
                    <p className="text-sm text-[#86868B] font-medium">Журнал последних событий системы</p>
                 </div>
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                       <div key={i} className="w-10 h-10 rounded-full bg-[#F5F5F7] border-2 border-white flex items-center justify-center overflow-hidden">
                          <img src={`https://i.pravatar.cc/100?u=${i}`} className="w-full h-full object-cover grayscale opacity-50" />
                       </div>
                    ))}
                 </div>
              </div>
              
              <div className="space-y-4">
                 {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[#F5F5F7]/50 transition-colors group">
                       <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#1D1D1F] truncate">{log.action}</p>
                          <p className="text-[11px] text-[#86868B] font-medium">{new Date(log.createdAt).toLocaleString()}</p>
                       </div>
                       <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Details</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
      <ShadowModeModal tenants={allTenantsForShadow as any} />
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
    <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-black/5 hover:shadow-xl transition-all hover:-translate-y-1 group">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${colorMap[color]}`}>
          {icon}
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black tracking-widest flex items-center gap-1 ${trendColorMap[color]}`}>
           {trend}
        </div>
      </div>
      <div>
        <p className="text-[11px] sm:text-[13px] font-black text-[#86868B] uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl sm:text-3xl font-black text-[#1D1D1F] tracking-tight">{value}</p>
      </div>
    </div>
  );
}
