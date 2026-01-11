
import { PrismaClient } from '@prisma/client'
import { runFaceSearchForVideos } from '../lib/face-search'

const prisma = new PrismaClient()

async function main() {
    console.log('Running production face search logic...')
    await runFaceSearchForVideos(prisma, console.log)

    // Check results
    const tags = await prisma.videoFaceTag.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10
    })

    console.log('\nRecent VideoFaceTags:')
    tags.forEach(t => {
        console.log(`- Time: ${t.startTime}s, Label: ${t.label}, Conf: ${t.confidence}, Thumb: ${t.thumbnailUrl}`)
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
