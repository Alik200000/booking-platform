"use server";

import { prisma } from "@/lib/prisma";
import { getActiveTenantId } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function createServiceCategory(name: string) {
  const tenantId = await getActiveTenantId();
  if (!tenantId) throw new Error("Not authenticated");

  await prisma.serviceCategory.create({
    data: {
      name,
      tenantId
    }
  });

  revalidatePath("/admin/services");
  return { success: true };
}

export async function deleteServiceCategory(id: string) {
  const tenantId = await getActiveTenantId();
  if (!tenantId) throw new Error("Not authenticated");

  // Services linked to this category will have categoryId set to NULL (onDelete: SetNull)
  await prisma.serviceCategory.delete({
    where: { id, tenantId }
  });

  revalidatePath("/admin/services");
  return { success: true };
}
