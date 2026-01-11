
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Find a video that needs analysis 
    const videos = await prisma.video.findMany({
        where: {
            videoUrl: { contains: 'videodelivery.net' }
        },
        select: { id: true, title: true, analysisStatus: true },
        take: 3
    })

    console.log('Videos to analyze:')
    for (const v of videos) {
        console.log(`  ${v.title}: ${v.analysisStatus}`)
    }

    if (videos.length > 0) {
        const testVideo = videos[0]
        console.log(`\nTriggering analysis for: ${testVideo.title} (${testVideo.id})`)

        // Call the analyze API
        const res = await fetch('http://localhost:3000/api/admin/videos/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'admin_session=test' // This will fail auth, but let's see
            },
            body: JSON.stringify({ videoId: testVideo.id })
        })

        console.log('Response:', res.status, await res.text())
    }
}

main().finally(() => prisma.$disconnect())
