import { getAdvancedAnalytics } from "@/app/actions/analytics";
import { RevenueChart, DonutChart, StaffLeaderboard } from "@/components/AnalyticsCharts";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  const data = await getAdvancedAnalytics();

  return (
    <div className="min-h-screen bg-main-bg text-main-text p-4 md:p-10 pb-32 md:pb-10 transition-colors duration-300">
      {/* Header */}
      <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2 bg-gradient-to-r from-main-text to-main-text/40 bg-clip-text text-transparent">
          Аналитика
        </h1>
        <p className="text-main-text/40 font-medium uppercase tracking-[0.2em] text-xs">
          God Mode: Отслеживание эффективности
        </p>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
        <StatCard 
          label="Общая выручка" 
          value={`${data.summary.totalRevenue.toLocaleString()} ₸`} 
          trend={data.summary.revenueTrend} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
        />
        <StatCard 
          label="Всего записей" 
          value={data.summary.totalBookings} 
          trend={data.summary.bookingTrend} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>}
        />
        <StatCard 
          label="Средний чек" 
          value={`${Math.round(data.summary.averageCheck).toLocaleString()} ₸`} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>}
        />
        <StatCard 
          label="Активность" 
          value="Высокая" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        {/* Revenue Trend Chart */}
        <section className="bg-card border border-main-text/10 rounded-[2.5rem] p-8 md:p-10 transition-all hover:bg-white/[0.07] animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-between items-center mb-8">
             <h2 className="text-2xl font-black tracking-tight">Тренд выручки</h2>
             <span className="text-[10px] font-bold text-main-text/30 uppercase tracking-[0.2em]">Последние 7 дней</span>
          </div>
          <div className="h-64 flex items-end">
            <RevenueChart data={data.revenueByDay} />
          </div>
        </section>

        {/* Service Distribution */}
        <section className="bg-card border border-main-text/10 rounded-[2.5rem] p-8 md:p-10 transition-all hover:bg-white/[0.07] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <div className="flex justify-between items-center mb-8">
             <h2 className="text-2xl font-black tracking-tight">Топ услуг</h2>
             <span className="text-[10px] font-bold text-main-text/30 uppercase tracking-[0.2em]">По выручке</span>
          </div>
          <DonutChart data={data.topServices} />
        </section>

        {/* Staff Performance */}
        <section className="bg-card border border-main-text/10 rounded-[2.5rem] p-8 md:p-10 lg:col-span-2 transition-all hover:bg-white/[0.07] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="flex justify-between items-center mb-10">
             <h2 className="text-2xl font-black tracking-tight">Эффективность сотрудников</h2>
             <span className="text-[10px] font-bold text-main-text/30 uppercase tracking-[0.2em]">Продажи и записи</span>
          </div>
          <StaffLeaderboard data={data.staffPerformance} />
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, icon }: { label: string, value: string | number, trend?: number, icon: React.ReactNode }) {
  return (
    <div className="bg-card border border-main-text/10 rounded-[2rem] p-6 transition-all hover:scale-[1.02] active:scale-[0.98] group">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-xl">
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-[10px] font-black px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{Math.round(trend)}%
          </span>
        )}
      </div>
      <p className="text-main-text/40 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black tracking-tighter text-main-text">{value}</p>
    </div>
  );
}
