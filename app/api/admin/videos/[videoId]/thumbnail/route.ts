import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ videoId: string }> }
) {
    const { videoId } = await params
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { thumbnailUrl } = await request.json()
        if (!thumbnailUrl) {
            return NextResponse.json({ error: 'Thumbnail URL required' }, { status: 400 })
        }

        const video = await prisma.video.update({
            where: { id: videoId },
            data: { thumbnailUrl }
        })

        return NextResponse.json(video)
    } catch (e) {
        console.error('Failed to update video thumbnail', e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
