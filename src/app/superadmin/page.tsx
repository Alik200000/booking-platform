import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { updateTenantPlan } from "@/app/actions/superadmin";

export default async function SuperAdminDashboard() {
  const session = await auth();
  if (!session || session.user?.role !== "SUPERADMIN") redirect("/login");

  let tenants: any[] = [];
  let subscriptions: any[] = [];
  
  try {
    tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' }
    });

    try {
      subscriptions = await prisma.subscription.findMany();
    } catch (subError) {
      subscriptions = [];
    }
  } catch (e) {
    console.error("Critical fetch error:", e);
  }

  const tenantsWithData = tenants.map(t => {
    const sub = subscriptions.find(s => s.tenantId === t.id);
    return {
      ...t,
      plan: sub?.plan || "FREE"
    };
  });

  return (
    <div className="min-h-screen bg-[#F5F5F7] p-8 sm:p-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black mb-10">Управление платформой (Без кнопок)</h1>
        
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-black/5 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F5F5F7]/50 text-[11px] font-black uppercase tracking-widest text-[#86868B]">
                <th className="px-10 py-5">Бизнес</th>
                <th className="px-6 py-5">Тариф</th>
                <th className="px-10 py-5 text-right">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {tenantsWithData.map((t) => (
                <tr key={t.id} className="hover:bg-[#F5F5F7]/30 transition-colors">
                  <td className="px-10 py-6">
                    <p className="font-bold text-[#1D1D1F]">{t.name}</p>
                    <p className="text-[11px] text-[#86868B]">{t.slug}.zapis.online</p>
                  </td>
                  <td className="px-6 py-6">
                    <form action={async (fd) => { "use server"; await updateTenantPlan(fd.get("id") as string, fd.get("plan") as any); }}>
                      <input type="hidden" name="id" value={t.id} />
                      <select 
                        name="plan" 
                        defaultValue={t.plan}
                        onChange={(e) => e.target.form?.requestSubmit()}
                        className="bg-[#F5F5F7] rounded-lg px-3 py-1 text-[10px] font-black uppercase outline-none"
                      >
                        <option value="FREE">FREE</option>
                        <option value="STARTER">STARTER</option>
                        <option value="PRO">PRO</option>
                        <option value="PREMIUM">PREMIUM</option>
                      </select>
                    </form>
                  </td>
                  <td className="px-10 py-6 text-right font-bold text-emerald-500">
                    Active
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
