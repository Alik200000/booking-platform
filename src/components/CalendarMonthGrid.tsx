"use client";

export default function CalendarMonthGrid({ bookings, currentDate, daysOfWeekNames }: { bookings: any[], currentDate: Date, daysOfWeekNames: string[] }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of the month
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1; // 0 for Mon, 6 for Sun

  // Get last day of the month
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();

  const days = [];
  
  // Fill empty cells before the 1st of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  // Fill actual days
  for (let i = 1; i <= totalDays; i++) {
    days.push(new Date(year, month, i));
  }

  const now = new Date();

  return (
    <div className="flex-1 flex flex-col bg-[#F9F9F9] rounded-3xl relative h-full">
      {/* Header */}
      <div className="grid grid-cols-7 border-b border-black/5 bg-white rounded-t-3xl sticky top-0 z-10">
        {daysOfWeekNames.map((name, i) => (
          <div key={i} className="py-4 text-center font-semibold text-[13px] uppercase tracking-wider text-[#1C1C1C]/60">
            {name}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-black/5 gap-[1px]">
        {days.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="bg-[#F9F9F9]/50"></div>;
          }

          const isToday = now.getDate() === day.getDate() && now.getMonth() === day.getMonth() && now.getFullYear() === day.getFullYear();
          
          // Bookings for this day (using UTC)
          const dayBookings = bookings.filter(b => {
             const d = new Date(b.startTime);
             return d.getUTCDate() === day.getDate() && d.getUTCMonth() === day.getMonth() && d.getUTCFullYear() === day.getFullYear();
          });

          return (
            <div key={idx} className={`bg-white p-2 flex flex-col transition-colors hover:bg-black/[0.02] overflow-hidden ${isToday ? 'bg-blue-50/10' : ''}`}>
              <div className="flex justify-end mb-1">
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${isToday ? 'bg-[#0071E3] text-white shadow-sm' : 'text-zinc-600'}`}>
                  {day.getDate()}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1">
                {dayBookings.map(b => (
                  <div key={b.id} className="bg-[#2DD4BF] text-white text-[10px] px-1.5 py-1 rounded truncate font-medium">
                    {new Date(b.startTime).getUTCHours().toString().padStart(2, '0')}:{new Date(b.startTime).getUTCMinutes().toString().padStart(2, '0')} {b.clientName}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
