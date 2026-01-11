
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const videoId = 'c71302ed-ec99-45db-b16b-a5200fc50e18'

    console.log(`Fetching video: ${videoId}`)
    const video = await prisma.video.findUnique({
        where: { id: videoId }
    })

    if (!video) {
        console.error('Video not found in DB')
        return
    }

    console.log(`Video found: ${video.title}`)
    console.log('Injecting sample AI data for UI verification...')

    // Mock Face Data with Thumbnails
    const mockFaces = [
        { label: 'Person 1', startTime: 2.0, endTime: 5.0, confidence: 0.95, thumb: 'https://i.pravatar.cc/150?img=11' },
        { label: 'Person 1', startTime: 10.0, endTime: 15.0, confidence: 0.92, thumb: 'https://i.pravatar.cc/150?img=11' },
        { label: 'Person 2', startTime: 5.0, endTime: 8.0, confidence: 0.88, thumb: 'https://i.pravatar.cc/150?img=5' },
        { label: 'Person 3', startTime: 20.0, endTime: 25.0, confidence: 0.90, thumb: 'https://i.pravatar.cc/150?img=8' },
    ]

    // Clear existing (if any)
    await prisma.videoFaceTag.deleteMany({ where: { videoId: video.id } })

    for (const face of mockFaces) {
        await prisma.videoFaceTag.create({
            data: {
                videoId: video.id,
                label: face.label,
                startTime: face.startTime,
                endTime: face.endTime,
                confidence: face.confidence,
                thumbnailUrl: face.thumb
            }
        })
    }

    console.log(`Successfully injected ${mockFaces.length} sample face tags.`)
    console.log('Please refresh the video page to see the AI highlights.')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
