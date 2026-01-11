
import { VideoIntelligenceServiceClient } from '@google-cloud/video-intelligence'
import { PrismaClient } from '@prisma/client'

const client = new VideoIntelligenceServiceClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-key.json'
})

const prisma = new PrismaClient()

async function main() {
    const videoId = 'e12d5ede-95fe-4f26-a2d6-f5363f0468f6'
    const mp4Url = 'https://customer-8wrsqatwg42wd1l7.cloudflarestream.com/853c9cb8b960e4e53aa6584c88c6af89/downloads/default.mp4'

    console.log(`Testing AI Analysis for video ${videoId}`)
    console.log(`Downloading MP4 from: ${mp4Url}`)

    // Download the MP4
    const res = await fetch(mp4Url)
    if (!res.ok) {
        throw new Error(`Failed to download: ${res.status}`)
    }
    const arrayBuffer = await res.arrayBuffer()
    const videoBuffer = Buffer.from(arrayBuffer)
    console.log(`Downloaded ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB`)

    // Send to Google Cloud Video Intelligence using inputContent
    const requestObj = {
        inputContent: videoBuffer.toString('base64'),
        features: ['FACE_DETECTION'],
    }

    try {
        console.log('Sending to Google Cloud Video Intelligence API...')
        const [operation] = await client.annotateVideo(requestObj as any)
        console.log('Waiting for operation to complete (this may take a few minutes)...')

        const [operationResult] = await operation.promise()

        const faceAnnotations = (operationResult as any).annotationResults?.[0]?.faceAnnotations || []
        console.log(`Found ${faceAnnotations.length} face annotations!`)

        // Clear old tags
        await prisma.videoFaceTag.deleteMany({ where: { videoId } })

        // Save new tags
        for (let i = 0; i < faceAnnotations.length; i++) {
            const face = faceAnnotations[i] as any
            const personLabel = `Person ${i + 1}`

            let faceThumbnail: string | null = null
            if (face.thumbnail) {
                const base64 = Buffer.isBuffer(face.thumbnail)
                    ? face.thumbnail.toString('base64')
                    : face.thumbnail
                faceThumbnail = `data:image/jpeg;base64,${base64}`
                console.log(`  Person ${i + 1}: Thumbnail captured (${faceThumbnail.length} chars)`)
            } else {
                console.log(`  Person ${i + 1}: No thumbnail available`)
            }

            const segments = face.tracks || face.segments || []
            console.log(`  Person ${i + 1}: ${segments.length} appearances`)

            for (const track of segments) {
                const segment = track.segment || track
                const startSeconds = parseFloat(segment.startTimeOffset?.seconds || '0') +
                    (segment.startTimeOffset?.nanos || 0) / 1e9
                const endSeconds = parseFloat(segment.endTimeOffset?.seconds || '0') +
                    (segment.endTimeOffset?.nanos || 0) / 1e9

                await prisma.videoFaceTag.create({
                    data: {
                        videoId,
                        label: personLabel,
                        thumbnailUrl: faceThumbnail,
                        startTime: startSeconds,
                        endTime: endSeconds,
                        confidence: track.confidence || face.detectionConfidence || 0,
                    }
                })
            }
        }

        console.log('Done! Face tags saved to database.')

    } catch (error) {
        console.error('Error:', error)
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    })
