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
              className={`bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${daySchedule.isActive ? 'opacity-100' : 'opacity-40'}`}
            >
              <div className="flex items-center gap-6 w-full md:w-auto">
                <button 
                  onClick={() => toggleDay(daySchedule.dayOfWeek)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black transition-all ${daySchedule.isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-white/10 text-white/40'}`}
                >
                  {dayInfo.short}
                </button>
                <div className="flex-1 md:flex-none">
                  <p className="font-bold text-lg">{dayInfo.name}</p>
                  <p className="text-xs font-medium text-white/30 uppercase tracking-widest">
                    {daySchedule.isActive ? 'Рабочий день' : 'Выходной'}
                  </p>
                </div>
              </div>

              {daySchedule.isActive && (
                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-white/30 uppercase">С</label>
                    <input 
                      type="time" 
                      value={daySchedule.startTime}
                      onChange={(e) => updateTime(daySchedule.dayOfWeek, "startTime", e.target.value)}
                      className="bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="w-4 h-[2px] bg-white/20 mt-4" />
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-white/30 uppercase">До</label>
                    <input 
                      type="time" 
                      value={daySchedule.endTime}
                      onChange={(e) => updateTime(daySchedule.dayOfWeek, "endTime", e.target.value)}
                      className="bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              )}
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
