import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientChatUI from "./ClientChatUI";

export default async function ClientChatPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const session = await auth();
  const { tenantId } = await params;

  if (!session || session.user?.role !== "CLIENT") {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  });

  if (!tenant) redirect("/client/dashboard");

  const messages = await prisma.chatMessage.findMany({
    where: {
      tenantId: tenantId,
      OR: [
        { senderId: session.user.id },
        { receiverId: session.user.id }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div className="min-h-screen bg-white">
      <ClientChatUI 
        tenant={tenant} 
        initialMessages={messages} 
        userId={session.user.id!} 
      />
    </div>
  );
}
