import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from 'pg';
import { PrismaClient } from "./generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;

// Clever Cloud has limited connections - use connection pooling
// For serverless/edge: Use Prisma Accelerate or PgBouncer
const pool = new Pool({
  connectionString,
  max: 3, // Moderate pool size
  min: 1, // Keep at least 1 idle connection
  idleTimeoutMillis: 60000, // Close idle clients after 60 seconds
  connectionTimeoutMillis: 10000, // Timeout after 10 seconds
  maxUses: 7500, // Close and replace a connection after it's been used 7500 times
});

// Create the adapter with the pool
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: adapter,
    log: ["error", "warn"],
  });

// Handle connection cleanup
const cleanup = async () => {
  try {
    console.log('Cleaning up database connections...');
    await prisma.$disconnect();
    await pool.end();
    console.log('Database connections closed successfully');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};

// Register cleanup on exit
if (process.env.NODE_ENV !== 'test') {
  process.on('beforeExit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

// Prevent hot reload from creating new instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;