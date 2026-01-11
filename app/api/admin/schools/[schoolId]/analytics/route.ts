import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get all videos for this school's classes
        const videos = await prisma.video.findMany({
            where: {
                class: { schoolId }
            },
            include: {
                class: true,
                _count: {
                    select: { views: true, favorites: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Map video stats
        const videoStats = videos.map((v: any) => ({
            id: v.id,
            title: v.title,
            views: v._count.views,
            favorites: v._count.favorites,
            className: v.class?.name || '不明'
        })).sort((a: any, b: any) => b.views - a.views).slice(0, 10)

        // Get sponsor stats for this school
        const sponsors = await prisma.sponsor.findMany({
            where: { OR: [{ schoolId }, { schoolId: null }] },
            include: {
                _count: {
                    select: { impressions: true, clicks: true }
                }
            }
        })

        const sponsorStats = sponsors.map((s: any) => ({
            id: s.id,
            name: s.name,
            impressions: s._count.impressions,
            clicks: s._count.clicks,
            ctr: s._count.impressions > 0 ? (s._count.clicks / s._count.impressions) * 100 : 0
        }))

        // Get guardians count for this school
        const guardianCount = await prisma.guardian.count({
            where: {
                children: {
                    some: {
                        child: {
                            classes: {
                                some: {
                                    class: { schoolId }
                                }
                            }
                        }
                    }
                }
            }
        })

        // Calculate overall stats
        const totalViews = videoStats.reduce((sum: number, v: any) => sum + v.views, 0)
        const totalFavorites = videoStats.reduce((sum: number, v: any) => sum + v.favorites, 0)
        const totalVideos = videos.length

        return NextResponse.json({
            videos: videoStats,
            sponsors: sponsorStats,
            overall: {
                totalViews,
                totalFavorites,
                totalVideos,
                totalGuardians: guardianCount
            }
        })
    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }
}
