import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/auth'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1]
    const session = token ? await verifyAdminToken(token) : null
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id } = await params
        const ad = await prisma.midrollAd.findUnique({ where: { id } })
        if (!ad) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json(ad)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1]
    const session = token ? await verifyAdminToken(token) : null
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id } = await params
        const body = await request.json()
        const ad = await prisma.midrollAd.update({
            where: { id },
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
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1]
    const session = token ? await verifyAdminToken(token) : null
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id } = await params
        await prisma.midrollAd.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
}
