"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createSystemMessage(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const type = formData.get("type") as string;
  const targetTenantId = formData.get("targetTenantId") as string;

  await prisma.systemMessage.create({
    data: {
      title,
      content,
      type,
      targetTenantId: targetTenantId === "ALL" ? null : targetTenantId,
      isActive: true
    }
  });

  revalidatePath("/superadmin/notifications");
}

export async function toggleSystemMessage(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  const isActive = formData.get("isActive") === "true";

  await prisma.systemMessage.update({
    where: { id },
    data: { isActive: !isActive }
  });

  revalidatePath("/superadmin/notifications");
}

export async function deleteSystemMessage(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") throw new Error("Unauthorized");

  const id = formData.get("id") as string;

  await prisma.systemMessage.delete({
    where: { id }
  });

  revalidatePath("/superadmin/notifications");
}

export async function getBookingNotificationData(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      tenant: true,
      service: true,
      staff: true
    }
  });

  if (!booking) throw new Error("Booking not found");

  const dateStr = new Date(booking.startTime).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long'
  });
  
  const timeStr = new Date(booking.startTime).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const message = encodeURIComponent(
    `Здравствуйте, ${booking.clientName}! Напоминаем о вашей записи в ${booking.tenant.name} на услугу "${booking.service.name}".\n\n📅 Дата: ${dateStr}\n⏰ Время: ${timeStr}\n👤 Мастер: ${booking.staff.name}\n\nЖдем вас!`
  );

  return {
    phone: booking.clientPhone.replace(/\D/g, ''), // Убираем всё кроме цифр
    message
  };
}
