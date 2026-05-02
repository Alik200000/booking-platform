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

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { success: true }; 

  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const expiry = new Date(Date.now() + 3600000); // 1 час

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expiry }
  });

  // Логируем ссылку в ActivityLog для отладки/помощи админа
  if (user.tenantId) {
     await prisma.activityLog.create({
        data: {
           tenantId: user.tenantId,
           tenantName: user.name,
           action: "PASSWORD_RESET_REQUESTED",
           details: `Reset link requested for ${email}`
        }
     });
  }

  console.log(`RESET LINK FOR ${email}: /reset-password?token=${token}`);
  return { success: true };
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findUnique({
    where: { resetToken: token }
  });

  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return { error: "Ссылка устарела или неверна" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    }
  });

  return { success: true };
}
