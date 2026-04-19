import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { dict } from "@/lib/i18n";

import CopyLinkWidget from "@/components/CopyLinkWidget";

export default async function AdminDashboard() {
  const session = await auth();
  const tenantId = session?.user?.tenantId as string;

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "ru";
  const t = dict[locale as keyof typeof dict];

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

  const totalClients = await prisma.client.count({ where: { tenantId } });
  const totalBookings = await prisma.booking.count({ where: { tenantId } });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayBookings = await prisma.booking.count({
    where: { tenantId, startTime: { gte: today, lt: tomorrow } }
  });

  const recentClients = await prisma.client.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: {
       _count: { select: { bookings: true } }
    }
  });

  const revenue = totalBookings * 50;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <h1 className="text-3xl md:text-[2.5rem] font-serif text-[#1F2532] tracking-tight leading-tight">{t.welcome_back},<br className="md:hidden"/> {session?.user?.name}!</h1>
        <div className="bg-[#D0D6DE] px-5 py-2.5 rounded-full text-[#1F2532] font-semibold flex items-center cursor-pointer shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95">
           {t.this_week} <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      {tenant?.slug && <CopyLinkWidget slug={tenant.slug} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-[#444A5B] rounded-[2rem] p-8 text-white shadow-xl transition-transform duration-500 hover:shadow-2xl">
             <h2 className="text-2xl font-medium mb-6">{t.system_overview}</h2>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
               <div className="bg-[#596070] rounded-3xl p-6 shadow-inner transition-all duration-300 hover:-translate-y-2 hover:shadow-lg group">
                  <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center mb-6 bg-white/5 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  </div>
                  <h3 className="font-semibold text-xl tracking-tight">{t.unique_clients}</h3>
                  <p className="text-white/50 text-xs mt-1 leading-relaxed">{t.total_clients_crm}</p>
                  <p className="text-2xl font-semibold mt-4 text-white/90">{totalClients}</p>
               </div>
               
               <div className="bg-[#788896] rounded-3xl p-6 shadow-2xl transform -translate-y-4 transition-all duration-300 hover:-translate-y-6 hover:shadow-[#788896]/50 group">
                  <div className="w-12 h-12 border border-white/30 rounded-full flex items-center justify-center mb-6 bg-white/10 group-hover:rotate-12 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <h3 className="font-semibold text-xl text-white tracking-tight">{t.bookings}</h3>
                  <p className="text-white/70 text-xs mt-1 leading-relaxed">{t.bookings_today_total}</p>
                  <p className="text-2xl font-semibold mt-4 text-white">{todayBookings} <span className="text-lg text-white/50">/ {totalBookings}</span></p>
               </div>
               
               <div className="bg-[#596070] rounded-3xl p-6 shadow-inner transition-all duration-300 hover:-translate-y-2 hover:shadow-lg group">
                  <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center mb-6 bg-white/5 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </div>
                  <h3 className="font-semibold text-xl tracking-tight">{t.revenue}</h3>
                  <p className="text-white/50 text-xs mt-1 leading-relaxed">{t.revenue_estimated}</p>
                  <p className="text-2xl font-semibold mt-4 text-white/90">{revenue.toLocaleString()} ₸</p>
               </div>
             </div>
          </div>

          <div className="bg-[#D3D8DF] rounded-[2rem] p-8 shadow-sm transition-all hover:shadow-md">
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-medium text-[#1F2532]">{t.recent_clients}</h2>
               <Link href="/admin/clients" className="border-2 border-[#1F2532] text-[#1F2532] px-6 py-2 rounded-full text-sm font-bold hover:bg-[#1F2532] hover:text-white transition-all active:scale-95">{t.view_all}</Link>
             </div>
             
             <table className="w-full text-left">
                <thead>
                   <tr className="text-[#1F2532] font-bold text-sm border-b border-[#1F2532]/10">
                      <th className="pb-4 w-1/3">{t.client_name}</th>
                      <th className="pb-4 w-1/3">{t.client_phone}</th>
                      <th className="pb-4 w-1/3">{t.client_visits}</th>
                   </tr>
                </thead>
                <tbody className="text-[#1F2532] text-sm font-medium">
                   {recentClients.map((client: any, idx: number) => (
                     <tr key={client.id} className="border-b border-black/5 hover:bg-white/20 transition-colors group cursor-pointer">
                        <td className="py-4 flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-[#59667B] flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform">
                             {client.name[0]}
                           </div>
                           {client.name}
                        </td>
                        <td className="py-4 text-[#1F2532]/70">{client.phone}</td>
                        <td className="py-4">
                          <span className="bg-[#444A5B] text-white px-3 py-1 rounded-full text-xs">{client._count.bookings}</span>
                        </td>
                     </tr>
                   ))}
                   {recentClients.length === 0 && (
                     <tr>
                        <td colSpan={3} className="py-8 text-center text-[#1F2532]/50">{t.no_clients_yet}</td>
                     </tr>
                   )}
                </tbody>
             </table>
          </div>

        </div>

        <div className="space-y-8">
           
           <div className="bg-[#D3D8DF] rounded-[2rem] p-8 shadow-sm group">
             <h2 className="text-2xl font-medium text-[#1F2532] mb-1">{t.financial_overview}</h2>
             <div className="flex items-center text-sm font-medium text-[#1F2532]/60 mb-8 mt-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#444A5B] mr-2 animate-pulse"></span> {t.live_status}
             </div>
             
             <div className="h-56 flex items-end relative border-b border-l border-[#1F2532]/20 pb-2 pl-2 overflow-hidden">
                <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-between text-xs font-bold text-[#1F2532]/50 py-2">
                   <span>120k</span><span>10k</span><span>18k</span><span>16k</span><span>10k</span><span>20</span><span>0</span>
                </div>
                
                <svg className="w-full h-full absolute bottom-2 left-2 right-0" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0,80 C 20,20 40,90 60,40 S 80,60 100,20" fill="none" stroke="#444A5B" strokeWidth="2" strokeLinecap="round" strokeDasharray="200" strokeDashoffset="0" className="animate-[dash_2s_ease-out]" />
                  <circle cx="75" cy="45" r="3" fill="#444A5B" className="animate-[ping_2s_ease-in-out_infinite]" />
                  <circle cx="75" cy="45" r="3" fill="#444A5B" />
                </svg>
                
                <div className="absolute top-16 right-4 bg-[#444A5B] text-white px-4 py-2 rounded-xl text-lg font-bold shadow-xl transition-transform duration-300 hover:scale-110 cursor-pointer">
                  ${revenue}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#444A5B] rotate-45"></div>
                </div>

                <div className="absolute -bottom-7 left-2 right-0 flex justify-between text-xs font-bold text-[#1F2532]/50">
                   <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
                </div>
             </div>
           </div>

           <div className="bg-[#D3D8DF] rounded-[2rem] p-8 shadow-sm">
             <h2 className="text-2xl font-medium text-[#1F2532] mb-6">{t.quick_actions}</h2>
             
             <div className="space-y-4">
                <Link href="/admin/clients" className="w-full bg-[#444A5B] hover:bg-[#3B414F] text-white py-4 px-6 rounded-[1rem] flex items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-md group">
                  <svg className="w-5 h-5 mr-4 text-white/70 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  <span className="font-medium text-lg">{t.add_client}</span>
                </Link>
                <Link href="/admin/calendar" className="w-full bg-[#444A5B] hover:bg-[#3B414F] text-white py-4 px-6 rounded-[1rem] flex items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-md group">
                  <svg className="w-5 h-5 mr-4 text-white/70 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <span className="font-medium text-lg">{t.new_booking}</span>
                </Link>
                <button className="w-full bg-[#444A5B] hover:bg-[#3B414F] text-white py-4 px-6 rounded-[1rem] flex items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-md group">
                  <svg className="w-5 h-5 mr-4 text-white/70 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  <span className="font-medium text-lg">{t.generate_report}</span>
                </button>
             </div>
           </div>
           
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          from { stroke-dashoffset: 200; }
          to { stroke-dashoffset: 0; }
        }
      `}} />
    </div>
  );
}
