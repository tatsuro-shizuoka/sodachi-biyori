import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { deleteCloudflareVideo, extractCloudflareId } from '@/lib/cloudflare-delete'

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
        const body = await request.json()
        const {
            status,
            title,
            description,
            recordedOn,
            adminMemo,
            startAt,
            endAt,
            categoryId,
            isAllClasses
        } = body

        const data: any = {}
        if (status !== undefined) {
            if (!['draft', 'published', 'processing'].includes(status)) {
                return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
            }
            data.status = status
        }
        if (title !== undefined) data.title = title
        if (description !== undefined) data.description = description
        if (recordedOn !== undefined) data.recordedOn = recordedOn ? new Date(recordedOn) : null
        if (adminMemo !== undefined) data.adminMemo = adminMemo
        if (startAt !== undefined) data.startAt = startAt ? new Date(startAt) : null
        if (endAt !== undefined) data.endAt = endAt ? new Date(endAt) : null
        if (categoryId !== undefined) data.categoryId = categoryId || null
        if (isAllClasses !== undefined) data.isAllClasses = isAllClasses

        const video = await prisma.video.update({
            where: { id: videoId },
            data
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

        // Get the video first to get the videoUrl
        const video = await prisma.video.findUnique({ where: { id: videoId } })

        if (video?.videoUrl) {
            // Delete from Cloudflare if it's a Cloudflare video
            const cfId = extractCloudflareId(video.videoUrl)
            if (cfId) {
                await deleteCloudflareVideo(cfId)
            }
        }

        // Delete all related data first
        await prisma.$transaction(async (tx) => {
            await tx.favorite.deleteMany({ where: { videoId } })
            await tx.videoView.deleteMany({ where: { videoId } })
            await tx.reactionLog.deleteMany({ where: { videoId } })
            await tx.videoFaceTag.deleteMany({ where: { videoId } })
            await tx.video.delete({ where: { id: videoId } })
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete video error:', error)
        return NextResponse.json({ error: '動画の削除に失敗しました' }, { status: 500 })
    }
}
