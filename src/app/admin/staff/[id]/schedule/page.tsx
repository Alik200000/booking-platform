"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { updateStaffSchedule } from "@/app/actions/staff";
import Link from "next/link";

const DAYS = [
  { id: 1, name: "Понедельник", short: "Пн" },
  { id: 2, name: "Вторник", short: "Вт" },
  { id: 3, name: "Среда", short: "Ср" },
  { id: 4, name: "Четверг", short: "Чт" },
  { id: 5, name: "Пятница", short: "Пт" },
  { id: 6, name: "Суббота", short: "Сб" },
  { id: 0, name: "Воскресенье", short: "Вс" },
];

export default function StaffSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const staffId = params.id as string;

  const [schedules, setSchedules] = useState<any[]>(
    DAYS.map(day => ({
      dayOfWeek: day.id,
      startTime: "09:00",
      endTime: "18:00",
      isActive: [1, 2, 3, 4, 5].includes(day.id)
    }))
  );
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const toggleDay = (dayId: number) => {
    setSchedules(prev => prev.map(s => 
      s.dayOfWeek === dayId ? { ...s, isActive: !s.isActive } : s
    ));
  };

  const updateTime = (dayId: number, field: "startTime" | "endTime", value: string) => {
    setSchedules(prev => prev.map(s => 
      s.dayOfWeek === dayId ? { ...s, [field]: value } : s
    ));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      await updateStaffSchedule(staffId, schedules);
      setMessage("Расписание сохранено!");
      setTimeout(() => router.push("/admin/staff"), 1500);
    } catch (err) {
      console.error(err);
      setMessage("Ошибка при сохранении");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F2532] text-white p-4 md:p-10 pb-32">
      <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <Link href="/admin/staff" className="text-blue-400 hover:underline text-sm mb-4 inline-block">← Назад к списку</Link>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
          График работы
        </h1>
        <p className="text-white/40 font-medium uppercase tracking-[0.2em] text-xs">
          Настройте рабочие часы мастера
        </p>
      </header>

      <div className="max-w-3xl mx-auto space-y-6">
        {schedules.map((daySchedule) => {
          const dayInfo = DAYS.find(d => d.id === daySchedule.dayOfWeek)!;
          return (
            <div 
              key={daySchedule.dayOfWeek}
              className={`bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-500 ${daySchedule.isActive ? 'border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.1)]' : 'opacity-40 grayscale-[0.5]'}`}
            >
              <div className="flex items-center gap-6 w-full sm:w-auto">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black transition-all duration-500 ${daySchedule.isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-white/10 text-white/40'}`}>
                  {dayInfo.short}
                </div>
                <div className="flex-1 sm:flex-none">
                  <p className="font-bold text-lg">{dayInfo.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <button 
                      onClick={() => toggleDay(daySchedule.dayOfWeek)}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${daySchedule.isActive ? 'bg-blue-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${daySchedule.isActive ? 'translate-x-5' : ''}`} />
                    </button>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${daySchedule.isActive ? 'text-blue-400' : 'text-white/30'}`}>
                      {daySchedule.isActive ? 'Работает' : 'Отдых'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-white/30 uppercase">С</label>
                  <input 
                    type="time" 
                    disabled={!daySchedule.isActive}
                    value={daySchedule.startTime}
                    onChange={(e) => updateTime(daySchedule.dayOfWeek, "startTime", e.target.value)}
                    className={`bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 transition-all ${!daySchedule.isActive ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'}`}
                  />
                </div>
                <div className="w-4 h-[2px] bg-white/20 mt-4" />
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-white/30 uppercase">До</label>
                  <input 
                    type="time" 
                    disabled={!daySchedule.isActive}
                    value={daySchedule.endTime}
                    onChange={(e) => updateTime(daySchedule.dayOfWeek, "endTime", e.target.value)}
                    className={`bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 transition-all ${!daySchedule.isActive ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'}`}
                  />
                </div>
                
                {daySchedule.isActive && (
                   <button 
                    onClick={() => {
                      const { startTime, endTime } = daySchedule;
                      setSchedules(prev => prev.map(s => s.isActive ? { ...s, startTime, endTime } : s));
                    }}
                    title="Применить ко всем рабочим дням"
                    className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all ml-2"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                   </button>
                )}
              </div>
            </div>
          );
        })}

        <div className="pt-10">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black uppercase tracking-[0.2em] text-xs rounded-3xl shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98]"
          >
            {loading ? "Сохранение..." : "Применить расписание"}
          </button>
          {message && (
             <p className="text-center mt-4 text-emerald-400 font-bold animate-pulse">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
