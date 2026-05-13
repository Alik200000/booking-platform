import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SuperadminProfileClient from "@/components/SuperadminProfileClient";

export default async function SuperadminProfilePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPERADMIN") redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) redirect("/login");

  return <SuperadminProfileClient user={user} />;
}
