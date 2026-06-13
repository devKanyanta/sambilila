import { PrismaClient } from '@/lib/generated/prisma/client'
import { prisma } from '@/lib/db'

type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
type UserDeleteClient = PrismaClient | PrismaTransaction

export async function deleteUserWithDependents(userId: string, client: UserDeleteClient = prisma) {
  await client.quizJob.deleteMany({
    where: { userId },
  })

  await client.flashcardJob.deleteMany({
    where: { userId },
  })

  await client.user.delete({
    where: { id: userId },
  })
}
