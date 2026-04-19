import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getClientSession } from "@/lib/client-auth";
import CancelButton from "./CancelButton";
import Link from "next/link";

export default async function ClientDashboardPage({ 
  params 
}: { 
  params: Promise<{ tenantSlug: string }> 
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.tenantSlug;

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return notFound();

  const clientId = await getClientSession(tenant.id);
  if (!clientId) {
     redirect(`/${slug}/client`);
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
       bookings: {
         include: { service: true, staff: true },
         orderBy: { startTime: 'desc' }
       }
    }
  });

  if (!client) {
     redirect(`/${slug}/client`);
  }

  const now = new Date();
  const upcoming = client.bookings.filter((b: any) => b.startTime > now && b.status !== "CANCELLED");
  const past = client.bookings.filter((b: any) => b.startTime <= now || b.status === "CANCELLED");

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center py-12 px-4 sm:px-6">
      <div className="max-w-3xl w-full">
        
        <div className="flex justify-between items-end mb-10">
           <div>
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-16 h-16 bg-white border border-black/5 text-zinc-800 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-2xl font-bold">{tenant.name[0]}</span>
                 </div>
                 <div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Здравствуйте, {client.name}!</h1>
                    <p className="text-zinc-500 font-medium mt-1">Ваш личный кабинет в {tenant.name}</p>
                 </div>
              </div>
           </div>
           <div className="flex gap-3">
             <Link href={`/${slug}`} className="px-5 py-2.5 bg-[#0071E3] text-white rounded-xl font-bold shadow-sm hover:bg-[#0071E3]/90 transition-colors">
               Новая запись
             </Link>
             <form action={async () => {
               "use server";
               const { logoutClient } = await import("@/app/actions/client-auth");
               await logoutClient(tenant.id, slug);
             }}>
               <button className="px-5 py-2.5 bg-white text-zinc-600 rounded-xl font-semibold shadow-sm border border-black/5 hover:bg-zinc-50 transition-colors">Выйти</button>
             </form>
           </div>
        </div>

        <h2 className="text-2xl font-bold text-zinc-900 mb-6">Предстоящие записи</h2>
        <div className="space-y-4 mb-12">
          {upcoming.length === 0 ? (
             <div className="apple-card p-10 text-center text-zinc-500 font-medium border border-black/5">У вас нет предстоящих записей.</div>
          ) : (
             upcoming.map(b => (
               <div key={b.id} className="apple-card p-8 flex justify-between items-center bg-white border border-black/5 shadow-sm">
                  <div>
                    <h3 className="font-bold text-xl text-zinc-900">{b.service.name}</h3>
                    <p className="text-zinc-500 font-medium mt-2">Мастер: {b.staff.name}</p>
                    <p className="text-[#0071E3] font-bold mt-4 text-lg">
                       {new Date(b.startTime).toLocaleDateString('ru-RU', { weekday: 'long', month: 'long', day: 'numeric' })} в {new Date(b.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-4">
                     <span className="text-2xl font-black text-zinc-900">${b.service.price}</span>
                     <CancelButton bookingId={b.id} clientId={client.id} />
                  </div>
               </div>
             ))
          )}
        </div>

        <h2 className="text-2xl font-bold text-zinc-900 mb-6">История посещений</h2>
        <div className="space-y-4">
          {past.length === 0 ? (
             <div className="apple-card p-10 text-center text-zinc-500 font-medium border border-black/5">История пуста.</div>
          ) : (
             past.map(b => (
               <div key={b.id} className="apple-card p-6 bg-white border border-black/5 opacity-80 hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-lg text-zinc-900">{b.service.name}</h3>
                    <span className={`text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider ${b.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {b.status === 'CANCELLED' ? 'Отменена' : 'Завершена'}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-zinc-500 font-medium text-sm">Мастер: {b.staff.name}</p>
                      <p className="text-zinc-600 font-bold text-sm mt-1">
                         {new Date(b.startTime).toLocaleDateString('ru-RU', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="font-bold text-zinc-400">${b.service.price}</span>
                  </div>
               </div>
             ))
          )}
        </div>

      </div>
    </div>
  );
}
