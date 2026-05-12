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
    const [dbSettings, tenants, bookings, subscriptions] = await Promise.all([
      prisma.globalSettings.findUnique({ where: { id: 'global' } }),
      prisma.tenant.count(),
      prisma.booking.count(),
      prisma.subscription.findMany({ where: { plan: { not: 'FREE' } } })
    ]);

    if (dbSettings) {
      settings = {
        platformCommission: dbSettings.platformCommission ?? 5,
        starterPrice: dbSettings.starterPrice ?? 15000,
        proPrice: dbSettings.proPrice ?? 25000,
        premiumPrice: dbSettings.premiumPrice ?? 45000,
        globalDiscount: dbSettings.globalDiscount ?? 0,
      };
    }

    // Примерные расчеты (в реальности можно считать из таблицы платежей)
    stats.activeSubscribers = subscriptions.length;
    stats.totalBookings = bookings;
    
    // Считаем доход: предположим средний чек и комиссию
    // В будущем тут будет реальный агрегат из BookingPayment
    stats.totalRevenue = bookings * 5000; // Условный средний чек 5000
    stats.estimatedCommission = (stats.totalRevenue * settings.platformCommission) / 100;

  } catch (e) {
    console.error("Dashboard analytics error:", e);
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div>
         <h1 className="text-[3.5rem] font-black tracking-tighter text-[#1C1C1C]">Аналитика</h1>
         <p className="text-gray-400 font-medium text-sm mt-1">Обзор финансовых показателей платформы</p>
      </div>

      {/* Верхние карточки */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Общий оборот" value={`${stats.totalRevenue.toLocaleString()} ₸`} color="blue" />
        <StatCard label="Доход (Комиссия)" value={`${stats.estimatedCommission.toLocaleString()} ₸`} color="emerald" />
        <StatCard label="Платные подписки" value={stats.activeSubscribers} color="purple" />
        <StatCard label="Всего записей" value={stats.totalBookings} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* График CSS */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h3 className="text-xl font-black text-[#1C1C1C]">Динамика доходов</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Последние 7 дней</p>
            </div>
          </div>
          
          <div className="flex items-end justify-between h-64 gap-4 px-4">
            {[45, 60, 55, 80, 70, 95, 85].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <div 
                  className="w-full bg-indigo-50 group-hover:bg-indigo-500 transition-all duration-500 rounded-2xl relative"
                  style={{ height: `${val}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1C1C1C] text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {val * 1000}₸
                  </div>
                </div>
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">Day {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Настройка комиссии */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center mb-6">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            </div>
            <h3 className="text-xl font-black text-[#1C1C1C] mb-2">Комиссия</h3>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">Процент, который платформа забирает с каждой успешной онлайн-записи.</p>
          </div>

          <form action={updateGlobalSettings} className="mt-10 space-y-6">
            {/* Скрытые поля цен, чтобы не перезаписать их нулями */}
            <input type="hidden" name="starter" value={settings.starterPrice} />
            <input type="hidden" name="pro" value={settings.proPrice} />
            <input type="hidden" name="premium" value={settings.premiumPrice} />
            <input type="hidden" name="discount" value={settings.globalDiscount} />

            <div className="relative">
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 ml-1 tracking-widest">Текущий процент</label>
              <div className="flex items-center gap-4">
                <input 
                  name="commission"
                  type="number"
                  defaultValue={settings.platformCommission}
                  className="text-5xl font-black text-[#1C1C1C] bg-transparent w-32 outline-none"
                />
                <span className="text-4xl font-black text-gray-200">%</span>
              </div>
            </div>

            <button type="submit" className="w-full py-5 bg-[#1C1C1C] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] hover:bg-black transition-all shadow-xl shadow-gray-100">
              Обновить процент
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
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-black ${colors[color].split(' ')[0]}`}>{value}</p>
    </div>
  );
}
