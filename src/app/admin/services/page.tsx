import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { dict } from "@/lib/i18n";

import { getActiveTenantId } from "@/lib/auth-utils";

export default async function ServicesPage() {
  const session = await auth();
  const tenantId = await getActiveTenantId() as string;

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "ru";
  const t = dict[locale as keyof typeof dict];

  const services = await prisma.service.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' }
  });

  async function addService(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const duration = parseInt(formData.get("duration") as string);
    const price = parseInt(formData.get("price") as string);
    const description = formData.get("description") as string;
    
    await prisma.service.create({
      data: { tenantId, name, duration, price, description }
    });
    revalidatePath("/admin/services");
  }

  async function deleteService(formData: FormData) {
    "use server";
    await prisma.service.delete({ where: { id: formData.get("id") as string } });
    revalidatePath("/admin/services");
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <h1 className="text-[2.5rem] font-serif text-[#1F2532] tracking-tight mb-8">{t.serv_title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Form Card */}
        <div className="md:col-span-1">
          <div className="bg-[#D3D8DF] rounded-[2rem] p-8 shadow-sm">
            <h2 className="text-xl font-medium text-[#1F2532] mb-6">{t.add_serv}</h2>
            <form action={addService} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-[#1F2532]/80">{t.serv_name}</label>
                <input type="text" name="name" required className="w-full bg-[#E0E5EC] text-[#1F2532] px-4 py-3 rounded-xl border border-white/40 focus:border-[#444A5B] outline-none transition-colors placeholder:text-[#1F2532]/40" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#1F2532]/80">{t.serv_duration}</label>
                  <input type="number" name="duration" required min="5" step="5" className="w-full bg-[#E0E5EC] text-[#1F2532] px-4 py-3 rounded-xl border border-white/40 focus:border-[#444A5B] outline-none transition-colors placeholder:text-[#1F2532]/40" placeholder="60" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#1F2532]/80">{t.serv_price}</label>
                  <input type="number" name="price" required min="0" className="w-full bg-[#E0E5EC] text-[#1F2532] px-4 py-3 rounded-xl border border-white/40 focus:border-[#444A5B] outline-none transition-colors placeholder:text-[#1F2532]/40" placeholder="15000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-[#1F2532]/80">{t.serv_desc}</label>
                <textarea name="description" rows={3} className="w-full bg-[#E0E5EC] text-[#1F2532] px-4 py-3 rounded-xl border border-white/40 focus:border-[#444A5B] outline-none transition-colors resize-none placeholder:text-[#1F2532]/40"></textarea>
              </div>
              <button type="submit" className="w-full bg-[#444A5B] hover:bg-[#3B414F] text-white py-3.5 rounded-xl font-bold shadow-md transition-all hover:-translate-y-1 mt-2">
                {t.save}
              </button>
            </form>
          </div>
        </div>

        {/* List Card */}
        <div className="md:col-span-2 space-y-4">
           {services.map((svc: any) => (
              <div key={svc.id} className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 flex justify-between items-center group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                 <div>
                    <h3 className="text-xl font-bold text-[#1F2532]">{svc.name}</h3>
                    <p className="text-[#1F2532]/50 text-sm mt-1">{svc.description || t.no_desc}</p>
                 </div>
                 <div className="flex items-center">
                    <div className="text-right flex flex-col items-end mr-6">
                       <span className="text-2xl font-black text-[#444A5B]">{svc.price} ₸</span>
                       <span className="text-xs font-bold text-[#1F2532]/60 bg-[#D3D8DF] px-3 py-1 rounded-full mt-2 tracking-wider uppercase">{svc.duration} {t.min}</span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity border-l border-black/5 pl-4">
                       <form action={deleteService}>
                          <input type="hidden" name="id" value={svc.id} />
                          <button type="submit" className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                       </form>
                    </div>
                 </div>
              </div>
           ))}
           {services.length === 0 && (
              <div className="bg-[#D3D8DF] rounded-3xl p-16 text-center shadow-inner">
                 <div className="w-16 h-16 bg-[#444A5B]/10 text-[#444A5B] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110-4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                 </div>
                 <p className="text-[#1F2532]/60 font-medium text-lg">{t.serv_empty}</p>
                 <p className="text-[#1F2532]/40 text-sm mt-2">{t.add_first_serv}</p>
              </div>
           )}
        </div>

      </div>
    </div>
  );
}
