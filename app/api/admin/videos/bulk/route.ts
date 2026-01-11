import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function POST(request: Request) {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { videoIds, action, value } = await request.json()

        if (!Array.isArray(videoIds) || videoIds.length === 0) {
            return NextResponse.json({ error: 'No videos selected' }, { status: 400 })
        }

        if (action === 'updateStatus') {
            await prisma.video.updateMany({
                where: { id: { in: videoIds } },
                data: { status: value }
            })
        } else if (action === 'delete') {
            // Note: This won't delete from Vimeo, only DB.
            // In a real app we'd need to delete from Vimeo too.
            await prisma.video.deleteMany({
                where: { id: { in: videoIds } }
            })
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Bulk action error:', error)
        return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 })
    }
}
