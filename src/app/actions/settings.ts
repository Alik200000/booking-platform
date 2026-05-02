"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getGlobalSettings() {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") throw new Error("Unauthorized");

  let settings = await prisma.globalSettings.findUnique({
    where: { id: "global" }
  });

  if (!settings) {
    settings = await prisma.globalSettings.create({
      data: { id: "global", platformCommission: 5 }
    });
  }

  return settings;
}

export async function updatePlatformCommission(percentage: number) {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") throw new Error("Unauthorized");

  await prisma.globalSettings.upsert({
    where: { id: "global" },
    update: { platformCommission: percentage },
    create: { id: "global", platformCommission: percentage }
  });

  revalidatePath("/superadmin");
}
