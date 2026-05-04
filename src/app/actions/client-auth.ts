"use server";

import { prisma } from "@/lib/prisma";
import { setClientSession, clearClientSession } from "@/lib/client-auth";
import { redirect } from "next/navigation";

export async function registerClient(data: any) {
  const { name, email, phone, password } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("Пользователь с таким Email уже существует");

  const bcrypt = await import("bcryptjs");
  const hashedPassword = await bcrypt.hash(password, 10);

  return await prisma.user.create({
    data: {
      name,
      email,
      phoneNumber: phone,
      password: hashedPassword,
      role: "CLIENT"
    }
  });
}

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
