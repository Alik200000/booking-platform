"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Settings {
  starterPrice: number;
  proPrice: number;
  premiumPrice: number;
  globalDiscount: number;
  platformCommission: number;
}

export default function SuperadminPlansClient({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [starter, setStarter] = useState(settings.starterPrice);
  const [pro, setPro] = useState(settings.proPrice);
  const [premium, setPremium] = useState(settings.premiumPrice);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/superadmin/settings/update", {
        method: "POST",
        body: JSON.stringify({
          starter,
          pro,
          premium,
          commission: settings.platformCommission,
          discount: settings.globalDiscount
        }),
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        toast.success("Новые цены успешно применены!");
        router.refresh();
      } else {
        toast.error("Ошибка при сохранении");
      }
    } catch (error) {
      toast.error("Произошла ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="px-1 md:px-0">
         <h1 className="text-4xl md:text-[3rem] font-black tracking-tight text-[#1C1C1C]">Тарифы</h1>
         <p className="text-gray-400 font-medium text-sm mt-1">Редактирование стоимости и обзор возможностей</p>
      </div>

      <div className="max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <PlanCardEdit 
            name="STARTER" 
            value={starter}
            onChange={setStarter}
            color="amber"
            description="Для небольших салонов"
            features={["До 3 мастеров", "Безлимитные записи", "Клиентский портал", "Базовая CRM"]}
          />
          
          <PlanCardEdit 
            name="PRO" 
            value={pro}
            onChange={setPro}
            color="blue"
            description="Для сети салонов"
            features={["Безлимитные мастера", "API и Интеграции", "Выделенная поддержка", "Расширенная аналитика"]}
            popular={true}
          />
          
          <PlanCardEdit 
            name="PREMIUM" 
            value={premium}
            onChange={setPremium}
            color="purple"
            description="Максимальные возможности"
            features={["Все функции PRO", "Брендирование виджета", "Личный менеджер 24/7", "Индивидуальный договор"]}
          />

          <div className="md:col-span-3 flex justify-center mt-6 md:mt-10">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full md:w-auto px-12 py-6 bg-[#1C1C1C] text-white rounded-[2rem] md:rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-gray-200 disabled:opacity-50"
            >
              {loading ? "Сохранение..." : "Сохранить новые цены"}
            </button>
          </div>
        </div>

        <div className="mt-12 md:mt-16 p-8 md:p-10 bg-gray-50 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h4 className="text-xl font-black text-[#1C1C1C]">Тариф FREE</h4>
            <p className="text-sm text-gray-400 font-medium mt-1">Всегда бесплатно для частных мастеров: 1 мастер, до 50 записей в месяц.</p>
          </div>
          <div className="px-6 py-2 bg-white border border-gray-200 rounded-xl font-black text-xs text-gray-400 whitespace-nowrap">0 ₸ / мес</div>
        </div>
      </div>
    </div>
  );
}

function PlanCardEdit({ name, value, onChange, color, features, description, popular }: any) {
  const colors: any = {
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100"
  };

  return (
    <div className={`border rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 transition-all flex flex-col relative ${popular ? 'bg-[#1D1D1F] text-white border-transparent md:scale-105 shadow-2xl' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'}`}>
      {popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full z-10">Популярный</div>}
      
      <div className={`w-fit px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-4 ${popular ? 'bg-white/10 text-white' : colors[color]}`}>
        {name}
      </div>
      
      <p className={`text-sm font-medium mb-6 md:mb-8 ${popular ? 'text-gray-400' : 'text-gray-400'}`}>{description}</p>
      
      <div className="mb-8 md:mb-10">
        <label className={`block text-[9px] font-black uppercase mb-3 ml-1 tracking-widest ${popular ? 'text-gray-500' : 'text-gray-300'}`}>Цена в месяц (₸)</label>
        <div className="flex items-center gap-3">
          <input 
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className={`w-full text-3xl md:text-4xl font-black bg-transparent outline-none border-b-2 py-2 ${popular ? 'border-white/10 focus:border-white text-white' : 'border-zinc-100 focus:border-zinc-900 text-zinc-900'} transition-all`}
          />
        </div>
      </div>

      <div className="space-y-4">
        {features.map((f: string) => (
          <div key={f} className="flex items-center gap-3">
            <svg className={`w-4 h-4 ${popular ? 'text-blue-400' : 'text-emerald-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            <span className={`text-xs font-bold ${popular ? 'text-gray-300' : 'text-gray-500'}`}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
