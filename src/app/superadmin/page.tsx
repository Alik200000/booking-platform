import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DeleteTenantButton from "@/components/DeleteTenantButton";
import ImpersonateButton from "@/components/ImpersonateButton";
import { updateTenantPlan, updateGlobalSettings, updateTenantDiscount } from "@/app/actions/superadmin";

export default async function SuperAdminDashboard() {
  const session = await auth();
  if (!session || session.user?.role !== "SUPERADMIN") redirect("/login");

  let tenants: any[] = [];
  let subscriptions: any[] = [];
  let settings = { platformCommission: 5, starterPrice: 15000, proPrice: 25000, premiumPrice: 45000, globalDiscount: 0 };

  try {
    // 1. Базовые тененты (Всегда работают)
    tenants = await prisma.tenant.findMany({ orderBy: { createdAt: 'desc' } });

    // 2. Безопасное получение подписок через Raw SQL (Не вызывает панику если таблицы нет)
    try {
      subscriptions = await prisma.$queryRawUnsafe(`SELECT * FROM "Subscription"`) as any[];
    } catch (e) {
      console.warn("Table Subscription missing");
    }

    // 3. Безопасное получение настроек
    try {
      const dbSettings = await prisma.$queryRawUnsafe(`SELECT * FROM "GlobalSettings" WHERE id = 'global' LIMIT 1`) as any[];
      if (dbSettings && dbSettings[0]) {
        settings = {
          platformCommission: dbSettings[0].platformCommission ?? 5,
          starterPrice: dbSettings[0].starterPrice ?? 15000,
          proPrice: dbSettings[0].proPrice ?? 25000,
          premiumPrice: dbSettings[0].premiumPrice ?? 45000,
          globalDiscount: dbSettings[0].globalDiscount ?? 0,
        };
      }
    } catch (e) {
      console.warn("Table GlobalSettings missing");
    }
  } catch (e) {
    console.error("Superadmin critical error:", e);
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-20">
      <div className="bg-white border-b border-black/5 px-8 py-10 mb-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black text-[#1D1D1F]">Панель управления</h1>
          <p className="text-[#86868B] font-medium mt-2">Стабильная версия 2.0 (Safe Mode)</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
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
                        <form action={updateTenantPlan}>
                          <input type="hidden" name="id" value={t.id} />
                          <select 
                            name="plan" 
                            defaultValue={sub?.plan || "FREE"}
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
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <ImpersonateButton tenantId={t.id} />
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

        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
            <h3 className="text-xl font-black mb-6">Настройки цен</h3>
            <form action={updateGlobalSettings} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Starter" name="starter" value={settings.starterPrice} />
                <Input label="Pro" name="pro" value={settings.proPrice} />
              </div>
              <Input label="Premium" name="premium" value={settings.premiumPrice} />
              <Input label="Комиссия %" name="commission" value={settings.platformCommission} />
              <button type="submit" className="w-full py-4 bg-[#1D1D1F] text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-4">Сохранить</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, name, value }: any) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase text-[#86868B] mb-1">{label}</label>
      <input name={name} type="number" defaultValue={value} className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 font-bold outline-none" />
    </div>
  );
}
