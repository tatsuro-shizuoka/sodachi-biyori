
import { VideoIntelligenceServiceClient } from '@google-cloud/video-intelligence'
import { PrismaClient } from '@prisma/client'

const client = new VideoIntelligenceServiceClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-key.json'
})

const prisma = new PrismaClient()

async function main() {
    const videoId = 'e12d5ede-95fe-4f26-a2d6-f5363f0468f6'

    console.log(`Debug Analysis for ID: ${videoId}`)

    const video = await prisma.video.findUnique({
        where: { id: videoId }
    })

    if (!video) {
        console.error('Video not found in DB')
        return
    }

    let analysisUrl = video.videoUrl
    if (video.videoUrl.includes('videodelivery.net')) {
        // Try the MP4 download URL
        // Format: https://videodelivery.net/{video_id}/downloads/default.mp4
        // Extract ID just in case the stored URL is different
        const cfId = video.videoUrl.match(/videodelivery\.net\/([a-zA-Z0-9]+)/)?.[1]
        if (cfId) {
            analysisUrl = `https://videodelivery.net/${cfId}/downloads/default.mp4`
        }
    }

    console.log(`Original URL: ${video.videoUrl}`)
    console.log(`Computed Analysis URL: ${analysisUrl}`)

    const requestObj = {
        inputUri: analysisUrl,
        features: ['FACE_DETECTION'],
    }

    try {
        console.log('Sending request to Google Cloud Video Intelligence...')
        const [operation] = await client.annotateVideo(requestObj as any)
        console.log('Operation started. Waiting for completion...')
        const [operationResult] = await operation.promise()
        console.log('Operation completed.')

        const faceAnnotations = (operationResult as any).annotationResults?.[0]?.faceAnnotations || []
        console.log(`Found ${faceAnnotations.length} face annotations.`)

        if ((operationResult as any).error) {
            console.error('Operation Error:', JSON.stringify((operationResult as any).error, null, 2))
        }

    } catch (error) {
        console.error('Fatal Error:', error)
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    })
