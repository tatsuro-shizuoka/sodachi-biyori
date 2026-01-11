
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
        { headers: { 'Authorization': `Bearer ${token}` } }
    )
    const data = await res.json()
    const info = data.result?.default
    if (info?.status === 'ready') return info.url
    return null
}

async function main() {
    const video = await prisma.video.findFirst({
        where: { title: 'demo' },
        select: { id: true, title: true, videoUrl: true }
    })

    if (!video) { console.log('Video not found'); return }

    console.log(`Re-analyzing "${video.title}"...`)

    const cfMatch = video.videoUrl.match(/videodelivery\.net\/([a-zA-Z0-9]+)/)
    const cfId = cfMatch?.[1]
    if (!cfId) { console.log('No CF ID'); return }

    const mp4Url = await getCloudflareDownloadUrl(cfId)
    if (!mp4Url) { console.log('MP4 not ready'); return }

    console.log('Downloading...')
    const mp4Res = await fetch(mp4Url)
    const buffer = Buffer.from(await mp4Res.arrayBuffer())
    console.log(`Downloaded ${(buffer.length / 1024 / 1024).toFixed(2)} MB`)

    console.log('Analyzing with Google AI...')
    const request = {
        inputContent: buffer.toString('base64'),
        features: [protos.google.cloud.videointelligence.v1.Feature.FACE_DETECTION],
    }

    const [operation] = await client.annotateVideo(request as any)
    const [result] = await operation.promise()

    const annotations = (result as any).annotationResults?.[0]
    const faceAnnotations = annotations?.faceDetectionAnnotations || []

    console.log(`Found ${faceAnnotations.length} faces!`)

    // Clear old tags
    await prisma.videoFaceTag.deleteMany({ where: { videoId: video.id } })

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
            console.log(`  ${personLabel}: Thumbnail saved (${faceThumbnail.length} chars)`)
        }

        const segments = face.tracks || []
        console.log(`  ${personLabel}: ${segments.length} track(s)`)

        for (const track of segments) {
            const segment = track.segment || {}
            const startSeconds = parseFloat(segment.startTimeOffset?.seconds || '0') +
                (segment.startTimeOffset?.nanos || 0) / 1e9
            const endSeconds = parseFloat(segment.endTimeOffset?.seconds || '0') +
                (segment.endTimeOffset?.nanos || 0) / 1e9

            await prisma.videoFaceTag.create({
                data: {
                    videoId: video.id,
                    label: personLabel,
                    thumbnailUrl: faceThumbnail,
                    startTime: startSeconds,
                    endTime: endSeconds,
                    confidence: track.confidence || 0,
                }
            })
        }
    }

    // Update status
    await prisma.video.update({
        where: { id: video.id },
        data: { analysisStatus: `complete_${faceAnnotations.length}_faces` }
    })

    console.log(`\n✅ Complete! Saved ${faceAnnotations.length} face tags.`)
}

main().finally(() => prisma.$disconnect())
