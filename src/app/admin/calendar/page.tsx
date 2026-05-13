import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CalendarGrid from "@/components/CalendarGrid";
import CalendarMonthGrid from "@/components/CalendarMonthGrid";
import { cookies } from "next/headers";
import { dict } from "@/lib/i18n";
import { toggleLocale } from "@/app/actions/locale";
import Link from "next/link";
import { getActiveTenantId } from "@/lib/auth-utils";
import MobileCalendarTimeline from "@/components/MobileCalendarTimeline";

export default async function CalendarPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ offset?: string, view?: string, staffId?: string }> 
}) {
  const session = await auth();
  const tenantId = await getActiveTenantId() as string;

  const resolvedParams = await searchParams;
  const offset = parseInt(resolvedParams.offset || "0", 10);
  const staffId = resolvedParams.staffId || "all";
  
  // Умное определение вида: на мобильных (через headers) или по умолчанию - день
  const headerList = await import("next/headers").then(h => h.headers());
  const userAgent = (await headerList).get("user-agent") || "";
  const isMobile = /mobile/i.test(userAgent);
  
  const view = resolvedParams.view || (isMobile ? "day" : "week"); 

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "ru";
  const t = dict[locale as keyof typeof dict];

  const staff = await prisma.staff.findMany({
    where: { tenantId: tenantId as string },
    include: { schedules: true }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startDate = new Date(today);
  let endDate = new Date(today);
  let currentMonth = "";

  if (view === "month") {
    // Offset by months
    startDate.setMonth(startDate.getMonth() + offset);
    startDate.setDate(1);
    
    endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0); // last day of month
    endDate.setHours(23, 59, 59, 999);
    
    currentMonth = startDate.toLocaleDateString('ru-RU', { month: 'long' });
  } else if (view === "day") {
    // Offset by days
    startDate.setDate(startDate.getDate() + offset);
    endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);
    
    currentMonth = startDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  } else {
    // Offset by weeks
    startDate.setDate(startDate.getDate() + (offset * 7));
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate.setDate(diff); // Monday
    
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    
    currentMonth = startDate.toLocaleDateString('ru-RU', { month: 'long' });
  }

  const bookingWhere: any = { 
    tenantId: tenantId as string, 
    startTime: { gte: startDate, lt: endDate } 
  };
  
  if (staffId !== "all") {
    bookingWhere.staffId = staffId;
  }

  const bookings = await prisma.booking.findMany({
    where: bookingWhere,
    include: { service: true, client: true, staff: true }
  });

  const daysOfWeek = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return {
      date: d,
      name: d.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", { weekday: 'short' }),
      day: d.getDate(),
      id: d.getDay()
    };
  });

  const daysOfWeekNames = [t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in zoom-in-95 duration-500 bg-[#F3F4F6] md:bg-[#F3F4F6] rounded-3xl p-4 md:p-12 relative overflow-hidden font-sans md:border md:border-black/5 md:shadow-inner">
      
      {/* Show Mobile Timeline only on mobile */}
      <div className="md:hidden h-full">
        <MobileCalendarTimeline 
          staff={staff} 
          bookings={bookings} 
          currentDate={startDate}
          selectedStaffId={staffId}
        />
      </div>

      {/* Desktop Calendar UI (Hidden on mobile) */}
      <div className="hidden md:flex flex-col h-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10 px-4 gap-4">
          <div className="flex items-baseline gap-2">
              <h1 className="text-3xl md:text-[3.5rem] font-serif text-[#1C1C1C] tracking-tight leading-none capitalize">{currentMonth}</h1>
              <span className="text-xl md:text-[2rem] font-sans text-zinc-400 font-medium leading-none">'{startDate.getFullYear().toString().slice(-2)}</span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Staff Switcher */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
              <Link 
                href={`/admin/calendar?view=${view}&offset=${offset}&staffId=all`}
                className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${staffId === 'all' ? 'bg-[#1C1C1C] text-white shadow-lg scale-105' : 'bg-white/50 text-zinc-500 hover:bg-white hover:text-black'}`}
              >
                Все
              </Link>
              {staff.map((s) => (
                <Link 
                  key={s.id}
                  href={`/admin/calendar?view=${view}&offset=${offset}&staffId=${s.id}`}
                  className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${staffId === s.id ? 'bg-[#1C1C1C] text-white shadow-lg scale-105' : 'bg-white/50 text-zinc-500 hover:bg-white hover:text-black'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${staffId === s.id ? 'bg-green-400' : 'bg-zinc-300'}`}></div>
                  {s.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {/* View Switcher */}
              <div className="flex bg-[#E0E5EC] p-1 rounded-2xl shadow-inner border border-black/5">
                <Link href={`/admin/calendar?view=day&offset=0&staffId=${staffId}`} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${view === 'day' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'}`}>День</Link>
                <Link href={`/admin/calendar?view=week&offset=0&staffId=${staffId}`} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${view === 'week' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'}`}>Неделя</Link>
                <Link href={`/admin/calendar?view=month&offset=0&staffId=${staffId}`} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${view === 'month' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'}`}>Месяц</Link>
              </div>

              <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-black/5">
                <Link 
                  href={`/admin/calendar?view=${view}&offset=${offset - 1}&staffId=${staffId}`}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-zinc-100 text-zinc-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </Link>
                <Link 
                  href={`/admin/calendar?view=${view}&offset=0&staffId=${staffId}`}
                  className="px-4 font-semibold text-sm text-zinc-800 hover:text-black transition-colors"
                >
                  Сегодня
                </Link>
                <Link 
                  href={`/admin/calendar?view=${view}&offset=${offset + 1}&staffId=${staffId}`}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-zinc-100 text-zinc-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-3xl shadow-xl border border-black/5 overflow-hidden flex flex-col">
          {view === "month" ? (
            <CalendarMonthGrid bookings={bookings} currentDate={startDate} daysOfWeekNames={daysOfWeekNames} />
          ) : (
            <CalendarGrid staff={staff} bookings={bookings} startOfWeek={startDate} daysOfWeek={daysOfWeek} view={view} selectedStaffId={staffId} />
          )}
        </div>
      </div>
    </div>
  );
}
