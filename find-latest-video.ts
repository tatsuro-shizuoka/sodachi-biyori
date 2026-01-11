
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const lastVideo = await prisma.video.findFirst({
        orderBy: { createdAt: 'desc' }
    })

    if (lastVideo) {
        console.log(`Found Latest Video:`)
        console.log(`ID: ${lastVideo.id}`)
        console.log(`Title: ${lastVideo.title}`)
        console.log(`URL: ${lastVideo.videoUrl}`)
    } else {
        console.log('No videos found in DB')
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    })
