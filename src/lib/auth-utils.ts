import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Always returns the LATEST tenantId from the database for the current user.
 * This bypasses the stale session/JWT data in the browser.
 */
export async function getActiveTenantId() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tenantId: true }
  });

  return user?.tenantId || null;
}
