import { prisma } from "@/lib/prisma";
import { updateComplaintStatus } from "@/app/actions/complaints";

export default async function SuperadminComplaintsPage() {
  const complaints = await prisma.complaint.findMany({
    include: { tenant: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div>
        <h1 className="text-[3.5rem] font-black tracking-tighter text-[#1C1C1C]">Жалобы</h1>
        <p className="text-gray-400 font-medium text-sm mt-1">Управление обращениями от владельцев бизнеса</p>
      </div>

      <div className="space-y-6">
        {complaints.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-20 text-center">
            <p className="text-gray-300 font-bold text-xl italic">Пока жалоб нет. Всё спокойно!</p>
          </div>
        ) : (
          complaints.map((c) => (
            <div key={c.id} className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-10">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="px-4 py-1.5 bg-gray-50 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100">
                    {c.tenant.name}
                  </div>
                  <span className="text-gray-300 font-medium text-[10px] uppercase tracking-widest">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-2xl font-black text-[#1C1C1C] mb-4">{c.subject}</h3>
                <p className="text-gray-500 font-medium leading-relaxed mb-6">{c.content}</p>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                    {c.tenant.name[0]}
                  </div>
                  <span className="text-xs font-bold text-gray-400 italic">Салон: {c.tenant.slug}.zapis.online</span>
                </div>
              </div>

              <div className="md:w-64 border-l border-gray-50 md:pl-10 flex flex-col justify-center">
                <form action={updateComplaintStatus} className="space-y-4">
                  <input type="hidden" name="id" value={c.id} />
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest text-center md:text-left">Статус</label>
                  <select 
                    name="status"
                    defaultValue={c.status}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 font-black text-xs uppercase tracking-widest text-[#1C1C1C] outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none text-center md:text-left"
                  >
                    <option value="PENDING">Ожидает</option>
                    <option value="IN_PROGRESS">В работе</option>
                    <option value="RESOLVED">Решена</option>
                  </select>
                  <button type="submit" className="w-full py-4 bg-[#1C1C1C] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-100">
                    Обновить
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
