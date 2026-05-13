"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileCalendarTimeline({ 
  staff, 
  bookings, 
  currentDate,
  selectedStaffId
}: { 
  staff: any[], 
  bookings: any[], 
  currentDate: Date,
  selectedStaffId: string
}) {
  const [activeView, setActiveView] = useState<'calendar' | 'list'>('calendar');
  
  // Generate days for the top date picker (around current date)
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Get Monday
    d.setDate(diff + i);
    return {
      date: d,
      name: d.toLocaleDateString('ru-RU', { weekday: 'short' }),
      day: d.getDate(),
      isToday: d.toDateString() === new Date().toDateString(),
      isSelected: d.toDateString() === currentDate.toDateString()
    };
  });

  // Filter bookings for today and selected staff
  const displayBookings = bookings
    .filter(b => selectedStaffId === 'all' || b.staffId === selectedStaffId)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="flex flex-col h-full bg-[#F5F7FA] -mx-4 -mt-4 pb-24 overflow-auto scrollbar-hide">
      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4 flex justify-between items-center sticky top-0 z-50 shadow-sm border-b border-black/[0.02]">
         <h1 className="text-2xl font-black text-[#1C1C1E]">Записи</h1>
         <div className="flex gap-4">
            <button className="text-zinc-400 hover:text-black"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></button>
            <button className="text-zinc-400 hover:text-black relative">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
               <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></div>
            </button>
         </div>
      </div>

      {/* View Toggle */}
      <div className="px-6 py-4">
         <div className="bg-[#E9EDF5] p-1 rounded-2xl flex gap-1 shadow-inner border border-black/5">
            <button 
              onClick={() => setActiveView('calendar')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${activeView === 'calendar' ? 'bg-white text-blue-600 shadow-md' : 'text-zinc-500'}`}
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
               Календарь
            </button>
            <button 
              onClick={() => setActiveView('list')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${activeView === 'list' ? 'bg-white text-blue-600 shadow-md' : 'text-zinc-500'}`}
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
               Список
            </button>
         </div>
      </div>

      {/* Staff Slider */}
      <div className="px-6 pb-6">
         <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            <Link 
              href={`/admin/calendar?staffId=all`}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs whitespace-nowrap transition-all ${selectedStaffId === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-zinc-600 border border-black/5'}`}
            >
               <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
               </div>
               Все сотрудники
            </Link>
            {staff.map(s => (
               <Link 
                 key={s.id}
                 href={`/admin/calendar?staffId=${s.id}`}
                 className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs whitespace-nowrap transition-all ${selectedStaffId === s.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-zinc-600 border border-black/5'}`}
               >
                  <div className="w-6 h-6 rounded-full bg-zinc-200 overflow-hidden text-[8px] flex items-center justify-center">
                     {s.name[0]}
                  </div>
                  {s.name}
               </Link>
            ))}
         </div>
      </div>

      {/* Date Switcher */}
      <div className="px-6 pb-6">
         <div className="flex justify-between items-center bg-white rounded-3xl p-4 shadow-sm border border-black/5">
            <button className="text-zinc-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg></button>
            <div className="flex gap-6 overflow-x-auto no-scrollbar px-4">
               {days.map(d => {
                  // Вычисляем offset для каждого дня относительно СЕГОДНЯ
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const diffTime = d.date.getTime() - today.getTime();
                  const dayOffset = Math.round(diffTime / (1000 * 60 * 60 * 24));

                  return (
                    <Link 
                      key={d.date.toISOString()} 
                      href={`/admin/calendar?view=day&offset=${dayOffset}&staffId=${selectedStaffId}`}
                      className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${d.isSelected ? 'scale-110' : ''}`}
                    >
                       <span className={`text-[10px] font-black uppercase ${d.isSelected ? 'text-blue-600' : 'text-zinc-400'}`}>{d.name}</span>
                       <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${d.isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'text-zinc-800 bg-zinc-50'}`}>
                          {d.day}
                       </div>
                       {d.isToday && !d.isSelected && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-0.5"></div>}
                    </Link>
                  );
               })}
            </div>
            <button className="text-zinc-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg></button>
         </div>
      </div>

      {/* Timeline Content */}
      <div className="px-6 space-y-6 relative">
         {/* Filter label */}
         <div className="flex justify-between items-center">
            <button className="flex items-center gap-2 text-zinc-500 font-bold text-xs bg-white px-4 py-2 rounded-xl shadow-sm border border-black/5">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
               Сегодня, {currentDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
            </button>
            <button className="flex items-center gap-2 text-zinc-500 font-bold text-xs">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path></svg>
               Фильтр
            </button>
         </div>

         {/* Time Grid with Bookings */}
         <div className="relative pl-12 space-y-8">
            {/* The vertical line */}
            <div className="absolute left-[20px] top-4 bottom-4 w-px bg-zinc-200 border-dashed border-l"></div>

            {/* Render slots from 09:00 to 18:00 */}
            {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(hour => {
               const hourBookings = displayBookings.filter(b => new Date(b.startTime).getUTCHours() === hour);
               
               return (
                  <div key={hour} className="relative">
                     <span className="absolute -left-12 top-0 text-[10px] font-black text-zinc-400">{hour.toString().padStart(2, '0')}:00</span>
                     
                     <div className="space-y-3">
                        {hourBookings.length > 0 ? (
                           hourBookings.map((b, idx) => {
                              const colors = [
                                 'bg-[#F5EFFF] border-[#E8D9FF] text-[#6333FF]', // Purple
                                 'bg-[#E9F5FF] border-[#D1E9FF] text-[#007AFF]', // Blue
                                 'bg-[#E9FFF1] border-[#D1FFE2] text-[#00A84D]'  // Green
                              ];
                              const color = colors[idx % colors.length];
                              
                              return (
                                 <div key={b.id} className={`${color.split(' ')[0]} ${color.split(' ')[1]} border-l-4 rounded-3xl p-4 shadow-sm animate-in slide-in-from-right-4 duration-500`}>
                                    <div className="flex justify-between items-start mb-3">
                                       <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center text-xs font-black">
                                             {b.clientName[0]}
                                          </div>
                                          <div>
                                             <h4 className="text-sm font-black text-zinc-900 leading-none mb-1">{b.clientName}</h4>
                                             <p className="text-[11px] font-bold opacity-70">{b.service.name}</p>
                                          </div>
                                       </div>
                                       <div className="text-right">
                                          <span className="text-xs font-black text-zinc-900">{new Date(b.startTime).getUTCHours()}:{new Date(b.startTime).getUTCMinutes().toString().padStart(2, '0')}</span>
                                          <div className="flex items-center gap-1 mt-1 justify-end">
                                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                             <span className="text-[9px] font-black uppercase opacity-60">{b.staff.name}</span>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              );
                           })
                        ) : (
                           <div className="h-4"></div>
                        )}
                     </div>
                  </div>
               );
            })}
         </div>

         {/* Staff Load Section */}
         <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-black/5 mt-10">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
               </div>
               <div>
                  <h3 className="font-black text-sm text-zinc-900 leading-none mb-1">Загрузка сотрудников</h3>
                  <p className="text-[10px] font-bold text-zinc-400">{displayBookings.length} записей на сегодня</p>
               </div>
            </div>
            
            <div className="flex justify-around">
               {staff.slice(0, 3).map((s, i) => {
                  // Рассчитываем реальную загрузку: количество записей / 8 рабочих часов (примерно) * 100
                  const staffBookings = bookings.filter(b => b.staffId === s.id);
                  const loadPercent = Math.min(100, Math.round((staffBookings.length / 8) * 100));
                  
                  const colors = ['border-purple-500', 'border-blue-500', 'border-green-500'];
                  return (
                     <div key={s.id} className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-full border-4 ${colors[i % colors.length]} flex items-center justify-center text-[10px] font-black`}>
                           {loadPercent}%
                        </div>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">{s.name}</span>
                     </div>
                  );
               })}
            </div>
         </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-28 right-6 w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/40 active:scale-90 transition-all z-[100]">
         <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
      </button>
    </div>
  );
}
