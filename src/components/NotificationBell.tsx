"use client";

import { useState, useEffect } from "react";
import { getBookingNotificationData } from "@/app/actions/notifications";

export default function NotificationBell({ upcomingBookings }: { upcomingBookings: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reminders, setReminders] = useState(upcomingBookings);

  const sendWhatsApp = async (bookingId: string) => {
    try {
      const { phone, message } = await getBookingNotificationData(bookingId);
      const url = `https://wa.me/${phone}?text=${message}`;
      window.open(url, "_blank");
      
      // Optionally mark as sent in local state
      setReminders(prev => prev.filter(b => b.id !== bookingId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 md:w-12 md:h-12 bg-sec-bg rounded-full flex items-center justify-center relative shadow-sm cursor-pointer border border-white/20 transition-colors duration-300 hover:bg-white/10"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6 text-main-text/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
        {reminders.length > 0 && (
          <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-main-bg flex items-center justify-center animate-bounce">
            {reminders.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 bg-white dark:bg-[#1F2532] rounded-[2rem] shadow-2xl border border-main-text/10 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-main-text/10 bg-sidebar/5">
             <h3 className="font-bold text-main-text">Напоминания</h3>
             <p className="text-[10px] text-main-text/40 font-bold uppercase tracking-widest mt-1">Ближайшие записи ({reminders.length})</p>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {reminders.length > 0 ? (
              reminders.map((booking) => (
                <div key={booking.id} className="p-4 border-b border-main-text/5 hover:bg-main-text/5 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-sm text-main-text">{booking.clientName}</p>
                      <p className="text-xs text-main-text/50">{booking.service.name}</p>
                    </div>
                    <p className="text-[10px] font-black text-blue-500 uppercase">
                      {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button 
                    onClick={() => sendWhatsApp(booking.id)}
                    className="w-full py-2 bg-[#25D366] hover:bg-[#20bd5c] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72 1.002 3.864 1.588 5.715 1.589h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Написать в WhatsApp
                  </button>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                 <div className="w-12 h-12 bg-main-text/5 text-main-text/20 rounded-full flex items-center justify-center mx-auto mb-4">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                 </div>
                 <p className="text-sm font-bold text-main-text/40">Напоминаний нет</p>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-sidebar/5 text-center">
             <button onClick={() => setIsOpen(false)} className="text-[10px] font-black uppercase text-main-text/40 hover:text-main-text transition-colors">Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}
