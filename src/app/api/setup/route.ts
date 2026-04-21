import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  const email = "admin@salonix.kz";
  const password = "admin123";
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if tenant exists
  let tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: "Salonix",
        slug: "salonix",
      }
    });
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "SUPERADMIN",
    },
    create: {
      email,
      name: "Administrator",
      password: hashedPassword,
      role: "SUPERADMIN",
      tenantId: tenant.id
    },
  });

  return NextResponse.json({ 
    message: "User updated successfully", 
    email: user.email,
    newPassword: password,
    hint: "Now you can login with this email and password"
  });
}
