import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Always returns the LATEST tenantId from the database for the current user.
 * This bypasses the stale session/JWT data in the browser.
 */
export async function getActiveTenantId() {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    // Check for Shadow Mode (Impersonation) cookie first if Superadmin
    if (session.user.role === "SUPERADMIN") {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const impersonatedId = cookieStore.get("impersonated_tenant_id")?.value;
      if (impersonatedId) return impersonatedId;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true }
    });

    return user?.tenantId || null;
  } catch (error) {
    console.error("getActiveTenantId error:", error);
    return null;
  }
}

