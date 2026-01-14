import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const prismaClientOptions = process.env.NODE_ENV === 'development' ? {
    datasources: {
        db: {
            url: process.env.DIRECT_URL || process.env.DATABASE_URL
        },
    },
} : undefined;

if (process.env.NODE_ENV === 'development') {
    console.log('Using DB URL:', (process.env.DIRECT_URL || process.env.DATABASE_URL)?.substring(0, 20) + '...')
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions)
export const prismaFresh = new PrismaClient(prismaClientOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
