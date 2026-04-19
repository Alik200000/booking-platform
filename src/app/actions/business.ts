"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Создание новой услуги
export async function createService(formData: FormData) {
  const session = await auth();
  if (!session?.user?.tenantId) throw new Error("Не авторизован");

  const name = formData.get("name") as string;
  const duration = parseInt(formData.get("duration") as string);
  const price = parseFloat(formData.get("price") as string);
  const description = formData.get("description") as string;

  if (!name || isNaN(duration) || isNaN(price)) {
    throw new Error("Заполните все обязательные поля корректно");
  }

  await prisma.service.create({
    data: {
      name,
      duration,
      price,
      description,
      tenantId: session.user.tenantId
    }
  });

  // Очищаем кэш Next.js, чтобы новые данные сразу появились
  revalidatePath("/admin/services");
}

// Создание нового мастера с графиком работы по умолчанию
export async function createStaff(formData: FormData) {
  const session = await auth();
  if (!session?.user?.tenantId) throw new Error("Не авторизован");

  const name = formData.get("name") as string;
  if (!name) throw new Error("Имя мастера обязательно");

  // Создаем мастера
  const staff = await prisma.staff.create({
    data: {
      name,
      tenantId: session.user.tenantId
    }
  });

  // Автоматически создаем стандартный график работы (Пн-Пт, с 09:00 до 18:00)
  const defaultSchedules: any[] = [];
  for (let i = 1; i <= 5; i++) {
    defaultSchedules.push({
      dayOfWeek: i,
      startTime: "09:00",
      endTime: "18:00",
      staffId: staff.id,
      tenantId: session.user.tenantId
    });
  }
  
  await prisma.schedule.createMany({ data: defaultSchedules });

  revalidatePath("/admin/staff");
}
