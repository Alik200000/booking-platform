import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BookingWidget from "@/components/BookingWidget";

export default async function TenantBookingPage({ 
  params 
}: { 
  params: Promise<{ tenantSlug: string }> 
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.tenantSlug;

  const tenant = await prisma.tenant.findUnique({
    where: { slug: slug },
    include: {
      services: true,
      staff: true
    }
  });

  if (!tenant) return notFound();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-xl w-full apple-card overflow-hidden p-8 sm:p-12">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-[#F5F5F7] rounded-full mx-auto mb-5 flex items-center justify-center border border-black/5 overflow-hidden shadow-sm">
             {tenant.logoUrl ? (
               <img src={tenant.logoUrl} alt={tenant.name} className="w-full h-full object-cover" />
             ) : (
               <span className="text-3xl font-semibold text-zinc-800">{tenant.name[0]}</span>
             )}
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{tenant.name}</h1>
          <p className="text-zinc-500 mt-2 font-medium">Онлайн-запись</p>
        </div>
        
        <BookingWidget tenant={tenant} services={tenant.services} staff={tenant.staff} />
      </div>
    </div>
  );
}
