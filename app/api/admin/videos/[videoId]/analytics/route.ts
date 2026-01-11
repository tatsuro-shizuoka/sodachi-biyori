import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/auth'

async function getAdminSession(request: Request) {
    const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1]
    const session = token ? await verifyAdminToken(token) : null
    return session
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ videoId: string }> }
) {
    try {
        const { videoId } = await params
        const session = await getAdminSession(request)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch metrics
        const [views, favoritesData, uniqueViewersGroup] = await Promise.all([
            prisma.videoView.count({
                where: { videoId: videoId }
            }),
            prisma.favorite.findMany({
                where: { videoId: videoId },
                include: {
                    guardian: {
                        select: { name: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.videoView.groupBy({
                by: ['guardianId'],
                where: { videoId: videoId, guardianId: { not: null } }
            })
        ])

        // Get view history (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const viewHistory = await prisma.videoView.findMany({
            where: {
                videoId: videoId
            },
            take: 100, // Limit recent views list
            include: {
                guardian: {
                    select: { name: true }
                }
            },
            orderBy: { viewedAt: 'desc' }
        })

        // Group views by date for a chart (optional future use, keeping for now if helpful)
        const statsByDate: Record<string, number> = {}
        viewHistory.forEach(v => {
            const date = v.viewedAt.toISOString().split('T')[0]
            statsByDate[date] = (statsByDate[date] || 0) + 1
        })

        return NextResponse.json({
            totalViews: views,
            uniqueViewers: uniqueViewersGroup.length,
            favoritedBy: favoritesData.map(f => ({
                id: f.id,
                favoritedAt: f.createdAt,
                guardianName: f.guardian?.name || '不明'
            })),
            history: Object.entries(statsByDate).map(([date, count]) => ({ date, count })),
            recentViews: viewHistory.map(v => ({
                id: v.id,
                viewedAt: v.viewedAt,
                guardianName: v.guardian?.name || 'ゲスト',
                deviceType: v.deviceType
            }))
        })
    } catch (error) {
        console.error('Error fetching analytics:', error)
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }
}
