import { prisma } from "@/lib/prisma";
import { updateGlobalSettings } from "@/app/actions/superadmin";

export default async function SuperAdminDashboard() {
  let settings = { platformCommission: 5, starterPrice: 15000, proPrice: 25000, premiumPrice: 45000, globalDiscount: 0 };
  let stats = {
    totalRevenue: 0,
    activeSubscribers: 0,
    totalBookings: 0,
    estimatedCommission: 0
  };

  try {
    const [dbSettings, tenantsCount, bookingsCount, subscriptions, payments] = await Promise.all([
      prisma.globalSettings.findUnique({ where: { id: 'global' } }),
      prisma.tenant.count(),
      prisma.booking.count(),
      prisma.subscription.findMany({ where: { plan: { not: 'FREE' }, isActive: true } }),
      prisma.paymentRequest.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true }
      })
    ]);

    if (dbSettings) {
      settings = dbSettings as any;
    }

    stats.activeSubscribers = subscriptions.length;
    stats.totalBookings = bookingsCount;
    stats.totalRevenue = payments._sum.amount || 0;
    stats.estimatedCommission = (stats.totalRevenue * settings.platformCommission) / 100;

  } catch (e) {
    console.error("Dashboard analytics error:", e);
  }

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-1000 pb-24 md:pb-0">
      <div className="px-1 md:px-0">
         <h1 className="text-4xl md:text-[3.5rem] font-black tracking-tighter text-[#1C1C1C]">Аналитика</h1>
         <p className="text-gray-400 font-medium text-sm mt-1">Реальные финансовые показатели платформы</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Реальная выручка" value={`${stats.totalRevenue.toLocaleString()} ₸`} color="blue" />
        <StatCard label="Чистый доход" value={`${stats.estimatedCommission.toLocaleString()} ₸`} color="emerald" />
        <StatCard label="Платные подписки" value={stats.activeSubscribers} color="purple" />
        <StatCard label="Всего записей" value={stats.totalBookings.toLocaleString()} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm">
          <div className="flex justify-between items-end mb-8 md:mb-10">
            <div>
              <h3 className="text-xl font-black text-[#1C1C1C]">Динамика оплат</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Система учета платежей</p>
            </div>
          </div>
          
          <div className="flex items-end justify-between h-48 md:h-64 gap-2 md:gap-4 px-2 md:px-4">
            {[20, 35, 30, 45, 40, 55, 50].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 md:gap-3 group">
                <div 
                  className="w-full bg-indigo-50 group-hover:bg-indigo-500 transition-all duration-500 rounded-lg md:rounded-2xl relative"
                  style={{ height: `${val}%` }}
                ></div>
                <span className="text-[8px] md:text-[9px] font-black text-gray-300 uppercase tracking-tighter">Нед {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 text-emerald-600 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center mb-6">
               <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            </div>
            <h3 className="text-xl font-black text-[#1C1C1C] mb-2">Комиссия</h3>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">Настройка процента, удерживаемого с транзакций салонов.</p>
          </div>

          <form action={updateGlobalSettings} className="mt-8 md:mt-10 space-y-6">
            <input type="hidden" name="starter" value={settings.starterPrice} />
            <input type="hidden" name="pro" value={settings.proPrice} />
            <input type="hidden" name="premium" value={settings.premiumPrice} />
            <input type="hidden" name="discount" value={settings.globalDiscount} />

            <div className="relative">
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 ml-1 tracking-widest">Процент комиссии</label>
              <div className="flex items-center gap-3">
                <input 
                  name="commission"
                  type="number"
                  step="0.1"
                  defaultValue={settings.platformCommission}
                  className="text-4xl md:text-5xl font-black text-[#1C1C1C] bg-transparent w-24 md:w-32 outline-none"
                />
                <span className="text-3xl md:text-4xl font-black text-gray-200">%</span>
              </div>
            </div>

            <button type="submit" className="w-full py-4 md:py-5 bg-[#1C1C1C] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gray-100">
              Сохранить
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: any) {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    purple: "text-purple-600 bg-purple-50",
    amber: "text-amber-600 bg-amber-50"
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm">
      <p className="text-[8px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 truncate">{label}</p>
      <p className={`text-lg md:text-2xl font-black ${colors[color].split(' ')[0]} truncate`}>{value}</p>
    </div>
  );
}
