"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  if (!session) return null;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#1C1C1C] tracking-tight">Профиль</h1>
        <p className="text-zinc-400 font-medium">Управление вашим аккаунтом и настройками</p>
      </div>

      <div className="space-y-6">
        {/* Main Info Card */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-black/5 border border-black/5 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full bg-sidebar flex items-center justify-center text-white text-4xl font-black shadow-xl border-4 border-white ring-1 ring-black/5 overflow-hidden">
            {session.user.name?.[0] || "U"}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-[#1C1C1C] mb-1">{session.user.name}</h2>
            <p className="text-zinc-400 font-bold mb-6 italic">{session.user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
               <span className="px-4 py-1.5 bg-blue-500/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">{session.user.role}</span>
               <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Активен</span>
            </div>
          </div>
          <button className="px-8 py-4 bg-[#1C1C1C] text-white rounded-2xl font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/10">
            Изменить фото
          </button>
        </div>

        {/* Settings Groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-black/5">
              <h3 className="text-lg font-black text-[#1C1C1C] mb-6 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
                 Безопасность
              </h3>
              <div className="space-y-4">
                 <button className="w-full p-4 bg-zinc-50 hover:bg-zinc-100 rounded-2xl text-left flex items-center justify-between transition-colors group">
                    <span className="font-bold text-zinc-600">Сменить пароль</span>
                    <svg className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                 </button>
                 <button className="w-full p-4 bg-zinc-50 hover:bg-zinc-100 rounded-2xl text-left flex items-center justify-between transition-colors group">
                    <span className="font-bold text-zinc-600">Двухфакторная аутентификация</span>
                    <div className="w-10 h-5 bg-zinc-200 rounded-full relative">
                       <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                 </button>
              </div>
           </div>

           <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-black/5">
              <h3 className="text-lg font-black text-[#1C1C1C] mb-6 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                 </div>
                 Уведомления
              </h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-2">
                    <span className="font-bold text-zinc-600">Email-уведомления</span>
                    <div className="w-10 h-5 bg-blue-500 rounded-full relative">
                       <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-2">
                    <span className="font-bold text-zinc-600">Telegram-бот</span>
                    <div className="w-10 h-5 bg-zinc-200 rounded-full relative">
                       <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-10">
           <button className="text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 px-6 py-3 rounded-xl transition-colors">
              Удалить аккаунт и данные
           </button>
        </div>
      </div>
    </div>
  );
}
