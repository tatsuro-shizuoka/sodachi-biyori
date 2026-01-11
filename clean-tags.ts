
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const videoId = 'e12d5ede-95fe-4f26-a2d6-f5363f0468f6'

    console.log(`Cleaning up tags for video ${videoId}`)

    const { count } = await prisma.videoFaceTag.deleteMany({
        where: { videoId }
    })

    console.log(`Deleted ${count} tags.`)
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    })
