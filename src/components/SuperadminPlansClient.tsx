"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Settings {
  starterPrice: number;
  starterDescription: string;
  starterFeatures: string[];
  proPrice: number;
  proDescription: string;
  proFeatures: string[];
  premiumPrice: number;
  premiumDescription: string;
  premiumFeatures: string[];
  globalDiscount: number;
  platformCommission: number;
}

export default function SuperadminPlansClient({ settings }: { settings: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [starter, setStarter] = useState({
    price: settings.starterPrice,
    description: settings.starterDescription || "",
    features: settings.starterFeatures.join("\n")
  });

  const [pro, setPro] = useState({
    price: settings.proPrice,
    description: settings.proDescription || "",
    features: settings.proFeatures.join("\n")
  });

  const [premium, setPremium] = useState({
    price: settings.premiumPrice,
    description: settings.premiumDescription || "",
    features: settings.premiumFeatures.join("\n")
  });

  const [kaspi, setKaspi] = useState({
    phone: settings.kaspiPhone || "+7 707 382 92 87",
    recipient: settings.kaspiRecipient || "Алик М."
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/superadmin/settings/update", {
        method: "POST",
        body: JSON.stringify({
          starterPrice: starter.price,
          starterDescription: starter.description,
          starterFeatures: starter.features.split("\n").filter((f: string) => f.trim() !== ""),
          proPrice: pro.price,
          proDescription: pro.description,
          proFeatures: pro.features.split("\n").filter((f: string) => f.trim() !== ""),
          premiumPrice: premium.price,
          premiumDescription: premium.description,
          premiumFeatures: premium.features.split("\n").filter((f: string) => f.trim() !== ""),
          commission: settings.platformCommission,
          discount: settings.globalDiscount,
          kaspiPhone: kaspi.phone,
          kaspiRecipient: kaspi.recipient
        }),
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        toast.success("Данные тарифов успешно обновлены!");
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
         <h1 className="text-4xl md:text-[3rem] font-black tracking-tight text-[#1C1C1C]">Редактор Тарифов</h1>
         <p className="text-gray-400 font-medium text-sm mt-1">Полная настройка того, что видят пользователи на странице оплаты</p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10">
          <PlanCardEdit 
            name="STARTER" 
            data={starter}
            onChange={setStarter}
            color="amber"
          />
          
          <PlanCardEdit 
            name="PRO" 
            data={pro}
            onChange={setPro}
            color="blue"
            popular={true}
          />
          
          <PlanCardEdit 
            name="PREMIUM" 
            data={premium}
            onChange={setPremium}
            color="purple"
          />
        </div>

        {/* Kaspi Details Section */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 shadow-sm mb-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            </div>
            <div>
              <h3 className="text-xl font-black text-[#1C1C1C]">Реквизиты Kaspi</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Отображаются в окне оплаты у клиентов</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">Номер телефона</label>
              <input 
                type="text"
                value={kaspi.phone}
                onChange={(e) => setKaspi({...kaspi, phone: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-lg text-[#1C1C1C] outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
                placeholder="+7 777 000 00 00"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">Имя получателя (как в Kaspi)</label>
              <input 
                type="text"
                value={kaspi.recipient}
                onChange={(e) => setKaspi({...kaspi, recipient: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-lg text-[#1C1C1C] outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
                placeholder="Иван И."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full md:w-auto px-12 py-6 bg-[#1C1C1C] text-white rounded-[2rem] md:rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-gray-200 disabled:opacity-50"
          >
            {loading ? "Сохранение..." : "Обновить все данные и реквизиты"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanCardEdit({ name, data, onChange, color, popular }: any) {
  const colors: any = {
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100"
  };

  return (
    <div className={`border rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 transition-all flex flex-col relative ${popular ? 'bg-[#1D1D1F] text-white border-transparent md:scale-105 shadow-2xl' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'}`}>
      {popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full z-10">Популярный</div>}
      
      <div className={`w-fit px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 ${popular ? 'bg-white/10 text-white' : colors[color]}`}>
        {name}
      </div>
      
      <div className="space-y-6">
        <div>
          <label className={`block text-[9px] font-black uppercase mb-2 ml-1 tracking-widest ${popular ? 'text-gray-500' : 'text-gray-300'}`}>Описание тарифа</label>
          <input 
            type="text"
            value={data.description}
            onChange={(e) => onChange({...data, description: e.target.value})}
            className={`w-full text-sm font-bold bg-transparent outline-none border-b py-2 ${popular ? 'border-white/10 focus:border-white text-white' : 'border-zinc-100 focus:border-zinc-900 text-zinc-900'} transition-all`}
            placeholder="Краткое описание..."
          />
        </div>

        <div>
          <label className={`block text-[9px] font-black uppercase mb-2 ml-1 tracking-widest ${popular ? 'text-gray-500' : 'text-gray-300'}`}>Цена (₸)</label>
          <input 
            type="number"
            value={data.price}
            onChange={(e) => onChange({...data, price: parseInt(e.target.value) || 0})}
            className={`w-full text-3xl font-black bg-transparent outline-none border-b py-2 ${popular ? 'border-white/10 focus:border-white text-white' : 'border-zinc-100 focus:border-zinc-900 text-zinc-900'} transition-all`}
          />
        </div>

        <div>
          <label className={`block text-[9px] font-black uppercase mb-2 ml-1 tracking-widest ${popular ? 'text-gray-500' : 'text-gray-300'}`}>Возможности (каждая с новой строки)</label>
          <textarea 
            rows={6}
            value={data.features}
            onChange={(e) => onChange({...data, features: e.target.value})}
            className={`w-full text-xs font-bold bg-transparent outline-none border rounded-2xl p-4 mt-1 ${popular ? 'border-white/10 focus:border-white text-white bg-white/5' : 'border-zinc-100 focus:border-zinc-900 text-zinc-900 bg-gray-50'} transition-all resize-none`}
            placeholder="До 3 мастеров&#10;Безлимитные записи..."
          />
        </div>
      </div>
    </div>
  );
}
