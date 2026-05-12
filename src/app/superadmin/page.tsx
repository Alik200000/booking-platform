import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ImpersonateButton from "@/components/ImpersonateButton";
import DeleteTenantButton from "@/components/DeleteTenantButton";
import { updateTenantPlan } from "@/app/actions/superadmin";

export default async function SuperAdminDashboard() {
  const session = await auth();
  if (!session || session.user?.role !== "SUPERADMIN") redirect("/login");

  let tenants: any[] = [];
  let subscriptions: any[] = [];
  
  try {
    // Используем проверенный подход
    tenants = await prisma.tenant.findMany({ 
      orderBy: { createdAt: 'desc' } 
    });
    
    // Прямой SQL запрос, так как он точно не роняет сервер
    subscriptions = await prisma.$queryRawUnsafe(`SELECT * FROM "Subscription"`) as any[];
  } catch (e) {
    console.error("Dashboard data fetch error:", e);
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-20">
      <div className="bg-white border-b border-black/5 px-8 py-10 mb-10">
        <div className="max-w-7xl mx-auto flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-[#1D1D1F]">Zapis Superadmin</h1>
            <p className="text-[#86868B] font-medium mt-2">Управление всеми бизнесами на платформе</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Всего салонов</p>
              <p className="text-2xl font-black text-emerald-700">{tenants.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-black/5 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F5F5F7]/50 text-[11px] font-black uppercase tracking-widest text-[#86868B]">
                <th className="px-10 py-5">Бизнес</th>
                <th className="px-6 py-5 text-center">Тариф</th>
                <th className="px-10 py-5 text-right">Управление</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {tenants.map((t) => {
                const sub = subscriptions.find(s => s.tenantId === t.id);
                return (
                  <tr key={t.id} className="hover:bg-[#F5F5F7]/30 transition-colors">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#F5F5F7] rounded-xl flex items-center justify-center font-black text-[#1D1D1F]">
                          {t.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-[#1D1D1F]">{t.name}</p>
                          <p className="text-[11px] text-[#86868B]">/{t.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          sub?.plan === 'PREMIUM' ? 'bg-purple-100 text-purple-600' :
                          sub?.plan === 'PRO' ? 'bg-blue-100 text-blue-600' :
                          sub?.plan === 'STARTER' ? 'bg-amber-100 text-amber-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {sub?.plan || 'FREE'}
                        </span>
                        <form action={updateTenantPlan}>
                          <input type="hidden" name="id" value={t.id} />
                          <select 
                            name="plan" 
                            defaultValue={sub?.plan || "FREE"}
                            onChange={(e) => e.target.form?.requestSubmit()}
                            className="text-[10px] bg-transparent font-bold text-gray-400 outline-none cursor-pointer hover:text-black transition-colors"
                          >
                            <option value="FREE">Change to FREE</option>
                            <option value="STARTER">Change to STARTER</option>
                            <option value="PRO">Change to PRO</option>
                            <option value="PREMIUM">Change to PREMIUM</option>
                          </select>
                        </form>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-3 items-center">
                        <ImpersonateButton tenantId={t.id} />
                        <div className="w-px h-4 bg-black/5" />
                        <DeleteTenantButton tenantId={t.id} tenantName={t.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
