import { prisma } from "@/lib/prisma";
import { getActiveTenantId } from "@/lib/auth-utils";
import Paywall from "@/components/Paywall";

export default async function IntegrationsPage() {
  const tenantId = await getActiveTenantId();
  
  const subscription = await prisma.subscription.findUnique({ where: { tenantId: tenantId as string } });
  const plan = subscription?.plan || "FREE";

  if (plan === "FREE" || plan === "STARTER") {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <Paywall 
          title="Интеграции и API" 
          description="Подключайте внешние сервисы, настраивайте Webhooks и используйте наше API для автоматизации вашего бизнеса."
          planNeeded="PRO"
        />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div>
        <h1 className="text-[3rem] font-black tracking-tight text-[#1F2532]">Интеграции</h1>
        <p className="text-[#1F2532]/40 font-medium mt-1">Подключите инструменты для масштабирования вашего бизнеса.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <IntegrationCard 
          name="WhatsApp Business" 
          description="Автоматические уведомления и рассылки клиентам через WhatsApp."
          status="Coming Soon"
          icon={<svg className="w-8 h-8 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.938 3.659 1.435 5.624 1.435h.006c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>}
        />
        <IntegrationCard 
          name="Google Analytics" 
          description="Синхронизируйте данные о посещениях и конверсиях с вашим кабинетом GA."
          status="Available"
          icon={<svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>}
        />
        <IntegrationCard 
          name="Webhooks (API)" 
          description="Получайте уведомления о новых записях на ваш сервер в реальном времени."
          status="PRO Exclusive"
          icon={<svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>}
        />
      </div>
    </div>
  );
}

function IntegrationCard({ name, description, status, icon }: any) {
  return (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-black text-[#1F2532] mb-3">{name}</h3>
      <p className="text-gray-400 text-sm font-medium leading-relaxed mb-6 flex-1">{description}</p>
      <div className="w-full pt-6 border-t border-gray-50 flex items-center justify-center">
        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${status === 'Available' ? 'text-emerald-500' : 'text-gray-300'}`}>
          {status}
        </span>
      </div>
    </div>
  );
}
