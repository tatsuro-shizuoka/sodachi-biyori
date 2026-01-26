
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding Ads...')

    // 1. Create/Ensure a Sponsor exists
    let sponsor = await prisma.sponsor.findFirst({ where: { name: 'Sodachi Kids' } })
    if (!sponsor) {
        sponsor = await prisma.sponsor.create({
            data: {
                name: 'Sodachi Kids',
                position: 'footer', // Standard footer sponsor
                imageUrl: 'https://picsum.photos/400/100', // Mock image
                linkUrl: 'https://google.com',
                isActive: true
            }
        })
        console.log('Created Sponsor:', sponsor.id)
    }

    // 2. Create a "Pop" Sponsor
    let popSponsor = await prisma.sponsor.findFirst({ where: { name: 'Pop Event' } })
    if (!popSponsor) {
        popSponsor = await prisma.sponsor.create({
            data: {
                name: 'Pop Event',
                position: 'pop', // Specific 'pop' position
                imageUrl: 'https://picsum.photos/300/300',
                linkUrl: 'https://google.com',
                isActive: true
            }
        })
        console.log('Created Pop Sponsor:', popSponsor.id)
    }

    // 3. Create a Preroll Ad linked to the sponsor
    const existingPreroll = await prisma.prerollAd.findFirst()
    if (!existingPreroll) {
        const preroll = await prisma.prerollAd.create({
            data: {
                name: 'Spring Campaign',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', // Real video URL
                thumbnailUrl: 'https://picsum.photos/800/450',
                sponsorId: sponsor.id,
                isActive: true,
                priority: 10
            }
        })
        console.log('Created Preroll Ad:', preroll.id)
    } else {
        console.log('Preroll Ad already exists:', existingPreroll.id)
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
