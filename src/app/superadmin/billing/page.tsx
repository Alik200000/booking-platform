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
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-700 pb-20 md:pb-0">
      <div className="px-1 md:px-0">
         <h1 className="text-4xl md:text-[3rem] font-black tracking-tight text-[#1C1C1C]">Заявки на тариф</h1>
         <p className="text-gray-400 font-medium text-sm mt-1">Одобрение запросов на PRO и PREMIUM тарифы</p>
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-sm">
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
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {requests.map((req: any) => (
          <div key={req.id} className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-xl shadow-black/5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-black text-[#1C1C1C] text-lg leading-tight">{req.tenant.name}</p>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">
                   {new Date(req.createdAt).toLocaleDateString()} в {new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
              <span className="bg-purple-50 text-purple-600 border border-purple-100 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest">
                {req.plan}
              </span>
            </div>

            <div className="flex items-center justify-between py-4 border-y border-gray-50">
               <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Сумма к оплате</p>
                  <p className="text-xl font-black text-emerald-600">{req.amount.toLocaleString()} ₸</p>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">ID Транзакции</p>
                  <p className="font-mono text-sm font-black text-gray-600">PAY-{req.tenantId.substring(req.tenantId.length - 4).toUpperCase()}</p>
               </div>
            </div>

            <div className="pt-2">
               {req.status === 'PENDING' ? (
                 <div className="grid grid-cols-2 gap-3">
                    <form action={rejectPayment} className="w-full">
                       <input type="hidden" name="requestId" value={req.id} />
                       <button className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100 active:scale-95 transition-all">
                          Отклонить
                       </button>
                    </form>
                    <form action={approvePayment} className="w-full">
                       <input type="hidden" name="requestId" value={req.id} />
                       <button className="w-full py-4 bg-[#1C1C1C] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-gray-200 active:scale-95 transition-all">
                          Подтвердить
                       </button>
                    </form>
                 </div>
               ) : (
                 <div className={`w-full py-4 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest border ${
                    req.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    'bg-rose-50 text-rose-600 border-rose-100'
                 }`}>
                   {req.status === 'PAID' ? 'Оплачено' : 'Отклонено'}
                 </div>
               )}
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <div className="py-20 text-center text-gray-400 font-bold text-lg italic bg-white rounded-[2rem] border border-dashed border-gray-200">
            Запросы на оплату не найдены
          </div>
        )}
      </div>
    </div>
  );
}
