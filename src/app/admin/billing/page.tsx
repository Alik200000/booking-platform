import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import KaspiPaymentButton from "./KaspiPaymentButton";
import { cookies } from "next/headers";
import { dict } from "@/lib/i18n";

export default async function BillingPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId as string;

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "ru";
  const t = dict[locale as keyof typeof dict];

  let subscription = await prisma.subscription.findUnique({
    where: { tenantId }
  });

  if (!subscription) {
    subscription = await prisma.subscription.create({
      data: { tenantId, plan: "FREE", validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    });
  }

  const pendingRequest = await prisma.paymentRequest.findFirst({
    where: { tenantId, status: "PENDING" }
  });

  const plans = [
    { name: "FREE", price: "0 ₸", desc: "Для частных мастеров", features: ["До 1 мастера", "До 50 записей в месяц", "Базовый календарь"], isCurrent: subscription.plan === "FREE" },
    { name: "STARTER", price: "25 000 ₸", desc: "Для небольших салонов", features: ["До 3 мастеров", "Безлимитные записи", "СМС-уведомления"], isCurrent: subscription.plan === "STARTER" },
    { name: "PRO", price: "45 000 ₸", desc: "Для сети салонов", features: ["Безлимитные мастера", "API и интеграции", "Выделенная поддержка"], isCurrent: subscription.plan === "PRO", highlight: true }
  ];

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <h1 className="text-[2.5rem] font-serif text-[#1F2532] tracking-tight mb-8">{t.billing_title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
        {plans.map((plan) => (
          <div key={plan.name} className={`relative bg-white rounded-[2rem] p-8 flex flex-col transition-all duration-300 ${plan.highlight ? 'border-2 border-[#444A5B] shadow-2xl scale-105 z-10' : 'border border-black/5 shadow-sm hover:shadow-lg hover:-translate-y-1'}`}>
            {plan.highlight && (
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#444A5B] text-white px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">{t.popular}</div>
            )}
            <h4 className="text-2xl font-bold text-[#1F2532]">{plan.name}</h4>
            <p className="text-sm text-[#1F2532]/60 mt-2 font-medium h-10">{plan.desc}</p>
            <div className="my-8">
               <span className="text-[3rem] font-black text-[#1F2532] tracking-tighter">{plan.price}</span>
               <span className="text-[#1F2532]/50 font-medium ml-1">{t.per_month}</span>
            </div>
            
            <ul className="space-y-5 flex-1">
              {plan.features.map((f: any) => (
                 <li key={f} className="flex items-center text-[15px] font-semibold text-[#1F2532]/80">
                   <svg className="w-6 h-6 text-emerald-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                   {f}
                 </li>
              ))}
            </ul>

            <KaspiPaymentButton 
              plan={plan}
              amount={parseInt(plan.price.replace(/\D/g, '')) || 0}
              tenantId={tenantId}
              isCurrent={plan.isCurrent}
              isPending={pendingRequest?.plan === plan.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
