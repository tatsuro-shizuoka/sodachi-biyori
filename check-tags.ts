
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const videoId = 'e12d5ede-95fe-4f26-a2d6-f5363f0468f6'

    const tags = await prisma.videoFaceTag.findMany({
        where: { videoId }
    })

    console.log(`Found ${tags.length} tags for video ${videoId}`)
    console.log(JSON.stringify(tags, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
