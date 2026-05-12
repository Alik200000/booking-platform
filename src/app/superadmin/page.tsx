import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function SuperAdminDashboard() {
  const session = await auth();
  if (!session || session.user?.role !== "SUPERADMIN") redirect("/login");

  let tenants: any[] = [];
  try {
    tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (e) {
    console.error("Fetch tenants error:", e);
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] p-8 sm:p-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black mb-10">Список заведений</h1>
        
        <div className="grid grid-cols-1 gap-4">
          {tenants.map((t) => (
            <div key={t.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-black/5 flex justify-between items-center">
              <div>
                <p className="text-xl font-bold text-[#1D1D1F]">{t.name}</p>
                <p className="text-sm text-[#86868B]">{t.slug}.zapis.online</p>
              </div>
              <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest">
                Active
              </div>
            </div>
          ))}
          {tenants.length === 0 && <p className="text-center py-20 text-gray-400">Заведений не найдено.</p>}
        </div>
      </div>
    </div>
  );
}
