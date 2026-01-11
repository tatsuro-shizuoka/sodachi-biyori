import { getGuardianSession } from '@/lib/auth'
import { getPresignedUrl } from '@/lib/storage-s3'
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const session = await getGuardianSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Get Guardian's Children
        const guardian = await prisma.guardian.findUnique({
            where: { id: session.id as string },
            include: { children: { include: { child: true } } }
        })

        if (!guardian) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const childIds = guardian.children.map(c => c.childId)

        // 2. Find Tentative Tags
        const candidates = await prisma.videoFaceTag.findMany({
            where: {
                isTentative: true,
                childId: { in: childIds }
            },
            include: {
                child: true,
                video: { select: { title: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

        const formatted = await Promise.all(candidates.map(async c => {
            let thumb = c.thumbnailUrl

            // If it's an S3 Key (no leading slash), generate signed URL
            if (thumb && !thumb.startsWith('/')) {
                thumb = await getPresignedUrl(thumb)
            }

            return {
                id: c.id,
                childId: c.childId,
                childName: c.child?.name || 'Unknown',
                thumbnailUrl: thumb,
                confidence: c.confidence,
                videoTitle: c.video.title,
                startTime: c.startTime
            }
        }))

        return NextResponse.json({ candidates: formatted })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
