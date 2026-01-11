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
        const ads = await prisma.midrollAd.findMany({
            include: { school: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(ads)
    } catch (error) {
        console.error('Failed to fetch midroll ads:', error)
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1]
    const session = token ? await verifyAdminToken(token) : null
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const ad = await prisma.midrollAd.create({
            data: {
                name: body.name,
                videoUrl: body.videoUrl,
                linkUrl: body.linkUrl || null,
                ctaText: body.ctaText || null,
                skipAfterSeconds: parseInt(body.skipAfterSeconds) || 5,
                triggerType: body.triggerType || 'percentage',
                triggerValue: body.triggerValue ? parseFloat(body.triggerValue) : null,
                priority: parseInt(body.priority) || 0,
                isActive: body.isActive ?? true,
                validFrom: body.validFrom ? new Date(body.validFrom) : null,
                validTo: body.validTo ? new Date(body.validTo) : null,
                schoolId: body.schoolId || null
            }
        })
        return NextResponse.json(ad)
    } catch (error) {
        console.error('Failed to create midroll ad:', error)
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
    }
}
