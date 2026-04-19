import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CalendarGrid from "@/components/CalendarGrid";
import { cookies } from "next/headers";
import { dict } from "@/lib/i18n";
import { toggleLocale } from "@/app/actions/locale";
import Link from "next/link";

export default async function CalendarPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ offset?: string }> 
}) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;

  const resolvedParams = await searchParams;
  const offset = parseInt(resolvedParams.offset || "0", 10);

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "ru";
  const t = dict[locale as keyof typeof dict];

  const staff = await prisma.staff.findMany({
    where: { tenantId: tenantId as string },
    include: { schedules: true }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Смещаем неделю в зависимости от offset
  today.setDate(today.getDate() + (offset * 7));
  
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
  
  const daysOfWeek = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return {
      date: d,
      name: d.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", { weekday: 'short' }),
      day: d.getDate(),
      id: d.getDay()
    };
  });

  const currentMonth = startOfWeek.toLocaleDateString('ru-RU', { month: 'long' });

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in zoom-in-95 duration-500 bg-[#F3F4F6] rounded-3xl p-4 md:p-12 relative overflow-hidden font-sans border border-black/5 shadow-inner">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10 px-4 gap-4">
        <div className="flex items-baseline gap-2">
           <h1 className="text-[3.5rem] font-serif text-[#1C1C1C] tracking-tight leading-none capitalize">{currentMonth}</h1>
           <span className="text-[2rem] font-sans text-zinc-400 font-medium leading-none">'{startOfWeek.getFullYear().toString().slice(-2)}</span>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-black/5">
           <Link 
             href={`/admin/calendar?offset=${offset - 1}`}
             className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-zinc-100 text-zinc-600 transition-colors"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
           </Link>
           <Link 
             href={`/admin/calendar?offset=0`}
             className="px-4 font-semibold text-sm text-zinc-800 hover:text-black transition-colors"
           >
             Сегодня
           </Link>
           <Link 
             href={`/admin/calendar?offset=${offset + 1}`}
             className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-zinc-100 text-zinc-600 transition-colors"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
           </Link>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-xl border border-black/5 overflow-hidden flex flex-col">
        <CalendarGrid staff={staff} bookings={displayBookings} startOfWeek={startOfWeek} daysOfWeek={daysOfWeek} />
      </div>
    </div>
  );
}
