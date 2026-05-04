import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import BookingCard from "./BookingCard";

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
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight mb-2">Мои записи</h1>
            <p className="text-zinc-500 font-medium italic">Ваша история и активные бронирования</p>
          </div>
          <div className="hidden sm:block">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Аккаунт: {session.user.email}</span>
          </div>
        </header>

        <div className="space-y-6">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} userId={session.user.id!} />
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
