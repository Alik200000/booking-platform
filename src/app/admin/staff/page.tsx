import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { dict } from "@/lib/i18n";
import Link from "next/link";

import { getActiveTenantId } from "@/lib/auth-utils";

export default async function StaffPage() {
  const session = await auth();
  const tenantId = await getActiveTenantId() as string;

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "ru";
  const t = dict[locale as keyof typeof dict];

  const staff = await prisma.staff.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' }
  });

  const subscription = await prisma.subscription.findUnique({ where: { tenantId } });
  const plan = subscription?.plan || "FREE";
  const limitReached = plan === "FREE" && staff.length >= 1;

  async function addStaff(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const imageUrl = formData.get("imageUrl") as string || null;
    const startTime = formData.get("startTime") as string || "09:00";
    const endTime = formData.get("endTime") as string || "18:00";
    const commissionPercentage = parseFloat(formData.get("commissionPercentage") as string || "0");
    
    const newStaff = await prisma.staff.create({
      data: { tenantId, name, commissionPercentage, imageUrl }
    });

    const scheduleData = [1, 2, 3, 4, 5].map((day: any) => ({
      tenantId,
      staffId: newStaff.id,
      dayOfWeek: day,
      startTime: startTime,
      endTime: endTime
    }));

    await prisma.schedule.createMany({ data: scheduleData });
    revalidatePath("/admin/staff");
  }

  async function deleteStaff(formData: FormData) {
    "use server";
    await prisma.staff.delete({ where: { id: formData.get("id") as string } });
    revalidatePath("/admin/staff");
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <h1 className="text-[2.5rem] font-serif text-[#1F2532] tracking-tight mb-8">{t.staff_title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="md:col-span-1">
          {limitReached ? (
            <div className="bg-[#1F2532] rounded-[2rem] p-8 shadow-xl text-white">
              <h2 className="text-2xl font-bold mb-2">{t.staff_limit_reached}</h2>
              <a href="/admin/billing" className="block text-center w-full bg-white text-[#1F2532] py-3.5 rounded-xl font-bold mt-6">
                {t.upgrade_plan}
              </a>
            </div>
          ) : (
            <div className="bg-[#D3D8DF] rounded-[2rem] p-8 shadow-sm">
              <h2 className="text-xl font-medium text-[#1F2532] mb-6">{t.add_master}</h2>
              <form action={addStaff} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#1F2532]/80">{t.staff_name}</label>
                  <input type="text" name="name" required className="w-full bg-[#E0E5EC] px-4 py-3 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#1F2532]/80">URL фото мастера</label>
                  <input type="url" name="imageUrl" placeholder="https://..." className="w-full bg-[#E0E5EC] px-4 py-3 rounded-xl outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#1F2532]/80">Комиссия (%)</label>
                  <input type="number" name="commissionPercentage" defaultValue="0" className="w-full bg-[#E0E5EC] px-4 py-3 rounded-xl outline-none" />
                </div>
                <button type="submit" className="w-full bg-[#444A5B] text-white py-3.5 rounded-xl font-bold">
                  {t.add_btn}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-4">
           {staff.map((member: any) => (
              <div key={member.id} className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 flex justify-between items-center group transition-all">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-2xl bg-[#E0E5EC] flex items-center justify-center font-bold text-xl overflow-hidden border border-gray-100 shrink-0">
                        {member.imageUrl ? (
                          <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          member.name[0]
                        )}
                     </div>
                     <Link href={`/admin/staff/${member.id}/schedule`} className="flex-1">
                       <h3 className="text-xl font-bold text-[#1F2532]">{member.name}</h3>
                       <p className="text-[#1F2532]/50 text-sm">{member.commissionPercentage}% комиссия</p>
                     </Link>
                  </div>
                  <form action={deleteStaff}>
                    <input type="hidden" name="id" value={member.id} />
                    <button type="submit" className="text-red-400 p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                  </form>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
}
