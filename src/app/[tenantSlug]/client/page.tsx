import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getClientSession } from "@/lib/client-auth";
import ClientLoginForm from "./ClientLoginForm";

export default async function ClientLoginPage({ 
  params 
}: { 
  params: Promise<{ tenantSlug: string }> 
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.tenantSlug;

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return notFound();

  const clientId = await getClientSession(tenant.id);
  if (clientId) {
     redirect(`/${slug}/client/dashboard`);
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full apple-card overflow-hidden p-8 sm:p-12 text-center">
        <div className="w-20 h-20 bg-[#F5F5F7] text-zinc-800 rounded-full mx-auto mb-6 flex items-center justify-center border border-black/5 shadow-sm">
           <span className="text-3xl font-semibold">{tenant.name[0]}</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">Личный кабинет</h1>
        <p className="text-zinc-500 mb-10 font-medium">Введите номер телефона, по которому вы записывались в {tenant.name}.</p>
        
        <ClientLoginForm tenantId={tenant.id} tenantSlug={slug} />
      </div>
    </div>
  );
}
