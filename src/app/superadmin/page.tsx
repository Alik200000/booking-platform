import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteTenantButton from "@/components/DeleteTenantButton";
import ImpersonateButton from "@/components/ImpersonateButton";
import ShadowModeModal from "@/components/ShadowModeModal";
import { updateTenantPlan, updateGlobalSettings, updateTenantDiscount } from "@/app/actions/superadmin";

export default async function SuperAdminDashboard() {
  const session = await auth();
  if (!session || session.user?.role !== "SUPERADMIN") redirect("/login");

  // Default values
  let settings = { platformCommission: 5, starterPrice: 15000, proPrice: 25000, premiumPrice: 45000, globalDiscount: 0 };
  let tenants: any[] = [];
  let totalTenants = 0;
  let totalBookings = 0;
  let totalClients = 0;
  let mrr = 0;

  try {
    // Basic counts
    totalTenants = await prisma.tenant.count().catch(() => 0);
    totalBookings = await prisma.booking.count().catch(() => 0);
    totalClients = await prisma.client.count().catch(() => 0);

    // Settings
    const dbSettings = await prisma.globalSettings.findUnique({ where: { id: "global" } }).catch(() => null);
    if (dbSettings) {
      settings = {
        platformCommission: dbSettings.platformCommission ?? 5,
        starterPrice: dbSettings.starterPrice ?? 15000,
        proPrice: dbSettings.proPrice ?? 25000,
        premiumPrice: dbSettings.premiumPrice ?? 45000,
        globalDiscount: dbSettings.globalDiscount ?? 0,
      };
    }

    // Tenants with subscriptions
    tenants = await prisma.tenant.findMany({
      include: {
        subscription: true,
        _count: {
          select: { bookings: true, clients: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []);

    // Simple MRR
    mrr = tenants.reduce((acc, t) => {
      const plan = t.subscription?.plan || 'FREE';
      let price = 0;
      if (plan === 'STARTER') price = settings.starterPrice;
      if (plan === 'PRO') price = settings.proPrice;
      if (plan === 'PREMIUM') price = settings.premiumPrice;
      
      const disc = (settings.globalDiscount || 0) + (t.subscription?.customDiscount || 0);
      return acc + (price * (1 - Math.min(disc, 100) / 100));
    }, 0);

  } catch (e) {
    console.error("Superadmin Data Fetch Error:", e);
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-black/5 px-8 py-10 mb-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-[42px] font-black text-[#1D1D1F] tracking-tight">Управление</h1>
            <p className="text-[17px] text-[#86868B] font-medium mt-2">Центр управления платформой ZENO</p>
          </div>
          <div className="flex items-center gap-3 bg-[#F5F5F7] p-3 rounded-2xl border border-black/5">
             <div className="flex items-center gap-2 px-3">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[11px] font-black uppercase tracking-widest text-[#1D1D1F]">System Online</span>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 space-y-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard label="Бизнесов" value={totalTenants} color="indigo" />
          <MetricCard label="Записей" value={totalBookings} color="blue" />
          <MetricCard label="Клиентов" value={totalClients} color="purple" />
          <MetricCard label="MRR (₸)" value={Math.round(mrr).toLocaleString()} color="emerald" />
        </div>

        {/* Tenants Table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-black/5 overflow-hidden">
          <div className="px-10 py-8 border-b border-black/5">
            <h2 className="text-2xl font-black text-[#1D1D1F]">Все бизнесы</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F5F5F7]/50 text-[11px] font-black uppercase tracking-widest text-[#86868B]">
                  <th className="px-10 py-5">Бизнес</th>
                  <th className="px-6 py-5">Город</th>
                  <th className="px-6 py-5">Тариф</th>
                  <th className="px-6 py-5">Скидка</th>
                  <th className="px-10 py-5 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F5F5F7]/30 transition-colors">
                    <td className="px-10 py-6">
                      <p className="font-bold text-[#1D1D1F]">{t.name}</p>
                      <p className="text-[11px] text-[#86868B]">{t.slug}.zapis.online</p>
                    </td>
                    <td className="px-6 py-6 font-bold">{t.city || "—"}</td>
                    <td className="px-6 py-6">
                       <form action={async (fd) => { "use server"; await updateTenantPlan(fd.get("id") as string, fd.get("plan") as any); }}>
                          <input type="hidden" name="id" value={t.id} />
                          <select 
                            name="plan" 
                            defaultValue={t.subscription?.plan || "FREE"}
                            onChange={(e) => e.target.form?.requestSubmit()}
                            className="bg-[#F5F5F7] border-none rounded-lg px-3 py-1 text-[10px] font-black uppercase outline-none"
                          >
                            <option value="FREE">FREE</option>
                            <option value="STARTER">STARTER</option>
                            <option value="PRO">PRO</option>
                            <option value="PREMIUM">PREMIUM</option>
                          </select>
                       </form>
                    </td>
                    <td className="px-6 py-6">
                       <form action={async (fd) => { "use server"; await updateTenantDiscount(fd); }} className="flex items-center gap-2">
                          <input type="hidden" name="subId" value={t.subscription?.id} />
                          <input name="discount" type="number" defaultValue={t.subscription?.customDiscount || 0} className="w-12 bg-[#F5F5F7] rounded-lg px-2 py-1 text-xs font-bold" />
                          <button type="submit" className="text-[10px] font-black text-blue-500">OK</button>
                       </form>
                    </td>
                    <td className="px-10 py-6 text-right">
                       <div className="flex justify-end gap-2">
                          <ImpersonateButton tenantId={t.id} />
                          <DeleteTenantButton tenantId={t.id} tenantName={t.name} />
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Settings */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-black/5 max-w-md">
          <h3 className="text-2xl font-black text-[#1D1D1F] mb-6">Настройки цен</h3>
          <form action={async (fd) => { "use server"; await updateGlobalSettings(fd); }} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <Input label="Starter" name="starter" value={settings.starterPrice} />
                <Input label="Pro" name="pro" value={settings.proPrice} />
             </div>
             <Input label="Premium" name="premium" value={settings.premiumPrice} />
             <Input label="Комиссия %" name="commission" value={settings.platformCommission} />
             <Input label="Глобальная скидка %" name="discount" value={settings.globalDiscount} />
             <button type="submit" className="w-full py-4 bg-[#1D1D1F] text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-4">Сохранить</button>
          </form>
        </div>
      </div>
      <ShadowModeModal tenants={tenants.map(t => ({ id: t.id, name: t.name, slug: t.slug }))} />
    </div>
  );
}

function MetricCard({ label, value, color }: any) {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
      <p className="text-[11px] font-black text-[#86868B] uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-black ${colors[color].split(' ')[1]}`}>{value}</p>
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
