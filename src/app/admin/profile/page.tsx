import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileClient from "@/components/ProfileClient";
import { getActiveTenantId } from "@/lib/auth-utils";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tenantId = await getActiveTenantId();
  if (!tenantId) redirect("/login");

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      schedules: {
        where: { staffId: null }, // Global tenant schedule
        orderBy: { dayOfWeek: "asc" }
      }
    }
  });

  if (!tenant) redirect("/login");

  return <ProfileClient session={session} tenant={tenant} />;
}
