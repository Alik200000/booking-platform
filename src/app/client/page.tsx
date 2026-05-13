import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ClientHome() {
  const session = await auth();
  if (!session || session.user?.role !== "CLIENT") redirect("/login");

  // Fetch recommendations (e.g., top businesses by booking count or just all)
  const businesses = await prisma.tenant.findMany({
    where: { isActive: true },
    take: 6,
    include: {
      _count: {
        select: { bookings: true }
      }
    }
  });

  const nextBooking = await prisma.booking.findFirst({
    where: { userId: session.user.id, startTime: { gte: new Date() }, status: 'CONFIRMED' },
    include: { tenant: true, service: true },
    orderBy: { startTime: 'asc' }
  });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      {/* Premium Welcome Header */}
      <header className="relative py-10 px-2 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-400/20 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-400/10 blur-[100px] rounded-full"></div>
        
        <div className="relative flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-6xl font-black text-[#1D1D1F] tracking-tight leading-tight">
              Привет, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">{session.user.name?.split(' ')[0]}</span>! 👋
            </h1>
            <p className="text-lg text-[#86868B] font-medium tracking-tight">Куда запишемся сегодня?</p>
          </div>
          <button className="w-14 h-14 bg-white/70 backdrop-blur-xl rounded-[2rem] flex items-center justify-center border border-white/50 shadow-xl shadow-gray-200/50 text-2xl hover:scale-110 active:scale-95 transition-all">
             ✨
          </button>
        </div>
      </header>

      {/* Dynamic Next Appointment (Wallet Style) */}
      {nextBooking && (
        <section className="px-1">
           <Link href="/client/bookings" className="group block relative overflow-hidden bg-[#1D1D1F] rounded-[3rem] p-8 text-white shadow-2xl transition-all hover:-translate-y-1 active:scale-[0.98]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-transparent blur-3xl"></div>
              
              <div className="relative flex justify-between items-center mb-8">
                 <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Твой ближайший визит</span>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                 </div>
              </div>

              <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-8">
                 <div>
                    <h3 className="text-3xl font-bold tracking-tight mb-2">{nextBooking.service.name}</h3>
                    <div className="flex items-center gap-2 opacity-60 font-medium">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                       <span>{nextBooking.tenant.name}</span>
                    </div>
                 </div>
                 <div className="sm:text-right flex sm:flex-col justify-between items-end">
                    <p className="text-4xl font-light tracking-tighter tabular-nums">
                       {new Date(nextBooking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm font-bold opacity-40 uppercase tracking-widest mt-1">Сегодня, {new Date(nextBooking.startTime).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</p>
                 </div>
              </div>
           </Link>
        </section>
      )}

      {/* Discovery Section (Visual Grid) */}
      <section className="space-y-8">
        <div className="flex justify-between items-end px-2">
           <div className="space-y-1">
             <h2 className="text-2xl font-black text-[#1D1D1F] tracking-tight">Рекомендации</h2>
             <p className="text-sm text-[#86868B] font-medium">Места с самым высоким рейтингом</p>
           </div>
           <Link href="/discovery" className="px-5 py-2.5 bg-[#F5F5F7] rounded-2xl text-[10px] font-black text-[#1D1D1F] uppercase tracking-widest hover:bg-zinc-200 transition-colors">Все заведения</Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
           {businesses.map((biz) => (
             <Link key={biz.id} href={`/${biz.slug}`} className="group relative bg-white rounded-[3rem] p-4 border border-black/5 hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] transition-all overflow-hidden">
                <div className="relative h-48 w-full bg-[#F5F5F7] rounded-[2.2rem] overflow-hidden mb-6">
                   {biz.logoUrl ? (
                     <img src={biz.logoUrl} alt={biz.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
                        <span className="text-4xl font-black text-gray-300">{biz.name[0]}</span>
                     </div>
                   )}
                   <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#1D1D1F]">★ 4.9</span>
                   </div>
                </div>
                
                <div className="px-2 pb-2">
                   <h4 className="font-bold text-xl text-[#1D1D1F] tracking-tight mb-1">{biz.name}</h4>
                   <div className="flex items-center justify-between">
                      <p className="text-sm text-[#86868B] font-medium">{biz.city || "Алматы"}</p>
                      <div className="flex items-center gap-1.5">
                         <div className="flex -space-x-1.5">
                            {[1,2].map(i => (
                              <div key={i} className="w-5 h-5 rounded-full bg-zinc-200 border border-white"></div>
                            ))}
                         </div>
                         <span className="text-[9px] font-bold text-[#86868B] uppercase tracking-[0.1em]">+{biz._count.bookings} записи</span>
                      </div>
                   </div>
                </div>
             </Link>
           ))}
        </div>
      </section>

      {/* Sleek Quick Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-1">
         <Link href="/client/bookings" className="group relative bg-blue-50/50 rounded-[2.5rem] p-8 border border-blue-100/50 hover:bg-blue-600 transition-all duration-500 overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
            <div className="w-12 h-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:rotate-12 transition-transform">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            </div>
            <h4 className="font-black text-[#1D1D1F] uppercase tracking-widest text-[11px] group-hover:text-white transition-colors">История визитов</h4>
            <p className="text-sm text-blue-800/60 font-medium mt-1 group-hover:text-blue-50 transition-colors">Все твои прошлые записи</p>
         </Link>
         
         <Link href="/client/profile" className="group relative bg-zinc-50 rounded-[2.5rem] p-8 border border-zinc-200/50 hover:bg-zinc-900 transition-all duration-500 overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-zinc-200/20 rounded-full blur-3xl group-hover:bg-white/10 transition-all"></div>
            <div className="w-12 h-12 bg-white text-zinc-900 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:rotate-12 transition-transform">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <h4 className="font-black text-[#1D1D1F] uppercase tracking-widest text-[11px] group-hover:text-white transition-colors">Личный профиль</h4>
            <p className="text-sm text-zinc-500 font-medium mt-1 group-hover:text-zinc-400 transition-colors">Настройки и уведомления</p>
         </Link>
      </section>
    </div>
  );
}
