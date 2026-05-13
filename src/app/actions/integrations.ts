"use server";

import { prisma } from "@/lib/prisma";
import { getActiveTenantId } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function updateTelegramSettings(formData: FormData) {
  const tenantId = await getActiveTenantId();
  if (!tenantId) throw new Error("Unauthorized");

  const telegramChatId = formData.get("telegramChatId") as string;

  await prisma.tenant.update({
    where: { id: tenantId as string },
    data: { telegramChatId }
  });

  revalidatePath("/admin/integrations");
}
