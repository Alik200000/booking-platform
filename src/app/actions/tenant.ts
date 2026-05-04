"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

import { getActiveTenantId } from "@/lib/auth-utils";

export async function updateTenantAppearance(data: { name?: string, city?: string, primaryColor?: string, logoUrl?: string }) {
  const session = await auth();
  const tenantId = await getActiveTenantId();
  if (!tenantId) {
    throw new Error("Unauthorized");
  }

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      name: data.name,
      city: data.city,
      primaryColor: data.primaryColor,
      logoUrl: data.logoUrl,
    },
  });

  revalidatePath("/admin/appearance");
  revalidatePath("/[tenantSlug]", "page");
  
  return { success: true };
}
