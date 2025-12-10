import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

// Admin-only endpoint to fix video statuses and thumbnails
export async function POST() {
    const session = await getAdminSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // 1. Update all 'processing' videos to 'published'
        const statusResult = await prisma.video.updateMany({
            where: { status: 'processing' },
            data: { status: 'published' }
        })

        // 2. Update all thumbnails that have 'Processing' text
        const thumbnailResult = await prisma.video.updateMany({
            where: {
                thumbnailUrl: { contains: 'Processing' }
            },
            data: {
                thumbnailUrl: 'https://placehold.co/600x400/1e293b/white?text=Video'
            }
        })

        // 3. Also update any 'draft' videos to 'published' for testing
        const draftResult = await prisma.video.updateMany({
            where: { status: 'draft' },
            data: { status: 'published' }
        })

        return NextResponse.json({
            success: true,
            statusUpdated: statusResult.count,
            thumbnailsUpdated: thumbnailResult.count,
            draftsPublished: draftResult.count,
            message: `ステータス: ${statusResult.count}件, サムネイル: ${thumbnailResult.count}件, 下書き公開: ${draftResult.count}件を修正しました`
        })
    } catch (error) {
        console.error('Fix videos error:', error)
        return NextResponse.json({ error: 'Failed to update videos' }, { status: 500 })
    }
}
