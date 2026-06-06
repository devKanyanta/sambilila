import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from 'pg';
import { PrismaClient } from "./generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;

type PrismaLike = PrismaClient & {
  subscription?: { findFirst?: unknown }
  usageRecord?: { count?: unknown }
  billingPlan?: { findMany?: unknown }
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaLike
  prismaPool?: Pool
  prismaCleanupRegistered?: boolean
}

function createPool() {
  // Clever Cloud has limited connections - use connection pooling
  // For serverless/edge: Use Prisma Accelerate or PgBouncer
  return new Pool({
    connectionString,
    max: 3,
    min: 1,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000,
    maxUses: 7500,
  })
}

function createPrismaClient(pool: Pool) {
  const adapter = new PrismaPg(pool)
  return new PrismaClient({
    adapter,
    log: ["error", "warn"],
  }) as PrismaLike
}

function hasRequiredDelegates(client: PrismaLike | undefined): client is PrismaLike {
  if (!client) return false
  return Boolean(
    client.subscription?.findFirst &&
    client.usageRecord?.count &&
    client.billingPlan?.findMany
  )
}

let prisma: PrismaLike
let pool: Pool

if (hasRequiredDelegates(globalForPrisma.prisma) && globalForPrisma.prismaPool) {
  prisma = globalForPrisma.prisma
  pool = globalForPrisma.prismaPool
} else {
  // If HMR reused a stale client (missing newly added model delegates),
  // recreate both pool and client so subscription APIs keep working.
  if (globalForPrisma.prisma) {
    void globalForPrisma.prisma.$disconnect().catch(() => undefined)
  }
  if (globalForPrisma.prismaPool) {
    void globalForPrisma.prismaPool.end().catch(() => undefined)
  }

  pool = createPool()
  prisma = createPrismaClient(pool)
}

export { prisma }

const cleanup = async () => {
  try {
    console.log('Cleaning up database connections...')
    await prisma.$disconnect()
    await pool.end()
    console.log('Database connections closed successfully')
  } catch (error) {
    console.error('Error during cleanup:', error)
  }
}

if (process.env.NODE_ENV !== 'test' && !globalForPrisma.prismaCleanupRegistered) {
  process.on('beforeExit', cleanup)
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
  globalForPrisma.prismaCleanupRegistered = true
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.prismaPool = pool
}

export default prisma;