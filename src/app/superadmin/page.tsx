import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DeleteTenantButton from "@/components/DeleteTenantButton";
import ImpersonateButton from "@/components/ImpersonateButton";
import { updateTenantPlan, updateGlobalSettings } from "@/app/actions/superadmin";

export default async function SuperAdminDashboard() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "SUPERADMIN") redirect("/login");

    let tenants: any[] = [];
    let subscriptions: any[] = [];
    let settings = { platformCommission: 5, starterPrice: 15000, proPrice: 25000, premiumPrice: 45000, globalDiscount: 0 };

    // 1. Тененты
    tenants = await prisma.tenant.findMany({ orderBy: { createdAt: 'desc' } });

    // 2. Подписки (Безопасно)
    try {
      subscriptions = await prisma.$queryRawUnsafe(`SELECT * FROM "Subscription"`) as any[];
    } catch (e) {
      console.warn("Sub table fail");
    }

    // 3. Настройки (Безопасно)
    try {
      const dbSettings = await prisma.$queryRawUnsafe(`SELECT * FROM "GlobalSettings" WHERE id = 'global' LIMIT 1`) as any[];
      if (dbSettings && dbSettings[0]) {
        settings = dbSettings[0];
      }
    } catch (e) {
      console.warn("Settings table fail");
    }

    return (
      <div className="min-h-screen bg-[#F5F5F7] p-8 sm:p-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black mb-10">Центр Диагностики</h1>
          <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-black/5">
            <h2 className="text-2xl font-bold mb-6">Список бизнесов ({tenants.length})</h2>
            <div className="space-y-4">
              {tenants.map((t) => (
                <div key={t.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <ImpersonateButton tenantId={t.id} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    return (
      <div className="p-20 bg-red-50 min-h-screen">
        <h1 className="text-2xl font-bold text-red-600">Найдена ошибка при рендеринге:</h1>
        <pre className="mt-4 p-6 bg-white rounded-xl border border-red-200 overflow-auto">
          {error.message || String(error)}
        </pre>
        <p className="mt-4 text-sm text-gray-500">Пожалуйста, сделайте скриншот этой ошибки.</p>
      </div>
    );
  }
}
