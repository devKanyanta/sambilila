// lib/db.ts - Alternative version with adapter
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from 'pg';

// Use Prisma's recommended approach for connection pooling
const connectionString = process.env.DATABASE_URL!;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(new Pool({ 
      connectionString,
      // Keep these settings minimal
      max: 3, // Reduced for Clever Cloud's limits
      idleTimeoutMillis: 30000,
    })),
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;