
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('1. Connecting to DB...')
    try {
        const count = await prisma.video.count()
        console.log(`   Success. Total videos: ${count}`)
    } catch (e) {
        console.error('   Failed to connect/count videos:', e)
        return
    }

    console.log('2. Checking VideoFaceTag model access...')
    try {
        // This will fail if the client is stale and doesn't know about VideoFaceTag
        const tagCount = await prisma.videoFaceTag.count()
        console.log(`   Success. Total face tags: ${tagCount}`)
    } catch (e) {
        console.error('   FAILED. Prisma Client does not recognize VideoFaceTag?', e)
    }

    console.log('3. Listing first 3 videos...')
    const videos = await prisma.video.findMany({ take: 3 })
    for (const v of videos) {
        console.log(`   - [${v.id}] ${v.title} (Status: ${v.status})`)
    }

    if (videos.length > 0) {
        console.log(`4. Attempting to delete video ${videos[0].id} via transaction...`)
        try {
            await prisma.$transaction(async (tx) => {
                // Replicating the API logic
                await tx.favorite.deleteMany({ where: { videoId: videos[0].id } })
                await tx.videoView.deleteMany({ where: { videoId: videos[0].id } })
                await tx.reactionLog.deleteMany({ where: { videoId: videos[0].id } })
                await tx.videoFaceTag.deleteMany({ where: { videoId: videos[0].id } })
                await tx.video.delete({ where: { id: videos[0].id } })
            })
            console.log('   Success! Transaction delete worked.')
        } catch (e) {
            console.error('   FAILED to delete:', e)
        }
    } else {
        console.log('4. Skipping delete test (no videos)')
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
