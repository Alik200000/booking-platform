import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AppearanceForm from "@/components/AppearanceForm";

export default async function AppearancePage() {
  const session = await auth();
  if (!session?.user?.tenantId) return null;

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId }
  });

  if (!tenant) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-[2.5rem] font-serif text-[#1F2532] tracking-tight">Внешний вид</h1>
          <p className="text-[#1F2532]/60 font-medium mt-2">Кастомизация виджета онлайн-записи</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#D3D8DF] rounded-[2rem] p-8 shadow-sm">
          <AppearanceForm initialColor={tenant.primaryColor || "#0071E3"} initialLogo={tenant.logoUrl || ""} />
        </div>

        <div className="bg-[#E8E8ED] rounded-[2rem] p-8 shadow-inner flex items-center justify-center relative overflow-hidden">
           <div className="absolute top-4 left-4 text-xs font-bold text-[#86868B] uppercase tracking-wider">Превью виджета</div>
           <div className="w-[300px] bg-white rounded-[32px] shadow-2xl p-6 relative border border-black/5 mt-6">
              <div className="w-16 h-16 bg-[#F5F5F7] rounded-full mx-auto mb-4 flex items-center justify-center border border-black/5 overflow-hidden">
                 {tenant.logoUrl ? (
                   <img src={tenant.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-2xl font-bold text-zinc-800">{tenant.name[0]}</span>
                 )}
              </div>
              <h3 className="text-center font-bold text-lg text-zinc-900 mb-1">{tenant.name}</h3>
              <p className="text-center text-xs text-zinc-500 mb-6">Онлайн-запись</p>

              <div className="space-y-3">
                 <div className="w-full py-3 rounded-2xl bg-zinc-100 flex justify-between px-4">
                    <span className="w-20 h-4 bg-zinc-200 rounded-full"></span>
                    <span className="w-10 h-4 bg-zinc-200 rounded-full"></span>
                 </div>
                 <div className="w-full py-3 rounded-2xl bg-zinc-100 flex justify-between px-4">
                    <span className="w-24 h-4 bg-zinc-200 rounded-full"></span>
                    <span className="w-12 h-4 bg-zinc-200 rounded-full"></span>
                 </div>
              </div>

              <div className="w-full py-4 mt-6 rounded-2xl text-white font-bold text-sm text-center shadow-md transition-colors" style={{ backgroundColor: tenant.primaryColor || "#0071E3" }}>
                Выбрать время
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
