"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateAppearance(formData: FormData) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Не авторизован" };

  const primaryColor = formData.get("primaryColor") as string;
  const logoUrl = formData.get("logoUrl") as string;

  try {
    await prisma.tenant.update({
      where: { id: session.user.tenantId },
      data: {
        primaryColor,
        logoUrl,
      },
    });

    revalidatePath("/admin/appearance");
    revalidatePath("/[tenantSlug]", "page");
    return { success: true };
  } catch (error: any) {
    return { error: "Ошибка при сохранении внешнего вида" };
  }
}
