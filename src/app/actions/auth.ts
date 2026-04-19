"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function registerBusiness(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !slug || !email || !password) {
    return { error: "Все поля обязательны" };
  }

  try {
    const existingSlug = await prisma.tenant.findUnique({ where: { slug } });
    if (existingSlug) return { error: "Этот короткий URL уже занят другим бизнесом" };

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { error: "Пользователь с таким email уже существует" };

    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем салон и его владельца в рамках одной транзакции
    await prisma.$transaction(async (tx: any) => {
      const tenant = await tx.tenant.create({
        data: { name, slug }
      });

      await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: `Владелец ${name}`,
          role: "OWNER",
          tenantId: tenant.id
        }
      });
    });

  } catch (e) {
    console.error(e);
    return { error: "Внутренняя ошибка сервера" };
  }

  // Успешно создали - отправляем логиниться
  redirect("/login");
}
