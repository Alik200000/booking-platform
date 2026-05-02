"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function addStaff(name: string, commissionPercentage: number = 0) {
  const session = await auth();
  if (!session?.user?.tenantId) throw new Error("Unauthorized");

  const staff = await prisma.staff.create({
    data: {
      name,
      tenantId: session.user.tenantId,
      commissionPercentage,
    }
  });

  revalidatePath("/admin/staff");
  return staff;
}

export async function updateStaffCommission(staffId: string, commissionPercentage: number) {
  const session = await auth();
  if (!session?.user?.tenantId) throw new Error("Unauthorized");

  await prisma.staff.update({
    where: { id: staffId, tenantId: session.user.tenantId },
    data: { commissionPercentage }
  });

  revalidatePath("/admin/staff");
}

export async function getStaffSchedule(staffId: string) {
  const session = await auth();
  if (!session?.user?.tenantId) throw new Error("Unauthorized");

  const schedules = await prisma.schedule.findMany({
    where: { staffId, tenantId: session.user.tenantId }
  });

  return schedules;
}

export async function updateStaffSchedule(staffId: string, schedules: { dayOfWeek: number, startTime: string, endTime: string, isActive: boolean }[]) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    throw new Error("Unauthorized");
  }

  const tenantId = session.user.tenantId;

  // 1. Delete existing schedules for this staff
  await prisma.schedule.deleteMany({
    where: { staffId, tenantId }
  });

  // 2. Create new active schedules
  const activeSchedules = schedules
    .filter(s => s.isActive)
    .map(s => ({
      tenantId,
      staffId,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime
    }));

  if (activeSchedules.length > 0) {
    await prisma.schedule.createMany({
      data: activeSchedules
    });
  }

  revalidatePath("/admin/staff");
  revalidatePath(`/admin/staff/${staffId}/schedule`);
  
  return { success: true };
}
