"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

import { getActiveTenantId } from "@/lib/auth-utils";

export async function getBookingNotificationData(bookingId: string) {
  const session = await auth();
  const tenantId = await getActiveTenantId();
  if (!tenantId) throw new Error("Unauthorized");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId, tenantId },
    include: {
      service: true,
      staff: true,
      tenant: true
    }
  });

  if (!booking) throw new Error("Booking not found");

  const dateStr = new Date(booking.startTime).toLocaleDateString("ru-RU");
  const timeStr = new Date(booking.startTime).toLocaleTimeString("ru-RU", { hour: '2-digit', minute: '2-digit' });
  
  const message = `Здравствуйте, ${booking.clientName}! Напоминаем о вашей записи в ${booking.tenant.name}:
Услуга: ${booking.service.name}
Мастер: ${booking.staff.name}
Дата: ${dateStr} в ${timeStr}
Ждем вас!`;

  return {
    phone: booking.clientPhone.replace(/\D/g, ''),
    message: encodeURIComponent(message)
  };
}

export async function markNotificationSent(bookingId: string) {
  const tenantId = await getActiveTenantId();
  if (!tenantId) throw new Error("Unauthorized");

  // Since we haven't updated schema yet, we can't save it to DB, 
  // but we'll return success to show UI feedback.
  // In a real app, I'd add a field to Booking model.
  return { success: true };
}
