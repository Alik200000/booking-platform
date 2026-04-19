import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function TenantsPage() {
  const tenants = await prisma.tenant.findMany({
    include: { subscription: true, _count: { select: { staff: true, bookings: true } } },
    orderBy: { createdAt: 'desc' }
  });

  async function toggleStatus(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const current = formData.get("current") === "true";
    await prisma.tenant.update({ where: { id }, data: { isActive: !current } });
    revalidatePath("/superadmin/tenants");
  }

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-[3rem] font-black tracking-tight mb-12">Tenants</h1>
      
      <div className="bg-[#121212] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-[#1A1A1A]">
            <tr>
              <th className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-white/30">Business</th>
              <th className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-white/30">Plan</th>
              <th className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-white/30 text-center">Staff / Bookings</th>
              <th className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-white/30 text-right">Status / Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tenants.map(t => (
              <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-8 py-6">
                   <p className="font-bold text-lg mb-1">{t.name}</p>
                   <p className="text-xs text-white/30 font-mono">domain.com/{t.slug}</p>
                </td>
                <td className="px-8 py-6">
                   <span className="bg-purple-500/10 text-purple-400 px-4 py-2 rounded-lg text-xs font-bold uppercase">{t.subscription?.plan || "FREE"}</span>
                </td>
                <td className="px-8 py-6 text-center">
                   <span className="font-mono text-white/70 font-bold bg-white/5 px-4 py-2 rounded-lg">{t._count.staff} / {t._count.bookings}</span>
                </td>
                <td className="px-8 py-6 text-right flex items-center justify-end gap-4">
                   <span className={`px-4 py-2 rounded-lg text-xs font-bold uppercase ${t.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                     {t.isActive ? "ACTIVE" : "SUSPENDED"}
                   </span>
                   <form action={toggleStatus}>
                     <input type="hidden" name="id" value={t.id} />
                     <input type="hidden" name="current" value={t.isActive.toString()} />
                     <button type="submit" className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${t.isActive ? 'bg-white/5 hover:bg-red-500/20 hover:text-red-400' : 'bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400'}`}>
                        {t.isActive ? "Suspend" : "Activate"}
                     </button>
                   </form>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                 <td colSpan={4} className="px-8 py-12 text-center text-white/30 font-bold">No tenants found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
