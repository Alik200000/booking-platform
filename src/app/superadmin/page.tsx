import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import DeleteTenantButton from "@/components/DeleteTenantButton";
import ImpersonateButton from "@/components/ImpersonateButton";
import ShadowModeModal from "@/components/ShadowModeModal";
import { updateTenantPlan, updateGlobalSettings, updateTenantDiscount } from "@/app/actions/superadmin";

export default async function SuperAdminDashboard() {
  const session = await auth();
  if (!session || session.user?.role !== "SUPERADMIN") redirect("/login");

  const now = new Date();
  const startOfDay = new Date(now); startOfDay.setHours(0,0,0,0);
  
  // Monday of current week
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0,0,0,0);

  const startOfMonth = new Date(now);
  startOfMonth.setDate(1);
  startOfMonth.setHours(0,0,0,0);

  let settings = { platformCommission: 5, starterPrice: 15000, proPrice: 25000, premiumPrice: 45000, globalDiscount: 0 };
  let commissionStats = { day: 0, week: 0, month: 0 };
  let recentTenants: any[] = [];
  let activityLogs: any[] = [];
  let allTenantsForShadow: any[] = [];
  let tenantCommissions: any[] = [];
  
  let totalTenants = 0;
  let totalBookings = 0;
  let totalClients = 0;
  let mrr = 0;
  let totalCommissionRevenue = 0;
  let bookingTrend = 0;

  try {
    totalTenants = await prisma.tenant.count();
    totalBookings = await prisma.booking.count();
    
    const prevMonthBookings = await prisma.booking.count({
      where: { createdAt: { gte: new Date(startOfMonth.getTime() - 30 * 24 * 60 * 60 * 1000), lt: startOfMonth } }
    });
    const currentMonthBookings = await prisma.booking.count({
      where: { createdAt: { gte: startOfMonth } }
    });
    bookingTrend = prevMonthBookings === 0 ? (currentMonthBookings > 0 ? 100 : 0) : Math.round(((currentMonthBookings - prevMonthBookings) / prevMonthBookings) * 100);

    // ... client count logic ...
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
    totalClients = allPhones.size;

    settings = await prisma.globalSettings.findUnique({ where: { id: "global" } }) as any || settings;
    
    // MRR Calculation
    const subscriptions = await prisma.subscription.findMany({
       include: { tenant: true }
    });
    mrr = subscriptions.reduce((acc, sub) => {
       let basePrice = 0;
       if (sub.plan === 'PREMIUM') basePrice = settings.premiumPrice;
       if (sub.plan === 'PRO') basePrice = settings.proPrice;
       if (sub.plan === 'STARTER') basePrice = settings.starterPrice;
       const totalDiscount = (settings.globalDiscount || 0) + (sub.customDiscount || 0);
       return acc + (basePrice * (1 - Math.min(totalDiscount, 100) / 100));
    }, 0);

    // Global Commission Stats
    const confirmedBookings = await prisma.booking.findMany({
      where: { status: 'CONFIRMED' },
      include: { service: true }
    });

    commissionStats = confirmedBookings.reduce((acc, b) => {
      const vol = b.service.price;
      const comm = (vol * settings.platformCommission) / 100;
      const bDate = new Date(b.startTime);
      
      if (bDate >= startOfDay) acc.day += comm;
      if (bDate >= startOfWeek) acc.week += comm;
      if (bDate >= startOfMonth) acc.month += comm;
      
      return acc;
    }, { day: 0, week: 0, month: 0 });

    totalCommissionRevenue = confirmedBookings.reduce((acc, b) => acc + (b.service.price * settings.platformCommission / 100), 0);

    // Tenant-specific Commissions
    const tenants = await prisma.tenant.findMany({
      include: {
        bookings: {
          where: { status: 'CONFIRMED' },
          include: { service: true }
        }
      }
    });

    tenantCommissions = tenants.map(t => {
      const stats = t.bookings.reduce((acc, b) => {
        const vol = b.service.price;
        const comm = (vol * settings.platformCommission) / 100;
        const bDate = new Date(b.startTime);
        
        if (bDate >= startOfDay) acc.day += comm;
        if (bDate >= startOfWeek) acc.week += comm;
        if (bDate >= startOfMonth) acc.month += comm;
        acc.total += comm;
        
        return acc;
      }, { day: 0, week: 0, month: 0, total: 0 });

      return {
        id: t.id,
        name: t.name,
        ...stats
      };
    }).sort((a, b) => b.total - a.total);

    recentTenants = await prisma.tenant.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { 
          subscription: true,
          _count: {
            select: { bookings: true, clients: true }
          }
        }
    });

    activityLogs = await prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    allTenantsForShadow = await prisma.tenant.findMany({
      select: { id: true, name: true, slug: true }
    });
  } catch (error) {
    console.error("SuperAdminDashboard data error:", error);
  }

  async function updateSettings(formData: FormData) {
     "use server";
     try {
       const commission = parseFloat(formData.get("commission") as string);
       const starter = parseInt(formData.get("starter") as string);
       const pro = parseInt(formData.get("pro") as string);
       const premium = parseInt(formData.get("premium") as string);
       const discount = parseInt(formData.get("discount") as string);

       await prisma.globalSettings.upsert({
          where: { id: "global" },
          update: { 
            platformCommission: commission,
            starterPrice: starter,
            proPrice: pro,
            premiumPrice: premium,
            globalDiscount: discount
          },
          create: { 
            id: "global", 
            platformCommission: commission,
            starterPrice: starter,
            proPrice: pro,
            premiumPrice: premium,
            globalDiscount: discount
          }
       });
       revalidatePath("/superadmin");
     } catch (e) {
       console.error(e);
     }
  }

  async function updateCustomDiscount(formData: FormData) {
    "use server";
    const subId = formData.get("subId") as string;
    const discount = parseInt(formData.get("discount") as string);
    if (subId) {
      await prisma.subscription.update({
        where: { id: subId },
        data: { customDiscount: discount }
      });
      revalidatePath("/superadmin");
    }
  }


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
            label="Комиссия (Месяц)" 
            value={`${Math.round(commissionStats.month).toLocaleString()} ₸`} 
            trend={`Неделя: ${Math.round(commissionStats.week).toLocaleString()} ₸`} 
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
                {recentTenants.map((tenant: any) => (
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
                      <div className="flex flex-col">
                        <form action={async (fd) => {
                          "use server";
                          await updateTenantPlan(fd.get("tenantId") as string, fd.get("plan") as any);
                        }} className="flex items-center gap-2">

                          <input type="hidden" name="tenantId" value={tenant.id} />
                          <select 
                            name="plan"
                            defaultValue={tenant.subscription?.plan || 'FREE'}
                            onChange={(e) => e.target.form?.requestSubmit()}
                            className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase outline-none border-none cursor-pointer ${
                              tenant.subscription?.plan === 'PRO' ? 'bg-indigo-50 text-indigo-600' : 
                              tenant.subscription?.plan === 'PREMIUM' ? 'bg-amber-50 text-amber-600' :
                              'bg-zinc-100 text-zinc-600'
                            }`}
                          >
                            <option value="FREE">FREE</option>
                            <option value="STARTER">STARTER</option>
                            <option value="PRO">PRO</option>
                            <option value="PREMIUM">PREMIUM</option>
                          </select>
                        </form>
                        {tenant.subscription?.customDiscount > 0 && (
                          <span className="text-[9px] font-bold text-emerald-500 mt-1">Скидка: -{tenant.subscription.customDiscount}%</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-6">
                      <form action={updateTenantDiscount} className="flex items-center gap-2">

                        <input type="hidden" name="subId" value={tenant.subscription?.id} />
                        <input 
                          name="discount" 
                          type="number" 
                          defaultValue={tenant.subscription?.customDiscount || 0}
                          className="w-12 bg-[#F5F5F7] border border-black/5 rounded-lg px-2 py-1 text-xs font-bold outline-none"
                        />
                        <button type="submit" className="text-[9px] font-black uppercase text-blue-500 hover:text-blue-700">OK</button>
                      </form>
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

        {/* Commissions by Business Section */}
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-black/5 overflow-hidden">
          <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-black/5">
            <h2 className="text-xl sm:text-2xl font-black text-[#1D1D1F]">Комиссии по бизнесам</h2>
            <p className="text-sm text-[#86868B] font-medium mt-1">Детализация доходов от каждого заведения ({settings.platformCommission}%)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#F5F5F7]/50 text-[10px] font-black uppercase tracking-widest text-[#86868B]">
                  <th className="px-10 py-4">Название бизнеса</th>
                  <th className="px-6 py-4">Сегодня</th>
                  <th className="px-6 py-4">Эта неделя</th>
                  <th className="px-6 py-4">Этот месяц</th>
                  <th className="px-10 py-4 text-right">Всего за все время</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {tenantCommissions.map((tc) => (
                  <tr key={tc.id} className="hover:bg-[#F5F5F7]/30 transition-colors">
                    <td className="px-10 py-5 font-bold text-[#1D1D1F]">{tc.name}</td>
                    <td className="px-6 py-5">
                      <span className={`font-black ${tc.day > 0 ? 'text-emerald-600' : 'text-zinc-300'}`}>
                        {tc.day.toLocaleString()} ₸
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-[#1D1D1F]">{tc.week.toLocaleString()} ₸</td>
                    <td className="px-6 py-5 text-sm font-bold text-[#1D1D1F]">{tc.month.toLocaleString()} ₸</td>
                    <td className="px-10 py-5 text-right font-black text-[#1D1D1F] bg-[#F5F5F7]/10">
                      {tc.total.toLocaleString()} ₸
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
              <h3 className="text-xl sm:text-2xl font-black text-[#1D1D1F] mb-2">Тарифы и Настройки</h3>
              <p className="text-sm text-[#86868B] font-medium mb-8">Управление ценами и скидками</p>
              
              <form action={updateGlobalSettings} className="space-y-4">
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#86868B] mb-2">Комиссия (%)</label>
                    <input 
                      name="commission"
                      type="number" 
                      step="0.1"
                      defaultValue={settings.platformCommission}
                      className="w-full bg-[#F5F5F7] border-none rounded-xl px-4 py-3 font-bold text-lg outline-none focus:ring-2 focus:ring-amber-500/20" 
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#86868B] mb-2">Starter (₸)</label>
                        <input name="starter" type="number" defaultValue={settings.starterPrice} className="w-full bg-[#F5F5F7] border-none rounded-xl px-4 py-3 font-bold text-sm outline-none" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#86868B] mb-2">Pro (₸)</label>
                        <input name="pro" type="number" defaultValue={settings.proPrice} className="w-full bg-[#F5F5F7] border-none rounded-xl px-4 py-3 font-bold text-sm outline-none" />
                    </div>
                 </div>

                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#86868B] mb-2">Premium (₸)</label>
                    <input name="premium" type="number" defaultValue={settings.premiumPrice} className="w-full bg-[#F5F5F7] border-none rounded-xl px-4 py-3 font-bold text-sm outline-none" />
                 </div>

                 <div className="pt-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Общая скидка (%)</label>
                    <input 
                      name="discount"
                      type="number" 
                      defaultValue={settings.globalDiscount}
                      className="w-full bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 font-bold text-lg text-emerald-700 outline-none" 
                    />
                 </div>

                 <button type="submit" className="w-full py-4 bg-[#1D1D1F] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-[0.98] mt-4">
                    Сохранить все настройки
                 </button>
              </form>
           </div>

           <div className="lg:col-span-2 bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-black/5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                 <div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#1D1D1F]">Активность</h3>
                    <p className="text-sm text-[#86868B] font-medium">Журнал последних событий системы</p>
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
