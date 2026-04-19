"use client";

import { useState } from "react";
import { getAvailableSlots, createBooking } from "@/app/actions/booking";

export default function BookingWidget({ tenant, services, staff }: any) {
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

  if (services.length === 0) {
    return <div className="text-center text-zinc-500 font-medium py-8 bg-[#F5F5F7] rounded-2xl">Услуги пока не добавлены.</div>;
  }

  return (
    <div className="space-y-6">
      {/* ProgressBar */}
      {step < 5 && (
        <div className="flex gap-1.5 mb-10">
           {[1, 2, 3, 4].map(s => (
             <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${step >= s ? 'bg-[#0071E3]' : 'bg-[#E5E5EA]'}`} />
           ))}
        </div>
      )}

      {/* Step 1: Services */}
      {step === 1 && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <h3 className="text-2xl font-bold mb-6 text-zinc-900 tracking-tight">Выберите услугу</h3>
          <div className="space-y-3">
            {services.map((svc: any) => (
              <button 
                key={svc.id} 
                onClick={() => handleServiceSelect(svc)}
                className="w-full text-left p-5 bg-[#F5F5F7] rounded-2xl hover:bg-[#E5E5EA] transition-colors flex justify-between items-center group"
              >
                <div>
                  <p className="font-semibold text-zinc-900 text-lg">{svc.name}</p>
                  <p className="text-sm text-zinc-500 mt-0.5 font-medium">{svc.duration} минут</p>
                </div>
                <span className="font-bold text-zinc-900 group-hover:text-[#0071E3] transition-colors">${svc.price}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Staff */}
      {step === 2 && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
           <button onClick={() => setStep(1)} className="text-sm text-[#0071E3] font-semibold mb-6 flex items-center gap-1 hover:underline">← Назад</button>
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
          <button onClick={() => setStep(2)} className="text-sm text-[#0071E3] font-semibold mb-6 flex items-center gap-1 hover:underline">← Назад</button>
          <h3 className="text-2xl font-bold mb-6 text-zinc-900 tracking-tight">Дата и время</h3>
          
          <input 
            type="date" 
            value={selectedDate}
            onChange={handleDateSelect}
            className="apple-input mb-8"
            min={new Date().toISOString().split("T")[0]}
          />

          {loading ? (
             <div className="text-center py-8 text-zinc-500 font-medium bg-[#F5F5F7] rounded-2xl">Загрузка расписания...</div>
          ) : selectedDate ? (
             availableSlots.length > 0 ? (
               <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                 {availableSlots.map((slot, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setStep(4);
                      }}
                      className="py-3 bg-[#F5F5F7] text-zinc-900 rounded-xl hover:bg-[#0071E3] hover:text-white transition-colors font-semibold text-sm"
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
          <button onClick={() => setStep(3)} className="text-sm text-[#0071E3] font-semibold mb-6 flex items-center gap-1 hover:underline">← Назад</button>
          <h3 className="text-2xl font-bold mb-6 text-zinc-900 tracking-tight">Ваши данные</h3>
          
          <div className="bg-[#F5F5F7] p-6 rounded-2xl mb-8">
             <p className="font-semibold text-zinc-900 text-lg">{selectedService.name}</p>
             <p className="text-zinc-500 font-medium mt-1">Мастер: {selectedStaff.name}</p>
             <p className="font-semibold text-[#0071E3] mt-3">{new Date(selectedDate).toLocaleDateString()} в {selectedSlot.time}</p>
          </div>

          {error && <div className="text-red-500 text-sm font-semibold mb-4 text-center">{error}</div>}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-zinc-900">Имя</label>
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="apple-input" placeholder="Введите имя" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-zinc-900">Телефон</label>
              <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="apple-input" placeholder="+7 (999) 000-00-00" />
            </div>
            
            <button 
              onClick={submitBooking}
              disabled={loading}
              className="apple-button w-full py-4 mt-6 text-lg"
            >
              {loading ? "Обработка..." : "Записаться"}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Success */}
      {step === 5 && (
         <div className="text-center py-12 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-[#0071E3] text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/30">
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
