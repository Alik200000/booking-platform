import { prisma } from "@/lib/prisma";
import SuperadminPlansClient from "@/components/SuperadminPlansClient";

export default async function PlansManagementPage() {
  let settings = {
    starterPrice: 15000,
    proPrice: 25000,
    premiumPrice: 45000,
    globalDiscount: 0,
    platformCommission: 5
  };

  try {
    const dbSettings = await prisma.globalSettings.findUnique({ where: { id: 'global' } });
    if (dbSettings) {
      settings = dbSettings as any;
    }
  } catch (e) {
    console.error("Failed to fetch settings:", e);
  }

  return <SuperadminPlansClient settings={settings} />;
}
