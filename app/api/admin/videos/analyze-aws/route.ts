import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/auth'
import { searchFace, ensureCollectionExists } from '@/lib/rekognition'

// Helper to update analysis status
async function updateStatus(videoId: string, status: string) {
    await prisma.video.update({
        where: { id: videoId },
        data: { analysisStatus: status }
    })
    console.log(`[AWS Analysis] Status: ${status}`)
}

// Helper function to get MP4 download status from Cloudflare
async function getCloudflareDownloadUrl(cfId: string): Promise<string | null> {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const token = process.env.CLOUDFLARE_STREAM_TOKEN

    if (!accountId || !token) return null

    try {
        const res = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${cfId}/downloads`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        )

        const data = await res.json()
        const downloadInfo = data.result?.default

        if (!downloadInfo) {
            // Enable MP4 download
            await fetch(
                `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${cfId}/downloads`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
            return null
        }

        if (downloadInfo.status === 'ready') {
            return downloadInfo.url
        }

        return null
    } catch (error) {
        console.error('[AWS Analysis] Cloudflare error:', error)
        return null
    }
}

// Extract frames from video at regular intervals
async function extractFramesFromVideo(mp4Url: string, intervalSeconds: number = 1): Promise<Buffer[]> {
    // For now, we'll download the video and extract frames using ffmpeg-like logic
    // In production, you'd use ffmpeg or a cloud service

    // Simplified approach: Download video and extract a few key frames
    // This is a placeholder - in production, use proper video frame extraction
    console.log(`[AWS Analysis] Extracting frames from ${mp4Url}`)

    // For demo, we'll just use the video thumbnail as the first "frame"
    // In production, implement proper frame extraction with ffmpeg
    const frames: Buffer[] = []

    try {
        // Get video thumbnail from Cloudflare
        const cfIdMatch = mp4Url.match(/cloudflarestream\.com\/([a-zA-Z0-9]+)/)
        if (cfIdMatch) {
            const cfId = cfIdMatch[1]
            // Cloudflare provides thumbnails at various timestamps
            for (let time = 0; time <= 10; time += 2) {
                const thumbUrl = `https://customer-8wrsqatwg42wd1l7.cloudflarestream.com/${cfId}/thumbnails/thumbnail.jpg?time=${time}s&width=640`
                try {
                    const res = await fetch(thumbUrl)
                    if (res.ok) {
                        const buffer = Buffer.from(await res.arrayBuffer())
                        frames.push(buffer)
                    }
                } catch (e) {
                    // Skip failed frames
                }
            }
        }
    } catch (error) {
        console.error('[AWS Analysis] Frame extraction error:', error)
    }

    console.log(`[AWS Analysis] Extracted ${frames.length} frames`)
    return frames
}

// Main analysis function
async function runAWSAnalysis(videoId: string, cfId: string) {
    try {
        // Ensure collection exists
        await ensureCollectionExists()

        // Get registered children
        const registeredChildren = await prisma.child.findMany({
            where: { faceId: { not: null } },
            select: { id: true, name: true, faceId: true }
        })

        if (registeredChildren.length === 0) {
            await updateStatus(videoId, 'complete_no_registered_faces')
            console.log('[AWS Analysis] No registered children to search for')
            return
        }

        console.log(`[AWS Analysis] Searching for ${registeredChildren.length} registered children`)

        // Wait for MP4 to be ready
        await updateStatus(videoId, 'waiting_mp4')
        let mp4Url: string | null = null

        for (let attempt = 0; attempt < 20; attempt++) {
            mp4Url = await getCloudflareDownloadUrl(cfId)
            if (mp4Url) break
            await updateStatus(videoId, `waiting_mp4_${attempt * 5}%`)
            await new Promise(resolve => setTimeout(resolve, 30000))
        }

        if (!mp4Url) {
            await updateStatus(videoId, 'failed_mp4_timeout')
            return
        }

        // Extract frames
        await updateStatus(videoId, 'extracting_frames')
        const frames = await extractFramesFromVideo(mp4Url)

        if (frames.length === 0) {
            await updateStatus(videoId, 'failed_no_frames')
            return
        }

        // Search each frame for registered faces
        await updateStatus(videoId, 'analyzing')

        const detections: Map<string, { childId: string; childName: string; timestamps: number[] }> = new Map()

        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i]
            const timestamp = i * 2 // Approximate timestamp based on frame interval

            try {
                const matches = await searchFace(frame, 80)

                for (const match of matches) {
                    const child = registeredChildren.find(c => c.id === match.childId)
                    if (child) {
                        if (!detections.has(child.id)) {
                            detections.set(child.id, {
                                childId: child.id,
                                childName: child.name,
                                timestamps: []
                            })
                        }
                        detections.get(child.id)!.timestamps.push(timestamp)
                    }
                }
            } catch (error) {
                console.error(`[AWS Analysis] Error searching frame ${i}:`, error)
            }
        }

        // Save results
        await updateStatus(videoId, 'saving')

        // Clear old face tags for this video
        await prisma.videoFaceTag.deleteMany({ where: { videoId } })

        // Save new detections
        let totalTags = 0
        for (const [childId, detection] of detections) {
            const child = registeredChildren.find(c => c.id === childId)
            if (!child) continue

            for (const timestamp of detection.timestamps) {
                await prisma.videoFaceTag.create({
                    data: {
                        videoId,
                        childId,
                        label: detection.childName,
                        startTime: timestamp,
                        endTime: timestamp + 2,
                        confidence: 0.9,
                    }
                })
                totalTags++
            }
        }

        await updateStatus(videoId, `complete_${detections.size}_children_${totalTags}_appearances`)
        console.log(`[AWS Analysis] Complete! Found ${detections.size} children with ${totalTags} appearances`)

    } catch (error) {
        console.error('[AWS Analysis] Error:', error)
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
            where: { id: videoId },
            include: { class: true }
        })

        if (!video || !video.videoUrl) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 })
        }

        const cfIdMatch = video.videoUrl.match(/(?:videodelivery\.net|cloudflarestream\.com)\/([a-zA-Z0-9]+)/)
        const cfId = cfIdMatch ? cfIdMatch[1] : null

        if (!cfId) {
            return NextResponse.json({ error: 'Only Cloudflare videos supported' }, { status: 400 })
        }

        // Check AI Analysis setting
        const schoolClass = (video as any).class
        const schoolId = schoolClass?.schoolId

        if (!schoolId) {
            console.error('School ID not found for video', videoId)
            // Continue or fail? Failsafe: continue but warn
        }

        const school = await prisma.school.findUnique({
            where: { id: schoolId }
        }) as any

        if (school && school.enableAiAnalysis === false) {
            await updateStatus(videoId, 'skipped_admin_disabled')
            return NextResponse.json({
                success: false,
                message: 'AI Analysis is disabled in school settings',
                status: 'skipped'
            })
        }

        // Start background analysis
        await updateStatus(videoId, 'queued')

        runAWSAnalysis(videoId, cfId).catch(err => {
            console.error('[AWS Analysis] Background task failed:', err)
        })

        return NextResponse.json({
            success: true,
            message: 'AWS Rekognition analysis started',
            status: 'queued'
        })

    } catch (error) {
        console.error('[AWS Analysis] Error:', error)
        return NextResponse.json({ error: 'Failed to start analysis' }, { status: 500 })
    }
}
