import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/auth'

export async function GET(request: Request) {
    const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1]
    const session = token ? await verifyAdminToken(token) : null

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const [totalGuardians, totalVideos] = await Promise.all([
            prisma.guardian.count(),
            prisma.video.count()
        ])

        const totalViews = await prisma.videoView.count()

        // Get Top 5 Viewed Videos
        const topVideoIds = await prisma.videoView.groupBy({
            by: ['videoId'],
            _count: {
                videoId: true
            },
            orderBy: {
                _count: {
                    videoId: 'desc'
                }
            },
            take: 5
        })

        const topVideos = await Promise.all(topVideoIds.map(async (item) => {
            const video = await prisma.video.findUnique({
                where: { id: item.videoId },
                select: { title: true, thumbnailUrl: true }
            })
            return {
                ...video,
                count: item._count.videoId
            }
        }))

        return NextResponse.json({
            totalGuardians,
            totalVideos,
            totalViews,
            topVideos
        })

    } catch (error) {
        console.error('Analytics Fetch Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
