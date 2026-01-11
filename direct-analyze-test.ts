
import { PrismaClient } from '@prisma/client'
import { VideoIntelligenceServiceClient } from '@google-cloud/video-intelligence'

const prisma = new PrismaClient()
const client = new VideoIntelligenceServiceClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-key.json'
})

// Helper function to get MP4 download status from Cloudflare
async function getCloudflareDownloadStatus(cfId: string): Promise<{ ready: boolean; url: string | null; progress: number }> {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const token = process.env.CLOUDFLARE_STREAM_TOKEN

    if (!accountId || !token) {
        console.log('Missing Cloudflare credentials')
        return { ready: false, url: null, progress: 0 }
    }

    try {
        const res = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${cfId}/downloads`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        )

        const data = await res.json()
        const downloadInfo = data.result?.default

        // If no download info exists, enable MP4 download
        if (!downloadInfo) {
            console.log('MP4 download not enabled, requesting...')
            const enableRes = await fetch(
                `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${cfId}/downloads`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
            const enableData = await enableRes.json()
            console.log('MP4 enable response:', JSON.stringify(enableData.result?.default || {}))
            return { ready: false, url: null, progress: 0 }
        }

        if (downloadInfo.status === 'ready') {
            return { ready: true, url: downloadInfo.url, progress: 100 }
        }

        return { ready: false, url: null, progress: downloadInfo.percentComplete || 0 }

    } catch (error) {
        console.error('Error checking Cloudflare download status:', error)
        return { ready: false, url: null, progress: 0 }
    }
}

async function main() {
    // Test with the "face" video
    const video = await prisma.video.findFirst({
        where: { title: 'face' },
        select: { id: true, title: true, videoUrl: true, analysisStatus: true }
    })

    if (!video) {
        console.log('No video found')
        return
    }

    console.log(`Testing with: ${video.title}`)
    console.log(`Current status: ${video.analysisStatus}`)

    // Extract CF ID
    const cfMatch = video.videoUrl.match(/videodelivery\.net\/([a-zA-Z0-9]+)/)
    const cfId = cfMatch ? cfMatch[1] : null

    if (!cfId) {
        console.log('No Cloudflare ID found')
        return
    }

    console.log(`Cloudflare ID: ${cfId}`)

    // Check MP4 status
    const status = await getCloudflareDownloadStatus(cfId)
    console.log(`MP4 Status: ready=${status.ready}, progress=${status.progress}%, url=${status.url}`)

    if (status.ready && status.url) {
        console.log('MP4 is ready! Downloading...')

        // Download MP4
        const mp4Res = await fetch(status.url)
        const buffer = Buffer.from(await mp4Res.arrayBuffer())
        console.log(`Downloaded ${(buffer.length / 1024 / 1024).toFixed(2)} MB`)

        // Send to Google AI
        console.log('Sending to Google Cloud Video Intelligence...')
        const [operation] = await client.annotateVideo({
            inputContent: buffer.toString('base64'),
            features: ['FACE_DETECTION'],
        } as any)

        console.log('Waiting for Google operation...')
        const [result] = await operation.promise()

        const faces = (result as any).annotationResults?.[0]?.faceAnnotations || []
        console.log(`Found ${faces.length} faces!`)

        // Update status
        await prisma.video.update({
            where: { id: video.id },
            data: { analysisStatus: `complete_${faces.length}_faces` }
        })

        console.log('Done!')
    } else {
        // Update status to show we're waiting
        await prisma.video.update({
            where: { id: video.id },
            data: { analysisStatus: `waiting_mp4_${status.progress}%` }
        })
        console.log('MP4 not ready yet. Try again in a few minutes.')
    }
}

main().finally(() => prisma.$disconnect())
