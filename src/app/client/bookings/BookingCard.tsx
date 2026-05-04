"use client";

import { useState } from "react";
import { cancelBooking } from "@/app/actions/booking";
import Link from "next/link";

export default function BookingCard({ booking, userId }: { booking: any, userId: string }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(booking.status);

  const handleCancel = async () => {
    if (!confirm("Вы уверены, что хотите отменить запись?")) return;
    
    setLoading(true);
    try {
      await cancelBooking(booking.id, userId);
      setStatus("CANCELLED");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isCancelled = status === "CANCELLED";

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5 flex flex-col sm:flex-row justify-between items-center gap-6 group transition-all hover:shadow-xl">
      <div className="flex items-center gap-6 w-full">
        <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden border border-zinc-200">
          {booking.tenant.logoUrl ? (
            <img src={booking.tenant.logoUrl} alt={booking.tenant.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-zinc-400">{booking.tenant.name[0]}</span>
          )}
        </div>
        <div className="flex-1">
          <h3 className={`text-xl font-bold ${isCancelled ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>{booking.service.name}</h3>
          <p className="text-zinc-500 font-medium mt-1">{booking.tenant.name} • {booking.staff.name}</p>
        </div>
      </div>

      <div className="text-center sm:text-right w-full sm:w-auto">
        <p className={`text-2xl font-black ${isCancelled ? 'text-zinc-300' : 'text-zinc-900'} leading-none`}>
          {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p className="text-zinc-400 font-bold uppercase text-[10px] mt-2 tracking-widest">
          {new Date(booking.startTime).toLocaleDateString([], { day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className="pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-zinc-100 sm:pl-6 w-full sm:w-auto flex flex-col items-center gap-3">
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${
          status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
          isCancelled ? 'bg-rose-50 text-rose-600 border-rose-100' :
          'bg-amber-50 text-amber-600 border-amber-100'
        }`}>
          {status === 'CONFIRMED' ? 'Подтверждено' : 
           isCancelled ? 'Отменено' : 'Ожидание'}
        </span>
        
        {!isCancelled && (
          <div className="flex gap-2">
            <Link 
              href={`/client/chat/${booking.tenant.id}`}
              className="px-4 py-2 bg-[#F5F5F7] text-zinc-900 rounded-xl text-[11px] font-bold hover:bg-[#E5E5EA] transition-colors flex items-center gap-2"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
              Чат
            </Link>
            <button 
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 text-rose-600 border border-rose-100 rounded-xl text-[11px] font-bold hover:bg-rose-50 transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'Отменить'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
