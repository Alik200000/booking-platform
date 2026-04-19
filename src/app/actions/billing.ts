"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function requestPayment(plan: any, amount: number) {
  const session = await auth();
  if (!session?.user?.tenantId) throw new Error("Unauthorized");
  
  const tenantId = session.user.tenantId;

  const existing = await prisma.paymentRequest.findFirst({
    where: { tenantId, status: "PENDING" }
  });

  if (existing) {
    throw new Error("У вас уже есть заявка в ожидании. Дождитесь подтверждения.");
  }

  await prisma.paymentRequest.create({
    data: {
      tenantId,
      plan,
      amount
    }
  });

  revalidatePath("/admin/billing");
}

export async function approvePayment(formData: FormData) {
  const requestId = formData.get("requestId") as string;
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPERADMIN") throw new Error("Unauthorized");

  const request = await prisma.paymentRequest.findUnique({
    where: { id: requestId }
  });

  if (!request) throw new Error("Заявка не найдена");

  await prisma.$transaction([
    prisma.paymentRequest.update({
      where: { id: requestId },
      data: { status: "PAID" }
    }),
    prisma.subscription.upsert({
      where: { tenantId: request.tenantId },
      update: {
        plan: request.plan,
        paymentStatus: "PAID",
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      create: {
        tenantId: request.tenantId,
        plan: request.plan,
        paymentStatus: "PAID",
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
      }
    })
  ]);

  revalidatePath("/superadmin/billing");
  revalidatePath("/superadmin");
}

export async function rejectPayment(formData: FormData) {
  const requestId = formData.get("requestId") as string;
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPERADMIN") throw new Error("Unauthorized");

  await prisma.paymentRequest.update({
    where: { id: requestId },
    data: { status: "FAILED" }
  });

  revalidatePath("/superadmin/billing");
}
