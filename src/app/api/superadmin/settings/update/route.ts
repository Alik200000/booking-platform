import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { starter, pro, premium, commission, discount } = body;

    await prisma.globalSettings.upsert({
      where: { id: 'global' },
      update: {
        platformCommission: parseFloat(commission),
        starterPrice: parseFloat(starter),
        proPrice: parseFloat(pro),
        premiumPrice: parseFloat(premium),
        globalDiscount: parseFloat(discount)
      },
      create: {
        id: 'global',
        platformCommission: parseFloat(commission),
        starterPrice: parseFloat(starter),
        proPrice: parseFloat(pro),
        premiumPrice: parseFloat(premium),
        globalDiscount: parseFloat(discount)
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("UPDATE_SETTINGS_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
