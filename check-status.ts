
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const videos = await prisma.video.findMany({
        take: 3,
        select: { id: true, title: true, analysisStatus: true }
    })
    console.log(JSON.stringify(videos, null, 2))
}

main().finally(() => prisma.$disconnect())
