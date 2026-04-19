import { prisma } from "@/lib/prisma";
import { approvePayment, rejectPayment } from "@/app/actions/billing";

export default async function SuperadminBillingPage() {
  const requests = await prisma.paymentRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { tenant: true }
  });

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-[3rem] font-black tracking-tight mb-12">Payment Requests</h1>
      
      <div className="bg-[#121212] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-[#1A1A1A]">
            <tr>
              <th className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-white/30">Business</th>
              <th className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-white/30">Plan / Amount</th>
              <th className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-white/30">Kaspi Code</th>
              <th className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-white/30 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {requests.map(req => (
              <tr key={req.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-8 py-6">
                   <p className="font-bold text-lg mb-1">{req.tenant.name}</p>
                   <p className="text-xs text-white/30">{new Date(req.createdAt).toLocaleString()}</p>
                </td>
                <td className="px-8 py-6">
                   <div className="flex items-center gap-3">
                     <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-lg text-xs font-bold uppercase">{req.plan}</span>
                     <span className="font-bold text-emerald-400">${req.amount}</span>
                   </div>
                </td>
                <td className="px-8 py-6">
                   <span className="font-mono text-xl font-bold bg-white/5 px-4 py-2 rounded-xl text-white/80">PAY-{req.tenantId.substring(req.tenantId.length - 4).toUpperCase()}</span>
                </td>
                <td className="px-8 py-6 text-right">
                   {req.status === 'PENDING' ? (
                     <div className="flex justify-end gap-3">
                        <form action={rejectPayment}>
                           <input type="hidden" name="requestId" value={req.id} />
                           <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold uppercase transition-colors">Отклонить</button>
                        </form>
                        <form action={approvePayment}>
                           <input type="hidden" name="requestId" value={req.id} />
                           <button className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold uppercase transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]">Подтвердить</button>
                        </form>
                     </div>
                   ) : (
                     <span className={`px-4 py-2 rounded-lg text-xs font-bold uppercase ${req.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                       {req.status}
                     </span>
                   )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                 <td colSpan={4} className="px-8 py-12 text-center text-white/30 font-bold">No payment requests</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
