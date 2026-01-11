
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const videos = await prisma.video.findMany({
        select: {
            id: true,
            title: true,
            analysisStatus: true,
            videoUrl: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    })

    console.log('Recent Videos:')
    for (const v of videos) {
        // Extract CF ID
        const cfMatch = v.videoUrl.match(/videodelivery\.net\/([a-zA-Z0-9]+)/)
        const cfId = cfMatch ? cfMatch[1] : 'N/A'
        console.log(`  ${v.title}: ${v.analysisStatus} (CF: ${cfId})`)
    }
}

main().finally(() => prisma.$disconnect())
