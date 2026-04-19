import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CalendarGrid from "@/components/CalendarGrid";
import { cookies } from "next/headers";
import { dict } from "@/lib/i18n";
import { toggleLocale } from "@/app/actions/locale";

export default async function CalendarPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId;

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "ru";
  const t = dict[locale as keyof typeof dict];

  const staff = await prisma.staff.findMany({
    where: { tenantId: tenantId as string },
    include: { schedules: true }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get Monday of current week
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(today.setDate(diff));
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const bookings = await prisma.booking.findMany({
    where: { tenantId: tenantId as string, startTime: { gte: startOfWeek, lt: endOfWeek } },
    include: { service: true, client: true, staff: true }
  });

  // Default display
  let displayBookings = bookings;
  const daysOfWeek = [
    { id: 1, name: t.mon },
    { id: 2, name: t.tue },
    { id: 3, name: t.wed },
    { id: 4, name: t.thu },
    { id: 5, name: t.fri },
    { id: 6, name: t.sat },
    { id: 0, name: t.sun },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in zoom-in-95 duration-500 bg-[#F3F4F6] rounded-3xl p-4 md:p-12 relative overflow-hidden font-sans border border-black/5 shadow-inner">
      
      <div className="flex justify-between items-center mb-8 relative z-10 px-4">
        <div className="flex items-baseline gap-2">
           <h1 className="text-[3.5rem] font-serif text-[#1C1C1C] tracking-tight leading-none">{t.weekly}</h1>
           <span className="text-[2rem] font-sans text-zinc-400 font-medium leading-none">.0a</span>
        </div>
        
        <div className="flex gap-3">
          <form action={toggleLocale}>
            <button type="submit" className="flex items-center text-sm font-bold text-white bg-[#1C1C1C] px-5 py-2.5 rounded-xl shadow-lg hover:bg-black transition-colors hover:scale-105">
               🌍 {t.language}
            </button>
          </form>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-xl border border-black/5 overflow-hidden flex flex-col">
        <CalendarGrid staff={staff} bookings={displayBookings} startOfWeek={startOfWeek} daysOfWeek={daysOfWeek} />
      </div>
    </div>
  );
}
