"use client";

import { useState } from "react";
import { getAvailableSlots, createBooking } from "@/app/actions/booking";

export default function BookingWidget({ tenant, services, staff, serviceCategories }: any) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setError("Пожалуйста, заполните имя и телефон");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      await createBooking({
        tenantId: tenant.id,
        serviceId: selectedService.id,
        staffId: selectedStaff.id,
        startTime: selectedSlot.startTime,
        clientName,
        clientPhone
      });
      setStep(5);
    } catch (err: any) {
      setError(err.message || "Ошибка при создании записи");
    } finally {
      setLoading(false);
    }
  };

  const uncategorizedServices = services.filter((s: any) => !s.categoryId);

  if (services.length === 0) {
    return <div className="text-center text-zinc-500 font-medium py-8 bg-[#F5F5F7] rounded-2xl">Услуги пока не добавлены.</div>;
  }

  const primary = tenant.primaryColor || "#0071E3";

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{__html: `
        .custom-bg { background-color: ${primary} !important; }
        .custom-text { color: ${primary} !important; }
        .custom-hover-bg:hover { background-color: ${primary} !important; color: white !important; }
        .group:hover .custom-group-hover-text { color: ${primary} !important; }
        .custom-button { background-color: ${primary}; color: white; border-radius: 12px; font-weight: 600; transition: all 0.2s; }
        .custom-button:hover { filter: brightness(1.1); transform: scale(0.98); }
        .custom-button:disabled { opacity: 0.5; transform: none; cursor: not-allowed; }
      `}} />

      {/* ProgressBar */}
      {step < 5 && (
        <div className="flex gap-1.5 mb-10">
           {[1, 2, 3, 4].map((s: any) => (
             <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${step >= s ? 'custom-bg' : 'bg-[#E5E5EA]'}`} />
           ))}
        </div>
      )}

      {/* Step 1: Services */}
      {step === 1 && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <h3 className="text-2xl font-bold mb-6 text-zinc-900 tracking-tight">Выберите услугу</h3>
          
          <div className="space-y-8">
            {/* Categorized Services */}
            {serviceCategories?.map((cat: any) => cat.services.length > 0 && (
              <div key={cat.id}>
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 px-1">{cat.name}</h4>
                <div className="space-y-2">
                  {cat.services.map((svc: any) => (
                    <button 
                      key={svc.id} 
                      onClick={() => handleServiceSelect(svc)}
                      className="w-full text-left p-4 bg-[#F5F5F7] rounded-2xl hover:bg-[#E5E5EA] transition-all flex justify-between items-center group active:scale-[0.98]"
                    >
                      <div>
                        <p className="font-semibold text-zinc-900">{svc.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5 font-bold uppercase tracking-wider">{svc.duration} мин</p>
                      </div>
                      <span className="font-black text-zinc-900 custom-group-hover-text transition-colors">{svc.price.toLocaleString()} ₸</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Uncategorized Services */}
            {uncategorizedServices.length > 0 && (
              <div>
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 px-1">Разное</h4>
                <div className="space-y-2">
                  {uncategorizedServices.map((svc: any) => (
                    <button 
                      key={svc.id} 
                      onClick={() => handleServiceSelect(svc)}
                      className="w-full text-left p-4 bg-[#F5F5F7] rounded-2xl hover:bg-[#E5E5EA] transition-all flex justify-between items-center group active:scale-[0.98]"
                    >
                      <div>
                        <p className="font-semibold text-zinc-900">{svc.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5 font-bold uppercase tracking-wider">{svc.duration} мин</p>
                      </div>
                      <span className="font-black text-zinc-900 custom-group-hover-text transition-colors">{svc.price.toLocaleString()} ₸</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Staff */}
      {step === 2 && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
           <button onClick={() => setStep(1)} className="text-sm custom-text font-semibold mb-6 flex items-center gap-1 hover:underline">← Назад</button>
           <h3 className="text-2xl font-bold mb-6 text-zinc-900 tracking-tight">Выберите мастера</h3>
           <div className="grid grid-cols-2 gap-4">
             {staff.map((stf: any) => (
               <button 
                 key={stf.id}
                 onClick={() => handleStaffSelect(stf)}
                 className="p-6 bg-[#F5F5F7] rounded-2xl hover:bg-[#E5E5EA] transition-colors flex flex-col items-center text-center gap-3"
               >
                 <div className="w-16 h-16 bg-[#FFFFFF] rounded-full flex items-center justify-center text-zinc-400 font-semibold text-xl shadow-sm border border-black/5">
                   {stf.name[0]}
                 </div>
                 <span className="font-semibold text-zinc-900">{stf.name}</span>
               </button>
             ))}
           </div>
        </div>
      )}

      {/* Step 3: Date & Time */}
      {step === 3 && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <button onClick={() => setStep(2)} className="text-sm custom-text font-semibold mb-6 flex items-center gap-1 hover:underline">← Назад</button>
          <h3 className="text-2xl font-bold mb-6 text-zinc-900 tracking-tight">Дата и время</h3>
          
          <input 
            type="date" 
            value={selectedDate}
            onChange={handleDateSelect}
            className="w-full p-4 rounded-xl border border-black/10 bg-[#F5F5F7] text-zinc-900 font-medium outline-none mb-8"
            min={new Date().toISOString().split("T")[0]}
          />

          {loading ? (
             <div className="text-center py-8 text-zinc-500 font-medium bg-[#F5F5F7] rounded-2xl">Загрузка расписания...</div>
          ) : selectedDate ? (
             availableSlots.length > 0 ? (
               <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                 {availableSlots.map((slot: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setStep(4);
                      }}
                      className="py-3 bg-[#F5F5F7] text-zinc-900 rounded-xl custom-hover-bg transition-colors font-semibold text-sm"
                    >
                      {slot.time}
                    </button>
                 ))}
               </div>
             ) : (
               <div className="text-center py-8 text-zinc-500 font-medium bg-[#F5F5F7] rounded-2xl">Нет свободных мест</div>
             )
          ) : null}
        </div>
      )}

      {/* Step 4: Details */}
      {step === 4 && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <button onClick={() => setStep(3)} className="text-sm custom-text font-semibold mb-6 flex items-center gap-1 hover:underline">← Назад</button>
          <h3 className="text-2xl font-bold mb-6 text-zinc-900 tracking-tight">Ваши данные</h3>
          
          <div className="bg-[#F5F5F7] p-6 rounded-2xl mb-8">
             <p className="font-semibold text-zinc-900 text-lg">{selectedService.name}</p>
             <p className="text-zinc-500 font-medium mt-1">Мастер: {selectedStaff.name}</p>
             <p className="font-semibold custom-text mt-3">{new Date(selectedDate).toLocaleDateString()} в {selectedSlot.time}</p>
          </div>

          {error && <div className="text-red-500 text-sm font-semibold mb-4 text-center">{error}</div>}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-zinc-900">Имя</label>
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full p-4 rounded-xl border border-black/10 bg-[#F5F5F7] text-zinc-900 font-medium outline-none" placeholder="Введите имя" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-zinc-900">Телефон</label>
              <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full p-4 rounded-xl border border-black/10 bg-[#F5F5F7] text-zinc-900 font-medium outline-none" placeholder="+7 (999) 000-00-00" />
            </div>
            
            <button 
              onClick={submitBooking}
              disabled={loading}
              className="custom-button w-full py-4 mt-6 text-lg"
            >
              {loading ? "Обработка..." : "Записаться"}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Success */}
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
         </div>
      )}
    </div>
  );
}
