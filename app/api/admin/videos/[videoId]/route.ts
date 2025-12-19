import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

// GET /api/admin/videos/[videoId] - Get a specific video
export async function GET(
    request: Request,
    { params }: { params: Promise<{ videoId: string }> }
) {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { videoId } = await params

        const video = await prisma.video.findUnique({
            where: { id: videoId },
            include: { class: { select: { id: true, name: true } } }
        })

        if (!video) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 })
        }

        return NextResponse.json(video)
    } catch (error) {
        console.error('Fetch video error:', error)
        return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ videoId: string }> }
) {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { videoId } = await params
        const { status } = await request.json()

        if (!status || !['draft', 'published', 'processing'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        const video = await prisma.video.update({
            where: { id: videoId },
            data: { status }
        })

        return NextResponse.json(video)
    } catch (error) {
        console.error('Update video error:', error)
        return NextResponse.json({ error: 'Failed to update video' }, { status: 500 })
    }
}

// DELETE /api/admin/videos/[videoId] - Delete a video
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ videoId: string }> }
) {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { videoId } = await params

        // Delete favorites first, then the video
        await prisma.$transaction(async (tx) => {
            await tx.favorite.deleteMany({ where: { videoId } })
            await tx.video.delete({ where: { id: videoId } })
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete video error:', error)
        return NextResponse.json({ error: '動画の削除に失敗しました' }, { status: 500 })
    }
}
