import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { tenant: true }
  });

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-[3rem] font-black tracking-tight mb-12">Platform Users</h1>
      
      <div className="bg-[#121212] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-[#1A1A1A]">
            <tr>
              <th className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-white/30">User</th>
              <th className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-white/30">Role</th>
              <th className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-white/30">Tenant Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-white/5 transition-colors">
                <td className="px-8 py-6">
                   <p className="font-bold text-lg mb-1">{u.name}</p>
                   <p className="text-xs text-white/40">{u.email}</p>
                </td>
                <td className="px-8 py-6">
                   <span className={`px-4 py-2 rounded-lg text-xs font-bold uppercase ${u.role === 'SUPERADMIN' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                     {u.role}
                   </span>
                </td>
                <td className="px-8 py-6">
                   {u.tenant ? (
                     <span className="text-white/80 font-bold bg-white/5 px-4 py-2 rounded-lg">{u.tenant.name}</span>
                   ) : (
                     <span className="text-white/20 italic font-medium">None</span>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
