
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Diagnosing ALL Tags ---')

    const tags = await prisma.videoFaceTag.findMany({
        include: {
            child: true,
            video: true
        }
    })

    console.log(`Total Tags: ${tags.length}`)

    for (const tag of tags) {
        console.log(`[Tag] Video: ${tag.video.title} | Child: ${tag.child?.name || 'NULL'} | Tentative: ${tag.isTentative} | Confidence: ${tag.confidence}`)
    }
}

main()
