import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL is not set. Database features will be unavailable.");
}

// Prisma 7 требует адаптера. Инициализируем только если есть URL.
const getPrisma = () => {
  if (!process.env.DATABASE_URL) return new PrismaClient();
  
  try {
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  } catch (error) {
    console.error("Failed to initialize Prisma with adapter:", error);
    return new PrismaClient();
  }
};

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || getPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

