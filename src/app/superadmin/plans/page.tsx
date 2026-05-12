import { prisma } from "@/lib/prisma";
import { updateGlobalSettings } from "@/app/actions/superadmin";

export default async function PlansManagementPage() {
  let settings = {
    starterPrice: 25000,
    proPrice: 45000,
    premiumPrice: 85000,
    globalDiscount: 0,
    platformCommission: 5
  };

  try {
    const dbSettings = await prisma.globalSettings.findUnique({ where: { id: 'global' } });
    if (dbSettings) {
      settings = dbSettings as any;
    }
  } catch (e) {
    console.error("Failed to fetch settings:", e);
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-[3rem] font-black tracking-tight text-[#1C1C1C]">Тарифы</h1>
           <p className="text-gray-400 font-medium text-sm mt-1">Редактирование стоимости и обзор возможностей</p>
        </div>
      </div>

      <div className="max-w-6xl">
        <form action={updateGlobalSettings} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <input type="hidden" name="commission" value={settings.platformCommission} />
          <input type="hidden" name="discount" value={settings.globalDiscount} />

          <PlanCard 
            name="STARTER" 
            priceName="starter" 
            currentPrice={settings.starterPrice} 
            color="amber"
            description="Для небольших салонов"
            features={[
              "До 3 мастеров",
              "Безлимитные записи",
              "Клиентский портал",
              "Базовая CRM"
            ]}
          />
          
          <PlanCard 
            name="PRO" 
            priceName="pro" 
            currentPrice={settings.proPrice} 
            color="blue"
            description="Для сети салонов"
            features={[
              "Безлимитные мастера",
              "API и Интеграции",
              "Выделенная поддержка",
              "Расширенная аналитика"
            ]}
            popular={true}
          />
          
          <PlanCard 
            name="PREMIUM" 
            priceName="premium" 
            currentPrice={settings.premiumPrice} 
            color="purple"
            description="Максимальные возможности"
            features={[
              "Все функции PRO",
              "Брендирование виджета",
              "Личный менеджер 24/7",
              "Индивидуальный договор"
            ]}
          />

          <div className="md:col-span-3 flex justify-center mt-10">
            <button type="submit" className="px-12 py-6 bg-[#1C1C1C] text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-gray-200">
              Сохранить новые цены
            </button>
          </div>
        </form>

        {/* Инфо-секция для FREE */}
        <div className="mt-16 p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex items-center justify-between">
          <div>
            <h4 className="text-xl font-black text-[#1C1C1C]">Тариф FREE</h4>
            <p className="text-sm text-gray-400 font-medium mt-1">Всегда бесплатно для частных мастеров: 1 мастер, до 50 записей в месяц.</p>
          </div>
          <div className="px-6 py-2 bg-white border border-gray-200 rounded-xl font-black text-xs text-gray-400">0 ₸ / мес</div>
        </div>
      </div>
    </div>
  );
}

function PlanCard({ name, priceName, currentPrice, color, features, description, popular }: any) {
  const colors: any = {
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100"
  };

  return (
    <div className={`border rounded-[3rem] p-10 transition-all flex flex-col relative ${popular ? 'bg-[#1D1D1F] text-white border-transparent scale-105 shadow-2xl' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'}`}>
      {popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">Популярный</div>}
      
      <div className={`w-fit px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-4 ${popular ? 'bg-white/10 text-white' : colors[color]}`}>
        {name}
      </div>
      
      <p className={`text-sm font-medium mb-8 ${popular ? 'text-gray-400' : 'text-gray-400'}`}>{description}</p>
      
      <div className="mb-10">
        <label className={`block text-[9px] font-black uppercase mb-3 ml-1 tracking-widest ${popular ? 'text-gray-500' : 'text-gray-300'}`}>Цена в месяц (₸)</label>
        <div className="flex items-center gap-3">
          <input 
            name={priceName}
            type="number"
            defaultValue={currentPrice}
            className={`w-full text-4xl font-black bg-transparent outline-none border-b-2 ${popular ? 'border-white/10 focus:border-white' : 'border-gray-50 focus:border-gray-200'} transition-all`}
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
