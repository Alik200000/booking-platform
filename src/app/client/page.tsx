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
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#1D1D1F] tracking-tight">Привет, {session.user.name?.split(' ')[0]}! 👋</h1>
          <p className="text-[#86868B] font-medium mt-2">Куда запишемся сегодня?</p>
        </div>
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-black/5 shadow-sm text-xl shrink-0">
          ✨
        </div>
      </header>

      {/* Next Appointment Card */}
      {nextBooking && (
        <Link href="/client/bookings" className="block bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-500/20 hover:scale-[1.02] transition-transform active:scale-[0.98]">
           <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Ближайшая запись</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
           </div>
           <h3 className="text-2xl font-bold mb-1">{nextBooking.service.name}</h3>
           <p className="opacity-80 font-medium mb-6">{nextBooking.tenant.name} • {new Date(nextBooking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
           <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest bg-white text-blue-600 w-fit px-6 py-3 rounded-2xl shadow-xl">
              Посмотреть детали
           </div>
        </Link>
      )}

      {/* Recommended Businesses Grid */}
      <section>
        <div className="flex justify-between items-end mb-6 px-1">
           <div>
             <h2 className="text-xl font-black text-[#1D1D1F] uppercase tracking-wider">Рекомендации</h2>
             <p className="text-sm text-[#86868B] font-medium mt-1">Лучшие места города для вас</p>
           </div>
           <Link href="/discovery" className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">Все заведения</Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {businesses.map((biz) => (
             <Link key={biz.id} href={`/${biz.slug}`} className="bg-white rounded-[2rem] p-6 border border-black/5 hover:shadow-xl transition-all group">
                <div className="w-16 h-16 bg-[#F5F5F7] rounded-2xl mb-4 flex items-center justify-center overflow-hidden border border-black/5 group-hover:scale-110 transition-transform duration-500">
                   {biz.logoUrl ? (
                     <img src={biz.logoUrl} alt={biz.name} className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-xl font-black text-[#1D1D1F]">{biz.name[0]}</span>
                   )}
                </div>
                <h4 className="font-bold text-lg text-[#1D1D1F] mb-1">{biz.name}</h4>
                <p className="text-sm text-[#86868B] font-medium mb-4">{biz.slug}.zeno.kz</p>
                <div className="flex items-center gap-2">
                   <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full bg-zinc-100 border-2 border-white flex items-center justify-center text-[8px] font-black">👤</div>
                      ))}
                   </div>
                   <span className="text-[10px] font-black text-[#86868B] uppercase tracking-widest">+{biz._count.bookings} записей</span>
                </div>
             </Link>
           ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 gap-4">
         <Link href="/client/bookings" className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 group">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            </div>
            <p className="font-black text-[#1D1D1F] uppercase tracking-widest text-[10px]">Моя история</p>
            <p className="text-sm text-emerald-800/60 font-medium mt-1">Все записи</p>
         </Link>
         <Link href="/client/profile" className="bg-purple-50 p-6 rounded-[2rem] border border-purple-100 group">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <p className="font-black text-[#1D1D1F] uppercase tracking-widest text-[10px]">Профиль</p>
            <p className="text-sm text-purple-800/60 font-medium mt-1">Настройки</p>
         </Link>
      </section>
    </div>
  );
}
