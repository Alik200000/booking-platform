"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createSystemMessage(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const type = formData.get("type") as string;
  const targetTenantId = formData.get("targetTenantId") as string;

  await prisma.systemMessage.create({
    data: {
      title,
      content,
      type,
      targetTenantId: targetTenantId === "ALL" ? null : targetTenantId,
      isActive: true
    }
  });

  revalidatePath("/superadmin/notifications");
}

export async function toggleSystemMessage(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  const isActive = formData.get("isActive") === "true";

  await prisma.systemMessage.update({
    where: { id },
    data: { isActive: !isActive }
  });

  revalidatePath("/superadmin/notifications");
}

export async function deleteSystemMessage(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") throw new Error("Unauthorized");

  const id = formData.get("id") as string;

  await prisma.systemMessage.delete({
    where: { id }
  });

  revalidatePath("/superadmin/notifications");
}
