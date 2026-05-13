import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { name, image } = body;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name, image }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("UPDATE_PROFILE_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
