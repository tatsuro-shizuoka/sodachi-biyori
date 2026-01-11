import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { VideoIntelligenceServiceClient } from '@google-cloud/video-intelligence'
import { verifyAdminToken } from '@/lib/auth'

const client = new VideoIntelligenceServiceClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-key.json'
})

// Helper to update analysis status
async function updateStatus(videoId: string, status: string) {
    await prisma.video.update({
        where: { id: videoId },
        data: { analysisStatus: status }
    })
    console.log(`[AI Analysis] Status: ${status}`)
}

// Helper function to get MP4 download status from Cloudflare
async function getCloudflareDownloadStatus(cfId: string): Promise<{ ready: boolean; url: string | null; progress: number }> {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const token = process.env.CLOUDFLARE_STREAM_TOKEN

    if (!accountId || !token) {
        console.log('[AI Analysis] Missing Cloudflare credentials')
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

        // If no download info exists (empty result or 404), enable MP4 download
        if (!downloadInfo) {
            console.log('[AI Analysis] MP4 download not enabled, requesting...')
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
            console.log('[AI Analysis] MP4 enable response:', JSON.stringify(enableData.result?.default || {}))
            return { ready: false, url: null, progress: 0 }
        }

        if (downloadInfo.status === 'ready') {
            return { ready: true, url: downloadInfo.url, progress: 100 }
        }

        return { ready: false, url: null, progress: downloadInfo.percentComplete || 0 }

    } catch (error) {
        console.error('[AI Analysis] Error checking Cloudflare download status:', error)
        return { ready: false, url: null, progress: 0 }
    }
}

// Helper to download MP4 as Buffer
async function downloadMp4(url: string): Promise<Buffer> {
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error(`Failed to download MP4: ${res.status}`)
    }
    const arrayBuffer = await res.arrayBuffer()
    return Buffer.from(arrayBuffer)
}

// Helper function to wait
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// Background analysis function
async function runBackgroundAnalysis(videoId: string, cfId: string) {
    try {
        // Step 1: Wait for MP4
        await updateStatus(videoId, 'waiting_mp4')

        const maxRetries = 20
        const retryInterval = 30000
        let mp4Url: string | null = null

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const status = await getCloudflareDownloadStatus(cfId)
            if (status.ready && status.url) {
                mp4Url = status.url
                break
            }
            // Update status with progress
            await updateStatus(videoId, `waiting_mp4_${status.progress}%`)
            if (attempt < maxRetries) {
                await sleep(retryInterval)
            }
        }

        if (!mp4Url) {
            await updateStatus(videoId, 'failed_mp4_timeout')
            return
        }

        // Step 2: Download MP4
        await updateStatus(videoId, 'downloading')
        const videoBuffer = await downloadMp4(mp4Url)

        // Step 3: Analyze
        await updateStatus(videoId, 'analyzing')

        const requestObj = {
            inputContent: videoBuffer.toString('base64'),
            features: ['FACE_DETECTION'],
        }

        const [operation] = await client.annotateVideo(requestObj as any)
        const [operationResult] = await operation.promise()

        // Use faceDetectionAnnotations (not the deprecated faceAnnotations)
        const annotations = (operationResult as any).annotationResults?.[0]
        const faceAnnotations = annotations?.faceDetectionAnnotations || annotations?.faceAnnotations || []
        console.log(`[AI Analysis] Found ${faceAnnotations.length} faces in faceDetectionAnnotations`)

        // Step 4: Save
        await updateStatus(videoId, 'saving')
        await prisma.videoFaceTag.deleteMany({ where: { videoId } })

        for (let i = 0; i < faceAnnotations.length; i++) {
            const face = faceAnnotations[i] as any
            const personLabel = `Person ${i + 1}`

            let faceThumbnail: string | null = null
            if (face.thumbnail) {
                const base64 = Buffer.isBuffer(face.thumbnail)
                    ? face.thumbnail.toString('base64')
                    : face.thumbnail
                faceThumbnail = `data:image/jpeg;base64,${base64}`
            }

            const segments = face.tracks || face.segments || []
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

        // Complete!
        await updateStatus(videoId, `complete_${faceAnnotations.length}_faces`)

    } catch (error) {
        console.error('[AI Analysis] Error:', error)
        await updateStatus(videoId, 'failed')
    }
}

export async function POST(request: Request) {
    const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1]
    const session = token ? await verifyAdminToken(token) : null
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { videoId } = await request.json()

        const video = await prisma.video.findUnique({
            where: { id: videoId }
        })

        if (!video || !video.videoUrl) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 })
        }

        const cfIdMatch = video.videoUrl.match(/(?:videodelivery\.net|cloudflarestream\.com)\/([a-zA-Z0-9]+)/)
        const cfId = cfIdMatch ? cfIdMatch[1] : null

        if (!cfId) {
            return NextResponse.json({ error: 'Only Cloudflare videos supported' }, { status: 400 })
        }

        // Set initial status
        await updateStatus(videoId, 'queued')

        // Start background analysis
        runBackgroundAnalysis(videoId, cfId).catch(err => {
            console.error('[AI Analysis] Background task failed:', err)
        })

        return NextResponse.json({
            success: true,
            message: 'AI analysis started',
            status: 'queued'
        })

    } catch (error) {
        console.error('[AI Analysis] Error:', error)
        return NextResponse.json({ error: 'Failed to start analysis' }, { status: 500 })
    }
}
