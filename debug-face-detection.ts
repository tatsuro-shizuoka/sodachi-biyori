
import { VideoIntelligenceServiceClient, protos } from '@google-cloud/video-intelligence'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const client = new VideoIntelligenceServiceClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-key.json'
})

async function getCloudflareDownloadUrl(cfId: string): Promise<string | null> {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const token = process.env.CLOUDFLARE_STREAM_TOKEN

    const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${cfId}/downloads`,
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    )
    const data = await res.json()
    const info = data.result?.default
    if (info?.status === 'ready') return info.url
    return null
}

async function main() {
    // Get the demo video
    const video = await prisma.video.findFirst({
        where: { title: 'demo' },
        select: { id: true, title: true, videoUrl: true, analysisStatus: true }
    })

    if (!video) {
        console.log('Video not found')
        return
    }

    console.log(`\n=== Debugging Face Detection for "${video.title}" ===\n`)
    console.log(`Current status: ${video.analysisStatus}`)

    // Extract CF ID
    const cfMatch = video.videoUrl.match(/videodelivery\.net\/([a-zA-Z0-9]+)/)
    const cfId = cfMatch?.[1]

    if (!cfId) {
        console.log('No Cloudflare ID')
        return
    }

    // Get download URL
    const mp4Url = await getCloudflareDownloadUrl(cfId)
    console.log(`MP4 URL: ${mp4Url ? 'Ready' : 'Not ready'}`)

    if (!mp4Url) {
        console.log('MP4 not ready')
        return
    }

    // Download
    console.log(`\nDownloading video from Cloudflare...`)
    const mp4Res = await fetch(mp4Url)
    const buffer = Buffer.from(await mp4Res.arrayBuffer())
    console.log(`Downloaded: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`)

    // Analyze with FULL debugging
    console.log(`\nSending to Google Cloud Video Intelligence API...`)
    console.log(`Features: FACE_DETECTION`)

    const request = {
        inputContent: buffer.toString('base64'),
        features: [protos.google.cloud.videointelligence.v1.Feature.FACE_DETECTION],
    }

    try {
        const [operation] = await client.annotateVideo(request as any)
        console.log(`\nOperation started. Waiting for completion...`)

        const [result] = await operation.promise()

        console.log(`\n=== API Response Debug ===`)
        console.log(`Number of annotation results: ${(result as any).annotationResults?.length || 0}`)

        const annotations = (result as any).annotationResults?.[0]
        if (annotations) {
            console.log(`\nAvailable annotation types in response:`)
            console.log(`  - faceAnnotations: ${annotations.faceAnnotations?.length || 0}`)
            console.log(`  - faceDetectionAnnotations: ${annotations.faceDetectionAnnotations?.length || 0}`)
            console.log(`  - personDetectionAnnotations: ${annotations.personDetectionAnnotations?.length || 0}`)
            console.log(`  - shotAnnotations: ${annotations.shotAnnotations?.length || 0}`)
            console.log(`  - segmentPresenceLabelAnnotations: ${annotations.segmentPresenceLabelAnnotations?.length || 0}`)

            // Check all keys
            console.log(`\nAll keys in annotationResults[0]:`)
            for (const key of Object.keys(annotations)) {
                const val = annotations[key]
                if (val && (Array.isArray(val) ? val.length > 0 : val)) {
                    console.log(`  - ${key}: ${Array.isArray(val) ? val.length + ' items' : typeof val}`)
                }
            }

            // If face detection has results
            if (annotations.faceDetectionAnnotations?.length > 0) {
                console.log(`\n=== Face Detection Results ===`)
                for (let i = 0; i < annotations.faceDetectionAnnotations.length; i++) {
                    const face = annotations.faceDetectionAnnotations[i]
                    console.log(`\nFace ${i + 1}:`)
                    console.log(`  tracks: ${face.tracks?.length || 0}`)
                    console.log(`  thumbnail: ${face.thumbnail ? 'Yes' : 'No'}`)
                    if (face.tracks?.length > 0) {
                        const track = face.tracks[0]
                        console.log(`  First track segment: ${JSON.stringify(track.segment)}`)
                        console.log(`  Confidence: ${track.confidence}`)
                    }
                }
            }
        }

    } catch (error: any) {
        console.error(`\nAPI Error:`, error.message)
        console.error(`Details:`, error.details || 'N/A')
    }
}

main().finally(() => prisma.$disconnect())
