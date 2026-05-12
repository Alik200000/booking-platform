import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function SuperAdminDashboard() {
  const session = await auth();
  if (!session || session.user?.role !== "SUPERADMIN") redirect("/login");

  let tenants: any[] = [];
  let subscriptions: any[] = [];
  
  try {
    // Используем только проверенные методы
    tenants = await prisma.tenant.findMany({ orderBy: { createdAt: 'desc' } });
    
    // Подписки берем через прямой SQL, так как обычный метод почему-то валит сервер
    try {
      subscriptions = await prisma.$queryRawUnsafe(`SELECT * FROM "Subscription"`) as any[];
    } catch (e) {
      subscriptions = [];
    }
  } catch (e) {
    console.error("Critical dashboard error:", e);
  }

  return (
    <div className="min-h-screen bg-white p-10 font-sans">
      <h1 className="text-3xl font-black mb-10">ZENO: Режим восстановления</h1>
      
      <div className="border rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-bold text-xs uppercase">Название</th>
              <th className="p-4 font-bold text-xs uppercase">URL</th>
              <th className="p-4 font-bold text-xs uppercase">Тариф</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => {
              const sub = subscriptions.find(s => s.tenantId === t.id);
              return (
                <tr key={t.id} className="border-b">
                  <td className="p-4 font-medium">{t.name}</td>
                  <td className="p-4 text-gray-500">{t.slug}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold">
                      {sub?.plan || "FREE"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <p className="mt-10 text-xs text-gray-400">
        Это максимально упрощенная версия для восстановления доступа. 
        Если она откроется, я начну возвращать кнопки управления по одной.
      </p>
    </div>
  );
}
