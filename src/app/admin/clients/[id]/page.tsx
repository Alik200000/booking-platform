import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");

  const resolvedParams = await params;
  const clientId = resolvedParams.id;
  const tenantId = session.user.tenantId;

  const client = await prisma.client.findUnique({
    where: { id: clientId, tenantId },
    include: {
      bookings: {
        include: {
          service: true,
          staff: true,
        },
        orderBy: {
          startTime: "desc",
        },
      },
    },
  });

  if (!client) return notFound();

  const totalSpent = client.bookings.reduce((sum, b) => sum + b.service.price, 0);
  const totalVisits = client.bookings.length;

  return (
    <div className="min-h-screen bg-[#E0E5EC] text-[#1F2532] p-4 md:p-10 pb-32 md:pb-10 animate-in fade-in duration-700">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <Link href="/admin/clients" className="text-[#444A5B]/60 hover:text-[#444A5B] text-sm mb-4 inline-block font-bold transition-colors">← Назад к списку</Link>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[2rem] bg-[#3B414F] text-white flex items-center justify-center text-3xl font-black shadow-2xl">
              {client.name[0]}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-serif tracking-tight">{client.name}</h1>
              <p className="text-[#444A5B]/60 font-bold tracking-widest uppercase text-[10px] mt-1">{client.phone}</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm text-center">
             <p className="text-[10px] font-black uppercase tracking-widest text-[#444A5B]/40 mb-1">Визитов</p>
             <p className="text-2xl font-black">{totalVisits}</p>
          </div>
          <div className="flex-1 md:flex-none bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm text-center">
             <p className="text-[10px] font-black uppercase tracking-widest text-[#444A5B]/40 mb-1">Потрачено</p>
             <p className="text-2xl font-black">{totalSpent.toLocaleString()} ₸</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: History */}
        <div className="lg:col-span-2 space-y-6">
           <h2 className="text-2xl font-bold tracking-tight mb-6">История посещений</h2>
           <div className="space-y-4">
             {client.bookings.map((booking) => (
               <div key={booking.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-black/5 flex justify-between items-center group transition-all hover:shadow-md">
                 <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-2xl bg-[#E0E5EC] flex items-center justify-center text-[#3B414F] font-bold">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                   </div>
                   <div>
                     <p className="font-black text-[#3B414F] text-lg">{booking.service.name}</p>
                     <p className="text-xs font-bold text-[#444A5B]/50 uppercase tracking-widest">Мастер: {booking.staff.name}</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="font-black text-lg">{new Date(booking.startTime).toLocaleDateString("ru-RU", { day: 'numeric', month: 'short' })}</p>
                   <p className="text-xs font-bold text-blue-600 uppercase tracking-tighter">{booking.service.price.toLocaleString()} ₸</p>
                 </div>
               </div>
             ))}
             {client.bookings.length === 0 && (
               <div className="bg-white/50 border-2 border-dashed border-[#444A5B]/10 rounded-[2rem] p-16 text-center">
                  <p className="text-[#444A5B]/40 font-bold">История записей пуста</p>
               </div>
             )}
           </div>
        </div>

        {/* Right Column: Info & Notes (Mock) */}
        <div className="space-y-8">
           <section className="bg-[#3B414F] text-white rounded-[2.5rem] p-8 shadow-2xl">
              <h3 className="text-xl font-bold mb-6">Инфо</h3>
              <div className="space-y-6">
                <div>
                   <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Email</p>
                   <p className="font-bold">{client.email || "Не указан"}</p>
                </div>
                <div>
                   <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Дата создания</p>
                   <p className="font-bold">{new Date(client.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
           </section>

           <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
              <h3 className="text-xl font-bold text-[#1F2532] mb-6">Заметки</h3>
              <textarea 
                className="w-full h-40 bg-[#E0E5EC]/50 rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 border border-black/5 placeholder:text-[#1F2532]/30"
                placeholder="Добавьте важную информацию о клиенте..."
              />
              <button className="w-full mt-4 py-4 bg-[#1F2532] text-white rounded-2xl font-bold active:scale-95 transition-all opacity-50 cursor-not-allowed">
                Сохранить (Скоро)
              </button>
           </section>
        </div>
      </div>
    </div>
  );
}
