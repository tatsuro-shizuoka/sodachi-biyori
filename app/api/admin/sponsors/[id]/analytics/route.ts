import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, subDays, startOfMonth, format } from 'date-fns'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Correct type for Next.js 15
) {
    // In Next.js 15, params is a Promise
    const { id: sponsorId } = await params

    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || 'all' // 'today', '7d', '30d', 'all'
    const schoolId = searchParams.get('schoolId') || 'all'

    try {
        // 1. Calculate Date Filter
        const now = new Date()
        let dateFilter: any = {}

        if (dateRange === 'today') {
            dateFilter = { gte: startOfDay(now) }
        } else if (dateRange === '7d') {
            dateFilter = { gte: subDays(now, 7) }
        } else if (dateRange === '30d') {
            dateFilter = { gte: subDays(now, 30) }
        } else if (dateRange === 'thisMonth') {
            dateFilter = { gte: startOfMonth(now) }
        }

        // 2. Build Base Where Clause
        const baseWhere: any = { sponsorId }
        if (dateFilter.gte) baseWhere.createdAt = dateFilter
        if (schoolId !== 'all') baseWhere.schoolId = schoolId

        // 3. Fetch Metrics
        // We need to aggregate from multiple tables: SponsorImpression, SponsorClick, AdImpression (for video ads)

        // A. Display Ads (Banner/Modal) Metrics from SponsorImpression/Click
        const displayImpressions = await prisma.sponsorImpression.count({ where: baseWhere })
        const displayClicks = await prisma.sponsorClick.count({ where: baseWhere })

        // B. Video Ads (Preroll) Metrics from AdImpression
        // PrerollAds linked to this sponsor
        const prerollAds = await prisma.prerollAd.findMany({
            where: { sponsorId },
            select: { id: true, name: true }
        })
        const prerollAdIds = prerollAds.map(ad => ad.id)

        // MidrollAds linked to this sponsor (Even if disabled in UI, we fetch data if exists)
        const midrollAds = await prisma.midrollAd.findMany({
            where: { sponsorId },
            select: { id: true, name: true }
        })
        const midrollAdIds = midrollAds.map(ad => ad.id)

        // Video Stats Aggregation
        // Common where for video stats
        const videoStatsWhere: any = {
            OR: [
                { prerollAdId: { in: prerollAdIds } },
                { midrollAdId: { in: midrollAdIds } }
            ]
        }
        if (dateFilter.gte) videoStatsWhere.createdAt = dateFilter
        if (schoolId !== 'all') videoStatsWhere.schoolId = schoolId

        // Fetch aggregation
        const videoStats = await prisma.adImpression.groupBy({
            by: ['adType'],
            where: videoStatsWhere,
            _count: {
                id: true, // impressions
                clicked: true // raw clicks count? No, clicked is boolean, we need to count manually or filter
            }
        })

        // Detailed Video Counts
        const videoImpressionsTotal = await prisma.adImpression.count({ where: videoStatsWhere })
        const videoClicksTotal = await prisma.adImpression.count({ where: { ...videoStatsWhere, clicked: true } })
        const videoCompletionsTotal = await prisma.adImpression.count({ where: { ...videoStatsWhere, watchedFull: true } })
        const videoSkipsTotal = await prisma.adImpression.count({ where: { ...videoStatsWhere, skipped: true } })

        // 4. Per Video Breakdown
        const videoBreakdown = []
        for (const ad of [...prerollAds, ...midrollAds]) {
            const isPreroll = prerollAds.some(p => p.id === ad.id)
            const adWhere: any = isPreroll ? { prerollAdId: ad.id } : { midrollAdId: ad.id }
            if (dateFilter.gte) adWhere.createdAt = dateFilter
            if (schoolId !== 'all') adWhere.schoolId = schoolId

            const imp = await prisma.adImpression.count({ where: adWhere })
            const click = await prisma.adImpression.count({ where: { ...adWhere, clicked: true } })

            if (imp > 0) {
                videoBreakdown.push({
                    id: ad.id,
                    name: ad.name,
                    type: isPreroll ? 'preroll' : 'midroll',
                    impressions: imp,
                    clicks: click,
                    ctr: (click / imp) * 100
                })
            }
        }

        // 5. School Breakdown (Top 5)
        // This is complex because we have data in multiple tables. 
        // For simplicity, let's look at SponsorImpression first, as it covers the main sponsorship presence.
        // Or better, aggregate both. 
        // For now, let's focus on Display Ads for school breakdown as it's the primary "Sponsor" feature.
        const schoolBreakdownRaw = await prisma.sponsorImpression.groupBy({
            by: ['schoolId'],
            where: baseWhere,
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 5
        })

        // Fetch school names
        const schoolBreakdown = await Promise.all(schoolBreakdownRaw.map(async (item) => {
            if (!item.schoolId) return { name: 'Unknown', impressions: item._count.id }
            const school = await prisma.school.findUnique({ where: { id: item.schoolId }, select: { name: true } })
            return { name: school?.name || 'Unknown', impressions: item._count.id }
        }))


        // 6. Time Series (Last 7 days or selected range)
        // Simplified: Return raw daily counts for frontend to chart
        const timeSeriesRaw = await prisma.sponsorImpression.groupBy({
            by: ['createdAt'], // Grouping by DateTime directly is granular. We usually need raw query for date_trunc.
            where: baseWhere,
            _count: { id: true },
        })
        // Since Prisma groupBy doesn't support date truncation easily without raw query, 
        // we'll fetch day-by-day counts in a loop or verify if we can do simpler.
        // For "Today", hour breakdown. For others, day breakdown.
        // Let's stick to a simple JS aggregation for MVP to avoid Raw SQL complexity risks in this context.

        // Fetch all timestamps (optimize this later if data huge)
        const allTimestamps = await prisma.sponsorImpression.findMany({
            where: baseWhere,
            select: { createdAt: true }
        })

        const chartDataMap: Record<string, number> = {}
        allTimestamps.forEach(t => {
            const key = dateRange === 'today'
                ? format(t.createdAt, 'HH:00')
                : format(t.createdAt, 'MM/dd')
            chartDataMap[key] = (chartDataMap[key] || 0) + 1
        })

        const chartData = Object.entries(chartDataMap).map(([key, value]) => ({ label: key, value })).sort((a, b) => a.label.localeCompare(b.label))


        // Final Response Construction
        const totalImpressions = displayImpressions + videoImpressionsTotal
        const totalClicks = displayClicks + videoClicksTotal

        return NextResponse.json({
            summary: {
                totalImpressions,
                totalClicks,
                ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
                displayImpressions,
                videoImpressions: videoImpressionsTotal,
            },
            videoBreakdown, // Specific performance of each video ad
            schoolBreakdown, // Where are they seen?
            chartData // Trend
        })

    } catch (error) {
        console.error('Sponsor analytics error:', error)
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }
}
