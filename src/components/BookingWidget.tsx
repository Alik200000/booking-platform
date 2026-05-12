"use client";

import { useState, useEffect } from "react";
import { getAvailableSlots, createBooking } from "@/app/actions/booking";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function BookingWidget({ tenant, services, staff, serviceCategories }: any) {
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwaInfo, setShowPwaInfo] = useState(false);

  useEffect(() => {
    // Only auto-fill if the user is a regular CLIENT
    if (session?.user?.role === "CLIENT") {
      if (session.user.name) setClientName(session.user.name);
      if (session.user.email) setClientEmail(session.user.email);
    }
  }, [session]);

  const handleServiceSelect = (svc: any) => {
    setSelectedService(svc);
    setStep(2);
  };

  const handleStaffSelect = (stf: any) => {
    setSelectedStaff(stf);
    setStep(3);
  };

  const handleDateSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedSlot(null);
    setLoading(true);
    
    try {
      const slots = await getAvailableSlots(tenant.id, selectedService.id, selectedStaff.id, date);
      setAvailableSlots(slots);
    } catch (err) {
      console.error(err);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const submitBooking = async () => {
    if (!clientName || !clientPhone) {
      setError("Пожалуйста, заполните имя и WhatsApp номер");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      if (!session && clientEmail && password) {
        // Automatic login/registration attempt
        await signIn("credentials", {
          email: clientEmail,
          password: password,
          redirect: false
        });
      }

      await createBooking({
        tenantId: tenant.id,
        serviceId: selectedService.id,
        staffId: selectedStaff.id,
        startTime: selectedSlot.startTime,
        clientName,
        clientPhone,
        clientEmail,
        password,
        userId: session?.user?.id || null
      });
      setStep(5);
    } catch (err: any) {
      setError(err.message || "Ошибка при создании записи");
    } finally {
      setLoading(false);
    }
  };

  const uncategorizedServices = services.filter((s: any) => !s.categoryId);
  const primary = tenant.primaryColor || "#0071E3";

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{__html: `
        .custom-bg { background-color: ${primary} !important; }
        .custom-text { color: ${primary} !important; }
        .custom-hover-bg:hover:not(:disabled) { background-color: ${primary} !important; color: white !important; }
        .custom-button { background-color: ${primary}; color: white; border-radius: 12px; font-weight: 600; transition: all 0.2s; }
        .custom-button:hover:not(:disabled) { filter: brightness(1.1); transform: scale(0.98); }
        .slot-disabled { background-color: #F1F1F1; color: #BBB; cursor: not-allowed; text-decoration: line-through; }
      `}} />

      <div className="flex justify-center mb-4">
        <button 
          onClick={() => setShowPwaInfo(!showPwaInfo)}
          className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border border-zinc-200 px-4 py-2 rounded-full hover:bg-zinc-50 transition-colors"
        >
          {showPwaInfo ? "Скрыть инструкцию" : "Установить как приложение"}
        </button>
      </div>

      {showPwaInfo && (
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl animate-in slide-in-from-top duration-300 mb-6">
           <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
             Как добавить на главный экран
           </h4>
           <div className="space-y-4 text-sm text-blue-800/80 leading-relaxed">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-900 flex items-center justify-center shrink-0 font-bold">1</span>
                <p>Нажмите кнопку <span className="font-bold">«Поделиться»</span> (квадрат со стрелкой вверх) Safari.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-900 flex items-center justify-center shrink-0 font-bold">2</span>
                <p>Выберите <span className="font-bold">«На экран "Домой"»</span>.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-900 flex items-center justify-center shrink-0 font-bold">3</span>
                <p>Нажмите <span className="font-bold">«Добавить»</span>.</p>
              </div>
           </div>
        </div>
      )}

      {step < 5 && (
        <div className="flex gap-1.5 mb-10">
           {[1, 2, 3, 4].map((s: any) => (
             <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${step >= s ? 'custom-bg' : 'bg-[#E5E5EA]'}`} />
           ))}
        </div>
      )}

      {step === 1 && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <h3 className="text-2xl font-bold mb-6 text-zinc-900 tracking-tight text-center">Выберите услугу</h3>
          <div className="space-y-8">
            {serviceCategories?.map((cat: any) => cat.services.length > 0 && (
              <div key={cat.id}>
                <div className="flex items-center gap-3 mb-4 px-1">
                   {cat.imageUrl && <img src={cat.imageUrl} alt={cat.name} className="w-8 h-8 rounded-lg object-cover" />}
                   <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">{cat.name}</h4>
                </div>
                <div className="space-y-2">
                  {cat.services.map((svc: any) => (
                    <button key={svc.id} onClick={() => handleServiceSelect(svc)} className="w-full text-left p-3.5 bg-[#F5F5F7] rounded-2xl hover:bg-[#E5E5EA] transition-all flex items-center gap-4 group active:scale-[0.98]">
                      {svc.imageUrl && <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0"><img src={svc.imageUrl} alt={svc.name} className="w-full h-full object-cover" /></div>}
                      <div className="flex-1">
                        <p className="font-semibold text-zinc-900">{svc.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5 font-bold uppercase tracking-wider">{svc.duration} мин</p>
                      </div>
                      <span className="font-black text-zinc-900 pr-2">{svc.price.toLocaleString()} ₸</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {uncategorizedServices.length > 0 && (
              <div>
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 px-1">Разное</h4>
                <div className="space-y-2">
                  {uncategorizedServices.map((svc: any) => (
                    <button key={svc.id} onClick={() => handleServiceSelect(svc)} className="w-full text-left p-3.5 bg-[#F5F5F7] rounded-2xl hover:bg-[#E5E5EA] transition-all flex items-center gap-4 group active:scale-[0.98]">
                      {svc.imageUrl && <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0"><img src={svc.imageUrl} alt={svc.name} className="w-full h-full object-cover" /></div>}
                      <div className="flex-1">
                        <p className="font-semibold text-zinc-900">{svc.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5 font-bold uppercase tracking-wider">{svc.duration} мин</p>
                      </div>
                      <span className="font-black text-zinc-900 pr-2">{svc.price.toLocaleString()} ₸</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
           <button onClick={() => setStep(1)} className="text-sm custom-text font-semibold mb-6 flex items-center gap-1 hover:underline">← Назад</button>
           <h3 className="text-2xl font-bold mb-6 text-zinc-900 tracking-tight text-center">Выберите мастера</h3>
           <div className="grid grid-cols-2 gap-4">
             {staff.map((stf: any) => (
               <button key={stf.id} onClick={() => handleStaffSelect(stf)} className="p-6 bg-[#F5F5F7] rounded-3xl hover:bg-[#E5E5EA] transition-colors flex flex-col items-center text-center gap-4 group">
                 <div className="w-20 h-20 bg-[#FFFFFF] rounded-2xl overflow-hidden flex items-center justify-center text-zinc-400 font-black text-2xl shadow-sm border border-black/5 group-hover:scale-110 transition-transform">
                   {stf.imageUrl ? <img src={stf.imageUrl} alt={stf.name} className="w-full h-full object-cover" /> : stf.name[0]}
                 </div>
                 <span className="font-bold text-zinc-900">{stf.name}</span>
               </button>
             ))}
           </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <button onClick={() => setStep(2)} className="text-sm custom-text font-semibold mb-6 flex items-center gap-1 hover:underline">← Назад</button>
          <h3 className="text-2xl font-bold mb-6 text-zinc-900 tracking-tight text-center">Дата и время</h3>
          <input type="date" value={selectedDate} onChange={handleDateSelect} className="w-full p-4 rounded-xl border border-black/10 bg-[#F5F5F7] text-zinc-900 font-medium outline-none mb-8" min={new Date().toISOString().split("T")[0]} />
          {loading ? (
             <div className="text-center py-8 text-zinc-500 font-medium bg-[#F5F5F7] rounded-2xl">Загрузка...</div>
          ) : selectedDate ? (
             availableSlots.length > 0 ? (
               <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                 {availableSlots.map((slot: any, idx: number) => {
                    const slotDate = new Date(slot.startTime);
                    const isPast = slotDate < new Date();
                    const isAvailable = !isPast && !slot.isBooked;
                    
                    return (
                      <button 
                        key={idx} 
                        disabled={!isAvailable}
                        onClick={() => { setSelectedSlot(slot); setStep(4); }} 
                        className={`py-3 rounded-xl transition-colors font-semibold text-sm ${isAvailable ? 'bg-[#F5F5F7] text-zinc-900 custom-hover-bg' : 'slot-disabled'}`}
                      >
                        {slot.time}
                      </button>
                    );
                 })}
               </div>
             ) : (
               <div className="text-center py-8 text-zinc-500 font-medium bg-[#F5F5F7] rounded-2xl">Нет мест</div>
             )
          ) : null}
        </div>
      )}

      {step === 4 && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <button onClick={() => setStep(3)} className="text-sm custom-text font-semibold mb-6 flex items-center gap-1 hover:underline">← Назад</button>
          <h3 className="text-2xl font-bold mb-6 text-zinc-900 tracking-tight text-center">Подтверждение</h3>
          <div className="bg-[#F5F5F7] p-6 rounded-3xl mb-8 text-center border border-black/5">
             <p className="font-semibold text-zinc-900 text-lg">{selectedService.name}</p>
             <p className="text-zinc-500 font-medium mt-1">Мастер: {selectedStaff.name}</p>
             <p className="font-semibold custom-text mt-3">{new Date(selectedDate).toLocaleDateString()} в {selectedSlot.time}</p>
          </div>
          {error && <p className="text-red-500 text-xs font-bold mb-4 text-center">{error}</p>}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Ваше имя</label>
                <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full p-4 rounded-2xl border border-black/5 bg-[#F5F5F7] text-zinc-900 font-semibold outline-none focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">WhatsApp номер</label>
                <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full p-4 rounded-2xl border border-black/5 bg-[#F5F5F7] text-zinc-900 font-semibold outline-none focus:bg-white transition-all" />
              </div>
            </div>
            
            {!session && (
              <div className="space-y-4 p-6 bg-zinc-50 rounded-[2rem] border border-black/5">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Создать личный кабинет</p>
                <div className="grid grid-cols-1 gap-4">
                  <input 
                    type="email" 
                    placeholder="Ваш Email"
                    value={clientEmail} 
                    onChange={e => setClientEmail(e.target.value)} 
                    className="w-full p-4 rounded-2xl border border-black/5 bg-white text-zinc-900 font-semibold outline-none focus:ring-2 focus:ring-blue-500/20" 
                  />
                  <input 
                    type="password" 
                    placeholder="Придумайте пароль"
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full p-4 rounded-2xl border border-black/5 bg-white text-zinc-900 font-semibold outline-none focus:ring-2 focus:ring-blue-500/20" 
                  />
                </div>
                <p className="text-[9px] text-zinc-400 text-center px-4">Для управления записями и связи с мастером</p>
              </div>
            )}

            <button onClick={submitBooking} disabled={loading} className="custom-button w-full py-4 mt-4 text-lg shadow-xl active:scale-[0.98]">
              {loading ? "Загрузка..." : "Записаться"}
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
         <div className="text-center py-12 animate-in zoom-in duration-500">
            <div className="w-24 h-24 custom-bg text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-3xl font-bold mb-3 tracking-tight text-zinc-900">Вы записаны!</h3>
            <p className="text-zinc-500 font-medium text-lg max-w-xs mx-auto leading-relaxed">
              Ждем вас {new Date(selectedDate).toLocaleDateString()}<br/>
              в <span className="text-zinc-900 font-bold">{selectedSlot.time}</span>
            </p>
            {session ? (
               <Link href="/client" className="inline-block mt-8 text-sm custom-text font-bold hover:underline">Перейти в кабинет →</Link>
            ) : (
               <p className="mt-8 text-xs text-zinc-400 font-medium">Войдите в кабинет, чтобы управлять записью</p>
            )}
         </div>
      )}
    </div>
  );
}
