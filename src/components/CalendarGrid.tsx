"use client";

// Colors extracted exactly from the new reference image
const colors = [
  { bg: "bg-[#2DD4BF]", text: "text-white" }, // Teal
  { bg: "bg-[#FCA5A5]", text: "text-[#1C1C1C]" }, // Salmon
  { bg: "bg-[#E5DFD3]", text: "text-[#1C1C1C]" }, // Beige
];

export default function CalendarGrid({ staff, bookings, startOfWeek, daysOfWeek }: { staff: any[], bookings: any[], startOfWeek: Date, daysOfWeek: any[] }) {
  const timeSlots: string[] = [];
  for (let i = 8; i <= 21; i++) {
    timeSlots.push(`${i}:00`);
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const showRedLine = currentHour >= 8 && currentHour <= 21;
  const redLineTop = Math.max(0, (currentHour - 8) * 60 + currentMinute) / 60 * 70;

  return (
    <div className="flex-1 overflow-auto bg-[#F9F9F9] scrollbar-hide rounded-3xl relative">
      <div className="flex min-w-max">
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
      <div className="flex flex-1 min-w-max bg-white relative">
        {showRedLine && (
           <div 
             className="absolute left-0 right-0 h-0.5 bg-red-500 z-20 pointer-events-none" 
             style={{ top: `${72 + redLineTop}px` }}
           >
             <div className="absolute -left-1.5 -top-1 w-2.5 h-2.5 rounded-full bg-red-500"></div>
           </div>
        )}

        {daysOfWeek.map((day: any, colIndex: number) => {
          const isToday = now.getDate() === day.day && now.getMonth() === day.date.getMonth() && now.getFullYear() === day.date.getFullYear();
          
          // Filter bookings for exactly this date
          const dayBookings = bookings.filter((b: any) => {
             const bDate = new Date(b.startTime);
             return bDate.getDate() === day.day && bDate.getMonth() === day.date.getMonth() && bDate.getFullYear() === day.date.getFullYear();
          });
          
          return (
            <div key={day.id} className={`flex-1 min-w-[140px] border-r border-black/5 relative last:border-r-0 ${isToday ? 'bg-blue-50/20' : ''}`}>
              
              {/* Header */}
              <div className={`h-[72px] sticky top-0 z-20 flex flex-col items-center justify-center border-b border-black/5 backdrop-blur-md ${isToday ? 'bg-blue-50/80 text-[#0071E3]' : 'bg-white/80 text-[#1C1C1C]'}`}>
                <span className="font-semibold text-[13px] uppercase tracking-wider opacity-60 mb-0.5">{day.name}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold ${isToday ? 'bg-[#0071E3] text-white shadow-md' : ''}`}>
                  {day.day}
                </div>
              </div>
              
              {/* Grid Lines */}
              <div className="relative">
                {timeSlots.map((time: any, i: number) => (
                  <div key={time} className={`h-[70px] border-b border-black/5 relative hover:bg-black/[0.02] transition-colors`}></div>
                ))}
                
                {/* Bookings */}
                {dayBookings.map((booking: any, index: number) => {
                  const startHour = new Date(booking.startTime).getHours();
                  const startMin = new Date(booking.startTime).getMinutes();
                  const duration = booking.service.duration; 
                  
                  // Limit the display to start at 8:00
                  const topMinutes = Math.max(0, (startHour - 8) * 60 + startMin);
                  const topPixels = (topMinutes / 60) * 70; 
                  const heightPixels = (duration / 60) * 70;

                  const colorObj = colors[booking.service.name.length % colors.length];
                  const isTeal = colorObj.bg === 'bg-[#2DD4BF]';

                  return (
                    <div 
                      key={booking.id}
                      className={`absolute left-1 right-1 rounded-xl p-2.5 flex flex-col overflow-hidden ${colorObj.bg} ${colorObj.text} z-10 hover:brightness-95 transition-all cursor-pointer shadow-sm`}
                      style={{ top: `${topPixels + 2}px`, height: `${heightPixels - 4}px` }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[11px] font-bold ${isTeal ? 'text-white/90' : 'text-black/60'}`}>
                          {new Date(booking.startTime).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${booking.status === 'CONFIRMED' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                      </div>
                      
                      <div className="flex flex-col gap-0.5 mt-0.5">
                         <span className={`text-[13px] font-bold truncate leading-tight ${isTeal ? 'text-white' : 'text-zinc-900'}`}>
                           {booking.clientName}
                         </span>
                         <span className={`text-[11px] font-medium truncate leading-tight ${isTeal ? 'text-white/80' : 'text-zinc-700'}`}>
                           {booking.service.name}
                         </span>
                         {heightPixels > 60 && (
                           <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-black/10">
                              <span className={`text-[10px] font-semibold truncate ${isTeal ? 'text-white/90' : 'text-zinc-600'}`}>{booking.staff.name}</span>
                           </div>
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
