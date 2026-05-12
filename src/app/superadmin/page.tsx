import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function SuperAdminDashboard() {
  const session = await auth();
  if (!session || session.user?.role !== "SUPERADMIN") redirect("/login");

  let tenants: any[] = [];
  try {
    // Простейший запрос без связей
    tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (e) {
    console.error("Fetch tenants error:", e);
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] p-8 sm:p-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black mb-10">Проверка базы данных (Тененты)</h1>
        <p className="mb-8">Если вы видите список ниже, значит таблица Tenant работает.</p>
        
        <div className="space-y-4">
          {tenants.map((t) => (
            <div key={t.id} className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
              <p className="font-bold">{t.name}</p>
              <p className="text-sm text-gray-500">{t.slug}.zapis.online</p>
            </div>
          ))}
          {tenants.length === 0 && <p>Бизнесов пока нет или ошибка при загрузке.</p>}
        </div>
      </div>
    </div>
  );
}
