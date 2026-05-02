import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getActiveTenantId } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function AdminMessagesPage() {
  const session = await auth();
  const tenantId = await getActiveTenantId();
  if (!tenantId) redirect("/login");

  const messages = await prisma.chatMessage.findMany({
    where: {
      OR: [
        { tenantId },
        { receiverId: session?.user?.id }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-serif text-main-text mb-2">Сообщения</h1>
          <p className="text-sec-text font-medium">Центр общения с клиентами и администрацией ZENO</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {messages.length === 0 ? (
          <div className="bg-sec-bg rounded-[2.5rem] p-12 text-center border-2 border-dashed border-main-text/5">
             <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
             </div>
             <h3 className="text-xl font-bold text-main-text mb-2">Пока нет сообщений</h3>
             <p className="text-sec-text max-w-xs mx-auto">Здесь будут появляться сообщения от ваших клиентов и важные уведомления от платформы.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`p-6 rounded-[2rem] border transition-all hover:shadow-md ${msg.senderType === 'SUPERADMIN' ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-black/5'}`}>
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${msg.senderType === 'SUPERADMIN' ? 'bg-indigo-600' : 'bg-blue-500'}`}>
                        {msg.senderType === 'SUPERADMIN' ? 'B' : 'C'}
                     </div>
                     <div>
                        <p className="font-bold text-main-text">
                           {msg.senderType === 'SUPERADMIN' ? 'Босс (ZENO Admin)' : 'Клиент'}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest font-black opacity-30">
                           {new Date(msg.createdAt).toLocaleString()}
                        </p>
                     </div>
                  </div>
                  {!msg.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                  )}
               </div>
               <p className="text-main-text leading-relaxed font-medium pl-13">
                  {msg.content}
               </p>
               
               <div className="mt-6 flex justify-end">
                  <button className="px-6 py-2 bg-main-text text-white rounded-full text-xs font-bold hover:scale-105 active:scale-95 transition-all">Ответить</button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
