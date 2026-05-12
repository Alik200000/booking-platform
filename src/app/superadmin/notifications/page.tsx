import { prisma } from "@/lib/prisma";
import { createSystemMessage, deleteSystemMessage, toggleSystemMessage } from "@/app/actions/notifications";

export default async function SuperadminNotificationsPage() {
  const [tenants, messages] = await Promise.all([
    prisma.tenant.findMany({ select: { id: true, name: true } }),
    prisma.systemMessage.findMany({ orderBy: { createdAt: 'desc' } })
  ]);

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div>
        <h1 className="text-[3.5rem] font-black tracking-tighter text-[#1C1C1C]">Оповещения</h1>
        <p className="text-gray-400 font-medium text-sm mt-1">Рассылка системных уведомлений для владельцев бизнеса</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Создание */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm sticky top-28">
            <h2 className="text-xl font-black text-[#1C1C1C] mb-6">Создать рассылку</h2>
            <form action={createSystemMessage} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Получатель</label>
                <select 
                  name="targetTenantId"
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 font-bold text-sm text-[#1C1C1C] outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none"
                >
                  <option value="ALL">📢 Всем бизнесам (Global)</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>🏢 {t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Заголовок</label>
                <input 
                  required
                  name="title"
                  type="text" 
                  placeholder="Важное обновление!"
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 font-bold text-sm text-[#1C1C1C] outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Текст сообщения</label>
                <textarea 
                  required
                  name="content"
                  rows={4}
                  placeholder="Опишите детали здесь..."
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 font-bold text-sm text-[#1C1C1C] outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Тип (Стиль)</label>
                <select 
                  name="type"
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 font-bold text-sm text-[#1C1C1C] outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none"
                >
                  <option value="INFO">🔵 Информация (Синий)</option>
                  <option value="WARNING">🟠 Предупреждение (Оранжевый)</option>
                  <option value="SUCCESS">🟢 Успех (Зеленый)</option>
                </select>
              </div>

              <button type="submit" className="w-full py-5 bg-[#1C1C1C] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] hover:bg-black transition-all shadow-xl shadow-gray-100">
                Запустить рассылку
              </button>
            </form>
          </div>
        </div>

        {/* Список активных */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black text-[#1C1C1C] px-4">История рассылок</h2>
          {messages.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-[3rem] p-20 text-center">
              <p className="text-gray-300 font-bold italic">Вы еще не отправляли уведомлений.</p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm transition-all ${!m.isActive ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <TypeBadge type={m.type} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                      {m.targetTenantId ? `🏢 ID: ${m.targetTenantId}` : "📢 GLOBAL"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <form action={toggleSystemMessage}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="isActive" value={String(m.isActive)} />
                      <button className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${m.isActive ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {m.isActive ? "Выключить" : "Включить"}
                      </button>
                    </form>
                    <form action={deleteSystemMessage}>
                      <input type="hidden" name="id" value={m.id} />
                      <button className="p-2 text-rose-300 hover:text-rose-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </form>
                  </div>
                </div>
                <h3 className="text-xl font-black text-[#1C1C1C] mb-2">{m.title}</h3>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">{m.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const configs: any = {
    INFO: "bg-blue-50 text-blue-500",
    WARNING: "bg-amber-50 text-amber-500",
    SUCCESS: "bg-emerald-50 text-emerald-500"
  };
  return (
    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${configs[type] || configs.INFO}`}>
      {type}
    </div>
  );
}
