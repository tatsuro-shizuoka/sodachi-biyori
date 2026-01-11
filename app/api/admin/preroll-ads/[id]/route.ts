import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { deleteCloudflareVideo, extractCloudflareId } from '@/lib/cloudflare-delete'

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getAdminSession()

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id } = await context.params
        const body = await request.json()

        const ad = await prisma.prerollAd.update({
            where: { id },
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
        console.error('Failed to update preroll ad:', error)
        return NextResponse.json({ error: 'Failed to update ad' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getAdminSession()

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id } = await context.params

        // Get the ad first to get the videoUrl
        const ad = await prisma.prerollAd.findUnique({ where: { id } })

        if (ad?.videoUrl) {
            // Delete from Cloudflare if it's a Cloudflare video
            const cfId = extractCloudflareId(ad.videoUrl)
            if (cfId) {
                await deleteCloudflareVideo(cfId)
            }
        }

        await prisma.prerollAd.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete preroll ad:', error)
        return NextResponse.json({ error: 'Failed to delete ad' }, { status: 500 })
    }
}
