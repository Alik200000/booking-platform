import { prisma } from "@/lib/prisma";
import { getActiveTenantId } from "@/lib/auth-utils";
import { submitComplaint } from "@/app/actions/complaints";

export default async function AdminComplaintsPage() {
  const tenantId = await getActiveTenantId();
  
  const complaints = await prisma.complaint.findMany({
    where: { tenantId: tenantId as string },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-[#1F2532]">Жалобы и поддержка</h1>
        <p className="text-[#1F2532]/40 font-medium mt-1">Опишите вашу проблему, и администрация платформы свяжется с вами.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <div className="bg-[#D3D8DF] rounded-[2.5rem] p-8 shadow-sm sticky top-28">
            <h2 className="text-xl font-bold text-[#1F2532] mb-6">Новое обращение</h2>
            <form action={submitComplaint} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-[#1F2532]/60 mb-2 ml-1">Тема</label>
                <input 
                  required
                  name="subject"
                  type="text" 
                  placeholder="Например: Проблема с оплатой"
                  className="w-full bg-[#E0E5EC] rounded-2xl px-5 py-4 font-bold text-[#1F2532] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-[#1F2532]/60 mb-2 ml-1">Описание проблемы</label>
                <textarea 
                  required
                  name="content"
                  rows={5}
                  placeholder="Опишите ситуацию подробно..."
                  className="w-full bg-[#E0E5EC] rounded-2xl px-5 py-4 font-bold text-[#1F2532] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none" 
                />
              </div>
              <button type="submit" className="w-full py-4 bg-[#1F2532] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl">
                Отправить жалобу
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-[#1F2532] mb-2 px-2">Ваши обращения</h2>
          {complaints.length === 0 ? (
             <div className="bg-white border border-gray-100 rounded-[2.5rem] p-12 text-center">
                <p className="text-gray-300 font-medium italic">У вас пока нет активных жалоб.</p>
             </div>
          ) : (
            complaints.map((c) => (
              <div key={c.id} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-black text-[#1F2532]">{c.subject}</h3>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{c.content}</p>
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {new Date(c.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: any = {
    PENDING: { label: "Ожидает", color: "bg-amber-100 text-amber-600" },
    IN_PROGRESS: { label: "В работе", color: "bg-blue-100 text-blue-600" },
    RESOLVED: { label: "Решена", color: "bg-emerald-100 text-emerald-600" }
  };
  const config = configs[status] || configs.PENDING;
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${config.color}`}>
      {config.label}
    </span>
  );
}
