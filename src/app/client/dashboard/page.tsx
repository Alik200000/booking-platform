import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ClientDashboard() {
  const session = await auth();

  if (!session || session.user?.role !== "CLIENT") {
    redirect("/login");
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: {
      service: true,
      staff: true,
      tenant: true
    },
    orderBy: { startTime: 'desc' }
  });

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight mb-2">Мои записи</h1>
          <p className="text-zinc-500 font-medium italic">Ваша история и активные бронирования</p>
        </header>

        <div className="space-y-6">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5 flex flex-col sm:flex-row justify-between items-center gap-6 group transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center gap-6 w-full">
                   <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden border border-zinc-200">
                      {booking.tenant.logoUrl ? (
                        <img src={booking.tenant.logoUrl} alt={booking.tenant.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-zinc-400">{booking.tenant.name[0]}</span>
                      )}
                   </div>
                   <div className="flex-1">
                      <h3 className="text-xl font-bold text-zinc-900">{booking.service.name}</h3>
                      <p className="text-zinc-500 font-medium mt-1">{booking.tenant.name} • {booking.staff.name}</p>
                   </div>
                </div>

                <div className="text-center sm:text-right w-full sm:w-auto">
                   <p className="text-2xl font-black text-zinc-900 leading-none">
                     {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </p>
                   <p className="text-zinc-400 font-bold uppercase text-[10px] mt-2 tracking-widest">
                     {new Date(booking.startTime).toLocaleDateString([], { day: 'numeric', month: 'long' })}
                   </p>
                </div>

                <div className="pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-zinc-100 sm:pl-6 w-full sm:w-auto text-center sm:text-left flex flex-col items-center gap-2">
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                     booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                     booking.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                     'bg-amber-50 text-amber-600 border-amber-100'
                   }`}>
                     {booking.status === 'CONFIRMED' ? 'Подтверждено' : 
                      booking.status === 'CANCELLED' ? 'Отменено' : 'Ожидание'}
                   </span>
                   <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Чат доступен в WhatsApp</p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-zinc-200">
               <div className="w-20 h-20 bg-zinc-50 text-zinc-300 rounded-full flex items-center justify-center mx-auto mb-6">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
               </div>
               <p className="text-xl font-bold text-zinc-900 mb-2">У вас пока нет записей</p>
               <p className="text-zinc-500 font-medium">Ваша история бронирований появится здесь.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
