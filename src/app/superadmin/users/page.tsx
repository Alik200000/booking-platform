import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
  let users: any[] = [];
  try {
    users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { tenant: true }
    });
  } catch (error) {
    console.error("UsersPage data fetch error:", error);
  }


  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
         <h1 className="text-[3rem] font-black tracking-tight text-[#1C1C1C]">Пользователи</h1>
         <p className="text-gray-400 font-medium text-sm mt-1">Список всех зарегистрированных пользователей системы</p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Пользователь</th>
                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Роль</th>
                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Привязка к бизнесу</th>
                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Дата регистрации</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u: any) => (
                <tr key={u.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
                           {u.name[0]}
                        </div>
                        <div>
                           <p className="font-bold text-[#1C1C1C] text-base">{u.name}</p>
                           <p className="text-xs text-gray-400 font-medium">{u.email || u.phoneNumber}</p>
                        </div>
                     </div>
                  </td>
                  <td className="py-6">
                     <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        u.role === 'SUPERADMIN' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                        u.role === 'OWNER' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-gray-50 text-gray-500 border-gray-100'
                     }`}>
                        {u.role}
                     </span>
                  </td>
                  <td className="py-6">
                     {u.tenant ? (
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                          <span className="text-sm font-bold text-[#1C1C1C]">{u.tenant.name}</span>
                       </div>
                     ) : (
                       <span className="text-xs text-gray-300 font-bold uppercase tracking-widest">Нет привязки</span>
                     )}
                  </td>
                  <td className="py-6 text-right">
                     <p className="text-xs font-black text-[#1C1C1C]">{new Date(u.createdAt).toLocaleDateString()}</p>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{new Date(u.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
