"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

import { getActiveTenantId } from "@/lib/auth-utils";

export async function getAdvancedAnalytics() {
  const session = await auth();
  const tenantId = await getActiveTenantId();
  if (!tenantId) {
    throw new Error("Unauthorized");
  }

  // 1. Get all confirmed bookings with services and staff
  const bookings = await prisma.booking.findMany({
    where: {
      tenantId,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    include: {
      service: true,
      staff: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  // 2. Aggregate Data
  const totalRevenue = bookings.reduce((sum, b) => sum + b.service.price, 0);
  const totalBookings = bookings.length;
  const averageCheck = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  // 3. Revenue by Day (last 7 days for the chart)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const revenueByDay = last7Days.map(date => {
    const dayRevenue = bookings
      .filter(b => {
        const bDate = new Date(b.startTime);
        return (
          bDate.getDate() === date.getDate() &&
          bDate.getMonth() === date.getMonth() &&
          bDate.getFullYear() === date.getFullYear()
        );
      })
      .reduce((sum, b) => sum + b.service.price, 0);

    return {
      date: date.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric" }),
      value: dayRevenue,
    };
  });

  // 4. Service Distribution
  const serviceStats: Record<string, { name: string; count: number; revenue: number }> = {};
  bookings.forEach(b => {
    if (!serviceStats[b.service.id]) {
      serviceStats[b.service.id] = { name: b.service.name, count: 0, revenue: 0 };
    }
    serviceStats[b.service.id].count += 1;
    serviceStats[b.service.id].revenue += b.service.price;
  });

  const topServices = Object.values(serviceStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // 5. Staff Performance
  const staffStats: Record<string, { name: string; bookings: number; revenue: number }> = {};
  bookings.forEach(b => {
    if (!staffStats[b.staff.id]) {
      staffStats[b.staff.id] = { name: b.staff.name, bookings: 0, revenue: 0 };
    }
    staffStats[b.staff.id].bookings += 1;
    staffStats[b.staff.id].revenue += b.service.price;
  });

  const staffPerformance = Object.values(staffStats)
    .sort((a, b) => b.revenue - a.revenue);

  // 6. Calculate Trends (comparing last 7 days vs previous 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const currentPeriodBookings = bookings.filter(b => new Date(b.startTime) >= sevenDaysAgo);
  const previousPeriodBookings = bookings.filter(b => {
    const d = new Date(b.startTime);
    return d >= fourteenDaysAgo && d < sevenDaysAgo;
  });

  const currentRevenue = currentPeriodBookings.reduce((sum, b) => sum + b.service.price, 0);
  const previousRevenue = previousPeriodBookings.reduce((sum, b) => sum + b.service.price, 0);

  const revenueTrend = previousRevenue === 0 ? 100 : ((currentRevenue - previousRevenue) / previousRevenue) * 100;
  const bookingTrend = previousPeriodBookings.length === 0 ? 100 : ((currentPeriodBookings.length - previousPeriodBookings.length) / previousPeriodBookings.length) * 100;

  return {
    summary: {
      totalRevenue,
      totalBookings,
      averageCheck,
      revenueTrend,
      bookingTrend,
    },
    revenueByDay,
    topServices,
    staffPerformance,
  };
}
