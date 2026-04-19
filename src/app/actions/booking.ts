"use server";

import { prisma } from "@/lib/prisma";

/**
 * Получить список свободных слотов для мастера на конкретную дату.
 * Учитывает график работы мастера и уже существующие записи.
 */
export async function getAvailableSlots(tenantId: string, serviceId: string, staffId: string, dateStr: string) {
  // dateStr format: "YYYY-MM-DD"
  const service = await prisma.service.findUnique({ where: { id: serviceId }});
  if (!service) throw new Error("Услуга не найдена");

  const duration = service.duration;

  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0 - Sunday, 1 - Monday...

  // 1. Получаем расписание работы мастера на этот день
  const schedule = await prisma.schedule.findFirst({
    where: { tenantId, staffId, dayOfWeek }
  });

  if (!schedule) return []; // Выходной

  const [startHour, startMin] = schedule.startTime.split(":").map(Number);
  const [endHour, endMin] = schedule.endTime.split(":").map(Number);

  let currentTime = new Date(date);
  currentTime.setHours(startHour, startMin, 0, 0);

  const endTime = new Date(date);
  endTime.setHours(endHour, endMin, 0, 0);

  // 2. Запрашиваем все бронирования этого мастера на этот день
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const bookings = await prisma.booking.findMany({
    where: {
      staffId,
      startTime: { gte: startOfDay, lte: endOfDay },
      status: { not: "CANCELLED" }
    }
  });

  const slots = [];

  // 3. Вычисляем свободные слоты с шагом 30 минут
  while (currentTime.getTime() + duration * 60000 <= endTime.getTime()) {
    const slotStart = new Date(currentTime);
    const slotEnd = new Date(currentTime.getTime() + duration * 60000);

    // Логика защиты от пересечений (Double Booking Check)
    const isOverlap = bookings.some((b: any) => {
      // Существует пересечение, если НачалоНового < КонецСтарого И КонецНового > НачалоСтарого
      return (slotStart < b.endTime) && (slotEnd > b.startTime);
    });

    if (!isOverlap) {
      slots.push({
        time: `${slotStart.getHours().toString().padStart(2, '0')}:${slotStart.getMinutes().toString().padStart(2, '0')}`,
        startTime: slotStart
      });
    }

    // Смещаем окно времени на 30 минут вперед
    currentTime.setTime(currentTime.getTime() + 30 * 60000);
  }

  return slots;
}

/**
 * Создание новой записи с жесткой транзакционной проверкой пересечений
 */
export async function createBooking(data: {
  tenantId: string,
  serviceId: string,
  staffId: string,
  startTime: Date,
  clientName: string,
  clientPhone: string
}) {
  const service = await prisma.service.findUnique({ where: { id: data.serviceId }});
  if (!service) throw new Error("Услуга не найдена");

  const endTime = new Date(data.startTime.getTime() + service.duration * 60000);

  // --- ЛИМИТЫ ПОДПИСКИ ---
  const subscription = await prisma.subscription.findUnique({ where: { tenantId: data.tenantId } });
  const plan = subscription?.plan || "FREE";
  
  if (plan === "FREE") {
     const currentMonthStart = new Date();
     currentMonthStart.setDate(1);
     currentMonthStart.setHours(0,0,0,0);
     
     const bookingsThisMonth = await prisma.booking.count({
        where: { tenantId: data.tenantId, createdAt: { gte: currentMonthStart } }
     });
     
     if (bookingsThisMonth >= 50) {
        throw new Error("Салон превысил лимит бесплатных записей на этот месяц.");
     }
  }
  // -------------------------

  // Выполняем в транзакции
  const booking = await prisma.$transaction(async (tx: any) => {
    // 1. Проверяем, не занял ли кто-то другой этот слот миллисекунду назад
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

    if (overlap) {
      throw new Error("Извините, этот слот только что был забронирован.");
    }

    // 2. CRM: Ищем или создаем клиента по номеру телефона
    let client = await tx.client.findFirst({
      where: { tenantId: data.tenantId, phone: data.clientPhone }
    });

    if (!client) {
      client = await tx.client.create({
        data: {
          tenantId: data.tenantId,
          name: data.clientName,
          phone: data.clientPhone
        }
      });
    }

    // 3. Создаем запись с привязкой к клиенту
    return await tx.booking.create({
      data: {
        tenantId: data.tenantId,
        serviceId: data.serviceId,
        staffId: data.staffId,
        clientId: client.id,
        startTime: data.startTime,
        endTime: endTime,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
      }
    });
  });

  return booking;
}

export async function cancelBooking(bookingId: string, clientId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  
  if (!booking || booking.clientId !== clientId) {
    throw new Error("Нет доступа к записи");
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" }
  });
}

