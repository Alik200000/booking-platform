"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function impersonateTenant(tenantId: string | null) {
  const session = await auth();
  
  if (session?.user?.role !== "SUPERADMIN") {
    throw new Error("Unauthorized");
  }

  // Update the superadmin user's tenantId to the target tenant
  await prisma.user.update({
    where: { id: session.user.id },
    data: { tenantId }
  });

  revalidatePath("/");
  return { success: true };
}

export async function deleteTenant(tenantId: string) {
  const session = await auth();
  
  // Only SUPERADMIN can delete tenants
  if (session?.user?.role !== "SUPERADMIN") {
    throw new Error("Unauthorized: Only superadmins can delete businesses");
  }

  console.log(`SUPERADMIN: Deleting tenant ${tenantId}`);

  try {
    // Perform deletion in a transaction to ensure all related data is cleaned up
    await prisma.$transaction([
      prisma.booking.deleteMany({ where: { tenantId } }),
      prisma.staff.deleteMany({ where: { tenantId } }),
      prisma.service.deleteMany({ where: { tenantId } }),
      prisma.client.deleteMany({ where: { tenantId } }),
      prisma.schedule.deleteMany({ where: { tenantId } }),
      prisma.user.deleteMany({ where: { tenantId, role: { not: "SUPERADMIN" } } }),
      prisma.subscription.deleteMany({ where: { tenantId } }),
      prisma.tenant.delete({ where: { id: tenantId } }),
    ]);

    revalidatePath("/superadmin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete tenant:", error);
    throw new Error("Failed to delete business. Make sure all constraints are handled.");
  }
}
