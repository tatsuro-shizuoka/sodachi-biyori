
import { PrismaClient } from '@prisma/client'
import { runFaceSearchForVideos } from '../lib/face-search'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Force Analyze Video "a" ---')

    // 1. Get Video
    const video = await prisma.video.findFirst({
        where: { title: 'a' }
    })

    if (!video) {
        console.error('Video "a" not found')
        return
    }

    console.log(`Analyzing Video: ${video.id} (${video.title})`)

    // Reset status to 'pending' to allow re-run (or just run the function directly which ignores status if we call it)
    await prisma.video.update({
        where: { id: video.id },
        data: { analysisStatus: 'pending' }
    })

    // Call the library function
    // We need to Mock the logger or just let it log to console
    await runFaceSearchForVideos(prisma, console.log)

    console.log('--- Analysis Done ---')
}

main()
