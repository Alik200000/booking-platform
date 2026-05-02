"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Plan } from "@prisma/client";

export async function logActivity(tenantId: string | null, tenantName: string | null, action: string, details?: string) {
  await prisma.activityLog.create({
    data: { tenantId, tenantName, action, details }
  });
}

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

export async function updateTenantSlug(id: string, newSlug: string) {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") throw new Error("Unauthorized");

  const existing = await prisma.tenant.findUnique({ where: { slug: newSlug } });
  if (existing && existing.id !== id) throw new Error("Этот URL уже занят");

  const tenant = await prisma.tenant.update({
    where: { id },
    data: { slug: newSlug }
  });

  await logActivity(id, tenant.name, "UPDATE", `Изменен URL на /${newSlug}`);
  revalidatePath("/superadmin");
  return { success: true };
}

export async function deleteTenant(tenantId: string) {
  const session = await auth();
  
  // Only SUPERADMIN can delete tenants
  if (session?.user?.role !== "SUPERADMIN") {
    throw new Error("Unauthorized: Only superadmins can delete businesses");
  }

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
    throw new Error("Failed to delete business.");
  }
}

export async function toggleTenantSuspension(tenantId: string) {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") throw new Error("Unauthorized");

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new Error("Tenant not found");

  const newStatus = !tenant.isSuspended;
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { isSuspended: newStatus }
  });

  await logActivity(tenantId, tenant.name, "SUSPENSION_TOGGLE", `New status: ${newStatus ? "Suspended" : "Active"}`);
  revalidatePath("/superadmin");
  return { success: true, isSuspended: newStatus };
}

export async function updateTenantPlan(tenantId: string, plan: Plan) {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") throw new Error("Unauthorized");

  const tenant = await prisma.tenant.findUnique({ 
    where: { id: tenantId },
    include: { subscription: true }
  });
  if (!tenant) throw new Error("Tenant not found");

  if (tenant.subscription) {
    await prisma.subscription.update({
      where: { id: tenant.subscription.id },
      data: { plan, validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }
    });
  } else {
    await prisma.subscription.create({
      data: {
        tenantId,
        plan,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    });
  }

  await logActivity(tenantId, tenant.name, "PLAN_CHANGE", `Manually changed to ${plan}`);
  revalidatePath("/superadmin");
  return { success: true };
}

export async function sendChatMessage(tenantId: string, content: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.chatMessage.create({
    data: {
      content,
      senderId: session.user.id,
      tenantId,
      senderType: session.user.role === 'SUPERADMIN' ? 'SUPERADMIN' : 'OWNER'
    }
  });

  revalidatePath("/admin/messages");
  revalidatePath("/superadmin/tenants");
  return { success: true };
}

export async function resetUserPassword(tenantId: string) {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") throw new Error("Unauthorized");

  const hashedPassword = await import("bcryptjs").then(b => b.hash("reset123", 10));

  await prisma.user.updateMany({
    where: { tenantId },
    data: { password: hashedPassword }
  });

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  await logActivity(tenantId, tenant?.name || "Unknown", "PASSWORD_RESET", "Password reset to 'reset123' by superadmin");

  return { success: true, newPassword: "reset123" };
}
