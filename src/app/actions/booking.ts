"use server";

import { prisma } from "@/lib/prisma";

/**
 * Получить текущее время в конкретном часовом поясе.
 */
function getNowInTimezone(timezone: string) {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: timezone }));
}

/**
 * Получить список свободных слотов для мастера на конкретную дату.
 */
export async function getAvailableSlots(tenantId: string, serviceId: string, staffId: string, dateStr: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new Error("Tenant not found");
  
  const timezone = tenant.timezone || "Asia/Almaty";
  const nowInTenantTZ = getNowInTimezone(timezone);

  const service = await prisma.service.findUnique({ where: { id: serviceId }});
  if (!service) throw new Error("Услуга не найдена");
  const duration = service.duration;

  // Парсим выбранную дату (в формате YYYY-MM-DD)
  const [year, month, day] = dateStr.split("-").map(Number);
  const selectedDate = new Date(year, month - 1, day);
  const dayOfWeek = selectedDate.getDay();

  const schedule = await prisma.schedule.findFirst({
    where: { tenantId, staffId, dayOfWeek }
  });
  if (!schedule) return [];

  const [startHour, startMin] = schedule.startTime.split(":").map(Number);
  const [endHour, endMin] = schedule.endTime.split(":").map(Number);

  let currentTime = new Date(selectedDate);
  currentTime.setHours(startHour, startMin, 0, 0);
  
  const closingTime = new Date(selectedDate);
  closingTime.setHours(endHour, endMin, 0, 0);

  // Получаем существующие записи на этот день
  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0,0,0,0);
  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23,59,59,999);

  const bookings = await prisma.booking.findMany({
    where: {
      staffId,
      status: { not: "CANCELLED" },
      startTime: { gte: startOfDay, lte: endOfDay }
    }
  });

  const slots: any[] = [];
  
  // Генерируем слоты с шагом 30 минут
  while (currentTime.getTime() + duration * 60000 <= closingTime.getTime()) {
    const slotStart = new Date(currentTime);
    const slotEnd = new Date(currentTime.getTime() + duration * 60000);
    
    // ПРОВЕРКА 1: Не прошло ли это время уже (в часовом поясе бизнеса)
    const isPast = slotStart.getTime() <= nowInTenantTZ.getTime();

    // ПРОВЕРКА 2: Не занят ли мастер (проверка пересечений)
    const isBooked = bookings.some((b: any) => {
      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();
      return (slotStart.getTime() < bEnd) && (slotEnd.getTime() > bStart);
    });

    // Добавляем только те слоты, которые НЕ заняты и НЕ в прошлом
    if (!isBooked && !isPast) {
      slots.push({
        time: slotStart.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false }),
        startTime: slotStart.toISOString()
      });
    }

    // Шаг сетки (30 минут)
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
    // ЖЕСТКАЯ ПРОВЕРКА ПЕРЕД СОЗДАНИЕМ (Защита от Double Booking)
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
    
    if (overlap) throw new Error("Извините, это время только что было занято другим клиентом.");

    // Обработка пользователя и CRM клиента...
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
  
  if (!booking || (booking.userId !== userId && userId !== "SUPERADMIN")) {
    throw new Error("Нет доступа к записи");
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" }
  });

  await prisma.chatMessage.create({
    data: {
      content: `❌ Запись на ${booking.startTime.toLocaleString()} была отменена.`,
      senderId: userId,
      tenantId: booking.tenantId,
      senderType: "CLIENT"
    }
  });
}
