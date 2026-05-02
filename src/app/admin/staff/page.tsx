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
    const startTime = formData.get("startTime") as string || "09:00";
    const endTime = formData.get("endTime") as string || "18:00";
    const commissionPercentage = parseFloat(formData.get("commissionPercentage") as string || "0");
    
    // Create staff
    const newStaff = await prisma.staff.create({
      data: { tenantId, name, commissionPercentage }
    });

    // Create default schedule for them (Mon-Fri)
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
      <h1 className="text-[2.5rem] font-serif text-main-text tracking-tight mb-8">{t.staff_title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Form Card */}
        <div className="md:col-span-1">
          {limitReached ? (
            <div className="bg-sidebar rounded-[2rem] p-8 shadow-xl text-white">
              <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mb-6">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">{t.staff_limit_reached}</h2>
              <p className="text-white/70 text-sm mb-6 leading-relaxed">{t.staff_limit_desc}</p>
              <a href="/admin/billing" className="block text-center w-full bg-white text-main-text hover:bg-white/90 py-3.5 rounded-xl font-bold shadow-md transition-all hover:-translate-y-1">
                {t.upgrade_plan}
              </a>
            </div>
          ) : (
            <div className="bg-sec-bg rounded-[2rem] p-8 shadow-sm">
              <h2 className="text-xl font-medium text-main-text mb-6">{t.add_master}</h2>
              <form action={addStaff} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-main-text/80">{t.staff_name}</label>
                  <input type="text" name="name" required className="w-full bg-sec-bg text-main-text px-4 py-3 rounded-xl border border-white/40 focus:border-[#444A5B] outline-none transition-colors placeholder:text-main-text/40" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-main-text/80">Процент комиссии (%)</label>
                  <input type="number" name="commissionPercentage" defaultValue="0" min="0" max="100" step="0.5" className="w-full bg-sec-bg text-main-text px-4 py-3 rounded-xl border border-white/40 focus:border-[#444A5B] outline-none transition-colors" />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                     <label className="block text-sm font-semibold mb-2 text-main-text/80">{t.shift_start}</label>
                     <input type="time" name="startTime" defaultValue="09:00" required className="w-full bg-sec-bg text-main-text px-4 py-3 rounded-xl border border-white/40 focus:border-[#444A5B] outline-none transition-colors" />
                  </div>
                  <div className="flex-1">
                     <label className="block text-sm font-semibold mb-2 text-main-text/80">{t.shift_end}</label>
                     <input type="time" name="endTime" defaultValue="18:00" required className="w-full bg-sec-bg text-main-text px-4 py-3 rounded-xl border border-white/40 focus:border-[#444A5B] outline-none transition-colors" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-sidebar hover:bg-[#3B414F] text-white py-3.5 rounded-xl font-bold shadow-md transition-all hover:-translate-y-1 mt-2">
                  {t.add_btn}
                </button>
              </form>
              <p className="text-xs text-main-text/50 mt-6 text-center">{t.schedule_auto}</p>
            </div>
          )}
        </div>

        {/* List Card */}
        <div className="md:col-span-2 space-y-4">
           {staff.map((member: any) => (
              <div key={member.id} className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 flex justify-between items-center group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-sec-bg text-[#444A5B] flex items-center justify-center font-bold text-xl shadow-inner group-hover:scale-110 transition-transform">
                       {member.name[0]}
                    </div>
                    <Link href={`/admin/staff/${member.id}/schedule`} className="flex-1">
                      <h3 className="text-xl font-bold text-main-text group-hover:text-blue-600 transition-colors">{member.name}</h3>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-100">
                          {member.commissionPercentage}% КОМИССИЯ
                        </span>
                        <p className="text-main-text/50 text-sm font-medium">{t.works_on_schedule} →</p>
                      </div>
                    </Link>
                 </div>
                 
                 <div className="opacity-0 group-hover:opacity-100 transition-opacity border-l border-black/5 pl-4 ml-6">
                    <form action={deleteStaff}>
                       <input type="hidden" name="id" value={member.id} />
                       <button type="submit" className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                       </button>
                    </form>
                 </div>
              </div>
           ))}
           {staff.length === 0 && (
              <div className="bg-sec-bg rounded-3xl p-16 text-center shadow-inner">
                 <div className="w-16 h-16 bg-sidebar/10 text-[#444A5B] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                 </div>
                 <p className="text-main-text/60 font-medium text-lg">{t.staff_empty}</p>
                 <p className="text-main-text/40 text-sm mt-2">{t.add_first_master}</p>
              </div>
           )}
        </div>

      </div>
    </div>
  );
}
