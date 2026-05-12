"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getActiveTenantId } from "@/lib/auth-utils";
import { auth } from "@/auth";

export async function submitComplaint(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const tenantId = await getActiveTenantId();
  if (!tenantId) throw new Error("Tenant not found");

  const subject = formData.get("subject") as string;
  const content = formData.get("content") as string;

  if (!subject || !content) throw new Error("Subject and content are required");

  await prisma.complaint.create({
    data: {
      subject,
      content,
      tenantId: tenantId as string,
      status: "PENDING"
    }
  });

  revalidatePath("/admin/complaints");
}

export async function updateComplaintStatus(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  const status = formData.get("status") as any;

  await prisma.complaint.update({
    where: { id },
    data: { status }
  });

  revalidatePath("/superadmin/complaints");
}
