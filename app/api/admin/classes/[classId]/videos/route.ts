import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ classId: string }> }
) {
    const { classId } = await params
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const videos = await prisma.video.findMany({
            where: { classId },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(videos)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ classId: string }> }
) {
    const { classId } = await params
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const data = await request.json()
        const { title, description, videoUrl, thumbnailUrl } = data

        if (!title || !videoUrl) {
            return NextResponse.json({ error: 'Title and Video URL required' }, { status: 400 })
        }

        const video = await prisma.video.create({
            data: {
                title,
                description,
                videoUrl,
                thumbnailUrl,
                status: 'published', // Default to published for legacy compat
                classId
            }
        })

        return NextResponse.json(video)
    } catch (error) {
        console.error('Create video error:', error)
        return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
    }
}
