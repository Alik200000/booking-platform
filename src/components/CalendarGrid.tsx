"use client";

// Colors extracted exactly from the new reference image
const colors = [
  { bg: "bg-[#2DD4BF]", text: "text-white" }, // Teal
  { bg: "bg-[#FCA5A5]", text: "text-[#1C1C1C]" }, // Salmon
  { bg: "bg-[#E5DFD3]", text: "text-[#1C1C1C]" }, // Beige
];

export default function CalendarGrid({ 
  staff, 
  bookings, 
  startOfWeek, 
  daysOfWeek,
  view = "week",
  selectedStaffId = "all"
}: { 
  staff: any[], 
  bookings: any[], 
  startOfWeek: Date, 
  daysOfWeek: any[],
  view?: string,
  selectedStaffId?: string
}) {
  const timeSlots: string[] = [];
  for (let i = 8; i <= 21; i++) {
    timeSlots.push(`${i}:00`);
  }

  const now = new Date();
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();
  const showRedLine = currentHour >= 8 && currentHour <= 21;
  const redLineTop = Math.max(0, (currentHour - 8) * 60 + currentMinute) / 60 * 70;

  // Determine columns based on view
  const columns = view === "day" 
    ? staff.filter(s => selectedStaffId === "all" || s.id === selectedStaffId)
    : daysOfWeek;

  return (
    <div className="flex-1 overflow-auto bg-[#F9F9F9] scrollbar-hide rounded-3xl relative">
      <div className="flex min-w-full">
        {/* Time column */}
      <div className="w-14 flex-shrink-0 z-30 sticky left-0 bg-[#F9F9F9] border-r border-black/5">
        <div className="h-[72px] sticky top-0 z-40 bg-[#F9F9F9] border-b border-black/5"></div>
        {timeSlots.map((time: any) => (
          <div key={time} className="h-[70px] text-[11px] text-zinc-600 font-medium text-center relative border-b border-transparent">
            <span className="relative -top-2">{time}</span>
          </div>
        ))}
      </div>

      {/* Grid Container */}
      <div className="flex flex-1 min-w-full bg-white relative">
        {showRedLine && (
           <div 
             className="absolute left-0 right-0 h-0.5 bg-red-500/50 z-20 pointer-events-none" 
             style={{ top: `${72 + redLineTop}px` }}
           >
             <div className="absolute -left-1 w-2 h-2 rounded-full bg-red-500"></div>
           </div>
        )}

        {columns.map((item: any) => {
          let dayBookings: any[] = [];
          let headerTitle = "";
          let headerSub = "";
          let isToday = false;
          let colId = "";

          if (view === "day") {
            colId = item.id;
            headerTitle = item.name;
            headerSub = "Мастер";
            dayBookings = bookings.filter(b => b.staffId === item.id);
            isToday = true;
          } else {
            colId = item.date.toISOString();
            headerTitle = item.day;
            headerSub = item.name;
            isToday = now.getDate() === item.day && now.getMonth() === item.date.getMonth() && now.getFullYear() === item.date.getFullYear();
            
            dayBookings = bookings.filter((b: any) => {
               const bDate = new Date(b.startTime);
               return bDate.getUTCDate() === item.day && bDate.getUTCMonth() === item.date.getUTCMonth() && bDate.getUTCFullYear() === item.date.getUTCFullYear();
            });
          }
          
          return (
            <div key={colId} className={`flex-1 min-w-[120px] md:min-w-[160px] border-r border-black/5 relative last:border-r-0 ${isToday && view !== 'day' ? 'bg-blue-50/10' : ''}`}>
              
              {/* Header */}
              <div className={`h-[72px] sticky top-0 z-20 flex flex-col items-center justify-center border-b border-black/5 backdrop-blur-xl ${isToday && view !== 'day' ? 'bg-[#0071E3]/5 text-[#0071E3]' : 'bg-white/90 text-[#1C1C1C]'}`}>
                <span className="font-bold text-[10px] md:text-[11px] uppercase tracking-[0.1em] opacity-50 mb-0.5">{headerSub}</span>
                <div className={`px-3 h-8 md:h-9 rounded-full flex items-center justify-center text-sm md:text-base font-black transition-all ${isToday && view !== 'day' ? 'bg-[#0071E3] text-white shadow-[0_4px_12px_rgba(0,113,227,0.3)]' : ''}`}>
                  {headerTitle}
                </div>
              </div>
              
              {/* Grid Lines and Bookings */}
              <div className="relative w-full">
                {timeSlots.map((time: any) => (
                  <div key={time} className={`h-[70px] border-b border-black/5 relative active:bg-black/[0.03] transition-colors`}></div>
                ))}
                
                {/* Bookings */}
                {dayBookings.map((booking: any) => {
                  const bDate = new Date(booking.startTime);
                  const startHour = bDate.getUTCHours();
                  const startMin = bDate.getUTCMinutes();
                  const duration = booking.service.duration; 
                  
                  const topMinutes = Math.max(0, (startHour - 8) * 60 + startMin);
                  const topPixels = (topMinutes / 60) * 70; 
                  const heightPixels = (duration / 60) * 70;

                  const colorObj = colors[booking.service.name.length % colors.length];
                  const isTeal = colorObj.bg === 'bg-[#2DD4BF]';

                  return (
                    <div 
                      key={booking.id}
                      className={`absolute left-1.5 right-1.5 rounded-2xl p-2.5 flex flex-col overflow-hidden ${colorObj.bg} ${colorObj.text} z-10 hover:brightness-95 active:scale-[0.98] transition-all cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-white/20`}
                      style={{ top: `${topPixels + 3}px`, height: `${heightPixels - 6}px` }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] font-black tracking-tight ${isTeal ? 'text-white/90' : 'text-black/60'}`}>
                          {startHour.toString().padStart(2, '0')}:{startMin.toString().padStart(2, '0')}
                        </span>
                        <div className={`w-1.5 h-1.5 rounded-full ${booking.status === 'CONFIRMED' ? 'bg-green-400' : 'bg-yellow-400'} shadow-sm`}></div>
                      </div>
                      
                      <div className="flex flex-col gap-0">
                         <span className={`text-[11px] md:text-[12px] font-black truncate leading-tight tracking-tight ${isTeal ? 'text-white' : 'text-zinc-900'}`}>
                           {booking.clientName}
                         </span>
                         <span className={`text-[9px] md:text-[10px] font-bold truncate leading-tight opacity-80 ${isTeal ? 'text-white/80' : 'text-zinc-700'}`}>
                           {booking.service.name}
                         </span>
                         {(view === 'week' || view === 'day') && selectedStaffId === 'all' && (
                           <span className={`text-[8px] font-black uppercase mt-1 ${isTeal ? 'text-white/60' : 'text-zinc-500'}`}>
                             {booking.staff.name}
                           </span>
                         )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </div>
  );
}
