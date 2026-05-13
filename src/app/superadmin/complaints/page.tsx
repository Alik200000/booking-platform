import { prisma } from "@/lib/prisma";
import { updateComplaintStatus } from "@/app/actions/complaints";

export default async function SuperadminComplaintsPage() {
  const complaints = await prisma.complaint.findMany({
    include: { tenant: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700 pb-20 md:pb-0">
      <div className="px-1 md:px-0">
        <h1 className="text-4xl md:text-[3.5rem] font-black tracking-tighter text-[#1C1C1C]">Жалобы</h1>
        <p className="text-gray-400 font-medium text-sm mt-1">Управление обращениями от владельцев бизнеса</p>
      </div>

      <div className="space-y-6">
        {complaints.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-[2rem] md:rounded-[2.5rem] p-10 md:p-20 text-center">
            <p className="text-gray-300 font-bold text-lg md:text-xl italic">Пока жалоб нет. Всё спокойно!</p>
          </div>
        ) : (
          complaints.map((c) => (
            <div key={c.id} className="bg-white border border-gray-100 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-8 md:gap-10">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="px-4 py-1.5 bg-gray-50 text-gray-500 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-gray-100">
                    {c.tenant.name}
                  </div>
                  <span className="text-gray-300 font-medium text-[9px] md:text-[10px] uppercase tracking-widest">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    c.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                    c.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    {c.status === 'PENDING' ? 'Ожидает' : c.status === 'IN_PROGRESS' ? 'В работе' : 'Решена'}
                  </div>
                </div>
                
                <h3 className="text-xl md:text-2xl font-black text-[#1C1C1C] mb-4 leading-tight">{c.subject}</h3>
                <p className="text-sm md:text-gray-500 font-medium leading-relaxed mb-6 text-gray-500">{c.content}</p>
                
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                    {c.tenant.name[0]}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 italic">Салон: {c.tenant.slug}.zapis.online</span>
                </div>
              </div>

              <div className="md:w-64 md:border-l border-gray-100 md:pl-10 flex flex-col justify-center bg-gray-50 md:bg-transparent -mx-6 -mb-6 md:mx-0 md:mb-0 p-6 md:p-0 rounded-b-[2rem] md:rounded-none">
                <form action={updateComplaintStatus} className="space-y-4 w-full">
                  <input type="hidden" name="id" value={c.id} />
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest text-center md:text-left">Изменить статус</label>
                  <select 
                    name="status"
                    defaultValue={c.status}
                    className="w-full bg-white md:bg-gray-50 border border-gray-100 md:border-none rounded-2xl px-5 py-4 font-black text-xs uppercase tracking-widest text-[#1C1C1C] outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none text-center md:text-left"
                  >
                    <option value="PENDING">Ожидает</option>
                    <option value="IN_PROGRESS">В работе</option>
                    <option value="RESOLVED">Решена</option>
                  </select>
                  <button type="submit" className="w-full py-4 bg-[#1C1C1C] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-200">
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
