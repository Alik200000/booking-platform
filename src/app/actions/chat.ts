"use server";

import { prisma } from "@/lib/prisma";

export async function sendMessage(data: {
  content: string;
  tenantId: string;
  senderId: string;
  receiverId?: string;
  senderType: string;
}) {
  return await prisma.chatMessage.create({
    data: {
      content: data.content,
      tenantId: data.tenantId,
      senderId: data.senderId,
      receiverId: data.receiverId || null,
      senderType: data.senderType,
      isRead: false
    }
  });
}

export async function getTenantMessages(tenantId: string, clientId: string) {
  return await prisma.chatMessage.findMany({
    where: {
      tenantId,
      OR: [
        { senderId: clientId },
        { receiverId: clientId }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });
}
