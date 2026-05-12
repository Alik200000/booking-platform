import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ImpersonateButton from "@/components/ImpersonateButton";
import { updateTenantPlan } from "@/app/actions/superadmin";

export default async function SuperAdminDashboard() {
  const session = await auth();
  if (!session || session.user?.role !== "SUPERADMIN") redirect("/login");

  let tenants: any[] = [];
  let subscriptions: any[] = [];
  
  try {
    // 1. Загружаем данные (теперь мы знаем, что таблицы есть)
    tenants = await prisma.tenant.findMany({ 
      orderBy: { createdAt: 'desc' } 
    });
    subscriptions = await prisma.subscription.findMany();
  } catch (e) {
    console.error("Fetch error:", e);
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-20">
      <div className="bg-white border-b border-black/5 px-8 py-10 mb-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black text-[#1D1D1F]">Управление ZENO</h1>
          <p className="text-[#86868B] font-medium mt-2">База данных подтверждена. Восстановление функций...</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-black/5 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F5F5F7]/50 text-[11px] font-black uppercase tracking-widest text-[#86868B]">
                <th className="px-10 py-5">Бизнес</th>
                <th className="px-6 py-5">Тариф</th>
                <th className="px-10 py-5 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {tenants.map((t) => {
                const sub = subscriptions.find(s => s.tenantId === t.id);
                return (
                  <tr key={t.id} className="hover:bg-[#F5F5F7]/30 transition-colors">
                    <td className="px-10 py-6">
                      <p className="font-bold">{t.name}</p>
                      <p className="text-[11px] text-[#86868B]">{t.slug}.zapis.online</p>
                    </td>
                    <td className="px-6 py-6">
                      <form action={async (fd) => { "use server"; await updateTenantPlan(fd); }}>
                        <input type="hidden" name="id" value={t.id} />
                        <select 
                          name="plan" 
                          defaultValue={sub?.plan || "FREE"}
                          onChange={(e) => e.target.form?.requestSubmit()}
                          className="bg-[#F5F5F7] rounded-lg px-3 py-1 text-[10px] font-black uppercase outline-none cursor-pointer"
                        >
                          <option value="FREE">FREE</option>
                          <option value="STARTER">STARTER</option>
                          <option value="PRO">PRO</option>
                          <option value="PREMIUM">PREMIUM</option>
                        </select>
                      </form>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <ImpersonateButton tenantId={t.id} />
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
