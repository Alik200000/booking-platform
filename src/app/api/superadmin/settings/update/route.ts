import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      starterPrice, starterDescription, starterFeatures,
      proPrice, proDescription, proFeatures,
      premiumPrice, premiumDescription, premiumFeatures,
      commission, discount,
      kaspiPhone, kaspiRecipient
    } = body;

    await prisma.globalSettings.upsert({
      where: { id: "global" },
      update: {
        starterPrice, starterDescription, starterFeatures,
        proPrice, proDescription, proFeatures,
        premiumPrice, premiumDescription, premiumFeatures,
        platformCommission: commission,
        globalDiscount: discount,
        kaspiPhone,
        kaspiRecipient
      },
      create: {
        id: "global",
        starterPrice, starterDescription, starterFeatures,
        proPrice, proDescription, proFeatures,
        premiumPrice, premiumDescription, premiumFeatures,
        platformCommission: commission,
        globalDiscount: discount,
        kaspiPhone,
        kaspiRecipient
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("UPDATE_SETTINGS_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
