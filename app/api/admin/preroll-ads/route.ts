import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
    const session = await getAdminSession()

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const ads = await prisma.prerollAd.findMany({
            include: { school: { select: { name: true } } },
            orderBy: { priority: 'desc' }
        })
        return NextResponse.json(ads)
    } catch (error) {
        console.error('Failed to fetch preroll ads:', error)
        return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await getAdminSession()

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        
        const ad = await prisma.prerollAd.create({
            data: {
                name: body.name,
                videoUrl: body.videoUrl,
                linkUrl: body.linkUrl || null,
                ctaText: body.ctaText || null,
                skipAfterSeconds: parseInt(body.skipAfterSeconds) || 5,
                priority: parseInt(body.priority) || 0,
                isActive: body.isActive ?? true,
                validFrom: body.validFrom ? new Date(body.validFrom) : null,
                validTo: body.validTo ? new Date(body.validTo) : null,
                schoolId: body.schoolId || null
            }
        })
        return NextResponse.json(ad)
    } catch (error) {
        console.error('Failed to create preroll ad:', error)
        return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 })
    }
}
