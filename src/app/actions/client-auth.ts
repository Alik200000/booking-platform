"use server";

import { prisma } from "@/lib/prisma";
import { setClientSession, clearClientSession } from "@/lib/client-auth";
import { redirect } from "next/navigation";

export async function loginClient(tenantId: string, tenantSlug: string, phone: string) {
  const client = await prisma.client.findFirst({
    where: { tenantId, phone }
  });

  if (!client) {
    throw new Error("Клиент с таким номером не найден. Вы еще не записывались к нам.");
  }

  await setClientSession(client.id, tenantId);
  redirect(`/${tenantSlug}/client/dashboard`);
}

export async function logoutClient(tenantId: string, tenantSlug: string) {
  await clearClientSession(tenantId);
  redirect(`/${tenantSlug}/client`);
}
