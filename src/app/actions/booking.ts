"use server";

import { prisma } from "@/lib/prisma";

/**
 * Получить список свободных слотов для мастера на конкретную дату.
 * Учитывает график работы мастера и уже существующие записи.
 */
export async function getAvailableSlots(tenantId: string, serviceId: string, staffId: string, dateStr: string, clientNow?: Date) {
  const service = await prisma.service.findUnique({ where: { id: serviceId }});
  if (!service) throw new Error("Услуга не найдена");
  const duration = service.duration;

  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  const now = clientNow ? new Date(clientNow) : new Date();

  const schedule = await prisma.schedule.findFirst({
    where: { tenantId, staffId, dayOfWeek }
  });
  if (!schedule) return [];

  const [startHour, startMin] = schedule.startTime.split(":").map(Number);
  const [endHour, endMin] = schedule.endTime.split(":").map(Number);

  let currentTime = new Date(date);
  currentTime.setHours(startHour, startMin, 0, 0);
  const endTime = new Date(date);
  endTime.setHours(endHour, endMin, 0, 0);

  const bookings = await prisma.booking.findMany({
    where: {
      staffId,
      startTime: { gte: new Date(date.setHours(0,0,0,0)), lte: new Date(date.setHours(23,59,59,999)) },
      status: { not: "CANCELLED" }
    }
  });

  const slots: any[] = [];
  while (currentTime.getTime() + duration * 60000 <= endTime.getTime()) {
    const slotStart = new Date(currentTime);
    const slotEnd = new Date(currentTime.getTime() + duration * 60000);
    
    const isPast = slotStart < now;
    const isBooked = bookings.some((b: any) => (slotStart < b.endTime) && (slotEnd > b.startTime));

    slots.push({
      time: `${slotStart.getHours().toString().padStart(2, '0')}:${slotStart.getMinutes().toString().padStart(2, '0')}`,
      startTime: slotStart,
      isAvailable: !isPast && !isBooked,
      isPast,
      isBooked
    });

    currentTime.setTime(currentTime.getTime() + 30 * 60000);
  }
  return slots;
}

export async function createBooking(data: {
  tenantId: string,
  serviceId: string,
  staffId: string,
  startTime: Date,
  clientName: string,
  clientPhone: string,
  clientEmail?: string,
  password?: string,
  userId?: string | null
}) {
  const service = await prisma.service.findUnique({ where: { id: data.serviceId }});
  if (!service) throw new Error("Услуга не найдена");
  const endTime = new Date(data.startTime.getTime() + service.duration * 60000);

  return await prisma.$transaction(async (tx: any) => {
    // 1. Check for overlap
    const overlap = await tx.booking.findFirst({
      where: {
        staffId: data.staffId,
        status: { not: "CANCELLED" },
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: data.startTime } }
        ]
      }
    });
    if (overlap) throw new Error("Этот слот уже занят");

    // 2. Handle User Account for Client
    let userId = data.userId;
    if (!userId && data.clientEmail && data.password) {
       const bcrypt = await import("bcryptjs");
       const hashedPassword = await bcrypt.hash(data.password, 10);
       
       const existingUser = await tx.user.findUnique({ where: { email: data.clientEmail } });
       if (existingUser) {
          userId = existingUser.id;
       } else {
          const newUser = await tx.user.create({
            data: {
              email: data.clientEmail,
              password: hashedPassword,
              name: data.clientName,
              phoneNumber: data.clientPhone,
              role: "CLIENT"
            }
          });
          userId = newUser.id;
       }
    }

    // 3. CRM Client
    let client = await tx.client.findFirst({
      where: { tenantId: data.tenantId, phone: data.clientPhone }
    });
    if (!client) {
      client = await tx.client.create({
        data: {
          tenantId: data.tenantId,
          name: data.clientName,
          phone: data.clientPhone,
          email: data.clientEmail
        }
      });
    }

    return await tx.booking.create({
      data: {
        tenantId: data.tenantId,
        serviceId: data.serviceId,
        staffId: data.staffId,
        clientId: client.id,
        userId: userId || null,
        startTime: data.startTime,
        endTime: endTime,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        clientEmail: data.clientEmail
      }
    });
  });
}

export async function cancelBooking(bookingId: string, userId: string) {
  const booking = await prisma.booking.findUnique({ 
    where: { id: bookingId },
    include: { tenant: true }
  });
  
  if (!booking || booking.userId !== userId) {
    throw new Error("Нет доступа к записи");
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" }
  });

  // Notify Business via Chat
  await prisma.chatMessage.create({
    data: {
      content: `❌ Запись на ${booking.startTime.toLocaleString()} была отменена клиентом ${booking.clientName}.`,
      senderId: userId,
      tenantId: booking.tenantId,
      senderType: "CLIENT"
    }
  });
}

