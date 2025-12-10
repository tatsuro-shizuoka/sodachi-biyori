import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

// Admin-only endpoint to fix video statuses
export async function POST() {
    const session = await getAdminSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Update all 'processing' videos to 'published'
        const result = await prisma.video.updateMany({
            where: { status: 'processing' },
            data: {
                status: 'published',
                thumbnailUrl: 'https://placehold.co/600x400/1e293b/white?text=Video'
            }
        })

        return NextResponse.json({
            success: true,
            updatedCount: result.count,
            message: `${result.count}件の動画を「公開中」に更新しました`
        })
    } catch (error) {
        console.error('Fix videos error:', error)
        return NextResponse.json({ error: 'Failed to update videos' }, { status: 500 })
    }
}
