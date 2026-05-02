import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { dict } from "@/lib/i18n";

import { getActiveTenantId } from "@/lib/auth-utils";

import CategoryManager from "@/components/CategoryManager";

export default async function ServicesPage() {
  const session = await auth();
  const tenantId = await getActiveTenantId() as string;

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "ru";
  const t = dict[locale as keyof typeof dict];

  const categories = await prisma.serviceCategory.findMany({
    where: { tenantId },
    include: { services: true },
    orderBy: { createdAt: 'asc' }
  });

  const uncategorizedServices = await prisma.service.findMany({
    where: { tenantId, categoryId: null },
    orderBy: { createdAt: 'desc' }
  });

  async function addService(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const duration = parseInt(formData.get("duration") as string);
    const price = parseInt(formData.get("price") as string);
    const description = formData.get("description") as string;
    const imageUrl = formData.get("imageUrl") as string || null;
    let categoryId = formData.get("categoryId") as string || null;
    const newCategoryName = formData.get("newCategoryName") as string;

    // If user entered a new category name, create it first
    if (newCategoryName && newCategoryName.trim()) {
      const newCat = await prisma.serviceCategory.create({
        data: {
          name: newCategoryName.trim(),
          tenantId,
          imageUrl: null // Categories can be updated later
        }
      });
      categoryId = newCat.id;
    }
    
    await prisma.service.create({
      data: { tenantId, name, duration, price, description, categoryId, imageUrl }
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Management Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Add Service Card */}
          <div className="bg-[#D3D8DF] rounded-[2rem] p-8 shadow-sm">
            <h2 className="text-xl font-medium text-[#1F2532] mb-6">{t.add_serv}</h2>
            <form action={addService} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-[#1F2532]/80">{t.serv_name}</label>
                <input type="text" name="name" required className="w-full bg-[#E0E5EC] text-[#1F2532] px-4 py-3 rounded-xl border border-white/40 focus:border-[#444A5B] outline-none transition-colors placeholder:text-[#1F2532]/40" />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-[#1F2532]/80">URL фото услуги</label>
                <input type="url" name="imageUrl" className="w-full bg-[#E0E5EC] text-[#1F2532] px-4 py-3 rounded-xl border border-white/40 focus:border-[#444A5B] outline-none transition-colors placeholder:text-[#1F2532]/20 text-sm" placeholder="https://example.com/photo.jpg" />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#1F2532]/80">Категория</label>
                <select name="categoryId" className="w-full bg-[#E0E5EC] text-[#1F2532] px-4 py-3 rounded-xl border border-white/40 focus:border-[#444A5B] outline-none transition-colors mb-2">
                  <option value="">Выберите существующую...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-[10px] font-bold text-[#1F2532]/30 uppercase">или новая:</span>
                  </div>
                  <input 
                    type="text" 
                    name="newCategoryName" 
                    placeholder="Название новой категории"
                    className="w-full bg-[#E0E5EC] text-[#1F2532] pl-20 pr-4 py-3 rounded-xl border border-white/40 focus:border-[#444A5B] outline-none transition-colors placeholder:text-[#1F2532]/20 text-sm"
                  />
                </div>
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

          {/* Category Manager Component */}
          <CategoryManager categories={categories} t={t} />
        </div>

        {/* List Card */}
        <div className="lg:col-span-3 space-y-12">
           {/* Loop through categories */}
           {categories.map((cat: any) => (
             <div key={cat.id} className="animate-in fade-in slide-in-from-left-4 duration-500">
               <div className="flex items-center gap-4 mb-6">
                 {cat.imageUrl ? (
                   <img src={cat.imageUrl} alt={cat.name} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                 ) : (
                   <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-400 flex items-center justify-center font-black">
                     {cat.name[0]}
                   </div>
                 )}
                 <h2 className="text-2xl font-black text-[#1F2532] uppercase tracking-tighter">{cat.name}</h2>
                 <div className="h-px flex-1 bg-[#444A5B]/10"></div>
                 <span className="text-xs font-bold text-[#1F2532]/30">{cat.services.length} услуг</span>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {cat.services.map((svc: any) => (
                   <ServiceItem key={svc.id} svc={svc} t={t} deleteAction={deleteService} />
                 ))}
               </div>
               {cat.services.length === 0 && (
                 <p className="text-[#1F2532]/30 italic text-sm py-4">В этой категории пока нет услуг</p>
               )}
             </div>
           ))}

           {/* Uncategorized section */}
           {uncategorizedServices.length > 0 && (
             <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl font-black text-[#1F2532]/40 uppercase tracking-tighter italic">Без категории</h2>
                  <div className="h-px flex-1 bg-[#444A5B]/10"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uncategorizedServices.map((svc: any) => (
                    <ServiceItem key={svc.id} svc={svc} t={t} deleteAction={deleteService} />
                  ))}
                </div>
             </div>
           )}

           {categories.length === 0 && uncategorizedServices.length === 0 && (
              <div className="bg-[#D3D8DF] rounded-3xl p-16 text-center shadow-inner">
                 <div className="w-16 h-16 bg-[#444A5B]/10 text-[#444A5B] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110-4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                 </div>
                 <p className="text-[#1F2532]/60 font-medium text-lg">{t.serv_empty}</p>
              </div>
           )}
        </div>

      </div>
    </div>
  );
}

// Helper component for service item to avoid repetition
function ServiceItem({ svc, t, deleteAction }: any) {
  return (
    <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-black/5 flex gap-4 items-center group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
        {svc.imageUrl ? (
          <img src={svc.imageUrl} alt={svc.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <h3 className="text-lg font-bold text-[#1F2532] leading-tight">{svc.name}</h3>
        <p className="text-[#1F2532]/40 text-[10px] mt-1 font-bold uppercase tracking-wider">{svc.duration} {t.min}</p>
        <p className="text-xl font-black text-[#444A5B] mt-2">{svc.price.toLocaleString()} ₸</p>
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity border-l border-black/5 pl-4 ml-2">
        <form action={deleteAction}>
          <input type="hidden" name="id" value={svc.id} />
          <button type="submit" className="text-red-400 hover:text-red-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
