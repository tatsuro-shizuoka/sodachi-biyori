import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Fetch active PrerollAd
        const prerollAds = await prisma.prerollAd.findMany({
            where: { isActive: true },
            orderBy: { priority: 'desc' }, // Show high priority first
            include: { sponsor: true }
        })

        if (prerollAds.length === 0) {
            return NextResponse.json(null)
        }

        // Deterministic selection: Always take the highest priority active ad
        const ad = prerollAds[0]

        return NextResponse.json({
            id: ad.id, // Real PrerollAd ID for tracking
            type: 'preroll',
            imageUrl: ad.thumbnailUrl || ad.sponsor?.imageUrl || 'https://via.placeholder.com/800x450.png?text=Ad',
            videoUrl: ad.videoUrl, // Mobile app currently mocks this anyway or uses it
            targetUrl: ad.linkUrl || ad.sponsor?.linkUrl,
            sponsorName: ad.name || ad.sponsor?.name || 'Sponsor', // Prefer Ad name
            duration: ad.skipAfterSeconds || 5
        })
    } catch (error) {
        console.error('Error fetching preroll ad:', error)
        return NextResponse.json(null)
    }
}
