import { prisma } from "@/lib/prisma";
import ImpersonateButton from "@/components/ImpersonateButton";
import DeleteTenantButton from "@/components/DeleteTenantButton";
import SuperadminTenantActions from "@/components/SuperadminTenantActions";

export default async function SuperAdminDashboard() {
  let tenants: any[] = [];
  try {
    tenants = await prisma.tenant.findMany({
      include: { 
        subscription: true, 
        _count: { select: { staff: true, bookings: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("SuperAdminDashboard data fetch error:", error);
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
         <h1 className="text-[3.5rem] font-black tracking-tight text-[#1C1C1C]">Zapis Online</h1>
         <p className="text-gray-400 font-medium text-sm mt-1">Главная панель управления платформой</p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-[2.5rem] p-10 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Бизнес</th>
                <th className="pb-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Тариф</th>
                <th className="pb-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Статистика</th>
                <th className="pb-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tenants.map((t: any) => (
                <tr key={t.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-8">
                     <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-2xl">
                           {t.name[0]}
                        </div>
                        <div>
                           <p className="font-bold text-[#1C1C1C] text-lg leading-none mb-1">{t.name}</p>
                           <p className="text-xs text-gray-400 font-medium">/{t.slug}</p>
                        </div>
                     </div>
                  </td>
                  <td className="py-8">
                     <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        t.subscription?.plan === 'PRO' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                        t.subscription?.plan === 'PREMIUM' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                     }`}>
                        {t.subscription?.plan || "FREE"}
                     </span>
                  </td>
                  <td className="py-8 text-center">
                     <div className="inline-flex flex-col items-center">
                        <span className="text-base font-black text-[#1C1C1C]">{t._count.staff} / {t._count.bookings}</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Мастера / Записи</span>
                     </div>
                  </td>
                  <td className="py-8">
                     <div className="flex items-center justify-end gap-3">
                        <div className="flex flex-col items-end gap-1 mr-4">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${t.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                             {t.isActive ? "Активен" : "Приостановлен"}
                           </span>
                           <SuperadminTenantActions 
                              tenantId={t.id} 
                              isSuspended={t.isSuspended} 
                              currentPlan={t.subscription?.plan || "FREE"} 
                              currentSlug={t.slug}
                           />
                        </div>
                        <div className="flex gap-2">
                           <ImpersonateButton tenantId={t.id} tenantName={t.name} />
                           <DeleteTenantButton tenantId={t.id} tenantName={t.name} />
                        </div>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
