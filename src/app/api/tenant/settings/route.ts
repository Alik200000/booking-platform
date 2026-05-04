import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getActiveTenantId } from "@/lib/auth-utils";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  const tenantId = await getActiveTenantId();

  if (!tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      name: true,
      city: true,
      primaryColor: true,
      logoUrl: true,
    },
  });

  return NextResponse.json(tenant);
}
