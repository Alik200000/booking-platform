import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { dict } from "@/lib/i18n";

export default async function ClientsPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId as string;

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "ru";
  const t = dict[locale as keyof typeof dict];

  const clients = await prisma.client.findMany({
    where: { tenantId },
    include: {
      bookings: {
        orderBy: { startTime: 'desc' },
        take: 1 
      },
      _count: {
        select: { bookings: true } 
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <h1 className="text-[2.5rem] font-serif text-[#1F2532] tracking-tight mb-8">{t.clients_title}</h1>

      <div className="bg-[#D3D8DF] rounded-[2rem] p-8 shadow-sm">
        {clients.length === 0 ? (
          <div className="text-center py-20">
             <div className="w-20 h-20 bg-[#444A5B]/10 text-[#444A5B] rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
             </div>
            <p className="text-[#1F2532]/60 font-medium text-xl">{t.clients_empty}</p>
            <p className="text-[#1F2532]/40 text-base mt-2">{t.clients_appear_here}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1F2532]/10">
                  <th className="px-6 py-4 font-bold text-[#1F2532]/70 text-sm uppercase tracking-wider">{t.client_name}</th>
                  <th className="px-6 py-4 font-bold text-[#1F2532]/70 text-sm uppercase tracking-wider">{t.client_phone}</th>
                  <th className="px-6 py-4 font-bold text-[#1F2532]/70 text-sm uppercase tracking-wider text-center">{t.client_visits}</th>
                  <th className="px-6 py-4 font-bold text-[#1F2532]/70 text-sm uppercase tracking-wider">{t.last_visit}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2532]/5">
                {clients.map(client => (
                  <tr key={client.id} className="hover:bg-white/20 transition-colors cursor-pointer group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#59667B] text-white flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                          {client.name[0]}
                        </div>
                        <span className="font-bold text-[#1F2532] text-lg">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[#1F2532]/70 font-medium">{client.phone}</td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-block px-4 py-1.5 bg-[#444A5B] text-white rounded-full text-xs font-bold shadow-sm">
                        {client._count.bookings}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[#1F2532]/60 font-medium">
                      {client.bookings.length > 0 
                        ? new Date(client.bookings[0].startTime).toLocaleDateString()
                        : t.no_bookings_client}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
