
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const prerollCount = await prisma.prerollAd.count()
    const sponsorCount = await prisma.sponsor.count()
    const viewCount = await prisma.videoView.count()
    const midrollCount = await prisma.midrollAd.count()

    console.log('--- Database Counts ---')
    console.log(`Preroll Ads: ${prerollCount}`)
    console.log(`Midroll Ads: ${midrollCount}`)
    console.log(`Sponsors: ${sponsorCount}`)
    console.log(`Video Views: ${viewCount}`)

    // Also check for active ones
    const activePreroll = await prisma.prerollAd.count({ where: { isActive: true } })
    console.log(`Active Preroll Ads: ${activePreroll}`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
