
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding Video Views...')

    const videos = await prisma.video.findMany()
    const guardians = await prisma.guardian.findMany()

    if (videos.length === 0) {
        console.log('No videos found to seed views for.')
        return
    }

    if (guardians.length === 0) {
        console.log('No guardians found. Creating anonymous views.')
    }

    let totalViews = 0

    for (const video of videos) {
        // Generate random number of views (between 5 and 30)
        const viewCount = Math.floor(Math.random() * 25) + 5

        console.log(`Generating ${viewCount} views for video: ${video.title}`)

        for (let i = 0; i < viewCount; i++) {
            const randomGuardian = guardians.length > 0
                ? guardians[Math.floor(Math.random() * guardians.length)]
                : null

            await prisma.videoView.create({
                data: {
                    videoId: video.id,
                    guardianId: randomGuardian ? randomGuardian.id : undefined,
                    viewedAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7)), // Random time in last 7 days
                    durationSec: Math.floor(Math.random() * 60) + 10,
                    deviceType: Math.random() > 0.5 ? 'ios' : 'android'
                }
            })
        }
        totalViews += viewCount
    }

    console.log(`Successfully created ${totalViews} video views.`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
