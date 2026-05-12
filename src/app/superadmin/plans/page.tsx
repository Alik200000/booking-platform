import { prisma } from "@/lib/prisma";
import { updateGlobalSettings } from "@/app/actions/superadmin";

export default async function PlansManagementPage() {
  let settings = {
    starterPrice: 15000,
    proPrice: 25000,
    premiumPrice: 45000,
    globalDiscount: 0,
    platformCommission: 5
  };

  try {
    const dbSettings = await prisma.globalSettings.findUnique({ where: { id: 'global' } });
    if (dbSettings) {
      settings = {
        starterPrice: dbSettings.starterPrice ?? 15000,
        proPrice: dbSettings.proPrice ?? 25000,
        premiumPrice: dbSettings.premiumPrice ?? 45000,
        globalDiscount: dbSettings.globalDiscount ?? 0,
        platformCommission: dbSettings.platformCommission ?? 5
      };
    }
  } catch (e) {
    console.error("Failed to fetch settings:", e);
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
         <h1 className="text-[3rem] font-black tracking-tight text-[#1C1C1C]">Тарифы</h1>
         <p className="text-gray-400 font-medium text-sm mt-1">Настройка стоимости планов подписки</p>
      </div>

      <div className="max-w-4xl">
        <form action={updateGlobalSettings} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Скрытое поле для комиссии, чтобы не потерять её при сохранении цен */}
          <input type="hidden" name="commission" value={settings.platformCommission} />
          <input type="hidden" name="discount" value={settings.globalDiscount} />

          <PlanCard 
            name="STARTER" 
            priceName="starter" 
            currentPrice={settings.starterPrice} 
            color="amber"
            features={["Базовый функционал", "До 5 сотрудников", "Email поддержка"]}
          />
          
          <PlanCard 
            name="PRO" 
            priceName="pro" 
            currentPrice={settings.proPrice} 
            color="blue"
            features={["Весь функционал", "До 15 сотрудников", "Приоритетная поддержка"]}
          />
          
          <PlanCard 
            name="PREMIUM" 
            priceName="premium" 
            currentPrice={settings.premiumPrice} 
            color="purple"
            features={["Без ограничений", "Личный менеджер", "Кастомные отчеты"]}
          />

          <div className="md:col-span-3 flex justify-end mt-4">
            <button type="submit" className="px-10 py-5 bg-[#1C1C1C] text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-200">
              Сохранить изменения
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PlanCard({ name, priceName, currentPrice, color, features }: any) {
  const colors: any = {
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100"
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      <div className={`w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 ${colors[color]}`}>
        {name}
      </div>
      
      <div className="mb-8">
        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Цена (₸ / мес)</label>
        <input 
          name={priceName}
          type="number"
          defaultValue={currentPrice}
          className="w-full text-3xl font-black text-[#1C1C1C] bg-gray-50 rounded-2xl px-5 py-4 outline-none focus:bg-white border border-transparent focus:border-gray-100 transition-all"
        />
      </div>

      <div className="space-y-3 mt-auto">
        {features.map((f: string) => (
          <div key={f} className="flex items-center gap-2 text-[11px] font-medium text-gray-500">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}
