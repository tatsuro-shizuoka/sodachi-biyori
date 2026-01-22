import { NextResponse } from 'next/server'
import { prisma, prismaFresh } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/auth'

export async function GET(request: Request) {
    const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1]
    const session = token ? await verifyAdminToken(token) : null

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Parse query params for filters
        const url = new URL(request.url)
        const dateRange = url.searchParams.get('dateRange') || 'all' // today, 7d, 30d, all
        const adType = url.searchParams.get('adType') || 'all' // preroll, midroll, banner, all

        // Calculate date filter
        let dateFilter: Date | null = null
        const now = new Date()
        if (dateRange === 'today') {
            dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        } else if (dateRange === '7d') {
            dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        } else if (dateRange === '30d') {
            dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }

        // Get all ad impressions with filters
        const impressionWhere: any = {}
        if (dateFilter) impressionWhere.createdAt = { gte: dateFilter }
        if (adType !== 'all') impressionWhere.adType = adType

        const impressions = await prisma.adImpression.findMany({
            where: impressionWhere,
            orderBy: { createdAt: 'desc' }
        })

        // Get all preroll ads
        const prerollAds = await prisma.prerollAd.findMany({
            include: { school: { select: { name: true } } }
        })

        // Get all midroll ads
        const midrollAds = await prisma.midrollAd.findMany({
            include: { school: { select: { name: true } } }
        })

        // Get all sponsors (banner/modal)
        const sponsors = await prismaFresh.sponsor.findMany({
            include: {
                _count: { select: { impressions: true, clicks: true } as any },
                school: { select: { name: true } }
            }
        }) as any[]

        // School Map for lookup
        const allSchools = await prisma.school.findMany({ select: { id: true, name: true } })
        const schoolMap = new Map(allSchools.map(s => [s.id, s.name]))

        // Calculate metrics for each ad type
        const calculateAdMetrics = (adId: string, type: string) => {
            const adImpressions = impressions.filter(i =>
                (type === 'preroll' && i.prerollAdId === adId) ||
                (type === 'midroll' && i.midrollAdId === adId) ||
                (type === 'banner' && i.sponsorId === adId)
            )

            const total = adImpressions.length
            if (total === 0) return {
                impressions: 0, clicks: 0, ctr: 0, completionRate: 0, skipRate: 0,
                avgWatchTime: 0, avgSkipTime: 0, reached25: 0, reached50: 0, reached75: 0, reached100: 0,
                uniqueUsers: 0, frequency: 0,
                schoolBreakdown: []
            }

            const clicked = adImpressions.filter(i => i.clicked).length
            const completed = adImpressions.filter(i => i.watchedFull).length
            const skipped = adImpressions.filter(i => i.skipped).length
            const r25 = adImpressions.filter(i => i.reached25).length
            const r50 = adImpressions.filter(i => i.reached50).length
            const r75 = adImpressions.filter(i => i.reached75).length
            const r100 = adImpressions.filter(i => i.reached100).length

            const watchTimes = adImpressions.filter(i => i.watchTime).map(i => i.watchTime!)
            const skipTimes = adImpressions.filter(i => i.skipTime).map(i => i.skipTime!)

            const uniqueSessions = new Set(adImpressions.map(i => i.sessionId)).size

            // Calculate per-school breakdown for this ad
            const adSchoolStats = new Map<string, { impressions: number, clicks: number, completed: number }>()
            adImpressions.forEach(imp => {
                const sId = imp.schoolId || 'unknown'
                const current = adSchoolStats.get(sId) || { impressions: 0, clicks: 0, completed: 0 }
                adSchoolStats.set(sId, {
                    impressions: current.impressions + 1,
                    clicks: current.clicks + (imp.clicked ? 1 : 0),
                    completed: current.completed + (imp.watchedFull ? 1 : 0)
                })
            })

            const adSchoolBreakdown = Array.from(adSchoolStats.entries()).map(([sId, stats]) => {
                const sTotal = stats.impressions
                return {
                    schoolName: sId === 'unknown' ? '不明' : schoolMap.get(sId) || '削除された園',
                    impressions: sTotal,
                    clicks: stats.clicks,
                    ctr: sTotal > 0 ? (stats.clicks / sTotal) * 100 : 0,
                    completionRate: sTotal > 0 ? (stats.completed / sTotal) * 100 : 0
                }
            }).sort((a, b) => b.impressions - a.impressions)

            return {
                impressions: total,
                clicks: clicked,
                ctr: total > 0 ? (clicked / total) * 100 : 0,
                completionRate: total > 0 ? (completed / total) * 100 : 0,
                skipRate: total > 0 ? (skipped / total) * 100 : 0,
                avgWatchTime: watchTimes.length > 0 ? watchTimes.reduce((a, b) => a + b, 0) / watchTimes.length : 0,
                avgSkipTime: skipTimes.length > 0 ? skipTimes.reduce((a, b) => a + b, 0) / skipTimes.length : 0,
                reached25: total > 0 ? (r25 / total) * 100 : 0,
                reached50: total > 0 ? (r50 / total) * 100 : 0,
                reached75: total > 0 ? (r75 / total) * 100 : 0,
                reached100: total > 0 ? (r100 / total) * 100 : 0,
                uniqueUsers: uniqueSessions,
                frequency: uniqueSessions > 0 ? total / uniqueSessions : 0,
                schoolBreakdown: adSchoolBreakdown
            }
        }

        // Build preroll data
        const prerollData = prerollAds.map(ad => ({
            id: ad.id,
            name: ad.name,
            type: 'preroll',
            schoolName: ad.school?.name || '全園共通',
            videoUrl: ad.videoUrl,
            isActive: ad.isActive,
            ...calculateAdMetrics(ad.id, 'preroll')
        }))

        // Build midroll data
        const midrollData = midrollAds.map(ad => ({
            id: ad.id,
            name: ad.name,
            type: 'midroll',
            triggerType: ad.triggerType,
            triggerValue: ad.triggerValue,
            schoolName: ad.school?.name || '全園共通',
            videoUrl: ad.videoUrl,
            isActive: ad.isActive,
            ...calculateAdMetrics(ad.id, 'midroll')
        }))

        // Build sponsor/banner data
        const sponsorData = sponsors.map((s: any) => ({
            id: s.id,
            name: s.name,
            type: s.displayStyle === 'modal' ? 'modal' : 'banner',
            schoolName: s.school?.name || '全園共通',
            imageUrl: s.imageUrl,
            isActive: s.isActive,
            impressions: s._count.impressions,
            clicks: s._count.clicks,
            ctr: s._count.impressions > 0 ? (s._count.clicks / s._count.impressions) * 100 : 0
        }))

        // Device breakdown
        const deviceBreakdown = {
            mobile: impressions.filter(i => i.deviceType === 'mobile').length,
            tablet: impressions.filter(i => i.deviceType === 'tablet').length,
            desktop: impressions.filter(i => i.deviceType === 'desktop').length,
            unknown: impressions.filter(i => !i.deviceType).length
        }

        // Hour of day breakdown (0-23)
        const hourBreakdown = Array.from({ length: 24 }, (_, h) => ({
            hour: h,
            count: impressions.filter(i => i.hourOfDay === h).length
        }))

        // Day of week breakdown
        const dayNames = ['日', '月', '火', '水', '木', '金', '土']
        const dayBreakdown = Array.from({ length: 7 }, (_, d) => ({
            day: dayNames[d],
            count: impressions.filter(i => i.dayOfWeek === d).length
        }))

        // School Breakdown
        const schoolStats = new Map<string, { impressions: number, clicks: number, completed: number }>()

        impressions.forEach(imp => {
            const schoolId = imp.schoolId || 'unknown'
            const current = schoolStats.get(schoolId) || { impressions: 0, clicks: 0, completed: 0 }
            schoolStats.set(schoolId, {
                impressions: current.impressions + 1,
                clicks: current.clicks + (imp.clicked ? 1 : 0),
                completed: current.completed + (imp.watchedFull ? 1 : 0)
            })
        })

        const schoolBreakdown = Array.from(schoolStats.entries()).map(([schoolId, stats]) => {
            const total = stats.impressions
            return {
                schoolName: schoolId === 'unknown' ? '不明 (ログアウト中など)' : schoolMap.get(schoolId) || '削除された園',
                impressions: total,
                clicks: stats.clicks,
                ctr: total > 0 ? (stats.clicks / total) * 100 : 0,
                completionRate: total > 0 ? (stats.completed / total) * 100 : 0
            }
        }).sort((a, b) => b.impressions - a.impressions)

        // ... (previous aggregations)

        // Overall summary (Restored Logic)
        const allAds = [...prerollData, ...midrollData]
        const totalImpressions = allAds.reduce((acc, ad) => acc + ad.impressions, 0) + sponsorData.reduce((acc, s) => acc + s.impressions, 0)
        const totalClicks = allAds.reduce((acc, ad) => acc + ad.clicks, 0) + sponsorData.reduce((acc, s) => acc + s.clicks, 0)
        const totalCompleted = impressions.filter(i => i.watchedFull).length
        const totalSkipped = impressions.filter(i => i.skipped).length

        // --- Generic Analytics Events ---
        const eventWhere: any = {}
        if (dateFilter) eventWhere.createdAt = { gte: dateFilter }

        const analyticsEvents = await prisma.analyticsEvent.findMany({
            where: eventWhere,
            include: {
                school: { select: { name: true } }
            }
        })

        // Group by Type
        const eventTypeMap = new Map<string, number>()
        analyticsEvents.forEach(e => {
            const count = eventTypeMap.get(e.type) || 0
            eventTypeMap.set(e.type, count + 1)
        })

        const eventMetrics = Array.from(eventTypeMap.entries()).map(([type, count]) => ({
            type,
            count,
            label: getEventLabel(type) // Helper function or simple mapping
        })).sort((a, b) => b.count - a.count)

        // Group Gallery Views by School (as generic example)
        const galleryViews = analyticsEvents.filter(e => e.type === 'gallery_view')
        const galleryBySchool = new Map<string, number>()
        galleryViews.forEach(e => {
            const name = e.school?.name || 'Unknown'
            galleryBySchool.set(name, (galleryBySchool.get(name) || 0) + 1)
        })

        return NextResponse.json({
            summary: {
                totalImpressions,
                totalClicks,
                avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
                completionRate: impressions.length > 0 ? (totalCompleted / impressions.length) * 100 : 0,
                skipRate: impressions.length > 0 ? (totalSkipped / impressions.length) * 100 : 0,
                uniqueReach: new Set(impressions.map(i => i.sessionId)).size,
                avgFrequency: impressions.length > 0 ? impressions.length / new Set(impressions.map(i => i.sessionId)).size : 0
            },
            prerollAds: prerollData,
            midrollAds: midrollData,
            sponsors: sponsorData,
            deviceBreakdown,
            hourBreakdown,
            dayBreakdown,
            schoolBreakdown,
            eventMetrics, // [NEW]
            galleryBySchool: Array.from(galleryBySchool.entries()).map(([name, count]) => ({ name, count })),
            dateRange,
            adType
        })

    } catch (e: any) {
        console.error('Analytics API Error:', e.message, e)
        return NextResponse.json({ error: 'Internal Server Error', details: e.message }, { status: 500 })
    }
}

function getEventLabel(type: string) {
    switch (type) {
        case 'gallery_view': return 'ギャラリー閲覧'
        case 'popup_click': return 'ポップアップクリック'
        case 'popup_view': return 'ポップアップ表示'
        case 'banner_view': return 'バナー表示'
        case 'page_view': return 'ページ閲覧'
        default: return type
    }
}
