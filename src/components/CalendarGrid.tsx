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
  const redLineTop = Math.max(0, (currentHour - 8) * 60 + currentMinute) / 60 * 80;

  // Determine columns based on view
  const columns = view === "day" 
    ? staff.filter(s => selectedStaffId === "all" || s.id === selectedStaffId)
    : daysOfWeek;

  return (
    <div className="flex-1 overflow-auto bg-[#F9F9F9] scrollbar-hide rounded-3xl relative">
      <div className="flex min-w-full">
        {/* Time column */}
      <div className="w-16 flex-shrink-0 z-30 sticky left-0 bg-white/80 backdrop-blur-md border-r border-black/5 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="h-[80px] sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-black/5 flex items-center justify-center">
           <svg className="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        {timeSlots.map((time: any) => (
          <div key={time} className="h-[80px] text-[10px] text-zinc-400 font-black uppercase tracking-tighter text-center relative border-b border-transparent flex items-start justify-center pt-2">
            <span>{time}</span>
          </div>
        ))}
      </div>

      {/* Grid Container */}
      <div className="flex flex-1 min-w-full bg-white relative">
        {showRedLine && (
           <div 
             className="absolute left-0 right-0 h-[2px] bg-red-500/60 z-20 pointer-events-none flex items-center" 
             style={{ top: `${80 + redLineTop}px` }}
           >
             <div className="w-3 h-3 rounded-full bg-red-600 shadow-lg shadow-red-500/40 -ml-1.5 border-2 border-white"></div>
             <div className="flex-1 h-px bg-gradient-to-r from-red-500 to-transparent"></div>
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
            <div key={colId} className={`flex-1 min-w-[160px] md:min-w-[200px] border-r border-black/[0.03] relative last:border-r-0 ${isToday && view !== 'day' ? 'bg-blue-50/20' : ''}`}>
              
              {/* Header */}
              <div className={`h-[80px] sticky top-0 z-20 flex flex-col items-center justify-center border-b border-black/5 backdrop-blur-xl ${isToday && view !== 'day' ? 'bg-blue-50/90 text-blue-600' : 'bg-white/90 text-[#1C1C1C]'}`}>
                <span className="font-black text-[9px] uppercase tracking-[0.2em] opacity-40 mb-1">{headerSub}</span>
                <div className={`px-4 h-9 rounded-2xl flex items-center justify-center text-sm md:text-lg font-black transition-all ${isToday && view !== 'day' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30 scale-110' : 'bg-zinc-50 border border-black/5 shadow-sm'}`}>
                  {headerTitle}
                </div>
              </div>
              
              {/* Grid Lines and Bookings */}
              <div className="relative w-full">
                {timeSlots.map((time: any) => (
                  <div key={time} className={`h-[80px] border-b border-black/[0.03] relative active:bg-black/[0.02] transition-colors`}></div>
                ))}
                
                {/* Bookings */}
                {dayBookings.map((booking: any) => {
                  const bDate = new Date(booking.startTime);
                  const startHour = bDate.getUTCHours();
                  const startMin = bDate.getUTCMinutes();
                  const duration = booking.service.duration; 
                  
                  const topMinutes = Math.max(0, (startHour - 8) * 60 + startMin);
                  const topPixels = (topMinutes / 60) * 80; 
                  const heightPixels = (duration / 60) * 80;

                  const colorObj = colors[booking.service.name.length % colors.length];
                  const isTeal = colorObj.bg === 'bg-[#2DD4BF]';

                  return (
                    <div 
                      key={booking.id}
                      className={`absolute left-2 right-2 rounded-[1.25rem] p-3 flex flex-col overflow-hidden ${colorObj.bg} ${colorObj.text} z-10 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] transition-all cursor-pointer shadow-[0_8px_25px_rgba(0,0,0,0.06)] border border-white/30`}
                      style={{ top: `${topPixels + 4}px`, height: `${heightPixels - 8}px` }}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={`text-[9px] font-black tracking-widest uppercase ${isTeal ? 'text-white/80' : 'text-black/40'}`}>
                          {startHour.toString().padStart(2, '0')}:{startMin.toString().padStart(2, '0')}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${booking.status === 'CONFIRMED' ? 'bg-white' : 'bg-white/40'} shadow-sm`}></div>
                      </div>
                      
                      <div className="flex flex-col gap-0.5">
                         <span className={`text-xs md:text-sm font-black truncate leading-tight tracking-tight ${isTeal ? 'text-white' : 'text-zinc-950'}`}>
                           {booking.clientName}
                         </span>
                         <span className={`text-[10px] font-bold truncate leading-tight opacity-90 ${isTeal ? 'text-white/90' : 'text-zinc-800'}`}>
                           {booking.service.name}
                         </span>
                      </div>
                      
                      {heightPixels > 60 && (
                        <div className="mt-auto flex items-center gap-1">
                           <div className={`w-4 h-4 rounded-full bg-black/5 flex items-center justify-center`}>
                              <svg className="w-2.5 h-2.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                           </div>
                           <span className={`text-[9px] font-bold truncate ${isTeal ? 'text-white/60' : 'text-zinc-500'}`}>
                             {booking.staff.name}
                           </span>
                        </div>
                      )}
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
