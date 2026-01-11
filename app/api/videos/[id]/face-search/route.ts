import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGuardianSession } from '@/lib/auth'
import { searchFace, ensureCollectionExists } from '@/lib/rekognition'

// Search for the logged-in guardian's registered children in a video
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getGuardianSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: videoId } = await params
    const guardianId = (session as any).id

    try {
        // Get the video
        const video = await prisma.video.findUnique({
            where: { id: videoId },
            select: { id: true, videoUrl: true }
        })

        if (!video) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 })
        }

        // Get guardian's children with registered faces
        const guardian = await prisma.guardian.findUnique({
            where: { id: guardianId },
            include: {
                children: {
                    include: {
                        child: {
                            select: {
                                id: true,
                                name: true,
                                faceId: true,
                                faceImageUrl: true,
                            }
                        }
                    }
                }
            }
        })

        if (!guardian) {
            return NextResponse.json({ error: 'Guardian not found' }, { status: 404 })
        }

        const registeredChildren = guardian.children
            .map(gc => gc.child)
            .filter(child => child.faceId)

        if (registeredChildren.length === 0) {
            return NextResponse.json({
                message: 'No registered faces',
                children: [],
                detections: []
            })
        }

        // Check if we already have detections for this video
        const existingDetections = await prisma.videoFaceTag.findMany({
            where: {
                videoId,
                childId: { in: registeredChildren.map(c => c.id) }
            },
            orderBy: { startTime: 'asc' }
        })

        // Map detections to children
        const detections = registeredChildren.map(child => {
            const childDetections = existingDetections.filter(d => d.childId === child.id)
            return {
                childId: child.id,
                childName: child.name,
                faceImageUrl: child.faceImageUrl,
                appearances: childDetections.map(d => ({
                    id: d.id,
                    startTime: d.startTime,
                    endTime: d.endTime,
                    confidence: d.confidence
                }))
            }
        })

        return NextResponse.json({
            children: registeredChildren.map(c => ({
                id: c.id,
                name: c.name,
                faceImageUrl: c.faceImageUrl
            })),
            detections: detections.filter(d => d.appearances.length > 0)
        })

    } catch (error) {
        console.error('[Face Search] Error:', error)
        return NextResponse.json({ error: 'Failed to search faces' }, { status: 500 })
    }
}

// Trigger face search for this video (analyze video frames)
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getGuardianSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: videoId } = await params
    const guardianId = (session as any).id

    try {
        const video = await prisma.video.findUnique({
            where: { id: videoId },
            select: { id: true, videoUrl: true }
        })

        if (!video) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 })
        }

        // Get guardian's children with registered faces
        const guardian = await prisma.guardian.findUnique({
            where: { id: guardianId },
            include: {
                children: {
                    include: {
                        child: {
                            select: { id: true, name: true, faceId: true }
                        }
                    }
                }
            }
        })

        const registeredChildren = guardian?.children
            .map(gc => gc.child)
            .filter(child => child.faceId) || []

        if (registeredChildren.length === 0) {
            return NextResponse.json({
                error: 'No registered faces. Please register your child\'s face in settings.'
            }, { status: 400 })
        }

        // Extract Cloudflare ID
        const cfIdMatch = video.videoUrl.match(/(?:videodelivery\.net|cloudflarestream\.com)\/([a-zA-Z0-9]+)/)
        const cfId = cfIdMatch?.[1]

        if (!cfId) {
            return NextResponse.json({ error: 'Only Cloudflare videos supported' }, { status: 400 })
        }

        // Ensure AWS collection exists
        await ensureCollectionExists()

        // Get video thumbnails at different timestamps
        const detections: Array<{ childId: string; childName: string; startTime: number }> = []

        for (let time = 0; time <= 30; time += 2) {
            const thumbUrl = `https://customer-8wrsqatwg42wd1l7.cloudflarestream.com/${cfId}/thumbnails/thumbnail.jpg?time=${time}s&width=640`

            try {
                const res = await fetch(thumbUrl)
                if (!res.ok) continue

                const imageBuffer = Buffer.from(await res.arrayBuffer())
                const matches = await searchFace(imageBuffer, 70) // 70% threshold

                for (const match of matches) {
                    const child = registeredChildren.find(c => c.id === match.childId)
                    if (child) {
                        detections.push({
                            childId: child.id,
                            childName: child.name,
                            startTime: time
                        })
                    }
                }
            } catch (e) {
                console.error(`[Face Search] Error at time ${time}:`, e)
            }
        }

        // Save detections to database
        for (const detection of detections) {
            // Check if this detection already exists
            const existing = await prisma.videoFaceTag.findFirst({
                where: {
                    videoId,
                    childId: detection.childId,
                    startTime: detection.startTime
                }
            })

            if (!existing) {
                await prisma.videoFaceTag.create({
                    data: {
                        videoId,
                        childId: detection.childId,
                        label: detection.childName,
                        startTime: detection.startTime,
                        endTime: detection.startTime + 2,
                        confidence: 0.8
                    }
                })
            }
        }

        return NextResponse.json({
            success: true,
            detectionsFound: detections.length,
            message: detections.length > 0
                ? `${detections.length}件の登場シーンが見つかりました`
                : 'お子様の登場シーンは見つかりませんでした'
        })

    } catch (error) {
        console.error('[Face Search] Error:', error)
        return NextResponse.json({ error: 'Failed to search faces' }, { status: 500 })
    }
}
