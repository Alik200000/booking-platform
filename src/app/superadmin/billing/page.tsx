import { prisma } from "@/lib/prisma";
import { approvePayment, rejectPayment } from "@/app/actions/billing";

export default async function SuperadminBillingPage() {
  let requests: any[] = [];
  try {
    requests = await prisma.paymentRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { tenant: true }
    });
  } catch (error) {
    console.error("SuperadminBillingPage data fetch error:", error);
  }


  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
         <h1 className="text-[3rem] font-black tracking-tight text-[#1C1C1C]">Заявки на тариф</h1>
         <p className="text-gray-400 font-medium text-sm mt-1">Одобрение запросов на PRO и PREMIUM тарифы</p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Бизнес / Дата</th>
                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Тариф / Сумма</th>
                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Код подтверждения</th>
                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Статус / Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map((req: any) => (
                <tr key={req.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-6">
                     <p className="font-bold text-base text-[#1C1C1C]">{req.tenant.name}</p>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        {new Date(req.createdAt).toLocaleDateString()} в {new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </p>
                  </td>
                  <td className="py-6">
                     <div className="flex items-center gap-3">
                        <span className="bg-purple-50 text-purple-600 border border-purple-100 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">{req.plan}</span>
                        <span className="font-black text-emerald-600 text-lg">{req.amount.toLocaleString()} ₸</span>
                     </div>
                  </td>
                  <td className="py-6">
                     <span className="font-mono text-lg font-black bg-gray-50 border border-gray-100 px-4 py-2 rounded-2xl text-zinc-600">
                        PAY-{req.tenantId.substring(req.tenantId.length - 4).toUpperCase()}
                     </span>
                  </td>
                  <td className="py-6 text-right">
                     {req.status === 'PENDING' ? (
                       <div className="flex justify-end gap-3">
                          <form action={rejectPayment}>
                             <input type="hidden" name="requestId" value={req.id} />
                             <button className="px-6 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100">
                                Отклонить
                             </button>
                          </form>
                          <form action={approvePayment}>
                             <input type="hidden" name="requestId" value={req.id} />
                             <button className="px-6 py-2.5 bg-[#1C1C1C] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200">
                                Подтвердить
                             </button>
                          </form>
                       </div>
                     ) : (
                       <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          req.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          'bg-rose-50 text-rose-600 border-rose-100'
                       }`}>
                         {req.status === 'PAID' ? 'Оплачено' : 'Отклонено'}
                       </span>
                     )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                   <td colSpan={4} className="py-20 text-center text-gray-400 font-bold text-lg italic">Запросы на оплату не найдены</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
