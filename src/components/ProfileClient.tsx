"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface TenantData {
  id: string;
  name: string;
  logoUrl: string | null;
  schedules: {
    startTime: string;
    endTime: string;
  }[];
}

export default function ProfileClient({ 
  session, 
  tenant 
}: { 
  session: any, 
  tenant: TenantData 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Business states
  const [businessName, setBusinessName] = useState(tenant.name);
  const [logoUrl, setLogoUrl] = useState(tenant.logoUrl || "");
  const [startTime, setStartTime] = useState(tenant.schedules[0]?.startTime || "09:00");
  const [endTime, setEndTime] = useState(tenant.schedules[0]?.endTime || "18:00");

  // User settings states
  const [emailNotify, setEmailNotify] = useState(true);
  const [tgNotify, setTgNotify] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleSaveBusiness = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tenant/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: businessName,
          logoUrl: logoUrl,
          startTime,
          endTime
        })
      });

      if (res.ok) {
        toast.success("Данные бизнеса обновлены!");
        router.refresh();
      } else {
        toast.error("Ошибка при сохранении");
      }
    } catch (error) {
      toast.error("Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-32 px-4 md:px-0">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#1C1C1C] tracking-tight">Настройки профиля</h1>
        <p className="text-zinc-400 font-medium">Управление аккаунтом и данными бизнеса</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Business Data Section */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-black/5 border border-black/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <h2 className="text-2xl font-black text-[#1C1C1C]">Данные бизнеса</h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Название компании</label>
                 <input 
                   type="text" 
                   value={businessName}
                   onChange={(e) => setBusinessName(e.target.value)}
                   className="w-full px-6 py-4 bg-zinc-50 border-none rounded-2xl font-bold text-zinc-700 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                   placeholder="Название вашего салона"
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Логотип (URL)</label>
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="flex-1 px-6 py-4 bg-zinc-50 border-none rounded-2xl font-bold text-zinc-700 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                      placeholder="https://..."
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Время открытия</label>
                 <input 
                   type="time" 
                   value={startTime}
                   onChange={(e) => setStartTime(e.target.value)}
                   className="w-full px-6 py-4 bg-zinc-50 border-none rounded-2xl font-bold text-zinc-700 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Время закрытия</label>
                 <input 
                   type="time" 
                   value={endTime}
                   onChange={(e) => setEndTime(e.target.value)}
                   className="w-full px-6 py-4 bg-zinc-50 border-none rounded-2xl font-bold text-zinc-700 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                 />
              </div>
           </div>

           <button 
             onClick={handleSaveBusiness}
             disabled={loading}
             className="w-full md:w-auto px-12 py-5 bg-[#1C1C1C] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
           >
             {loading ? "Сохранение..." : "Сохранить изменения"}
           </button>
        </div>

        {/* User Account Info */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-black/5 border border-black/5 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-full bg-[#1C1C1C] flex items-center justify-center text-white text-3xl font-black border-4 border-white shadow-xl overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              session.user.name?.[0]
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-black text-[#1C1C1C] mb-1">{session.user.name}</h3>
            <p className="text-zinc-400 font-bold mb-4">{session.user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
               <span className="px-4 py-1.5 bg-blue-500/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">{session.user.role}</span>
               <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Активен</span>
            </div>
          </div>
          
          <input 
            type="file" 
            id="profile-photo-upload" 
            className="hidden" 
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setLogoUrl(reader.result as string);
                  toast.success("Фото успешно загружено!");
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          
          <button 
            onClick={() => document.getElementById('profile-photo-upload')?.click()}
            className="px-8 py-4 bg-[#1C1C1C] text-white rounded-2xl font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/10 cursor-pointer"
          >
            Изменить фото
          </button>
          <button 
            onClick={() => toast.error("Смена пароля через поддержку")}
            className="px-6 py-3 bg-zinc-50 hover:bg-zinc-100 rounded-xl font-bold text-xs transition-all active:scale-95 text-zinc-600"
          >
            Сменить пароль
          </button>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-black/5">
              <h3 className="text-lg font-black text-[#1C1C1C] mb-6 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                 </div>
                 Уведомления
              </h3>
              <div className="space-y-4">
                 <button onClick={() => setEmailNotify(!emailNotify)} className="w-full flex items-center justify-between p-2">
                    <span className="font-bold text-zinc-600">Email-уведомления</span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${emailNotify ? 'bg-blue-600' : 'bg-zinc-200'}`}>
                       <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${emailNotify ? 'right-1' : 'left-1'}`}></div>
                    </div>
                 </button>
                 <button onClick={() => setTgNotify(!tgNotify)} className="w-full flex items-center justify-between p-2">
                    <span className="font-bold text-zinc-600">Telegram-бот</span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${tgNotify ? 'bg-blue-600' : 'bg-zinc-200'}`}>
                       <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${tgNotify ? 'right-1' : 'left-1'}`}></div>
                    </div>
                 </button>
              </div>
           </div>

           <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-black/5">
              <h3 className="text-lg font-black text-[#1C1C1C] mb-6 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
                 Безопасность
              </h3>
              <button onClick={() => setTwoFactor(!twoFactor)} className="w-full flex items-center justify-between p-2">
                 <span className="font-bold text-zinc-600">Двухфакторная аутентификация</span>
                 <div className={`w-10 h-5 rounded-full relative transition-colors ${twoFactor ? 'bg-blue-600' : 'bg-zinc-200'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${twoFactor ? 'right-1' : 'left-1'}`}></div>
                 </div>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
