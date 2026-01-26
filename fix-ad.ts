
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- FIXING PREROLL AD ---')
    // Find the active preroll ad
    const ad = await prisma.prerollAd.findFirst({
        where: { isActive: true },
        orderBy: { priority: 'desc' }
    })

    if (!ad) {
        console.log('No active preroll ad found!')
        return
    }

    console.log(`Updating Ad ID: ${ad.id}`)
    console.log(`Old URL: ${ad.videoUrl}`)

    // Update to a working sample video (Big Buck Bunny)
    const newUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

    await prisma.prerollAd.update({
        where: { id: ad.id },
        data: { videoUrl: newUrl }
    })

    console.log(`New URL: ${newUrl}`)
    console.log('Update Complete.')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
