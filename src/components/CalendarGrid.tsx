"use client";

// Colors extracted exactly from the new reference image
const colors = [
  { bg: "bg-[#2DD4BF]", text: "text-white" }, // Teal
  { bg: "bg-[#FCA5A5]", text: "text-[#1C1C1C]" }, // Salmon
  { bg: "bg-[#E5DFD3]", text: "text-[#1C1C1C]" }, // Beige
];

export default function CalendarGrid({ staff, bookings, startOfWeek, daysOfWeek }: { staff: any[], bookings: any[], startOfWeek: Date, daysOfWeek: {id: number, name: string}[] }) {
  const timeSlots = [];
  for (let i = 8; i <= 21; i++) {
    timeSlots.push(`${i}:00`);
  }

  return (
    <div className="flex-1 overflow-auto bg-[#F9F9F9] scrollbar-hide rounded-3xl relative">
      <div className="flex min-w-max">
        {/* Time column */}
      <div className="w-14 flex-shrink-0 z-20 sticky left-0 bg-[#F9F9F9] border-r border-black/5">
        <div className="h-[72px] sticky top-0 z-30 bg-[#F9F9F9]"></div>
        {timeSlots.map(time => (
          <div key={time} className="h-[70px] text-[11px] text-zinc-600 font-medium text-center relative border-b border-transparent">
            <span className="relative -top-2">{time}</span>
          </div>
        ))}
      </div>

      {/* Grid Container */}
      <div className="flex flex-1 min-w-max bg-white">
        {daysOfWeek.map((day, colIndex) => {
          // Filter bookings for this day of the week
          const dayBookings = bookings.filter(b => new Date(b.startTime).getDay() === day.id);
          
          return (
            <div key={day.id} className={`flex-1 min-w-[140px] border-r border-black/5 relative last:border-r-0`}>
              
              {/* Header */}
              <div className="h-[72px] sticky top-0 z-10 flex flex-col items-center justify-center bg-white border-b border-black/5">
                <span className="font-medium text-[#1C1C1C] text-[16px]">{day.name}</span>
                <div className="w-5 h-5 rounded-full bg-zinc-300 mt-1 flex items-center justify-center text-white">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
              </div>
              
              {/* Grid Lines */}
              <div className="relative">
                {timeSlots.map((time, i) => (
                  <div key={time} className={`h-[70px] border-b border-black/5 relative bg-[#F9F9F9]/50`}></div>
                ))}
                
                {/* Bookings */}
                {dayBookings.map((booking, index) => {
                  const startHour = new Date(booking.startTime).getHours();
                  const startMin = new Date(booking.startTime).getMinutes();
                  const duration = booking.service.duration; 
                  
                  // Limit the display to start at 8:00
                  const topMinutes = Math.max(0, (startHour - 8) * 60 + startMin);
                  const topPixels = (topMinutes / 60) * 70; 
                  const heightPixels = (duration / 60) * 70;

                  const colorObj = colors[booking.service.name.length % colors.length];

                  return (
                    <div 
                      key={booking.id}
                      className={`absolute left-[4px] right-[4px] rounded-[10px] p-2.5 flex flex-col overflow-hidden ${colorObj.bg} ${colorObj.text} z-10 hover:brightness-95 transition-all cursor-pointer`}
                      style={{ top: `${topPixels + 2}px`, height: `${heightPixels - 4}px` }}
                    >
                      <div className="mb-2">
                        <span className={`text-[12px] font-medium ${colorObj.bg === 'bg-[#2DD4BF]' ? 'text-white' : 'text-zinc-800'}`}>
                          {new Date(booking.startTime).toLocaleTimeString('en-US', {hour: 'numeric', minute:'2-digit'})}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                         <div className={`w-5 h-5 rounded-full flex items-center justify-center ${colorObj.bg === 'bg-[#2DD4BF]' ? 'bg-black/10 text-white' : 'bg-black/10 text-zinc-800'}`}>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                         </div>
                         <span className={`text-[15px] font-bold truncate leading-none ${colorObj.bg === 'bg-[#2DD4BF]' ? 'text-white' : 'text-zinc-900'}`}>{booking.staff.name}</span>
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
