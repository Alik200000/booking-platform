"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateTenantAppearance(data: { primaryColor?: string, logoUrl?: string }) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    throw new Error("Unauthorized");
  }

  const tenantId = session.user.tenantId;

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      primaryColor: data.primaryColor,
      logoUrl: data.logoUrl,
    },
  });

  revalidatePath("/admin/appearance");
  revalidatePath("/[tenantSlug]", "page");
  
  return { success: true };
}
