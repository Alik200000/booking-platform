import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getActiveTenantId } from "@/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const tenantId = await getActiveTenantId();
    if (!tenantId) return new NextResponse("No tenant ID", { status: 400 });

    const body = await req.json();
    const { name, logoUrl, startTime, endTime } = body;

    // Update tenant info
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name,
        logoUrl: logoUrl || null
      }
    });

    // Update global schedules (where staffId is null)
    // We delete old global schedules and create new ones for all days
    await prisma.schedule.deleteMany({
      where: { tenantId, staffId: null }
    });

    const days = [0, 1, 2, 3, 4, 5, 6];
    await prisma.schedule.createMany({
      data: days.map(day => ({
        tenantId,
        dayOfWeek: day,
        startTime,
        endTime,
        staffId: null
      }))
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("UPDATE_TENANT_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
