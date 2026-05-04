"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function registerBusiness(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const city = formData.get("city") as string || "Алматы";

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
        data: { name, slug, city }
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

  // ОТПРАВКА РЕАЛЬНОГО EMAIL ЧЕРЕЗ RESEND
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Zeno Platform <onboarding@resend.dev>', // На бесплатном тарифе Resend только этот адрес или ваш подтвержденный домен
      to: email,
      subject: 'Сброс пароля Zeno',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 20px;">
          <h1 style="color: #1d1d1f; font-size: 24px; font-weight: 800; text-align: center;">Восстановление доступа</h1>
          <p style="color: #86868b; font-size: 16px; line-height: 1.5; text-align: center;">Мы получили запрос на сброс пароля для вашего аккаунта в Zeno Platform.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/reset-password?token=${token}" 
               style="background-color: #0071e3; color: white; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: 600; display: inline-block;">
               Обновить пароль
            </a>
          </div>
          <p style="color: #86868b; font-size: 12px; text-align: center; margin-top: 40px;">
            Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.<br>
            Ссылка действительна в течение 1 часа.
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    // Продолжаем выполнение, так как ссылка уже сохранена и доступна в Activity Log
  }

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
