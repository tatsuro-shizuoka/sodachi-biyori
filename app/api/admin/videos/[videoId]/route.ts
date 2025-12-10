import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

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
